<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('reports', function (Blueprint $table) {
            $table->string('code', 20)->nullable()->unique();
            $table->string('title', 150)->nullable();
            $table->string('category', 100)->nullable();
            $table->string('address')->nullable();
            $table->text('description')->nullable();
            $table->longText('photo')->nullable();
            $table->text('admin_note')->nullable();
        });

        // Samakan status lama dengan status yang dipakai frontend
        DB::table('reports')->where('status', 'pending')->update(['status' => 'Menunggu']);
    }

    public function down(): void
    {
        Schema::table('reports', function (Blueprint $table) {
            $table->dropUnique(['code']);
            $table->dropColumn(['code', 'title', 'category', 'address', 'description', 'photo', 'admin_note']);
        });
    }
};