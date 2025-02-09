<script>
    import { onMount, tick } from "svelte";
  
    let messages = [];
    let input = "";
    let loading = false;
    let chatContainer;
    let currentUtterance = null;
    let isPlaying = false;
    let playingIndex = null; // Track which message is playing
  
    // Function to play text-to-speech for a specific AI message
    function speak(text, index) {
      if ("speechSynthesis" in window) {
        // Stop any currently playing speech
        stopSpeech();
  
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = "fr-FR";
  
        // Handle speech end event
        utterance.onend = () => {
          isPlaying = false;
          playingIndex = null; // Reset playing state
        };
  
        // Start speaking
        currentUtterance = utterance;
        speechSynthesis.speak(utterance);
  
        isPlaying = true;
        playingIndex = index;
      } else {
        console.error("Speech synthesis not supported in this browser.");
      }
    }
  
    // Function to stop speech
    function stopSpeech() {
      if (speechSynthesis.speaking) {
        speechSynthesis.cancel();
        isPlaying = false;
        playingIndex = null;
      }
    }
  
    async function sendMessage() {
      if (!input.trim()) return;
  
      const userMessage = input;
      messages = [...messages, { role: "user", content: userMessage }];
      input = "";
  
      loading = true;
  
      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: userMessage }),
        });
  
        const data = await response.json();
        const replyText = data.reply ? data.reply : "AI failed to respond.";
        messages = [...messages, { role: "assistant", content: replyText }];
      } catch (error) {
        console.error("Fetch error:", error);
        messages = [...messages, { role: "assistant", content: "Error contacting AI." }];
      }
  
      loading = false;
      await tick();
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  </script>
  
  <!-- Chat UI -->
  <div class="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-6">
    <div class="w-full max-w-lg bg-white shadow-lg rounded-2xl p-6 space-y-4">
      <h1 class="text-3xl font-bold text-center">🇫🇷 AI French Tutor</h1>
  
      <!-- Chat Messages -->
      <div 
        bind:this={chatContainer} 
        class="h-96 overflow-y-auto p-3 border rounded-lg bg-gray-50 flex flex-col space-y-3"
      >
        {#each messages as msg, index}
          <div class="flex {msg.role === 'user' ? 'justify-end' : 'justify-start'} items-center">
            <div 
              class="{msg.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-300 text-black'} 
                     px-4 py-2 rounded-xl max-w-xs relative flex items-center"
            >
              {msg.content}
              
              {#if msg.role === 'assistant'}
                <!-- Play/Pause Button -->
                <button 
                  class="ml-2 text-gray-700 hover:text-black transition"
                  on:click={() => isPlaying && playingIndex === index ? stopSpeech() : speak(msg.content, index)}
                >
                  {#if isPlaying && playingIndex === index}
                    ⏸️ <!-- Pause Icon -->
                  {:else}
                    🔊 <!-- Play Icon -->
                  {/if}
                </button>
              {/if}
            </div>
          </div>
        {/each}
  
        {#if loading}
          <p class="text-gray-500 text-center animate-pulse">AI is thinking...</p>
        {/if}
      </div>
  
      <!-- Input Field -->
      <div class="flex space-x-2">
        <input 
          type="text" 
          bind:value={input} 
          class="flex-1 p-3 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none" 
          placeholder="Type your message..."
          on:keypress={(e) => e.key === 'Enter' && sendMessage()}
        />
        <button 
          on:click={sendMessage} 
          class="bg-blue-500 text-white px-4 py-3 rounded-lg hover:bg-blue-600 transition shadow-md"
        >
          Send
        </button>
      </div>
    </div>
  </div>
  