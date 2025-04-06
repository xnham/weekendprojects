<script lang="ts">
    // Form data
    let name = '';
    let email = '';
    let message = '';
    let submitted = false;
    
    // Email validation function
    function validateEmail(email: string): boolean {
        const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    }
    
    // Check if email is valid
    $: isEmailValid = email.trim() === '' || validateEmail(email);
    
    // Check if form is valid
    $: isFormValid = name.trim() !== '' && email.trim() !== '' && message.trim() !== '' && validateEmail(email);

    // Form submission handler
    function handleSubmit() {
        if (!isFormValid) return;
        
        // Here you would typically handle the form submission
        // e.g., send data to a server
        console.log({ name, email, message });
        submitted = true;
        
        // Reset form after submission
        setTimeout(() => {
            name = '';
            email = '';
            message = '';
            submitted = false;
        }, 3000);
    }
</script>

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

    <form class="contact-form" on:submit|preventDefault={handleSubmit}>
        {#if submitted}
            <div class="success-message">
                <p>Thank you for your message! I'll get back to you soon.</p>
            </div>
        {:else}
            <div class="form-group">
                <label for="name">Name</label>
                <input type="text" id="name" bind:value={name} required />
            </div>
            
            <div class="form-group">
                <label for="email">Email</label>
                <input 
                    type="email" 
                    id="email" 
                    bind:value={email} 
                    class={email && !isEmailValid ? 'invalid' : ''} 
                    required 
                />
                {#if email && !isEmailValid}
                    <div class="validation-message">Please enter a valid email address</div>
                {/if}
            </div>
            
            <div class="form-group">
                <label for="message">Message</label>
                <textarea id="message" bind:value={message} rows="5" required></textarea>
            </div>
            
            <button 
                type="submit" 
                class="submit-button {!isFormValid ? 'disabled' : ''}" 
                disabled={!isFormValid}
            >
                Send Message
            </button>
        {/if}
    </form>
</div>

<style>
    .contact-intro {
        margin-bottom: 40px;
        width: 75%;
    }

    .contact-form {
        width: 75%;
        margin-bottom: 60px;
    }

    .form-group {
        width: 100%;
        margin-bottom: 20px;
    }

    label {
        display: block;
        margin-bottom: 5px;
        font-weight: 500;
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
        width: 100%;
        padding: 14px;
        background-color: var(--purple-100);
        color: white;
        border: none;
        border-radius: 6px;
        font-size: 16px;
        cursor: pointer;
        transition: background-color 0.3s;
        box-sizing: border-box;
    }

    .submit-button:hover {
        background-color: var(--dark-purple-100);
    }

    .submit-button.disabled {
        background-color: var(--purple-100);
        cursor: not-allowed;
        opacity: 0.7;
    }

    .success-message {
        background-color: #d4edda;
        color: #155724;
        padding: 15px;
        border-radius: 4px;
        margin-bottom: 20px;
    }

    /* Tablet responsiveness */
    @media (max-width: 768px) {
        .contact-intro {
            margin-bottom: 40px;
            width: 100%;
        }
        
        .contact-form {
            width: 100%;
        }
    }
</style>
