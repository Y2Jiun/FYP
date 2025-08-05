"use client";

import React, { useState, useEffect } from "react";
import {
  calculateTrustScore,
  updatePropertyTrustScore,
  debugPropertyDocuments,
} from "@/utils/trustScoreCalculator";
import TrustScoreBadge from "@/components/TrustScore/TrustScoreBadge";

export default function TestTrustScorePage() {
  const [propertyId, setPropertyId] = useState("PROP001");
  const [trustScoreResult, setTrustScoreResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleCalculateTrustScore = async () => {
    setLoading(true);
    setMessage("");

    try {
      const result = await calculateTrustScore(propertyId);
      setTrustScoreResult(result);
      setMessage("Trust score calculated successfully!");
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTrustScore = async () => {
    setLoading(true);
    setMessage("");

    try {
      const success = await updatePropertyTrustScore(propertyId);
      if (success) {
        setMessage("Property trust score updated successfully!");
        // Recalculate to show updated values
        const result = await calculateTrustScore(propertyId);
        setTrustScoreResult(result);
      } else {
        setMessage("Failed to update trust score");
      }
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDebugDocuments = async () => {
    if (!propertyId) {
      setMessage("Please enter a property ID");
      return;
    }

    setMessage("Check browser console for detailed document information");
    await debugPropertyDocuments(propertyId);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 dark:bg-gray-900">
      <div className="mx-auto max-w-4xl px-4">
        <h1 className="mb-8 text-3xl font-bold text-gray-900 dark:text-white">
          Trust Score System Test
        </h1>

        <div className="mb-6 rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
          <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
            Test Configuration
          </h2>

          <div className="mb-6 flex items-end gap-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Property ID
              </label>
              <input
                type="text"
                value={propertyId}
                onChange={(e) => setPropertyId(e.target.value)}
                className="rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                placeholder="Enter property ID"
              />
            </div>

            <button
              onClick={handleCalculateTrustScore}
              disabled={loading}
              className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Calculating..." : "Calculate Trust Score"}
            </button>

            <button
              onClick={handleUpdateTrustScore}
              disabled={loading}
              className="rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? "Updating..." : "Update Property"}
            </button>

            <button
              onClick={handleDebugDocuments}
              disabled={loading}
              className="rounded-md bg-purple-600 px-4 py-2 text-white hover:bg-purple-700 disabled:opacity-50"
            >
              Debug Documents
            </button>
          </div>

          {message && (
            <div
              className={`rounded-md p-3 ${
                message.includes("Error")
                  ? "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                  : "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
              }`}
            >
              {message}
            </div>
          )}
        </div>

        {trustScoreResult && (
          <div className="rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
            <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
              Trust Score Results
            </h2>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <h3 className="mb-3 text-lg font-medium text-gray-900 dark:text-white">
                  Badge Display
                </h3>
                <TrustScoreBadge
                  trustScore={trustScoreResult.trustScore}
                  trustBadge={trustScoreResult.trustBadge}
                  showScore={true}
                  showDescription={true}
                  size="lg"
                />
              </div>

              <div>
                <h3 className="mb-3 text-lg font-medium text-gray-900 dark:text-white">
                  Raw Data
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      Trust Score:
                    </span>
                    <span className="font-medium">
                      {trustScoreResult.trustScore}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      Badge:
                    </span>
                    <span className="font-medium capitalize">
                      {trustScoreResult.trustBadge}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      Required Documents:
                    </span>
                    <span className="font-medium">
                      {trustScoreResult.requiredDocuments}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      Verified Documents:
                    </span>
                    <span className="font-medium">
                      {trustScoreResult.verifiedDocuments}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
