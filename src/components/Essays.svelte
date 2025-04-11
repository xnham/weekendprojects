<script lang="ts">
    import { getAllEssays } from "../utils/essays";
    import { onMount } from "svelte";
    import type { EssayMetadata } from "../utils/essays";
    import { FontAwesomeIcon } from "@fortawesome/svelte-fontawesome";
    import { fade } from "svelte/transition";
    import {
        toggleLike,
        recordShare,
        isLiked,
        subscribeToInteractions,
        ContentType,
    } from "../services/essayInteractionService";
    import InteractionButton from "../components/shared/InteractionButton.svelte";
    import { supabase } from "../lib/supabase";

    let essays: EssayMetadata[] = [];
    let interactionState = { likes: {}, shares: {}, views: {} };

    // Replace modal state with copy feedback state
    let copyFeedback = "";
    let copyFeedbackEssayId = "";
    let feedbackTimeout: ReturnType<typeof setTimeout>;

    // Replace essayLikes with reactive derived values
    $: essayLikedStatus = essays.reduce((acc, essay) => {
        const key = `${ContentType.ESSAY}:${essay.id}`;
        acc[essay.id] = interactionState?.likes[key] || false;
        return acc;
    }, {});

    onMount(() => {
        // Load essays
        getAllEssays().then(result => {
            essays = result;
        });

        // Subscribe to interaction state changes
        const unsubscribe = subscribeToInteractions((state) => {
            interactionState = state;
        });

        // Add global ESC key handler for modal
        const handleKeydown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                copyFeedback = "";
                copyFeedbackEssayId = "";
            }
        };

        window.addEventListener("keydown", handleKeydown);

        return () => {
            unsubscribe();
            window.removeEventListener("keydown", handleKeydown);
            if (feedbackTimeout) clearTimeout(feedbackTimeout);
        };
    });

    async function handleLike(essayId: string) {
        try {
            // Find the essay
            const essay = essays.find(e => e.id === essayId);
            if (!essay) return;
            
            // Determine if it's currently liked
            const key = `${ContentType.ESSAY}:${essayId}`;
            const currentlyLiked = interactionState?.likes[key] || false;
            
            // Update the count optimistically
            const increment = !currentlyLiked ? 1 : -1;
            essay.like_count = Math.max(0, (essay.like_count || 0) + increment);
            
            // Toggle the like in the database
            await toggleLike(essayId);
            
            // Refresh essay data in the background
            refreshEssay(essayId).catch(error => {
                console.error("Error refreshing essay:", error);
                // Revert optimistic update on error
                if (essay) {
                    essay.like_count = Math.max(0, (essay.like_count || 0) - increment);
                }
            });
        } catch (error) {
            console.error("Error toggling like:", error);
        }
    }

    async function handleShare(essay: EssayMetadata) {
        try {
            if (!essay.id) return;
            
            // Create the share URL
            const shareUrl = `${window.location.origin}/writing/${essay.slug}`;
            
            // Copy to clipboard
            await navigator.clipboard.writeText(shareUrl);
            
            // Update count optimistically
            essay.share_count = (essay.share_count || 0) + 1;
            
            // Show feedback
            copyFeedback = "URL copied to clipboard!";
            copyFeedbackEssayId = essay.id;
            
            if (feedbackTimeout) clearTimeout(feedbackTimeout);
            feedbackTimeout = setTimeout(() => {
                copyFeedback = "";
                copyFeedbackEssayId = "";
            }, 3000);
            
            // Record the share in the database
            await recordShare(essay.id);
            
            // Refresh the essay data in the background
            refreshEssay(essay.id).catch(error => {
                console.error("Error refreshing essay:", error);
                // Revert optimistic update on error
                if (essay) {
                    essay.share_count = Math.max(0, (essay.share_count || 0) - 1);
                }
            });
        } catch (error) {
            console.error("Error sharing essay:", error);
            copyFeedback = "Failed to copy URL";
            copyFeedbackEssayId = essay.id;
            feedbackTimeout = setTimeout(() => {
                copyFeedback = "";
                copyFeedbackEssayId = "";
            }, 3000);
        }
    }

    // Add this function to refresh a specific essay's metadata
    async function refreshEssay(essayId: string) {
        try {
            const { data, error } = await supabase
                .from('essays')
                .select('id, like_count, share_count, view_count')
                .eq('id', essayId)
                .single();
                
            if (error) throw error;
            
            if (data) {
                // Update the essay in the essays array
                essays = essays.map(essay => {
                    if (essay.id === essayId) {
                        return {
                            ...essay,
                            like_count: data.like_count,
                            share_count: data.share_count,
                            view_count: data.view_count
                        };
                    }
                    return essay;
                });
            }
        } catch (e) {
            console.error('Failed to refresh essay:', e);
        }
    }

    function formatDate(dateString: string) {
        // Simple date formatter that doesn't use the Date object at all
        // This prevents any timezone conversions
        const [year, month, day] = dateString.split("-");

        // Convert month number to name
        const monthNames = [
            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July",
            "August",
            "September",
            "October",
            "November",
            "December",
        ];

        // Parse month as integer and subtract 1 to get the correct index (months are 1-based in the string)
        const monthIndex = parseInt(month, 10) - 1;
        const monthName = monthNames[monthIndex];

        // Remove leading zero from day if present
        const dayFormatted = day.startsWith("0") ? day.substring(1) : day;

        // Return formatted date string
        return `${monthName} ${dayFormatted}, ${year}`;
    }

    function getEssayUrl(slug: string): string {
        return `${window.location.origin}/writing/${slug}`;
    }

    // Add this function to get counts directly from database fields
    function getEssayLikes(essay: EssayMetadata): number {
        return essay.like_count || 0;
    }
    
    function getEssayShares(essay: EssayMetadata): number {
        return essay.share_count || 0;
    }
    
    // Update the formatCounters to use these functions
    function formatCounters(essay: EssayMetadata): string {
        const likes = getEssayLikes(essay);
        const shares = getEssayShares(essay);
        
        // No likes or shares
        if (likes === 0 && shares === 0) {
            return "";
        }
        
        // Only likes
        if (likes > 0 && shares === 0) {
            return `${likes} ${likes === 1 ? 'like' : 'likes'}`;
        }
        
        // Only shares
        if (likes === 0 && shares > 0) {
            return `${shares} ${shares === 1 ? 'share' : 'shares'}`;
        }
        
        // Both likes and shares
        return `${likes} ${likes === 1 ? 'like' : 'likes'} & ${shares} ${shares === 1 ? 'share' : 'shares'}`;
    }
