import { supabase } from '../lib/supabase';
import type { RegistrationData } from '../types/registration';

export const registrationService = {
  async checkSubdomainAvailability(subdomain: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('organizations')
      .select('subdomain')
      .eq('subdomain', subdomain.toLowerCase())
      .maybeSingle();

    if (error) {
      console.error('Error checking subdomain:', error);
      throw new Error('Failed to check subdomain availability');
    }

    return data === null;
  },

  async createOrganization(businessName: string, subdomain: string): Promise<string> {
    const { data, error } = await supabase
      .from('organizations')
      .insert({
        business_name: businessName,
        subdomain: subdomain.toLowerCase(),
        is_active: true,
      })
      .select('id')
      .single();

    if (error) {
      console.error('Error creating organization:', error);
      throw new Error('Failed to create organization');
    }

    return data.id;
  },

  async createUser(
    organizationId: string,
    firstName: string,
    lastName: string,
    email: string,
    phone: string
  ): Promise<string> {
    const { data, error } = await supabase
      .from('org_users')
      .insert({
        organization_id: organizationId,
        first_name: firstName,
        last_name: lastName,
        email: email.toLowerCase(),
        phone,
        is_owner: true,
        email_verified: false,
        phone_verified: false,
      })
      .select('id')
      .single();

    if (error) {
      console.error('Error creating user:', error);
      throw new Error('Failed to create user');
    }

    return data.id;
  },

  async sendVerificationCode(userId: string, type: 'email' | 'phone'): Promise<string> {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10);

    const { error } = await supabase
      .from('verification_codes')
      .insert({
        user_id: userId,
        code,
        type,
        verified: false,
        expires_at: expiresAt.toISOString(),
      });

    if (error) {
      console.error('Error sending verification code:', error);
      throw new Error('Failed to send verification code');
    }

    console.log(`[DEV] Verification code for ${type}: ${code}`);
    return code;
  },

  async verifyCode(userId: string, code: string, type: 'email' | 'phone'): Promise<boolean> {
    const { data, error } = await supabase
      .from('verification_codes')
      .select('*')
      .eq('user_id', userId)
      .eq('type', type)
      .eq('code', code)
      .eq('verified', false)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('Error verifying code:', error);
      return false;
    }

    if (!data) {
      return false;
    }

    const { error: updateError } = await supabase
      .from('verification_codes')
      .update({ verified: true })
      .eq('id', data.id);

    if (updateError) {
      console.error('Error updating verification status:', updateError);
      return false;
    }

    const field = type === 'email' ? 'email_verified' : 'phone_verified';
    await supabase
      .from('org_users')
      .update({ [field]: true })
      .eq('id', userId);

    return true;
  },

  async completeRegistration(data: RegistrationData): Promise<{ organizationId: string; userId: string; subdomain: string }> {
    const organizationId = await this.createOrganization(data.businessName, data.subdomain);
    const userId = await this.createUser(
      organizationId,
      data.firstName,
      data.lastName,
      data.email,
      data.phone
    );

    return { organizationId, userId, subdomain: data.subdomain };
  },
};
