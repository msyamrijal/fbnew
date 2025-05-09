// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
// Walaupun analytics tidak digunakan untuk menampilkan data ini, kita tetap include sesuai skrip awal
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-analytics.js";
import { getFirestore, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js"; // addDoc dan serverTimestamp mungkin tidak diperlukan lagi di sini jika penambahan data sudah selesai
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB-euXJz9b3HyfvjmG5tzu2wMqvbY3bH5E",
  authDomain: "jadwal-pemakalah-akademik.firebaseapp.com",
  projectId: "jadwal-pemakalah-akademik",
  storageBucket: "jadwal-pemakalah-akademik.firebasestorage.app",
  messagingSenderId: "230646165475",
  appId: "1:230646165475:web:9f0ce777977eb2ddb07ad6",
  measurementId: "G-DF2MZTSJER"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app); // Analytics diinisialisasi tapi tidak digunakan untuk display
const db = getFirestore(app); // Initialize Firestore
const auth = getAuth(app); // Initialize Firebase Auth

const firebaseConfigDisplay = document.getElementById('firebase-config-display');
if (firebaseConfigDisplay) {
    firebaseConfigDisplay.textContent = JSON.stringify(firebaseConfig, null, 2);
}

// --- Bagian Autentikasi dan Tampilan Data Pengguna ---
const googleLoginButton = document.getElementById('google-login-button');
const logoutButton = document.getElementById('logout-button');
const userEmailDisplay = document.getElementById('user-email');
const userJadwalDisplay = document.getElementById('user-jadwal-display');
const loginSection = document.getElementById('login-section');
const userSection = document.getElementById('user-section');
const configSection = document.getElementById('config-section'); // Untuk menyembunyikan config setelah login

// Listener untuk tombol login Google
if (googleLoginButton) {
    googleLoginButton.addEventListener('click', async () => {
        const provider = new GoogleAuthProvider();
        try {
            const result = await signInWithPopup(auth, provider);
            // Informasi pengguna ada di result.user
            console.log('Login Google berhasil!', result.user);
        } catch (error) {
            console.error('Error login Google:', error.message);
            // Handle Errors here.
            // const errorCode = error.code;
            // const errorMessage = error.message;
            // The email of the user's account used.
            // const email = error.customData.email;
            // The AuthCredential type that was used.
            // const credential = GoogleAuthProvider.credentialFromError(error);
            alert(`Gagal login dengan Google: ${error.message}`);
        }
    });
}

// Listener untuk tombol logout
if (logoutButton) {
    logoutButton.addEventListener('click', async () => {
        try {
            await signOut(auth);
            console.log('Logout berhasil!');
        } catch (error) {
            console.error('Error logout:', error.message);
            alert(`Gagal logout: ${error.message}`);
        }
    });
}

// Mendengarkan perubahan status autentikasi
onAuthStateChanged(auth, async (user) => {
    if (user) {
        // Pengguna login
        console.log('Pengguna login:', user.uid, user.email);
        if (loginSection) loginSection.style.display = 'none';
        if (userSection) userSection.style.display = 'block';
        if (configSection) configSection.style.display = 'none'; // Sembunyikan config
        if (userEmailDisplay) userEmailDisplay.textContent = user.email;
        await tampilkanJadwalPengguna(user.uid);
    } else {
        // Pengguna logout atau belum login
        console.log('Pengguna logout atau belum login');
        if (loginSection) loginSection.style.display = 'block';
        if (userSection) userSection.style.display = 'none';
        if (configSection) configSection.style.display = 'block'; // Tampilkan lagi config
        if (userEmailDisplay) userEmailDisplay.textContent = '';
        if (userJadwalDisplay) userJadwalDisplay.innerHTML = '<p>Silakan login untuk melihat jadwal Anda.</p>';
    }
});

// Fungsi untuk mengambil dan menampilkan jadwal pengguna
async function tampilkanJadwalPengguna(uid) {
  if (!userJadwalDisplay) return;
  userJadwalDisplay.innerHTML = '<p>Memuat jadwal...</p>';
  const namaKoleksi = "schedules"; // Mengubah nama koleksi sesuai deskripsi Anda
  try {
    const q = query(collection(db, namaKoleksi), where("participants", "array-contains", uid));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      userJadwalDisplay.innerHTML = '<p>Tidak ada jadwal yang ditemukan untuk Anda.</p>';
      return;
    }

    let html = '<ul>';
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      html += `<li>
                  <strong>${data.Mata_Pelajaran}</strong> - ${data.Materi_Diskusi}
                  <br>Institusi: ${data.Institusi}
                  <br>Tanggal: ${new Date(data.Tanggal).toLocaleString()}
               </li>`;
    });
    html += '</ul>';
    userJadwalDisplay.innerHTML = html;

  } catch (error) {
    console.error("Error mengambil jadwal pengguna: ", error);
    userJadwalDisplay.innerHTML = '<p>Gagal memuat jadwal. Coba lagi nanti.</p>';
  }
}
