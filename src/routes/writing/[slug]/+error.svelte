<script lang="ts">
  import { page } from '$app/stores';
  
  // Add type definition to handle custom error properties
  interface CustomError extends Error {
    details?: string;
  }
  
  // Create a typed reference to the error
  $: typedError = $page.error as CustomError;
</script>

<div class="error-container">
  <h1>{$page.status}</h1>
  <h2>Essay not found</h2>
  
  {#if typedError?.details}
    <div class="error-details">
      <p>{typedError.details}</p>
    </div>
  {/if}
  
  <p>Sorry, the essay you're looking for doesn't exist or couldn't be loaded.</p>
  
  <div class="actions">
    <a href="/writing" class="back-button">Back to all essays</a>
    <a href="/" class="home-button">Go home</a>
  </div>
</div>

<style>
  .error-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 60vh;
    text-align: center;
    padding: 0 20px;
    width: 75%;
    margin: 0 auto;
  }
  
  h1 {
    font-size: 2.5rem;
    margin-bottom: 0.5rem;
    font-family: "DM Serif Text", serif;
  }
  
  h2 {
    font-size: 1.8rem;
    margin-bottom: 1.5rem;
    font-family: "DM Serif Text", serif;
  }

  .error-details {
    background-color: #f8f8f8;
    padding: 1rem;
    border-radius: 4px;
    margin-bottom: 1.5rem;
    max-width: 600px;
    font-family: monospace;
    font-size: 0.9rem;
    color: #666;
  }
  
  .actions {
    display: flex;
    gap: 1rem;
    margin-top: 2rem;
  }
  
  .back-button, .home-button {
    padding: 10px 20px;
    text-decoration: none;
    border-radius: 4px;
  }
  
  .back-button {
    background-color: #333;
    color: white;
  }
  
  .home-button {
    border: 1px solid #333;
    color: #333;
  }
  
  .back-button:hover {
    background-color: #555;
  }
  
  .home-button:hover {
    background-color: #f0f0f0;
  }
  
  @media (max-width: 768px) {
    .error-container {
      width: 100%;
      height: 50vh;
    }
    
    .actions {
      flex-direction: column;
      gap: 0.5rem;
    }
  }
</style>