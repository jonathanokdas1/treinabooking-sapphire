# TreinaBooking System

Sistema de gestão de reservas e atendimentos para estúdios de fitness.

## 📋 Stack

### Backend
- Node.js + Express
- MySQL + Sequelize ORM
- Google Calendar API
- Nodemailer

### Frontend
- Next.js 13
- React 18
- Material-UI
- Redux Toolkit
- FullCalendar

---

## 🚀 Deploy com Docker

Este projeto já está configurado para rodar com Docker. Todos os arquivos necessários (`Dockerfile`, `docker-compose.yml`) já estão incluídos no repositório.

### Pré-requisitos

- Docker 20.10+
- Docker Compose 2.0+
- MySQL 5.7+ (rodando no host)

### 1. Instalar Docker

```bash
# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Instalar Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verificar instalação
docker --version
docker-compose --version

# Adicionar usuário ao grupo docker (opcional, para não usar sudo)
sudo usermod -aG docker $USER
newgrp docker
```

### 2. Configurar Database MySQL

O sistema usa MySQL no host. Configure o database:

```sql
CREATE DATABASE digital7_appSheet_development;
CREATE USER 'digital7_admin_user'@'%' IDENTIFIED BY 'Ec$yllFnr)9I';
GRANT ALL PRIVILEGES ON digital7_appSheet_development.* TO 'digital7_admin_user'@'%';
FLUSH PRIVILEGES;
```

Permitir conexões externas no MySQL:

```bash
sudo nano /etc/mysql/mysql.conf.d/mysqld.cnf
```

Alterar a linha:
```ini
bind-address = 0.0.0.0
```

Reiniciar MySQL:
```bash
sudo systemctl restart mysql
```

### 3. Configurar Variáveis de Ambiente

Criar arquivo `.env` na raiz do projeto:

```bash
# Backend Environment
NODE_ENV=production
DB_HOST=host.docker.internal
DB_PORT=3306
DB_NAME=digital7_appSheet_development
DB_USER=digital7_admin_user
DB_PASS=Ec$yllFnr)9I

# Frontend Environment
NEXT_PUBLIC_JWT_EXPIRATION=5m
NEXT_PUBLIC_JWT_SECRET=dd5f3089-40c3-403d-af14-d0c228b05cb4
NEXT_PUBLIC_JWT_REFRESH_TOKEN_SECRET=7c4c1c50-3230-45bf-9eae-c9b2e401c767
NEXT_PUBLIC_APP_URL=https://seu-dominio.com/api/
PORT=3003
```

**⚠️ IMPORTANTE:** Altere `NEXT_PUBLIC_APP_URL` para o seu domínio ou IP.

### 4. Executar Migrations

Antes de subir os containers, execute as migrations do database:

```bash
cd server
npm install
NODE_ENV=production npx sequelize-cli db:migrate
cd ..
```

### 5. Subir a Aplicação

```bash
# Build e subir containers
docker-compose up -d

# Ver logs
docker-compose logs -f

# Verificar status
docker-compose ps
```

### 6. Verificar se está Funcionando

```bash
# Testar backend
curl http://localhost:8000/user/all

# Testar frontend
curl http://localhost:3003

# Ver logs individuais
docker-compose logs -f backend
docker-compose logs -f frontend
```

### 7. Configurar Nginx (Reverse Proxy)

Criar `/etc/nginx/sites-available/treinabooking`:

```nginx
server {
    listen 80;
    server_name seu-dominio.com www.seu-dominio.com;

    client_max_body_size 100M;

    location /api/ {
        rewrite ^/api/(.*) /$1 break;
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    location / {
        proxy_pass http://localhost:3003;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Ativar:

```bash
sudo ln -s /etc/nginx/sites-available/treinabooking /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 8. SSL com Let's Encrypt (Opcional)

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d seu-dominio.com -d www.seu-dominio.com
```

---

## 🛠️ Comandos Docker Úteis

### Gerenciar Containers

```bash
# Ver status
docker-compose ps

# Ver logs em tempo real
docker-compose logs -f

# Ver logs de um serviço específico
docker-compose logs -f backend
docker-compose logs -f frontend

# Parar containers
docker-compose stop

# Iniciar containers
docker-compose start

# Reiniciar containers
docker-compose restart

# Parar e remover containers
docker-compose down

# Rebuild e reiniciar
docker-compose up -d --build
```

### Debug

```bash
# Entrar no container do backend
docker exec -it treinabooking-backend sh

# Entrar no container do frontend
docker exec -it treinabooking-frontend sh

# Ver últimas 100 linhas de log
docker-compose logs --tail=100

# Ver uso de recursos
docker stats
```

### Atualizar Aplicação

Quando fizer alterações no código:

```bash
# 1. Pull do código atualizado
git pull

# 2. Rebuild e restart
docker-compose up -d --build

# 3. Verificar logs
docker-compose logs -f
```

---

## 💻 Instalação Local (Desenvolvimento)

Se preferir rodar localmente sem Docker:

### Requisitos
- Node.js 14+
- MySQL 5.7+
- npm ou yarn

### 1. Database

```sql
CREATE DATABASE digital7_appSheet_development;
CREATE USER 'digital7_admin_user'@'localhost' IDENTIFIED BY 'Ec$yllFnr)9I';
GRANT ALL PRIVILEGES ON digital7_appSheet_development.* TO 'digital7_admin_user'@'localhost';
FLUSH PRIVILEGES;
```

### 2. Backend

```bash
cd server
npm install
npm run db-migrate
npm start
```

Roda em: `http://localhost:8000`

### 3. Frontend

