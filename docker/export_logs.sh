#!/bin/bash

LOG_DIR="./docker_logs"

mkdir -p "$LOG_DIR"

for container in $(docker ps --format "{{.Names}}"); do
    echo "Exportiere Logs aus $container ..."
    docker logs "$container" > "$LOG_DIR/${container}.log" 2>&1
done

echo "Logs liegen in $LOG_DIR/"