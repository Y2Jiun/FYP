"use client";
import React, { useState, useEffect, useCallback } from "react";
import {
  analyzeDocument,
  detectFraud,
  enhancedDocumentVerification,
  DocumentAnalysisResult,
  FraudDetectionResult,
} from "@/utils/aiDocumentVerification";
import {
  performFreeDocumentReading,
  DocumentAnalysisResult as FreeDocumentResult,
} from "@/utils/freeDocumentReader";
import FreeDocumentReader from "./FreeDocumentReader";
import {
  FiShield,
  FiAlertTriangle,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiCpu,
  FiEye,
  FiBarChart2,
  FiFileText,
} from "react-icons/fi";

interface AIDocumentVerificationProps {
  documentId: string;
  documentData: any;
  documentType: string;
  propertyData?: any;
  onVerificationComplete: (result: any) => void;
}

export default function AIDocumentVerification({
  documentId,
  documentData,
  documentType,
  propertyData,
  onVerificationComplete,
}: AIDocumentVerificationProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [hasResults, setHasResults] = useState(false);
  const [results, setResults] = useState<{
    analysis: DocumentAnalysisResult | null;
    fraud: FraudDetectionResult | null;
    recommendation: string;
  }>({
    analysis: null,
    fraud: null,
    recommendation: "",
  });
  const [showDetails, setShowDetails] = useState(false);
  const [showFreeReader, setShowFreeReader] = useState(false);
  const [isReadingDocument, setIsReadingDocument] = useState(false);
  const [readingProgress, setReadingProgress] = useState<string>("");
  const [freeReaderResult, setFreeReaderResult] =
    useState<FreeDocumentResult | null>(null);

  // Monitor state changes
  useEffect(() => {
    console.log("State changed - results:", results);
  }, [results]);

  // Function to read document directly from Firebase Storage
  const handleReadExistingDocument = async () => {
    if (!documentData?.fileUrl) {
      alert("No document file URL available");
      return;
    }

    setIsReadingDocument(true);
    setReadingProgress("Fetching document from storage...");

    try {
      // Use proxy API to avoid CORS issues
      let response: Response;
      let blob: Blob;

      try {
        // Method 1: Use our proxy API
        const proxyUrl = `/api/proxy-document?url=${encodeURIComponent(documentData.fileUrl)}`;
        response = await fetch(proxyUrl);

        if (!response.ok) {
          throw new Error(
            `Proxy API error: ${response.status} ${response.statusText}`,
          );
        }

        blob = await response.blob();
      } catch (proxyError) {
        console.log("Proxy API failed, trying direct fetch...", proxyError);

        // Method 2: Direct fetch as fallback
        try {
          response = await fetch(documentData.fileUrl, {
            mode: "cors",
            headers: {
              Accept: "application/pdf,image/*,*/*",
            },
          });

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }

          blob = await response.blob();
        } catch (corsError) {
          console.log(
            "Direct fetch also failed, trying image canvas method...",
            corsError,
          );

          // Method 3: For images, use canvas approach
          if (
            documentData.fileUrl.includes(".jpg") ||
            documentData.fileUrl.includes(".jpeg") ||
            documentData.fileUrl.includes(".png") ||
            documentData.fileUrl.includes(".gif")
          ) {
            const img = new Image();
            img.crossOrigin = "anonymous";

            await new Promise((resolve, reject) => {
              img.onload = resolve;
              img.onerror = reject;
              img.src = documentData.fileUrl;
            });

            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            canvas.width = img.width;
            canvas.height = img.height;
            ctx?.drawImage(img, 0, 0);

            blob = (await new Promise((resolve) => {
              canvas.toBlob(resolve, "image/png");
            })) as Blob;
          } else {
            // For PDFs, open in new tab and suggest alternative
            window.open(documentData.fileUrl, "_blank");
            throw new Error(
              "Unable to fetch document due to CORS restrictions. Document opened in new tab. Please download and use 'Upload & Read' button.",
            );
          }
        }
      }

      // Determine the correct file type
      let fileType = blob.type;

      // If blob.type is generic (application/octet-stream), try to determine from filename
      if (!fileType || fileType === "application/octet-stream") {
        const fileName = documentData.fileName || "document";
        if (fileName.toLowerCase().endsWith(".pdf")) {
          fileType = "application/pdf";
        } else if (
          fileName.toLowerCase().match(/\.(jpg|jpeg|png|gif|bmp|webp)$/)
        ) {
          fileType = `image/${fileName.split(".").pop()?.toLowerCase().replace("jpg", "jpeg")}`;
        } else {
          // Default fallback
          fileType = "application/pdf"; // Most documents are PDFs
        }
      }

      console.log("🔍 File type detection:", {
        blobType: blob.type,
        fileName: documentData.fileName,
        detectedType: fileType,
      });

      const file = new File([blob], documentData.fileName || "document", {
        type: fileType,
      });

      setReadingProgress("Processing document with OCR...");

      // Use the existing free document reading function
      const result = await performFreeDocumentReading(file, documentType, 1);

      setFreeReaderResult(result);
      setReadingProgress("Document reading completed!");

      // Show results for 3 seconds then clear progress
      setTimeout(() => {
        setReadingProgress("");
      }, 3000);
    } catch (error) {
      console.error("Error reading document:", error);
      setReadingProgress("");

      // Provide helpful error message
      if (error.message.includes("CORS")) {
        alert(
          `CORS Error: ${error.message}\n\nTip: Use the "Upload & Read" button as an alternative.`,
        );
      } else if (error.message.includes("Failed to fetch")) {
        alert(
          `Network Error: Unable to fetch document.\n\nThis might be due to CORS restrictions or network issues.\n\nTry using "Upload & Read" button instead.`,
        );
      } else {
        alert(`Failed to read document: ${error.message}`);
      }
    } finally {
      setIsReadingDocument(false);
    }
  };

  const handleAIVerification = async () => {
    console.log("Button clicked - starting verification...");
    setIsAnalyzing(true);

    try {
      console.log("Starting AI verification...");
      console.log("Document ID:", documentId);
      console.log("Document Data:", documentData);
      console.log("Document Type:", documentType);
      console.log("Property Data:", propertyData);

      const result = await enhancedDocumentVerification(
        documentId,
        documentData,
        documentType,
      );

      console.log("AI Verification Result:", result);

      // Use the actual AI analysis results
      const newResults = {
        analysis: result.analysis,
        fraud: result.fraudDetection,
        recommendation: result.finalRecommendation,
      };

      setResults(newResults);
      setHasResults(true);

      console.log("AI results set - Results:", newResults);
      console.log("State updates completed");
      console.log("hasResults set to true");

      // Small delay to ensure state updates are processed
      await new Promise((resolve) => setTimeout(resolve, 10));
      console.log("Delay completed");

      // Don't call onVerificationComplete here - let user choose action
      console.log("AI Analysis completed - waiting for user action");
    } catch (error) {
      console.error("AI Verification Error:", error);
      alert("AI Verification failed: " + error.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20";
      case "rejected":
        return "text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/20";
      case "needs_review":
        return "text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/20";
      default:
        return "text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/20";
    }
  };

  const getRiskLevelColor = (riskLevel: string) => {
    switch (riskLevel) {
      case "low":
        return "text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20";
      case "medium":
        return "text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/20";
      case "high":
        return "text-orange-600 bg-orange-100 dark:text-orange-400 dark:bg-orange-900/20";
      case "critical":
        return "text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/20";
      default:
        return "text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/20";
    }
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-800">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <FiCpu className="h-6 w-6 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            AI-Powered Document Verification
          </h3>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={handleAIVerification}
            disabled={isAnalyzing}
            className="flex items-center space-x-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
          >
            {isAnalyzing ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                <span>Analyzing...</span>
              </>
            ) : (
              <>
                <FiShield className="h-4 w-4" />
                <span>Run AI Analysis</span>
              </>
            )}
          </button>

          <button
            onClick={handleReadExistingDocument}
            disabled={isReadingDocument}
            className="flex items-center space-x-2 rounded-lg bg-green-600 px-4 py-2 text-white transition-colors hover:bg-green-700 disabled:opacity-50"
            title="Read the uploaded document with OCR"
          >
            {isReadingDocument ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                <span>Reading...</span>
              </>
            ) : (
              <>
                <FiFileText className="h-4 w-4" />
                <span>Read Document</span>
              </>
            )}
          </button>

          <button
            onClick={() => setShowFreeReader(true)}
            className="flex items-center space-x-2 rounded-lg bg-gray-600 px-4 py-2 text-white transition-colors hover:bg-gray-700"
            title="Upload and read a different document"
          >
            <FiFileText className="h-4 w-4" />
            <span>Upload & Read</span>
          </button>
        </div>
      </div>

      {/* Debug Info */}
      <div className="mb-4 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-700">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
          Debug Info:
        </h4>
        <p className="text-xs text-gray-600 dark:text-gray-300">
          Analysis Result: {results.analysis ? "✅ Set" : "❌ Not Set"} | Fraud
          Result: {results.fraud ? "✅ Set" : "❌ Not Set"} | Has Results:{" "}
          {hasResults ? "✅ True" : "❌ False"}
        </p>
      </div>

      {/* Document Reading Progress */}
      {readingProgress && (
        <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
          <div className="flex items-center space-x-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
            <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
              {readingProgress}
            </span>
          </div>
        </div>
      )}

      {/* Document Reading Results */}
      {freeReaderResult && (
        <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20">
          <h4 className="mb-2 text-lg font-semibold text-green-800 dark:text-green-200">
            📄 Document Reading Results
          </h4>
          <div className="space-y-2 text-sm">
            <p className="text-green-700 dark:text-green-300">
              <strong>Confidence:</strong>{" "}
              {freeReaderResult.confidence.toFixed(1)}%
            </p>
            <p className="text-green-700 dark:text-green-300">
              <strong>Text Length:</strong>{" "}
              {freeReaderResult.extractedText.text.length} characters
            </p>
            {freeReaderResult.issues.length > 0 && (
              <div>
                <strong className="text-green-700 dark:text-green-300">
                  Issues Found:
                </strong>
                <ul className="ml-4 list-disc text-green-600 dark:text-green-400">
                  {freeReaderResult.issues.map((issue, index) => (
                    <li key={index}>{issue}</li>
                  ))}
                </ul>
              </div>
            )}
            <details className="mt-2">
              <summary className="cursor-pointer font-medium text-green-800 dark:text-green-200">
                View Extracted Text
              </summary>
              <div className="mt-2 max-h-40 overflow-y-auto rounded bg-white p-2 text-xs text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                {freeReaderResult.extractedText.text}
              </div>
            </details>
          </div>
        </div>
      )}

      {console.log(
        "Rendering check - results:",
        results,
        "hasResults:",
        hasResults,
        "results.analysis:",
        results.analysis,
        "results.fraud:",
        results.fraud,
        "Condition check:",
        hasResults && results.analysis && results.fraud,
      )}
      {/* Fallback display for debugging */}
      {hasResults && !results.analysis && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
          <h4 className="text-lg font-semibold text-red-800 dark:text-red-200">
            Debug: hasResults is true but results.analysis is null
          </h4>
          <p className="text-sm text-red-700 dark:text-red-300">
            Results object: {JSON.stringify(results, null, 2)}
          </p>
        </div>
      )}

      {hasResults && results.analysis && !results.fraud && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
          <h4 className="text-lg font-semibold text-red-800 dark:text-red-200">
            Debug: hasResults and results.analysis are true but results.fraud is
            null
          </h4>
          <p className="text-sm text-red-700 dark:text-red-300">
            Results object: {JSON.stringify(results, null, 2)}
          </p>
        </div>
      )}

      {hasResults && results.analysis && results.fraud && (
        <div className="space-y-6">
          {/* Overall Status */}
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-700">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                AI Verification Results
              </h4>
              <span
                className={`rounded-full px-3 py-1 text-sm font-medium ${getStatusColor(
                  results.analysis.verificationStatus,
                )}`}
              >
                {results.analysis.verificationStatus.toUpperCase()}
              </span>
            </div>
            <p className="mt-2 text-gray-600 dark:text-gray-300">
              {results.recommendation}
            </p>
          </div>

          {/* Analysis Scores */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                  Authenticity
                </span>
                <FiShield className="h-4 w-4 text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-blue-800 dark:text-blue-200">
                {results.analysis.authenticity}%
              </p>
            </div>

            <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-green-700 dark:text-green-300">
                  Completeness
                </span>
                <FiCheckCircle className="h-4 w-4 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-green-800 dark:text-green-200">
                {results.analysis.completeness}%
              </p>
            </div>

            <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-red-700 dark:text-red-300">
                  Fraud Risk
                </span>
                <FiAlertTriangle className="h-4 w-4 text-red-600" />
              </div>
              <p className="text-2xl font-bold text-red-800 dark:text-red-200">
                {results.analysis.fraudRisk}%
              </p>
            </div>

            <div className="rounded-lg border border-purple-200 bg-purple-50 p-4 dark:border-purple-800 dark:bg-purple-900/20">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
                  Confidence
                </span>
                <FiBarChart2 className="h-4 w-4 text-purple-600" />
              </div>
              <p className="text-2xl font-bold text-purple-800 dark:text-purple-200">
                {results.analysis.confidence}%
              </p>
            </div>
          </div>

          {/* Fraud Detection */}
          <div className="rounded-lg border border-orange-200 bg-orange-50 p-4 dark:border-orange-800 dark:bg-orange-900/20">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-semibold text-orange-800 dark:text-orange-200">
                Fraud Detection Analysis
              </h4>
              <span
                className={`rounded-full px-3 py-1 text-sm font-medium ${getRiskLevelColor(
                  results.fraud.riskLevel,
                )}`}
              >
                {results.fraud.riskLevel.toUpperCase()} RISK
              </span>
            </div>
            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <h5 className="font-semibold text-orange-800 dark:text-orange-200">
                  Risk Score: {results.fraud.riskScore}/100
                </h5>
                <p className="text-sm text-orange-700 dark:text-orange-300">
                  {results.fraud.requiresManualReview
                    ? "Manual review required"
                    : "AI analysis sufficient"}
                </p>
              </div>
              <div>
                <h5 className="font-semibold text-orange-800 dark:text-orange-200">
                  Fraud Indicators Found: {results.fraud.fraudIndicators.length}
                </h5>
                <p className="text-sm text-orange-700 dark:text-orange-300">
                  {results.fraud.fraudIndicators.length > 0
                    ? "Suspicious patterns detected"
                    : "No fraud indicators detected"}
                </p>
              </div>
            </div>
          </div>

          {/* Detailed Analysis */}
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-700">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                Detailed Analysis
              </h4>
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              >
                <FiEye className="h-4 w-4" />
                <span>{showDetails ? "Hide" : "Show"} Details</span>
              </button>
            </div>

            {showDetails && (
              <div className="mt-4 space-y-4">
                {/* Issues */}
                {results.analysis.issues.length > 0 && (
                  <div>
                    <h5 className="font-semibold text-red-600 dark:text-red-400">
                      Issues Detected:
                    </h5>
                    <ul className="mt-2 space-y-1">
                      {results.analysis.issues.map((issue, index) => (
                        <li key={index} className="flex items-start">
                          <FiXCircle className="mt-0.5 mr-2 h-4 w-4 text-red-500" />
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            {issue}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Fraud Indicators */}
                {results.fraud.fraudIndicators.length > 0 && (
                  <div>
                    <h5 className="font-semibold text-orange-600 dark:text-orange-400">
                      Fraud Indicators:
                    </h5>
                    <ul className="mt-2 space-y-1">
                      {results.fraud.fraudIndicators.map((indicator, index) => (
                        <li key={index} className="flex items-start">
                          <FiAlertTriangle className="mt-0.5 mr-2 h-4 w-4 text-orange-500" />
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            {indicator}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Recommendations */}
                <div>
                  <h5 className="font-semibold text-blue-600 dark:text-blue-400">
                    AI Recommendations:
                  </h5>
                  <ul className="mt-2 space-y-1">
                    {results.analysis.recommendations.map(
                      (recommendation, index) => (
                        <li key={index} className="flex items-start">
                          <FiCheckCircle className="mt-0.5 mr-2 h-4 w-4 text-blue-500" />
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            {recommendation}
                          </span>
                        </li>
                      ),
                    )}
                    {results.fraud.recommendations.map(
                      (recommendation, index) => (
                        <li key={`fraud-${index}`} className="flex items-start">
                          <FiShield className="mt-0.5 mr-2 h-4 w-4 text-purple-500" />
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            {recommendation}
                          </span>
                        </li>
                      ),
                    )}
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4">
            <button
              onClick={() =>
                onVerificationComplete({
                  documentId,
                  action: "approve",
                  analysis: results.analysis,
                  fraudDetection: results.fraud,
                  timestamp: new Date(),
                })
              }
              disabled={
                results.analysis.verificationStatus === "rejected" ||
                results.fraud.riskLevel === "critical"
              }
              className="flex items-center space-x-2 rounded-lg bg-green-600 px-4 py-2 text-white transition-colors hover:bg-green-700 disabled:opacity-50"
            >
              <FiCheckCircle className="h-4 w-4" />
              <span>Approve Document</span>
            </button>
            <button
              onClick={() =>
                onVerificationComplete({
                  documentId,
                  action: "reject",
                  analysis: results.analysis,
                  fraudDetection: results.fraud,
                  timestamp: new Date(),
                })
              }
              className="flex items-center space-x-2 rounded-lg bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700"
            >
              <FiXCircle className="h-4 w-4" />
              <span>Reject Document</span>
            </button>
            <button
              onClick={() =>
                onVerificationComplete({
                  documentId,
                  action: "review",
                  analysis: results.analysis,
                  fraudDetection: results.fraud,
                  timestamp: new Date(),
                })
              }
              className="flex items-center space-x-2 rounded-lg bg-yellow-600 px-4 py-2 text-white transition-colors hover:bg-yellow-700"
            >
              <FiClock className="h-4 w-4" />
              <span>Mark for Review</span>
            </button>
          </div>
        </div>
      )}

      {/* Free Document Reader Modal */}
      {showFreeReader && (
        <FreeDocumentReader
          documentType={documentType}
          onDocumentRead={(freeResult: FreeDocumentResult) => {
            console.log("Free document reading result:", freeResult);

            // Convert free document result to AI analysis format
            const convertedAnalysis = {
              authenticity: Math.min(freeResult.confidence, 95),
              completeness:
                Object.keys(freeResult.keyFields).length > 0 ? 80 : 60,
              fraudRisk: freeResult.issues.length > 0 ? 30 : 15,
              confidence: freeResult.confidence,
              issues: freeResult.issues,
              recommendations: freeResult.recommendations,
              verificationStatus:
                freeResult.confidence > 70
                  ? "approved"
                  : ("needs_review" as const),
            };

            const convertedFraud = {
              riskLevel:
                freeResult.issues.length > 0 ? "medium" : ("low" as const),
              riskScore: freeResult.issues.length * 10 + 15,
              fraudIndicators: freeResult.issues,
              recommendations: freeResult.recommendations,
              requiresManualReview: freeResult.confidence < 70,
            };

            setResults({
              analysis: convertedAnalysis,
              fraud: convertedFraud,
              recommendation: `Document read with ${freeResult.confidence.toFixed(1)}% confidence. ${freeResult.issues.length > 0 ? "Some issues detected." : "No major issues found."}`,
            });
            setHasResults(true);
            setShowFreeReader(false);
          }}
          onClose={() => setShowFreeReader(false)}
        />
      )}
    </div>
  );
}
