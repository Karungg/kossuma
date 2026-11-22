<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('order_internal_notes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('admin_id')->nullable()->constrained('users')->nullOnDelete();
            $table->text('note');
            $table->timestamps();

            $table->index(['order_id', 'created_at']);
        });

        Schema::table('order_status_histories', function (Blueprint $table) {
            $table->string('actor_type', 30)->default('system')->after('location');
            $table->foreignUuid('actor_id')->nullable()->after('actor_type')->constrained('users')->nullOnDelete();
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->index(['status', 'created_at']);
            $table->index(['payment_status', 'created_at']);
            $table->index(['store_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropIndex(['status', 'created_at']);
            $table->dropIndex(['payment_status', 'created_at']);
            $table->dropIndex(['store_id', 'status']);
        });

        Schema::table('order_status_histories', function (Blueprint $table) {
            $table->dropConstrainedForeignId('actor_id');
            $table->dropColumn('actor_type');
        });

        Schema::dropIfExists('order_internal_notes');
    }
};
