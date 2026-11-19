<?php

use App\Models\Role;
use App\Models\User;

test('guests are redirected to the login page', function () {
    $response = $this->get(route('dashboard'));
    $response->assertRedirect(route('login'));
});

test('admin users can visit the dashboard', function () {
    $role = Role::firstOrCreate(['name' => 'Admin']);
    $user = User::factory()->create();
    $user->assignRole($role);

    $this->actingAs($user);

    $response = $this->get(route('dashboard'));
    $response->assertOk();
});

test('customer users cannot visit the dashboard', function () {
    $role = Role::firstOrCreate(['name' => 'Customer']);
    $user = User::factory()->create();
    $user->assignRole($role);

    $this->actingAs($user);

    $response = $this->get(route('dashboard'));
    $response->assertForbidden();
});
