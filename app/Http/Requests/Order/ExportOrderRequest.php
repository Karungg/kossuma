<?php

namespace App\Http\Requests\Order;

use App\Enums\Order\OrderStatus;
use App\Services\Order\OrderExportDefinition;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ExportOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'format' => ['required', 'string', Rule::in(['xlsx', 'pdf', 'csv'])],
            'ids' => ['nullable', 'array'],
            'ids.*' => ['integer', 'exists:orders,id'],
            'columns' => ['nullable', 'array'],
            'columns.*' => ['string', Rule::in(OrderExportDefinition::ALL_COLUMNS)],
            'search' => ['nullable', 'string', 'max:200'],
            'status' => ['nullable', 'string', Rule::in(['all', ...OrderStatus::values()])],
            'payment_status' => ['nullable', 'string', Rule::in(['unpaid', 'paid', 'cancelled', 'refunded'])],
            'payment_method' => ['nullable', 'string', Rule::in(['qris', 'bank_transfer', 'cod'])],
            'store_id' => ['nullable', 'integer'],
            'product_id' => ['nullable', 'integer'],
            'shipping_courier' => ['nullable', 'string', 'max:100'],
            'review_status' => ['nullable', 'string', Rule::in(['reviewed', 'unreviewed'])],
            'needs_attention' => ['nullable', 'string', Rule::in(['1', '0'])],
            'date_from' => ['nullable', 'date'],
            'date_to' => ['nullable', 'date'],
            'sort' => ['nullable', 'string', Rule::in(['created_at', 'total_amount', 'order_number', 'status'])],
            'direction' => ['nullable', 'string', Rule::in(['asc', 'desc'])],
        ];
    }
}
