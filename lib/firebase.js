import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyA0vXdU6Nr6rTnm91O64ifBLbf8xYlZ5gA",
  authDomain: "bbfl-firebase.firebaseapp.com",
  projectId: "bbfl-firebase",
  storageBucket: "bbfl-firebase.firebasestorage.app",
  messagingSenderId: "691531124291",
  appId: "1:691531124291:web:c824a7c36b59331d210ef6",
  measurementId: "G-PJHV60HRHR"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };