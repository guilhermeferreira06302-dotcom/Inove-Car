
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, setPersistence, browserLocalPersistence } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDQgkCuNhnjvC7RViNVKhufMgmeF1H26fE",
  authDomain: "inovecar-c9be0.firebaseapp.com",
  projectId: "inovecar-c9be0",
  storageBucket: "inovecar-c9be0.firebasestorage.app",
  messagingSenderId: "535409320279",
  appId: "1:535409320279:web:e661ef9e77f94e2639de12"
};

let auth: any = null;
let db: any = null;

try {
  const app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  
  // Garante que o login não expire ao fechar a aba
  setPersistence(auth, browserLocalPersistence).catch(console.error);

  console.group("🚀 Firebase Initialized");
  console.log("Config Checked: OK");
  console.groupEnd();
} catch (error) {
  console.error("❌ Firebase Init Error:", error);
}

export { auth, db };
