import React, { useState, useRef, forwardRef, useEffect } from 'react';
import { cn } from '@utils/cn';
import { Button } from './Button';
import { X, Image as ImageIcon, Camera } from 'lucide-react';
import { config } from '../../config';

/**
 * ImagePickerField Component
 * 
 * Generic image picker component for use in any form context.
 * Handles file selection and preview. Upload logic managed externally.
 * 
 * Features:
 * - File selection from device (mobile: camera/gallery, desktop: file explorer)
 * - Image preview with responsive sizing
 * - File object exposure via callback for external upload handling
 * - Error handling with descriptive messages
 * - Clear/change functionality
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
 *       onFileSelect={(file) => setPhotoFile(file)}
 *       error={errors.machinePhotoUrl?.message}
 *       helperText="Selecciona una foto representativa"
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
  
  /** Called when file is selected or cleared (exposes File object for external upload) */
  onFileSelect?: (file: File | null) => void;
  
  // Future Enhancement: Callback hooks for advanced integration
  // /** Called when upload starts (useful for showing loading states in parent) */
  // onUploadStart?: () => void;
  // 
  // /** Called when upload completes successfully (useful for analytics, logging) */
  // onUploadSuccess?: (url: string) => void;
  // 
  // /** Called when upload fails (useful for custom error handling) */
  // onUploadError?: (error: Error) => void;
  //
  // /** Multi-image support for galleries */
  // multiple?: boolean;
  // maxImages?: number;
  // onMultiFileSelect?: (files: File[]) => void;
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
      onFileSelect, // NEW: Callback to expose File object
    },
    ref
  ) => {
    // State
    const [uploadState, setUploadState] = useState<UploadState>('idle');
    const [errorMessage, setErrorMessage] = useState<string>('');
    const [previewUrl, setPreviewUrl] = useState<string | null>(value || null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    // Refs
    const fileInputRef = useRef<HTMLInputElement>(null);

    /**
     * Sync external value changes with internal state
     * Important for React Hook Form integration:
     * - When form.setValue() is called externally (e.g., clearing value)
     * - When form resets or loads saved data
     * - When "Add later" checkbox clears the photo URL
     */
    useEffect(() => {
      // If external value is empty and we have a preview, clear it
      if (!value && previewUrl) {
        setPreviewUrl(null);
        setSelectedFile(null);
        setUploadState('idle');
        setErrorMessage('');
      }
      
      // If external value exists and it's different from current preview, update it
      // This handles cases where value is set externally (e.g., loading saved data)
      if (value && value !== previewUrl) {
        setPreviewUrl(value);
        setUploadState('idle'); // Reset to idle for external URLs
      }
    }, [value]); // Only depend on value, not previewUrl to avoid loops

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
        setUploadState('idle');

        // Expose File object to parent via callback
        onFileSelect?.(file);
        
        console.log('✅ File selected:', file.name, `(${fileSizeMB.toFixed(2)}MB)`);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Error al seleccionar imagen';
        setErrorMessage(message);
        setUploadState('error');
        setPreviewUrl(null);
        setSelectedFile(null);
        onFileSelect?.(null); // Clear file on error
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
      onChangeText?.(''); // Clear form value
      onFileSelect?.(null); // Notify parent of cleared file

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
    const hasError = !!error || !!errorMessage;

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
            'relative border-2 border-dashed rounded-lg p-4 transition-colors bg-transparent',
            hasError ? 'border-red-300' : 'border-gray-300',
            !disabled && 'hover:border-gray-400'
          )}
        >
          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept={acceptedFormats.join(',')}
            onChange={handleFileSelect}
            disabled={disabled}
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
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                {/* Change Button */}
                <Button
                  onPress={handleSelectClick}
                  disabled={disabled}
                  variant="outline"
                  className="flex-1"
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Cambiar
                </Button>

                {/* Clear Button */}
                <Button
                  onPress={handleClear}
                  disabled={disabled}
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
