<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Report;
use Illuminate\Http\Request;

class CaseController extends Controller
{
    // Kasus bantuan = laporan "Bantuan sosial" yang sudah diverifikasi dan punya target dana
    private function cases()
    {
        return Report::query()
            ->where('category', 'Bantuan sosial')
            ->where('target_amount', '>', 0)
            ->whereIn('status', ['Diverifikasi', 'Diproses', 'Selesai'])
            ->withSum('donations', 'amount')
            ->withCount(['donations', 'volunteers']);
    }

    private function format(Report $r): array
    {
        return [
            'id' => $r->id,
            'code' => $r->code,
            'title' => $r->title,
            'area' => $r->area,
            'description' => $r->description,
            'status' => $r->status,
            'target' => (int) $r->target_amount,
            'collected' => (int) ($r->donations_sum_amount ?? 0),
            'donors' => (int) ($r->donations_count ?? 0),
            'volunteers' => (int) ($r->volunteers_count ?? 0),
            'created_at' => $r->created_at,
        ];
    }

    public function index()
    {
        return response()->json([
            'cases' => $this->cases()->latest()->get()->map(fn ($r) => $this->format($r))->values(),
        ]);
    }

    public function show(Request $request, $id)
    {
        $report = $this->cases()->findOrFail($id);

        $donations = $report->donations()
            ->with('user:id,name')
            ->latest()
            ->take(20)
            ->get()
            ->map(fn ($d) => [
                'id' => $d->id,
                'name' => $d->user?->name ?? 'Anonim',
                'amount' => (int) $d->amount,
                'message' => $d->message,
                'created_at' => $d->created_at,
            ]);

        $volunteers = $report->volunteers()
            ->with('user:id,name')
            ->latest()
            ->take(30)
            ->get()
            ->map(fn ($v) => [
                'id' => $v->id,
                'name' => $v->user?->name ?? 'Relawan',
                'created_at' => $v->created_at,
            ]);

        return response()->json([
            'case' => $this->format($report),
            'donations' => $donations,
            'volunteers' => $volunteers,
            'joined' => $report->volunteers()->where('user_id', $request->user()->id)->exists(),
        ]);
    }

    // Donasi SIMULASI (tidak ada pembayaran sungguhan)
    public function donate(Request $request, $id)
    {
        $data = $request->validate([
            'amount' => ['required', 'integer', 'min:1000', 'max:50000000'],
            'message' => ['nullable', 'string', 'max:200'],
        ]);

        $report = $this->cases()->findOrFail($id);

        if ($report->status === 'Selesai') {
            return response()->json([
                'success' => false,
                'message' => 'Kasus ini sudah selesai ditangani.',
            ], 422);
        }

        $report->donations()->create([
            'user_id' => $request->user()->id,
            'amount' => $data['amount'],
            'message' => $data['message'] ?? null,
        ]);

        $response = $this->show($request, $id);
        $response->setStatusCode(201);

        return $response;
    }

    // Daftar / batal jadi relawan (tombol yang sama: kalau sudah daftar, jadi batal)
    public function volunteer(Request $request, $id)
    {
        $report = $this->cases()->findOrFail($id);
        $existing = $report->volunteers()->where('user_id', $request->user()->id)->first();

        if ($existing) {
            $existing->delete();
        } else {
            if ($report->status === 'Selesai') {
                return response()->json([
                    'success' => false,
                    'message' => 'Kasus ini sudah selesai ditangani.',
                ], 422);
            }

            $report->volunteers()->create(['user_id' => $request->user()->id]);
        }

        return $this->show($request, $id);
    }
}