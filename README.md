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

## 🚀 Deploy com Docker (Recomendado)

### Pré-requisitos

- Docker 20.10+
- Docker Compose 2.0+
- MySQL 5.7+ (rodando no host ou em container separado)

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

# Adicionar usuário ao grupo docker
sudo usermod -aG docker $USER
newgrp docker
```

### 2. Configurar Database MySQL

**Opção A: MySQL no Host (fora do Docker)**

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

Alterar:
```ini
bind-address = 0.0.0.0
```

Reiniciar MySQL:
```bash
sudo systemctl restart mysql
```

**Opção B: MySQL em Container Docker** (adicione ao docker-compose.yml)

```yaml
  mysql:
    image: mysql:8.0
    container_name: treinabooking-mysql
    restart: unless-stopped
    environment:
      MYSQL_ROOT_PASSWORD: rootpassword
      MYSQL_DATABASE: digital7_appSheet_development
      MYSQL_USER: digital7_admin_user
      MYSQL_PASSWORD: Ec$yllFnr)9I
    ports:
      - "3306:3306"
    volumes:
      - mysql-data:/var/lib/mysql
    networks:
      - treinabooking-network

volumes:
  mysql-data:
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

### 4. Estrutura de Arquivos Docker

A estrutura final do projeto deve ser:

```
TreinaBooking/
├── server/
│   ├── Dockerfile
│   ├── package.json
│   └── ...
├── frontend/
│   ├── Dockerfile
│   ├── package.json
│   └── ...
├── docker-compose.yml
├── .env
└── README.md
```

### 5. Criar Dockerfile do Backend

Criar arquivo `server/Dockerfile`:

```dockerfile
FROM node:18-alpine

RUN apk add --no-cache python3 make g++

WORKDIR /app

COPY package*.json ./

RUN npm ci --only=production

COPY . .

EXPOSE 8000

ENV NODE_ENV=production

CMD ["node", "app.js", "production"]
```

### 6. Criar Dockerfile do Frontend

Criar arquivo `frontend/Dockerfile`:

```dockerfile
FROM node:18-alpine AS base

RUN apk add --no-cache libc6-compat python3 make g++
WORKDIR /app

COPY package*.json ./

FROM base AS deps
RUN npm ci

FROM base AS builder

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED 1
ENV NODE_TLS_REJECT_UNAUTHORIZED 0

RUN npm run build

FROM base AS runner

WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

USER nextjs

EXPOSE 3003

ENV PORT 3003
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

### 7. Atualizar next.config.js

Adicionar `output: 'standalone'` no `frontend/next.config.js`:

```javascript
const path = require('path')

const nextConfig = {
  trailingSlash: true,
  reactStrictMode: false,
  output: 'standalone',
  typescript: {
    ignoreBuildErrors: true
  },
  webpack: config => {
    config.resolve.alias = {
      ...config.resolve.alias,
      apexcharts: path.resolve(__dirname, './node_modules/apexcharts-clevision')
    }
    return config
  }
}

module.exports = nextConfig
```

### 8. Criar docker-compose.yml

Criar arquivo `docker-compose.yml` na raiz:

```yaml
version: '3.8'

services:
  backend:
    build:
      context: ./server
      dockerfile: Dockerfile
    container_name: treinabooking-backend
    restart: unless-stopped
    ports:
      - "8000:8000"
    environment:
      - NODE_ENV=production
      - DB_HOST=${DB_HOST:-host.docker.internal}
      - DB_PORT=${DB_PORT:-3306}
      - DB_NAME=${DB_NAME}
      - DB_USER=${DB_USER}
      - DB_PASS=${DB_PASS}
    extra_hosts:
      - "host.docker.internal:host-gateway"
    networks:
      - treinabooking-network
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:8000/user/all"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: treinabooking-frontend
    restart: unless-stopped
    ports:
      - "3003:3003"
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_JWT_EXPIRATION=${NEXT_PUBLIC_JWT_EXPIRATION}
      - NEXT_PUBLIC_JWT_SECRET=${NEXT_PUBLIC_JWT_SECRET}
      - NEXT_PUBLIC_JWT_REFRESH_TOKEN_SECRET=${NEXT_PUBLIC_JWT_REFRESH_TOKEN_SECRET}
      - NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL}
      - PORT=3003
    depends_on:
      backend:
        condition: service_healthy
    networks:
      - treinabooking-network
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:3003"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 60s

networks:
  treinabooking-network:
    driver: bridge
