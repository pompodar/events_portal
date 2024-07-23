<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Event;
use Inertia\Inertia;

class EventController extends Controller
{
    public function savedEvents(Request $request)
    {
        // Retrieve filter and sorting parameters
        $dateFilter = $request->input('date', '');
        $orderBy = $request->input('orderBy', 'desc'); // Default to latest posts

        // Build the query
        $query = Event::query();

        if ($dateFilter) {
            $query->whereDate('publicationDate', $dateFilter);
        }

        $events = $query->orderBy('publicationDate', $orderBy)
                        ->paginate(10, ['*'], 'page', $request->input('page', 1));

        return Inertia::render('SavedEvents', [
            'events' => $events,
            'filters' => [
                'date' => $dateFilter,
                'orderBy' => $orderBy,
            ],
        ]);
    }

    public function save(Request $request)
    {
        $data = $request->validate([
            'url' => 'required|string|unique:events,url',
            'title' => 'required|string',
            'body' => 'required',
            'thumbnailUrl' => 'nullable|url',
            'publicationDate' => 'required|date',
        ]);

        Event::create($data);

        return response()->json(['message' => 'Event saved successfully!']);
    }

    public function destroy(Request $request, $id)
    {
        $event = Event::find($id);

        if ($event) {
            $event->delete();
            return response()->json(['message' => 'Event deleted successfully.']);
        } else {
            return response()->json(['message' => 'Event not found.'], 404);
        }
    }
}
