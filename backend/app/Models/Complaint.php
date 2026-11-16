<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Complaint extends Model
{
    protected $fillable = [
        'user_id',
        'category_id',
        'title',
        'description',
        'location',
        'status',
    ];

    // Relasi pengaduan dengan pengguna
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // Relasi pengaduan dengan kategori
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    // Relasi pengaduan dengan foto
    public function images(): HasMany
    {
        return $this->hasMany(ComplaintImage::class);
    }

    // Relasi pengaduan dengan tanggapan admin
    public function responses(): HasMany
    {
        return $this->hasMany(ComplaintResponse::class);
    }

    // Relasi pengaduan dengan riwayat status
    public function statusHistories(): HasMany
    {
        return $this->hasMany(ComplaintStatusHistory::class);
    }
}
