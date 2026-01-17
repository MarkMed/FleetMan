import { config } from '../../config';
import imageCompression from 'browser-image-compression';

/**
 * Cloudinary Upload Service
 * 
 * Handles image upload to Cloudinary with compression and validation.
 * Adapted from React Native version to work with Web File API.
 * 
 * @example
 * ```typescript
 * const file = event.target.files[0];
 * try {
 *   const url = await uploadImageToCloudinary(file);
 *   console.log('Image uploaded:', url);
 * } catch (error) {
 *   console.error('Upload failed:', error.message);
 * }
 * ```
 */

export interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
  width: number;
  height: number;
  format: string;
  resource_type: string;
  created_at: string;
  bytes: number;
}

export interface CloudinaryErrorResponse {
  error: {
    message: string;
    http_code: number;
  };
}

/**
 * Upload an image file to Cloudinary with automatic compression
 * 
 * @param file - File object from input[type="file"]
 * @param options - Optional compression and upload settings
 * @returns Cloudinary secure URL of uploaded image
 * @throws Error if upload fails or file is invalid
 * 
 * Features:
 * - Automatic image compression (reduces size while maintaining quality)
 * - File type validation (JPEG, PNG, WebP only)
 * - File size validation (max 5MB after compression)
 * - Progress tracking (optional callback)
 */
export async function uploadImageToCloudinary(
  file: File,
  options?: {
    maxSizeMB?: number;
    maxWidthOrHeight?: number;
    onProgress?: (progress: number) => void;
  }
): Promise<string> {
  const CLOUD_NAME = config.CLOUDINARY.CLOUD_NAME;
  const UPLOAD_PRESET = config.CLOUDINARY.UPLOAD_PRESET;
  const MAX_FILE_SIZE = config.CLOUDINARY.MAX_FILE_SIZE;
  const ACCEPTED_FORMATS = config.CLOUDINARY.ACCEPTED_FORMATS;

  // Validation: Check Cloudinary config
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    throw new Error(
      'Cloudinary no está configurado. Verifica las variables de entorno VITE_CLOUDINARY_CLOUD_NAME y VITE_CLOUDINARY_UPLOAD_PRESET'
    );
  }

  // Validation: Check file type
  if (!ACCEPTED_FORMATS.includes(file.type as any)) {
    throw new Error(
      `Formato de imagen no soportado. Solo se permiten: ${ACCEPTED_FORMATS.join(', ')}`
    );
  }

  try {
    // Step 1: Compress image before upload (improves performance and reduces costs)
    const compressionOptions = {
      maxSizeMB: options?.maxSizeMB || 1, // Target size: 1MB
      maxWidthOrHeight: options?.maxWidthOrHeight || 1920, // Max dimension: 1920px
      useWebWorker: true, // Use Web Worker for better performance
      onProgress: options?.onProgress, // Optional progress callback
    };

    console.log('🖼️ Compressing image...', {
      originalSize: (file.size / 1024 / 1024).toFixed(2) + 'MB',
      originalName: file.name,
    });

    const compressedFile = await imageCompression(file, compressionOptions);

    console.log('✅ Image compressed:', {
      newSize: (compressedFile.size / 1024 / 1024).toFixed(2) + 'MB',
      reduction: ((1 - compressedFile.size / file.size) * 100).toFixed(1) + '%',
    });

    // Validation: Check compressed file size
    if (compressedFile.size > MAX_FILE_SIZE) {
      throw new Error(
        `La imagen es demasiado grande (${(compressedFile.size / 1024 / 1024).toFixed(1)}MB). Tamaño máximo: ${(MAX_FILE_SIZE / 1024 / 1024).toFixed(0)}MB`
      );
    }

    // Step 2: Prepare FormData for upload
    const formData = new FormData();
    formData.append('file', compressedFile); // Web uses File object directly (not {uri, name, type} like React Native)
    formData.append('upload_preset', UPLOAD_PRESET);

    // Optional: Add folder organization (useful for different contexts: machines, users, etc.)
    // formData.append('folder', 'machines'); // Uncomment to organize uploads in Cloudinary
    
    // Optional: Add tags for better search and filtering
    // formData.append('tags', 'machine,registration'); // Uncomment to add metadata

    // Step 3: Upload to Cloudinary
    const endpoint = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;
    
    console.log('☁️ Uploading to Cloudinary...', endpoint);

    const response = await fetch(endpoint, {
      method: 'POST',
      body: formData,
      // Note: Don't set Content-Type header - browser will set it automatically with boundary
    });

    // Handle HTTP errors
    if (!response.ok) {
      const errorData: CloudinaryErrorResponse = await response.json();
      throw new Error(
        errorData?.error?.message || `Error al subir imagen (HTTP ${response.status})`
      );
    }

    // Parse response
    const data: CloudinaryUploadResult = await response.json();

    // Validation: Ensure we got a URL
    if (!data.secure_url) {
      throw new Error('No se recibió URL de Cloudinary');
    }

    console.log('✅ Image uploaded successfully:', {
      url: data.secure_url,
      publicId: data.public_id,
      size: (data.bytes / 1024).toFixed(2) + 'KB',
    });

    return data.secure_url;
  } catch (error) {
    console.error('❌ Cloudinary upload error:', error);

    // Re-throw with user-friendly message
    if (error instanceof Error) {
      throw error; // Preserve our custom error messages
    }

    throw new Error('Error desconocido al subir imagen');
  }
}

/**
 * Validate if a URL is a valid Cloudinary URL
 * Useful for form validation
 */
export function isCloudinaryUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.includes('cloudinary.com');
  } catch {
    return false;
  }
}

/**
 * Extract public_id from Cloudinary URL
 * Useful for deletion or transformation operations
 * 
 * @example
 * ```typescript
 * const url = 'https://res.cloudinary.com/demo/image/upload/v1234/sample.jpg';
 * const publicId = extractPublicId(url); // 'sample'
 * ```
 */
export function extractPublicId(cloudinaryUrl: string): string | null {
  try {
    const urlObj = new URL(cloudinaryUrl);
    const pathSegments = urlObj.pathname.split('/');
    
    // Cloudinary URL structure: /[cloud_name]/[resource_type]/[type]/[version]/[public_id].[format]
    const publicIdWithFormat = pathSegments[pathSegments.length - 1];
    const publicId = publicIdWithFormat.split('.')[0]; // Remove file extension
    
    return publicId || null;
  } catch {
    return null;
  }
}

// Future Enhancement: Delete image from Cloudinary
// Note: Requires signed requests (can't use unsigned preset)
// export async function deleteImageFromCloudinary(publicId: string): Promise<void> {
//   // Implementation requires backend endpoint for security
//   // Cloudinary deletion requires authentication (can't be done from client for security)
//   throw new Error('Delete operation must be done from backend for security');
// }

// Future Enhancement: Transform image URL (resize, crop, quality, etc.)
// export function transformCloudinaryUrl(
//   originalUrl: string,
//   transformations: {
//     width?: number;
//     height?: number;
//     crop?: 'fill' | 'fit' | 'scale' | 'thumb';
//     quality?: number;
//   }
// ): string {
//   // Inject transformations into Cloudinary URL
//   // Example: https://res.cloudinary.com/demo/image/upload/w_400,h_300,c_fill/sample.jpg
//   throw new Error('Not implemented yet');
// }
