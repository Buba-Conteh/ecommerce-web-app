<?php

namespace App\Http\Requests\Products;

use App\Models\Product;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use phpDocumentor\Reflection\Types\Boolean;
use Illuminate\Contracts\Validation\Validator;

class ProductRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    // /**
    //  * Handle a failed validation attempt.
    //  */
    // protected function failedValidation(Validator $validator)
    // {
    //     // Return JSON response for API requests
    //     throw new \Illuminate\Validation\ValidationException($validator, response()->json(
    //         $validator->errors(),
    //         422
    //     ));
    // }

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
            'track_stock' => ['nullable', 'in:true,false,1,0'],
            'is_active' =>['nullable', 'in:true,false,1,0'],
            'is_featured' =>['nullable', 'in:true,false,1,0'],
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
            'category_id' => ['required', 'exists:categories,id'],
            'brand_id' => ['nullable', 'exists:brands,id'],
            'tags' => ['nullable', 'array'],
            'tags.*' => ['exists:tags,id'],
            'images' => ['nullable', 'array'],
            'images.*.file' => ['required', 'image', 'max:5120'], // 5MB max
            'images.*.is_primary' =>['nullable', 'in:true,false,1,0'],
            'images.*.alt_text' => ['nullable', 'string', 'max:255'],
        ];
    }

    function save(?Product $existingProduct = null) : Product|bool {

        $product = $existingProduct ?? Product::find($this->route('product')) ?? new Product();
        
        $product->name = $this->name;
        $product->slug = Str::slug($this->name);
        $product->description = $this->description;
        $product->short_description = $this->short_description;
        $product->price = $this->price;
        $product->compare_price = $this->compare_price;
        $product->cost_price = $this->cost_price;
        $product->sku = $this->sku;
        $product->barcode = $this->barcode;
        $product->stock_quantity = $this->stock_quantity ?? 0;
        $product->min_stock_quantity = $this->min_stock_quantity ?? 0;
        $product->track_stock = $this->track_stock ? 1 : 0;
        $product->is_active = $this->is_active ? 1 : 0;
        $product->is_featured = $this->is_featured ? 1 : 0;
        $product->weight = $this->weight;
        $product->length = $this->length;
        $product->width = $this->width;
        $product->height = $this->height;
        $product->sizes = $this->sizes;
        $product->colors = $this->colors;
        $product->features = $this->features;
        $product->material = $this->material;
        $product->origin = $this->origin;
        $product->fit = $this->fit;
        $product->care_instructions = $this->care_instructions;
        $product->category_id = $this->category_id;
        $product->brand_id = $this->brand_id;

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

            return $product;
        } 
            
        return false;
    }
}
