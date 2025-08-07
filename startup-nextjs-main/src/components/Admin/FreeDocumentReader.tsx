"use client";
import React, { useState, useRef } from "react";
import {
  performFreeDocumentReading,
  DocumentAnalysisResult,
} from "@/utils/freeDocumentReader";
import {
  FiUpload,
  FiFileText,
  FiEye,
  FiDownload,
  FiCheckCircle,
  FiAlertTriangle,
  FiXCircle,
  FiLoader,
} from "react-icons/fi";

interface FreeDocumentReaderProps {
  documentType: string;
  onDocumentRead: (result: DocumentAnalysisResult) => void;
  onClose: () => void;
}

export default function FreeDocumentReader({
  documentType,
  onDocumentRead,
  onClose,
}: FreeDocumentReaderProps) {
  const [isReading, setIsReading] = useState(false);
  const [result, setResult] = useState<DocumentAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [pdfPageNumber, setPdfPageNumber] = useState<number>(1);
  const [pdfTotalPages, setPdfTotalPages] = useState<number>(0);
  const [showPdfPageSelector, setShowPdfPageSelector] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "application/pdf"];
    if (!allowedTypes.includes(file.type)) {
      setError("Please select a valid image file (JPEG, PNG) or PDF");
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError("File size must be less than 10MB");
      return;
    }

    setSelectedFile(file);
    setError(null);

    // If it's a PDF, get page count and show page selector
    if (file.type === "application/pdf") {
      try {
        setProgress("Loading PDF information...");
        const { convertPDFPageToImage } = await import("@/utils/freeDocumentReader");
        
                 // Get PDF info to determine page count
         const pdfjsLib = await import("pdfjs-dist");
         pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';
        
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        
        setPdfTotalPages(pdf.numPages);
        setPdfPageNumber(1);
        setShowPdfPageSelector(true);
        setProgress("");
      } catch (err) {
        setError("Failed to load PDF information: " + (err instanceof Error ? err.message : String(err)));
        setProgress("");
      }
    } else {
      // For images, start reading immediately
      await startDocumentReading(file, 1);
    }
  };

  const startDocumentReading = async (file: File, pageNumber: number = 1) => {
    setIsReading(true);
    setError(null);
    setProgress("Starting document reading...");

    try {
      setProgress("Performing OCR analysis...");
      const analysisResult = await performFreeDocumentReading(file, documentType, pageNumber);
      
      setResult(analysisResult);
      setProgress("Document reading completed!");
      
      // Auto-close after 3 seconds
      setTimeout(() => {
        onDocumentRead(analysisResult);
        onClose();
      }, 3000);

    } catch (err) {
      setError(err instanceof Error ? err.message : "Document reading failed");
      setProgress("");
    } finally {
      setIsReading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      // Simulate file input change
      if (fileInputRef.current) {
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        fileInputRef.current.files = dataTransfer.files;
        handleFileSelect({ target: { files: dataTransfer.files } } as any);
      }
    }
  };

  const getDocumentTypeDisplayName = (type: string) => {
    const displayNames: Record<string, string> = {
      "tax-assessment": "Tax Assessment",
      "land-title": "Land Title",
      "building-permit": "Building Permit",
      "insurance-certificate": "Insurance Certificate",
    };
    return displayNames[type] || type;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Free Document Reader
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <FiXCircle className="h-6 w-6" />
          </button>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
            Document Type: <span className="font-semibold">{getDocumentTypeDisplayName(documentType)}</span>
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            📄 Free OCR powered by Tesseract.js • 🔒 No data sent to external servers • ⚡ Runs in your browser
          </p>
        </div>

        {!isReading && !result && !showPdfPageSelector && (
          <div
            className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center hover:border-blue-400 dark:hover:border-blue-400 transition-colors"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <FiUpload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Upload Document
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              Drag and drop your document here, or click to browse
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.pdf"
              onChange={handleFileSelect}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Choose File
            </button>
            <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
              Supported: JPEG, PNG, PDF (max 10MB)
            </div>
          </div>
        )}

        {/* PDF Page Selector */}
        {showPdfPageSelector && selectedFile && (
          <div className="border-2 border-dashed border-blue-300 dark:border-blue-600 rounded-lg p-6 text-center">
            <FiFileText className="mx-auto h-12 w-12 text-blue-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              PDF Document Detected
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              {selectedFile.name} ({pdfTotalPages} pages)
            </p>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Select Page to Process:
              </label>
              <select
                value={pdfPageNumber}
                onChange={(e) => setPdfPageNumber(Number(e.target.value))}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
                {Array.from({ length: pdfTotalPages }, (_, i) => i + 1).map((page) => (
                  <option key={page} value={page}>
                    Page {page}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => startDocumentReading(selectedFile, pdfPageNumber)}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Process Page {pdfPageNumber}
              </button>
              <button
                onClick={() => {
                  setShowPdfPageSelector(false);
                  setSelectedFile(null);
                  setPdfPageNumber(1);
                  setPdfTotalPages(0);
                  if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                  }
                }}
                className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Choose Different File
              </button>
            </div>
          </div>
        )}

        {isReading && (
          <div className="text-center py-8">
            <FiLoader className="mx-auto h-12 w-12 text-blue-600 animate-spin mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Reading Document...
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {progress}
            </p>
            <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
              This may take 10-30 seconds depending on document size
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
            <div className="flex items-center">
              <FiAlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 mr-2" />
              <span className="text-red-800 dark:text-red-200 font-medium">Error</span>
            </div>
            <p className="text-red-700 dark:text-red-300 text-sm mt-1">{error}</p>
          </div>
        )}

        {result && (
          <div className="space-y-4">
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <div className="flex items-center">
                <FiCheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mr-2" />
                <span className="text-green-800 dark:text-green-200 font-medium">
                  Document Read Successfully!
                </span>
              </div>
              <p className="text-green-700 dark:text-green-300 text-sm mt-1">
                Confidence: {result.confidence.toFixed(1)}%
              </p>
            </div>

            {/* Extracted Text Preview */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                Extracted Text Preview
              </h4>
              <div className="max-h-32 overflow-y-auto text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 p-3 rounded border">
                {result.extractedText.text.substring(0, 500)}
                {result.extractedText.text.length > 500 && "..."}
              </div>
            </div>

            {/* Key Fields */}
            {Object.keys(result.keyFields).length > 0 && (
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">
                  Extracted Key Fields
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {Object.entries(result.keyFields).map(([field, value]) => (
                    <div key={field} className="text-sm">
                      <span className="font-medium text-blue-800 dark:text-blue-300">
                        {field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:
                      </span>
                      <span className="text-blue-700 dark:text-blue-400 ml-1">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Issues and Recommendations */}
            {(result.issues.length > 0 || result.recommendations.length > 0) && (
              <div className="space-y-3">
                {result.issues.length > 0 && (
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                    <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                      Issues Detected
                    </h4>
                    <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                      {result.issues.map((issue, index) => (
                        <li key={index} className="flex items-start">
                          <FiAlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400 mt-0.5 mr-2 flex-shrink-0" />
                          {issue}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {result.recommendations.length > 0 && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                      Recommendations
                    </h4>
                    <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                      {result.recommendations.map((recommendation, index) => (
                        <li key={index} className="flex items-start">
                          <FiCheckCircle className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 mr-2 flex-shrink-0" />
                          {recommendation}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-3 pt-4">
              <button
                onClick={() => onDocumentRead(result)}
                className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                Use This Result
              </button>
              <button
                onClick={() => {
                  setResult(null);
                  setError(null);
                  setSelectedFile(null);
                  setShowPdfPageSelector(false);
                  setPdfPageNumber(1);
                  setPdfTotalPages(0);
                  if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                  }
                }}
                className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Try Another Document
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 