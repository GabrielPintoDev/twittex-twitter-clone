from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model, authenticate
from django.db.models import Q
from .models import Post, Comment
from .serializers import (
    UserSerializer, RegisterSerializer, PostSerializer, CommentSerializer
)

User = get_user_model()


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response({
            'user': UserSerializer(user, context={'request': request}).data,
            'access': str(refresh.access_token),
            'refresh': str(refresh),
        }, status=status.HTTP_201_CREATED)


class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        user = authenticate(username=username, password=password)
        if not user:
            # Try with email
            try:
                u = User.objects.get(email=username)
                user = authenticate(username=u.username, password=password)
            except User.DoesNotExist:
                pass
        if user:
            refresh = RefreshToken.for_user(user)
            return Response({
                'user': UserSerializer(user, context={'request': request}).data,
                'access': str(refresh.access_token),
                'refresh': str(refresh),
            })
        return Response({'detail': 'Credenciais inválidas.'}, status=status.HTTP_401_UNAUTHORIZED)


class MeView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', True)
        instance = self.get_object()

        # Handle password change
        new_password = request.data.get('new_password')
        if new_password:
            old_password = request.data.get('old_password')
            if not instance.check_password(old_password):
                return Response({'old_password': 'Senha atual incorreta.'}, status=400)
            instance.set_password(new_password)
            instance.save()

        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)


class UserDetailView(generics.RetrieveAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    lookup_field = 'username'


class UserSearchView(generics.ListAPIView):
    serializer_class = UserSerializer

    def get_queryset(self):
        q = self.request.query_params.get('q', '')
        return User.objects.filter(
            Q(username__icontains=q) | Q(first_name__icontains=q) | Q(last_name__icontains=q)
        ).exclude(id=self.request.user.id)[:20]


@api_view(['POST'])
def follow_user(request, username):
    try:
        target = User.objects.get(username=username)
    except User.DoesNotExist:
        return Response({'detail': 'Usuário não encontrado.'}, status=404)
    if target == request.user:
        return Response({'detail': 'Você não pode seguir a si mesmo.'}, status=400)
    if target.followers.filter(id=request.user.id).exists():
        target.followers.remove(request.user)
        return Response({'following': False, 'followers_count': target.followers.count()})
    else:
        target.followers.add(request.user)
        return Response({'following': True, 'followers_count': target.followers.count()})


class FollowersView(generics.ListAPIView):
    serializer_class = UserSerializer

    def get_queryset(self):
        username = self.kwargs['username']
        user = User.objects.get(username=username)
        return user.followers.all()


class FollowingView(generics.ListAPIView):
    serializer_class = UserSerializer

    def get_queryset(self):
        username = self.kwargs['username']
        user = User.objects.get(username=username)
        return user.following.all()


class FeedView(generics.ListAPIView):
    serializer_class = PostSerializer

    def get_queryset(self):
        following_ids = self.request.user.following.values_list('id', flat=True)
        return Post.objects.filter(author_id__in=following_ids).select_related('author').prefetch_related('likes', 'comments__author')


class PostListCreateView(generics.ListCreateAPIView):
    serializer_class = PostSerializer

    def get_queryset(self):
        username = self.kwargs.get('username')
        if username:
            return Post.objects.filter(author__username=username)
        return Post.objects.all()

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)


class PostDetailView(generics.RetrieveDestroyAPIView):
    queryset = Post.objects.all()
    serializer_class = PostSerializer

    def destroy(self, request, *args, **kwargs):
        post = self.get_object()
        if post.author != request.user:
            return Response({'detail': 'Sem permissão.'}, status=403)
        post.delete()
        return Response(status=204)


@api_view(['POST'])
def like_post(request, pk):
    try:
        post = Post.objects.get(pk=pk)
    except Post.DoesNotExist:
        return Response({'detail': 'Post não encontrado.'}, status=404)
    if post.likes.filter(id=request.user.id).exists():
        post.likes.remove(request.user)
        return Response({'liked': False, 'likes_count': post.likes.count()})
    else:
        post.likes.add(request.user)
        return Response({'liked': True, 'likes_count': post.likes.count()})


class CommentListCreateView(generics.ListCreateAPIView):
    serializer_class = CommentSerializer

    def get_queryset(self):
        return Comment.objects.filter(post_id=self.kwargs['pk'])

    def perform_create(self, serializer):
        post = Post.objects.get(pk=self.kwargs['pk'])
        serializer.save(author=self.request.user, post=post)


@api_view(['DELETE'])
def delete_comment(request, pk, comment_id):
    try:
        comment = Comment.objects.get(pk=comment_id, post_id=pk)
    except Comment.DoesNotExist:
        return Response({'detail': 'Comentário não encontrado.'}, status=404)
    if comment.author != request.user:
        return Response({'detail': 'Sem permissão.'}, status=403)
    comment.delete()
    return Response(status=204)


class ExploreView(generics.ListAPIView):
    serializer_class = PostSerializer

    def get_queryset(self):
        return Post.objects.all().select_related('author').prefetch_related('likes', 'comments__author')
