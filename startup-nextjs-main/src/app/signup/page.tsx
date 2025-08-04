"use client";
import Link from "next/link";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { auth } from "@/lib/firebase";
import {
  GoogleAuthProvider,
  signInWithPopup,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth";

export default function SignupPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<any>({});
  const [successMsg, setSuccessMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agree, setAgree] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  // Clear fields on component mount to prevent autofill
  React.useEffect(() => {
    setUsername("");
    setEmail("");
    setPassword("");
    setAgree(false);
  }, []);

  const passwordRegex =
    /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{6,}$/;

  // Enable checkbox only if all fields are filled
  const canCheck = username && email && password;

  // Real-time validation functions
  const validateUsername = (value: string) => {
    if (!value || value.trim().length < 5) {
      return "Username must be at least 5 characters.";
    }
    return "";
  };

  const validateEmail = (value: string) => {
    if (!value) {
      return "Email is required.";
    } else if (!value.includes("@") || !value.endsWith(".com")) {
      return "Email must contain '@' and end with '.com'.";
    }
    return "";
  };

  const validatePassword = (value: string) => {
    if (!value) {
      return "Password is required.";
    } else if (value.length <= 5) {
      return "Password must be more than 5 characters.";
    } else if (!/(?=.*[A-Za-z])/.test(value)) {
      return "Password must include at least one alphabet character.";
    } else if (!/(?=.*\d)/.test(value)) {
      return "Password must include at least one numeric character.";
    } else if (!/(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/.test(value)) {
      return "Password must include at least one symbol.";
    }
    return "";
  };

  // Handle input changes with real-time validation
  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUsername(value);
    setErrors((prev) => ({
      ...prev,
      username: validateUsername(value),
    }));
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    setErrors((prev) => ({
      ...prev,
      email: validateEmail(value),
    }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    setErrors((prev) => ({
      ...prev,
      password: validatePassword(value),
    }));
  };

  const handleAgreeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setAgree(checked);
    setErrors((prev) => ({
      ...prev,
      agree: checked ? "" : "You must agree to the Terms and Conditions.",
    }));
  };

  const getValidationErrors = () => {
    const newErrors: any = {};

    // Username: must be at least 5 characters
    if (!username || username.trim().length < 5) {
      newErrors.username = "Username must be at least 5 characters.";
    }

    // Email: must contain '@' and '.com'
    if (!email) {
      newErrors.email = "Email is required.";
    } else if (!email.includes("@") || !email.endsWith(".com")) {
      newErrors.email = "Email must contain '@' and end with '.com'.";
    }

    // Password: must include numeric, alphabet, symbol and be more than 5 characters
    if (!password) {
      newErrors.password = "Password is required.";
    } else if (password.length <= 5) {
      newErrors.password = "Password must be more than 5 characters.";
    } else if (!/(?=.*[A-Za-z])/.test(password)) {
      newErrors.password =
        "Password must include at least one alphabet character.";
    } else if (!/(?=.*\d)/.test(password)) {
      newErrors.password =
        "Password must include at least one numeric character.";
    } else if (!/(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/.test(password)) {
      newErrors.password = "Password must include at least one symbol.";
    }

    // Terms checkbox must be ticked
    if (!agree) {
      newErrors.agree = "You must agree to the Terms and Conditions.";
    }

    return newErrors;
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    // Get validation errors using the centralized function
    const newErrors = getValidationErrors();
    setErrors(newErrors);

    console.log("Current form values:", { username, email, password, agree });
    console.log("Validation errors:", newErrors);
    console.log("Is valid:", Object.keys(newErrors).length === 0);

    // If validation fails, show errors and return
    if (Object.keys(newErrors).length > 0) {
      console.log("Validation failed - showing errors");
      return;
    }

    setSuccessMsg("");
    setError("");
    try {
      const res = await axios.post("http://localhost:4000/signup", {
        email,
        password,
        username,
      });
      setSuccessMsg("Signup successful! Redirecting to sign in...");
      setTimeout(() => router.push("/signin"), 1500);
    } catch (error: any) {
      setSuccessMsg(
        error.response?.data?.error ||
          error.message ||
          "Signup failed. Please try again.",
      );
    }
  };

  // --- Google Sign Up Logic ---
  const handleGoogleSignUp = async () => {
    setError("");
    try {
      await setPersistence(auth, browserLocalPersistence);
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      const user = auth.currentUser;
      // Call your backend to get role and redirect
      const res = await axios.post("http://localhost:4000/login", {
        email: user?.email,
      });
      const { userId, role } = res.data;
      localStorage.setItem("userID", userId);
      localStorage.setItem("userEmail", user?.email || "");
      if (role === 1) {
        router.push("/admin/admin-dashboard");
      } else if (role === 2) {
        router.push("/agent/agentprofile");
      } else {
        router.push("/user/userprofile");
      }
    } catch (err: any) {
      setError(err.message || "Google sign up failed");
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
                  Create your account
                </h3>
                <p className="text-body-color mb-11 text-center text-base font-medium">
                  It’s totally free and super easy
                </p>
                {successMsg && (
                  <div className="mb-4 text-center text-green-500">
                    {successMsg}
                  </div>
                )}
                {/* Google Sign Up Button */}
                <button
                  type="button"
                  onClick={handleGoogleSignUp}
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
                  <span className="tracking-wide">Sign up with Google</span>
                </button>
                <div className="mb-8 flex items-center justify-center">
                  <span className="bg-body-color/50 hidden h-[1px] w-full max-w-[60px] sm:block"></span>
                  <p className="text-body-color w-full px-5 text-center text-base font-medium">
                    Or, register with your email
                  </p>
                  <span className="bg-body-color/50 hidden h-[1px] w-full max-w-[60px] sm:block"></span>
                </div>
                <form onSubmit={handleSignup} autoComplete="off">
                  {/* Hidden dummy fields to trick browser autofill */}
                  <input type="text" style={{ display: 'none' }} />
                  <input type="password" style={{ display: 'none' }} />
                  <div className="mb-8">
                    <label
                      htmlFor="username"
                      className="text-dark mb-3 block text-sm dark:text-white"
                    >
                      Username
                    </label>
                    <input
                      type="text"
                      name="username"
                      placeholder="Enter your username"
                      value={username}
                      onChange={handleUsernameChange}
                      required
                      autoComplete="off"
                      className={`border-stroke dark:text-body-color-dark dark:shadow-two text-body-color focus:border-primary dark:focus:border-primary w-full rounded-xs border bg-[#f8f8f8] px-6 py-3 text-base outline-hidden transition-all duration-300 dark:border-transparent dark:bg-[#2C303B] dark:focus:shadow-none ${errors.username ? "border-red-500" : ""}`}
                    />
                    {errors.username && (
                      <div className="mt-1 text-sm text-red-500">
                        {errors.username}
                      </div>
                    )}
                  </div>
                  <div className="mb-8">
                    <label
                      htmlFor="email"
                      className="text-dark mb-3 block text-sm dark:text-white"
                    >
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      placeholder="Enter your Email"
                      value={email}
                      onChange={handleEmailChange}
                      required
                      autoComplete="off"
                      className={`border-stroke dark:text-body-color-dark dark:shadow-two text-body-color focus:border-primary dark:focus:border-primary w-full rounded-xs border bg-[#f8f8f8] px-6 py-3 text-base outline-hidden transition-all duration-300 dark:border-transparent dark:bg-[#2C303B] dark:focus:shadow-none ${errors.email ? "border-red-500" : ""}`}
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
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        placeholder="Enter your Password"
                        value={password}
                        onChange={handlePasswordChange}
                        required
                        autoComplete="new-password"
                        className={`border-stroke dark:text-body-color-dark dark:shadow-two text-body-color focus:border-primary dark:focus:border-primary w-full rounded-xs border bg-[#f8f8f8] px-6 py-3 pr-10 text-base outline-hidden transition-all duration-300 dark:border-transparent dark:bg-[#2C303B] dark:focus:shadow-none ${errors.password ? "border-red-500" : ""}`}
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
                  {/* Terms Checkbox */}
                  <div className="mb-8 flex">
                    <label
                      htmlFor="checkboxLabel"
                      className="text-body-color flex cursor-pointer text-sm font-medium select-none"
                    >
                      <div className="relative">
                        <input
                          type="checkbox"
                          id="checkboxLabel"
                          checked={agree}
                          onChange={handleAgreeChange}
                          className="sr-only"
                        />
                        <div
                          className={`box border-body-color/20 mt-1 mr-4 flex h-5 w-5 items-center justify-center rounded-sm border dark:border-white/10 ${errors.agree ? "border-red-500" : ""}`}
                        >
                          {agree && (
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
                          )}
                        </div>
                      </div>
                      <span>
                        By creating account means you agree to the
                        <Link
                          href="/terms"
                          className="text-primary hover:underline"
                        >
                          {" "}
                          Terms and Conditions{" "}
                        </Link>
                        , and our
                        <Link
                          href="/privacy"
                          className="text-primary hover:underline"
                        >
                          {" "}
                          Privacy Policy{" "}
                        </Link>
                      </span>
                    </label>
                  </div>
                  {errors.agree && (
                    <div className="mb-4 text-sm text-red-500">
                      {errors.agree}
                    </div>
                  )}
                  {/* Show all error messages here */}
                  {error && (
                    <div className="mb-2 text-center text-red-500">{error}</div>
                  )}

                  <div className="mb-6">
                    <button
                      type="submit"
                      className="shadow-submit dark:shadow-submit-dark bg-primary hover:bg-primary/90 flex w-full items-center justify-center rounded-xs px-9 py-4 text-base font-medium text-white duration-300"
                      disabled={!canCheck || !agree}
                    >
                      Sign up
                    </button>
                  </div>
                </form>
                <p className="text-body-color text-center text-base font-medium">
                  Already using Startup?{" "}
                  <Link href="/signin" className="text-primary hover:underline">
                    Sign in
                  </Link>
                </p>
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
