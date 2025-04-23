<script lang="ts">
  import { FontAwesomeIcon } from '@fortawesome/svelte-fontawesome';
  import type { IconDefinition } from '@fortawesome/fontawesome-common-types';
  import type { SizeProp } from '@fortawesome/fontawesome-svg-core';
  import { 
    faHeart as fasHeart, 
    faShareFromSquare as fasShareFromSquare, 
    faBell as fasBell 
  } from '@fortawesome/free-solid-svg-icons';
  import { 
    faHeart as farHeart, 
    faShareFromSquare as farShareFromSquare, 
    faBell as farBell 
  } from '@fortawesome/free-regular-svg-icons';
  
  export let type: 'like' | 'share' | 'follow';
  export let active = false;
  export let count: number | undefined = undefined;
  export let showText = true;
  export let iconSize: SizeProp | undefined = undefined;
  export let loading = false;
  
  // Use proper icon imports instead of string arrays
  const icons = {
    like: { active: fasHeart, inactive: farHeart },
    share: { active: fasShareFromSquare, inactive: farShareFromSquare },
    follow: { active: fasBell, inactive: farBell },
  };
  
  const labels = {
    like: { active: 'Liked', inactive: 'Like' },
    share: { active: 'Shared', inactive: 'Share' },
    follow: { active: 'Following', inactive: 'Follow' },
  };

  // Track previous active state to detect transitions
  let wasActive = active;
  let unlikeAnimation = false;

  // When active changes, check if it's a transition from active to inactive
  $: {
    if (wasActive && !active && type === 'like') {
      unlikeAnimation = true;
      // Reset after animation duration
      setTimeout(() => {
        unlikeAnimation = false;
      }, 500); // 500ms matches the animation duration
    }
    wasActive = active;
  }

  $: activeClass = active ? `btn-${type === 'follow' ? 'followed' : `${type}d`}` : '';
</script>

<!-- 
  IMPORTANT: using on:click without assignment to directly forward 
  the native click event to the parent component 
-->
<button 
  class="interaction-btn {active ? 'active' : ''} {type}-btn {unlikeAnimation ? 'unlike-animation' : ''} {loading ? 'loading' : ''}"
  on:click
  aria-label="{type} {active ? 'active' : 'inactive'}"
  disabled={loading}
>
  <span class="icon-container">
    {#if type === 'like'}
      {#if active}
        <FontAwesomeIcon icon={icons.like.active} size={iconSize || 'sm'} />
      {:else}
        <FontAwesomeIcon icon={icons.like.inactive} size={iconSize || 'sm'} />
      {/if}
    {:else if type === 'follow'}
      {#if active}
        <FontAwesomeIcon icon={icons.follow.active} size={iconSize || 'sm'} />
      {:else}
        <FontAwesomeIcon icon={icons.follow.inactive} size={iconSize || 'sm'} />
      {/if}
    {:else if type === 'share'}
      {#if active}
        <FontAwesomeIcon icon={icons.share.active} size={iconSize || 'sm'} />
      {:else}
        <FontAwesomeIcon icon={icons.share.inactive} size={iconSize || 'sm'} />
      {/if}
    {/if}
  </span>
  {#if showText !== false}
    <span class="text">{labels[type][active ? 'active' : 'inactive']}</span>
  {/if}
  {#if count !== undefined}
    <span class="count">{count}</span>
  {/if}
</button>

<style>
  .interaction-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    background: none;
    padding: 6px 28px 6px 0;
    font-size: 14px;
    color: var(--dark-80);
    cursor: pointer;
    transition: all 0.2s ease;
  }

  /* Remove padding-right when this button is the last child */
  :global(.interaction-btn:last-child) {
    padding-right: 0;
  }

  .icon-container {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  /* Pulse animation keyframes */
  @keyframes iconPulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.2); }
    100% { transform: scale(1); }
  }
  
  /* Style for active state */
  .interaction-btn.like-btn.active :global(svg) {
    color: var(--dark-pink-100);
    animation: iconPulse 0.5s ease;
  }
  
  /* Style for unlike animation */
  .interaction-btn.like-btn.unlike-animation :global(svg) {
    animation: iconPulse 0.5s ease;
  }
  
  .interaction-btn.follow-btn.active :global(svg) {
    color: var(--dark-orange-100);
    animation: iconPulse 0.5s ease;
  }
  
  /* Text styles */
  .text {
    font-size: 14px;
  }
  
  /* Count styles */
  .count {
    font-size: 14px;
    margin-left: 2px;
    color: var(--dark-80);
  }
  
  /* Loading state styles */
  .interaction-btn.loading {
    opacity: 0.6;
    cursor: wait;
    pointer-events: none;
  }
</style>