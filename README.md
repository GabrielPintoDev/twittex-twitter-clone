# 🐦 Twittex — Clone do Twitter

Um clone funcional do Twitter construído com Django REST Framework + React.

## ✨ Funcionalidades

- **Autenticação** — Cadastro e login com JWT
- **Perfil** — Foto, nome, bio e senha editáveis
- **Feed** — Posts das pessoas que você segue
- **Explorar** — Busca de usuários e posts globais
- **Seguir/Deixar de seguir** — Sistema completo de social graph
- **Posts** — Criar e deletar (máx. 280 caracteres)
- **Curtidas** — Curtir/descurtir posts
- **Comentários** — Comentar e deletar comentários
- **Responsivo** — Mobile + Desktop

## 🛠 Tecnologias

| Camada | Tecnologia |
|--------|-----------|
| Backend | Python + Django + Django REST Framework |
| Auth | JWT via SimpleJWT |
| Banco de Dados | SQLite |
| Frontend | React + React Router + Axios |
| Deploy Backend | Railway |
| Deploy Frontend | Vercel |

---

## 🚀 Rodando localmente

### Pré-requisitos

- Python 3.10+ (recomendado; se usar 3.14, veja nota abaixo)
- Node.js 18+

---

### Backend (Django)

```bash
cd backend
```

**1. Instale as dependências** (se tiver Python 3.14, use dois passos):

```bash
# Instale tudo exceto o Pillow
pip install django==4.2.16 djangorestframework==3.15.2 django-cors-headers==4.3.1 djangorestframework-simplejwt==5.3.1 gunicorn==21.2.0 whitenoise==6.7.0

# Instale o Pillow separadamente (versão compatível com Python 3.14)
pip install "pillow>=11.0.0"
```

> **⚠️ Nota Python 3.14:** O Pillow 10.x não tem wheel pré-compilado para Python 3.14 no Windows. A versão 11+ resolve isso. Se estiver em Python 3.10–3.12, pode usar `pip install -r requirements.txt` normalmente.

**2. Aplique as migrações:**

```bash
python manage.py migrate
```

**3. (Opcional) Crie dados de demonstração:**

```bash
python manage.py shell -c "
from api.models import User, Post, Comment
Comment.objects.all().delete()
Post.objects.all().delete()
User.objects.all().delete()
u1 = User.objects.create_user('joao_silva', 'joao@exemplo.com', 'senha123', first_name='Joao', bio='Dev apaixonado')
u2 = User.objects.create_user('maria_santos', 'maria@exemplo.com', 'senha123', first_name='Maria', bio='Designer UX')
u3 = User.objects.create_user('pedro_dev', 'pedro@exemplo.com', 'senha123', first_name='Pedro', bio='Full Stack Dev')
u1.following.add(u2, u3)
u2.following.add(u1)
p1 = Post.objects.create(author=u1, content='Projeto com Django + React funcionando!')
p2 = Post.objects.create(author=u2, content='Consistencia no design e tudo!')
p1.likes.add(u2, u3)
Comment.objects.create(post=p1, author=u2, content='Parabens! Ficou incrivel!')
print('Dados criados com sucesso!')
"
```

> Se aparecer erro `UNIQUE constraint failed`, os usuários já existem. O comando acima já limpa tudo antes de recriar — basta rodar novamente.

**4. Inicie o servidor:**

```bash
python manage.py runserver
```

O backend estará em: `http://localhost:8000`

---

### Frontend (React)

Abra um **novo terminal**:

```bash
cd frontend

# Instale as dependências
npm install

# Inicie o servidor de desenvolvimento
npm start
```

O frontend estará em: `http://localhost:3000`

---

## 👥 Contas de demonstração

| Usuário | Senha |
|---------|-------|
| joao_silva | senha123 |
| maria_santos | senha123 |
| pedro_dev | senha123 |

> Ou crie sua própria conta pelo botão **"Criar conta"** na tela de login.

---

## 🌐 Deploy

### Backend → Railway

