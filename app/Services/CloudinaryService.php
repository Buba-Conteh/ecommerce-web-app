<?php

namespace App\Services;

use CloudinaryLabs\CloudinaryLaravel\Facades\Cloudinary;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Log;

class CloudinaryService
{
    /**
     * Upload a file to Cloudinary
     * 
     * @param UploadedFile $file
     * @param array $options
     * @return string|null The secure URL of the uploaded file
     */
    public static function uploadFile(UploadedFile $file, array $options = []): ?string
    {
        try {
            Log::info('Uploading file to Cloudinary', [
                'file_name' => $file->getClientOriginalName(),
                'options' => $options,
            ]);

            $uploadResponse = Cloudinary::upload(
                $file->getRealPath(),
                array_merge([
                    'resource_type' => 'auto',
                ], $options)
            );

            // Extract the secure URL from the response
            $secureUrl = self::extractSecureUrl($uploadResponse);

            if (empty($secureUrl)) {
                Log::warning('Failed to extract URL from Cloudinary response', [
                    'file_name' => $file->getClientOriginalName(),
                    'response_type' => get_class($uploadResponse),
                    'response_data' => json_encode($uploadResponse),
                ]);
                return null;
            }

            Log::info('File uploaded successfully to Cloudinary', [
                'file_name' => $file->getClientOriginalName(),
                'url' => $secureUrl,
            ]);

            return $secureUrl;
        } catch (\Exception $e) {
            Log::error('Cloudinary upload failed: ' . $e->getMessage(), [
                'file_name' => $file->getClientOriginalName(),
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return null;
        }
    }

    /**
     * Extract the secure URL from a Cloudinary upload response
     * 
     * @param mixed $response The response from Cloudinary::upload()
     * @return string|null The secure URL or null
     */
    private static function extractSecureUrl($response): ?string
    {
        // Method 1: Try getSecurePath() if it exists
        if (method_exists($response, 'getSecurePath')) {
            $url = $response->getSecurePath();
            if (!empty($url)) {
                return $url;
            }
        }

        // Method 2: Try array access for secure_url
        try {
            $url = $response['secure_url'] ?? $response['url'] ?? null;
            if (!empty($url)) {
                return $url;
            }
        } catch (\Exception $e) {
            // Array access failed, continue to next method
        }

        // Method 3: Try property access
        if (isset($response->secure_url) && !empty($response->secure_url)) {
            return $response->secure_url;
        }

        if (isset($response->url) && !empty($response->url)) {
            return $response->url;
        }

        // Method 4: Try getPath()
        if (method_exists($response, 'getPath')) {
            $url = $response->getPath();
            if (!empty($url)) {
                return $url;
            }
        }

        return null;
    }

    /**
     * Delete a file from Cloudinary using its public ID
     * 
     * @param string $publicId
     * @return bool
     */
    public static function deleteFile(string $publicId): bool
    {
        try {
            Cloudinary::destroy($publicId);
            Log::info('File deleted from Cloudinary', ['public_id' => $publicId]);
            return true;
        } catch (\Exception $e) {
            Log::error('Failed to delete file from Cloudinary: ' . $e->getMessage(), [
                'public_id' => $publicId,
                'error' => $e->getMessage(),
            ]);
            return false;
        }
    }
}
