import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

let firebaseConfig = {
  apiKey: "AIzaSyBAQqjdzQR-du8azJ-4Ki_PBhKovt41ep4",
  authDomain: "login-and-signup-39d78.firebaseapp.com",
  projectId: "login-and-signup-39d78",
  storageBucket: "login-and-signup-39d78.firebasestorage.app",
  messagingSenderId: "431287081207",
  appId: "1:431287081207:web:4dd6d629b35d9693f29bf2",
  measurementId: "G-JKJZG3K85D",
};

let app = initializeApp(firebaseConfig);
let auth = getAuth(app);

let ADMIN_EMAILS = ["saadismail.co@gmail.com"];

let signupBtn = document.getElementById("signupBtn");
let loginBtn = document.getElementById("loginBtn");

signupBtn.addEventListener("click", async () => {
  let name = document.getElementById("name").value.trim();
  let email = document.getElementById("email").value.trim();
  let password = document.getElementById("password").value.trim();

  if (!name || !email || !password) {
    Swal.fire("Error", "All fields are required!", "error");
    return;
  }

  try {
    let userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    await updateProfile(userCredential.user, { displayName: name });

    Swal.fire("Success", "Signup successful! Redirecting...", "success").then(
      () => {
        window.location.href = "dashboard.html";
      }
    );
  } catch (err) {
    Swal.fire("Error", err.message, "error");
  }
});

loginBtn.addEventListener("click", async () => {
  let email = document.getElementById("email").value.trim();
  let password = document.getElementById("password").value.trim();

  if (!email || !password) {
    Swal.fire("Error", "Enter email and password", "error");
    return;
  }

  try {
    await signInWithEmailAndPassword(auth, email, password);
    Swal.fire("Success", "Login successful! Redirecting...", "success").then(
      () => {
        window.location.href = "dashboard.html";
      }
    );
  } catch (err) {
    Swal.fire("Error", err.message, "error");
  }
});
