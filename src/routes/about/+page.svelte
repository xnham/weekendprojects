<script>
  import { onMount } from 'svelte';
  import { metadata } from '$lib/stores/metadataStore';
  
  onMount(() => {
    metadata.set({
      title: "About | Wendy Ham's Weekend Projects",
      description: "From academia to tennis and software.",
      canonicalUrl: "https://xnham.com/about",
      type: "profile",
      url: window.location.href
    });
  });
</script>

<svelte:head>
  <title>About | Wendy Ham's Weekend Projects</title>
  <meta name="description" content="From academia to tennis and software." />
  <link rel="canonical" href="https://xnham.com/about" />
  
  <!-- Open Graph -->
  <meta property="og:type" content="profile" />
  <meta property="og:url" content="https://xnham.com/about" />
  <meta property="og:title" content="About | Wendy Ham's Weekend Projects" />
  <meta property="og:description" content="From academia to tennis and software." />
  <meta property="og:image" content="/images/og-image.png" />
</svelte:head>

<div class="container">
  <div class="about-content">
    <h2>Hi, I'm <span class="purple">Wendy Ham.</span></h2>
    
    <div class="about-image">
      <img src="/images/wendy.jpg" alt="Wendy Ham" />
    </div>
    
    <div class="about-text">
      <p>I build personalized software that solves real problems in my life.</p>
      
      <p>After spending years in academia and working with enterprise tools, I realized that the software I needed didn't exist. So I started building it myself — small, focused applications designed to solve specific problems.</p>
      
      <p>My background spans cognitive science, machine learning, and user experience design. I'm passionate about creating software that respects people's time, attention, and agency.</p>
      
      <p>When I'm not coding, you'll find me playing tennis, reading books on cognitive science, or exploring new hiking trails.</p>
      
      <h3>The "Software for One" Philosophy</h3>
      
      <p>I believe in building software that:</p>
      
      <ul>
        <li>Solves real problems, not hypothetical ones</li>
        <li>Is designed for a specific person (usually me) rather than a generic user</li>
        <li>Respects attention and cognitive bandwidth</li>
        <li>Values simplicity over features</li>
        <li>Can be extended by its users</li>
      </ul>
      
      <p>Want to chat about personalized software, weekend projects, or tennis? <a href="/contact">Drop me a line</a>.</p>
    </div>
  </div>
</div>

<style>
  .about-content {
    max-width: 800px;
    margin: 0 auto;
    padding: 2rem 0 4rem;
  }
  
  h2 {
    font-size: 2.5rem;
    margin-bottom: 2rem;
    text-align: center;
  }
  
  h3 {
    font-size: 1.5rem;
    margin: 2rem 0 1rem;
    color: var(--dark-80);
  }
  
  .about-image {
    width: 200px;
    height: 200px;
    border-radius: 50%;
    overflow: hidden;
    margin: 0 auto 2rem;
    border: 3px solid var(--purple-100);
  }
  
  .about-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .about-text p {
    margin-bottom: 1.25rem;
    font-size: 1.1rem;
    line-height: 1.7;
    color: var(--dark-80);
  }
  
  ul {
    margin-bottom: 1.5rem;
    padding-left: 1.5rem;
  }
  
  li {
    margin-bottom: 0.5rem;
    font-size: 1.05rem;
    line-height: 1.6;
    color: var(--dark-80);
  }
  
  @media (max-width: 768px) {
    .about-content {
      padding: 1rem 1.5rem 3rem;
    }
    
    h2 {
      font-size: 2rem;
    }
  }
</style> 