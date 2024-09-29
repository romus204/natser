FROM golang:alpine as builder

WORKDIR /build

COPY ./backend .
RUN go clean --modcache && go mod download
RUN GOOS=linux GOARCH=amd64 go build -ldflags="-w -s" -buildvcs=false -o /build/server cmd/main.go

FROM nginx:1.27.1-alpine3.20
# Копируем HTML файлы
COPY ./frontend/html /usr/share/nginx/html

# Копируем CSS файлы
COPY ./frontend/css /usr/share/nginx/html/css

# Копируем JS файлы
COPY ./frontend/js /usr/share/nginx/html/js

COPY ./nginx/nginx.conf /etc/nginx/nginx.conf

RUN touch database.db

COPY  --from=builder /build/server /

CMD /server & nginx -g 'daemon off;'