<script lang="ts">
  import { onMount } from 'svelte';
  import { metadata } from '$lib/stores/metadataStore';
  import { FontAwesomeIcon } from '@fortawesome/svelte-fontawesome';
  import { submitContactForm, validateEmail } from '$lib/services/contactService';
  
  // Form data
  let name = '';
  let email = '';
  let message = '';
  let submitted = false;
  let submitting = false;
  
  // Check if email is valid
  $: isEmailValid = email.trim() === '' || validateEmail(email);
  
  // Check if form is valid
  $: isFormValid = name.trim() !== '' && email.trim() !== '' && message.trim() !== '' && validateEmail(email);
  
  onMount(() => {
    metadata.set({
      title: "Contact | Wendy Ham's Weekend Projects",
      description: "Get in touch to discuss collaboration ideas, personal software solutions, or shared interests.",
      canonicalUrl: "https://xnham.com/contact",
      type: "website",
      url: window.location.href
    });
  });
  
  // Handle both Supabase submission and email notification
  async function handleSubmit(event) {
    // Prevent the default form submission
    event.preventDefault();
    
    if (!isFormValid) return;
    
    submitting = true;
    
    try {
      // Handle both Supabase and FormSubmit in one service call
      const result = await submitContactForm({
        name,
        email,
        message
      });
      
      if (result.success) {
        submitted = true;
        
        // Reset form after submission
        setTimeout(() => {
          name = '';
          email = '';
          message = '';
          submitted = false;
        }, 3000);
      }
    } catch (err) {
      console.error('Form submission error:', err);
      // Optional: Add user-visible error message here
    } finally {
      submitting = false;
    }
  }
</script>

<svelte:head>
  <title>Contact | Wendy Ham's Weekend Projects</title>
  <meta name="description" content="Get in touch to discuss collaboration ideas, personal software solutions, or shared interests." />
  <link rel="canonical" href="https://xnham.com/contact" />
  
  <!-- Open Graph -->
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://xnham.com/contact" />
  <meta property="og:title" content="Contact | Wendy Ham's Weekend Projects" />
  <meta property="og:description" content="Get in touch to discuss collaboration ideas, personal software solutions, or shared interests." />
</svelte:head>

<div class="container">
  <h2 class="small-bottom-margin">
    Tell Me about <span class="purple">You.</span>
  </h2>

  <div class="contact-intro">
    <p>
      Please reach out if you have a collaboration idea, a tool I can
      help you build, or if you just feel like we have a common interest.
      I will respond within 24 hours.
    </p>
  </div>

  <div class="contact-form-wrapper">
    {#if submitted}
      <div class="success-message">
        <h3>Thank you for your message!</h3>
        <p>I'll get back to you soon.</p>
      </div>
    {:else}
      <!-- Using FormSubmit for email delivery -->
      <form 
        action="https://formsubmit.co/your-formsubmit-endpoint" 
        method="POST" 
        class="contact-form"
        on:submit={handleSubmit}
      >
        <!-- FormSubmit configuration -->
        <input type="hidden" name="_next" value="false">
        <input type="hidden" name="_captcha" value="false">
        <input type="hidden" name="_template" value="box">
        <input type="text" name="_honey" style="display:none">
        <input type="hidden" name="_subject" value="New message from your website">
      
        <div class="form-group">
          <label for="name">
            <FontAwesomeIcon icon={['fas', 'user']} />
            <span>Name</span>
          </label>
          <input 
            type="text" 
            id="name" 
            name="name"
            bind:value={name} 
            required 
            disabled={submitting}
          />
        </div>
        
        <div class="form-group">
          <label for="email">
            <FontAwesomeIcon icon={['far', 'envelope']} />
            <span>Email</span>
          </label>
          <input 
            type="email" 
            id="email" 
            name="email"
            bind:value={email} 
            required 
            disabled={submitting}
            class={email && !isEmailValid ? 'invalid' : ''}
          />
          {#if email && !isEmailValid}
            <div class="validation-message">Please enter a valid email address</div>
          {/if}
        </div>
        
        <div class="form-group">
          <label for="message">
            <FontAwesomeIcon icon={['fas', 'comment']} />
            <span>Message</span>
          </label>
          <textarea 
            id="message" 
            name="message"
            bind:value={message} 
            rows="5" 
            required 
            disabled={submitting}
          ></textarea>
        </div>
        
        <button 
          type="submit" 
          class="submit-button" 
          disabled={submitting || !isFormValid}
          class:disabled={submitting || !isFormValid}
        >
          <span class="button-icon">
            <FontAwesomeIcon icon={['far', 'envelope']} />
          </span>
          <span class="button-icon-text">
            {submitting ? 'Sending...' : 'Send Message'}
          </span>
        </button>
      </form>
    {/if}
  </div>
</div>

<style>
  .container {
    max-width: 800px;
    margin: 0 auto;
    padding: 2rem;
  }

  h2 {
    font-size: 2.5rem;
    text-align: center;
    margin-bottom: 1rem;
  }

  .contact-intro {
    width: 70%;
    margin: 0 auto 2rem;
    text-align: center;
  }

  .contact-intro p {
    font-size: 1.1rem;
    line-height: 1.6;
    color: var(--dark-70);
  }

  .contact-form-wrapper {
    width: 100%;
    max-width: 500px;
    margin: 0 auto;
  }

  .contact-form {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .form-group {
    display: flex;
    flex-direction: column;
  }

  label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: 500;
    margin-bottom: 0.5rem;
    color: var(--dark-80);
  }

  input, textarea {
    width: 100%;
    background-color: var(--light-100);
    padding: 12px;
    border: 1px solid var(--dark-60);
    border-radius: 5px;
    font-size: 15px;
    font-family: inherit;
    transition: border-color 0.3s ease;
    box-sizing: border-box;
  }

  input:focus, textarea:focus {
    outline: none;
    border-color: var(--dark-80);
    box-shadow: 0 0 0 1px var(--purple-30);
  }

  input.invalid {
    border-color: #dc3545;
    box-shadow: 0 0 0 1px rgba(220, 53, 69, 0.25);
  }

  .validation-message {
    color: #dc3545;
    font-size: 14px;
    margin-top: 5px;
  }

  textarea {
    resize: vertical;
  }

  .submit-button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    padding: 14px;
    background-color: var(--purple-100);
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 16px;
    cursor: pointer;
    transition: all 0.3s;
    box-sizing: border-box;
  }

  .submit-button:hover:not(:disabled) {
    background-color: var(--dark-purple-100);
    transform: scale(1.02);
    transition: transform 0.3s ease;
  }

  .submit-button.disabled {
    background-color: var(--purple-100);
    cursor: not-allowed;
    opacity: 0.7;
  }

  .button-icon-text {
    margin-left: 6px;
  }

  .success-message {
    background-color: var(--dark-5);
    padding: 2rem;
    border-radius: 8px;
    text-align: center;
  }
  
  .success-message h3 {
    color: var(--purple-100);
    margin-bottom: 1rem;
    font-size: 1.5rem;
  }

  /* Tablet responsiveness */
  @media (max-width: 768px) {
    .contact-intro {
      width: 100%;
    }
    
    .contact-form {
      width: 90%;
    }
  }
</style> 