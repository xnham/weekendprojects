<script lang="ts">
    import { getAllEssays } from '../utils/essays';
    import { onMount } from 'svelte';
    import type { EssayMetadata } from '../utils/essays';
    import { FontAwesomeIcon } from '@fortawesome/svelte-fontawesome';
    import { fade } from 'svelte/transition';
    
    let essays: EssayMetadata[] = [];
    let userData = {
        email: '',
        follows: [] as string[],
        likes: {} as {[key: string]: boolean}
    };
    
    // Modal state
    let showShareModal = false;
    let copySuccess = false;
    let currentShareUrl = '';
    let modalTimeout: ReturnType<typeof setTimeout>;
    
    onMount(() => {
        loadUserData();
        
        // Load essays
        getAllEssays().then(result => {
            essays = result;
        });
        
        // Add global ESC key handler for modal
        const handleKeydown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && showShareModal) {
                closeModal();
            }
        };
        
        window.addEventListener('keydown', handleKeydown);
        
        return () => {
            window.removeEventListener('keydown', handleKeydown);
            if (modalTimeout) clearTimeout(modalTimeout);
        };
    });
    
    function loadUserData() {
        const data = localStorage.getItem('essayUserData');
        if (data) {
            userData = JSON.parse(data);
        }
    }
    
    function saveUserData() {
        localStorage.setItem('essayUserData', JSON.stringify(userData));
    }
    
    function handleLike(slug: string): void {
        if (userData.likes[slug]) {
            delete userData.likes[slug];
        } else {
            userData.likes[slug] = true;
        }
        userData = { ...userData };
        saveUserData();
    }
    
    function handleFollow(slug: string): void {
        const isFollowing = userData.follows.includes(slug);
        
        if (isFollowing) {
            userData.follows = userData.follows.filter(id => id !== slug);
        } else {
            userData.follows = [...userData.follows, slug];
        }
        
        userData = { ...userData };
        saveUserData();
    }
    
    function handleComment(slug: string): void {
        console.log('Comment clicked for essay:', slug);
        // TODO: Implement comment functionality
    }
    
    function handleShare(slug: string, title: string): void {
        const url = window.location.origin + '/writing/' + slug;
        currentShareUrl = url;
        showShareModal = true;
        
        // Auto-hide modal after 3 seconds if copy was successful
        if (modalTimeout) {
            clearTimeout(modalTimeout);
        }
    }
    
    function copyLink() {
        navigator.clipboard.writeText(currentShareUrl)
            .then(() => {
                copySuccess = true;
                modalTimeout = setTimeout(() => {
                    showShareModal = false;
                    copySuccess = false;
                }, 3000);
            })
            .catch(() => {
                copySuccess = false;
            });
    }
    
    function closeModal() {
        showShareModal = false;
        copySuccess = false;
        if (modalTimeout) {
            clearTimeout(modalTimeout);
        }
    }
    
    function formatDate(dateString: string) {
        // Simple date formatter that doesn't use the Date object at all
        // This prevents any timezone conversions
        const [year, month, day] = dateString.split('-');
        
        // Convert month number to name
        const monthNames = [
          'January', 'February', 'March', 'April', 'May', 'June', 
          'July', 'August', 'September', 'October', 'November', 'December'
        ];
        
        // Parse month as integer and subtract 1 to get the correct index (months are 1-based in the string)
        const monthIndex = parseInt(month, 10) - 1;
        const monthName = monthNames[monthIndex];
        
        // Remove leading zero from day if present
        const dayFormatted = day.startsWith('0') ? day.substring(1) : day;
        
        // Return formatted date string
        return `${monthName} ${dayFormatted}, ${year}`;
    }
</script>

