<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Report;

class PublicController extends Controller
{
    // Statistik publik untuk landing page (tanpa login, tanpa data pribadi)
    public function stats()
    {
        return response()->json([
            'total' => Report::count(),
            'selesai' => Report::where('status', 'Selesai')->count(),
            'proses' => Report::whereIn('status', ['Diverifikasi', 'Diproses'])->count(),
            'wilayah' => Report::distinct()->count('area'),
        ]);
    }
}