<?php

namespace App\Http\Controllers;

use App\Models\Comment;
use Illuminate\Contracts\Database\Query\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ShowCommentsController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(Request $request): JsonResponse
    {
        $comments = Comment::when($request->get("id"), function (
            Builder $query,
            string $id,
        ) {
            $query->where("zillow_id", $id);
        })
            ->with(['user:id,name'])
            ->latest()
            ->get();

        return response()->json($comments);
    }
}