<div class="essays">
    {#each essays as essay}
        <div class="essay-card">
            <a href="/writing/{essay.slug}" class="essay-card-link">
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
            </a>
            <div class="essay-card-actions">
                <div class="essay-buttons">
                    <button 
                        class="essay-like-button {userData.likes[essay.slug] ? 'essay-liked' : ''}" 
                        on:click={() => handleLike(essay.slug)}
                        aria-label={userData.likes[essay.slug] ? 'Unlike this essay' : 'Like this essay'}
                    >
                        {#if userData.likes[essay.slug]}
                            <FontAwesomeIcon icon={['fas', 'heart']} />
                            <span>Liked</span>
                        {:else}
                            <FontAwesomeIcon icon={['far', 'heart']} />
                            <span>Like</span>
                        {/if}
                    </button>
                    <button 
                        class="essay-share-button" 
                        on:click={() => handleShare(essay.slug, essay.title)}
                        aria-label="Share this essay"
                    >
                        <FontAwesomeIcon icon={['far', 'share-from-square']} />
                        <span>Share</span>
                    </button>
                    <button 
                        class="essay-follow-button {userData.follows.includes(essay.slug) ? 'essay-following' : ''}" 
                        on:click={() => handleFollow(essay.slug)}
                        aria-label={userData.follows.includes(essay.slug) ? 'Unfollow this essay' : 'Follow this essay'}
                    >
                        {#if userData.follows.includes(essay.slug)}
                            <FontAwesomeIcon icon={['fas', 'bell']} />
                            <span>Following</span>
                        {:else}
                            <FontAwesomeIcon icon={['far', 'bell']} />
                            <span>Follow</span>
                        {/if}
                    </button>
                    <button 
                        class="essay-comment-button" 
                        on:click={() => handleComment(essay.slug)}
                        aria-label="Comment on this essay"
                    >
                        <FontAwesomeIcon icon={['far', 'comment']} />
                        <span>Comment</span>
                    </button>
                </div>
            </div>
        </div>
    {/each}
</div>

<!-- Share Link Modal -->
{#if showShareModal}
<div 
    class="modal-overlay" 
    role="presentation"
    transition:fade={{ duration: 200 }}
>
    <!-- Use a semantic dialog element for the modal -->
    <div 
        class="modal-content" 
        role="dialog"
        aria-modal="true"
        aria-labelledby="share-modal-title"
        tabindex="-1"
        transition:fade={{ duration: 300, delay: 100 }}
    >
        <button class="modal-close" on:click={closeModal} aria-label="Close modal">×</button>
        <div class="modal-header">
            <h3 class="share-modal-title">Share this essay</h3>
        </div>
        <div class="modal-body">
            <div class="share-link-container">
                <input type="text" readonly value={currentShareUrl} class="share-link-input" />
                <button class="copy-button" on:click={copyLink} disabled={copySuccess}>
                    {copySuccess ? 'Copied!' : 'Copy'}
                </button>
            </div>
            {#if copySuccess}
            <div class="copy-success">Link copied to clipboard!</div>
            {/if}
        </div>
    </div>
    <!-- Invisible close button that covers the overlay for click-to-close functionality -->
    <button 
        class="overlay-close-button" 
        on:click={closeModal} 
        aria-label="Close modal"
    ></button>
</div>
{/if}

<style>
    .essays {
        display: flex;   
        flex-direction: column;
        gap: 60px;
        width: 100%;
        max-width: 700px;
    }
    
    .essay-card {
        overflow: hidden;
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
        padding: 0 0 30px 20px;
    }
    
    .essay-card-link {
        display: block;
        text-decoration: none;
        color: inherit;
        cursor: pointer;
    }
    
    .read-more {
        display: inline-block;
        margin-top: 10px;
        color: var(--dark-80);
        font-size: 14px;
        font-weight: 400;
    }

    .read-more-text {
        text-decoration: underline;
    }

    .read-more:hover {
        opacity: 0.8;
    }

    .essay-card-actions {
        display: flex;
        justify-content: space-between;
        gap: 0px;
        padding: 14px 0 14px 20px;
        margin-top: auto;
        border-top: 1px var(--dark-100) solid;
    }
    
    .essay-buttons {
        display: flex;
        justify-content: column;
    }
    
    .essay-like-button,
    .essay-share-button {
        display: flex;
        align-items: center;
        justify-content: left;
        gap: 6px;
        border: none;
        cursor: pointer;
        transition: all 0.2s ease;
        font-size: 14px;
        background-color: var(--light-100);
        padding-right: 24px;
    }
    
    .essay-follow-button {
        display: none; /* Hide the follow button */
    }
    
    .essay-comment-button {
        display: none; /* Hide the comment button */
    }
    
    .essay-buttons button:last-child {
        padding-right: 0;
    }
    
    .essay-liked :global(svg) {
        color: var(--dark-pink-100);
        animation: heartPulse 0.3s ease-in-out;
    }
    
    .essay-following :global(svg) {
        color: var(--dark-orange-100);
        animation: heartPulse 0.3s ease-in-out;
    }
    
    @keyframes heartPulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.3); }
        100% { transform: scale(1); }
    }

    /* Modal styles */
    .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: var(--dark-70);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    }
    
    /* Invisible button that covers the entire overlay for accessibility */
    .overlay-close-button {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: transparent;
        border: none;
        cursor: pointer;
        z-index: 1001;
    }
    
    .modal-content {
        background-color: var(--light-100);
        padding: 40px 80px 30px 80px;
        border-radius: 5px;
        max-width: 600px;
        width: 90%;
        position: relative;
        box-shadow: 0 5px 20px var(--dark-20);
        z-index: 1002; /* Higher than the overlay close button */
    }
    
    .modal-header {
        display: flex;
        justify-content: center;
        padding: 0;
        border-bottom: none;
    }
    
    .share-modal-title {
        font-family: 'DM Serif Text', serif;
        text-align: center;
        font-size: 24px;
        font-weight: 500;
        line-height: 1.3;
    }
    
    .modal-close {
        font-family: 'Roboto', sans-serif;
        position: absolute;
        top: 16px;
        right: 20px;
        font-size: 30px;
        font-weight: 200;
        line-height: 1;
        color: var(--dark-60);
        cursor: pointer;
        background: none;
        border: none;
        padding: 0;
        width: 30px;
        height: 30px;
    }
    
    .modal-close:hover {
        color: var(--dark-90);
        transform: scale(1.2);
        transition: transform 0.3s ease;
    }
    
    .modal-body {
        padding: 10px 0 20px 0;
    }
    
    .share-link-container {
        display: flex;
        width: 100%;
    }
    
    .share-link-input {
        flex: 1;
        background-color: var(--light-100);
        color: var(--dark-75);
        padding: 12px;
        border: 1px solid var(--dark-60);
        border-radius: 5px 0 0 5px;
        font-size: 15px;
        transition: border-color 0.3s ease;
        box-sizing: border-box;
        min-width: 0;
    }
    
    .share-link-input:focus {
        outline: none;
        border-color: var(--dark-80);
        box-shadow: 0 0 0 1px var(--purple-30);
    }
    
    .copy-button {
        background-color: var(--purple-100);
        color: white;
        border: none;
        padding: 12px 15px;
        border-radius: 0 5px 5px 0;
        cursor: pointer;
        font-weight: 500;
        font-size: 16px;
        transition: background-color 0.3s;
        white-space: nowrap;
        flex-shrink: 0;
    }
    
    .copy-button:hover {
        background-color: var(--dark-purple-100);
    }
    
    .copy-button:disabled {
        background-color: var(--purple-100);
        opacity: 0.7;
        cursor: not-allowed;
    }
    
    .copy-success {
        color: var(--dark-green-100);
        font-size: 14px;
        margin-top: 15px;
        text-align: center;
    }
    
    /* Media queries */
    @media (max-width: 576px) {   
        .modal-close {
            top: 12px;
            right: 16px;
        }

        .share-modal-title {
            padding-top: 20px;
            font-size: 22px;
        }

        .modal-content {
            padding: 50px clamp(10px, 5vw, 40px);
            width: 95%;
        }

        .share-link-input {
            font-size: 14px;
        }
    }

</style>
