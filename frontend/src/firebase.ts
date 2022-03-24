import firebase from "firebase/app";
import "firebase/firestore";
import "firebase/auth";

// const firebaseConfig = {
//   apiKey: process.env.REACT_APP_API_KEY,
//   authDomain: process.env.REACT_APP_AUTH_DOMAIN,
//   databaseURL: process.env.REACT_APP_DATABASE_URL,
//   projectId: process.env.REACT_APP_PROJECT_ID,
//   storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
//   messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID,
//   appId: process.env.REACT_APP_APP_ID,
//   measurementId: process.env.REACT_APP_MEASUREMENT_ID,
// };

const firebaseConfig = {
  apiKey: "AIzaSyDBt0MmnnFJNIoKp8tGSlelq4LMFWofVjU",
  authDomain: "owleer-3af92.firebaseapp.com",
  projectId: "owleer-3af92",
  storageBucket: "owleer-3af92.appspot.com",
  messagingSenderId: "744656243538",
  appId: "1:744656243538:web:98b9b319fdc843f0b4888b",
  measurementId: "G-XV2YHDB43H",
};

firebase.initializeApp(firebaseConfig);

type resetPasswordForEmailType = (email: string) => Promise<void>;

const auth = firebase.auth();

export const createUserOnFirebase = async (email: string, password: string) => {
  try {
    const firebaseUser = await auth.createUserWithEmailAndPassword(
      email,
      password
    );

    if (!firebaseUser.user) {
      return;
    }

    return firebaseUser.user;
  } catch (e) {
    throw e;
  }
};

export const doUserLoginOnFirebase = async (
  email: string,
  password: string
) => {
  try {
    const firebaseUser = await auth.signInWithEmailAndPassword(email, password);
    localStorage.setItem("refreshToken", firebaseUser.user?.refreshToken || "")
    if (!firebaseUser.user) {
      return;
    }

    return firebaseUser.user;
  } catch (e) {
    throw e;
  }
};

export const resetPasswordForEmailFirebase: resetPasswordForEmailType = (
  email
) =>
  new Promise(async (resolve, reject) => {
    try {
      await auth.sendPasswordResetEmail(email);
      resolve();
    } catch (e) {
      reject(e);
    }
  });

export const refreshToken = async () => {
  const method = 'POST';
  const token = localStorage.getItem("refreshToken");
  const headers = {
    'Content-Type': 'application/x-www-form-urlencoded',
  }
  const url = `https://securetoken.googleapis.com/v1/token?key=${firebaseConfig.apiKey}&grant_type=refresh_token&refresh_token=${token}`;
  const response = await fetch(url,{method, headers})
      .then(res => {
        return res.json()
      })
      .catch(error => error)
  return await response;

}




export const logoutUserFromFirebase = async () => await auth.signOut();
