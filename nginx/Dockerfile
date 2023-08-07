FROM nginx:latest

RUN rm /etc/nginx/conf.d/default.conf

COPY server.conf /etc/nginx/conf.d/
COPY nginx.conf /etc/nginx

EXPOSE 80 443
