#!/bin/bash

# Start nginx in background
service nginx start

# Start Spring Boot application
java -jar app.jar