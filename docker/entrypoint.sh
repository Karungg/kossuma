#!/usr/bin/env bash
set -euo pipefail

ROLE="${1:-app}"
APP_DIR="/var/www/html"

cd "${APP_DIR}"

ensure_storage_structure() {
    mkdir -p \
        "${APP_DIR}/storage/app/private" \
        "${APP_DIR}/storage/app/public" \
        "${APP_DIR}/storage/framework/cache/data" \
        "${APP_DIR}/storage/framework/sessions" \
        "${APP_DIR}/storage/framework/testing" \
        "${APP_DIR}/storage/framework/views" \
        "${APP_DIR}/storage/logs" \
        "${APP_DIR}/bootstrap/cache"

    chown -R www-data:www-data "${APP_DIR}/storage" "${APP_DIR}/bootstrap/cache"
    chmod -R 775 "${APP_DIR}/storage" "${APP_DIR}/bootstrap/cache"
}

sync_public_assets() {
    ln -sfn ../storage/app/public "${APP_DIR}/public/storage"

    if [ -d /var/www/public-shared ]; then
        rsync -a --delete --exclude='storage' "${APP_DIR}/public/" /var/www/public-shared/
        ln -sfn ../storage/app/public /var/www/public-shared/storage
        chown -R www-data:www-data /var/www/public-shared
    fi
}

run_as_www_data() {
    if [ "$(id -u)" -eq 0 ]; then
        su -s /bin/sh www-data -c "$*"
    else
        sh -c "$*"
    fi
}

case "${ROLE}" in
    init)
        echo "[kossuma:init] Preparing storage directories and permissions..."
        ensure_storage_structure

        echo "[kossuma:init] Syncing built public assets to shared Nginx volume..."
        sync_public_assets

        echo "[kossuma:init] Running database migrations..."
        run_as_www_data "php artisan migrate --force --no-interaction"

        if [ "${DB_SEED_ON_BOOT:-false}" = "true" ]; then
            echo "[kossuma:init] Checking if demo seed is needed..."
            if run_as_www_data "php -r 'require \"vendor/autoload.php\"; \$app = require \"bootstrap/app.php\"; \$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap(); exit(\App\Models\User::query()->exists() ? 1 : 0);'"; then
                echo "[kossuma:init] Users table is empty. Running database seeders..."
                run_as_www_data "php artisan db:seed --force --no-interaction"
            else
                echo "[kossuma:init] Existing users detected. Skipping seed."
            fi
        fi

        echo "[kossuma:init] Clearing stale optimization caches..."
        run_as_www_data "php artisan optimize:clear --no-interaction"
        echo "[kossuma:init] Initialization completed successfully."
        ;;

    app)
        ln -sfn ../storage/app/public "${APP_DIR}/public/storage"
        if [ "$(id -u)" -eq 0 ]; then
            chown -R www-data:www-data "${APP_DIR}/bootstrap/cache"
        fi

        echo "[kossuma:app] Caching Laravel configuration, routes, views, and events..."
        run_as_www_data "php artisan optimize --no-interaction"

        echo "[kossuma:app] Starting PHP-FPM 8.5..."
        exec php-fpm -F
        ;;

    queue)
        echo "[kossuma:queue] Caching configuration..."
        php artisan config:cache --no-interaction

        echo "[kossuma:queue] Starting Laravel queue worker..."
        exec php artisan queue:work \
            --sleep=3 \
            --tries=3 \
            --max-time=3600 \
            --memory=256 \
            --timeout=180 \
            --no-interaction
        ;;

    scheduler)
        echo "[kossuma:scheduler] Caching configuration..."
        php artisan config:cache --no-interaction

        echo "[kossuma:scheduler] Starting Laravel scheduler..."
        exec php artisan schedule:work --no-interaction
        ;;

    *)
        exec "$@"
        ;;
esac
