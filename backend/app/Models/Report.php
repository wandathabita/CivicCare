<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Report extends Model
{
    public const CATEGORIES = [
        'Lampu jalan', 'Sampah', 'Jalan rusak', 'Banjir', 'Bantuan sosial', 'Lainnya',
    ];

    public const AREAS = ['Sukajadi', 'Cicendo', 'Coblong', 'Andir', 'Bandung Wetan'];

    public const STATUSES = ['Menunggu', 'Diverifikasi', 'Diproses', 'Selesai'];

    protected $fillable = [
        'user_id',
        'code',
        'title',
        'category',
        'area',
        'address',
        'description',
        'photo',
        'status',
        'admin_note',
        'resolved_at',
    ];

    protected $casts = [
        'resolved_at' => 'datetime',
    ];

    // Relasi laporan dengan pengguna
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}