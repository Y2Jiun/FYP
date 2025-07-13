"use client";
import React, { useEffect, useState, useRef } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
} from "firebase/firestore";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";
import { auth } from "@/lib/firebase"; // your firebase auth instance

async function checkCurrentPassword(email, currentPassword) {
  const user = auth.currentUser;
  const credential = EmailAuthProvider.credential(email, currentPassword);
  try {
    await reauthenticateWithCredential(user, credential);
    return true; // Password is correct
  } catch (error) {
    return false; // Password is incorrect
  }
}

export default function AdminProfilePage() {
  const [userData, setUserData] = useState<any>(null);
  const [editMode, setEditMode] = useState(false);
  const [username, setUsername] = useState("");
  const [contact, setContact] = useState("");
  const [profilePic, setProfilePic] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [docId, setDocId] = useState<string | null>(null);
  const [errors, setErrors] = useState<any>({});
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordSectionError, setPasswordSectionError] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      const email = localStorage.getItem("userEmail"); // Make sure to store this after login!
      if (!email) return;
      const q = query(collection(db, "users"), where("email", "==", email));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const docSnap = querySnapshot.docs[0];
        const data = docSnap.data();
        setUserData(data);
        setDocId(docSnap.id); // Save the document ID for updates
        setUsername(data.username || "");
        setContact(data.contact || "");
        setProfilePic(data.profilePic || "");
      }
    };
    fetchUser();
  }, []);

  const handleProfilePicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (ev) => setProfilePic(ev.target?.result as string);
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  // Password validation regex
  const passwordRegex =
    /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{6,}$/;

  const validate = () => {
    const newErrors: any = {};
    // Username: required, at least 5 chars
    if (!username || username.trim().length < 5) {
      newErrors.username = "Username must be at least 5 characters.";
    }
    // Contact: must start with '+', only numbers after '+', length 9-12, no alphabets
    if (!contact.startsWith("+")) {
      newErrors.contact = "Contact must start with '+' symbol.";
    } else {
      const digits = contact.slice(1);
      if (!/^\d+$/.test(digits)) {
        newErrors.contact = "Contact must contain only numbers after '+'.";
      } else if (digits.length < 9 || digits.length > 12) {
        newErrors.contact = "Contact number must be between 9 and 12 digits.";
      }
    }
    // Password fields: at least 6 chars, must include number, letter, symbol
    if (editMode) {
      let passwordError = "";
      if (!currentPassword) {
        passwordError = "Current password is required.";
      } else if (!passwordRegex.test(currentPassword)) {
        passwordError =
          "Current password must be at least 6 characters and include a number, a letter, and a symbol.";
      }
      if (!newPassword) {
        passwordError = "New password is required.";
      } else if (!passwordRegex.test(newPassword)) {
        passwordError =
          "New password must be at least 6 characters and include a number, a letter, and a symbol.";
      }
      if (!confirmPassword) {
        passwordError = "Confirm password is required.";
      } else if (!passwordRegex.test(confirmPassword)) {
        passwordError =
          "Confirm password must be at least 6 characters and include a number, a letter, and a symbol.";
      }
      // New password and confirm new password must match
      if (newPassword && confirmPassword && newPassword !== confirmPassword) {
        passwordError = "Confirm password must match new password.";
      }
      if (passwordError) {
        setPasswordSectionError(passwordError);
      } else {
        setPasswordSectionError("");
      }
    } else {
      setPasswordSectionError("");
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0 && !passwordSectionError;
  };

  const handleSave = async () => {
    setMessage("");
    if (!userData || !docId) return;
    // Run synchronous validation first (except current password check)
    if (!validate()) return;

    // Check current password asynchronously
    if (editMode) {
      const email = userData.email;
      const isCurrentPasswordCorrect = await checkCurrentPassword(
        email,
        currentPassword,
      );
      if (!isCurrentPasswordCorrect) {
        setPasswordSectionError("Current password is incorrect.");
        return;
      } else {
        setPasswordSectionError("");
      }
    }

    try {
      await updateDoc(doc(db, "users", docId), {
        username,
        contact,
        profilePic,
      });
      setMessage("Profile updated!");
      setEditMode(false);
    } catch (err) {
      setMessage("Failed to update profile.");
    }
  };

  if (!userData) {
    return <div className="mt-10 text-center">Loading profile...</div>;
  }

  return (
    <section className="flex min-h-screen items-start justify-center bg-[#1a1e26] pt-8">
      <div className="w-full p-0">
        <h2 className="from-primary mt-0 mb-4 bg-gradient-to-r to-blue-500 bg-clip-text text-center text-5xl font-extrabold text-transparent drop-shadow-lg">
          Admin Profile
        </h2>
        <div className="mb-6 flex flex-col items-center">
          <div className="relative mt-0">
            <img
              src={profilePic || "/default-profile.png"}
              alt="Profile"
              className="border-primary h-32 w-32 rounded-full border-4 object-cover"
            />
            <button
              className="bg-primary hover:bg-primary/80 absolute right-2 bottom-2 rounded-full p-2 text-white"
              onClick={() => fileInputRef.current?.click()}
              title="Edit profile picture"
            >
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                <path
                  d="M15.232 5.232a3 3 0 1 1 4.243 4.243l-9.193 9.193a4 4 0 0 1-1.414.943l-3.1 1.24a1 1 0 0 1-1.302-1.302l1.24-3.1a4 4 0 0 1 .943-1.414l9.193-9.193z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              className="hidden"
              onChange={handleProfilePicChange}
            />
          </div>
        </div>
        {/* Profile Fields Row */}
        <div className="mt-2 mb-14 flex flex-col gap-4 md:flex-row">
          <div className="flex-1">
            <label className="from-primary mb-2 block bg-gradient-to-r to-blue-400 bg-clip-text text-lg font-bold text-transparent drop-shadow-sm">
              Username
            </label>
            <input
              type="text"
              value={username}
              disabled={!editMode}
              onChange={(e) => setUsername(e.target.value)}
              className="focus:border-primary w-full rounded border px-3 py-4 text-base focus:outline-none dark:bg-[#2C303B] dark:text-white"
            />
            {errors.username && (
              <div className="mt-1 text-sm text-red-500">{errors.username}</div>
            )}
          </div>
          <div className="flex-1">
            <label className="from-primary mb-2 block bg-gradient-to-r to-blue-400 bg-clip-text text-lg font-bold text-transparent drop-shadow-sm">
              Email
            </label>
            <input
              type="email"
              value={userData.email}
              disabled
              className="w-full rounded border bg-gray-100 px-3 py-4 text-base dark:bg-[#2C303B] dark:text-white"
            />
          </div>
          <div className="flex-1">
            <label className="from-primary mb-2 block bg-gradient-to-r to-blue-400 bg-clip-text text-lg font-bold text-transparent drop-shadow-sm">
              Contact
            </label>
            <input
              type="text"
              value={contact}
              disabled={!editMode}
              onChange={(e) => setContact(e.target.value)}
              className="focus:border-primary w-full rounded border px-3 py-4 text-base focus:outline-none dark:bg-[#2C303B] dark:text-white"
            />
            {errors.contact && (
              <div className="mt-1 text-sm text-red-500">{errors.contact}</div>
            )}
          </div>
        </div>

        {/* Change Password Row */}
        <div className="mb-14">
          <label className="from-primary mb-2 block bg-gradient-to-r to-blue-400 bg-clip-text text-lg font-bold text-transparent drop-shadow-sm">
            Change Password
          </label>
          <div className="mt-2 flex flex-col gap-4 md:flex-row">
            <div className="relative flex-1">
              <input
                type={showCurrentPassword ? "text" : "password"}
                placeholder="Current Password"
                value={currentPassword}
                disabled={!editMode}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="focus:border-primary mb-2 w-full rounded border px-3 py-4 pr-10 text-base focus:outline-none dark:bg-[#2C303B] dark:text-white"
              />
              <button
                type="button"
                className="absolute top-1/2 right-3 -translate-y-1/2 text-xl text-gray-400"
                tabIndex={-1}
                onClick={() => setShowCurrentPassword((v) => !v)}
              >
                {showCurrentPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            <div className="relative flex-1">
              <input
                type={showNewPassword ? "text" : "password"}
                placeholder="New Password"
                value={newPassword}
                disabled={!editMode}
                onChange={(e) => setNewPassword(e.target.value)}
                className="focus:border-primary mb-2 w-full rounded border px-3 py-4 pr-10 text-base focus:outline-none dark:bg-[#2C303B] dark:text-white"
              />
              <button
                type="button"
                className="absolute top-1/2 right-3 -translate-y-1/2 text-xl text-gray-400"
                tabIndex={-1}
                onClick={() => setShowNewPassword((v) => !v)}
              >
                {showNewPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            <div className="relative flex-1">
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm New Password"
                value={confirmPassword}
                disabled={!editMode}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="focus:border-primary w-full rounded border px-3 py-4 pr-10 text-base focus:outline-none dark:bg-[#2C303B] dark:text-white"
              />
              <button
                type="button"
                className="absolute top-1/2 right-3 -translate-y-1/2 text-xl text-gray-400"
                tabIndex={-1}
                onClick={() => setShowConfirmPassword((v) => !v)}
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>
          {passwordSectionError && (
            <div className="mt-3 text-sm text-red-500">
              {passwordSectionError}
            </div>
          )}
        </div>
        {message && (
          <div className="mb-4 text-center text-green-600">{message}</div>
        )}
        <div className="mt-12 flex justify-center gap-40">
          <button
            onClick={() => setEditMode(!editMode)}
            className="bg-primary hover:bg-primary/80 rounded px-8 py-3 text-lg font-bold text-white"
          >
            {editMode ? "Cancel" : "Edit"}
          </button>
          <button
            onClick={handleSave}
            disabled={!editMode}
            className={`rounded px-8 py-3 text-lg font-bold ${editMode ? "bg-green-500 text-white hover:bg-green-600" : "cursor-not-allowed bg-gray-300 text-gray-500"}`}
          >
            Save
          </button>
        </div>
      </div>
    </section>
  );
}
