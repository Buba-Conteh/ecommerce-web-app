<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Str;

class ProductResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' =>$this->id,
            'name' =>$this->name,
            'slug' => Str::slug($this->name),
            'description' =>$this->description,
            'short_description' =>$this->short_description ,
            'price' =>$this->price,
            'compare_price' =>$this->compare_price ,
            'sku' =>$this->sku,
            'stock_quantity' =>$this->stock_quantity ,
            'track_stock' =>$this->track_stock,
            'is_featured' =>$this->is_featured ,
            'category_id' =>$this->category_id,
            'brand_id' =>$this->brand_id,
            'created_at' =>$this->created_at,
        ];
    }
}
