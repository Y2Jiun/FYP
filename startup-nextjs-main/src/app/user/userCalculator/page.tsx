"use client";
import { useState } from "react";
import UserHeader from "@/components/User/userHeader";

// Simple SVG icons for input labels
const icons = {
  price: (
    <svg
      className="text-primary mr-2 inline h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 8c-1.657 0-3 1.343-3 3s1.343 3 3 3 3-1.343 3-3-1.343-3-3-3zm0 0V4m0 8v8m8-8a8 8 0 11-16 0 8 8 0 0116 0z"
      />
    </svg>
  ),
  down: (
    <svg
      className="text-primary mr-2 inline h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
    </svg>
  ),
  interest: (
    <svg
      className="text-primary mr-2 inline h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M13 16h-1v-4h-1m4 0h-1v4h-1m-4 0h-1v-4h-1"
      />
    </svg>
  ),
  tenure: (
    <svg
      className="text-primary mr-2 inline h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8 7V3m8 4V3m-9 8h10m-9 4h10m-9 4h6"
      />
    </svg>
  ),
};

export default function UserLoanCalculator() {
  const [price, setPrice] = useState("");
  const [downPayment, setDownPayment] = useState("");
  const [interest, setInterest] = useState("");
  const [tenure, setTenure] = useState("");
  const [tenureType, setTenureType] = useState("years");
  const [result, setResult] = useState<any>(null);
  const [tenureError, setTenureError] = useState("");
  const [priceError, setPriceError] = useState("");

  function getTenureLimits(type: string) {
    if (type === "years") return { min: 20, max: 35 };
    return { min: 240, max: 420 };
  }

  function calculateLoan(e: React.FormEvent) {
    e.preventDefault();
    // Validate property price
    if (Number(price) < 100000 || Number(price) > 6000000) {
      setPriceError(
        "Property price must be between RM 100,000 and RM 6,000,000.",
      );
      setResult(null);
      return;
    } else {
      setPriceError("");
    }
    const { min, max } = getTenureLimits(tenureType);
    if (Number(tenure) < min || Number(tenure) > max) {
      setTenureError(
        tenureType === "years"
          ? "Years must be between 20 and 35."
          : "Months must be between 240 and 420.",
      );
      setResult(null);
      return;
    } else {
      setTenureError("");
    }
    const principal = Number(price) - Number(downPayment);
    const n = tenureType === "years" ? Number(tenure) * 12 : Number(tenure);
    const r = Number(interest) / 12 / 100;
    if (principal <= 0 || n <= 0 || r < 0) {
      setResult(null);
      return;
    }
    // Monthly payment formula
    const monthly =
      r === 0
        ? principal / n
        : (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const totalPayment = monthly * n;
    const totalInterest = totalPayment - principal;
    setResult({
      monthly: monthly,
      totalPayment: totalPayment,
      totalInterest: totalInterest,
      principal,
      n,
    });
  }

  return (
    <>
      <UserHeader />
      <div className="flex min-h-screen w-full flex-col items-center justify-center bg-white p-4 dark:bg-[#181c23]">
        <div className="w-full max-w-lg rounded-2xl border border-blue-100 bg-white p-8 shadow-xl transition-all duration-300 dark:border-gray-700 dark:bg-gray-800">
          <h1 className="mb-8 text-center text-4xl font-extrabold tracking-wide text-blue-700 drop-shadow-lg dark:text-primary">
            Loan Calculator
          </h1>
          <form onSubmit={calculateLoan} className="space-y-6">
            <div>
              <label className="mb-1 block text-lg font-semibold text-gray-800 dark:text-gray-200">
                {icons.price}Property Price (RM)
              </label>
              <input
                type="number"
                className="w-full rounded-lg border border-blue-200 bg-white px-4 py-3 text-lg transition placeholder:text-gray-400 focus:ring-2 focus:ring-blue-400 focus:outline-none dark:bg-gray-900 dark:placeholder:text-gray-500"
                placeholder="500000"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />
              {priceError && (
                <div className="mt-2 animate-pulse text-center text-sm text-red-500">
                  {priceError}
                </div>
              )}
            </div>
            <div>
              <label className="mb-1 block text-lg font-semibold text-gray-800 dark:text-gray-200">
                {icons.down}Down Payment (RM)
              </label>
              <input
                type="number"
                className="w-full rounded-lg border border-blue-200 bg-white px-4 py-3 text-lg transition placeholder:text-gray-400 focus:ring-2 focus:ring-blue-400 focus:outline-none dark:bg-gray-900 dark:placeholder:text-gray-500"
                placeholder="50000"
                value={downPayment}
                min={0}
                onChange={(e) => setDownPayment(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-lg font-semibold text-gray-800 dark:text-gray-200">
                {icons.interest}Interest Rate (% per annum)
              </label>
              <input
                type="number"
                className="w-full rounded-lg border border-blue-200 bg-white px-4 py-3 text-lg transition placeholder:text-gray-400 focus:ring-2 focus:ring-blue-400 focus:outline-none dark:bg-gray-900 dark:placeholder:text-gray-500"
                placeholder="4"
                value={interest}
                min={0}
                step={0.01}
                onChange={(e) => setInterest(e.target.value)}
                required
              />
            </div>
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <label className="mb-1 block text-lg font-semibold text-gray-800 dark:text-gray-200">
                  {icons.tenure}Loan Tenure
                </label>
                <input
                  type="number"
                  className="w-full rounded-lg border border-blue-200 bg-white px-4 py-3 text-lg transition placeholder:text-gray-400 focus:ring-2 focus:ring-blue-400 focus:outline-none dark:bg-gray-900 dark:placeholder:text-gray-500"
                  placeholder={tenureType === "years" ? "30" : "360"}
                  value={tenure}
                  onChange={(e) => setTenure(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="mb-1 block font-medium">&nbsp;</label>
                <select
                  className="rounded-lg border border-blue-200 bg-white px-3 py-3 text-lg transition focus:ring-2 focus:ring-blue-400 focus:outline-none dark:bg-gray-900"
                  value={tenureType}
                  onChange={(e) => setTenureType(e.target.value)}
                >
                  <option value="years">Years</option>
                  <option value="months">Months</option>
                </select>
              </div>
            </div>
            {tenureError && (
              <div className="mt-2 animate-pulse text-center text-sm text-red-500">
                {tenureError}
              </div>
            )}
            <button
              type="submit"
              className="mt-2 w-full rounded-xl bg-gradient-to-r from-blue-500 to-blue-700 py-3 text-lg font-bold tracking-wide text-white shadow-lg transition-all duration-200 hover:from-blue-700 hover:to-blue-500"
            >
              Calculate
            </button>
          </form>
          {result && (
            <div className="mt-10 rounded-2xl border-2 border-blue-200 bg-white p-8 shadow-xl transition-all duration-300 dark:border-primary/40 dark:bg-gray-900/70">
              <h2 className="mb-4 text-2xl font-extrabold tracking-wide text-blue-700 drop-shadow dark:text-primary">
                Results
              </h2>
              <div className="mb-3 text-lg">
                Monthly Installment: <span className="font-bold text-blue-700 dark:text-indigo-300">RM {result.monthly.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
              </div>
              <div className="mb-3 text-lg">
                Total Payment: <span className="font-bold text-blue-700 dark:text-indigo-300">RM {result.totalPayment.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
              </div>
              <div className="mb-3 text-lg">
                Total Interest: <span className="font-bold text-blue-700 dark:text-indigo-300">RM {result.totalInterest.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
              </div>
              <div className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                Loan Amount: <span className="font-semibold">RM {result.principal.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span> • Tenure: <span className="font-semibold">{result.n} months</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
