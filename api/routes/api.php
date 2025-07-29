<?php

use App\Http\Controllers\SaveCommentController;
use App\Http\Controllers\ShowCommentsController;
use Illuminate\Support\Facades\Route;

Route::get("/", fn() => "We're up 👍");

Route::get("/comments", ShowCommentsController::class);

// Route::post("/comments", SaveCommentController::class);

Route::post("/comments", SaveCommentController::class)->middleware('auth:sanctum');