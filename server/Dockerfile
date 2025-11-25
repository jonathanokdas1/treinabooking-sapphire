FROM node:18-alpine

# Instalar dependências do sistema
RUN apk add --no-cache python3 make g++

# Diretório de trabalho
WORKDIR /app

# Copiar package.json e package-lock.json
COPY package*.json ./

# Instalar dependências
RUN npm ci --only=production

# Copiar código da aplicação
COPY . .

# Expor porta
EXPOSE 8000

# Variável de ambiente
ENV NODE_ENV=production

# Comando para iniciar
CMD ["node", "app.js", "production"]