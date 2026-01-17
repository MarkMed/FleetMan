import React, { useState, useRef, forwardRef } from 'react';
import { cn } from '@utils/cn';
import { Button } from './Button';
import { Spinner } from './Spinner';
import { Upload, X, Image as ImageIcon, Camera } from 'lucide-react';
import { uploadImageToCloudinary } from '../../services/cloudinary/cloudinaryService';
import { config } from '../../config';

/**
 * ImagePickerField Component
 * 
 * Generic image picker component for use in any form context.
 * Handles file selection, preview, compression, and upload to Cloudinary.
 * 
 * Features:
 * - File selection from device (mobile: camera/gallery, desktop: file explorer)
 * - Image preview with responsive sizing
 * - Automatic upload to Cloudinary with compression
 * - Loading states with progress indicator
 * - Error handling with descriptive messages
 * - Clear/retry functionality
 * - Fully accessible (keyboard navigation, ARIA labels)
 * 
 * @example
 * ```tsx
 * // With React Hook Form Controller
 * <Controller
 *   control={control}
 *   name="machinePhotoUrl"
 *   render={({ field: { value, onChange } }) => (
 *     <ImagePickerField
 *       label="Foto de la máquina"
 *       value={value || ''}
 *       onChangeText={onChange}
 *       error={errors.machinePhotoUrl?.message}
 *       helperText="Sube una foto representativa"
 *     />
 *   )}
 * />
 * ```
 */

export interface ImagePickerFieldProps {
  /** Label text displayed above the picker */
  label?: string;
  
  /** Current image URL (from Cloudinary after upload) */
  value?: string;
  
  /** Callback when image URL changes (after successful upload) */
  onChangeText?: (url: string) => void;
  
  /** Error message to display */
  error?: string;
  
  /** Helper text displayed below the picker */
  helperText?: string;
  
  /** Whether the field is disabled */
  disabled?: boolean;
  
  /** Whether the field is required */
  required?: boolean;
  
  /** Maximum file size in MB (default: 5MB from config) */
  maxSizeMB?: number;
  
  /** Accepted file formats (default: JPEG, PNG, WebP) */
  acceptedFormats?: string[];
  
  /** Additional CSS classes */
  className?: string;
  
  /** Custom placeholder text when no image selected */
  placeholder?: string;
  
  /** Whether to show upload button separately (true) or auto-upload on select (false) */
  manualUpload?: boolean;
}

type UploadState = 'idle' | 'selecting' | 'uploading' | 'success' | 'error';

