<?php

namespace App\Services\Customer;

use App\Contracts\Customer\CustomerProfileServiceInterface;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class CustomerProfileService implements CustomerProfileServiceInterface
{
    public function updateProfile(User $user, array $data, ?UploadedFile $avatar = null): User
    {
        $oldAvatarPath = $user->avatar_path;

        $user->fill([
            'name' => trim($data['name']),
            'email' => trim($data['email']),
            'phone' => isset($data['phone']) && trim($data['phone']) !== ''
                ? trim($data['phone'])
                : null,
        ]);

        if ($user->isDirty('email')) {
            $user->email_verified_at = null;
        }

        if ($avatar instanceof UploadedFile) {
            $extension = strtolower($avatar->getClientOriginalExtension() ?: ($avatar->extension() ?: 'jpg'));
            $safeExt = preg_replace('/[^a-z0-9]/', '', $extension);
            $ext = is_string($safeExt) && $safeExt !== '' ? $safeExt : 'jpg';
            $filename = Str::uuid()->toString().'.'.$ext;
            $storedPath = $avatar->storeAs('avatars', $filename, 'public');

            if (is_string($storedPath) && $storedPath !== '') {
                $user->avatar_path = $storedPath;
            }
        }

        $user->save();

        if ($avatar instanceof UploadedFile && is_string($oldAvatarPath) && $oldAvatarPath !== '' && $oldAvatarPath !== $user->avatar_path) {
            $this->deleteStoredAvatar($oldAvatarPath);
        }

        return $user->fresh() ?? $user;
    }

    public function removeAvatar(User $user): User
    {
        $oldAvatarPath = $user->avatar_path;

        $user->avatar_path = null;
        $user->save();

        if (is_string($oldAvatarPath) && $oldAvatarPath !== '') {
            $this->deleteStoredAvatar($oldAvatarPath);
        }

        return $user->fresh() ?? $user;
    }

    private function deleteStoredAvatar(string $path): void
    {
        $normalized = ltrim(str_replace('\\', '/', trim($path)), '/');

        if ($normalized === '' || str_starts_with($normalized, 'assets/') || preg_match('/^https?:\/\//i', $normalized) === 1) {
            return;
        }

        $relativePath = str_starts_with($normalized, 'storage/')
            ? substr($normalized, strlen('storage/'))
            : $normalized;

        if ($relativePath !== '' && Storage::disk('public')->exists($relativePath)) {
            Storage::disk('public')->delete($relativePath);
        }
    }
}
