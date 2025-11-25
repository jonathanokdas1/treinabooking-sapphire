# TreinaBooking System

Sistema de gestão de reservas e atendimentos para estúdios de fitness.

## Stack

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

## Requisitos

- Node.js 14+
- MySQL 5.7+
- npm ou yarn

## Configuração

### 1. Database

Criar database MySQL:

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

Servidor roda em: `http://localhost:8000`

### 3. Frontend

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

## Estrutura do Projeto

```
.
├── server/
│   ├── Controller/       # Controladores HTTP
│   ├── Services/         # Lógica de negócio
│   ├── Repositories/     # Acesso a dados
│   ├── Models/           # Modelos Sequelize
│   ├── Routes/           # Definição de rotas
│   ├── migrations/       # Migrações do banco
│   └── config/           # Configurações
│
└── frontend/
    ├── src/
    │   ├── pages/        # Páginas Next.js
    │   ├── services/     # Chamadas API
    │   ├── components/   # Componentes React
    │   └── configs/      # Configurações
    └── public/           # Assets estáticos
```

## Principais Funcionalidades

- Gestão de usuários (Admin, Trainer, Student)
- Sistema de carteira digital com pacotes
- Agendamento de sessões (Bookings)
- Registro de presenças (Attendances)
- Integração Google Calendar
- Relatórios financeiros
- Pricing dinâmico por tamanho de grupo

## Scripts Úteis

### Backend
```bash
npm start              # Inicia servidor (ambiente local)
npm run dev            # Ambiente development
npm run prod           # Ambiente production
npm run db-migrate     # Executa migrations
npm run migrate:undo   # Reverte última migration
```

### Frontend
```bash
npm run dev            # Modo desenvolvimento
npm run build          # Build produção
npm start              # Inicia build de produção
npm run lint           # Linter
```

## Variáveis de Ambiente

### Backend (server/config/config.json)
- Database credentials
- SMTP settings
- Google API keys
- Timezone configuration

### Frontend (.env)
- JWT secrets
- API URL
- Port configuration

## Troubleshooting

### Erro 404 nas chamadas API
Verificar se `NEXT_PUBLIC_APP_URL` está definida no `.env` do frontend.

### Migrations não rodam
Verificar credenciais do MySQL em `server/config/config.json`.

### Google Calendar não funciona
Sistema configurado para usar OAuth2. Requer configuração no Google Cloud Console.

## Endpoints Principais

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

## Licença

Proprietary