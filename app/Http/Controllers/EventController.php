<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Event;
use Inertia\Inertia;
use Carbon\Carbon;

class EventController extends Controller
{
    public function savedEvents(Request $request)
    {
        $query = Event::query();

        if ($request->has('date') && $request->date) {
            $date = Carbon::parse($request->date);
            $query->whereDate('publicationDate', '=', $date->toDateString());
        }

        if ($request->has('orderBy')) {
            $query->orderBy('publicationDate', $request->orderBy);
        } else {
            $query->orderBy('publicationDate', 'desc');
        }

        if ($request->has('language')) {
            $query->where('language', $request->language);
        }

        if ($request->has('source')) {
            $query->where('source', $request->source);
        }

        $events = $query->paginate(10);

        return inertia('SavedEvents', [
            'events' => $events,
            'filters' => [
                'date' => $request->query('date'),
                'orderBy' => $request->query('orderBy', 'desc'),
                'language' => $request->query('language'),
                'source' => $request->query('source')
            ]
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
            'language' => 'sometimes|string',
            'source' => 'sometimes|string',
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
