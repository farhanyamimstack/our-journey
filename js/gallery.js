// ============================
// GALLERY — CLOUDINARY VERSION
// Polaroid Only
// ============================

// DOM elements
const uploadBtn = document.getElementById("uploadBtn");
const imageUpload = document.getElementById("imageUpload");
const captionInput = document.getElementById("captionInput");
const galleryContainer = document.getElementById("galleryContainer");

// Cloudinary config
const cloudName = "djjfzwupk";  // <-- tukar ikut cloud kau
const uploadPreset = "unsigned_journal"; // <-- preset yg kau baru buat

// Upload to Cloudinary
async function uploadToCloudinary(file) {
    const cloudName = "djjfzwupk"; 
    const uploadPreset = "unsigned_journal";

    const url = `https://api.cloudinary.com/v1_1/${cloudName}/upload`;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);

    const response = await fetch(url, {
        method: "POST",
        body: formData
    });

    const result = await response.json().catch(() => null);

    if (!result || result.error) {
        console.error("Cloudinary Error:", result);
        alert("Upload failed — check upload preset settings.");
        return null;
    }

    return result.secure_url;
}

// Upload handler
uploadBtn.addEventListener("click", async () => {
    const file = imageUpload.files[0];
    const caption = captionInput.value.trim();

    if (!file) return alert("Select an image first!");

    const url = await uploadToCloudinary(file);
    if (!url) return;

    // Save metadata to Firestore
    await db.collection("gallery").add({
        url: url,
        caption: caption,
        timestamp: Date.now()
    });

    captionInput.value = "";
    imageUpload.value = "";
});

// Real-time listener
db.collection("gallery")
  .orderBy("timestamp", "desc")
  .onSnapshot((snapshot) => {
      galleryContainer.innerHTML = "";

      snapshot.forEach((doc) => {
          const data = doc.data();

          const card = document.createElement("div");
          card.className = "polaroid";

          card.innerHTML = `
              <img src="${data.url}" alt="memory">
              <p class="caption">${data.caption || ""}</p>
              <button class="deleteBtn">Delete</button>
          `;

          // Delete handler
          card.querySelector(".deleteBtn").addEventListener("click", () => {
              deleteImage(doc.id, data.url);
          });

          galleryContainer.appendChild(card);
      });
  });

// Delete image (Cloudinary + Firestore)
async function deleteImage(docId, imageUrl) {

    // 1 — Delete from Cloudinary
    // NOTE: Free account tak boleh delete unsigned upload terus dari frontend.
    // So kita delete dari Firestore sahaja.

    await db.collection("gallery").doc(docId).delete();
    alert("Deleted!");
}
