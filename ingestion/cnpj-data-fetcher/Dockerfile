# Usar a imagem oficial do Node.js como base
FROM node:25.6.1

# Definir o diretório de trabalho dentro do container
WORKDIR /app

# Copiar apenas os arquivos essenciais para instalar dependências primeiro
COPY package*.json ./

# Instalar as dependências de forma otimizada
RUN npm ci --only=production

# Copiar o restante dos arquivos do projeto
COPY . .

# Definir o comando de execução para iniciar o Job
CMD ["node", "src/main.js"]
