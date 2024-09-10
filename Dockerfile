FROM node:22-alpine AS builder
WORKDIR /app
COPY . /app
RUN npm install
RUN npm run build
RUN rm -rf node_modules && npm install --omit=dev

FROM node:22-alpine
WORKDIR /app
COPY --from=builder /app/dist /app/dist
COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app/package.json /app/package.json
COPY --from=builder /app/.env.dist /app/.env.dist

ENTRYPOINT ["npm", "run", "start:prod"]
