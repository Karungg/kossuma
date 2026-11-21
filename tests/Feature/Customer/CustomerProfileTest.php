<?php

use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;

test('customer can view settings page and update profile details and avatar', function () {
    Storage::fake('public');

    $customer = User::factory()->create([
        'name' => 'Siti Aminah',
        'email' => 'siti@example.com',
        'phone' => null,
    ]);

    $this->actingAs($customer);

    $this->get(route('customer.settings.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('customer/settings/index')
            ->where('activeTab', 'profile')
            ->where('profile.name', 'Siti Aminah')
            ->where('profile.email', 'siti@example.com'));

    $avatar = UploadedFile::fake()->image('avatar.png', 200, 200);

    $this->patch(route('customer.settings.profile.update'), [
        'name' => 'Ibu Siti Aminah',
        'email' => 'siti@example.com',
        'phone' => '081288441122',
        'avatar' => $avatar,
    ])->assertRedirect(route('customer.settings.index', ['tab' => 'profile']));

    $customer->refresh();
    expect($customer->name)->toBe('Ibu Siti Aminah');
    expect($customer->phone)->toBe('081288441122');
    expect($customer->email_verified_at)->not->toBeNull();
    expect($customer->avatar_path)->not->toBeNull();

    $storedAvatarPath = (string) $customer->avatar_path;
    Storage::disk('public')->assertExists($storedAvatarPath);

    $this->delete(route('customer.settings.profile.avatar.destroy'))
        ->assertRedirect(route('customer.settings.index', ['tab' => 'profile']));

    $customer->refresh();
    expect($customer->avatar_path)->toBeNull();
    Storage::disk('public')->assertMissing($storedAvatarPath);
});

test('changing email resets email verification timestamp on customer profile', function () {
    $customer = User::factory()->create([
        'email' => 'lama@example.com',
        'email_verified_at' => now(),
    ]);

    $this->actingAs($customer)
        ->patch(route('customer.settings.profile.update'), [
            'name' => $customer->name,
            'email' => 'baru@example.com',
            'phone' => '081234567890',
        ])
        ->assertRedirect(route('customer.settings.index', ['tab' => 'profile']));

    $customer->refresh();
    expect($customer->email)->toBe('baru@example.com');
    expect($customer->email_verified_at)->toBeNull();
});

test('customer can update password with valid current password', function () {
    $customer = User::factory()->create([
        'password' => 'old-password',
    ]);

    $this->actingAs($customer);

    $this->from(route('customer.settings.index', ['tab' => 'security']))
        ->put(route('customer.settings.password.update'), [
            'current_password' => 'wrong-password',
            'password' => 'new-password-123',
            'password_confirmation' => 'new-password-123',
        ])
        ->assertSessionHasErrors('current_password');

    $this->from(route('customer.settings.index', ['tab' => 'security']))
        ->put(route('customer.settings.password.update'), [
            'current_password' => 'old-password',
            'password' => 'new-password-123',
            'password_confirmation' => 'new-password-123',
        ])
        ->assertRedirect(route('customer.settings.index', ['tab' => 'security']));

    $customer->refresh();
    expect(Hash::check('new-password-123', $customer->password))->toBeTrue();
});
