<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Hsreal;

class MyController extends Controller
{
    public function store(Request $request)
    {
        // Validate incoming request data
        $validatedData = $request->validate([
            'name' => 'required|string|max:255',
            'score' => 'required|integer',
        ]);

        // Create a new Hsreal using the validated data
        $hsreal = Hsreal::create([
            'name' => $validatedData['name'],
            'score' => $validatedData['score'],
        ]);

        // Return only the created hsreal object
        return response()->json($hsreal);
    }

    public function getAllData()
    {
        $allData = Hsreal::all();
        return response()->json($allData);
    }

    public function getLeaderboard()
    {
        $leaderboard = Hsreal::orderBy('score', 'desc')
        ->take(10)
            ->get(['name', 'score']);
        return response()->json($leaderboard);
    }
}
