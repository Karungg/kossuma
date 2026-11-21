<?php

namespace App\Policies\Order;

use App\Models\Order\Order;
use App\Models\User;

class OrderPolicy
{
    public function view(User $user, Order $order): bool
    {
        return $order->user_id === $user->id;
    }

    public function cancel(User $user, Order $order): bool
    {
        return $order->user_id === $user->id;
    }

    public function confirmReceived(User $user, Order $order): bool
    {
        return $order->user_id === $user->id;
    }

    public function buyAgain(User $user, Order $order): bool
    {
        return $order->user_id === $user->id;
    }

    public function review(User $user, Order $order): bool
    {
        return $order->user_id === $user->id;
    }
}
