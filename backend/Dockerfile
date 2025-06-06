FROM node:20

WORKDIR /app

#copies the package.json and package-lock.json files for caching
COPY package*.json ./

#can have multiple run statements bbubt only 1 cmd statement
RUN npm install

#copies the rest of the files(prisma/ src/ .env etc)
COPY . .

EXPOSE 8000

CMD ["npm", "run", "dev"]