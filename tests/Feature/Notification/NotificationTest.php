<?php

use App\Contracts\Notification\NotificationServiceInterface;
use App\Enums\Notification\NotificationCategory;
use App\Enums\Notification\NotificationLevel;
use App\Models\Role;
use App\Models\User;
use App\Notifications\GeneralAppNotification;
use Inertia\Testing\AssertableInertia as Assert;

test('guests cannot access notification endpoints', function () {
    $this->getJson(route('notifications.index'))->assertUnauthorized();
    $this->patchJson(route('notifications.read-all'))->assertUnauthorized();
    $this->deleteJson(route('notifications.destroy-read'))->assertUnauthorized();
    $this->patchJson(route('notifications.read', 'nonexistent-id'))->assertUnauthorized();
    $this->deleteJson(route('notifications.destroy', 'nonexistent-id'))->assertUnauthorized();
});

test('authenticated user sees accurate unread notification count in shared inertia props', function () {
    $adminRole = Role::firstOrCreate(['name' => 'Admin']);
    $user = User::factory()->create();
    $user->assignRole($adminRole);

    $user->notify(new GeneralAppNotification(
        notificationTitle: 'Pesanan Baru',
        notificationMessage: 'Pesanan #KSM-001 menunggu konfirmasi.',
        notificationCategory: NotificationCategory::Order,
        notificationLevel: NotificationLevel::Info,
        notificationActionUrl: '/dashboard',
        notificationActionLabel: 'Lihat pesanan',
    ));

    $user->notify(new GeneralAppNotification(
        notificationTitle: 'Kategori Ditambahkan',
        notificationMessage: 'Kategori Frozen Food berhasil dibuat.',
        notificationCategory: NotificationCategory::Category,
        notificationLevel: NotificationLevel::Success,
    ));

    $this->actingAs($user)
        ->get(route('dashboard'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('notifications.unread_count', 2));
});

test('user only receives own notifications with status, category filters, and pagination', function () {
    $user = User::factory()->create();
    $otherUser = User::factory()->create();

    $otherUser->notify(new GeneralAppNotification(
        notificationTitle: 'Notifikasi Orang Lain',
        notificationMessage: 'Tidak boleh tampil.',
        notificationCategory: NotificationCategory::Order,
    ));

    $user->notify(new GeneralAppNotification(
        notificationTitle: 'Pesanan Baru',
        notificationMessage: 'Pesanan masuk.',
        notificationCategory: NotificationCategory::Order,
        notificationLevel: NotificationLevel::Success,
    ));

    $user->notify(new GeneralAppNotification(
        notificationTitle: 'Stok Menipis',
        notificationMessage: 'Stok Risol Mayo tinggal 3.',
        notificationCategory: NotificationCategory::Product,
        notificationLevel: NotificationLevel::Warning,
    ));

    $firstNotification = $user->notifications()->latest()->first();
    $firstNotification?->markAsRead();

    $this->actingAs($user)
        ->getJson(route('notifications.index'))
        ->assertOk()
        ->assertJsonPath('meta.total', 2)
        ->assertJsonPath('unread_count', 1)
        ->assertJsonPath('read_count', 1)
        ->assertJsonCount(2, 'data');

    $this->actingAs($user)
        ->getJson(route('notifications.index', ['status' => 'unread']))
        ->assertOk()
        ->assertJsonPath('meta.total', 1)
        ->assertJsonCount(1, 'data');

    $this->actingAs($user)
        ->getJson(route('notifications.index', ['category' => 'order']))
        ->assertOk()
        ->assertJsonPath('meta.total', 1)
        ->assertJsonPath('data.0.category', 'order')
        ->assertJsonPath('data.0.category_label', 'Pesanan');
});

test('user can mark single or all notifications as read without affecting other users', function () {
    $user = User::factory()->create();
    $otherUser = User::factory()->create();

    $user->notify(new GeneralAppNotification('Notif 1', 'Pesan 1'));
    $user->notify(new GeneralAppNotification('Notif 2', 'Pesan 2'));
    $otherUser->notify(new GeneralAppNotification('Notif Lain', 'Pesan Lain'));

    $userNotification = $user->notifications()->firstOrFail();
    $otherNotification = $otherUser->notifications()->firstOrFail();

    $this->actingAs($user)
        ->patchJson(route('notifications.read', $otherNotification->id))
        ->assertNotFound();

    $this->actingAs($user)
        ->patchJson(route('notifications.read', $userNotification->id))
        ->assertOk()
        ->assertJsonPath('unread_count', 1)
        ->assertJsonPath('read_count', 1);

    expect($userNotification->fresh()?->read_at)->not->toBeNull();

    $this->actingAs($user)
        ->patchJson(route('notifications.read-all'))
        ->assertOk()
        ->assertJsonPath('unread_count', 0)
        ->assertJsonPath('read_count', 2);

    expect($otherUser->unreadNotifications()->count())->toBe(1);
});

test('user can delete single notification and clear read notifications safely', function () {
    $user = User::factory()->create();
    $otherUser = User::factory()->create();

    $user->notify(new GeneralAppNotification('Notif Unread', 'Masih belum dibaca'));
    $user->notify(new GeneralAppNotification('Notif Read 1', 'Sudah dibaca 1'));
    $user->notify(new GeneralAppNotification('Notif Read 2', 'Sudah dibaca 2'));
    $otherUser->notify(new GeneralAppNotification('Notif Orang Lain', 'Jangan terhapus'));

    $notifications = $user->notifications()->get();
    $notifications[1]->markAsRead();
    $notifications[2]->markAsRead();

    $otherNotification = $otherUser->notifications()->firstOrFail();

    $this->actingAs($user)
        ->deleteJson(route('notifications.destroy', $otherNotification->id))
        ->assertNotFound();

    $this->actingAs($user)
        ->deleteJson(route('notifications.destroy', $notifications[1]->id))
        ->assertOk()
        ->assertJsonPath('unread_count', 1)
        ->assertJsonPath('read_count', 1);

    $this->actingAs($user)
        ->deleteJson(route('notifications.destroy-read'))
        ->assertOk()
        ->assertJsonPath('deleted', 1)
        ->assertJsonPath('unread_count', 1)
        ->assertJsonPath('read_count', 0);

    expect($user->notifications()->count())->toBe(1);
    expect($otherUser->notifications()->count())->toBe(1);
});

test('notification service can dispatch notifications to a single user or all users with a specific role', function () {
    $adminRole = Role::firstOrCreate(['name' => 'Admin']);
    $customerRole = Role::firstOrCreate(['name' => 'Customer']);

    $adminOne = User::factory()->create();
    $adminOne->assignRole($adminRole);

    $adminTwo = User::factory()->create();
    $adminTwo->assignRole($adminRole);

    $customer = User::factory()->create();
    $customer->assignRole($customerRole);

    /** @var NotificationServiceInterface $service */
    $service = app(NotificationServiceInterface::class);

    $service->notifyRole('Admin', new GeneralAppNotification(
        notificationTitle: 'Produk Baru Menunggu Review',
        notificationMessage: 'UMKM Dapur Bogor menambahkan produk baru.',
        notificationCategory: NotificationCategory::Product,
        notificationLevel: NotificationLevel::Info,
    ));

    $service->notifyUser($customer, new GeneralAppNotification(
        notificationTitle: 'Pesanan Dikirim',
        notificationMessage: 'Pesanan Anda sedang dalam perjalanan.',
        notificationCategory: NotificationCategory::Order,
        notificationLevel: NotificationLevel::Success,
    ));

    expect($adminOne->unreadNotifications()->count())->toBe(1);
    expect($adminTwo->unreadNotifications()->count())->toBe(1);
    expect($customer->unreadNotifications()->count())->toBe(1);
    expect($customer->notifications()->first()?->data['category'])->toBe('order');
});
