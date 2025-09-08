// Importe as funções necessárias do SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyD2mKmpYLYJa7sctUbFyRD4gRVJXwpmyIo",
    authDomain: "financeirochat-e3bf0.firebaseapp.com",
    projectId: "financeirochat-e3bf0",
    storageBucket: "financeirochat-e3bf0.firebasestorage.app",
    messagingSenderId: "380222937464",
    appId: "1:380222937464:web:fa4ae2ed0f6388304fd08d"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
