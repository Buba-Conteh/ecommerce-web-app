# Use an official PHP image with Nginx as the base
FROM php:8.3-fpm-alpine

# Install necessary extensions and dependencies
RUN apk add --no-cache \
    nginx \
    supervisor \
    php8-pdo_mysql \
    php8-mbstring \
    php8-tokenizer \
    php8-xml \
    php8-ctype \
    php8-session \
    php8-zip \
    php8-gd \
    php8-opcache \
    php8-json \
    php8-dom \
    php8-fileinfo \
    php8-phar \
    php8-cli \
    php8-fpm \
    php8-curl \
    php8-iconv \
    php8-openssl \
    php8-bcmath \
    php8-exif \
    php8-intl \
    php8-posix \
    php8-pcntl \
    php8-xmlreader \
    php8-xmlwriter \
    php8-simplexml \
    php8-mysqli \
    php8-pdo_sqlite \
    php8-redis \
    php8-imagick \
    php8-xdebug # Optional, for development

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set the working directory
WORKDIR /var/www/html

# Copy the application code
COPY . .

# Install Composer dependencies
RUN composer install --no-dev --optimize-autoloader

# Generate application key and optimize configuration
RUN php artisan key:generate --force
RUN php artisan config:cache
RUN php artisan route:cache
RUN php artisan view:cache

# Configure Nginx
COPY docker/nginx/default.conf /etc/nginx/conf.d/default.conf

# Configure Supervisor
COPY docker/supervisor/supervisord.conf /etc/supervisord.conf

# Expose port 80 for Nginx
EXPOSE 80

# Start Nginx and PHP-FPM using Supervisor
# CMD ["/usr/bin/supervisord", "-c", "/etc/supervisord.conf"]