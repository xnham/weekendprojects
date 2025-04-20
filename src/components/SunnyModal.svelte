<script lang="ts">
  import { fade, scale } from "svelte/transition";
  import { onMount, onDestroy } from "svelte";
  import Vapi from "@vapi-ai/web";
  import WaveSurfer from "wavesurfer.js";

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
    // Recreate wavesurfer when the window is resized
    if (waveSurfer && audioData.length > 0) {
      updateWaveform();
    }
  }

  function updateWaveform() {
    if (!waveSurfer || !modalElement) return;
    
    try {
      // Check if the container exists and is visible
      const container = modalElement.querySelector('.audio-wave-container') as HTMLElement;
      if (!container) {
        console.error("Audio wave container not found");
        return;
      }
      
      // Check if container has dimensions
      if (container.offsetWidth === 0 || container.offsetHeight === 0) {
        console.error("Container has zero dimensions:", container.offsetWidth, "x", container.offsetHeight);
        return;
      }
      
      console.log("Container dimensions:", container.offsetWidth, "x", container.offsetHeight);
      
      // Destroy the old instance
      waveSurfer.destroy();
      
      // Create a new instance with our updated data
      waveSurfer = WaveSurfer.create({
        container: container,
        waveColor: 'violet',
        progressColor: 'purple',
        cursorColor: 'transparent',
        height: 80,
        normalize: true,
        peaks: [audioData.length > 0 ? audioData : [0.5, -0.5, 0.5, -0.5]], // Higher amplitude for visibility
        duration: audioData.length / (audioContext?.sampleRate || 44100)
      });

      // WaveSurfer will automatically render when created
      console.log("Waveform updated with data length:", audioData.length);
    } catch (error) {
      console.error("Error updating waveform:", error);
    }
  }

  // Simulate some activity if we haven't received volume updates
  function simulateActivityIfNeeded() {
    if (!callActive) return;
    
    const now = Date.now();
    // If it's been more than 500ms since the last volume update and we're in a call
    if (now - lastVolumeTime > 500) {
      // Add some random data to create a dynamic waveform
      for (let i = 0; i < 10; i++) {
        // Generate random values between -0.3 and 0.3
        audioData.push((Math.random() * 0.6) - 0.3);
      }
      
      // Keep a reasonable amount of data points
      if (audioData.length > 1000) {
        audioData = audioData.slice(audioData.length - 1000);
      }
      
      lastVolumeTime = now;
      updateWaveform();
    }
  }

  onMount(() => {
    document.addEventListener("keydown", handleKeydown);
    document.addEventListener("mousedown", handleClickOutside);
    
    // Wait for DOM to be ready before initializing WaveSurfer
    setTimeout(() => {
      if (modalElement) {
        // Create an audio context for processing audio data
        audioContext = new AudioContext();
        
        // Initialize with some sample data
        audioData = Array(100).fill(0).map(() => (Math.random() * 0.4) - 0.2);
        
        const container = modalElement.querySelector('.audio-wave-container') as HTMLElement;
        if (!container) {
          console.error("Audio wave container not found during initialization");
          return;
        }
        
        console.log("Initializing WaveSurfer in container:", container);
        
        // Initialize WaveSurfer with minimal options
        try {
          waveSurfer = WaveSurfer.create({
            container: container,
            waveColor: 'violet',
            progressColor: 'purple',
            cursorColor: 'transparent',
            height: 80,
            normalize: true,
            peaks: [audioData],
            duration: audioData.length / (audioContext.sampleRate || 44100)
          });
          console.log("WaveSurfer initialized successfully");
        } catch (error) {
          console.error("Error initializing WaveSurfer:", error);
        }

        // Set up a timer to simulate activity if needed
        const activityTimer = setInterval(simulateActivityIfNeeded, 200);
        
        window.addEventListener('resize', handleResize);
        
        return () => {
          clearInterval(activityTimer);
        };
      }
    }, 1000); // Increased delay to ensure DOM is fully ready
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
    window.removeEventListener('resize', handleResize);
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
          console.log("Successfully retrieved Daily call object:", dailyCallObject);
          
          // Try to subscribe to audio data if possible
          // This is experimental based on VAPI's suggestion
          setTimeout(() => {
            try {
              if (dailyCallObject && dailyCallObject.participants()) {
                console.log("Daily participants:", dailyCallObject.participants());
                
                // Set up audio processing for all participants
                Object.keys(dailyCallObject.participants()).forEach(participantId => {
                  const participant = dailyCallObject.participants()[participantId];
                  console.log("Setting up audio for participant:", participant);
                  
                  // Try to access audio stream if available
                  if (participant.audioTrack) {
                    setupAudioProcessingForTrack(participant.audioTrack);
                  }
                });
                
                // Listen for track started events to capture new audio tracks
                dailyCallObject.on('track-started', (event: any) => {
                  if (event.track.kind === 'audio') {
                    console.log('New audio track started:', event);
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

      // Keep our existing volume-level event listener as a backup
      vapi.on("volume-level", (volume) => {
        volumeLevel = volume;
        lastVolumeTime = Date.now();
        
        console.log("Volume level:", volume);
        
        // Only consider it speaking if volume is above a threshold
        isSpeaking = volume > 0.1;
        
        // Update the audio data array with new volume info
        // Scale volume to get more visible changes
        const scaledVolume = Math.min(volume * 3, 1) * 2 - 1;
        audioData.push(scaledVolume);
        
        // Keep a reasonable amount of data points
        if (audioData.length > 1000) {
          audioData = audioData.slice(audioData.length - 1000);
        }
        
        // Update the waveform visualization
        updateWaveform();
      });
      
      // Listen for message events instead of transcript
      vapi.on("message", (message) => {
        console.log("Message received:", message);
        
        // Check if the message contains transcript data
        if (message && message.type === 'transcript') {
          console.log("Transcript received:", message);
          
          // When we get a transcript, we know someone is speaking
          if (!isSpeaking) {
            // If we're not already marked as speaking, simulate some activity
            for (let i = 0; i < 20; i++) {
              // Generate random values between -0.5 and 0.5 for visible activity
              audioData.push((Math.random() * 1.0) - 0.5);
            }
            
            // Keep a reasonable amount of data points
            if (audioData.length > 1000) {
              audioData = audioData.slice(audioData.length - 1000);
            }
            
            updateWaveform();
          }
        }
      });

      // Replace the "*" event listener with individual listeners for key events
      vapi.on("speech-start", () => {
        console.log("VAPI speech started");
        isSpeaking = true;
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
      
      // Create an analyzer node to get waveform data
      const analyzer = audioContext.createAnalyser();
      analyzer.fftSize = 2048;
      
      // Connect the source to the analyzer
      source.connect(analyzer);
      
      // Set up processing interval to read waveform data
      const bufferLength = analyzer.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      
      // Save the analyzer for cleanup
      audioProcessor = setInterval(() => {
        // Get waveform data
        analyzer.getByteTimeDomainData(dataArray);
        
        // Convert to float values between -1 and 1 for waveform
        const floatData: number[] = [];
        for (let i = 0; i < bufferLength; i += 10) { // Sample every 10th value to reduce data
          floatData.push((dataArray[i] / 128.0) - 1.0);
        }
        
        // Update our audio data
        audioData = [...floatData];
        
        // Update the waveform visualization
        updateWaveform();
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
    const buffer = audioContext!.createBuffer(1, data.length, audioContext!.sampleRate);
    const channel = buffer.getChannelData(0);
    
    for (let i = 0; i < data.length; i++) {
      channel[i] = data[i];
    }
    
    return buffer;
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
            <!-- Audio wave visualization -->
            <div class="audio-wave-container"></div>
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
                Use your phone to call <span
                  class="sunny-modal-option-description-phone">617-329-4181</span
                >
              </p>
            </div>
            <div class="sunny-option">
              <p class="sunny-modal-option">Option 2</p>
              <button
                class="modal-action-btn"
                on:click={() => handleBrowserCall()}
              >
                Start Browser Call
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
     MODAL DIALOG
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

  .sunny-modal-title {
    font-family: "DM Serif Text", serif;
    text-align: center;
    font-size: 24px;
    font-weight: 500;
    line-height: 1.3;
    margin-bottom: 40px;
    color: var(--dark-100);
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
    font-weight: 600;
    color: var(--dark-80);
  }

  .modal-action-btn {
    display: block;
    width: auto;
    height: 40px;
    padding: 0 40px;
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
  }

  .modal-action-btn:disabled {
    background-color: var(--purple-30);
    cursor: not-allowed;
  }

  .sunny-privacy-note {
    margin-top: 14px;
    text-align: center;
    line-height: 1.4;
    font-size: 13px;
    color: var(--dark-70);
  }

  .audio-wave-container {
    width: 100%;
    height: 80px;
    min-height: 80px;
    background-color: rgba(0, 0, 0, 0.03);
    border-radius: 4px;
    overflow: hidden;
    margin: 10px 0;
    display: block;
    position: relative;
  }

  .end-call-btn {
    background-color: red;
    color: white;
    margin-top: 20px;
  }

  .modal-action-btn.end-call-btn:hover {
    background-color: #B20000;
  }

  .call-active-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
  }

  /* ======================
     RESPONSIVE STYLES
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

    .close-button {
      top: 16px;
      right: 16px;
    }
  }
</style>
