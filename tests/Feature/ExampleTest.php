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
    $response = $this->get(route('products.show', ['slug' => 'kaki-naga-ayam']));

    $response->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('products/show')->where('slug', 'kaki-naga-ayam'));
});

test('about page renders successfully', function () {
    $response = $this->get(route('about'));

    $response->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('about'));
});

test('blog page renders successfully', function () {
    $response = $this->get(route('blog'));

    $response->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('blog'));
});
