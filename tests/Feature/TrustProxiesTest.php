<?php

test('trusted proxy headers preserve custom docker port 8001 on redirects', function () {
    $response = $this->withServerVariables([
        'REMOTE_ADDR' => '172.18.0.5',
        'SERVER_PORT' => 80,
        'HTTP_HOST' => 'localhost:8001',
        'HTTP_X_FORWARDED_HOST' => 'localhost:8001',
        'HTTP_X_FORWARDED_PROTO' => 'http',
    ])->get('/admin/dashboard');

    $response->assertRedirect('http://localhost:8001/login');
});

test('trusted proxy headers enforce https scheme and host behind a tunnel', function () {
    $response = $this->withServerVariables([
        'REMOTE_ADDR' => '172.18.0.5',
        'SERVER_PORT' => 80,
        'HTTP_HOST' => 'kossuma-demo.trycloudflare.com',
        'HTTP_X_FORWARDED_HOST' => 'kossuma-demo.trycloudflare.com',
        'HTTP_X_FORWARDED_PROTO' => 'https',
        'HTTP_X_FORWARDED_PORT' => '443',
    ])->get('/admin/dashboard');

    $response->assertRedirect('https://kossuma-demo.trycloudflare.com/login');
});

test('trusted proxy headers handle https tunnel even without forwarded port header', function () {
    $response = $this->withServerVariables([
        'REMOTE_ADDR' => '172.18.0.5',
        'SERVER_PORT' => 80,
        'HTTP_HOST' => 'kossuma-demo.ngrok-free.app',
        'HTTP_X_FORWARDED_HOST' => 'kossuma-demo.ngrok-free.app',
        'HTTP_X_FORWARDED_PROTO' => 'https',
    ])->get('/admin/dashboard');

    $response->assertRedirect('https://kossuma-demo.ngrok-free.app/login');
});
