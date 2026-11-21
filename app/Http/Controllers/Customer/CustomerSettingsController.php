<?php

namespace App\Http\Controllers\Customer;

use App\Contracts\Customer\CustomerAddressServiceInterface;
use App\Contracts\Customer\CustomerProfileServiceInterface;
use App\Http\Controllers\Controller;
use App\Http\Requests\Customer\UpdateCustomerPasswordRequest;
use App\Http\Requests\Customer\UpdateCustomerProfileRequest;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Inertia\Inertia;
use Inertia\Response;

class CustomerSettingsController extends Controller
{
    public function __construct(
        public readonly CustomerProfileServiceInterface $profileService,
        public readonly CustomerAddressServiceInterface $addressService,
    ) {}

    public function index(Request $request): Response
    {
        $user = $this->requireUser($request);
        $rawTab = $request->query('tab');
        $activeTab = in_array($rawTab, ['profile', 'addresses', 'security'], true)
            ? (string) $rawTab
            : 'profile';

        return Inertia::render('customer/settings/index', [
            'activeTab' => $activeTab,
            'mustVerifyEmail' => true,
            'status' => $request->session()->get('status'),
            'profile' => [
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone ?? '',
                'avatarUrl' => $user->getAvatarUrl(),
                'emailVerifiedAt' => $user->email_verified_at?->toIso8601String(),
            ],
            'addresses' => $this->addressService->listFormattedForUser($user),
        ]);
    }

    public function updateProfile(UpdateCustomerProfileRequest $request): RedirectResponse
    {
        $user = $this->requireUser($request);
        $validated = $request->validated();
        $avatar = $request->file('avatar');

        $this->profileService->updateProfile(
            user: $user,
            data: [
                'name' => (string) $validated['name'],
                'email' => (string) $validated['email'],
                'phone' => isset($validated['phone']) ? (string) $validated['phone'] : null,
            ],
            avatar: $avatar instanceof UploadedFile ? $avatar : null,
        );

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Profil Anda berhasil diperbarui.',
        ]);

        return to_route('customer.settings.index', ['tab' => 'profile']);
    }

    public function destroyAvatar(Request $request): RedirectResponse
    {
        $user = $this->requireUser($request);
        $this->profileService->removeAvatar($user);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Foto profil berhasil dihapus.',
        ]);

        return to_route('customer.settings.index', ['tab' => 'profile']);
    }

    public function updatePassword(UpdateCustomerPasswordRequest $request): RedirectResponse
    {
        $user = $this->requireUser($request);
        $validated = $request->validated();

        $user->update([
            'password' => (string) $validated['password'],
        ]);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Kata sandi akun Anda berhasil diperbarui.',
        ]);

        return to_route('customer.settings.index', ['tab' => 'security']);
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
