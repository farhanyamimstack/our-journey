// Your web app's Firebase configuration
var firebaseConfig = {
  apiKey: "AIzaSyDFija8HlOQXmmFssx-DAv1IyG2d52gw-Q",
  authDomain: "couple-journal-bec97.firebaseapp.com",
  projectId: "couple-journal-bec97",
  storageBucket: "couple-journal-bec97.appspot.com",
  messagingSenderId: "990069225452",
  appId: "1:990069225452:web:1aca25ae85c34918bdf2c9"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Firestore
var db = firebase.firestore();

// Storage
var storage = firebase.storage();