<script>
  export let data;
</script>

<svelte:head>
  <title>Debug - Paths and Environment</title>
</svelte:head>

<main>
  <h1>Debug Information</h1>
  
  <h2>Paths</h2>
  <pre>{JSON.stringify(data.paths, null, 2)}</pre>
  
  <h2>Files</h2>
  <div>
    <h3>src/content/essays ({data.files.srcContentFiles.length} files)</h3>
    <ul>
      {#each data.files.srcContentFiles as file}
        <li>{file}</li>
      {/each}
    </ul>
    
    <h3>content/essays ({data.files.rootContentFiles.length} files)</h3>
    <ul>
      {#each data.files.rootContentFiles as file}
        <li>{file}</li>
      {/each}
    </ul>
  </div>
  
  <h2>Environment</h2>
  <pre>{JSON.stringify(data.env, null, 2)}</pre>
  
  <p>Generated at: {data.timestamp}</p>
</main>

<style>
  main {
    padding: 20px;
    max-width: 900px;
    margin: 0 auto;
  }
  
  pre {
    background-color: #f5f5f5;
    padding: 15px;
    border-radius: 5px;
    overflow-x: auto;
  }
  
  ul {
    font-family: monospace;
  }
</style>