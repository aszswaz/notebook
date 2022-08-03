# Introduction

[Nginx](https://www.nginx.com/) is a very widely used HTTP server.

# Install

Take Centos 7 as an example.

```bash
$ sudo yum install yum-utils
$ sudo nvim /etc/yum.repos.d/nginx.repo
[nginx-stable]
name=nginx stable repo
baseurl=http://nginx.org/packages/centos/$releasever/$basearch/
gpgcheck=1
enabled=1
gpgkey=https://nginx.org/keys/nginx_signing.key
module_hotfixes=true

[nginx-mainline]
name=nginx mainline repo
baseurl=http://nginx.org/packages/mainline/centos/$releasever/$basearch/
gpgcheck=1
enabled=0
gpgkey=https://nginx.org/keys/nginx_signing.key
module_hotfixes=true
$ sudo yum install nginx
```

# location matching rules

| symbol    | describe                                                    | e.g.                   |
| --------- | ----------------------------------------------------------- | ---------------------- |
| =         | Exact match, only exact equality takes effect.              | location = /robots.txt |
| ^~        | Prefix matches, priority is higher than refular matching.   | location ^~ /example   |
| ~         | Regular expression matching.                                | location ~ ^/.*\\.txt  |
| ~*        | Case-insensitive regular expression matching.               | location ~* ^/.*\\.TXT |
| /xxx or / | Also prefix matching, lower priority than regular matching. | location /example      |

# Configuration Template

Global configuration: /etc/nginx/nginx.conf

```txt
user  nginx;
# Number of worker processes.
worker_processes  1;

error_log  /var/log/nginx/error.log notice;
pid        /var/run/nginx.pid;

events {
    # Maximum number of connections.
    worker_connections  50;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    # Set the global log format.
    log_format  main  '$time_iso8601 client ip: $remote_addr; start line: $request; request length: $request_length; status code: $status；send bytes: $bytes_sent; connect number: $connection; current connect request count: $connection_requests；User-Agent: $http_user_agent;';
    access_log  /var/log/nginx/access.log  main;
    # Sending files using the sendfile function of the linux kernel can reduce the switching between kernel and user processes.
    sendfile       on;
    # It takes effect after enabling sendfile, fill the buffer first, and then send as soon as possible.
    tcp_nopush     on;
    tcp_nodelay    on;

    gzip  on;
    gzip_types 
        application/javascript
        application/x-javascript
        text/javascript
        text/css
        text/xml
        text/mathml
        text/plain
        text/vnd.sun.j2me.app-descriptor
        text/vnd.wap.wml
        text/x-component
        application/xhtml+xml
        application/xml
        application/atom+xml
        application/rdf+xml
        application/rss+xml
        application/geo+json
        application/json
        application/ld+json
        application/manifest+json
        application/x-web-app-manifest+json
        image/svg+xml
        text/x-cross-domain-policy;
    gzip_proxied    any;
    gzip_comp_level 5;
    gzip_min_length 1K;
    gzip_vary       on;
    gzip_static     on;

    # Hide the nginx version number.
    server_tokens off;
    # Directory listing is prohibited.
    autoindex off;
    # Request header and request body read timeout.
    client_header_timeout 15;
    client_body_timeout 15;
    client_max_body_size 500m;
    send_timeout    120;
    # Sets the timeout period for the client connection to maintain the session. After this time, the server will close the connection.
    keepalive_timeout 60;
    # Limit the access frequency of each IP address, ip_cache is the memory space, 10m is the memory size, $binary_remote_addr is the client IP address, and $binary_remote_addr is used as the key to record the visiting IP in the ip_cache memory.
    limit_req_zone $binary_remote_addr zone=ip_cache:10m rate=20r/s;
    limit_req zone=ip_cache burst=20 nodelay;
    include /etc/nginx/conf.d/*.conf;
}
```

server configuration: /etc/nginx/conf.d/default.conf

```txt
server {
    listen 443 ssl;
    ssl_certificate /etc/letsencrypt/live/example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;
    server_name  www.example.com;

    location / {
        # Enable reverse proxy.
        proxy_pass http://unix:/var/lib/gitea/gitea.sock;
        proxy_redirect off;
        # Let the server see the real IP address of the client.
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        # The following are some configurations of reverse proxy, optional.
        proxy_set_header Host $host;
    }

    # Crawler Protocol.
    location = /robots.txt {
        access_log /var/log/nginx/robots.log main;
        alias /usr/share/nginx/html/robots.txt;
    }
}
```

# Notice

## Static file handling

In the location block, both root and alias are used to handle static file requests. If the file is in the root directory of the website, there is no difference between root and alias. The configuration example is as follows:

```txt
location / {
    root /var/lib/nginx/;
}

location / {
    alias /var/lib/nginx/;
}
```

But the files are in a multi-level path, and their difference is obvious:

```txt
location /demo/ {
    root /var/lib/nginx/;
}

location /demo/ {
    alias /var/lib/nginx/;
}
```

Suppose we request the /demo/hello.txt file, the real file paths accessed by root and alias are as follows:

root: /var/lib/nginx/demo/hello.txt

alias: /var/lib/nginx/hello.txt
