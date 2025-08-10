import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import {
  getAuth,
  signOut,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

import {
  getFirestore,
  collection,
  addDoc,
  query,
  onSnapshot,
  orderBy,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

const firebaseConfig = {
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
let db = getFirestore(app);

const ADMIN_EMAILS = ["saadismail.co@gmail.com", "dusraadmin@example.com"];

let logoutBtn = document.getElementById("logoutBtn");
let addProductBtn = document.getElementById("addProductBtn");
let productList = document.getElementById("productList");

let adminAddArea = document.getElementById("adminAddArea");
let adminAddBtn = document.getElementById("adminAddBtn");

let adminName = document.getElementById("adminName");
let adminDesc = document.getElementById("adminDesc");
let adminPrice = document.getElementById("adminPrice");
let adminImage = document.getElementById("adminImage");

let pname = document.getElementById("pname");
let pdesc = document.getElementById("pdesc");
let pprice = document.getElementById("pprice");
let pimage = document.getElementById("pimage");

let productTemplate = document.getElementById("product-template");

logoutBtn.addEventListener("click", async () => {
  await signOut(auth);
  Swal.fire("Logged out", "You have been logged out", "success").then(() => {
    window.location.href = "index.html";
  });
});

onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "index.html";
    return;
  }

  document.getElementById("userEmail").textContent = user.email;
  document.getElementById("welcome").textContent = `Welcome, ${
    user.displayName || user.email
  }`;

  const isAdmin = ADMIN_EMAILS.includes(user.email);
  if (isAdmin) adminAddArea.classList.remove("hidden");

  let productsRef = collection(db, "products");
  let q = query(productsRef, orderBy("createdAt", "desc"));

  onSnapshot(q, (snapshot) => {
    productList.innerHTML = "";
    snapshot.forEach((docSnap) => {
      let data = docSnap.data();
      let id = docSnap.id;

      if (data.isAdminItem === true || data.ownerUid === user.uid) {
        let clone = productTemplate.content.cloneNode(true);
        let card = clone.querySelector(".product-card");
        let img = clone.querySelector(".product-img");
        let titleEl = clone.querySelector(".product-title");
        let descEl = clone.querySelector(".product-desc");
        let priceEl = clone.querySelector(".product-price");
        let controls = clone.querySelector(".product-controls");

        img.src =
          data.image ||
          "https://fakestoreapi.com/img/81fPKd-2AYL._AC_SL1500_.jpg";
        titleEl.textContent = data.title;
        descEl.textContent = data.description
          ? data.description.slice(0, 120) +
            (data.description.length > 120 ? "..." : "")
          : "";
        priceEl.textContent = `PKR ${data.price}`;

        if (data.ownerUid === user.uid) {
          let editBtn = document.createElement("button");
          editBtn.className = "bg-yellow-400 px-3 py-1 rounded";
          editBtn.textContent = "Edit";
          editBtn.addEventListener("click", () => openEditModal(id, data));

          let delBtn = document.createElement("button");
          delBtn.className = "bg-red-500 text-white px-3 py-1 rounded";
          delBtn.textContent = "Delete";
          delBtn.addEventListener("click", () => deleteProduct(id));

          controls.appendChild(editBtn);
          controls.appendChild(delBtn);
        }

        if (data.isAdminItem && ADMIN_EMAILS.includes(user.email)) {
          let delBtn = document.createElement("button");
          delBtn.className = "bg-red-500 text-white px-3 py-1 rounded";
          delBtn.textContent = "Delete (Admin)";
          delBtn.addEventListener("click", () => deleteProduct(id));
          controls.appendChild(delBtn);
        }

        productList.appendChild(clone);
      }
    });
  });
});

addProductBtn.addEventListener("click", async () => {
  let user = auth.currentUser;
  if (!user) {
    Swal.fire("Error", "Not authenticated", "error");
    return;
  }

  let title = pname.value.trim();
  let description = pdesc.value.trim();
  let price = pprice.value.trim();
  let image = pimage.value.trim();

  if (!title || !description || !price) {
    Swal.fire("Error", "Please fill all product fields", "error");
    return;
  }

  try {
    await addDoc(collection(db, "products"), {
      title,
      description,
      price: Number(price),
      image: image || null,
      ownerUid: user.uid,
      ownerEmail: user.email,
      isAdminItem: false,
      createdAt: serverTimestamp(),
    });

    Swal.fire("Success", "Product added successfully!", "success");
    pname.value = "";
    pdesc.value = "";
    pprice.value = "";
    pimage.value = "";
  } catch (err) {
    Swal.fire("Error", err.message, "error");
  }
});

adminAddBtn.addEventListener("click", async () => {
  let user = auth.currentUser;
  if (!user || !ADMIN_EMAILS.includes(user.email)) {
    Swal.fire("Error", "Not authorized", "error");
    return;
  }

  let title = adminName.value.trim();
  let description = adminDesc.value.trim();
  let price = adminPrice.value.trim();
  let image = adminImage.value.trim();

  if (!title || !description || !price) {
    Swal.fire("Error", "Please fill all fields", "error");
    return;
  }

  try {
    await addDoc(collection(db, "products"), {
      title,
      description,
      price: Number(price),
      image: image || null,
      ownerUid: user.uid,
      ownerEmail: user.email,
      isAdminItem: true,
      createdAt: serverTimestamp(),
    });

    Swal.fire("Success", "Admin item added!", "success");
    adminName.value = "";
    adminDesc.value = "";
    adminPrice.value = "";
    adminImage.value = "";
  } catch (err) {
    Swal.fire("Error", err.message, "error");
  }
});

async function deleteProduct(docId) {
  let confirmed = await Swal.fire({
    title: "Delete product?",
    text: "This action cannot be undone.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Yes, delete",
  });

  if (!confirmed.isConfirmed) return;

  try {
    await deleteDoc(doc(db, "products", docId));
    Swal.fire("Deleted", "Product removed", "success");
  } catch (err) {
    Swal.fire("Error", err.message, "error");
  }
}

async function openEditModal(docId, data) {
  let { value: formValues } = await Swal.fire({
    title: "Edit product",
    html:
      `<input id="swal-title" class="swal2-input" placeholder="Title" value="${escapeHtml(
        data.title
      )}">` +
      `<input id="swal-desc" class="swal2-input" placeholder="Description" value="${escapeHtml(
        data.description || ""
      )}">` +
      `<input id="swal-price" class="swal2-input" placeholder="Price" type="number" value="${data.price}">` +
      `<input id="swal-image" class="swal2-input" placeholder="Image URL (optional)" value="${escapeHtml(
        data.image || ""
      )}">`,
    focusConfirm: false,
    preConfirm: () => {
      return {
        title: document.getElementById("swal-title").value,
        description: document.getElementById("swal-desc").value,
        price: document.getElementById("swal-price").value,
        image: document.getElementById("swal-image").value,
      };
    },
  });

  if (!formValues) return;

  if (!formValues.title || !formValues.description || !formValues.price) {
    Swal.fire("Error", "All fields required", "error");
    return;
  }

  try {
    await updateDoc(doc(db, "products", docId), {
      title: formValues.title,
      description: formValues.description,
      price: Number(formValues.price),
      image: formValues.image || null,
    });
    Swal.fire("Updated", "Product updated", "success");
  } catch (err) {
    Swal.fire("Error", err.message, "error");
  }
}

function escapeHtml(str) {
  return (str || "")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
