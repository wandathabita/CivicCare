<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Report;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ReportController extends Controller
{
    // Mengirim laporan masyarakat
    public function store(Request $request)
    {
        $data = $request->validate([
            'category' => ['required', Rule::in(Report::CATEGORIES)],
            'title' => ['required', 'string', 'max:80'],
            'area' => ['required', Rule::in(Report::AREAS)],
            'address' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string', 'max:2000'],
            'photo' => ['nullable', 'string', 'starts_with:data:image/', 'max:1500000'],
        ]);

        $report = Report::create([
            'user_id' => $request->user()->id,
            'category' => $data['category'],
            'title' => $data['title'],
            'area' => $data['area'],
            'address' => $data['address'],
            'description' => $data['description'],
            'photo' => $data['photo'] ?? null,
            'status' => 'Menunggu',
        ]);

        // Kode laporan, contoh: CC-00012
        $report->update(['code' => 'CC-' . str_pad((string) $report->id, 5, '0', STR_PAD_LEFT)]);

        return response()->json([
            'success' => true,
            'message' => 'Laporan berhasil dikirim!',
            'report' => $report->load('user:id,name,email'),
        ], 201);
    }

    // Menampilkan laporan milik masyarakat yang login
    public function mine(Request $request)
    {
        $reports = Report::with('user:id,name,email')
            ->where('user_id', $request->user()->id)
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'reports' => $reports,
        ]);
    }
}