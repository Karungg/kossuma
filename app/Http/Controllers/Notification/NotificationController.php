<?php

namespace App\Http\Controllers\Notification;

use App\Contracts\Notification\NotificationServiceInterface;
use App\Http\Controllers\Controller;
use App\Http\Resources\Notification\NotificationResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function __construct(
        public readonly NotificationServiceInterface $notificationService,
    ) {}

    public function index(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $status = $request->string('status')->toString();
        $category = $request->string('category')->toString();

        $paginator = $this->notificationService->getPaginatedForUser(
            user: $user,
            status: $status !== '' ? $status : null,
            category: $category !== '' ? $category : null,
        );

        return response()->json([
            'data' => NotificationResource::collection($paginator->items())->resolve($request),
            'meta' => [
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
                'total' => $paginator->total(),
                'has_more' => $paginator->hasMorePages(),
            ],
            'unread_count' => $this->notificationService->getUnreadCount($user),
            'read_count' => $this->notificationService->getReadCount($user),
        ]);
    }

    public function markAsRead(Request $request, string $notification): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        if (! $this->notificationService->markAsRead($user, $notification)) {
            return response()->json([
                'message' => 'Notifikasi tidak ditemukan.',
            ], 404);
        }

        return response()->json([
            'unread_count' => $this->notificationService->getUnreadCount($user),
            'read_count' => $this->notificationService->getReadCount($user),
        ]);
    }

    public function markAllAsRead(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $updated = $this->notificationService->markAllAsRead($user);

        return response()->json([
            'updated' => $updated,
            'unread_count' => 0,
            'read_count' => $this->notificationService->getReadCount($user),
        ]);
    }

    public function destroy(Request $request, string $notification): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        if (! $this->notificationService->delete($user, $notification)) {
            return response()->json([
                'message' => 'Notifikasi tidak ditemukan.',
            ], 404);
        }

        return response()->json([
            'unread_count' => $this->notificationService->getUnreadCount($user),
            'read_count' => $this->notificationService->getReadCount($user),
        ]);
    }

    public function destroyRead(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $deleted = $this->notificationService->deleteRead($user);

        return response()->json([
            'deleted' => $deleted,
            'unread_count' => $this->notificationService->getUnreadCount($user),
            'read_count' => 0,
        ]);
    }
}
