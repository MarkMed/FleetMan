/**
 * Complete Registration Form Data Types
 * Sprint #14 Task 2.1b: Extended Registration Wizard
 * 
 * Multi-step wizard for complete user registration with all profile fields.
 * Steps: Credentials → User Type → Professional Info → Profile Completion → Preferences → Confirmation
 */

export interface CompleteRegistrationData {
  // Step 1: Credentials
  email: string;
  password: string;
  confirmPassword: string;

  // Step 2: User Type
  type: 'CLIENT' | 'PROVIDER';

  // Step 3: Professional Info (maps to profile fields)
  professionalInfo: {
    companyName?: string; // Required for PROVIDER
    phone?: string;
    address?: string;
  };

  // Step 4: Profile Completion (optional fields)
  profileCompletion: {
    bio?: string;
    tags?: string[];
  };

  // Step 5: Preferences (optional - future feature)
  preferences?: {
    language?: 'es' | 'en';
    notifications?: {
      email?: boolean;
      maintenanceAlerts?: boolean;
    };
  };
}

/**
 * Validation schemas per step
 * Each step has its own focused validation
 */
export interface CompleteRegistrationValidation {
  // Step 1: Credentials
  credentials: {
    email?: string;
    password?: string;
    confirmPassword?: string;
  };

  // Step 2: User Type
  userType: {
    type?: string;
  };

  // Step 3: Professional Info
  professionalInfo: {
    companyName?: string;
    phone?: string;
    address?: string;
  };

  // Step 4: Profile Completion (optional step - minimal validation)
  profileCompletion: {
    bio?: string;
    tags?: string;
  };

  // Step 5: Preferences (optional step - minimal validation)
  preferences: {};

  // Step 6: Confirmation (no validation - just review)
  confirmation: {};
}

// TODO: Strategic fields for future enhancements
// export interface CompleteRegistrationData {
//   // Avatar upload (Task 10.3)
//   avatar?: {
//     file?: File;
//     previewUrl?: string;
//   };
//   
//   // Service areas for providers (future)
//   serviceAreas?: string[]; // e.g., ['Mantenimiento Preventivo', 'Reparación de Frenos']
//   
//   // Location for geographic search (future)
//   location?: {
//     city?: string;
//     region?: string;
//     country?: string;
//   };
//   
//   // Terms acceptance tracking
//   termsAcceptance?: {
//     termsAndConditions: boolean;
//     privacyPolicy: boolean;
//     acceptedAt: Date;
//   };
// }
