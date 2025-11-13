FROM node:18

WORKDIR /app

COPY . .

RUN chmod +x start.sh

CMD ["./start.sh"]
