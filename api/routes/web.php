<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get("/", fn() => "Hello there 👋");

Route::get("/dashboard", function (Request $request) {
    $token = $request->user()->createToken("auth");
    $comments = $request->user()->comments()->latest()->get();

    return view("dashboard", [
        "token" => $token->plainTextToken,
        "comments" => $comments,
    ]);
})
    ->middleware(["auth", "verified"])
    ->name("dashboard");

Route::middleware("auth")->group(function () {
    Route::get("/profile", [ProfileController::class, "edit"])->name(
        "profile.edit",
    );
    Route::patch("/profile", [ProfileController::class, "update"])->name(
        "profile.update",
    );
    Route::delete("/profile", [ProfileController::class, "destroy"])->name(
        "profile.destroy",
    );
});

require __DIR__ . "/auth.php";
