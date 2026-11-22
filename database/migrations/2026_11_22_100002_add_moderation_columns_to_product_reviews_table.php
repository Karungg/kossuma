<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('product_reviews', function (Blueprint $table) {
            $table->boolean('is_hidden')->default(false)->after('comment')->index();
            $table->string('hidden_reason', 255)->nullable()->after('is_hidden');
            $table->foreignUuid('moderated_by')->nullable()->after('hidden_reason')->constrained('users')->nullOnDelete();
            $table->timestamp('moderated_at')->nullable()->after('moderated_by');
            $table->text('admin_reply')->nullable()->after('moderated_at');
            $table->foreignUuid('admin_replied_by')->nullable()->after('admin_reply')->constrained('users')->nullOnDelete();
            $table->timestamp('admin_replied_at')->nullable()->after('admin_replied_by');
        });
    }

    public function down(): void
    {
        Schema::table('product_reviews', function (Blueprint $table) {
            $table->dropConstrainedForeignId('admin_replied_by');
            $table->dropConstrainedForeignId('moderated_by');
            $table->dropColumn([
                'is_hidden',
                'hidden_reason',
                'moderated_at',
                'admin_reply',
                'admin_replied_at',
            ]);
        });
    }
};
