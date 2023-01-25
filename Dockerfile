FROM node:19-alpine AS build

WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
RUN npm prune --production


FROM node:19-alpine AS production

WORKDIR /usr/src/app
COPY --from=build /usr/src/app/dist /usr/src/app/dist
COPY --from=build /usr/src/app/node_modules /usr/src/app/node_modules
COPY --from=build /usr/src/app/prisma /usr/src/app/prisma
COPY --from=build /usr/src/app/.env /usr/src/app/.env
ENV NODE_ENV=production

EXPOSE 3000
CMD [ "node", "dist/main" ]
