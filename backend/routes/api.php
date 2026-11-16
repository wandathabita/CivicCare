<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CategoryController;

// AUTHENTICATION
Route::prefix('auth')->group(function () {

    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);

    Route::middleware('auth:sanctum')->group(function () {

        Route::get('/me', [AuthController::class, 'me']);
        Route::post('/logout', [AuthController::class, 'logout']);

    });

});

// CATEGORIES
Route::get('/categories', [CategoryController::class, 'index']);
Route::post('/categories', [CategoryController::class, 'store']);
Route::get('/categories/{id}', [CategoryController::class, 'show']);
Route::put('/categories/{id}', [CategoryController::class, 'update']);
Route::delete('/categories/{id}', [CategoryController::class, 'destroy']);
