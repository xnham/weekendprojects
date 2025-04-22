import { supabase } from '../supabase';

// Define the contact form data interface
export interface ContactFormData {
  name: string;
  email: string;
  message: string;
}

export interface SubmitResult {
  success: boolean;
  error?: string;
  data?: any;
}

/**
 * Submits a contact form to Supabase and sends email notification via FormSubmit
 * @param formData The contact form data to submit
 * @returns A result object indicating success or failure
 */
export async function submitContactForm(formData: ContactFormData): Promise<SubmitResult> {
  try {
    // Add a timestamp to the submission
    const submission = {
      ...formData,
      created_at: new Date().toISOString()
    };

    // Insert the contact form data into your Supabase table
    const { data, error } = await supabase
      .from('contact_submissions')
      .insert(submission);

    if (error) throw error;

    // Send email notification via FormSubmit
    const formSubmitData = new FormData();
    formSubmitData.append('name', formData.name);
    formSubmitData.append('email', formData.email);
    formSubmitData.append('message', formData.message);
    
    // FormSubmit customization options
    formSubmitData.append('_subject', 'New Contact Form Submission');
    formSubmitData.append('_replyto', formData.email);
    formSubmitData.append('_captcha', 'false');
    
    // Send to FormSubmit using obfuscated email
    const emailResponse = await fetch('https://formsubmit.co/296313ad9901bdf7df20d9e5275fdf95', {
      method: 'POST',
      body: formSubmitData,
      headers: {
        'Accept': 'application/json'
      }
    });
    
    if (!emailResponse.ok) {
      console.error('FormSubmit API error:', await emailResponse.text());
      throw new Error('Failed to send email notification');
    }

    return { 
      success: true,
      data
    };
  } catch (error) {
    console.error('Error submitting contact form:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'An unknown error occurred'
    };
  }
}

// Email validation helper function
export function validateEmail(email: string): boolean {
  const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
} 