</script>

<div class="essays">
    {#each essays as essay}
        <div class="essay-card">
            <a href="/writing/{essay.slug}" class="essay-card-link">
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
                    <span class="read-more"
                        ><span class="read-more-text">Read more</span> &gt</span
                    >
                </div>
            </a>
            <div class="essay-interaction-container">
                <div class="essay-buttons">
                    <InteractionButton 
                        type="like"
                        active={essayLikedStatus[essay.id]}
                        count={undefined}
                        on:click={() => handleLike(essay.id)}
                    />

                    <div class="share-button-container">
                        <InteractionButton 
                            type="share"
                            active={false}
                            count={undefined}
                            on:click={(event) => handleShare(essay)}
                        />
                        
                        {#if copyFeedback && copyFeedbackEssayId === essay.id}
                            <div class="copy-feedback" transition:fade={{ duration: 150 }}>
                                {copyFeedback}
                            </div>
                        {/if}
                    </div>
                </div>
                
                <div class="essay-counters">
                    {#if essay.id}
                        {formatCounters(essay)}
                    {/if}
                </div>
            </div>
        </div>
    {/each}
</div>

<style>
    /* Main layout */
    .essays {
        display: flex;
        flex-direction: column;
        gap: 60px;
        width: 75%;
    }

    /* Essay card styles */
    .essay-card {
        overflow: visible;
        border-left: 1px solid var(--dark-100);
    }

    .essay-card-link {
        display: block;
        text-decoration: none;
        color: inherit;
        cursor: pointer;
    }

    .essay-content {
        padding: 0 0 20px 20px;
        border-bottom: 1px solid var(--dark-100);
    }

    .essay-interaction-container {
        display: flex;
        flex-direction: row;
        padding: 10px 0 10px 20px;
        align-items: flex-start;
        position: relative;
    }

    .essay-date {
        text-transform: uppercase;
        letter-spacing: 0.1rem;
        color: var(--dark-70);
        font-size: 12px;
        font-weight: 400;
    }

    .essay-title {
        font-family: "DM Serif Text", serif;
        font-size: 24px;
        color: var(--dark-100);
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

    /* Animations */
    @keyframes heartPulse {
        0% {
            transform: scale(1);
        }
        50% {
            transform: scale(1.3);
        }
        100% {
            transform: scale(1);
        }
    }
    
    .share-button-container {
        position: relative;
        display: inline-block;
    }

    /* Copy feedback styling */
    .copy-feedback {
        position: absolute;
        bottom: -35px;
        left: 0;
        white-space: nowrap;
        font-size: 14px;
        color: var(--dark-80);
        background-color: #F5F6F6;
        padding: 8px 12px;
        border-radius: 4px;
        z-index: 1000;
        box-shadow:
            inset 0 1px 1px rgba(0, 0, 0, 0.05),
            0 1px 2px rgba(0, 0, 0, 0.08),
            0 2px 4px rgba(0, 0, 0, 0.08),
            0 4px 6px rgba(0, 0, 0, 0.08),
            0 6px 8px rgba(0, 0, 0, 0.08);
        pointer-events: none;
    }

    @keyframes slideUp {
        from {
            opacity: 0;
            transform: translateY(10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    /* Responsive styles */
    @media (max-width: 768px) {
        .essays {
            width: 100%;
        }
    }

    .essay-buttons {
        display: flex;
        flex-direction: row;
    }
    
    .essay-counters {
        text-align: right;
        justify-content: flex-end;
        font-size: 14px;
        color: var(--dark-80);
        margin-left: auto;
    }
</style>
