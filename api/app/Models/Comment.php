<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Comment extends Model
{
    use HasFactory;

    protected $guarded = [];

    protected $appends = ['time_since'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the human-readable time since the comment was posted.
     */
    protected function timeSince(): Attribute
    {
        return Attribute::make(
            get: fn (mixed $value, array $attributes) => Carbon::parse($attributes['created_at'])->diffForHumans(),
        );
    }
}
