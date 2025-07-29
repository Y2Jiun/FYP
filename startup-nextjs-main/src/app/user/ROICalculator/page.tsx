"use client";
import React, { useState } from "react";
import UserHeader from "@/components/User/userHeader";

export default function ROICalculatorPage() {
  const [formData, setFormData] = useState({
    purchasePrice: "",
    downPayment: "",
    loanAmount: "",
    interestRate: "",
    loanTerm: "",
    monthlyRent: "",
    propertyTax: "",
    insurance: "",
    maintenance: "",
    propertyManagement: "",
    utilities: "",
    otherExpenses: "",
  });

  const [results, setResults] = useState({
    monthlyMortgage: 0,
    totalMonthlyExpenses: 0,
    monthlyCashFlow: 0,
    annualCashFlow: 0,
    totalInvestment: 0,
    annualROI: 0,
    cashOnCashReturn: 0,
  });

  const [showResults, setShowResults] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const calculateROI = () => {
    const purchasePrice = parseFloat(formData.purchasePrice) || 0;
    const downPayment = parseFloat(formData.downPayment) || 0;
    const loanAmount = parseFloat(formData.loanAmount) || 0;
    const interestRate = parseFloat(formData.interestRate) || 0;
    const loanTerm = parseFloat(formData.loanTerm) || 30;
    const monthlyRent = parseFloat(formData.monthlyRent) || 0;
    const propertyTax = parseFloat(formData.propertyTax) || 0;
    const insurance = parseFloat(formData.insurance) || 0;
    const maintenance = parseFloat(formData.maintenance) || 0;
    const propertyManagement = parseFloat(formData.propertyManagement) || 0;
    const utilities = parseFloat(formData.utilities) || 0;
    const otherExpenses = parseFloat(formData.otherExpenses) || 0;

    // Calculate monthly mortgage payment
    const monthlyInterestRate = interestRate / 100 / 12;
    const numberOfPayments = loanTerm * 12;
    const monthlyMortgage =
      loanAmount > 0 && interestRate > 0
        ? (loanAmount *
            monthlyInterestRate *
            Math.pow(1 + monthlyInterestRate, numberOfPayments)) /
          (Math.pow(1 + monthlyInterestRate, numberOfPayments) - 1)
        : 0;

    // Calculate total monthly expenses
    const totalMonthlyExpenses =
      monthlyMortgage +
      propertyTax +
      insurance +
      maintenance +
      propertyManagement +
      utilities +
      otherExpenses;

    // Calculate cash flow
    const monthlyCashFlow = monthlyRent - totalMonthlyExpenses;
    const annualCashFlow = monthlyCashFlow * 12;

    // Calculate total investment (down payment + closing costs estimate)
    const totalInvestment = downPayment + purchasePrice * 0.03; // Assuming 3% closing costs

    // Calculate ROI
    const annualROI =
      totalInvestment > 0 ? (annualCashFlow / totalInvestment) * 100 : 0;
    const cashOnCashReturn =
      totalInvestment > 0 ? (annualCashFlow / totalInvestment) * 100 : 0;

    setResults({
      monthlyMortgage,
      totalMonthlyExpenses,
      monthlyCashFlow,
      annualCashFlow,
      totalInvestment,
      annualROI,
      cashOnCashReturn,
    });

    setShowResults(true);
  };

  const resetCalculator = () => {
    setFormData({
      purchasePrice: "",
      downPayment: "",
      loanAmount: "",
      interestRate: "",
      loanTerm: "",
      monthlyRent: "",
      propertyTax: "",
      insurance: "",
      maintenance: "",
      propertyManagement: "",
      utilities: "",
      otherExpenses: "",
    });
    setShowResults(false);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#1a1e26]">
      <UserHeader />

      <main className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-4xl">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="mb-4 text-4xl font-bold text-gray-900 dark:text-white">
              ROI Calculator
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Calculate your Return on Investment for real estate properties
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            {/* Input Form */}
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-[#23272f]">
              <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">
                Property Details
              </h2>

              <div className="space-y-4">
                {/* Purchase Information */}
                <div>
                  <h3 className="mb-3 text-lg font-semibold text-gray-800 dark:text-gray-200">
                    Purchase Information
                  </h3>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Purchase Price (RM)
                      </label>
                      <input
                        type="number"
                        name="purchasePrice"
                        value={formData.purchasePrice}
                        onChange={handleInputChange}
                        className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-[#2C303B] dark:text-white"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Down Payment (RM)
                      </label>
                      <input
                        type="number"
                        name="downPayment"
                        value={formData.downPayment}
                        onChange={handleInputChange}
                        className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-[#2C303B] dark:text-white"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Loan Amount (RM)
                      </label>
                      <input
                        type="number"
                        name="loanAmount"
                        value={formData.loanAmount}
                        onChange={handleInputChange}
                        className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-[#2C303B] dark:text-white"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Interest Rate (%)
                      </label>
                      <input
                        type="number"
                        name="interestRate"
                        value={formData.interestRate}
                        onChange={handleInputChange}
                        step="0.01"
                        className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-[#2C303B] dark:text-white"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Loan Term (Years)
                      </label>
                      <input
                        type="number"
                        name="loanTerm"
                        value={formData.loanTerm}
                        onChange={handleInputChange}
                        className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-[#2C303B] dark:text-white"
                        placeholder="30"
                      />
                    </div>
                  </div>
                </div>

                {/* Income */}
                <div>
                  <h3 className="mb-3 text-lg font-semibold text-gray-800 dark:text-gray-200">
                    Monthly Income
                  </h3>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Monthly Rent (RM)
                    </label>
                    <input
                      type="number"
                      name="monthlyRent"
                      value={formData.monthlyRent}
                      onChange={handleInputChange}
                      className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-[#2C303B] dark:text-white"
                      placeholder="0"
                    />
                  </div>
                </div>

                {/* Expenses */}
                <div>
                  <h3 className="mb-3 text-lg font-semibold text-gray-800 dark:text-gray-200">
                    Monthly Expenses
                  </h3>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Property Tax (RM)
                      </label>
                      <input
                        type="number"
                        name="propertyTax"
                        value={formData.propertyTax}
                        onChange={handleInputChange}
                        className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-[#2C303B] dark:text-white"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Insurance (RM)
                      </label>
                      <input
                        type="number"
                        name="insurance"
                        value={formData.insurance}
                        onChange={handleInputChange}
                        className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-[#2C303B] dark:text-white"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Maintenance (RM)
                      </label>
                      <input
                        type="number"
                        name="maintenance"
                        value={formData.maintenance}
                        onChange={handleInputChange}
                        className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-[#2C303B] dark:text-white"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Property Management (RM)
                      </label>
                      <input
                        type="number"
                        name="propertyManagement"
                        value={formData.propertyManagement}
                        onChange={handleInputChange}
                        className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-[#2C303B] dark:text-white"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Utilities (RM)
                      </label>
                      <input
                        type="number"
                        name="utilities"
                        value={formData.utilities}
                        onChange={handleInputChange}
                        className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-[#2C303B] dark:text-white"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Other Expenses (RM)
                      </label>
                      <input
                        type="number"
                        name="otherExpenses"
                        value={formData.otherExpenses}
                        onChange={handleInputChange}
                        className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-[#2C303B] dark:text-white"
                        placeholder="0"
                      />
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 pt-4">
                  <button
                    onClick={calculateROI}
                    className="flex-1 rounded-md bg-blue-600 px-6 py-3 font-semibold text-white transition-colors duration-200 hover:bg-blue-700"
                  >
                    Calculate ROI
                  </button>
                  <button
                    onClick={resetCalculator}
                    className="flex-1 rounded-md bg-gray-500 px-6 py-3 font-semibold text-white transition-colors duration-200 hover:bg-gray-600"
                  >
                    Reset
                  </button>
                </div>
              </div>
            </div>

            {/* Results */}
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-[#23272f]">
              <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">
                ROI Results
              </h2>

              {showResults ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
                      <h3 className="mb-2 text-lg font-semibold text-blue-800 dark:text-blue-200">
                        Cash Flow Analysis
                      </h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-700 dark:text-gray-300">
                            Monthly Mortgage:
                          </span>
                          <span className="font-semibold text-gray-900 dark:text-white">
                            RM {results.monthlyMortgage.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-700 dark:text-gray-300">
                            Total Monthly Expenses:
                          </span>
                          <span className="font-semibold text-gray-900 dark:text-white">
                            RM {results.totalMonthlyExpenses.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-700 dark:text-gray-300">
                            Monthly Cash Flow:
                          </span>
                          <span
                            className={`font-semibold ${results.monthlyCashFlow >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
                          >
                            RM {results.monthlyCashFlow.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-700 dark:text-gray-300">
                            Annual Cash Flow:
                          </span>
                          <span
                            className={`font-semibold ${results.annualCashFlow >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
                          >
                            RM {results.annualCashFlow.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20">
                      <h3 className="mb-2 text-lg font-semibold text-green-800 dark:text-green-200">
                        Return on Investment
                      </h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-700 dark:text-gray-300">
                            Total Investment:
                          </span>
                          <span className="font-semibold text-gray-900 dark:text-white">
                            RM {results.totalInvestment.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-700 dark:text-gray-300">
                            Annual ROI:
                          </span>
                          <span
                            className={`font-semibold ${results.annualROI >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
                          >
                            {results.annualROI.toFixed(2)}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-700 dark:text-gray-300">
                            Cash on Cash Return:
                          </span>
                          <span
                            className={`font-semibold ${results.cashOnCashReturn >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
                          >
                            {results.cashOnCashReturn.toFixed(2)}%
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* ROI Interpretation */}
                    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
                      <h3 className="mb-2 text-lg font-semibold text-gray-800 dark:text-gray-200">
                        Analysis
                      </h3>
                      <div className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                        {results.cashOnCashReturn > 8 ? (
                          <p className="text-green-600 dark:text-green-400">
                            ✅ Excellent ROI - This is a strong investment
                            opportunity!
                          </p>
                        ) : results.cashOnCashReturn > 5 ? (
                          <p className="text-blue-600 dark:text-blue-400">
                            ✅ Good ROI - This investment shows positive
                            returns.
                          </p>
                        ) : results.cashOnCashReturn > 0 ? (
                          <p className="text-yellow-600 dark:text-yellow-400">
                            ⚠️ Low ROI - Consider negotiating better terms.
                          </p>
                        ) : (
                          <p className="text-red-600 dark:text-red-400">
                            ❌ Negative ROI - This investment may not be
                            profitable.
                          </p>
                        )}
                        {results.monthlyCashFlow < 0 && (
                          <p className="text-red-600 dark:text-red-400">
                            ⚠️ Negative cash flow - You'll need additional
                            income to cover expenses.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-12 text-center">
                  <div className="mb-4 text-6xl text-gray-400 dark:text-gray-500">
                    📊
                  </div>
                  <p className="text-gray-500 dark:text-gray-400">
                    Enter your property details and click "Calculate ROI" to see
                    your investment analysis.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
