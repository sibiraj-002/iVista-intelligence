"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let unsubscribe = () => {};

    async function subscribeToAuth() {
      try {
        const { auth, db } = await import("@/firebase/config");

        unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
          setUser(currentUser);
          setUserProfile(null);

          if (currentUser) {
            const userRef = doc(db, "users", currentUser.uid);
            const userSnapshot = await getDoc(userRef);

            if (userSnapshot.exists()) {
              setUserProfile(userSnapshot.data());
            }
          }

          setIsLoading(false);
        });
      } catch {
        setUser(null);
        setUserProfile(null);
        setIsLoading(false);
      }
    }

    subscribeToAuth();

    return () => unsubscribe();
  }, []);

  const value = useMemo(
    () => ({
      user,
      userProfile,
      isAuthenticated: Boolean(user),
      isLoading,
      login: async (email, password) => {
        const { auth } = await import("@/firebase/config");

        return signInWithEmailAndPassword(auth, email, password);
      },
      register: async ({ name, email, password }) => {
        console.log("Starting registration...");
        const { auth, db } = await import("@/firebase/config");
        console.log("Creating Firebase user...");
        const credential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );

        await updateProfile(credential.user, {
          displayName: name,
        });

        const profile = {
          name,
          email,
          uid: credential.user.uid,
          createdAt: serverTimestamp(),
        };

        console.log("Saving user to Firestore...");
        await setDoc(doc(db, "users", credential.user.uid), profile);
        setUserProfile(profile);
        console.log("Registration successful");

        return credential;
      },
      resetPassword: async (email) => {
        const { auth } = await import("@/firebase/config");

        return sendPasswordResetEmail(auth, email);
      },
      logout: async () => {
        const { auth } = await import("@/firebase/config");

        setUserProfile(null);
        return signOut(auth);
      },
    }),
    [isLoading, user, userProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
