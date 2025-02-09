<script>
  import { onMount } from "svelte";
  let messages = [];
  let input = "";
  let loading = false;

  async function sendMessage() {
    if (!input.trim()) return;
    
    messages = [...messages, { role: "user", content: input }];
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

    input = "";
    loading = false;
  }
</script>

<div class="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-6">
  <div class="w-full max-w-lg bg-white shadow-lg rounded-xl p-4">
    <h1 class="text-2xl font-semibold text-center mb-4">🇫🇷 AI French Tutor</h1>
    <div class="space-y-3 h-96 overflow-y-auto p-2 border rounded bg-gray-50">
      {#each messages as msg}
        <div class="{msg.role === 'user' ? 'text-right' : 'text-left'}">
          <p class="inline-block px-3 py-2 rounded-lg {msg.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-300'}">
            {msg.content}
          </p>
        </div>
      {/each}
      {#if loading}
        <p class="text-gray-500 text-center">AI is thinking...</p>
      {/if}
    </div>
    <div class="mt-4 flex">
      <input type="text" bind:value={input} class="flex-1 p-2 border rounded-l" placeholder="Type your message..." />
      <button on:click={sendMessage} class="bg-blue-500 text-white px-4 py-2 rounded-r hover:bg-blue-600">
        Send
      </button>
    </div>
  </div>
</div>
