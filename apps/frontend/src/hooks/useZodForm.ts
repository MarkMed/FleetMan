import { useForm, UseFormProps, FieldValues, Path } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ZodSchema, ZodType, ZodTypeDef } from 'zod';

interface UseZodFormProps<T extends FieldValues> extends UseFormProps<T> {
  schema: ZodType<T, ZodTypeDef, any>;
}

export const useZodForm = <T extends FieldValues>({
  schema,
  ...formProps
}: UseZodFormProps<T>) => {
  return useForm<T>({
    resolver: zodResolver(schema),
    ...formProps,
  });
};

// Helper hook for handling form field errors
export const useFormFieldError = <T extends FieldValues>(
  name: Path<T>,
  errors: any
) => {
  const fieldError = errors[name];
  
  return {
    hasError: !!fieldError,
    errorMessage: fieldError?.message || '',
  };
};