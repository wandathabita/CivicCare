
<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\AdminController;
use App\Http\Middleware\EnsureAdmin;

/*
|--------------------------------------------------------------------------
| AUTHENTICATION
|--------------------------------------------------------------------------
*/

Route::prefix('auth')->group(function () {

    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);

    Route::middleware('auth:sanctum')->group(function () {

        Route::get('/me', [AuthController::class, 'me']);
        Route::put('/profile', [AuthController::class, 'updateProfile']);
        Route::put('/password', [AuthController::class, 'updatePassword']);
        Route::post('/logout', [AuthController::class, 'logout']);

    });

});

/*
|--------------------------------------------------------------------------
| REPORTS - MASYARAKAT
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->group(function () {

    // Masyarakat
    Route::post('/reports', [ReportController::class, 'store']);
    Route::get('/reports/mine', [ReportController::class, 'mine']);

    /*
    |--------------------------------------------------------------------------
    | ADMIN
    |--------------------------------------------------------------------------
    */

    Route::middleware(EnsureAdmin::class)
        ->prefix('admin')
        ->group(function () {

            Route::get('/summary', [AdminController::class, 'summary']);

            Route::get('/reports', [AdminController::class, 'reports']);
            Route::get('/reports/{id}', [AdminController::class, 'show']);

            Route::patch(
                '/reports/{id}/status',
                [AdminController::class, 'updateStatus']
            );

            Route::get('/areas', [AdminController::class, 'areas']);
            Route::get('/users', [AdminController::class, 'users']);

        });

});

/*
|--------------------------------------------------------------------------
| CATEGORIES
|--------------------------------------------------------------------------
*/

// Menampilkan kategori
Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/categories/{id}', [CategoryController::class, 'show']);

// Mengelola kategori
Route::middleware(['auth:sanctum', EnsureAdmin::class])->group(function () {

    Route::post('/categories', [CategoryController::class, 'store']);
    Route::put('/categories/{id}', [CategoryController::class, 'update']);
    Route::delete('/categories/{id}', [CategoryController::class, 'destroy']);

});
