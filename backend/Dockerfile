FROM oven/bun:alpine

WORKDIR /app

VOLUME [ "/data" ]

# Install dependencies
COPY package.json bun.lock* ./

RUN bun install

COPY . .

EXPOSE 3457

CMD ["bun", "run", "start"]
