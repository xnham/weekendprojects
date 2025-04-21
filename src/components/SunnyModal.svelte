<script lang="ts">
  import { fade, scale } from "svelte/transition";
  import { onMount, onDestroy } from "svelte";
  import Vapi from "@vapi-ai/web";
  import WaveSurfer from "wavesurfer.js";
  import { FontAwesomeIcon } from "@fortawesome/svelte-fontawesome";

  // Local state for this specific modal
  export let isOpen = false;
  let email: string = "";
  let submitting = false;
  let modalElement: HTMLDivElement;
  let volumeLevel = 0;
  let callActive = false;
  let waveSurfer: WaveSurfer | null = null;
  let audioContext: AudioContext | null = null;
  let audioData: number[] = [];
  let isSpeaking = false;
  let lastVolumeTime = 0;
  let dailyCallObject: any = null; // To store the Daily call object
  let audioProcessor: any = null;
  let canvasContext: CanvasRenderingContext2D | null = null;
  let animationFrame: number | null = null;
  let devMode = false; // Add this flag for development mode

  // VAPI setup
  const vapi = new Vapi("18aebfed-8669-4ace-beec-e219652fc662"); // Initialize VAPI with your public key
  const assistantId = "24c467e9-e11f-4ad1-8643-ddee12f1ab17"; // Replace with your actual Assistant ID

  // Handle escape key
  function handleKeydown(event: KeyboardEvent) {
    if (event.key === "Escape") {
      isOpen = false;
    }
  }

  // Handle click outside
  function handleClickOutside(event: MouseEvent) {
    if (
      modalElement &&
      event.target instanceof Node &&
      !modalElement.contains(event.target) &&
      (event.target as Element).classList.contains("sunny-modal-backdrop")
    ) {
      isOpen = false;
    }
  }

  function handleResize() {
    // No need to recreate wavesurfer when the window is resized
    // Just let the CSS handle responsive sizing of the bars
  }

  function updateWaveform() {
    // We no longer need this function since we're using animated bars
    // Let's make it a no-op function to avoid breaking any existing calls
    return;
  }

  // Simplified visualization - no need for complex drawing logic
  function updateVisualization() {
    // This function is now simpler - volume level is applied directly in the template
    lastVolumeTime = Date.now();
  }

  // Simulate some activity if we haven't received volume updates
  function simulateActivityIfNeeded() {
    if (!callActive) return;

    const now = Date.now();
    // If it's been more than 500ms since the last volume update and we're in a call
    if (now - lastVolumeTime > 500) {
      // Generate a random volume level to keep bars moving
      volumeLevel = Math.random() * 0.5; // Generate moderate activity
      lastVolumeTime = now;
    }
  }

  onMount(() => {
    document.addEventListener("keydown", handleKeydown);
    document.addEventListener("mousedown", handleClickOutside);

    // Create audio context right away
    try {
      audioContext = new AudioContext();
    } catch (err) {
      console.error("Failed to create AudioContext:", err);
    }

    // Set up a timer to simulate activity if needed
    const activityTimer = setInterval(simulateActivityIfNeeded, 200);

    window.addEventListener("resize", handleResize);

    return () => {
      clearInterval(activityTimer);
    };
  });

  onDestroy(() => {
    document.removeEventListener("keydown", handleKeydown);
    document.removeEventListener("mousedown", handleClickOutside);
    if (waveSurfer) {
      waveSurfer.destroy();
    }
    if (audioProcessor) {
      clearInterval(audioProcessor);
    }
    if (animationFrame) {
      cancelAnimationFrame(animationFrame);
    }
    window.removeEventListener("resize", handleResize);
  });

  // This function opens the modal
  export function open() {
    isOpen = true;
  }

  // Dummy email submit handler (no actual functionality)
  function submitEmail() {
    submitting = true;
    console.log("Dummy form submission - no actual backend integration");
    // Just simulate a submission with a timeout
    setTimeout(() => {
      submitting = false;
      isOpen = false;
      email = "";
      // This is just a dummy form - no actual submission happens
    }, 1000);
  }

  // Handler for browser call button
  async function handleBrowserCall() {
    console.log("Starting browser call...");
    try {
      const call = await vapi.start(assistantId);
      console.log("Call started:", call);
      callActive = true;
      lastVolumeTime = Date.now();

      // Get the Daily call object as suggested by VAPI
      try {
        dailyCallObject = vapi.getDailyCallObject();
        if (dailyCallObject) {
          console.log(
            "Successfully retrieved Daily call object:",
            dailyCallObject,
          );

          // Try to subscribe to audio data if possible
          // This is experimental based on VAPI's suggestion
          setTimeout(() => {
            try {
              if (dailyCallObject && dailyCallObject.participants()) {
                console.log(
                  "Daily participants:",
                  dailyCallObject.participants(),
                );

                // Set up audio processing for all participants
                Object.keys(dailyCallObject.participants()).forEach(
                  (participantId) => {
                    const participant =
                      dailyCallObject.participants()[participantId];
                    console.log(
                      "Setting up audio for participant:",
                      participant,
                    );

                    // Try to access audio stream if available
                    if (participant.audioTrack) {
                      setupAudioProcessingForTrack(participant.audioTrack);
                    }
                  },
                );

                // Listen for track started events to capture new audio tracks
                dailyCallObject.on("track-started", (event: any) => {
                  if (event.track.kind === "audio") {
                    console.log("New audio track started:", event);
                    setupAudioProcessingForTrack(event.track);
                  }
                });
              }
            } catch (err) {
              console.error("Error accessing Daily participants:", err);
            }
          }, 2000); // Give time for participants to connect
        }
      } catch (dailyErr) {
        console.error("Error accessing Daily call object:", dailyErr);
      }

      // Keep our existing volume-level event listener
      vapi.on("volume-level", (volume) => {
        volumeLevel = volume;
        lastVolumeTime = Date.now();

        console.log("Volume level:", volume);

        // Only consider it speaking if volume is above a threshold
        isSpeaking = volume > 0.1;
      });

      // Listen for message events instead of transcript
      vapi.on("message", (message) => {
        console.log("Message received:", message);

        // Check if the message contains transcript data
        if (message && message.type === "transcript") {
          console.log("Transcript received:", message);

          // When we get a transcript, we know someone is speaking
          if (!isSpeaking) {
            // If we're not already marked as speaking, simulate some activity
            volumeLevel = 0.5; // Set a moderate volume level
            updateVisualization();
          }
        }
      });

      // Event handlers for various events
      vapi.on("speech-start", () => {
        console.log("VAPI speech started");
        isSpeaking = true;
        // Make sure there's some visual indication
        if (volumeLevel < 0.2) volumeLevel = 0.5;
      });

      vapi.on("speech-end", () => {
        console.log("VAPI speech ended");
        isSpeaking = false;
      });

      vapi.on("call-start", () => {
        console.log("VAPI call started");
      });

      vapi.on("call-end", () => {
        console.log("VAPI call ended");
        callActive = false;
      });

      vapi.on("error", (error) => {
        console.error("VAPI error:", error);
      });
    } catch (error) {
      console.error("Error starting call:", error);
    }
  }

  // Function to set up audio processing for a track
  function setupAudioProcessingForTrack(track: MediaStreamTrack) {
    try {
      if (!audioContext) {
        audioContext = new AudioContext();
      }

      // Create a media stream from the track
      const stream = new MediaStream([track]);

      // Create a source node from the stream
      const source = audioContext.createMediaStreamSource(stream);

      // Create an analyzer node to get volume data
      const analyzer = audioContext.createAnalyser();
      analyzer.fftSize = 2048;

      // Connect the source to the analyzer
      source.connect(analyzer);

      // Set up processing interval to read volume data
      const bufferLength = analyzer.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      // Save the analyzer for cleanup
      audioProcessor = setInterval(() => {
        // Get volume data
        analyzer.getByteTimeDomainData(dataArray);

        // Calculate average volume
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += Math.abs(dataArray[i] / 128.0 - 1.0);
        }
        const avgVolume = sum / bufferLength;

        // Update our volume level if it's higher than current
        if (avgVolume > volumeLevel) {
          volumeLevel = avgVolume * 1.5; // Amplify for better visualization
        }
      }, 100); // Update 10 times per second

      console.log("Audio processing set up successfully for track");
    } catch (err) {
      console.error("Error setting up audio processing:", err);
    }
  }

  function endCall() {
    if (audioProcessor) {
      clearInterval(audioProcessor);
      audioProcessor = null;
    }
    vapi.stop();
    callActive = false;
    isOpen = false;
  }

  // Add a custom focus action
  function focusOnMount(node: HTMLElement) {
    node.focus();
  }

  // Helper function to create an audio buffer
  function createAudioBuffer(data: Float32Array): AudioBuffer {
    const buffer = audioContext!.createBuffer(
      1,
      data.length,
      audioContext!.sampleRate,
    );
    const channel = buffer.getChannelData(0);

    for (let i = 0; i < data.length; i++) {
      channel[i] = data[i];
    }

    return buffer;
  }

  // Add this function to simulate pulses
  function simulatePulses() {
    let pulsing = true;
    const interval = setInterval(() => {
      if (!pulsing) {
        clearInterval(interval);
        return;
      }

      // Create a random pulse effect
      volumeLevel = Math.random();

      // After 2 seconds, turn off pulsing
      setTimeout(() => {
        pulsing = false;
      }, 5000);
    }, 300);
  }

  // Make the modal open and in call mode for development
  onMount(() => {
    // ... existing code ...

    // Auto open and simulate call for development
    if (devMode) {
      isOpen = true;
      callActive = true;
    }
  });

  function copyToClipboard(text: string) {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        // Optionally provide visual feedback
        console.log("Phone number copied to clipboard");
      })
      .catch((err) => {
        console.error("Could not copy text: ", err);
      });
  }
