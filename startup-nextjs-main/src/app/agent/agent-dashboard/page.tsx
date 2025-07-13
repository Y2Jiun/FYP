"use client";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase"; // Your firebase config
import { doc, getDoc } from "firebase/firestore";
import SignOutButton from "@/components/signout/SignOutButton";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function UserDashboardPage() {
  const [userData, setUserData] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      // Get the userId from localStorage (set after login)
      const userId = localStorage.getItem("userId");
      if (!userId) {
        setUserData(null);
        return;
      }
      const docRef = doc(db, "users", userId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setUserData(docSnap.data());
      } else {
        setUserData(null);
      }
    };
    fetchUser();
  }, []);

  return (
    <div>
      <h1>Agent Dashboard</h1>
      {userData && (
        <div>
          <p>User ID: {userData.userID}</p>
          <p>Username: {userData.username}</p>
          {/* ...other fields */}
        </div>
      )}
      <Link href="/admin/adminprofile">
        <button className="mt-4 rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600">
          Go to User Profile
        </button>
      </Link>
      {/* Place the sign out button here */}
      <SignOutButton />
    </div>
  );
}
