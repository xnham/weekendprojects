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
        <p>I started using AI tools to build "<a href="/writing/software-for-one" class="essay-card-link">software for one</a>."</p>
      </div>
    </div>
    
    <div class="about-row">
      <div class="about-timeline">
        <p>2015 →</p>
      </div>
      <div class="about-content">
        <p>I cofounded a SaaS company called <a href="https://www.ocamsclub.com" target="_blank" rel="noopener">Ocams</a>. It was among the early systems for automating video recording and delivery for tennis players.</p>
        
        <p>One design approach we took with Ocams was "interfaceless SaaS." Rather than creating another dashboard for our tennis club partners to manage, we adapted our system to work with each partner club's existing workflow. This meant they could continue using their familiar processes while our software ran quietly in the background, with no additional interfaces to learn or buttons to push for both club staff and players.</p>
      </div>
    </div>
    
    <div class="about-row">
      <div class="about-timeline">
        <p>← 2015</p>
      </div>
      <div class="about-content">
        <p>Before Ocams, I spent many years in academia. I studied molecular biology as an undergraduate student at MIT. Later, I managed a neurobiology laboratory and helped develop case-based medical training simulations at Harvard Medical School. I then pursued a PhD at Wharton, where I built computational models to study how different choices and attributes can make agents learn better and predict things more accurately.</p> 
        
        <p>A memorable part of my time in academia was a summer month at the Santa Fe Institute (SFI), where I was introduced to <a href="https://www.amazon.com/dp/0671872346" target="_blank" rel="noopener">complexity science</a>, which looks at how simple rules can give rise to rich, unpredictable behaviors in various domains—from social systems to biological and physical systems. This bottom-up approach gave me a new way of thinking that was a helpful complement to the traditional top-down analytic style I had encountered up to that point.</p>

        <p>Around 2015, equipped with a Green Card, I broke free from visa restrictions that had kept me in academia since college. After years of reading and writing papers, I was eager to actually build something—anything—that solved real problems. Tennis was my obsession at the time, and I saw a need in the tennis community that I could try to build a solution for.</p> 
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
    h2 {
      margin-bottom: 80px;
    }

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