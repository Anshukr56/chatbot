const chatbox = document.getElementById("messages");
const userInput = document.getElementById("input");
const sendBtn = document.getElementById("sendBtn");

// Returns current time as "h:mm AM/PM"
function currentTime() {
  return new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

// Build an avatar element for a given role
function makeAvatar(role) {
  const avatar = document.createElement("div");
  avatar.classList.add("msg-avatar");
  if (role === "ai") {
    avatar.innerHTML = `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2C10.3431 2 9 3.34315 9 5C9 6.65685 10.3431 8 12 8C13.6569 8 15 6.65685 15 5C15 3.34315 13.6569 2 12 2Z" fill="currentColor"/>
      <path d="M7 10C5.89543 10 5 10.8954 5 12V19C5 19.5523 5.44772 20 6 20H18C18.5523 20 19 19.5523 19 19V12C19 10.8954 18.1046 10 17 10H7Z" fill="currentColor" opacity="0.8"/>
    </svg>`;
  }
  return avatar;
}

// Add a message bubble to the chat
function addMessage(message, role) {
  const msgDiv = document.createElement("div");
  msgDiv.classList.add("msg", role);

  const avatar = makeAvatar(role);

  const msgBody = document.createElement("div");
  msgBody.classList.add("msg-body");

  const textDiv = document.createElement("div");
  textDiv.classList.add("text");
  textDiv.textContent = message;

  const metaLine = document.createElement("div");
  metaLine.classList.add("meta-line");
  const timeSpan = document.createElement("span");
  timeSpan.classList.add("time");
  timeSpan.textContent = currentTime();
  metaLine.appendChild(timeSpan);

  msgBody.appendChild(textDiv);
  msgBody.appendChild(metaLine);
  msgDiv.appendChild(avatar);
  msgDiv.appendChild(msgBody);

  chatbox.appendChild(msgDiv);
  chatbox.scrollTop = chatbox.scrollHeight;
  return msgDiv;
}

// Show animated three-dot typing indicator
function showTyping() {
  const typingDiv = document.createElement("div");
  typingDiv.classList.add("msg", "ai");

  const avatar = makeAvatar("ai");

  const msgBody = document.createElement("div");
  msgBody.classList.add("msg-body");

  const indicator = document.createElement("div");
  indicator.classList.add("typing-indicator");
  indicator.innerHTML = "<span></span><span></span><span></span>";

  msgBody.appendChild(indicator);
  typingDiv.appendChild(avatar);
  typingDiv.appendChild(msgBody);

  chatbox.appendChild(typingDiv);
  chatbox.scrollTop = chatbox.scrollHeight;
  return typingDiv;
}

// Get AI Reply from Gemini
async function getGeminiReply(userMessage) {
  const apiKey = "AIzaSyBS4D4rPPdqwiFq4vfq0t18k3ulXfn2E-8";
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

// Send message on click
sendBtn.onclick = async () => {
  const message = userInput.value.trim();
  if (message === "") return;
  addMessage(message, "me");
  userInput.value = "";
  userInput.style.height = "auto";

  const typingDiv = showTyping();
  const reply = await getGeminiReply(message);
  typingDiv.remove();
  addMessage(reply, "ai");
};

// Auto-grow textarea
userInput.addEventListener("input", () => {
  userInput.style.height = "auto";
  userInput.style.height = Math.min(userInput.scrollHeight, 120) + "px";
});

// Send message on Enter (Shift+Enter for newline)
userInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendBtn.click();
  }
});

