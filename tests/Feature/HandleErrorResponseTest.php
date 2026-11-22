<?php

use App\Models\Role;
use App\Models\User;
use Illuminate\Support\Facades\Route;
use Inertia\Testing\AssertableInertia as Assert;

test('development and non-production errors render normally without inertia error page', function () {
    Route::get('/_test/error-500', function () {
        abort(500);
    });

    $this->get('/_test/not-found')->assertNotFound();
    $this->get('/_test/error-500')->assertStatus(500);
});

test('production mode renders friendly inertia error page for 404, 401, 403, and 500', function () {
    Route::get('/_test/error-401', function () {
        abort(401);
    });

    Route::get('/_test/error-500', function () {
        abort(500);
    });

    app()->detectEnvironment(fn () => 'production');

    $this->get('/_test/not-found')
        ->assertNotFound()
        ->assertInertia(fn (Assert $page) => $page
            ->component('errors/show')
            ->where('status', 404));

    $this->get('/_test/error-401')
        ->assertUnauthorized()
        ->assertInertia(fn (Assert $page) => $page
            ->component('errors/show')
            ->where('status', 401));

    $this->get('/_test/error-500')
        ->assertStatus(500)
        ->assertInertia(fn (Assert $page) => $page
            ->component('errors/show')
            ->where('status', 500));

    $customerRole = Role::firstOrCreate(['name' => 'Customer']);
    $customer = User::factory()->create();
    $customer->assignRole($customerRole);

    $this->actingAs($customer)
        ->get(route('admin.dashboard'))
        ->assertForbidden()
        ->assertInertia(fn (Assert $page) => $page
            ->component('errors/show')
            ->where('status', 403));
});

test('production mode preserves 422 validation errors', function () {
    Route::get('/_test/error-422', function () {
        return response('validation error', 422);
    });

    app()->detectEnvironment(fn () => 'production');

    $this->get('/_test/error-422')
        ->assertStatus(422)
        ->assertSee('validation error');

    $response = $this->withSession(['_token' => 'test-token'])
        ->from(route('login'))
        ->post(route('login.store'), [
            '_token' => 'test-token',
            'email' => '',
            'password' => '',
        ]);

    $response->assertRedirect(route('login'));
    $response->assertSessionHasErrors(['email', 'password']);
});
