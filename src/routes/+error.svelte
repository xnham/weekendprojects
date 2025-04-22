<script>
  import { page } from '$app/stores';
</script>

<div class="error-container">
  <h1>{$page.status}: {$page.error?.message}</h1>
  <p>Sorry, something went wrong.</p>
  <a href="/">Go back home</a>
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
  }
  
  h1 {
    font-size: 2rem;
    margin-bottom: 1rem;
  }
  
  a {
    margin-top: 2rem;
    padding: 10px 20px;
    background-color: #333;
    color: white;
    text-decoration: none;
    border-radius: 4px;
  }
  
  a:hover {
    background-color: #555;
  }
</style> 