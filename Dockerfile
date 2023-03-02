FROM node:18-alpine as base

WORKDIR /app

COPY package.json yarn.lock /app
RUN yarn install --frozen-lockfile


FROM base as builder

COPY . /app

RUN yarn build


FROM node:18-alpine as production

COPY --from=builder /app/package.json /app/yarn.lock  /app/
RUN yarn install --frozen-lockfile --production

COPY --from=builder /app/dist/index.js /app
CMD ["node", "index.js"]
