<?php

use Illuminate\Support\Facades\Route;
use CloudinaryLabs\CloudinaryLaravel\Facades\Cloudinary;

Route::middleware('web')->group(function () {
    Route::get('/debug/cloudinary', function () {
        try {
            // Test if Cloudinary is configured
            $config = Cloudinary::getUrl('test');
            return response()->json([
                'status' => 'Cloudinary is configured',
                'config' => $config,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'Error',
                'error' => $e->getMessage(),
            ], 500);
        }
    });

    Route::get('/debug/upload-test/{productId?}', function ($productId = null) {
        // Create a test image to upload
        try {
            $testImagePath = storage_path('app/temp_test_image.jpg');
            
            // Create a test image if it doesn't exist
            if (!file_exists($testImagePath)) {
                $img = imagecreate(100, 100);
                imagecolorallocate($img, 255, 0, 0);
                imagejpeg($img, $testImagePath);
                imagedestroy($img);
            }

            // Try to upload to Cloudinary
            $uploadResponse = Cloudinary::upload($testImagePath, [
                'folder' => 'shopma-products/test',
                'public_id' => 'test_' . time(),
            ]);

            return response()->json([
                'status' => 'Upload successful',
                'response_type' => get_class($uploadResponse),
                'secure_url' => $uploadResponse->getSecurePath() ?? 'N/A',
                'path' => $uploadResponse->getPath() ?? 'N/A',
                'full_response' => (array)$uploadResponse,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'Error during upload',
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ], 500);
        }
    });
});
