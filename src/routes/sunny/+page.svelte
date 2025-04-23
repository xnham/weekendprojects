<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { openSunnyModal } from '$lib/stores/sunnyModalStore';
  import { browser } from '$app/environment';
  import { page } from '$app/stores';
  
  onMount(() => {
    // Open the modal
    openSunnyModal();
    
    if (browser) {
      // This is a fallback route in case JavaScript doesn't intercept the link
      // Determine where to return to - first check query param
      let returnPath = $page.url.searchParams.get('from') || '/';
      
      // Go back to the referring page with minimal delay
      goto(returnPath, { replaceState: true });
    }
  });
</script>

<!-- This is a fallback page, visible only momentarily or if JS is disabled -->
<div class="container sunny-fallback">
  <p>Opening Sunny...</p>
  <p class="small-text">If nothing happens, <a href="/">click here to return to the homepage</a>.</p>
</div>

<style>
  .sunny-fallback {
    padding: 40px 0;
    text-align: center;
  }
  
  .small-text {
    font-size: 14px;
    margin-top: 10px;
    opacity: 0.8;
  }
</style> 