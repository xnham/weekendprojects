<script>
  import { FontAwesomeIcon } from '@fortawesome/svelte-fontawesome';
  import { faHeart as faHeartSolid } from '@fortawesome/free-solid-svg-icons';
  import { faHeart as faHeartRegular } from '@fortawesome/free-regular-svg-icons';
  import { faShareNodes } from '@fortawesome/free-solid-svg-icons';
  import { faEye } from '@fortawesome/free-solid-svg-icons';
  
  // Props
  export let type = 'like'; // 'like', 'share', or 'view'
  export let count = 0;
  export let active = false;
  export let onClick = () => {};
  export let disabled = false;
  
  // CSS classes based on props
  $: buttonClass = `interaction-btn ${type}-btn ${active ? 'active' : ''} ${disabled ? 'disabled' : ''}`;
  
  // Determine which icon to use
  $: icon = 
    type === 'like' 
      ? (active ? faHeartSolid : faHeartRegular)
      : type === 'share'
        ? faShareNodes
        : faEye;
</script>

<button 
  class={buttonClass} 
  on:click={onClick}
  disabled={disabled}
  aria-label={`${type} button, count: ${count}`}
>
  <FontAwesomeIcon icon={icon} />
  <span class="interaction-count">{count}</span>
</button>

<style>
  .interaction-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 6px 12px;
    border-radius: 4px;
    border: 1px solid var(--dark-20);
    background-color: transparent;
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 14px;
    color: var(--dark-70);
  }
  
  .interaction-btn:hover:not(.disabled) {
    border-color: var(--dark-40);
    color: var(--dark-90);
  }
  
  .like-btn.active {
    color: var(--dark-pink-100);
    border-color: var(--dark-pink-100);
  }
  
  .interaction-count {
    font-family: 'Roboto', sans-serif;
    font-size: 14px;
    font-weight: 500;
  }
  
  .interaction-btn.disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
</style> 