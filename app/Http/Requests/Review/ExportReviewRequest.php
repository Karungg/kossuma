<?php

namespace App\Http\Requests\Review;

use App\Services\Review\ReviewExportDefinition;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ExportReviewRequest extends FormRequest
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
            'ids.*' => ['integer', 'exists:product_reviews,id'],
            'columns' => ['nullable', 'array'],
            'columns.*' => ['string', Rule::in(ReviewExportDefinition::ALL_COLUMNS)],
            'search' => ['nullable', 'string', 'max:200'],
            'product_id' => ['nullable', 'integer'],
            'store_id' => ['nullable', 'integer'],
            'rating' => ['nullable', 'string', Rule::in(['1', '2', '3', '4', '5', 'low'])],
            'visibility' => ['nullable', 'string', Rule::in(['visible', 'hidden'])],
            'reply_status' => ['nullable', 'string', Rule::in(['replied', 'unreplied'])],
            'date_from' => ['nullable', 'date'],
            'date_to' => ['nullable', 'date'],
            'sort' => ['nullable', 'string', Rule::in(['created_at', 'rating'])],
            'direction' => ['nullable', 'string', Rule::in(['asc', 'desc'])],
        ];
    }
}
