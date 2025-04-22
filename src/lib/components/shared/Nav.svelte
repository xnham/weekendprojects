<script>
  import { onMount } from 'svelte';
  
  // Props
  export let currentPage = 'home';
  
  // State
  let isMenuOpen = false;
  let isScrolled = false;
  
  // Toggle mobile menu
  function toggleMenu() {
    isMenuOpen = !isMenuOpen;
  }
  
  // Close menu when clicking outside or navigating
  function closeMenu() {
    isMenuOpen = false;
  }
  
  // Handle scrolling effect
  onMount(() => {
    const handleScroll = () => {
      isScrolled = window.scrollY > 30;
    };
    
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  });
</script>

<nav class="nav" class:scrolled={isScrolled}>
  <div class="nav-container">
    <div class="nav-logo">
      <a href="/">
        <img src="/images/eggs_ham.png" alt="xnham logo" title="xnham" />
      </a>
    </div>
    
    <button 
      class="nav-hamburger" 
      aria-label="Toggle navigation menu"
      aria-expanded={isMenuOpen}
      on:click={toggleMenu}
    >
      <span class="hamburger-line"></span>
      <span class="hamburger-line"></span>
      <span class="hamburger-line"></span>
    </button>
    
    <ul class="nav-links" class:open={isMenuOpen}>
      <li><a href="/" class:active={currentPage === 'home'}>Portfolio</a></li>
      <li><a href="/next" class:active={currentPage === 'next'}>Next</a></li>
      <li><a href="/writing" class:active={currentPage === 'writing'}>Writing</a></li>
      <li><a href="/about" class:active={currentPage === 'about'}>About</a></li>
      <li><a href="/contact" class:active={currentPage === 'contact'}>Contact</a></li>
    </ul>
  </div>
</nav>

{#if isMenuOpen}
  <div class="overlay" on:click={closeMenu}></div>
{/if}

<style>
  .nav {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    z-index: 1000;
    transition: background-color 0.3s ease;
    font-family: 'Roboto', sans-serif;
  }
  
  .nav.scrolled {
    background-color: var(--light-100);
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  }
  
  .nav-container {
    max-width: 1200px;
    margin: 0 auto;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 40px;
  }
  
  .nav-logo img {
    height: 32px;
    width: auto;
  }
  
  .nav-links {
    display: flex;
    list-style: none;
    gap: 30px;
  }
  
  .nav-links a {
    color: var(--dark-80);
    text-decoration: none;
    font-size: 16px;
    font-weight: 500;
    transition: color 0.2s ease;
  }
  
  .nav-links a:hover, 
  .nav-links a.active {
    color: var(--purple-100);
  }
  
  .nav-hamburger {
    display: none;
    background: none;
    border: none;
    cursor: pointer;
    padding: 10px;
  }
  
  .hamburger-line {
    display: block;
    width: 25px;
    height: 2px;
    background-color: var(--dark-80);
    margin: 5px 0;
    transition: transform 0.3s ease, opacity 0.3s ease;
  }
  
  .overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0,0,0,0.5);
    z-index: 900;
  }
  
  /* Media Queries */
  @media (max-width: 768px) {
    .nav-container {
      padding: 15px 20px;
    }
    
    .nav-links {
      position: fixed;
      top: 70px;
      left: 0;
      right: 0;
      flex-direction: column;
      background-color: var(--light-100);
      padding: 20px;
      gap: 20px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      transform: translateY(-150%);
      transition: transform 0.3s ease;
      z-index: 1000;
    }
    
    .nav-links.open {
      transform: translateY(0);
    }
    
    .nav-hamburger {
      display: block;
      z-index: 1001;
    }
    
    .nav-hamburger[aria-expanded="true"] .hamburger-line:nth-child(1) {
      transform: translateY(7px) rotate(45deg);
    }
    
    .nav-hamburger[aria-expanded="true"] .hamburger-line:nth-child(2) {
      opacity: 0;
    }
    
    .nav-hamburger[aria-expanded="true"] .hamburger-line:nth-child(3) {
      transform: translateY(-7px) rotate(-45deg);
    }
  }
</style> 