const API_BASE_URL = 'https://api.staging.karzoun.chat'; 
// const API_BASE_URL = 'https://webhook.site';


export interface SubdomainCheckResponse {
  success: boolean;
  message: string;
  data: {
    available: boolean;
    suggestions?: string[];
  };
}

export interface VerificationRequestResponse {
  success: boolean;
  message: string;
}

export interface VerificationVerifyResponse {
  success: boolean;
  message: string;
}

export interface ValidationError {
  field: string;
  code: string;
  message: string;
}

export interface RegistrationResponse {
  success: boolean;
  message: string;
  data?: any;
  errors?: ValidationError[];
}

export const octobotsApiService = {
  async checkSubdomain(subdomain: string): Promise<SubdomainCheckResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/v2/subdomain/check?subdomain=${encodeURIComponent(subdomain)}`, {
      // const response = await fetch(`${API_BASE_URL}/v2subdomaincheck?subdomain=${encodeURIComponent(subdomain)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error checking subdomain:', error);
      throw new Error('Failed to check subdomain availability');
    }
  },

  async requestVerification(identifier: string, type: 'email' | 'phone'): Promise<VerificationRequestResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/v2/verification/request`, {
      // const response = await fetch(`${API_BASE_URL}/v2verificationrequest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          [type]: identifier,
          type,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const error: any = new Error(`HTTP error! status: ${response.status}`);
        error.data = data;
        throw error;
      }

      return data;
    } catch (error: any) {
      console.error('Error requesting verification:', error);
      if (error.data) {
        throw error;
      }
      throw new Error(`Failed to send verification code to ${type}`);
    }
  },

  async verifyCode(code: string, identifier: string, type: 'email' | 'phone'): Promise<VerificationVerifyResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/v2/verification/verify`, {
      // const response = await fetch(`${API_BASE_URL}/v2verificationverify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code,
          identifier,
          type,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const error: any = new Error(`HTTP error! status: ${response.status}`);
        error.data = data;
        throw error;
      }

      return data;
    } catch (error: any) {
      console.error('Error verifying code:', error);
      if (error.data) {
        throw error;
      }
      throw new Error('Failed to verify code');
    }
  },

  async registerOrganization(data: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    businessName: string;
    subdomain: string;
    planId?:string;
  }): Promise<RegistrationResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/v2/organizations/register`, {
      // const response = await fetch(`${API_BASE_URL}/v2organizationsregister`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const responseData = await response.json();

      if (!response.ok) {
        const error: any = new Error(`HTTP error! status: ${response.status}`);
        error.data = responseData;
        throw error;
      }

      return responseData;
    } catch (error: any) {
      console.error('Error registering organization:', error);
      if (error.data) {
        throw error;
      }
      throw new Error('Failed to register organization');
    }
  },
};
