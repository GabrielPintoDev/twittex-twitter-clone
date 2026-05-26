from django.urls import path
from . import views

urlpatterns = [
    # Auth
    path('auth/register/', views.RegisterView.as_view(), name='register'),
    path('auth/login/', views.LoginView.as_view(), name='login'),

    # Me
    path('me/', views.MeView.as_view(), name='me'),

    # Users
    path('users/search/', views.UserSearchView.as_view(), name='user-search'),
    path('users/<str:username>/', views.UserDetailView.as_view(), name='user-detail'),
    path('users/<str:username>/follow/', views.follow_user, name='follow-user'),
    path('users/<str:username>/followers/', views.FollowersView.as_view(), name='followers'),
    path('users/<str:username>/following/', views.FollowingView.as_view(), name='following'),
    path('users/<str:username>/posts/', views.PostListCreateView.as_view(), name='user-posts'),

    # Feed & Explore
    path('feed/', views.FeedView.as_view(), name='feed'),
    path('explore/', views.ExploreView.as_view(), name='explore'),

    # Posts
    path('posts/', views.PostListCreateView.as_view(), name='posts'),
    path('posts/<int:pk>/', views.PostDetailView.as_view(), name='post-detail'),
    path('posts/<int:pk>/like/', views.like_post, name='like-post'),
    path('posts/<int:pk>/comments/', views.CommentListCreateView.as_view(), name='comments'),
    path('posts/<int:pk>/comments/<int:comment_id>/', views.delete_comment, name='delete-comment'),
]
