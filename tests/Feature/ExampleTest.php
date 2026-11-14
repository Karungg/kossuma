<?php

use Inertia\Testing\AssertableInertia as Assert;

test('returns a successful response', function () {
    $response = $this->get(route('home'));

    $response->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('welcome'));
});

test('cart page renders successfully', function () {
    $response = $this->get(route('cart'));

    $response->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('cart'));
});

test('product detail page renders successfully', function () {
    $response = $this->get(route('products.show', ['slug' => 'ayam-ungkep-bumbu-kuning']));

    $response->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('products/show'));
});
