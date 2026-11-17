<?php

use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use Illuminate\Support\Str;

test('roles, permissions, and users use uuid primary keys and pivot relationships', function () {
    $user = User::factory()->create();
    $role = Role::create(['name' => 'admin']);
    $permission = Permission::create(['name' => 'manage users']);
    $directPermission = Permission::create(['name' => 'view reports']);

    expect(Str::isUuid($user->id))->toBeTrue()
        ->and(Str::isUuid($role->id))->toBeTrue()
        ->and(Str::isUuid($permission->id))->toBeTrue();

    $role->givePermissionTo($permission);
    $user->assignRole($role);
    $user->givePermissionTo($directPermission);

    expect($user->hasRole('admin'))->toBeTrue()
        ->and($user->hasPermissionTo('manage users'))->toBeTrue()
        ->and($user->hasPermissionTo('view reports'))->toBeTrue();
});
