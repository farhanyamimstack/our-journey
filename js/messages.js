// =============================
// REAL-TIME SHARED MESSAGES
// =============================

// DOM
const sendBtn = document.getElementById("sendMessageBtn");
const messageInput = document.getElementById("messageInput");
const messagesContainer = document.getElementById("messagesContainer");

// CHANGE THIS NAME FOR YOU
const YOUR_NAME = "You"; 
// On her phone/laptop, change to: const YOUR_NAME = "Her";

sendBtn.addEventListener("click", async () => {
    const text = messageInput.value.trim();
    if (!text) return;

    await db.collection("messages").add({
        text: text,
        author: YOUR_NAME,
        timestamp: Date.now()
    });

    messageInput.value = "";
});

// Real-time listener
db.collection("messages")
  .orderBy("timestamp", "asc")
  .onSnapshot((snapshot) => {
      messagesContainer.innerHTML = "";

      snapshot.forEach((doc) => {
          const data = doc.data();

          const msg = document.createElement("div");
          msg.classList.add("message-card");

          // If you wrote it → right bubble
          if (data.author === YOUR_NAME) {
              msg.classList.add("message-me");
          } else {
              msg.classList.add("message-them");
          }

          msg.innerHTML = `
              <div class="message-author">${data.author}</div>
              <div>${data.text}</div>
          `;

          messagesContainer.appendChild(msg);
      });

      // Auto scroll
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
  });
