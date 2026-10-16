FROM node:22-alpine
WORKDIR /app
COPY --chown=node:node package.json server.mjs index.html mentions-legales.html confidentialite.html \
     styles.css main.js robots.txt sitemap.xml ./
COPY --chown=node:node public ./public
USER node
ENV NODE_ENV=production
EXPOSE 3000
CMD ["node", "server.mjs"]