Criar `.env` em `frontend/`:

```properties
NEXT_PUBLIC_JWT_EXPIRATION=5m
NEXT_PUBLIC_JWT_SECRET=dd5f3089-40c3-403d-af14-d0c228b05cb4
NEXT_PUBLIC_JWT_REFRESH_TOKEN_SECRET=7c4c1c50-3230-45bf-9eae-c9b2e401c767
NEXT_PUBLIC_APP_URL=http://localhost:8000/
port=3003
```

```bash
cd frontend
npm install
npm run dev
```

Roda em: `http://localhost:3003`

---

## 📁 Estrutura do Projeto

```
TreinaBooking/
├── server/                   # Backend Node.js
│   ├── Controller/           # Controladores HTTP
│   ├── Services/             # Lógica de negócio
│   ├── Repositories/         # Acesso a dados
│   ├── Models/               # Modelos Sequelize
│   ├── Routes/               # Rotas
│   ├── migrations/           # Migrações DB
│   ├── config/               # Configurações
│   ├── Dockerfile            # Docker backend
│   └── package.json
│
├── frontend/                 # Frontend Next.js
│   ├── src/
│   │   ├── pages/            # Páginas
│   │   ├── services/         # Chamadas API
│   │   ├── components/       # Componentes React
│   │   └── configs/          # Configurações
│   ├── public/               # Assets
│   ├── Dockerfile            # Docker frontend
│   └── package.json
│
├── docker-compose.yml        # Orquestração Docker
├── .env                      # Variáveis de ambiente (criar)
└── README.md
```

---

## 🎯 Principais Funcionalidades

- Gestão de usuários (Admin, Trainer, Student)
- Sistema de carteira digital com pacotes
- Agendamento de sessões (Bookings)
- Registro de presenças (Attendances)
- Integração Google Calendar
- Relatórios financeiros
- Pricing dinâmico por tamanho de grupo

---

## 📡 Endpoints Principais

### Users
- `POST /user` - Criar usuário
- `GET /user/all` - Listar todos
- `GET /user?userId=X` - Buscar usuário
- `PUT /user` - Atualizar usuário
- `DELETE /user?userId=X` - Deletar usuário

### Bookings
- `POST /booking` - Criar reserva
- `GET /booking/all` - Listar reservas
- `PUT /booking` - Atualizar reserva
- `DELETE /booking?bookingId=X` - Cancelar reserva

### Attendances
- `POST /attendance` - Registrar presença
- `GET /attendance/all` - Listar presenças

### Wallet
- `GET /wallet?userId=X` - Ver carteira
- `PUT /wallet` - Adicionar créditos
- `GET /wallet/check?userId=X&teamSize=Y` - Verificar saldo

### Reports
- `GET /report/all?startDate=X&endDate=Y&trainer=Z` - Relatório período

---

## 🐛 Troubleshooting

### Containers não iniciam

```bash
# Ver logs detalhados
docker-compose logs

# Verificar portas em uso
sudo lsof -i :8000
sudo lsof -i :3003

# Rebuild completo
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Backend não conecta ao MySQL

```bash
# Verificar MySQL rodando
sudo systemctl status mysql

# Testar conexão
mysql -u digital7_admin_user -p -h 127.0.0.1

# Verificar bind-address
sudo nano /etc/mysql/mysql.conf.d/mysqld.cnf
# Deve ser: bind-address = 0.0.0.0

# Reiniciar MySQL
sudo systemctl restart mysql
```

### Frontend retorna 502

```bash
# Verificar se backend está respondendo
curl http://localhost:8000/user/all

# Ver logs do frontend
docker-compose logs -f frontend

# Verificar variável NEXT_PUBLIC_APP_URL no .env
cat .env | grep NEXT_PUBLIC_APP_URL
```

### Migrations não executadas

```bash
# Entrar no container do backend
docker exec -it treinabooking-backend sh

# Executar migrations manualmente
npx sequelize-cli db:migrate

# Sair
exit
```

### Permissões negadas

```bash
# Adicionar usuário ao grupo docker
sudo usermod -aG docker $USER
newgrp docker

# Ou use sudo
sudo docker-compose up -d
```

---

## 🔐 Segurança

- ⚠️ Altere as senhas padrão em produção
- 🔒 Use HTTPS em produção (Let's Encrypt)
- 🔑 Nunca commite o arquivo `.env`
- 🛡️ Configure firewall adequadamente
- 📝 Mantenha logs para auditoria

---

## 📝 Scripts Úteis

### Backend

```bash
npm start              # Ambiente local
npm run dev            # Development
npm run prod           # Production
npm run db-migrate     # Executar migrations
npm run migrate:undo   # Reverter migration
```

### Frontend

```bash
npm run dev            # Development
npm run build          # Build produção
npm start              # Iniciar build
npm run lint           # Linter
```

---

## 🆘 Deploy Rápido (Resumo)

```bash
# 1. Clonar repositório
git clone <repo-url>
cd TreinaBooking

# 2. Criar .env na raiz (ver seção 3)
nano .env

# 3. Configurar MySQL (ver seção 2)
mysql -u root -p < setup.sql

# 4. Executar migrations
cd server && npm install && NODE_ENV=production npx sequelize-cli db:migrate && cd ..

# 5. Subir Docker
docker-compose up -d

# 6. Verificar
docker-compose ps
docker-compose logs -f
```

---

## 📝 Licença

Proprietary

---

## 🆘 Suporte

Problemas? 
1. Verifique os logs: `docker-compose logs -f`
2. Consulte a seção Troubleshooting
3. Entre em contato com a equipe de desenvolvimento