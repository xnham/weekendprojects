<script lang="ts">
  // Get current year for copyright
  const currentYear = new Date().getFullYear();
</script>

<footer>
  <p>© Wendy Ham {currentYear}</p>
</footer>

<style>
  footer {
    background-color: var(--dark-80);
    color: var(--pure-white-100);
    padding: 1.5rem 0;
    margin-top: 200px;
    font-size: 14px;
    text-align: center;
  }

  /* ===== BREAKPOINTS ===== */

  /* Small desktop breakpoint */
    
  @media (max-width: 768px) {
    footer {
      margin-top: 160px;
    }
  }

</style>
