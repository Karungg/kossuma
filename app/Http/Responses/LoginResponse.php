<?php

namespace App\Http\Responses;

use Illuminate\Http\Request;
use Laravel\Fortify\Contracts\LoginResponse as LoginResponseContract;
use Laravel\Fortify\Contracts\TwoFactorLoginResponse as TwoFactorLoginResponseContract;
use Symfony\Component\HttpFoundation\Response;

class LoginResponse implements LoginResponseContract, TwoFactorLoginResponseContract
{
    public function toResponse($request): Response
    {
        return redirect()->intended($this->redirectPath($request));
    }

    protected function redirectPath(Request $request): string
    {
        if ($request->user()?->hasRole('Admin')) {
            return route('dashboard', absolute: false);
        }

        return route('home', absolute: false);
    }
}
