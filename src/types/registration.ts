export interface Organization {
  id: string;
  business_name: string;
  subdomain: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export interface OrgUser {
  id: string;
  organization_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  email_verified: boolean;
  phone_verified: boolean;
  is_owner: boolean;
  created_at: string;
}

export interface VerificationCode {
  id: string;
  user_id: string;
  code: string;
  type: 'email' | 'phone';
  verified: boolean;
  expires_at: string;
  created_at: string;
}

export interface RegistrationData {
  businessName: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  subdomain: string;
}

export type RegistrationStep = 'business-name' | 'user-details' | 'email-verification' | 'phone-verification' | 'subdomain';
