<script>
  // You can add any reactive variables or logic here if needed
</script>

<div class="container">
  <h2>
    Hi, I'm <span class="purple">Wendy Ham.</span>
  </h2>
  
  <div class="about-layout">
    <div class="about-row">
      <div class="about-timeline">
        <p>2024 →</p>
      </div>
      <div class="about-content">
        <p>I started using AI tools to build things that I wish existed.</p>
      </div>
    </div>
    
    <div class="about-row">
      <div class="about-timeline">
        <p>2015 →</p>
      </div>
      <div class="about-content">
        <p>I cofounded a SaaS company called <a href="https://www.ocamsclub.com" target="_blank" rel="noopener">Ocams</a>. We launched one of the first systems in the market to automatically send tennis players their videos every time they play.</p>
        
        <p>There is one radical design choice we made with Ocams that I find interesting to reflect on: interfaceless SaaS.</p>
        
        <p>Interfaceless SaaS is just a term I made up, but I believe it is something the tech world is transitioning into. While building Ocams, I felt strongly about not making our tennis club partners manage yet another interface on top of a variety of other SaaS interfaces they already had to deal with. Instead, we adapted our system to fit each partner club's existing workflow, affording them the luxury of simply carrying on with their existing ways of being. This is what software will gift us in the immediate future. It'll run our lives quietly in the background with no new buttons to push.</p>
      </div>
    </div>
    
    <div class="about-row">
      <div class="about-timeline">
        <p>← 2015</p>
      </div>
      <div class="about-content">
        <p>Before Ocams, I explored different corners of academia. At MIT, I studied molecular biology and contributed to cognitive science research in language and thought. Later, at Harvard, I managed a neurobiology laboratory and helped develop a pioneering initiative for online case-based simulations in medical training. I then earned a PhD at Wharton, where I built computational models of networks to study what makes agents learn better and create more accurate forecasts. A highlight I deeply cherish in my academic wandering was a summer month spent at the Santa Fe Institute, which gave me <a href="https://www.amazon.com/dp/0671872346" target="_blank" rel="noopener">a new lens to see the world</a>.</p>
      </div>
    </div>
    
    <div class="about-row">
      <div class="about-timeline">
        <p>← all that</p>
      </div>
      <div class="about-content">
        <p>I grew up in Jakarta, Indonesia.</p>
      </div>
    </div>
  </div>
  
  <div class="spacer">
  </div>
</div>

<style>
  h2 {
    margin-bottom: 100px;
  }
  
  .about-layout {
    width: 75%;
    display: flex;
    flex-direction: column;
    gap: 0;
  }
  
  .about-row {
    display: flex;
    margin-bottom: 40px;
  }

  .about-row:last-child {
    margin-bottom: 0;
  }
  
  .about-timeline {
    flex: 0 0 100px;
    width: 100px;
    padding-right: 30px;
    padding-bottom: 30px;
    border-right: 1px solid var(--dark-100);
    border-bottom: 1px solid var(--dark-100);
    white-space: nowrap;
    color: var(--dark-80);
  }
  
  .about-content {
    flex: 1;
    padding-left: 40px;
    padding-bottom: 30px;
    border-bottom: 1px solid var(--dark-100);
  }
  
  .about-content p {
    margin-bottom: 1.5rem;
  }
  
  .about-content p:last-child {
    margin-bottom: 0;
  }
  
  /* Mobile responsiveness */
  @media (max-width: 768px) {
    .about-layout {
      width: 100%;
    }
    
    .about-timeline {
      flex: 0 0 90px;
      width: 90px;
      padding-right: 15px;
    }
    
    .about-content {
      padding-left: 20px;
    }
  }
</style>