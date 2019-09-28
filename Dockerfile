FROM node:8.0
RUN mkdir /app
ADD . /app
WORKDIR /app
RUN npm install
EXPOSE 8000
CMD ["node", "server.js"]
