<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Report;

class ReportController extends Controller
{
    // Mengirim laporan masyarakat
    public function store(Request $request)
    {
        $validated = $request->validate([
            'area' => 'required|string|max:255',
        ]);

        $report = Report::create([
            'user_id' => $request->user()->id,
            'area' => $validated['area'],
            'status' => 'pending',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Laporan berhasil dikirim!',
            'data' => $report
        ], 201);
    }

    // Menampilkan laporan milik masyarakat yang login
    public function mine(Request $request)
    {
        $reports = Report::where(
            'user_id',
            $request->user()->id
        )->latest()->get();

        return response()->json([
            'success' => true,
            'data' => $reports
        ], 200);
    }
}
