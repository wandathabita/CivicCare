<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Report;
use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Akun demo
        User::create([
            'name' => 'Admin CivicCare',
            'email' => 'admin@civiccare.test',
            'password' => 'admin12345',
            'role' => 'admin',
        ]);

        $warga = [
            User::create(['name' => 'Siti Aminah', 'email' => 'siti@civiccare.test', 'password' => 'warga12345', 'role' => 'masyarakat']),
            User::create(['name' => 'Budi Santoso', 'email' => 'budi@civiccare.test', 'password' => 'warga12345', 'role' => 'masyarakat']),
            User::create(['name' => 'Rina Putri', 'email' => 'rina@civiccare.test', 'password' => 'warga12345', 'role' => 'masyarakat']),
        ];

        // Kategori
        foreach (Report::CATEGORIES as $name) {
            Category::firstOrCreate(['name' => $name]);
        }

        // Data contoh: [judul, kategori, wilayah, alamat, status, umur(hari), lama selesai(jam)]
        $contoh = [
            ['Lampu jalan padam 3 hari', 'Lampu jalan', 'Sukajadi', 'Jl. Sukajadi No. 45, depan minimarket', 'Menunggu', 0, null],
            ['Jalan berlubang dekat sekolah', 'Jalan rusak', 'Cicendo', 'Jl. Cicendo, depan SDN 3', 'Diproses', 1, null],
            ['Sampah menumpuk di pasar', 'Sampah', 'Andir', 'Pasar Andir blok C', 'Diverifikasi', 1, null],
            ['Saluran air tersumbat', 'Banjir', 'Coblong', 'Jl. Ir. H. Juanda dekat gang 2', 'Menunggu', 2, null],
            ['Keluarga lansia butuh bantuan sembako', 'Bantuan sosial', 'Bandung Wetan', 'RW 04, Jl. Cihapit', 'Diproses', 3, null],
            ['Lampu taman mati', 'Lampu jalan', 'Bandung Wetan', 'Taman Lansia', 'Selesai', 6, 20],
            ['Aspal retak parah', 'Jalan rusak', 'Sukajadi', 'Jl. Setiabudi km 2', 'Selesai', 9, 48],
            ['Genangan air setelah hujan', 'Banjir', 'Andir', 'Jl. Rajawali Barat', 'Selesai', 12, 30],
            ['Tempat sampah rusak', 'Sampah', 'Coblong', 'Jl. Dago atas', 'Selesai', 20, 12],
            ['Bantuan alat sekolah anak yatim', 'Bantuan sosial', 'Cicendo', 'Panti asuhan Kasih, Jl. Pasirkaliki', 'Diverifikasi', 4, null],
            ['Pohon tumbang menutup jalan', 'Lainnya', 'Coblong', 'Jl. Tubagus Ismail', 'Selesai', 2, 5],
            ['Lampu lalu lintas mati', 'Lampu jalan', 'Cicendo', 'Perempatan Pasteur', 'Menunggu', 0, null],
        ];

        foreach ($contoh as $i => [$title, $cat, $area, $addr, $status, $days, $hours]) {
            $created = now()->subDays($days)->subHours(rand(0, 5));

            $r = new Report();
            $r->forceFill([
                'user_id' => $warga[$i % 3]->id,
                'title' => $title,
                'category' => $cat,
                'area' => $area,
                'address' => $addr,
                'description' => $title . '. Mohon segera ditindaklanjuti oleh pihak terkait.',
                'status' => $status,
                'admin_note' => $status === 'Menunggu' ? null : 'Laporan sudah kami terima dan diteruskan ke dinas terkait.',
                'resolved_at' => $hours ? $created->copy()->addHours($hours) : null,
                'created_at' => $created,
                'updated_at' => $created,
            ])->save();

            $r->update(['code' => 'CC-' . str_pad((string) $r->id, 5, '0', STR_PAD_LEFT)]);
        }
    }
}