1. Acesse [railway.app](https://railway.app) e crie uma conta
2. Clique em **New Project → Deploy from GitHub repo**
3. Aponte para a pasta `backend/`
4. O Railway detecta o `Procfile` automaticamente
5. Em **Variables**, adicione:

```
SECRET_KEY=sua-chave-secreta-muito-segura
DEBUG=False
ALLOWED_HOSTS=*.railway.app
```

6. Copie a URL gerada (ex: `https://twittex-backend.up.railway.app`)

### Frontend → Vercel

1. Acesse [vercel.com](https://vercel.com) e crie uma conta
2. Clique em **New Project → Import Git Repository**
3. Aponte para a pasta `frontend/`
4. Em **Environment Variables**, adicione:

```
REACT_APP_API_URL=https://twittex-backend.up.railway.app/api
```

5. Clique em **Deploy**

> **⚠️ CORS após deploy:** Atualize `CORS_ALLOW_ALL_ORIGINS` no `settings.py` substituindo por:
> ```python
> CORS_ALLOWED_ORIGINS = ["https://seu-frontend.vercel.app"]
> ```

---

## 📁 Estrutura do Projeto

```
twitter-clone/
├── backend/
│   ├── api/
│   │   ├── models.py         # User, Post, Comment
│   │   ├── serializers.py    # Serializers DRF
│   │   ├── views.py          # Endpoints REST
│   │   └── urls.py           # Rotas da API
│   ├── twitterclone/
│   │   ├── settings.py
│   │   └── urls.py
│   ├── requirements.txt
│   ├── Procfile              # Para deploy no Railway
│   └── railway.json
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Layout.js       # Sidebar + navegação
    │   │   ├── PostCard.js     # Card de post com curtidas e comentários
    │   │   ├── Avatar.js       # Avatar com inicial colorida
    │   │   └── NewPostModal.js # Modal de novo post
    │   ├── pages/
    │   │   ├── LoginPage.js
    │   │   ├── RegisterPage.js
    │   │   ├── FeedPage.js
    │   │   ├── ExplorePage.js
    │   │   ├── ProfilePage.js
    │   │   ├── PostPage.js
    │   │   └── SettingsPage.js
    │   ├── context/
    │   │   └── AuthContext.js  # Estado global de autenticação
    │   └── utils/
    │       └── api.js          # Cliente Axios com JWT
    ├── .env                    # REACT_APP_API_URL para desenvolvimento
    ├── .env.production         # REACT_APP_API_URL para produção
    └── vercel.json             # Configuração de roteamento SPA
```

---

## 📡 Endpoints da API

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/auth/register/` | Cadastro |
| POST | `/api/auth/login/` | Login — retorna access + refresh token |
| GET / PATCH | `/api/me/` | Perfil do usuário autenticado |
| GET | `/api/feed/` | Posts dos usuários seguidos |
| GET | `/api/explore/` | Todos os posts |
| GET | `/api/users/search/?q=` | Buscar usuários por nome |
| GET | `/api/users/:username/` | Ver perfil de um usuário |
| POST | `/api/users/:username/follow/` | Seguir / deixar de seguir |
| GET | `/api/users/:username/followers/` | Lista de seguidores |
| GET | `/api/users/:username/following/` | Lista de seguidos |
| GET / POST | `/api/users/:username/posts/` | Posts de um usuário |
| POST | `/api/posts/` | Criar post |
| GET / DELETE | `/api/posts/:id/` | Ver / deletar post |
| POST | `/api/posts/:id/like/` | Curtir / descurtir |
| GET / POST | `/api/posts/:id/comments/` | Listar / criar comentários |
| DELETE | `/api/posts/:id/comments/:cid/` | Deletar comentário |

---

## 🔐 Autenticação

A API usa **JWT (JSON Web Token)**. Após login ou cadastro, você recebe:

```json
{
  "access": "eyJ...",
  "refresh": "eyJ...",
  "user": { ... }
}
```

O token `access` deve ser enviado no header de todas as requisições autenticadas:

```
Authorization: Bearer <access_token>
```

O frontend faz isso automaticamente via interceptor no Axios (`src/utils/api.js`).
