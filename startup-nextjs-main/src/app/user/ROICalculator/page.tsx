"use client";
import React, { useState } from "react";
import UserHeader from "@/components/User/userHeader";
import {
  FiTrendingUp,
  FiTrendingDown,
  FiDollarSign,
  FiCalendar,
  FiShield,
  FiBarChart2,
  FiTarget,
  FiAlertTriangle,
} from "react-icons/fi";

export default function ROICalculatorPage() {
  const [formData, setFormData] = useState({
    // Basic Property Info
    purchasePrice: "",
    downPayment: "",
    loanAmount: "",
    interestRate: "",
    loanTerm: "",
    monthlyRent: "",

    // Enhanced Expenses
    propertyTax: "",
    insurance: "",
    maintenance: "",
    propertyManagement: "",
    utilities: "",
    otherExpenses: "",

    // New Advanced Fields
    propertyAppreciation: "3", // Annual appreciation rate
    vacancyRate: "5", // Vacancy rate percentage
    taxRate: "24", // Personal tax rate
    inflationRate: "2.5", // Inflation rate
    holdingPeriod: "10", // Years to hold property
    sellingCosts: "6", // Selling costs percentage
    refinancingRate: "3.5", // Refinancing interest rate
    refinancingCosts: "2", // Refinancing costs percentage
  });

  const [results, setResults] = useState({
    // Basic Results
    monthlyMortgage: 0,
    totalMonthlyExpenses: 0,
    monthlyCashFlow: 0,
    annualCashFlow: 0,
    totalInvestment: 0,
    annualROI: 0,
    cashOnCashReturn: 0,

    // Enhanced Results
    propertyValueAfterHolding: 0,
    totalReturn: 0,
    annualizedReturn: 0,
    taxBenefits: 0,
    netCashFlow: 0,
    breakEvenYears: 0,
    riskScore: 0,
    marketComparison: "",
    investmentGrade: "",
    recommendations: [] as string[],
  });

  const [showResults, setShowResults] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");
  const [scenarioResults, setScenarioResults] = useState({
    optimistic: null as any,
    realistic: null as any,
    pessimistic: null as any,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const calculateROI = () => {
    // Parse all values
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

    // New advanced values
    const propertyAppreciation = parseFloat(formData.propertyAppreciation) || 3;
    const vacancyRate = parseFloat(formData.vacancyRate) || 5;
    const taxRate = parseFloat(formData.taxRate) || 24;
    const inflationRate = parseFloat(formData.inflationRate) || 2.5;
    const holdingPeriod = parseFloat(formData.holdingPeriod) || 10;
    const sellingCosts = parseFloat(formData.sellingCosts) || 6;
    const refinancingRate = parseFloat(formData.refinancingRate) || 3.5;
    const refinancingCosts = parseFloat(formData.refinancingCosts) || 2;

    // Scenario configurations
    const scenarios = {
      optimistic: {
        appreciation: propertyAppreciation + 2,
        vacancy: Math.max(vacancyRate - 3, 1),
        rentGrowth: 3,
        name: "Optimistic",
        color: "green",
      },
      realistic: {
        appreciation: propertyAppreciation,
        vacancy: vacancyRate,
        rentGrowth: 2,
        name: "Realistic",
        color: "blue",
      },
      pessimistic: {
        appreciation: Math.max(propertyAppreciation - 2, 0),
        vacancy: Math.min(vacancyRate + 5, 15),
        rentGrowth: 1,
        name: "Pessimistic",
        color: "red",
      },
    };

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

    // Calculate effective monthly rent (accounting for vacancy)
    const effectiveMonthlyRent = monthlyRent * (1 - vacancyRate / 100);

    // Calculate cash flow
    const monthlyCashFlow = effectiveMonthlyRent - totalMonthlyExpenses;
    const annualCashFlow = monthlyCashFlow * 12;

    // Calculate total investment (down payment + closing costs estimate)
    const totalInvestment = downPayment + purchasePrice * 0.03; // Assuming 3% closing costs

    // Calculate basic ROI
    const annualROI =
      totalInvestment > 0 ? (annualCashFlow / totalInvestment) * 100 : 0;
    const cashOnCashReturn =
      totalInvestment > 0 ? (annualCashFlow / totalInvestment) * 100 : 0;

    // Calculate property appreciation
    const propertyValueAfterHolding =
      purchasePrice * Math.pow(1 + propertyAppreciation / 100, holdingPeriod);

    // Calculate selling costs
    const sellingCostsAmount = propertyValueAfterHolding * (sellingCosts / 100);

    // Calculate total return including appreciation
    const totalReturn =
      propertyValueAfterHolding -
      sellingCostsAmount -
      purchasePrice +
      annualCashFlow * holdingPeriod;
    const annualizedReturn =
      totalInvestment > 0
        ? (Math.pow(
            (totalInvestment + totalReturn) / totalInvestment,
            1 / holdingPeriod,
          ) -
            1) *
          100
        : 0;

    // Calculate tax benefits (simplified)
    const annualInterest = monthlyMortgage * 12 - loanAmount / loanTerm;
    const annualDepreciation = purchasePrice * 0.03; // 3% depreciation
    const taxBenefits = (annualInterest + annualDepreciation) * (taxRate / 100);

    // Calculate net cash flow after taxes
    const netCashFlow = annualCashFlow + taxBenefits;

    // Calculate break-even years
    const breakEvenYears =
      totalInvestment > 0 ? totalInvestment / netCashFlow : 0;

    // Calculate risk score (0-100, lower is better)
    let riskScore = 0;
    if (cashOnCashReturn < 0) riskScore += 30;
    if (cashOnCashReturn < 5) riskScore += 20;
    if (vacancyRate > 10) riskScore += 15;
    if (loanAmount / purchasePrice > 0.8) riskScore += 15;
    if (monthlyCashFlow < 0) riskScore += 20;
    riskScore = Math.min(riskScore, 100);

    // Market comparison
    let marketComparison = "";
    if (annualizedReturn > 12)
      marketComparison = "Excellent - Beats market average by 4-6%";
    else if (annualizedReturn > 8)
      marketComparison = "Good - Matches market average";
    else if (annualizedReturn > 5)
      marketComparison = "Fair - Below market average";
    else marketComparison = "Poor - Significantly below market average";

    // Investment grade
    let investmentGrade = "";
    if (annualizedReturn > 10 && riskScore < 30)
      investmentGrade = "A+ (Excellent)";
    else if (annualizedReturn > 8 && riskScore < 50)
      investmentGrade = "A (Good)";
    else if (annualizedReturn > 6 && riskScore < 70)
      investmentGrade = "B (Fair)";
    else if (annualizedReturn > 4) investmentGrade = "C (Poor)";
    else investmentGrade = "D (Avoid)";

    // Generate recommendations
    const recommendations = [];
    if (monthlyCashFlow < 0)
      recommendations.push(
        "Consider increasing rent or reducing expenses to achieve positive cash flow",
      );
    if (cashOnCashReturn < 5)
      recommendations.push(
        "ROI is below recommended 5% threshold - negotiate better terms",
      );
    if (vacancyRate > 8)
      recommendations.push(
        "High vacancy rate - research local market conditions",
      );
    if (loanAmount / purchasePrice > 0.8)
      recommendations.push("High loan-to-value ratio increases risk");
    if (breakEvenYears > 15)
      recommendations.push(
        "Long break-even period - consider shorter-term investment",
      );
    if (annualizedReturn < 6)
      recommendations.push(
        "Consider alternative investments with better returns",
      );
    if (recommendations.length === 0)
      recommendations.push("This appears to be a solid investment opportunity");

    // Calculate scenarios
    const scenarioResults = {};
    Object.keys(scenarios).forEach((scenarioKey) => {
      const scenario = scenarios[scenarioKey];

      // Calculate effective monthly rent with scenario vacancy
      const effectiveMonthlyRent = monthlyRent * (1 - scenario.vacancy / 100);

      // Calculate cash flow for this scenario
      const scenarioMonthlyCashFlow =
        effectiveMonthlyRent - totalMonthlyExpenses;
      const scenarioAnnualCashFlow = scenarioMonthlyCashFlow * 12;

      // Calculate property value with scenario appreciation
      const scenarioPropertyValue =
        purchasePrice *
        Math.pow(1 + scenario.appreciation / 100, holdingPeriod);

      // Calculate total return for this scenario
      const scenarioSellingCosts = scenarioPropertyValue * (sellingCosts / 100);
      const scenarioTotalReturn =
        scenarioPropertyValue -
        scenarioSellingCosts -
        purchasePrice +
        scenarioAnnualCashFlow * holdingPeriod;
      const scenarioAnnualizedReturn =
        totalInvestment > 0
          ? (Math.pow(
              (totalInvestment + scenarioTotalReturn) / totalInvestment,
              1 / holdingPeriod,
            ) -
              1) *
            100
          : 0;

      // Calculate cash on cash return for this scenario
      const scenarioCashOnCashReturn =
        totalInvestment > 0
          ? (scenarioAnnualCashFlow / totalInvestment) * 100
          : 0;

      scenarioResults[scenarioKey] = {
        name: scenario.name,
        color: scenario.color,
        monthlyCashFlow: scenarioMonthlyCashFlow,
        annualCashFlow: scenarioAnnualCashFlow,
        propertyValue: scenarioPropertyValue,
        totalReturn: scenarioTotalReturn,
        annualizedReturn: scenarioAnnualizedReturn,
        cashOnCashReturn: scenarioCashOnCashReturn,
        vacancyRate: scenario.vacancy,
        appreciation: scenario.appreciation,
      };
    });

    setResults({
      monthlyMortgage,
      totalMonthlyExpenses,
      monthlyCashFlow,
      annualCashFlow,
      totalInvestment,
      annualROI,
      cashOnCashReturn,
      propertyValueAfterHolding,
      totalReturn,
      annualizedReturn,
      taxBenefits,
      netCashFlow,
      breakEvenYears,
      riskScore,
      marketComparison,
      investmentGrade,
      recommendations,
    });

    setScenarioResults(scenarioResults as any);
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
      propertyAppreciation: "3",
      vacancyRate: "5",
      taxRate: "24",
      inflationRate: "2.5",
      holdingPeriod: "10",
      sellingCosts: "6",
      refinancingRate: "3.5",
      refinancingCosts: "2",
    });
    setShowResults(false);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#1a1e26]">
      <UserHeader />

      <main className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-6xl">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="mb-4 text-4xl font-bold text-gray-900 dark:text-white">
              Advanced ROI Calculator
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Comprehensive investment analysis with market comparison and risk
              assessment
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Input Form */}
            <div className="lg:col-span-1">
              <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-[#23272f]">
                <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">
                  Property Details
                </h2>

                {/* Tab Navigation */}
                <div className="mb-6 flex space-x-1 rounded-lg bg-gray-100 p-1 dark:bg-gray-700">
                  <button
                    onClick={() => setActiveTab("basic")}
                    className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                      activeTab === "basic"
                        ? "bg-white text-blue-600 shadow dark:bg-gray-600 dark:text-white"
                        : "text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                    }`}
                  >
                    Basic
                  </button>
                  <button
                    onClick={() => setActiveTab("advanced")}
                    className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                      activeTab === "advanced"
                        ? "bg-white text-blue-600 shadow dark:bg-gray-600 dark:text-white"
                        : "text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                    }`}
                  >
                    Advanced
                  </button>
                </div>

                <div className="space-y-4">
                  {activeTab === "basic" ? (
                    <>
                      {/* Basic Property Information */}
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
                    </>
                  ) : (
                    <>
                      {/* Advanced Investment Parameters */}
                      <div>
                        <h3 className="mb-3 text-lg font-semibold text-gray-800 dark:text-gray-200">
                          Market Assumptions
                        </h3>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                          <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                              Annual Appreciation (%)
                            </label>
                            <input
                              type="number"
                              name="propertyAppreciation"
                              value={formData.propertyAppreciation}
                              onChange={handleInputChange}
                              step="0.1"
                              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-[#2C303B] dark:text-white"
                              placeholder="3"
                            />
                          </div>
                          <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                              Vacancy Rate (%)
                            </label>
                            <input
                              type="number"
                              name="vacancyRate"
                              value={formData.vacancyRate}
                              onChange={handleInputChange}
                              step="0.1"
                              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-[#2C303B] dark:text-white"
                              placeholder="5"
                            />
                          </div>
                          <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                              Tax Rate (%)
                            </label>
                            <input
                              type="number"
                              name="taxRate"
                              value={formData.taxRate}
                              onChange={handleInputChange}
                              step="0.1"
                              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-[#2C303B] dark:text-white"
                              placeholder="24"
                            />
                          </div>
                          <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                              Inflation Rate (%)
                            </label>
                            <input
                              type="number"
                              name="inflationRate"
                              value={formData.inflationRate}
                              onChange={handleInputChange}
                              step="0.1"
                              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-[#2C303B] dark:text-white"
                              placeholder="2.5"
                            />
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="mb-3 text-lg font-semibold text-gray-800 dark:text-gray-200">
                          Investment Timeline
                        </h3>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                          <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                              Holding Period (Years)
                            </label>
                            <input
                              type="number"
                              name="holdingPeriod"
                              value={formData.holdingPeriod}
                              onChange={handleInputChange}
                              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-[#2C303B] dark:text-white"
                              placeholder="10"
                            />
                          </div>
                          <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                              Selling Costs (%)
                            </label>
                            <input
                              type="number"
                              name="sellingCosts"
                              value={formData.sellingCosts}
                              onChange={handleInputChange}
                              step="0.1"
                              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-[#2C303B] dark:text-white"
                              placeholder="6"
                            />
                          </div>
                        </div>
                      </div>
                    </>
                  )}

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
            </div>

            {/* Results */}
            <div className="lg:col-span-2">
              <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-[#23272f]">
                <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">
                  Investment Analysis Results
                </h2>

                {showResults ? (
                  <div className="space-y-6">
                    {/* Investment Grade */}
                    <div className="rounded-lg border-2 border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200">
                          Investment Grade: {results.investmentGrade}
                        </h3>
                        <div className="flex items-center space-x-2">
                          <FiTarget className="h-5 w-5 text-blue-600" />
                          <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                            Risk Score: {results.riskScore}/100
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Key Metrics Grid */}
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                      <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-green-700 dark:text-green-300">
                            Cash on Cash Return
                          </span>
                          <FiTrendingUp className="h-4 w-4 text-green-600" />
                        </div>
                        <p className="text-2xl font-bold text-green-800 dark:text-green-200">
                          {results.cashOnCashReturn.toFixed(2)}%
                        </p>
                      </div>

                      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                            Annualized Return
                          </span>
                          <FiBarChart2 className="h-4 w-4 text-blue-600" />
                        </div>
                        <p className="text-2xl font-bold text-blue-800 dark:text-blue-200">
                          {results.annualizedReturn.toFixed(2)}%
                        </p>
                      </div>

                      <div className="rounded-lg border border-purple-200 bg-purple-50 p-4 dark:border-purple-800 dark:bg-purple-900/20">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
                            Break-even Years
                          </span>
                          <FiCalendar className="h-4 w-4 text-purple-600" />
                        </div>
                        <p className="text-2xl font-bold text-purple-800 dark:text-purple-200">
                          {results.breakEvenYears.toFixed(1)} years
                        </p>
                      </div>
                    </div>

                    {/* Cash Flow Analysis */}
                    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
                      <h3 className="mb-3 text-lg font-semibold text-gray-800 dark:text-gray-200">
                        Cash Flow Analysis
                      </h3>
                      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
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
                        <div className="flex justify-between">
                          <span className="text-gray-700 dark:text-gray-300">
                            Tax Benefits:
                          </span>
                          <span className="font-semibold text-green-600 dark:text-green-400">
                            RM {results.taxBenefits.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-700 dark:text-gray-300">
                            Net Cash Flow:
                          </span>
                          <span
                            className={`font-semibold ${results.netCashFlow >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
                          >
                            RM {results.netCashFlow.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Long-term Projections */}
                    <div className="rounded-lg border border-orange-200 bg-orange-50 p-4 dark:border-orange-800 dark:bg-orange-900/20">
                      <h3 className="mb-3 text-lg font-semibold text-orange-800 dark:text-orange-200">
                        Long-term Projections
                      </h3>
                      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                        <div className="flex justify-between">
                          <span className="text-orange-700 dark:text-orange-300">
                            Property Value After Holding:
                          </span>
                          <span className="font-semibold text-orange-800 dark:text-orange-200">
                            RM{" "}
                            {results.propertyValueAfterHolding.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-orange-700 dark:text-orange-300">
                            Total Return:
                          </span>
                          <span
                            className={`font-semibold ${results.totalReturn >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
                          >
                            RM {results.totalReturn.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-orange-700 dark:text-orange-300">
                            Market Comparison:
                          </span>
                          <span className="font-semibold text-orange-800 dark:text-orange-200">
                            {results.marketComparison}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Scenario Analysis */}
                    <div className="rounded-lg border border-indigo-200 bg-indigo-50 p-4 dark:border-indigo-800 dark:bg-indigo-900/20">
                      <h3 className="mb-4 text-lg font-semibold text-indigo-800 dark:text-indigo-200">
                        📊 Scenario Analysis
                      </h3>
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        {Object.keys(scenarioResults).map((scenarioKey) => {
                          const scenario = scenarioResults[scenarioKey];
                          if (!scenario) return null;

                          return (
                            <div
                              key={scenarioKey}
                              className={`rounded-lg border-2 p-4 ${
                                scenario.color === "green"
                                  ? "border-green-300 bg-green-100 dark:border-green-700 dark:bg-green-900/30"
                                  : scenario.color === "blue"
                                    ? "border-blue-300 bg-blue-100 dark:border-blue-700 dark:bg-blue-900/30"
                                    : "border-red-300 bg-red-100 dark:border-red-700 dark:bg-red-900/30"
                              }`}
                            >
                              <h4
                                className={`mb-3 font-bold ${
                                  scenario.color === "green"
                                    ? "text-green-800 dark:text-green-200"
                                    : scenario.color === "blue"
                                      ? "text-blue-800 dark:text-blue-200"
                                      : "text-red-800 dark:text-red-200"
                                }`}
                              >
                                {scenario.name} Scenario
                              </h4>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span>Annualized Return:</span>
                                  <span
                                    className={`font-semibold ${
                                      scenario.annualizedReturn >= 0
                                        ? "text-green-600"
                                        : "text-red-600"
                                    }`}
                                  >
                                    {scenario.annualizedReturn.toFixed(2)}%
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Cash on Cash:</span>
                                  <span
                                    className={`font-semibold ${
                                      scenario.cashOnCashReturn >= 0
                                        ? "text-green-600"
                                        : "text-red-600"
                                    }`}
                                  >
                                    {scenario.cashOnCashReturn.toFixed(2)}%
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Monthly Cash Flow:</span>
                                  <span
                                    className={`font-semibold ${
                                      scenario.monthlyCashFlow >= 0
                                        ? "text-green-600"
                                        : "text-red-600"
                                    }`}
                                  >
                                    RM {scenario.monthlyCashFlow.toFixed(2)}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Property Value:</span>
                                  <span className="font-semibold">
                                    RM {scenario.propertyValue.toLocaleString()}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Vacancy Rate:</span>
                                  <span className="font-semibold">
                                    {scenario.vacancyRate}%
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Appreciation:</span>
                                  <span className="font-semibold">
                                    {scenario.appreciation}%
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Recommendations */}
                    <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-900/20">
                      <h3 className="mb-3 flex items-center text-lg font-semibold text-yellow-800 dark:text-yellow-200">
                        <FiAlertTriangle className="mr-2 h-5 w-5" />
                        Investment Recommendations
                      </h3>
                      <ul className="space-y-2">
                        {results.recommendations.map(
                          (recommendation, index) => (
                            <li key={index} className="flex items-start">
                              <span className="mr-2 text-yellow-600 dark:text-yellow-400">
                                •
                              </span>
                              <span className="text-sm text-yellow-700 dark:text-yellow-300">
                                {recommendation}
                              </span>
                            </li>
                          ),
                        )}
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div className="py-12 text-center">
                    <div className="mb-4 text-6xl text-gray-400 dark:text-gray-500">
                      📊
                    </div>
                    <p className="text-gray-500 dark:text-gray-400">
                      Enter your property details and click "Calculate ROI" to
                      see your comprehensive investment analysis.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
