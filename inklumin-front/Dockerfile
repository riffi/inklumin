FROM node:22 AS build
WORKDIR /app
COPY package.json yarn.lock .
COPY .yarn ./.yarn
COPY .yarnrc.yml .
RUN corepack enable && yarn install --frozen-lockfile
COPY . .
RUN yarn build

FROM nginx:stable-alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

