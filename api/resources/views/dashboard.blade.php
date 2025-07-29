<x-app-layout>
    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-800 leading-tight">
            {{ __('Dashboard') }}
        </h2>
    </x-slot>

    <div class="py-12">
        <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <div class="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                <div class="p-6 text-gray-900">
                    Paste the following token back on Zillow to start contributing comments:
                </div>
                <div class="px-6 pb-6">
                    <code class="p-2 text-gray-600 bg-gray-100 rounded">{{ $token }}</code>
                </div>
                <div class="px-6 pb-6">
                    <h2 class="text-xl font-bold mb-2">Your comments</h2>
                    @foreach($comments as $comment)
                        <div class="border border-gray-100 rounded mb-4 px-6 py-3">
                            <p>{{ $comment->body }}</p>
                            <div class="flex gap-4 text-sm items-center">
                                <div class="text-gray-600">{{ $comment->time_since }}</div>
                                <a class="block text-blue-600 underline" href="https://zillow.com/homedetails/1234-Test-Drive/{{ $comment->zillow_id }}_zpid" target="_blank">Open Zillow link</a>
                            </div>
                        </div>
                    @endforeach
                </div>
            </div>
        </div>
    </div>
</x-app-layout>