</script>

<!-- Only show when isOpen is true -->
{#if isOpen}
  <div class="sunny-modal-backdrop" transition:fade={{ duration: 200 }}>
    <div
      class="sunny-modal-container"
      bind:this={modalElement}
      transition:scale={{ duration: 200, start: 0.95 }}
      role="dialog"
      aria-modal="true"
    >
      <button
        class="close-button"
        on:click={() => (isOpen = false)}
        aria-label="Close modal"
      >
        &times;
      </button>
      <div class="sunny-modal-inner-content">
        <h3 class="sunny-modal-title">
          {#if callActive}
            Talking with Sunny...
          {:else}
            Two ways to connect with Sunny
          {/if}
        </h3>
        {#if callActive}
          <!-- Call Active Content -->
          <div class="call-active-content">
            <!-- Pulsing Circle visualization -->
            <div class="audio-pulse-container">
              <div
                class="pulse-circle"
                style="transform: scale({1 + Math.min(volumeLevel * 2, 1)}); 
                       opacity: {0.6 + Math.min(volumeLevel, 0.4)}"
              ></div>
              <div
                class="pulse-ripple"
                style="transform: scale({1 + Math.min(volumeLevel * 3, 2)}); 
                       opacity: {Math.max(0, Math.min(volumeLevel - 0.1, 0.5))}"
              ></div>
            </div>

            <!-- Development controls (only visible in dev mode) -->
            {#if devMode}
              <div class="dev-controls">
                <label>
                  Volume Level: {volumeLevel.toFixed(2)}
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    bind:value={volumeLevel}
                  />
                </label>
                <button on:click={() => (volumeLevel = 0)}>Zero</button>
                <button on:click={() => (volumeLevel = 0.3)}>Low</button>
                <button on:click={() => (volumeLevel = 0.6)}>Medium</button>
                <button on:click={() => (volumeLevel = 0.9)}>High</button>
                <button on:click={() => simulatePulses()}>Auto Pulse</button>
              </div>
            {/if}

            <button
              class="modal-action-btn end-call-btn"
              on:click={() => endCall()}
            >
              End Call
            </button>
          </div>
        {:else}
          <!-- Default Modal Content -->
          <div class="sunny-content">
            <div class="sunny-option">
              <p class="sunny-modal-option">Option 1</p>
              <p class="sunny-modal-option-description">
                Call <span class="sunny-modal-option-description-phone"
                  >617-329-4181 <button
                    class="copy-button"
                    on:click={() => copyToClipboard("617-329-4181")}
                    aria-label="Copy phone number"
                  >
                    <FontAwesomeIcon icon={["far", "copy"]} />
                  </button></span
                >
              </p>
            </div>
            <div class="sunny-option">
              <p class="sunny-modal-option">Option 2</p>
              <button
                class="modal-action-btn"
                on:click={() => handleBrowserCall()}
              >
                <FontAwesomeIcon icon={["fas", "phone"]} />
                <span class="button-icon-text">Start Web Call</span>
              </button>
            </div>
            <p class="sunny-privacy-note">Your call may be recorded.</p>
          </div>
        {/if}
      </div>
    </div>
  </div>
{/if}

<style>
  /* ======================
     1. MODAL STRUCTURE
     ====================== */
  .sunny-modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: var(--dark-80);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }

  .sunny-modal-container {
    background-color: var(--light-100);
    width: 90%;
    max-width: 640px;
    padding: 0 80px;
    border-radius: 5px;
    position: relative;
    box-shadow: 0 5px 20px var(--dark-20);
    display: flex;
    flex-direction: column;
    justify-content: center;
    min-height: 300px;
  }

  .sunny-modal-inner-content {
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 60px 0 50px 0;
  }

  .close-button {
    position: absolute;
    top: 20px;
    right: 20px;
    font-size: 30px;
    font-weight: 300;
    line-height: 1;
    color: var(--dark-60);
    cursor: pointer;
    background: none;
    border: none;
    padding: 0;
    width: 30px;
    height: 30px;
    font-family: "Roboto", sans-serif;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .close-button:hover {
    color: var(--dark-90);
    transform: scale(1.2);
    transition: transform 0.3s ease;
  }

  /* ======================
     2. CONTENT & TYPOGRAPHY
     ====================== */
  .sunny-modal-title {
    font-family: "DM Serif Text", serif;
    text-align: center;
    font-size: 24px;
    font-weight: 500;
    line-height: 1.3;
    margin-bottom: 40px;
    color: var(--dark-100);
  }

  .sunny-privacy-note {
    margin-top: 14px;
    text-align: center;
    line-height: 1.4;
    font-size: 13px;
    color: var(--dark-70);
  }

  /* ======================
     3. DEFAULT CONTENT OPTIONS
     ====================== */
  .sunny-content {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 100%;
    margin: 0 auto;
  }

  .sunny-option {
    width: 100%;
    margin-bottom: 20px;
    display: grid;
    grid-template-columns: 1fr 3fr;
    justify-content: center;
    align-items: center;
    padding: 0 30px;
    background-color: var(--dark-5);
    border-radius: 4px;
    height: 80px;
  }

  .sunny-modal-option {
    font-size: 16px;
    font-weight: 400;
    color: var(--dark-70);
    text-align: left;
  }

  .sunny-modal-option-description {
    font-size: 18px;
    color: var(--dark-90);
    text-align: left;
  }

  .sunny-modal-option-description-phone {
    font-size: 16px;
    font-weight: 600;
    color: var(--dark-80);
    border: 1px dashed var(--dark-40);
    border-radius: 4px;
    padding: 6px 14px 6px 20px;
    margin-left: 10px;
  }

  /* ======================
     4. CALL ACTIVE STATE
     ====================== */
  .call-active-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
  }

  .audio-pulse-container {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100px;
    width: 100%;
    background-color: rgba(0, 0, 0, 0.03);
    border-radius: 4px;
    margin: 10px 0;
    position: relative;
  }

  .pulse-circle {
    width: 20px;
    height: 20px;
    background-color: var(--dark-purple-100);
    border-radius: 50%;
    transition: all 0.15s ease-out;
    position: relative;
    z-index: 2;
  }

  .pulse-ripple {
    position: absolute;
    width: 20px;
    height: 20px;
    background-color: transparent;
    border: 2px solid var(--dark-purple-100);
    border-radius: 50%;
    transition: all 0.2s ease-out;
    z-index: 1;
  }

  /* ======================
     5. BUTTONS & INTERACTIVE ELEMENTS
     ====================== */
  .modal-action-btn {
    display: block;
    width: auto;
    height: 40px;
    padding: 0 20px 0 18px;
    background-color: var(--purple-100);
    color: var(--light-100);
    border: none;
    border-radius: 4px;
    font-size: 16px;
    cursor: pointer;
    transition: background-color 0.2s ease;
    margin: 0;
  }

  .modal-action-btn:hover:not(:disabled) {
    background-color: var(--dark-purple-100);
    transform: scale(1.02);
    transition: transform 0.3s ease;
  }

  .modal-action-btn:disabled {
    background-color: var(--purple-30);
    cursor: not-allowed;
  }

  .end-call-btn {
    background-color: #db0000;
    color: white;
    margin-top: 20px;
  }

  .modal-action-btn.end-call-btn:hover {
    background-color: #b20000;
  }

  .copy-button {
    background: none;
    border: none;
    color: var(--dark-90);
    cursor: pointer;
    padding: 4px;
    margin-left: 4px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    transition: color 0.2s ease;
  }

  .copy-button:hover {
    transform: scale(1.2);
    transition: transform 0.3s ease;
  }

  .button-icon-text {
    margin-left: 4px;
  }

  /* ======================
     6. DEVELOPER MODE
     ====================== */
  .dev-controls {
    margin: 20px 0;
    padding: 10px;
    border: 1px dashed #ccc;
    border-radius: 4px;
    background-color: #f5f5f5;
    width: 100%;
    max-width: 400px;
  }

  .dev-controls label {
    display: block;
    margin-bottom: 10px;
    width: 100%;
  }

  .dev-controls input[type="range"] {
    width: 100%;
    margin-top: 5px;
  }

  .dev-controls button {
    margin: 0 5px;
    padding: 5px 10px;
    background-color: #eee;
    border: 1px solid #ddd;
    border-radius: 4px;
    cursor: pointer;
  }

  .dev-controls button:hover {
    background-color: #ddd;
  }

  /* ======================
     7. RESPONSIVE STYLES
     ====================== */
  /* Tablet */
  @media (max-width: 768px) {
    .sunny-modal-container {
      padding: 0 50px;
    }

    .sunny-modal-option {
      font-size: 14px;
    }

    .sunny-modal-option-description {
      font-size: 16px;
    }
  }

  /* Mobile */
  @media (max-width: 576px) {
    .sunny-modal-container {
      width: 95%;
      padding: 0 clamp(10px, 5vw, 40px);
    }

    .sunny-modal-title {
      font-size: 22px;
    }

    .sunny-option {
      padding: 0 20px;
    }

    .sunny-modal-option-description {
      font-size: 14px;
    }

    .sunny-modal-option-description-phone {
      padding: 6px 10px 6px 16px;
    }

    .close-button {
      top: 16px;
      right: 16px;
    }
  }
</style>
