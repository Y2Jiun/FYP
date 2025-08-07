"use client";
import React, { useState } from "react";
import FreeDocumentReader from "@/components/Admin/FreeDocumentReader";
import { DocumentAnalysisResult } from "@/utils/freeDocumentReader";

export default function TestFreeDocumentReader() {
  const [showReader, setShowReader] = useState(false);
  const [selectedType, setSelectedType] = useState("tax-assessment");
  const [lastResult, setLastResult] = useState<DocumentAnalysisResult | null>(
    null,
  );

  const documentTypes = [
    { value: "tax-assessment", label: "Tax Assessment" },
    { value: "land-title", label: "Land Title" },
    { value: "building-permit", label: "Building Permit" },
    { value: "insurance-certificate", label: "Insurance Certificate" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12 dark:bg-gray-900">
      <div className="mx-auto max-w-4xl px-4">
        <div className="mb-8 text-center">
          <h1 className="mb-4 text-3xl font-bold text-gray-900 dark:text-white">
            Free Document Reader Test
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Test the free OCR document reading functionality powered by
            Tesseract.js and PDF.js
          </p>
        </div>

        <div className="mb-6 rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
          <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
            Document Reader Settings
          </h2>

          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Document Type
              </label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
                {documentTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => setShowReader(true)}
              className="w-full rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-700"
            >
              Open Free Document Reader
            </button>
          </div>
        </div>

        {lastResult && (
          <div className="rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
            <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
              Last Reading Result
            </h2>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <h3 className="mb-2 font-semibold text-gray-900 dark:text-white">
                  Summary
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">
                      Confidence:
                    </span>
                    <span className="font-medium">
                      {lastResult.confidence.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">
                      Document Type:
                    </span>
                    <span className="font-medium">
                      {lastResult.documentType}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">
                      Key Fields Found:
                    </span>
                    <span className="font-medium">
                      {Object.keys(lastResult.keyFields).length}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="mb-2 font-semibold text-gray-900 dark:text-white">
                  Extracted Key Fields
                </h3>
                <div className="space-y-1">
                  {Object.entries(lastResult.keyFields).map(
                    ([field, value]) => (
                      <div key={field} className="text-sm">
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                          {field
                            .replace(/([A-Z])/g, " $1")
                            .replace(/^./, (str) => str.toUpperCase())}
                          :
                        </span>
                        <span className="ml-2 text-gray-600 dark:text-gray-400">
                          {value}
                        </span>
                      </div>
                    ),
                  )}
                </div>
              </div>
            </div>

            {lastResult.issues.length > 0 && (
              <div className="mt-4">
                <h3 className="mb-2 font-semibold text-yellow-800 dark:text-yellow-200">
                  Issues Detected
                </h3>
                <ul className="space-y-1 text-sm text-yellow-700 dark:text-yellow-300">
                  {lastResult.issues.map((issue, index) => (
                    <li key={index}>• {issue}</li>
                  ))}
                </ul>
              </div>
            )}

            {lastResult.recommendations.length > 0 && (
              <div className="mt-4">
                <h3 className="mb-2 font-semibold text-blue-800 dark:text-blue-200">
                  Recommendations
                </h3>
                <ul className="space-y-1 text-sm text-blue-700 dark:text-blue-300">
                  {lastResult.recommendations.map((recommendation, index) => (
                    <li key={index}>• {recommendation}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-4">
              <h3 className="mb-2 font-semibold text-gray-900 dark:text-white">
                Extracted Text Preview
              </h3>
              <div className="max-h-32 overflow-y-auto rounded-lg bg-gray-50 p-3 text-sm text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                {lastResult.extractedText.text.substring(0, 300)}
                {lastResult.extractedText.text.length > 300 && "..."}
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
          <h3 className="mb-2 font-semibold text-blue-900 dark:text-blue-200">
            How It Works
          </h3>
          <ul className="space-y-1 text-sm text-blue-800 dark:text-blue-300">
            <li>
              • <strong>Free OCR:</strong> Uses Tesseract.js running entirely in
              your browser
            </li>
            <li>
              • <strong>PDF Support:</strong> Converts PDF pages to images for OCR processing
            </li>
            <li>
              • <strong>Multi-page PDFs:</strong> Choose which page to process from multi-page documents
            </li>
            <li>
              • <strong>No Data Sent:</strong> All processing happens locally,
              no external servers
            </li>
            <li>
              • <strong>Smart Extraction:</strong> Automatically identifies key
              fields based on document type
            </li>
            <li>
              • <strong>Quality Analysis:</strong> Provides confidence scores
              and recommendations
            </li>
            <li>
              • <strong>Privacy First:</strong> Your documents never leave your
              device
            </li>
          </ul>
        </div>

        {showReader && (
          <FreeDocumentReader
            documentType={selectedType}
            onDocumentRead={(result) => {
              setLastResult(result);
              setShowReader(false);
            }}
            onClose={() => setShowReader(false)}
          />
        )}
      </div>
    </div>
  );
}
