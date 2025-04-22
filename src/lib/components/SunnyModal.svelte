<script>
  import { fade, scale } from "svelte/transition";
  import { onMount, onDestroy } from "svelte";
  import { FontAwesomeIcon } from "@fortawesome/svelte-fontawesome";

  // Local state for this specific modal
  export let isOpen = false;
  let email = "";
  let submitting = false;
  let modalElement;
  
  // Form state
  let formStatus = null;
  let messageReceived = false;

  // Handle escape key
  function handleKeydown(event) {
    if (event.key === "Escape") {
      isOpen = false;
    }
  }

  // Handle click outside
  function handleClickOutside(event) {
    if (
      modalElement &&
      event.target instanceof Node &&
      !modalElement.contains(event.target) &&
      event.target.classList.contains("sunny-modal-backdrop")
    ) {
      isOpen = false;
    }
  }

  // Form submission handler
  function handleSubmit(event) {
    event.preventDefault();
    
    if (email && !submitting) {
      submitting = true;
      
      // Simulate message received (in a real implementation, this would be an API call)
      setTimeout(() => {
        submitting = false;
        messageReceived = true;
      }, 1500);
    }
  }
  
  // Call number
  function callSunny() {
    // This is a placeholder for the phone functionality
    window.location.href = "tel:+17075551234";
  }
  
  // Close modal on unmount
  onDestroy(() => {
    document.removeEventListener("keydown", handleKeydown);
  });
  
  // Set up event listeners when component mounts
  onMount(() => {
    document.addEventListener("keydown", handleKeydown);
    
    return () => {
      document.removeEventListener("keydown", handleKeydown);
    };
  });
</script>