```

### 9. Executar Migrations do Database

Antes de subir os containers, execute as migrations:

```bash
cd server
npm install
NODE_ENV=production npx sequelize-cli db:migrate
cd ..
```

### 10. Build e Deploy

```bash
docker-compose build
docker-compose up -d
docker-compose logs -f
docker-compose ps
```

### 11. Verificar Deploy

```bash
curl http://localhost:8000/user/all
curl http://localhost:3003
docker-compose logs -f backend
docker-compose logs -f frontend
```

### 12. Configurar Nginx (Reverse Proxy)

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

Ativar configuração:

```bash
sudo ln -s /etc/nginx/sites-available/treinabooking /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 13. SSL com Let's Encrypt (Opcional)

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d seu-dominio.com -d www.seu-dominio.com
sudo certbot renew --dry-run
```

---

## 🛠️ Comandos Docker Úteis

### Gerenciar Containers

```bash
docker-compose ps
docker-compose logs -f
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose stop
docker-compose start
docker-compose restart
docker-compose down
docker-compose up -d --build
docker stats
```

### Debug e Manutenção

```bash
docker exec -it treinabooking-backend sh
docker exec -it treinabooking-frontend sh
docker-compose logs --tail=100
docker container prune
docker image prune
docker system prune -a
```

### Atualizar Aplicação

```bash
git pull origin main
docker-compose up -d --build
docker-compose logs -f
```

---

## 💻 Instalação Local (Desenvolvimento)

### Requisitos
- Node.js 14+
- MySQL 5.7+
- npm ou yarn

### 1. Database Local

```sql
CREATE DATABASE digital7_appSheet_development;
CREATE USER 'digital7_admin_user'@'localhost' IDENTIFIED BY 'Ec$yllFnr)9I';
GRANT ALL PRIVILEGES ON digital7_appSheet_development.* TO 'digital7_admin_user'@'localhost';
FLUSH PRIVILEGES;
```

### 2. Backend Local

```bash
cd server
npm install
npm run db-migrate
npm start
```

Servidor roda em: `http://localhost:8000`

### 3. Frontend Local

Criar arquivo `.env` em `frontend/`:

```properties
NEXT_PUBLIC_JWT_EXPIRATION=5m
NEXT_PUBLIC_JWT_SECRET=dd5f3089-40c3-403d-af14-d0c228b05cb4
NEXT_PUBLIC_JWT_REFRESH_TOKEN_SECRET=7c4c1c50-3230-45bf-9eae-c9b2e401c767
NEXT_PUBLIC_APP_URL=http://localhost:8000/
port=3003
```

Iniciar aplicação:

```bash
cd frontend
npm install
npm run dev
```

Aplicação roda em: `http://localhost:3003`

---

## 📁 Estrutura do Projeto

```
TreinaBooking/
├── server/
│   ├── Controller/
│   ├── Services/
│   ├── Repositories/
│   ├── Models/
│   ├── Routes/
│   ├── migrations/
│   ├── config/
│   ├── Dockerfile
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── components/
│   │   └── configs/
│   ├── public/
│   ├── Dockerfile
│   └── package.json
│
├── docker-compose.yml
├── .env
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
- `GET /user?userId=X` - Buscar um
- `PUT /user` - Atualizar
- `DELETE /user?userId=X` - Deletar

### Bookings
- `POST /booking` - Criar reserva
- `GET /booking/all` - Listar reservas
- `PUT /booking` - Atualizar reserva
- `DELETE /booking?bookingId=X` - Cancelar

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

## 🔧 Scripts Úteis

### Backend

```bash
npm start
npm run dev
npm run prod
npm run db-migrate
npm run migrate:undo
```

### Frontend

```bash
npm run dev
npm run build
npm start
npm run lint
```

---

## 🐛 Troubleshooting

### Containers não iniciam

```bash
docker-compose logs
sudo lsof -i :8000
sudo lsof -i :3003
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Backend não conecta ao MySQL

```bash
sudo systemctl status mysql
mysql -u digital7_admin_user -p -h 127.0.0.1
sudo nano /etc/mysql/mysql.conf.d/mysqld.cnf
```

### Frontend com erro 502

```bash
curl http://localhost:8000/user/all
docker-compose logs -f frontend
```

### Erro de permissões

```bash
sudo usermod -aG docker $USER
newgrp docker
```

### Migrations não executadas

```bash
docker exec -it treinabooking-backend sh
npx sequelize-cli db:migrate
exit
```

---

## 🔐 Segurança

- Altere as senhas padrão em produção
- Use HTTPS em produção (Let's Encrypt)
- Proteja o arquivo `.env` (nunca commite)
- Configure firewall adequadamente
- Mantenha logs para auditoria

---

## 📝 Licença

Proprietary

---

## 🆘 Suporte

Para dúvidas ou problemas:
1. Verifique os logs: `docker-compose logs -f`
2. Consulte este README
3. Entre em contato com a equipe de desenvolvimento