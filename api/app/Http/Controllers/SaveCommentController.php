<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class SaveCommentController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(Request $request)
    {
        $request->validate([
            'zillow_id' => 'required|string',
            'body' => 'required',
        ]);

        $comment = $request->user()->comments()->create(
            $request->only([
                'zillow_id',
                'body',
            ])
        );

        return $comment;
    }
}
