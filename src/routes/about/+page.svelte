<script lang="ts">
  import { onMount } from 'svelte';
  import { updateMetadata } from '$lib/stores/metadataStore';
  
  onMount(() => {
    updateMetadata({
      title: "About | Wendy Ham's Weekend Projects",
      description: "From academia to tennis and software.",
      type: "profile",
      canonicalUrl: "https://xnham.com/about"
    });
  });

  // You can add any reactive variables or logic here if needed
</script>

<div class="container">
  <h2>
    Hi, I'm <span class="purple">Wendy Ham.</span>
  </h2>

  <div class="about-layout">
    <div class="about-row">
      <div class="about-timeline">
        <p><span class="year">2024</span> <span class="arrow">→</span></p>
      </div>
      <div class="about-content">
        <p>
          Having accumulated a long list of business and personal
          problems, I started using AI tools to build various pieces of '<a
            href="/writing/software-for-one"
            class="essay-card-link">software for one</a
          >' to solve them.
          <span id="hide"
            >Surprised by the meaningful impact they delivered, particularly
            given their simplicity, I felt encouraged to build more hyper-custom
            solutions and uncover the implications of this new style of software
            development.</span
          >
        </p>
      </div>
    </div>

    <div class="about-row">
      <div class="about-timeline">
        <p><span class="year">2015</span> <span class="arrow">→</span></p>
      </div>
      <div class="about-content">
        <p>
          I cofounded a SaaS company called <a
            href="https://www.ocamsclub.com"
            target="_blank"
            rel="noopener">Ocams</a
          >. It was among the early systems for automating video recording and
          delivery for tennis players.
        </p>

        <p>
          In my interactions with clients, I kept noticing that technology often
          faltered not because of technical shortcomings but because there
          was no interface capable of delivering it smoothly to users with
          complex and diverse behaviors, creating a '<a
            href="/writing/the-last-mile"
            class="essay-card-link">last mile</a
          >' problem.
        </p>
      </div>
    </div>

    <div class="about-row">
      <div class="about-timeline">
        <p><span class="arrow">←</span> <span class="year">2015</span></p>
      </div>
      <div class="about-content">
        <p>
          Before Ocams, I spent many years in academia, largely due to visa restrictions.
        </p>

        <p>
          I started out studying molecular biology as an undergraduate at MIT.
          Later, I managed a neurobiology laboratory and helped develop
          case-based medical training simulations at Harvard Medical School. I
          then pursued a PhD at Wharton, where I built computational models to
          study how different choices and attributes help people learn better
          and make more accurate predictions. While at Wharton, I was also introduced to complexity science through a summer program at the Santa Fe Institute.
        </p>

        <span id="hide"><p>
          In grad school, I spent a summer month at the Santa Fe Institute,
          where I was introduced to complexity science. I loved its premise:
          that universal principles can govern systems as different as ant
          colonies, economies, and weather systems. It gave me a new way to look
          past rigid disciplinary boundaries and synthesize insights across
          them.
        </p>
        </span>

        <p>
          Around 2015, I received my green card, which allowed me to pursue projects outside academia. After years of theoretical work, I was eager to
          create something that delivered value directly to people.
          Tennis happened to be my obsession at the time, and I observed a need
          in the tennis community that prompted me to start Ocams.
        </p>
      </div>
    </div>

    <div class="about-row">
      <div class="about-timeline">
        <p><span class="arrow">←</span> <span class="year">all that</span></p>
      </div>
      <div class="about-content">
        <p>I grew up in Jakarta, Indonesia in a family that ran an egg business.</p>
      </div>
    </div>
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

  #hide {
    display: none;
  }

  /* Tablet responsiveness */
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

  /* Mobile responsiveness */
  @media (max-width: 576px) {
    .about-timeline {
      flex: 0 0 60px;
      width: 60px;
    }

    .about-timeline p {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
    }

    .about-timeline .arrow,
    .about-timeline .year {
      display: block;
    }
  }
</style>