<script lang="ts">
  import { onMount } from 'svelte';
  
  // Accept currentPage as a prop
  export let currentPage = 'home';
  
  let isMenuOpen = false;
  let isDesktop = true;
  let isLogoHovered = false;
  
  const staticLogoSrc = '/images/eggs_ham.png';
  const animatedLogoSrc = '/images/eggs_ham_animated.gif';
  
  function toggleMenu() {
    isMenuOpen = !isMenuOpen;
  }
  
  function closeMenu() {
    isMenuOpen = false;
  }
  
  function handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter' || event.key === ' ') {
      toggleMenu();
    }
    if (event.key === 'Escape') {
      closeMenu();
    }
  }
  
  function checkScreenSize() {
    isDesktop = window.innerWidth > 768;
    if (isDesktop) closeMenu();
  }
  
  onMount(() => {
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => {
      window.removeEventListener('resize', checkScreenSize);
    };
  });
</script>

<nav class="nav">
  <div class="nav-container">
    <div class="nav-logo">
      <a href="/">
        <img 
          src={isLogoHovered ? animatedLogoSrc : staticLogoSrc} 
          alt="xnham logo" 
          title="xnham"
          on:mouseenter={() => isLogoHovered = true}
          on:mouseleave={() => isLogoHovered = false}
        />
      </a>
    </div>
    
    <button 
      class="nav-hamburger" 
      class:active={isMenuOpen} 
      on:click={toggleMenu}
      on:keydown={handleKeyDown}
      aria-expanded={isMenuOpen}
      aria-label="Toggle navigation menu"
    >
      <span class="hamburger-line"></span>
      <span class="hamburger-line"></span>
      <span class="hamburger-line"></span>
    </button>
    
    <ul class="nav-links" class:active={isMenuOpen}>
      <li><a href="/" class:active={currentPage === 'home'}>Portfolio</a></li>
      <li><a href="/next" class:active={currentPage === 'next'}>Next</a></li>
      <li><a href="/about" class:active={currentPage === 'about'}>About</a></li>
    </ul>
  </div>
</nav>

<style>
  .nav {
    width: 100%;
    color: var(--pure-white-100);
    margin-bottom: 60px;
  }

  .nav-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  /* Nav Logo */
  .nav-logo a {
    display: block;
    text-decoration: none;
    cursor: pointer;
  }

  .nav-logo img {
    height: 140px;
    width: auto;
    display: block;
    padding: 20px 40px 5px 40px;
  }

  /* Nav Links */
  .nav-links {
    list-style: none;
    display: flex;
    gap: 2.4rem;
    padding: 5px 40px 5px 40px;
    background-color: var(--dark-70);
  }

  .nav-links a {
    text-decoration: none;
    font-weight: 400;
    transition: opacity 0.2s ease;
    color: var(--pure-white-100);
    opacity: 0.8;
  }

  .nav-links a:hover, .nav-links a.active {
    opacity: 1;
  }
  
  /* Hamburger menu */
  .nav-hamburger {
    display: none;
    flex-direction: column;
    justify-content: space-between;
    width: 30px;
    height: 21px;
    cursor: pointer;
    margin-right: 20px;
    z-index: 100;
    background: transparent;
    border: none;
    padding: 0;
  }
  
  .hamburger-line {
    display: block;
    height: 3px;
    width: 100%;
    background-color: var(--dark-100);
    transition: all 0.3s ease;
  }
  
  /* Mobile styles */
  @media (max-width: 768px) {
    .nav-hamburger {
      display: flex;
    }
    
    .nav-links {
      position: fixed;
      top: 0;
      right: -100%;
      height: 100vh;
      width: 70%;
      max-width: 300px;
      background-color: var(--dark-80);
      flex-direction: column;
      align-items: center;
      justify-content: center;
      transition: right 0.3s ease;
      z-index: 90;
    }
    
    .nav-links.active {
      right: 0;
    }
    
    /* Hamburger animation */
    .nav-hamburger.active .hamburger-line:nth-child(1) {
      transform: translateY(9px) rotate(45deg);
    }
    
    .nav-hamburger.active .hamburger-line:nth-child(2) {
      opacity: 0;
    }
    
    .nav-hamburger.active .hamburger-line:nth-child(3) {
      transform: translateY(-9px) rotate(-45deg);
    }
  }
</style>
