#FROM docker.pkg.github.com/digitalpatterns/node/node-master:latest AS build
FROM digitalpatterns/node:latest AS build

COPY . /src

WORKDIR /src


RUN npm ci
RUN npm run build-ts

RUN npm prune --production

#FROM docker.pkg.github.com/digitalpatterns/node/node-master:latest
FROM digitalpatterns/node:latest

WORKDIR /app
RUN mkdir -p /app


COPY --from=build /src/node_modules node_modules
COPY --from=build /src/dist dist
COPY --from=build /src/swagger swagger

RUN chown -R node:node /app

ENV NODE_ENV='production'

USER 1000

EXPOSE 8080

ENTRYPOINT node_modules/.bin/sequelize db:migrate --env production --config dist/config/configHook.js --debug --migrations-path dist/migrations && exec node dist/bootstrap.js

