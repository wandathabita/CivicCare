<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Report;
use App\Models\User;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    private const AREAS = ['Sukajadi', 'Cicendo', 'Coblong', 'Andir', 'Bandung Wetan'];
    private const STATUSES = ['Menunggu', 'Diverifikasi', 'Diproses', 'Selesai'];

    public function summary(Request $request)
    {
        $range = (int) $request->query('range', 7) === 30 ? 30 : 7;
        $now = now();
        $all = Report::select('id', 'status', 'area', 'created_at', 'resolved_at')->get();

        $total = $all->count();
        $proses = $all->whereIn('status', ['Diverifikasi', 'Diproses'])->count();

        $monthStart = $now->copy()->startOfMonth();
        $lastStart = $monthStart->copy()->subMonth();

        $selesaiBulan = $all->filter(fn ($r) => $r->resolved_at && $r->resolved_at->gte($monthStart))->count();
        $selesaiLalu = $all->filter(fn ($r) => $r->resolved_at
            && $r->resolved_at->gte($lastStart) && $r->resolved_at->lt($monthStart))->count();

        $resolved = $all->filter(fn ($r) => $r->resolved_at);
        $avgMinutes = $resolved->count()
            ? (int) round($resolved->avg(fn ($r) => abs($r->created_at->diffInMinutes($r->resolved_at))))
            : null;

        $labels = $masuk = $selesai = [];
        for ($i = $range - 1; $i >= 0; $i--) {
            $d = $now->copy()->subDays($i);
            $labels[] = $range === 7 ? $d->locale('id')->isoFormat('ddd') : $d->format('j/n');
            $masuk[] = $all->filter(fn ($r) => $r->created_at->isSameDay($d))->count();
            $selesai[] = $all->filter(fn ($r) => $r->resolved_at && $r->resolved_at->isSameDay($d))->count();
        }

        $regions = $all->groupBy('area')
            ->map(fn ($g, $area) => ['area' => $area, 'count' => $g->count()])
            ->sortByDesc('count')->take(3)->values();

        $latest = Report::with('user:id,name')->latest()->take(5)->get()->makeHidden('photo');

        return response()->json([
            'stats' => [
                'total' => $total,
                'new_week' => $all->filter(fn ($r) => $r->created_at->gte($now->copy()->subDays(7)))->count(),
                'proses' => $proses,
                'proses_pct' => $total ? round($proses / $total * 100, 1) : 0,
                'selesai_bulan' => $selesaiBulan,
                'selesai_change' => $selesaiLalu ? (int) round(($selesaiBulan - $selesaiLalu) / $selesaiLalu * 100) : null,
                'avg_minutes' => $avgMinutes,
                'resolved_count' => $resolved->count(),
            ],
            'trend' => ['labels' => $labels, 'masuk' => $masuk, 'selesai' => $selesai],
            'regions' => $regions,
            'latest' => $latest,
        ]);
    }

    public function reports(Request $request)
    {
        $query = Report::with('user:id,name,email')->latest();

        if ($s = $request->query('status')) {
            $query->where('status', $s);
        }
        if ($a = $request->query('area')) {
            $query->where('area', $a);
        }
        if ($t = mb_strtolower(trim((string) $request->query('q', '')))) {
            $query->where(function ($w) use ($t) {
                $w->whereRaw('LOWER(title) like ?', ["%$t%"])
                  ->orWhereRaw('LOWER(code) like ?', ["%$t%"])
                  ->orWhereRaw('LOWER(address) like ?', ["%$t%"]);
            });
        }

        return response()->json([
            'reports' => $query->limit(300)->get()->makeHidden('photo'),
        ]);
    }

    public function show($id)
    {
        return response()->json([
        'report' => Report::with('user:id,name,email', 'volunteers.user:id,name,email')->findOrFail($id), 
        ]);
    }

    public function updateStatus(Request $request, $id)
    {
                $data = $request->validate([
            'status' => ['required', 'in:' . implode(',', self::STATUSES)],
            'admin_note' => ['nullable', 'string', 'max:1000'],
            'target_amount' => ['nullable', 'integer', 'min:0', 'max:1000000000'],
        ]);

        $report = Report::findOrFail($id);
        $report->status = $data['status'];
        $report->admin_note = $data['admin_note'] ?? null;

        // Target dana hanya dipakai untuk kategori "Bantuan sosial"
        if ($report->category === 'Bantuan sosial' && array_key_exists('target_amount', $data)) {
            $report->target_amount = $data['target_amount'] ?: null;
        }
        
        if ($data['status'] === 'Selesai') {
            $report->resolved_at = $report->resolved_at ?? now();
        } else {
            $report->resolved_at = null;
        }

        $report->save();

        return response()->json([
            'success' => true,
            'report' => $report->load('user:id,name,email'),
        ]);
    }

    public function areas()
    {
        $grouped = Report::select('area', 'status')->get()->groupBy('area');
        $names = array_unique(array_merge(self::AREAS, $grouped->keys()->all()));

        $areas = collect($names)->map(function ($name) use ($grouped) {
            $g = $grouped->get($name, collect());
            return [
                'area' => $name,
                'total' => $g->count(),
                'menunggu' => $g->where('status', 'Menunggu')->count(),
                'diverifikasi' => $g->where('status', 'Diverifikasi')->count(),
                'diproses' => $g->where('status', 'Diproses')->count(),
                'selesai' => $g->where('status', 'Selesai')->count(),
            ];
        })->sortByDesc('total')->values();

        return response()->json(['areas' => $areas]);
    }

    public function users()
    {
        return response()->json([
            'users' => User::withCount('reports')->latest()
                ->get(['id', 'name', 'email', 'role', 'created_at']),
        ]);
    }
}