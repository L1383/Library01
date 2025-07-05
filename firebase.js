import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, query, where, deleteDoc, doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAmZeIOUi-M52OG0eiy5bPFHNydAoqv8hg",
  authDomain: "library-fbfe6.firebaseapp.com",
  projectId: "library-fbfe6",
  storageBucket: "library-fbfe6.appspot.com",
  messagingSenderId: "446025119683",
  appId: "1:446025119683:web:9b4db2c4af306c12a66f76",
  measurementId: "G-X13WFMTPMZ"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const email = document.getElementById("email");
const password = document.getElementById("password");
const signupBtn = document.getElementById("signup");
const loginBtn = document.getElementById("login");
const logoutBtn = document.getElementById("logout");
const addBtn = document.getElementById("addNovel");
const nameInput = document.getElementById("novelName");
const catInput = document.getElementById("novelCategory");
const appDiv = document.getElementById("app");
const novelList = document.getElementById("novels");

signupBtn.onclick = () => {
  createUserWithEmailAndPassword(auth, email.value, password.value)
    .then(() => alert("ثبت‌نام موفق"))
    .catch(err => alert("خطا: " + err.message));
};

loginBtn.onclick = () => {
  signInWithEmailAndPassword(auth, email.value, password.value)
    .then(() => alert("ورود موفق"))
    .catch(err => alert("خطا: " + err.message));
};

logoutBtn.onclick = () => {
  signOut(auth).then(() => alert("خروج انجام شد"));
};

onAuthStateChanged(auth, async user => {
  if (user) {
    appDiv.style.display = "block";
    loadNovels(user.uid);
    addBtn.onclick = async () => {
      const name = nameInput.value.trim();
      const cat = catInput.value.trim();
      if (!name) return alert("نام وارد نشده");
      await addDoc(collection(db, "novels"), {
        uid: user.uid,
        name,
        category: cat || "نامشخص"
      });
      nameInput.value = "";
      catInput.value = "";
      loadNovels(user.uid);
    };
  } else {
    appDiv.style.display = "none";
    novelList.innerHTML = "";
  }
});

async function loadNovels(uid) {
  novelList.innerHTML = "در حال بارگذاری...";
  const q = query(collection(db, "novels"), where("uid", "==", uid));
  const snapshot = await getDocs(q);
  novelList.innerHTML = "";
  snapshot.forEach(docSnap => {
    const data = docSnap.data();
    const div = document.createElement("div");
    div.className = "novel-item";
    div.innerHTML = `
      <strong>${data.name}</strong><br>
      دسته: ${data.category}<br>
      <button onclick="editNovel('${docSnap.id}', '${data.name}', '${data.category}')">✏️ ویرایش</button>
      <button onclick="deleteNovel('${docSnap.id}')">🗑️ حذف</button>
    `;
    novelList.appendChild(div);
  });
}

window.editNovel = async function(id, oldName, oldCat) {
  const name = prompt("نام جدید:", oldName);
  if (name === null) return;
  const cat = prompt("دسته‌بندی جدید:", oldCat);
  const ref = doc(db, "novels", id);
  await updateDoc(ref, { name, category: cat });
  loadNovels(auth.currentUser.uid);
};

window.deleteNovel = async function(id) {
  const ok = confirm("آیا مطمئن هستید؟");
  if (!ok) return;
  await deleteDoc(doc(db, "novels", id));
  loadNovels(auth.currentUser.uid);
};
