<script lang="ts">
  // Get current year for copyright
  const currentYear = new Date().getFullYear();
</script>

<footer>
  <p class="footer-nav">
    <a href="/">Portfolio</a> | 
    <a href="/next">Next</a> |
    <a href="/writing">Writing</a> | 
    <a href="/about">About</a> | 
    <a href="/contact">Contact</a>
  </p>
  <p>© Wendy Ham {currentYear}</p>
</footer>

<style>
  footer {
    background-color: var(--dark-80);
    color: var(--pure-white-100);
    padding: 2.5rem 0;
    margin-top: 200px;
    font-size: 14px;
    font-weight: 600;
    text-align: center;
  }

  .footer-nav {
    font-weight: 600;
    color: var(--pure-white-100);
    display: flex;
    justify-content: center;
    flex-direction: row;
    margin-bottom: 1rem;
    gap: 1rem;
  }

  .footer-nav a {
    color: var(--pure-white-100);
    text-decoration: none;
    border-bottom: none;
  }

  /* ===== BREAKPOINTS ===== */

  /* Small desktop breakpoint */
    
  @media (max-width: 768px) {
    footer {
      margin-top: 160px;
    }
  }

</style>