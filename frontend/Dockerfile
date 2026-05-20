FROM node:22-alpine as build

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm install

COPY . .

RUN npm run build


FROM nginx:latest

RUN rm -rf /etc/nginx/conf.d/default.conf

COPY nginx/nginx.conf /etc/nginx/nginx.conf

COPY --from=build /app/dist /usr/share/nginx/html