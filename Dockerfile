FROM node:18.12.1
WORKDIR /usr/src/ddocsb
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 8080
RUN npm run build
CMD ["node", "build/src/server.js"]