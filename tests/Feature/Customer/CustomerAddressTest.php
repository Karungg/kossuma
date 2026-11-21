<?php

use App\Models\User;
use App\Models\UserAddress;
use Inertia\Testing\AssertableInertia as Assert;

test('customer can create addresses, switch primary atomically, update, and delete with primary fallback', function () {
    $customer = User::factory()->create();
    $this->actingAs($customer);

    $this->post(route('customer.settings.addresses.store'), [
        'label' => 'Rumah',
        'recipient_name' => 'Siti Aminah',
        'phone' => '081288441122',
        'full_address' => 'Jl. Cimanggu Permai Blok B2 No. 14',
        'district' => 'Tanah Sareal',
        'city' => 'Kota Bogor, Jawa Barat',
        'postal_code' => '16164',
        'courier_note' => 'Pagar hijau',
        'is_primary' => false,
    ])->assertRedirect(route('customer.settings.index', ['tab' => 'addresses']));

    $firstAddress = $customer->addresses()->firstOrFail();
    expect($firstAddress->is_primary)->toBeTrue();

    $this->post(route('customer.settings.addresses.store'), [
        'label' => 'Kantor',
        'recipient_name' => 'Siti Aminah',
        'phone' => '081288441122',
        'full_address' => 'Jl. Raya Pajajaran No. 45',
        'district' => 'Bogor Tengah',
        'city' => 'Kota Bogor, Jawa Barat',
        'postal_code' => '16143',
        'is_primary' => false,
    ])->assertRedirect(route('customer.settings.index', ['tab' => 'addresses']));

    $secondAddress = $customer->addresses()->where('label', 'Kantor')->firstOrFail();
    expect($secondAddress->is_primary)->toBeFalse();

    $this->patch(route('customer.settings.addresses.primary', $secondAddress))
        ->assertRedirect(route('customer.settings.index', ['tab' => 'addresses']));

    expect($firstAddress->fresh()->is_primary)->toBeFalse();
    expect($secondAddress->fresh()->is_primary)->toBeTrue();

    $this->patch(route('customer.settings.addresses.update', $secondAddress), [
        'label' => 'Kantor Utama',
        'recipient_name' => 'Siti Aminah',
        'phone' => '081288441122',
        'full_address' => 'Jl. Raya Pajajaran No. 45, Gedung A',
        'district' => 'Bogor Tengah',
        'city' => 'Kota Bogor, Jawa Barat',
        'postal_code' => '16143',
        'is_primary' => true,
    ])->assertRedirect(route('customer.settings.index', ['tab' => 'addresses']));

    expect($secondAddress->fresh()->label)->toBe('Kantor Utama');

    $this->get(route('checkout'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('customer/checkout/index')
            ->has('addresses', 2)
            ->where('addresses.0.label', 'Kantor Utama')
            ->where('addresses.0.isPrimary', true));

    $this->delete(route('customer.settings.addresses.destroy', $secondAddress))
        ->assertRedirect(route('customer.settings.index', ['tab' => 'addresses']));

    expect($customer->addresses()->count())->toBe(1);
    expect($firstAddress->fresh()->is_primary)->toBeTrue();
});

test('customer cannot update, delete, or set primary another users address', function () {
    $owner = User::factory()->create();
    $intruder = User::factory()->create();
    $address = UserAddress::factory()->primary()->create(['user_id' => $owner->id]);

    $this->actingAs($intruder);

    $this->patch(route('customer.settings.addresses.primary', $address))
        ->assertForbidden();

    $this->patch(route('customer.settings.addresses.update', $address), [
        'label' => 'Hacked',
        'recipient_name' => 'Intruder',
        'phone' => '081200000000',
        'full_address' => 'Jl. Tidak Sah No. 1',
        'district' => 'Bogor Barat',
        'city' => 'Kota Bogor',
    ])->assertForbidden();

    $this->delete(route('customer.settings.addresses.destroy', $address))
        ->assertForbidden();

    expect($address->fresh()->label)->not->toBe('Hacked');
});
