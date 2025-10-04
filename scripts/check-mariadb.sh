#!/bin/bash

# Check if MariaDB container is running
if ! docker ps --filter "name=mariadb" --filter "status=running" | grep -q mariadb; then
    echo "MariaDB container not running. Starting..."
    docker run -d --name mariadb \
        -e MYSQL_ROOT_PASSWORD=iot_password \
        -e MYSQL_DATABASE=coss \
        -e MYSQL_USER=iot_user \
        -e MYSQL_PASSWORD=iot_password \
        -p 3308:3306 \
        mariadb:latest
else
    echo "MariaDB container is already running"
fi
