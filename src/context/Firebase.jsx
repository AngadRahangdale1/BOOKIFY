import { createContext, useContext, useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  updateProfile,
} from "firebase/auth";

import {
  getFirestore
  ,collection,
  collectionGroup,
  addDoc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  arrayUnion,
} from "firebase/firestore";

const FirebaseContext = createContext(null);

const firebaseConfig = {
  apiKey: "AIzaSyA9PleyH1OYhx5pG_M3Go-aVWv69nUS7PU",
  authDomain: "bookify-abb96.firebaseapp.com",
  projectId: "bookify-abb96",
  storageBucket: "bookify-abb96.firebasestorage.app",
  messagingSenderId: "872225554287",
  appId: "1:872225554287:web:d181476dd72680d9a7f29a",
  measurementId: "G-EW3L4RX1HX",
};

const firebaseApp = initializeApp(firebaseConfig);
const firebaseAuth = getAuth(firebaseApp);
const googleAuthProvider = new GoogleAuthProvider();
// const firestore = getFirestore(firebaseApp);
const firestore = getFirestore(firebaseApp);
export const useFirebase = () => useContext(FirebaseContext);

export const FirebaseProvider = (props) => {

  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const getOrCreateUserProfile = async (authUser) => {
    if (!authUser) return null;

    const profileRef = doc(firestore, "users", authUser.uid);
    const snapshot = await getDoc(profileRef);

    if (!snapshot.exists()) {
      const payload = {
        name: authUser.displayName || authUser.email?.split("@")[0] || "Reader",
        email: authUser.email || "",
        bio: "",
        avatarUrl: authUser.photoURL || "",
        readBookIds: [],
        createdAt: new Date(),
      };
      await setDoc(profileRef, payload);
      return payload;
    }

    const data = snapshot.data();
    if (data.email !== authUser.email) {
      await updateDoc(profileRef, { email: authUser.email || "" });
    }

    return {
      ...data,
      email: authUser.email || data.email || "",
    };
  };

  // Listen for authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, async (authUser) => {
      try {
        if (authUser) {
          setUser(authUser);
          const profileData = await getOrCreateUserProfile(authUser);
          setUserProfile(profileData);
        } else {
          setUser(null);
          setUserProfile(null);
        }
      } finally {
        setAuthLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  // Authentication methods
  const signupUserWithEmailAndPassword = (email, password) =>
    createUserWithEmailAndPassword(firebaseAuth, email, password);

  // Login method
  const loginUserWithEmailAndPassword = (email, password) =>
    signInWithEmailAndPassword(firebaseAuth, email, password);

  // Google Sign-In method
  const signInWithGoogle = () => signInWithPopup(firebaseAuth, googleAuthProvider);

  // Sign out method
  const signOutUser = () => firebaseAuth.signOut();

  const refreshUserProfile = async () => {
    if (!user) return null;
    const profileData = await getOrCreateUserProfile(user);
    setUserProfile(profileData);
    return profileData;
  };

  const updateCurrentUserProfile = async ({ name, bio, avatarUrl }) => {
    if (!user) {
      throw new Error("You must be logged in to update profile.");
    }

    const profileRef = doc(firestore, "users", user.uid);
    const updates = {};

    if (typeof name === "string") updates.name = name.trim();
    if (typeof bio === "string") updates.bio = bio.trim();
    if (typeof avatarUrl === "string") updates.avatarUrl = avatarUrl.trim();

    if (Object.keys(updates).length === 0) {
      return refreshUserProfile();
    }

    await updateDoc(profileRef, updates);

    const authUpdates = {};
    if (typeof name === "string" && name.trim()) {
      authUpdates.displayName = name.trim();
    }
    if (typeof avatarUrl === "string" && avatarUrl.trim()) {
      authUpdates.photoURL = avatarUrl.trim();
    }
    if (Object.keys(authUpdates).length > 0) {
      await updateProfile(firebaseAuth.currentUser, authUpdates);
      setUser({ ...firebaseAuth.currentUser });
    }

    return refreshUserProfile();
  };

  // Create new book listing
  const handleCreateNewListing = async (name, ISBNno, price, imageUrl, genre, previewPages) => {
    if (!user) {
      throw new Error("You must be logged in to create a listing.");
    }

    const safePreviewPages = Array.isArray(previewPages)
      ? previewPages.map((page) => String(page || "").trim()).filter(Boolean).slice(0, 50)
      : [];

    return await addDoc(collection(firestore, "books"), {
      name,
      ISBNno,
      price,
      imageUrl,
      genre,
      previewPages: safePreviewPages,
      previewPagesCount: safePreviewPages.length,
      userId: user.uid,
      userEmail: user.email,
      createdAt: new Date(),
    });
  };

  // Fetch all books
  const getAllBooks = async () => {
    return getDocs(collection(firestore, 'books'));
  };

  const getMyBooks = async () => {
    if (!user) return [];
    const q = query(collection(firestore, "books"), where("userId", "==", user.uid));
    const result = await getDocs(q);
    return result.docs.map((bookDoc) => ({ id: bookDoc.id, ...bookDoc.data() }));
  };

  // Fetch book by ID
  const getBookById = async (id) => {
    const docref = doc(firestore, 'books', id);
     return await getDoc(docref);
  };

  const updateBookListing = async (bookId, updates = {}) => {
    if (!user) {
      throw new Error("You must be logged in to update a listing.");
    }

    const bookRef = doc(firestore, "books", bookId);
    const snapshot = await getDoc(bookRef);
    if (!snapshot.exists()) {
      throw new Error("Book not found.");
    }

    const bookData = snapshot.data();
    if (bookData.userId !== user.uid) {
      throw new Error("You can only edit your own listings.");
    }

    const payload = {};
    if (typeof updates.name === "string") payload.name = updates.name.trim();
    if (typeof updates.ISBNno === "string") payload.ISBNno = updates.ISBNno.trim();
    if (typeof updates.price !== "undefined") payload.price = Number(updates.price);
    if (typeof updates.genre === "string") payload.genre = updates.genre;
    if (typeof updates.imageUrl === "string" && updates.imageUrl.trim()) {
      payload.imageUrl = updates.imageUrl.trim();
    }
    if (Array.isArray(updates.previewPages)) {
      const pages = updates.previewPages
        .map((page) => String(page || "").trim())
        .filter(Boolean)
        .slice(0, 50);
      payload.previewPages = pages;
      payload.previewPagesCount = pages.length;
    }

    if (Object.keys(payload).length === 0) return;
    await updateDoc(bookRef, payload);
  };

  const deleteBookListing = async (bookId) => {
    if (!user) {
      throw new Error("You must be logged in to delete a listing.");
    }

    const bookRef = doc(firestore, "books", bookId);
    const snapshot = await getDoc(bookRef);
    if (!snapshot.exists()) {
      throw new Error("Book not found.");
    }
    if (snapshot.data().userId !== user.uid) {
      throw new Error("You can only delete your own listings.");
    }

    await deleteDoc(bookRef);
  };

  const markBookAsRead = async (bookId) => {
    if (!user || !bookId) return;
    const profileRef = doc(firestore, "users", user.uid);
    await setDoc(
      profileRef,
      {
        email: user.email || "",
        name: user.displayName || user.email?.split("@")[0] || "Reader",
        avatarUrl: user.photoURL || "",
        readBookIds: arrayUnion(bookId),
      },
      { merge: true },
    );
    await refreshUserProfile();
  };

  // place order method can be added here in the future
  const placeOrder = async (id,qty) => {
    if (!user) {
      throw new Error("You must be logged in to place an order.");
    }

    const collectionRef  =  collection(firestore,'books',id,'orders');// reference to the 'orders' subcollection of the specific book document
    const result = await addDoc(collectionRef,{// adding a new document to the 'orders' subcollection with the following data
      username: user.email,
      userId: user.uid,
      userEmail: user.email,
      createdAt: new Date(),
      qty
    });

    return result;
  };

  // Fetch orders for a specific book
  const fetchMyOrders = async () => {
    if (!user) return [];

    const q = query(collectionGroup(firestore, "orders"), where("userId", "==", user.uid));
    const result = await getDocs(q);

    return result.docs.map((orderDoc) => ({
      id: orderDoc.id,
      bookId: orderDoc.ref.parent.parent?.id || null,
      ...orderDoc.data(),
    }));
  };
  

  

  // Determine if user is logged in
  const isLoggedIn = user ? true : false;

  return (
    <FirebaseContext.Provider
      value={{
        signupUserWithEmailAndPassword,
        loginUserWithEmailAndPassword,
        signInWithGoogle,
        isLoggedIn,
        authLoading,
        handleCreateNewListing,
        getAllBooks,
        getMyBooks,
        user,
        userProfile,
        signOutUser,
        getBookById,
        updateBookListing,
        deleteBookListing,
        markBookAsRead,
        refreshUserProfile,
        updateCurrentUserProfile,
        placeOrder,
        fetchMyOrders
      }}
    >
      {props.children}
    </FirebaseContext.Provider>
  );
};

