<script>
  import FuturePortfolio from '../components/FuturePortfolio.svelte';
</script>

<div class="container">
  <h2 class="small-bottom-margin">Tell Me What to Build <span class="purple">Next.</span></h2>
  
  <div class="future-project-intro">
    <p>Like the projects that resonate with you. Follow the ones you want early access to.</p>
    <p>If you have your own project idea, how about having a chat with <a href="/mr-benedict">Mr. Benedict</a>, my gentle robot?</p>
  </div>
  
  <FuturePortfolio />
</div>

<style>
  
  .small-bottom-margin {
    margin-bottom: 20px;
  }
  
  .purple {
    color: var(--purple-100);
  }
  
  .future-project-intro {
    margin-bottom: 60px;
    width: 75%
  }
  
  .future-project-intro a {
    color: var(--dark-85);
    text-decoration: none;
    border-bottom: 1px solid var(--dark-100);
    transition: opacity 0.2s ease;
  }
  
  .future-project-intro a:hover {
    opacity: 0.7;
  }
  
  /* Mobile responsiveness */
  @media (max-width: 768px) {
    h2 {
      font-size: 42px;
    }
  }
</style>
