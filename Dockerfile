FROM node:22-alpine
WORKDIR /app
COPY --chown=node:node package.json server.mjs index.html styles.css main.js ./
COPY --chown=node:node public ./public
USER node
ENV NODE_ENV=production
EXPOSE 3000
CMD ["node", "server.mjs"]
