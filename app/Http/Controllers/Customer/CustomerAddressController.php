<?php

namespace App\Http\Controllers\Customer;

use App\Contracts\Customer\CustomerAddressServiceInterface;
use App\Http\Controllers\Controller;
use App\Http\Requests\Customer\StoreUserAddressRequest;
use App\Http\Requests\Customer\UpdateUserAddressRequest;
use App\Models\User;
use App\Models\UserAddress;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;

class CustomerAddressController extends Controller
{
    public function __construct(
        public readonly CustomerAddressServiceInterface $addressService,
    ) {}

    public function store(StoreUserAddressRequest $request): RedirectResponse
    {
        $user = $this->requireUser($request);
        $validated = $request->validated();

        $this->addressService->create($user, [
            'label' => (string) $validated['label'],
            'recipient_name' => (string) $validated['recipient_name'],
            'phone' => (string) $validated['phone'],
            'full_address' => (string) $validated['full_address'],
            'district' => (string) $validated['district'],
            'city' => (string) $validated['city'],
            'postal_code' => isset($validated['postal_code']) ? (string) $validated['postal_code'] : null,
            'courier_note' => isset($validated['courier_note']) ? (string) $validated['courier_note'] : null,
            'is_primary' => (bool) ($validated['is_primary'] ?? false),
        ]);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Alamat pengiriman baru berhasil ditambahkan.',
        ]);

        return to_route('customer.settings.index', ['tab' => 'addresses']);
    }

    public function update(UpdateUserAddressRequest $request, UserAddress $address): RedirectResponse
    {
        $user = $this->requireUser($request);
        Gate::forUser($user)->authorize('update', $address);

        $validated = $request->validated();

        $this->addressService->update($user, $address, [
            'label' => (string) $validated['label'],
            'recipient_name' => (string) $validated['recipient_name'],
            'phone' => (string) $validated['phone'],
            'full_address' => (string) $validated['full_address'],
            'district' => (string) $validated['district'],
            'city' => (string) $validated['city'],
            'postal_code' => isset($validated['postal_code']) ? (string) $validated['postal_code'] : null,
            'courier_note' => isset($validated['courier_note']) ? (string) $validated['courier_note'] : null,
            'is_primary' => (bool) ($validated['is_primary'] ?? $address->is_primary),
        ]);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Alamat pengiriman berhasil diperbarui.',
        ]);

        return to_route('customer.settings.index', ['tab' => 'addresses']);
    }

    public function setPrimary(Request $request, UserAddress $address): RedirectResponse
    {
        $user = $this->requireUser($request);
        Gate::forUser($user)->authorize('setPrimary', $address);

        $this->addressService->setPrimary($user, $address);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => "Alamat \"{$address->label}\" ditetapkan sebagai alamat utama.",
        ]);

        return to_route('customer.settings.index', ['tab' => 'addresses']);
    }

    public function destroy(Request $request, UserAddress $address): RedirectResponse
    {
        $user = $this->requireUser($request);
        Gate::forUser($user)->authorize('delete', $address);

        $this->addressService->delete($user, $address);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Alamat pengiriman berhasil dihapus.',
        ]);

        return to_route('customer.settings.index', ['tab' => 'addresses']);
    }

    private function requireUser(Request $request): User
    {
        $user = $request->user();

        if (! $user instanceof User) {
            abort(401);
        }

        return $user;
    }
}
