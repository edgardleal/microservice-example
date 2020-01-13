FROM nginx:alpine
COPY config.conf /etc/nginx/conf.d/default.conf
COPY static/index.html /usr/share/nginx/html/index.html
EXPOSE 80
ENTRYPOINT ["nginx","-g","daemon off;"]
