<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('complaint_responses', function (Blueprint $table) {
            $table->id();

            // Pengaduan yang ditanggapi
            $table->foreignId('complaint_id')
                ->constrained('complaints')
                ->cascadeOnDelete();

            // Admin yang memberikan tanggapan
            $table->foreignId('admin_id')
                ->constrained('users')
                ->restrictOnDelete();

            // Isi tanggapan admin
            $table->text('message');

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('complaint_responses');
    }
};
