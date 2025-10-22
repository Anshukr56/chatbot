const chatbox = document.getElementById("messages");
const userInput = document.getElementById("input");
const sendBtn = document.getElementById("sendBtn");

// ✅ Function to add message
function addMessage(message, classNme) {
  const msgDiv = document.createElement("div");
  msgDiv.classList.add("msg", classNme);
  const textDiv = document.createElement("div");
  textDiv.classList.add("text");
  textDiv.textContent = message;
  msgDiv.appendChild(textDiv);
  chatbox.appendChild(msgDiv);
  chatbox.scrollTop = chatbox.scrollHeight;
}

// ✅ Show typing animation
function showTyping() {
  const typingDiv = document.createElement("div");
  typingDiv.classList.add("msg", "ai");
  const textDiv = document.createElement("div");
  textDiv.classList.add("text");
  textDiv.textContent = "AI is typing...";
  typingDiv.appendChild(textDiv);
  chatbox.appendChild(typingDiv);
  chatbox.scrollTop = chatbox.scrollHeight;
  return typingDiv;
}

// ✅ Get AI Reply
async function getGeminiReply(userMessage) {
  const apiKey = "AIzaSyBS4D4rPPdqwiFq4vfq0t18k3ulXfn2E-8"; // 👈 put your key here
  // ✅ This is the correct line
  // ✅ ADD THIS LINE
  const url =
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=" +
    apiKey;
  const body = {
    contents: [{ parts: [{ text: userMessage }] }],
  };

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    console.log("Gemini API Response:", data);

    if (data?.candidates?.[0]?.content?.parts?.[0]?.text) {
      return data.candidates[0].content.parts[0].text;
    } else if (data.error?.message) {
      return "Error: " + data.error.message;
    } else {
      return "Sorry, no response from Gemini.";
    }
  } catch (err) {
    console.error("Fetch error:", err);
    return "Error connecting to Gemini API.";
  }
}

// ✅ Send message on click
sendBtn.onclick = async () => {
  const message = userInput.value.trim();
  if (message === "") return;
  addMessage(message, "me");
  userInput.value = "";

  const typingDiv = showTyping();
  const reply = await getGeminiReply(message);
  typingDiv.remove();
  addMessage(reply, "ai");
};

// ✅ Send message when pressing Enter
userInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendBtn.click();
});
