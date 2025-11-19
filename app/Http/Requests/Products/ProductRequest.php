<?php

namespace App\Http\Requests\Products;

use App\Models\Product;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use phpDocumentor\Reflection\Types\Boolean;

class ProductRequest extends FormRequest
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
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'short_description' => ['nullable', 'string'],
            'price' => ['required', 'numeric', 'min:0'],
            'compare_price' => ['nullable', 'numeric', 'min:0'],
            'cost_price' => ['nullable', 'numeric', 'min:0'],
            'sku' => ['nullable', 'string', 'max:255', Rule::unique('products')->ignore($this->route('product'))],
            'barcode' => ['nullable', 'string', 'max:255'],
            'stock_quantity' => ['nullable', 'integer', 'min:0'],
            'min_stock_quantity' => ['nullable', 'integer', 'min:0'],
            'track_stock' => ['boolean'],
            'is_active' => ['boolean'],
            'is_featured' => ['boolean'],
            'weight' => ['nullable', 'numeric', 'min:0'],
            'length' => ['nullable', 'numeric', 'min:0'],
            'width' => ['nullable', 'numeric', 'min:0'],
            'height' => ['nullable', 'numeric', 'min:0'],
            'sizes' => ['nullable', 'array'],
            'sizes.*' => ['string', 'max:50'],
            'colors' => ['nullable', 'array'],
            'colors.*' => ['string', 'max:50'],
            'features' => ['nullable', 'array'],
            'features.*' => ['string', 'max:255'],
            'material' => ['nullable', 'string', 'max:255'],
            'origin' => ['nullable', 'string', 'max:255'],
            'fit' => ['nullable', 'string', 'max:255'],
            'care_instructions' => ['nullable', 'string'],
            'category_id' => ['nullable', 'exists:categories,id'],
            'brand_id' => ['nullable', 'exists:brands,id'],
            'tags' => ['nullable', 'array'],
            'tags.*' => ['exists:tags,id'],
            'images' => ['nullable', 'array'],
            'images.*.file' => ['required', 'image', 'max:5120'], // 5MB max
            'images.*.is_primary' => ['boolean'],
            'images.*.alt_text' => ['nullable', 'string', 'max:255'],
        ];
    }

    function save() : bool {

        $product = Product::find($this->route('product')) ?? new Product();
        
        $product->name = $this->name;
        $product->slug = Str::slug($this->name);
        $product->description = $this->description ?? null;
        $product->short_description = $this->short_description ?? null;
        $product->price = $this->price;
        $product->compare_price = $this->compare_price ?? null;
        $product->cost_price = $this->cost_price ?? null;
        $product->sku = $this->sku ?? null;
        $product->barcode = $this->barcode ?? null;
        $product->stock_quantity = $this->stock_quantity ?? 0;
        $product->min_stock_quantity = $this->min_stock_quantity ?? 0;
        $product->track_stock = $this->track_stock ?? true;
        $product->is_active = $this->is_active ?? true;
        $product->is_featured = $this->is_featured ?? false;
        $product->weight = $this->weight ?? null;
        $product->length = $this->length ?? null;
        $product->width = $this->width ?? null;
        $product->height = $this->height ?? null;
        $product->sizes = $this->sizes ?? null;
        $product->colors = $this->colors ?? null;
        $product->features = $this->features ?? null;
        $product->material = $this->material ?? null;
        $product->origin = $this->origin ?? null;
        $product->fit = $this->fit ?? null;
        $product->care_instructions = $this->care_instructions ?? null;
        $product->category_id = $this->category_id ?? null;
        $product->brand_id = $this->brand_id ?? null;

        if ($product->save()){

            if ($this->has('images') && is_array($this->images)) {
                $product->saveImages($this->images);
            }

            // Sync tags
            if ($this->has('tags') && is_array($this->tags)) {
                $product->tags()->sync($this->tags);
            } else {
                $product->tags()->detach();
            }

            return true;
        } 
            
        return false;
    }
}
