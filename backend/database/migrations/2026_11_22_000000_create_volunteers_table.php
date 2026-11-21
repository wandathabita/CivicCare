<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('volunteers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('report_id')->constrained('reports')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('note', 200)->nullable();
            $table->timestamps();

            // Satu orang hanya bisa mendaftar sekali per kasus
            $table->unique(['report_id', 'user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('volunteers');
    }
};