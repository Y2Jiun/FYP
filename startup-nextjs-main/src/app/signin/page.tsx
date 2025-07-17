"use client";

import Link from "next/link";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import {
  GoogleAuthProvider,
  signInWithPopup,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
} from "firebase/auth";
import { auth } from "@/lib/firebase"; // Your firebase config
import axios from "axios";

export default function SigninPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<any>({});
  const [errorMsg, setErrorMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false); // <-- add state
  const router = useRouter();
  const [fetchedUserId, setFetchedUserId] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState(""); // Add if not present

  const passwordRegex =
    /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{6,}$/;

  const validate = () => {
    const newErrors: any = {};
    // Email: required, must contain '@' and end with '.com'
    if (!email) {
      newErrors.email = "Email is required.";
    } else if (!email.includes("@") || !email.endsWith(".com")) {
      newErrors.email = "Email must contain '@' and end with '.com'.";
    }
    // Password: required, at least 6 chars, must include number, letter, symbol
    if (!password) {
      newErrors.password = "Password is required.";
    } else if (!passwordRegex.test(password)) {
      newErrors.password =
        "Password must be at least 6 characters and include a number, a letter, and a symbol.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setErrorMsg("");

    try {
      // 🔐 Sign in with Firebase
      await signInWithEmailAndPassword(auth, email, password);
      const user = auth.currentUser;

      // Store email in localStorage for profile page
      localStorage.setItem("userEmail", user?.email);

      // 📡 Send email to backend to get user role
      const res = await axios.post("http://localhost:4000/login", {
        email: user?.email,
      });
      const { userId, role, username } = res.data;
      console.log("userId from backend:", userId); // Debug log
      localStorage.setItem("userID", userId); // <-- This is critical!
      console.log(
        "Fetched userId:",
        userId,
        "role:",
        role,
        "username:",
        username,
      );
      setFetchedUserId(userId); // Store in state
      // Now you have the custom userId (e.g., UID3) for this user

      // 🚀 Redirect based on role
      if (role === 1) {
        router.push("/admin/admin-dashboard");
      } else if (role === 2) {
        router.push("/agent/agentprofile");
      } else {
        router.push("/user/userprofile");
      }
    } catch (error: any) {
      console.error("Login failed:", error.message);
      setErrorMsg("Login failed. Check your email or password.");
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    try {
      await setPersistence(
        auth,
        rememberMe ? browserLocalPersistence : browserSessionPersistence,
      );
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      const user = auth.currentUser;

      // Store email in localStorage for profile page
      localStorage.setItem("userEmail", user?.email);

      // Send email to backend to get user role
      const res = await axios.post("http://localhost:4000/login", {
        email: user?.email,
      });
      const { userId, role, username } = res.data;
      localStorage.setItem("userID", userId);

      // Redirect based on role
      if (role === 1) {
        router.push("/admin/admin-dashboard");
      } else if (role === 2) {
        router.push("/agent/agentprofile");
      } else {
        router.push("/user/userprofile");
      }
    } catch (err: any) {
      setError(err.message || "Google sign-in failed");
    }
  };

  return (
    <>
      <section className="relative z-10 overflow-hidden pt-36 pb-16 md:pb-20 lg:pt-[180px] lg:pb-28">
        <div className="container">
          <div className="-mx-4 flex flex-wrap">
            <div className="w-full px-4">
              <div className="shadow-three dark:bg-dark mx-auto max-w-[500px] rounded-sm bg-white px-6 py-10 sm:p-[60px]">
                <h3 className="mb-3 text-center text-2xl font-bold text-black sm:text-3xl dark:text-white">
                  Sign in to your account
                </h3>
                <p className="text-body-color mb-11 text-center text-base font-medium">
                  Login to your account for a faster checkout.
                </p>
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  className="mb-6 flex w-full items-center justify-center gap-3 rounded-lg border border-blue-500 bg-gradient-to-r from-[#23272f] to-[#181c23] py-3 text-base font-semibold text-white shadow-lg transition-all duration-200 hover:scale-[1.03] hover:from-[#2d3340] hover:to-[#23272f] hover:shadow-xl focus:outline-none"
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <g>
                      <path
                        d="M19.6 10.23c0-.68-.06-1.36-.18-2H10v3.79h5.48a4.7 4.7 0 01-2.04 3.08v2.56h3.3c1.93-1.78 3.06-4.4 3.06-7.43z"
                        fill="#4285F4"
                      />
                      <path
                        d="M10 20c2.7 0 4.96-.9 6.61-2.44l-3.3-2.56c-.92.62-2.1.99-3.31.99-2.54 0-4.7-1.72-5.47-4.03H1.13v2.53A10 10 0 0010 20z"
                        fill="#34A853"
                      />
                      <path
                        d="M4.53 12.96A5.99 5.99 0 014.1 10c0-.51.09-1.01.15-1.49V5.98H1.13A10 10 0 000 10c0 1.64.4 3.19 1.13 4.53l3.4-1.57z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M10 4.01c1.47 0 2.78.51 3.81 1.51l2.85-2.85C14.96 1.09 12.7 0 10 0A10 10 0 001.13 5.98l3.4 2.53C5.3 6.73 7.46 4.01 10 4.01z"
                        fill="#EA4335"
                      />
                    </g>
                  </svg>
                  <span className="tracking-wide">Sign in with Google</span>
                </button>

                {error && <div className="mb-4 text-red-500">{error}</div>}

                <div className="mb-8 flex items-center justify-center">
                  <span className="bg-body-color/50 hidden h-[1px] w-full max-w-[70px] sm:block"></span>
                  <p className="text-body-color w-full px-5 text-center text-base font-medium">
                    Or, sign in with your email
                  </p>
                  <span className="bg-body-color/50 hidden h-[1px] w-full max-w-[70px] sm:block"></span>
                </div>
                <form onSubmit={handleSignin}>
                  <div className="mb-8">
                    <label
                      htmlFor="email"
                      className="text-dark mb-3 block text-sm dark:text-white"
                    >
                      Your Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      placeholder="Enter your Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="border-stroke dark:text-body-color-dark dark:shadow-two text-body-color focus:border-primary dark:focus:border-primary w-full rounded-xs border bg-[#f8f8f8] px-6 py-3 text-base outline-hidden transition-all duration-300 dark:border-transparent dark:bg-[#2C303B] dark:focus:shadow-none"
                    />
                    {errors.email && (
                      <div className="mt-1 text-sm text-red-500">
                        {errors.email}
                      </div>
                    )}
                  </div>
                  <div className="mb-8">
                    <label
                      htmlFor="password"
                      className="text-dark mb-3 block text-sm dark:text-white"
                    >
                      Your Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        placeholder="Enter your Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="border-stroke dark:text-body-color-dark dark:shadow-two text-body-color focus:border-primary dark:focus:border-primary w-full rounded-xs border bg-[#f8f8f8] px-6 py-3 pr-10 text-base outline-hidden transition-all duration-300 dark:border-transparent dark:bg-[#2C303B] dark:focus:shadow-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute top-1/2 right-3 -translate-y-1/2 transform text-gray-400 hover:text-gray-700 focus:outline-none"
                        tabIndex={-1}
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
                      >
                        {showPassword ? (
                          // Eye open SVG
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="h-5 w-5"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M2.25 12s3.75-7.5 9.75-7.5 9.75 7.5 9.75 7.5-3.75 7.5-9.75 7.5S2.25 12 2.25 12z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
                            />
                          </svg>
                        ) : (
                          // Eye closed SVG
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="h-5 w-5"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M3.98 8.223A10.477 10.477 0 002.25 12s3.75 7.5 9.75 7.5c2.042 0 3.82-.393 5.282-1.028M6.223 6.223A10.477 10.477 0 0112 4.5c6 0 9.75 7.5 9.75 7.5a17.299 17.299 0 01-2.478 3.223M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M3 3l18 18"
                            />
                          </svg>
                        )}
                      </button>
                    </div>
                    {errors.password && (
                      <div className="mt-1 text-sm text-red-500">
                        {errors.password}
                      </div>
                    )}
                  </div>
                  <div className="mb-8 flex flex-col justify-between sm:flex-row sm:items-center">
                    <div className="mb-4 sm:mb-0">
                      <label
                        htmlFor="checkboxLabel"
                        className="text-body-color flex cursor-pointer items-center text-sm font-medium select-none"
                      >
                        <div className="relative">
                          <input
                            type="checkbox"
                            id="checkboxLabel"
                            className="sr-only"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                          />
                          <div className="box border-body-color/20 mr-4 flex h-5 w-5 items-center justify-center rounded-sm border dark:border-white/10">
                            <span className="opacity-0">
                              <svg
                                width="11"
                                height="8"
                                viewBox="0 0 11 8"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M10.0915 0.951972L10.0867 0.946075L10.0813 0.940568C9.90076 0.753564 9.61034 0.753146 9.42927 0.939309L4.16201 6.22962L1.58507 3.63469C1.40401 3.44841 1.11351 3.44879 0.932892 3.63584C0.755703 3.81933 0.755703 4.10875 0.932892 4.29224L0.932878 4.29225L0.934851 4.29424L3.58046 6.95832C3.73676 7.11955 3.94983 7.2 4.1473 7.2C4.36196 7.2 4.55963 7.11773 4.71406 6.9584L10.0468 1.60234C10.2436 1.4199 10.2421 1.1339 10.0915 0.951972ZM4.2327 6.30081L4.2317 6.2998C4.23206 6.30015 4.23237 6.30049 4.23269 6.30082L4.2327 6.30081Z"
                                  fill="#3056D3"
                                  stroke="#3056D3"
                                  strokeWidth="0.4"
                                />
                              </svg>
                            </span>
                          </div>
                        </div>
                        Keep me signed in
                      </label>
                    </div>
                    <div>
                      <a
                        href="#0"
                        className="text-primary text-sm font-medium hover:underline"
                      >
                        Forgot Password?
                      </a>
                    </div>
                  </div>
                  <div className="mb-6">
                    <button
                      type="submit"
                      className="shadow-submit dark:shadow-submit-dark bg-primary hover:bg-primary/90 flex w-full items-center justify-center rounded-xs px-9 py-4 text-base font-medium text-white duration-300"
                    >
                      Sign in
                    </button>
                  </div>
                </form>
                <p className="text-body-color text-center text-base font-medium">
                  Don’t you have an account?{" "}
                  <Link href="/signup" className="text-primary hover:underline">
                    Sign up
                  </Link>
                </p>
                {fetchedUserId && (
                  <div className="mb-4 text-center text-green-500">
                    Your User ID: {fetchedUserId}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="absolute top-0 left-0 z-[-1]">
          <svg
            width="1440"
            height="969"
            viewBox="0 0 1440 969"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <mask
              id="mask0_95:1005"
              style={{ maskType: "alpha" }}
              maskUnits="userSpaceOnUse"
              x="0"
              y="0"
              width="1440"
              height="969"
            >
              <rect width="1440" height="969" fill="#090E34" />
            </mask>
            <g mask="url(#mask0_95:1005)">
              <path
                opacity="0.1"
                d="M1086.96 297.978L632.959 554.978L935.625 535.926L1086.96 297.978Z"
                fill="url(#paint0_linear_95:1005)"
              />
              <path
                opacity="0.1"
                d="M1324.5 755.5L1450 687V886.5L1324.5 967.5L-10 288L1324.5 755.5Z"
                fill="url(#paint1_linear_95:1005)"
              />
            </g>
            <defs>
              <linearGradient
                id="paint0_linear_95:1005"
                x1="1178.4"
                y1="151.853"
                x2="780.959"
                y2="453.581"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#4A6CF7" />
                <stop offset="1" stopColor="#4A6CF7" stopOpacity="0" />
              </linearGradient>
              <linearGradient
                id="paint1_linear_95:1005"
                x1="160.5"
                y1="220"
                x2="1099.45"
                y2="1192.04"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#4A6CF7" />
                <stop offset="1" stopColor="#4A6CF7" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </section>
    </>
  );
}
