import { browser } from '$app/environment';
import { openSunnyModal } from '$lib/stores/sunnyModalStore';

/**
 * This utility handles all links to /sunny by intercepting them 
 * and opening the modal directly without navigation
 */
export function initSunnyLinks() {
  if (!browser) return; // Only run in browser

  // Wait for the DOM to be fully loaded
  window.addEventListener('DOMContentLoaded', () => {
    attachSunnyLinkHandlers();
  });

  // Also run immediately in case DOM is already loaded
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    attachSunnyLinkHandlers();
  }
}

function attachSunnyLinkHandlers() {
  // Process existing links
  processSunnyLinks();

  // Set up a mutation observer to handle dynamically added links
  const observer = new MutationObserver((mutations) => {
    let shouldProcess = false;
    
    // Check if any mutations added new nodes
    mutations.forEach(mutation => {
      if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
        shouldProcess = true;
      }
    });
    
    // Only process if new nodes were added
    if (shouldProcess) {
      processSunnyLinks();
    }
  });
  
  // Observe the entire document for changes
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}

function processSunnyLinks() {
  // Find all links to /sunny or with the data-sunny-link attribute
  const sunnyLinks = document.querySelectorAll('a[href^="/sunny"], a[data-sunny-link]');
  
  sunnyLinks.forEach(link => {
    // Skip if we've already processed this link
    if (/** @type {HTMLAnchorElement} */(link).dataset.sunnyHandled) return;
    
    // Mark as handled to avoid double-binding
    /** @type {HTMLAnchorElement} */(link).dataset.sunnyHandled = 'true';
    
    // Add click handler
    link.addEventListener('click', handleSunnyLinkClick);
  });
}

/**
 * @param {Event} event - The click event
 */
function handleSunnyLinkClick(event) {
  // Prevent default navigation
  event.preventDefault();
  
  // Open the modal
  openSunnyModal();
  
  // Don't propagate the click further
  event.stopPropagation();
} 