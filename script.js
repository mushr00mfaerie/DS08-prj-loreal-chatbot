/* DOM elements */
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatWindow = document.getElementById("chatWindow");

// Set initial message
chatWindow.textContent = "👋 Hello! How can I help you today?";

// Conversation context
const messages = [
  {
    role: "system",
    content:
      "You are a chatbot that only answers questions related to L’Oréal products, routines, and beauty-related topics. Politely refuse to answer unrelated questions.",
  },
];

/* Handle form submit */
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const userMessage = userInput.value.trim();
  if (!userMessage) return;

  // Add user message to context
  messages.push({ role: "user", content: userMessage });

  // Display user message
  appendMessage(userMessage, "user");

  // Clear input field
  userInput.value = "";

  // Display loading message
  appendMessage("Typing...", "ai");

  try {
    // Send request to Cloudflare Worker endpoint
    const response = await fetch("https://lorealprj.dasherr1.workers.dev/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: messages,
        max_tokens: 1000,
      }),
    });

    const data = await response.json();
    const aiMessage = data.choices[0].message.content;

    // Add AI response to context
    messages.push({ role: "assistant", content: aiMessage });

    // Replace loading message with AI response
    removeLastMessage();
    appendMessage(aiMessage, "ai");
  } catch (error) {
    // Replace loading message with error message
    removeLastMessage();
    appendMessage(
      "Sorry, I couldn't process your request. Please try again later.",
      "ai"
    );
  }
});

/* Helper functions */
function appendMessage(message, sender) {
  const msgDiv = document.createElement("div");
  msgDiv.classList.add("msg", sender);

  // Apply alignment based on sender
  if (sender === "user") {
    msgDiv.style.alignSelf = "flex-end";
  } else if (sender === "ai") {
    msgDiv.style.alignSelf = "flex-start";
  }

  msgDiv.textContent = message;
  chatWindow.appendChild(msgDiv);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

function removeLastMessage() {
  const lastMessage = chatWindow.querySelector(".msg:last-child");
  if (lastMessage) {
    chatWindow.removeChild(lastMessage);
  }
}
