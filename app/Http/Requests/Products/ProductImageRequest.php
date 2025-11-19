<?php

namespace App\Http\Requests\Products;

use App\Models\ProductImage;
use Illuminate\Foundation\Http\FormRequest;

class ProductImageRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'product_id' => ['required','exists:products,id'],
            'file' => ['required','image','max:2048'],
            'is_primary' => ['boolean'],
            'alt_text' => ['nullable','string','max:255'],
            'sort_order' => ['nullable','integer','min:0'],
            'is_primary' => ['boolean'],
        ];
    }

    function save() : bool {
        $productImage = ProductImage::find($this->route('product_image')) ?? new ProductImage();

        $productImage->product_id = $this->product_id;
        $productImage->file = $this->file;
        $productImage->is_primary = $this->is_primary ?? false;
        $productImage->alt_text = $this->alt_text ?? null;
        $productImage->sort_order = $this->sort_order ?? 0;
        if ($productImage->save()) return true;
        return false;
    }
}
