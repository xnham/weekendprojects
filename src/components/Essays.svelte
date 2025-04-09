<script lang="ts">
    import { getAllEssays } from "../utils/essays";
    import { onMount } from "svelte";
    import type { EssayMetadata } from "../utils/essays";
    import { FontAwesomeIcon } from "@fortawesome/svelte-fontawesome";
    import { fade } from "svelte/transition";
    import {
        toggleLike,
        recordShare,
        recordView,
        isLiked as checkIfLiked,
        subscribeToInteractions,
        getInteractionState,
        ContentType,
    } from "../services/interactionService";
    import InteractionButton from "../components/shared/InteractionButton.svelte";

    let essays: EssayMetadata[] = [];
    let essayInteractionState = getInteractionState();

    // Replace modal state with copy feedback state
    let copyFeedback = "";
    let copyFeedbackEssayId = "";
    let feedbackTimeout: ReturnType<typeof setTimeout>;

    // Replace essayLikes with reactive derived values
    $: essayLikedStatus = essays.reduce((acc, essay) => {
        acc[essay.id] = essayInteractionState?.likes[`${ContentType.ESSAY}:${essay.id}`] || false;
        return acc;
    }, {});

    onMount(() => {
        // Load essays
        getAllEssays().then((result) => {
            essays = result;
        });

        // Subscribe to interaction state changes
        const unsubscribe = subscribeToInteractions((state) => {
            essayInteractionState = state;
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

    function handleLikeToggle(essayId: string) {
        toggleLike(ContentType.ESSAY, essayId);
    }

    function checkEssayLiked(slug: string): boolean {
        return !!essayLikedStatus[slug];
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

    function handleShare(event: MouseEvent, essay: EssayMetadata): void {
        // Prevent the click from bubbling up to the card and navigating
        event.preventDefault();
        event.stopPropagation();
        
        const url = `${window.location.origin}/writing/${essay.slug}`;
        
        // Add console logs for debugging
        console.log("Sharing essay:", essay.id);
        
        // Copy to clipboard directly
        navigator.clipboard.writeText(url)
            .then(() => {
                console.log("Copy successful, setting feedback");
                
                // Clear any existing timeout first
                if (feedbackTimeout) clearTimeout(feedbackTimeout);
                
                // Update state variables - make sure to use Svelte's reactive assignments
                copyFeedbackEssayId = essay.id;
                copyFeedback = "Link copied!";
                
                // Record the share in Supabase
                recordShare(ContentType.ESSAY, essay.id);
                
                // Clear feedback after delay
                feedbackTimeout = setTimeout(() => {
                    console.log("Clearing feedback");
                    copyFeedback = "";
                    copyFeedbackEssayId = "";
                }, 3000); // Extended to 3 seconds for testing
            })
            .catch(err => {
                console.error("Failed to copy: ", err);
                // Clear any existing timeout first
                if (feedbackTimeout) clearTimeout(feedbackTimeout);
                
                copyFeedbackEssayId = essay.id;
                copyFeedback = "Copy failed";
                
                feedbackTimeout = setTimeout(() => {
                    copyFeedback = "";
                    copyFeedbackEssayId = "";
                }, 3000);
            });
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
                <InteractionButton 
                    type="like"
                    active={essayLikedStatus[essay.id]}
                    count={undefined}
                    on:click={() => handleLikeToggle(essay.id)}
                />

                <div class="share-button-container">
                    <InteractionButton 
                        type="share"
                        active={false}
                        count={undefined}
                        on:click={(event) => handleShare(event, essay)}
                    />
                    
                    {#if copyFeedback && copyFeedbackEssayId === essay.id}
                        <div class="copy-feedback" transition:fade={{ duration: 150 }}>
                            {copyFeedback}
                        </div>
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
</style>
