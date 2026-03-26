FROM node:20-alpine

WORKDIR /app

# Copiamos solo los archivos de paquetes primero
COPY package.json ./

# Instalamos de cero dentro de Linux
RUN npm install

# Luego copiamos el resto
COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]