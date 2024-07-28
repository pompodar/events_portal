<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\EventController;

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

Route::get('/', [EventController::class, 'index'])->name('events');

Route::get('/event/{id}', [EventController::class, 'show'])->name('event.show');

Route::get('/saved-events', [EventController::class, 'savedEvents'])->name('events.saved');

Route::get('/events-to-save', function () {
    return Inertia::render('EventsToSave');
})->middleware(['auth', 'verified'])->name('events.to_save');

Route::get('/events-to-save-ukr', function () {
    return Inertia::render('EventsToSaveUkr');
})->middleware(['auth', 'verified'])->name('events.to_save_ukr');

Route::get('/events-to-save-nyt', function () {
    return Inertia::render('EventsToSaveNYT');
})->middleware(['auth', 'verified'])->name('events.to_save_nyt');

Route::post('/events/save', [EventController::class, 'save'])->name('events.save');

Route::delete('/events/{id}', [EventController::class, 'destroy']);

require __DIR__.'/auth.php';
