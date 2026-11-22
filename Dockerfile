# syntax=docker/dockerfile:1.7

ARG PHP_IMAGE=php:8.5-fpm-bookworm
ARG NODE_IMAGE=node:22-bookworm-slim
ARG COMPOSER_IMAGE=composer:2

# -----------------------------------------------------------------------------
# Stage 1: Base PHP 8.5-FPM (latest patch) + required system & PHP extensions
# -----------------------------------------------------------------------------
FROM ${PHP_IMAGE} AS php-base

RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    curl \
    git \
    procps \
    unzip \
    rsync \
    libfcgi-bin \
    libfreetype6-dev \
    libicu-dev \
    libjpeg62-turbo-dev \
    libpng-dev \
    libwebp-dev \
    libzip-dev \
    && docker-php-ext-configure gd \
        --with-freetype \
        --with-jpeg \
        --with-webp \
    && docker-php-ext-install -j"$(nproc)" \
        bcmath \
        exif \
        gd \
        intl \
        pcntl \
        pdo_mysql \
        zip \
    && rm -rf /var/lib/apt/lists/*

# PHP 8.5 includes OPcache natively in core (do NOT run docker-php-ext-install opcache)
COPY docker/php/php.ini /usr/local/etc/php/conf.d/99-kossuma.ini
COPY docker/php/opcache.ini /usr/local/etc/php/conf.d/99-opcache.ini
COPY docker/php/www.conf /usr/local/etc/php-fpm.d/zz-kossuma.conf

WORKDIR /var/www/html

# -----------------------------------------------------------------------------
# Stage 2: Production Composer dependencies (cached on lockfile)
# -----------------------------------------------------------------------------
FROM php-base AS composer-deps

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

COPY composer.json composer.lock ./

RUN composer install \
    --no-dev \
    --no-interaction \
    --prefer-dist \
    --no-scripts \
    --no-autoloader

# -----------------------------------------------------------------------------
# Stage 3: Node 22 runtime provider (glibc / Debian Bookworm)
# -----------------------------------------------------------------------------
FROM ${NODE_IMAGE} AS node-base

# -----------------------------------------------------------------------------
# Stage 4: Frontend Builder (PHP 8.5 + Node 22 for Wayfinder & Vite+ build)
# -----------------------------------------------------------------------------
FROM php-base AS frontend-builder

COPY --from=node-base /usr/local/bin/node /usr/local/bin/node
COPY --from=node-base /usr/local/lib/node_modules /usr/local/lib/node_modules
RUN ln -s /usr/local/lib/node_modules/npm/bin/npm-cli.js /usr/local/bin/npm \
    && ln -s /usr/local/lib/node_modules/npm/bin/npx-cli.js /usr/local/bin/npx

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

COPY package.json package-lock.json .npmrc ./
RUN npm ci --no-audit --no-fund

COPY --from=composer-deps /var/www/html/vendor ./vendor
COPY artisan composer.json composer.lock vite.config.ts tsconfig.json ./
COPY app ./app
COPY bootstrap ./bootstrap
COPY config ./config
COPY database ./database
COPY public ./public
COPY resources ./resources
COPY routes ./routes

ARG VITE_APP_NAME="Kossuma Kota Bogor"

ENV VITE_APP_NAME=${VITE_APP_NAME} \
    APP_ENV=production \
    APP_KEY=base64:AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA= \
    DB_CONNECTION=sqlite \
    DB_DATABASE=:memory: \
    CACHE_STORE=array \
    SESSION_DRIVER=array \
    QUEUE_CONNECTION=sync

RUN mkdir -p \
        storage/framework/cache/data \
        storage/framework/sessions \
        storage/framework/views \
        storage/logs \
        bootstrap/cache \
    && rm -f bootstrap/cache/*.php \
    && composer dump-autoload --no-dev --no-scripts \
    && php artisan package:discover --ansi \
    && php artisan wayfinder:generate --with-form --no-interaction \
    && npm run build

# -----------------------------------------------------------------------------
# Stage 5: Final Production Application Image (no Node.js / no dev deps)
# -----------------------------------------------------------------------------
FROM php-base AS app

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

COPY artisan composer.json composer.lock ./
COPY app ./app
COPY bootstrap ./bootstrap
COPY config ./config
COPY database ./database
COPY public ./public
COPY resources ./resources
COPY routes ./routes

COPY --from=composer-deps /var/www/html/vendor ./vendor
COPY --from=frontend-builder /var/www/html/public/build ./public/build

RUN mkdir -p \
        storage/app/private \
        storage/app/public \
        storage/framework/cache/data \
        storage/framework/sessions \
        storage/framework/testing \
        storage/framework/views \
        storage/logs \
        bootstrap/cache \
    && rm -f bootstrap/cache/*.php \
    && APP_ENV=production \
       APP_KEY=base64:AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA= \
       DB_CONNECTION=sqlite \
       DB_DATABASE=:memory: \
       CACHE_STORE=array \
       SESSION_DRIVER=array \
       QUEUE_CONNECTION=sync \
       composer dump-autoload --optimize --classmap-authoritative --no-dev \
    && rm -f /usr/bin/composer \
    && ln -sfn ../storage/app/public /var/www/html/public/storage \
    && chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache \
    && chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache

COPY docker/entrypoint.sh /usr/local/bin/kossuma-entrypoint
RUN chmod +x /usr/local/bin/kossuma-entrypoint

EXPOSE 9000

ENTRYPOINT ["/usr/local/bin/kossuma-entrypoint"]
CMD ["app"]
