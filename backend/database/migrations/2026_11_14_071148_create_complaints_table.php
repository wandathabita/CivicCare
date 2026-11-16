<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('complaints', function (Blueprint $table) {
            $table->id();

            // Relasi dengan pengguna
            $table->foreignId('user_id')
                ->constrained('users')
                ->cascadeOnDelete();

            // Relasi dengan kategori
            $table->foreignId('category_id')
                ->constrained('categories')
                ->restrictOnDelete();

            $table->string('title', 150);
            $table->text('description');
            $table->string('location');
            $table->string('status')->default('pending');

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('complaints');
    }
};
