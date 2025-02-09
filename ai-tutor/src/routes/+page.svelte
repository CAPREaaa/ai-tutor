<script>
    import { onMount, tick } from "svelte";
    let messages = [];
    let input = "";
    let loading = false;
    let chatContainer;
  
    async function sendMessage() {
      if (!input.trim()) return;
  
      messages = [...messages, { role: "user", content: input }];
      input = ""; // clear input field
  
      loading = true;
  
      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: input }),
        });
  
        const data = await response.json();
        if (data.reply) {
          messages = [...messages, { role: "assistant", content: data.reply }];
        } else {
          messages = [...messages, { role: "assistant", content: "AI failed to respond." }];
        }
      } catch (error) {
        console.error("Fetch error:", error);
        messages = [...messages, { role: "assistant", content: "Error contacting AI." }];
      }
  
      loading = false;
      await tick(); // 让 DOM 更新完成后执行滚动
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  </script>
  
  <div class="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-6">
    <!-- Chat Container -->
    <div class="w-full max-w-lg bg-white shadow-lg rounded-2xl p-6 space-y-4">
      <h1 class="text-3xl font-bold text-center">🇫🇷 AI French Tutor</h1>
  
      <!-- Chat Messages -->
      <div 
        bind:this={chatContainer} 
        class="h-96 overflow-y-auto p-3 border rounded-lg bg-gray-50 flex flex-col space-y-3"
      >
        {#each messages as msg}
          <div class="flex {msg.role === 'user' ? 'justify-end' : 'justify-start'}">
            <div class="{msg.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-300 text-black'} px-4 py-2 rounded-xl max-w-xs">
              {msg.content}
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
  