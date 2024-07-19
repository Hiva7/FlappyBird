<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\MyController;

Route::get('/', function () {
    return view('index');
});

Route::post('/store-score', [MyController::class, 'store']);
Route::get('/hsreals/all', [MyController::class, 'getAllData']);
Route::get('/get-leaderboard', [MyController::class, 'getLeaderboard']);