FROM node:24-alpine AS builder
WORKDIR /app
COPY . /app
RUN npm install
RUN npm run build
RUN rm -rf node_modules && npm install --omit=dev

FROM node:24-alpine
WORKDIR /app
RUN adduser -D appuser && chown -R appuser /app
COPY --from=builder /app/dist /app/dist
COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app/package.json /app/package.json
COPY --from=builder /app/.env.dist /app/.env.dist
USER appuser
ENTRYPOINT ["npm", "run", "start:prod"]
