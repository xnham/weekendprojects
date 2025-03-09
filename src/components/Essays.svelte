<script lang="ts">
    import { getAllEssays } from '../utils/essays';
    import { onMount } from 'svelte';
    import type { EssayMetadata } from '../utils/essays';
    
    let essays: EssayMetadata[] = [];
    
    onMount(async () => {
        essays = await getAllEssays();
    });
    
    function formatDate(dateString: string) {
        return new Date(dateString).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    }
</script>

<div class="essays">
    {#each essays as essay}
        <a href="/writing/{essay.slug}" class="essay-card-link">
            <div class="essay-card">
                {#if essay.image}
                    <img src={essay.image} alt={essay.title} class="essay-image" />
                {/if}
                <div class="essay-content">
                    <p class="essay-date">{formatDate(essay.date)}</p>
                    <h3 class="essay-title">{essay.title}</h3>
                    <p class="essay-description">
                        {#if essay.excerpt}
                            {essay.excerpt}
                        {:else}
                            {essay.description}
                        {/if}
                    </p>
                    <span class="read-more"><span class="read-more-text">Read more</span> &gt</span>
                </div>
            </div>
        </a>
    {/each}
</div>

<style>
    .essays {
        display: flex;    
        width: 75%;
        margin-bottom: 200px;
    }
    
    .essay-card {
        overflow: hidden;
        padding-left: 20px;
        border-left: 1px solid var(--dark-100);
    }

    .essay-date {
        text-transform: uppercase;
        letter-spacing: 0.1rem;
        color: var(--dark-70);
        font-size: 12px;
        font-weight: 500;
    }

    .essay-title {
        font-family: 'DM Serif Text', serif;
        font-size: 24px;
        color: var(--dark-100);
    }
    
    .essay-image {
        width: 100%;
        height: 180px;
        object-fit: cover;
    }
    
    .essay-content {
        padding-left: 0;
    }
    
    .essay-card-link {
        display: block;
        text-decoration: none;
        color: inherit;
        cursor: pointer;
    }
    
    .read-more {
        display: inline-block;
        margin-top: 20px;
        color: var(--dark-80);
        font-weight: 400;
    }

    .read-more-text {
        text-decoration: underline;
    }

    .read-more:hover {
        opacity: 0.8;
    }

    /* Responsive adjustments */
    @media (max-width: 768px) {
        .essays {
            margin-bottom: 160px;
        }
    }

</style>
