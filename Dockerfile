FROM node:lts-alpine as base
COPY . /src
WORKDIR /src
RUN npm ci ; \
    npm run build-ts ; \
    npm prune --production

FROM node:lts-alpine as formapi
WORKDIR /app
RUN mkdir -p /app
COPY --from=base /src/node_modules node_modules
COPY --from=base /src/dist dist
COPY --from=base /src/swagger swagger
RUN chown -R node:node /app
ENV NODE_ENV='production'
USER 1000
EXPOSE 8080
ENTRYPOINT node_modules/.bin/sequelize db:migrate --env ${NODE_ENV} --config dist/config/configHook.js --debug --migrations-path dist/migrations && exec node dist/bootstrap.js