export const ImagePickerField = forwardRef<HTMLInputElement, ImagePickerFieldProps>(
  (
    {
      label,
      value,
      onChangeText,
      error,
      helperText,
      disabled = false,
      required = false,
      maxSizeMB = config.CLOUDINARY.MAX_FILE_SIZE / (1024 * 1024), // Convert bytes to MB
      acceptedFormats = config.CLOUDINARY.ACCEPTED_FORMATS,
      className,
      placeholder = 'Ninguna imagen seleccionada',
      manualUpload = true, // Default: require explicit upload button click
    },
    ref
  ) => {
    // State
    const [uploadState, setUploadState] = useState<UploadState>('idle');
    const [uploadProgress, setUploadProgress] = useState<number>(0);
    const [errorMessage, setErrorMessage] = useState<string>('');
    const [previewUrl, setPreviewUrl] = useState<string | null>(value || null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    // Refs
    const fileInputRef = useRef<HTMLInputElement>(null);

    /**
     * Handle file selection from input
     */
    const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      // Reset error state
      setErrorMessage('');
      setUploadState('selecting');

      try {
        // Validate file type
        if (!acceptedFormats.includes(file.type as any)) {
          throw new Error(
            `Formato no soportado. Usa: ${acceptedFormats.map((f: string) => f.split('/')[1].toUpperCase()).join(', ')}`
          );
        }

        // Validate file size (before compression)
        const fileSizeMB = file.size / (1024 * 1024);
        if (fileSizeMB > maxSizeMB * 2) {
          // Allow 2x max size before compression
          throw new Error(
            `Archivo demasiado grande (${fileSizeMB.toFixed(1)}MB). Máximo: ${(maxSizeMB * 2).toFixed(0)}MB`
          );
        }

        // Create preview URL
        const objectUrl = URL.createObjectURL(file);
        setPreviewUrl(objectUrl);
        setSelectedFile(file);

        // If manual upload disabled, upload immediately
        if (!manualUpload) {
          await handleUpload(file);
        } else {
          setUploadState('idle'); // Wait for user to click upload button
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Error al seleccionar imagen';
        setErrorMessage(message);
        setUploadState('error');
        setPreviewUrl(null);
        setSelectedFile(null);
      }
    };

    /**
     * Upload selected file to Cloudinary
     */
    const handleUpload = async (fileToUpload?: File) => {
      const file = fileToUpload || selectedFile;
      if (!file) {
        setErrorMessage('No hay archivo seleccionado');
        return;
      }

      setUploadState('uploading');
      setUploadProgress(0);
      setErrorMessage('');

      try {
        const url = await uploadImageToCloudinary(file, {
          maxSizeMB,
          onProgress: (progress) => {
            setUploadProgress(Math.round(progress));
          },
        });

        // Success: update form value with Cloudinary URL
        setUploadState('success');
        setUploadProgress(100);
        onChangeText?.(url);

        // Keep preview showing the uploaded image
        setPreviewUrl(url);

        console.log('✅ Image uploaded successfully:', url);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Error al subir imagen';
        setErrorMessage(message);
        setUploadState('error');
        setUploadProgress(0);
      }
    };

    /**
     * Clear selected image and reset state
     */
    const handleClear = () => {
      setPreviewUrl(null);
      setSelectedFile(null);
      setUploadState('idle');
      setErrorMessage('');
      setUploadProgress(0);
      onChangeText?.(''); // Clear form value

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };

    /**
     * Trigger file input click
     */
    const handleSelectClick = () => {
      fileInputRef.current?.click();
    };

    // Compute states
    const hasImage = !!previewUrl;
    const isUploading = uploadState === 'uploading';
    const isSuccess = uploadState === 'success';
    const hasError = !!error || !!errorMessage;
    const showUploadButton = manualUpload && selectedFile && uploadState === 'idle';

    return (
      <div className={cn('space-y-2', className)}>
        {/* Label */}
        {label && (
          <label className="block text-sm font-medium text-gray-700">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        {/* Preview + Controls Container */}
        <div
          className={cn(
            'relative border-2 border-dashed rounded-lg p-4 transition-colors',
            hasError ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-gray-50',
            !disabled && 'hover:border-gray-400'
          )}
        >
          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept={acceptedFormats.join(',')}
            onChange={handleFileSelect}
            disabled={disabled || isUploading}
            className="hidden"
            aria-label={label || 'Seleccionar imagen'}
          />

          {/* Preview Image */}
          {hasImage ? (
            <div className="space-y-3">
              {/* Image Preview */}
              <div className="relative w-full h-64 bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full h-full object-contain"
                />

                {/* Upload Progress Overlay */}
                {isUploading && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center">
                    <Spinner size={48} />
                    <p className="text-white text-sm mt-2">Subiendo... {uploadProgress}%</p>
                  </div>
                )}

                {/* Success Overlay */}
                {isSuccess && (
                  <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-md text-xs font-medium">
                    ✓ Subida exitosa
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                {/* Upload Button (only in manual mode when file selected but not uploaded) */}
                {showUploadButton && (
                  <Button
                    onPress={() => handleUpload()}
                    disabled={disabled || isUploading}
                    variant="filled"
                    className="flex-1"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Subir Imagen
                  </Button>
                )}

                {/* Change Button (after upload or in auto mode) */}
                {(isSuccess || !showUploadButton) && (
                  <Button
                    onPress={handleSelectClick}
                    disabled={disabled || isUploading}
                    variant="outline"
                    className="flex-1"
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    Cambiar
                  </Button>
                )}

                {/* Clear Button */}
                <Button
                  onPress={handleClear}
                  disabled={disabled || isUploading}
                  variant="ghost"
                  className="px-3"
                  aria-label="Limpiar imagen"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ) : (
            /* Empty State: No Image Selected */
            <div className="text-center py-8">
              <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-sm text-gray-600 mb-3">{placeholder}</p>
              <Button
                onPress={handleSelectClick}
                disabled={disabled}
                variant="outline"
              >
                <Camera className="w-4 h-4 mr-2" />
                Seleccionar Imagen
              </Button>
            </div>
          )}
        </div>

        {/* Helper Text */}
        {helperText && !hasError && (
          <p className="text-xs text-gray-500">{helperText}</p>
        )}

        {/* Error Message */}
        {hasError && (
          <p className="text-xs text-red-600">
            {error || errorMessage}
          </p>
        )}

        {/* File Info (for debugging in dev mode) */}
        {process.env.NODE_ENV === 'development' && selectedFile && (
          <details className="text-xs text-gray-500">
            <summary>Detalles del archivo (dev only)</summary>
            <pre className="mt-1 p-2 bg-gray-100 rounded">
              {JSON.stringify(
                {
                  name: selectedFile.name,
                  type: selectedFile.type,
                  size: (selectedFile.size / 1024).toFixed(2) + ' KB',
                  uploadState,
                  cloudinaryUrl: value || 'not uploaded',
                },
                null,
                2
              )}
            </pre>
          </details>
        )}
      </div>
    );
  }
);

ImagePickerField.displayName = 'ImagePickerField';
