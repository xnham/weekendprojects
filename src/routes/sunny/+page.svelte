<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { openSunnyModal } from '$lib/stores/sunnyModalStore';
  
  onMount(() => {
    // Open the modal
    openSunnyModal();
    
    // Redirect to home page with a small delay
    setTimeout(() => {
      goto('/');
    }, 100);
  });
</script>

<!-- This is a redirect page, no content needed --> 