{#if isOpen}
  <div 
    class="sunny-modal-backdrop" 
    transition:fade={{ duration: 200 }}
    on:click={handleClickOutside}
  >
    <div 
      class="sunny-modal-container" 
      transition:scale={{ duration: 300, start: 0.95 }}
      bind:this={modalElement}
    >
      <button on:click={() => isOpen = false} class="close-button">
        <span>&times;</span>
      </button>
      
      <div class="sunny-modal-content">
        <div class="sunny-modal-header">
          <div class="sunny-avatar">
            <img 
              src="/images/sunny-avatar.jpg" 
              alt="Sunny - AI Assistant" 
              class="sunny-avatar-img" 
              onerror="this.src='/images/sunny-fallback.jpg'" 
            />
          </div>
          
          <h2 class="sunny-modal-title">
            Hi, I'm Sunny
          </h2>
          
          <p class="sunny-modal-subtitle">
            Wendy's personalized AI assistant
          </p>
        </div>
        
        {#if messageReceived}
          <div class="sunny-modal-success-message">
            <h3>Thanks for your message!</h3>
            <p>I'll get back to you soon with news about upcoming features.</p>
            <button on:click={() => { messageReceived = false; email = ""; }} class="modal-action-btn">
              Send another message
            </button>
          </div>
        {:else}
          <div class="sunny-options-container">
            <div class="sunny-option">
              <h3 class="sunny-modal-option">
                Get notified when Sunny launches
              </h3>
              
              <div class="sunny-modal-option-description">
                <form on:submit={handleSubmit} class="sunny-notification-form">
                  <input 
                    type="email" 
                    placeholder="Your email" 
                    bind:value={email} 
                    required 
                    disabled={submitting}
                  />
                  <button 
                    type="submit" 
                    class="modal-action-btn" 
                    disabled={submitting}
                  >
                    <span class="button-icon">
                      <FontAwesomeIcon icon={['fas', 'bell']} />
                    </span>
                    <span class="button-icon-text">
                      {submitting ? 'Sending...' : 'Notify me'}
                    </span>
                  </button>
                </form>
              </div>
            </div>
            
            <div class="sunny-option">
              <h3 class="sunny-modal-option">
                Call Sunny directly
              </h3>
              
              <div class="sunny-modal-option-description sunny-modal-option-description-phone" on:click={callSunny}>
                <button class="modal-action-btn phone-btn">
                  <span class="button-icon">
                    <FontAwesomeIcon icon={['fas', 'phone']} />
                  </span>
                  <span class="button-icon-text">
                    Call Sunny
                  </span>
                </button>
              </div>
            </div>
          </div>
        {/if}
      </div>
    </div>
  </div>
{/if}

<style>
  /* =====================
     1. BACKDROP & CONTAINER
     ===================== */
  .sunny-modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    backdrop-filter: blur(3px);
  }
  
  .sunny-modal-container {
    position: relative;
    width: 90%;
    max-width: 550px;
    background-color: var(--light-100);
    border-radius: 16px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
    overflow: hidden;
    padding: 0 80px;
  }
  
  /* =====================
     2. HEADER STYLING
     ===================== */
  .sunny-modal-header {
    padding: 30px 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  
  .sunny-avatar {
    width: 90px;
    height: 90px;
    border-radius: 50%;
    overflow: hidden;
    margin-bottom: 18px;
    border: 3px solid var(--purple-100);
  }
  
  .sunny-avatar-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .sunny-modal-title {
    font-size: 28px;
    margin: 0 0 8px 0;
    color: var(--dark-90);
  }
  
  .sunny-modal-subtitle {
    font-size: 16px;
    color: var(--dark-60);
    margin: 0;
  }
  
  /* =====================
     3. CONTENT STYLING
     ===================== */
  .sunny-modal-content {
    display: flex;
    flex-direction: column;
    padding-bottom: 40px;
  }
  
  .sunny-options-container {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
  
  .sunny-option {
    padding: 0 30px;
  }
  
  .sunny-modal-option {
    font-size: 16px;
    margin: 0 0 12px 0;
    color: var(--dark-70);
    text-align: center;
  }
  
  .sunny-modal-option-description {
    background-color: var(--dark-2);
    border-radius: 12px;
    padding: 12px;
    transition: all 0.3s ease;
  }
  
  /* =====================
     4. FORM STYLING
     ===================== */
  .sunny-notification-form {
    display: flex;
    width: 100%;
  }
  
  .sunny-notification-form input {
    flex: 1;
    padding: 10px 14px;
    border: 1px solid var(--dark-10);
    border-radius: 6px 0 0 6px;
    font-size: 14px;
    outline: none;
  }
  
  .sunny-notification-form input:focus {
    border-color: var(--purple-60);
  }
  
  /* =====================
     5. BUTTON STYLING
     ===================== */
  .modal-action-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: var(--purple-100);
    color: white;
    border: none;
    border-radius: 0 6px 6px 0;
    padding: 0 16px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s ease;
    height: 100%;
    white-space: nowrap;
  }
  
  .sunny-modal-option-description-phone {
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: var(--dark-10);
    border-radius: 30px;
    padding: 8px 8px 8px 16px;
    cursor: pointer;
    transition: all 0.3s ease;
    margin-left: 10px;
  }
  
  .phone-btn {
    background-color: transparent;
    color: var(--dark-80);
    border-radius: 6px;
  }
  
  .sunny-modal-option-description-phone:hover {
    background-color: var(--dark-20);
  }
  
  .button-icon {
    margin-right: 6px;
  }
  
  .close-button {
    position: absolute;
    top: 20px;
    right: 20px;
    background: transparent;
    border: none;
    font-size: 24px;
    color: var(--dark-60);
    cursor: pointer;
    transition: color 0.2s ease;
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
  }
  
  .close-button:hover {
    color: var(--dark-90);
  }
  
  /* =====================
     6. SUCCESS MESSAGE
     ===================== */
  .sunny-modal-success-message {
    text-align: center;
    padding: 20px;
    background-color: var(--dark-5);
    border-radius: 12px;
    margin: 0 30px;
  }
  
  .sunny-modal-success-message h3 {
    color: var(--purple-100);
    margin: 0 0 10px 0;
    font-size: 18px;
  }
  
  .sunny-modal-success-message p {
    color: var(--dark-70);
    margin: 0 0 20px 0;
    font-size: 14px;
  }
  
  .sunny-modal-success-message button {
    background-color: var(--purple-100);
    color: white;
    border: none;
    border-radius: 6px;
    padding: 10px 18px;
    font-size: 14px;
    cursor: pointer;
    transition: background-color 0.2s ease;
  }
  
  .sunny-modal-success-message button:hover {
    background-color: var(--dark-purple-100);
  }
  
  /* =====================
     7. RESPONSIVE STYLES
     ===================== */
  /* Tablet */
  @media (max-width: 768px) {
    .sunny-modal-container {
      padding: 0 50px;
    }

    .sunny-modal-option {
      font-size: 14px;
    }

    .sunny-modal-option-description {
      font-size: 16px;
    }
  }

  /* Mobile large */
  @media (max-width: 576px) {
    .sunny-modal-container {
      width: 95%;
      padding: 0 clamp(10px, 5vw, 40px);
    }

    .sunny-modal-title {
      font-size: 22px;
    }

    .sunny-option {
      padding: 0 20px;
    }

    .sunny-modal-option-description {
      font-size: 14px;
    }

    .sunny-modal-option-description-phone {
      padding: 6px 6px 6px 12px;
      margin-left: 6px;
    }

    .close-button {
      top: 16px;
      right: 16px;
    }
  }

  /* Mobile small */
  @media (max-width: 375px) {
    .sunny-modal-option-description-phone {
      font-size: 14px;
      padding: 6px 2px 6px 8px;
      margin-left: 4px;
    }

    .sunny-option {
      padding: 0 14px;
    }

    .sunny-modal-option {
      font-size: 12px;
    }

    .modal-action-btn {
      font-size: 14px;
      padding: 0 2px 0 0;
    }

    .button-icon-text {
      margin-left: 2px;
    }
  }
</style> 