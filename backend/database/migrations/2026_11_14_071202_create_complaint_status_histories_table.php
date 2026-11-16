<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('complaint_status_histories', function (Blueprint $table) {
            $table->id();

            // Pengaduan yang statusnya berubah
            $table->foreignId('complaint_id')
                ->constrained('complaints')
                ->cascadeOnDelete();

            // Status pengaduan
            $table->string('status');

            // Pengguna atau admin yang mengubah status
            $table->foreignId('changed_by')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('complaint_status_histories');
    }
};
