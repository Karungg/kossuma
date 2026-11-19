<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response;

class HandleErrorResponse
{
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        if (! app()->isProduction()) {
            return $response;
        }

        $status = $response->getStatusCode();

        if ($status < 400 || $status === 422) {
            return $response;
        }

        return Inertia::render('errors/show', [
            'status' => $status,
        ])->toResponse($request)->setStatusCode($status);
    }
}
