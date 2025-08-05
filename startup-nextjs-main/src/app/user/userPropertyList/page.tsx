"use client";
import React, { useEffect, useState } from "react";
import UserHeader from "@/components/User/userHeader";
import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  query,
  where,
  setDoc,
  doc,
  serverTimestamp,
  getDoc,
} from "firebase/firestore";
import Link from "next/link";
import { FlagIcon } from "@heroicons/react/24/outline";
import {
  FaSearch,
  FaSpinner,
  FaFilter,
  FaTimes,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";
import { PropertySearchService, FilterState } from "@/utils/propertySearch";
import AdvancedSearchFilters from "@/components/Property/AdvancedSearchFilters";
import { Property as SearchProperty } from "@/types/property";
import { TrustScoreBadge } from "@/components/TrustScore";

interface Property {
  id: string;
  title: string;
  address: string;
  price: number;
  type: string;
  status: "pending" | "verified" | "rejected";
  image1?: string;
  agentId?: string;
  agentUID?: string;
  ownerId?: string; // Added ownerId to distinguish user's own properties
  trustScore?: number;
  trustBadge?: string;
}

function getStatusColor(status: string) {
  switch (status) {
    case "verified":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
    case "pending":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
    case "rejected":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
  }
}

const REPORT_REASONS = [
  "Fraud",
  "Inappropriate Content",
  "Incorrect Info",
  "Other",
];

export default function UserPropertyList() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [searchProperties, setSearchProperties] = useState<SearchProperty[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportProperty, setReportProperty] = useState<Property | null>(null);
  const [reportReason, setReportReason] = useState("");
  const [reportDesc, setReportDesc] = useState("");
  const [reportLoading, setReportLoading] = useState(false);
  const [reportSuccess, setReportSuccess] = useState("");

  // Search functionality states
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [currentFilters, setCurrentFilters] = useState<FilterState>({
    verificationLevel: "",
    propertyType: "",
    minPrice: 0,
    maxPrice: 0,
    location: "",
    amenities: [],
    minDate: "",
    maxDate: "",
    agentVerified: false,
    minTrustScore: 0,
    maxTrustScore: 100,
  });
  const [searchError, setSearchError] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setUserId(localStorage.getItem("userID"));
    }
  }, []);

  useEffect(() => {
    if (!userId) return;
    if (!isSearchMode) {
      fetchAllProperties();
    }
  }, [userId, isSearchMode]);

  const fetchAllProperties = async () => {
    setLoading(true);
    try {
      // Fetch only verified properties for users
      const q = query(
        collection(db, "properties"),
        where("status", "==", "verified"),
      );
      const querySnapshot = await getDocs(q);
      const propertyList: Property[] = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: data.propertyId || doc.id,
          title: data.title || "Untitled Property",
          address: data.address || "-",
          price: data.price || 0,
          type: data.propertyType || "-",
          status: data.status || "pending",
          image1: data.image1 || "",
          agentId: data.agentId || "",
          agentUID: data.agentUID || "",
          ownerId: data.ownerId || "",
          trustScore: data.trustScore || 0,
          trustBadge: data.trustBadge || "bronze",
        };
      });

      console.log(`Found ${propertyList.length} verified properties`);
      setProperties(propertyList);
    } catch (error) {
      console.error("Error fetching properties:", error);
    } finally {
      setLoading(false);
    }
  };

  const searchAllProperties = async () => {
    setSearchLoading(true);
    setSearchError("");
    try {
      const result =
        await PropertySearchService.searchProperties(currentFilters);
      setSearchProperties(result.properties);
    } catch (err) {
      setSearchError("Failed to search properties. Please try again.");
      console.error("Search error:", err);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleFiltersChange = (filters: FilterState) => {
    setCurrentFilters(filters);
  };

  const handleSearch = () => {
    searchAllProperties();
  };

  const handleReset = () => {
    const resetFilters: FilterState = {
      verificationLevel: "",
      propertyType: "",
      minPrice: 0,
      maxPrice: 0,
      location: "",
      amenities: [],
      minDate: "",
      maxDate: "",
      agentVerified: false,
      minTrustScore: 0,
      maxTrustScore: 100,
    };
    setCurrentFilters(resetFilters);
    setSearchProperties([]);
  };

  const getVerificationBadgeColor = (level: string) => {
    switch (level) {
      case "PLATINUM":
        return "bg-purple-100 text-purple-800";
      case "GOLD":
        return "bg-yellow-100 text-yellow-800";
      case "SILVER":
        return "bg-gray-100 text-gray-800";
      case "BRONZE":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-MY", {
      style: "currency",
      currency: "MYR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleReport = (property: Property) => {
    setReportProperty(property);
    setShowReportModal(true);
  };

  const handleSubmitReport = async () => {
    if (!reportProperty || !reportReason) return;

    setReportLoading(true);
    try {
      const reportData = {
        propertyId: reportProperty.id,
        propertyTitle: reportProperty.title,
        reason: reportReason,
        description: reportDesc,
        reportedBy: userId,
        reportedAt: serverTimestamp(),
        status: "pending",
      };

      await setDoc(doc(collection(db, "reports")), reportData);

      // If reporting an agent's property, potentially ban the agent
      if (reportProperty.agentId) {
        const agentDoc = await getDoc(doc(db, "users", reportProperty.agentId));
        if (agentDoc.exists()) {
          const agentData = agentDoc.data();
          const reportCount = (agentData.reportCount || 0) + 1;

          if (reportCount >= 3) {
            await setDoc(
              doc(db, "users", reportProperty.agentId),
              { banned: true },
              { merge: true },
            );
          }
        }
      }

      setReportSuccess("Report submitted successfully!");
      setTimeout(() => {
        setShowReportModal(false);
        setReportSuccess("");
      }, 1500);
    } catch (err) {
      console.error("Report submit error:", err);
      setReportSuccess("Failed to submit report. Try again.");
    } finally {
      setReportLoading(false);
    }
  };

  return (
    <>
      <UserHeader />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="mx-auto max-w-6xl">
            {/* Header with Mode Toggle */}
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white">
                  {isSearchMode ? "Property Search" : "Properties"}
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  {isSearchMode
                    ? "Search and discover properties with advanced filters"
                    : "Browse all available properties"}
                </p>
                {!isSearchMode && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Showing {properties.length} properties
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setIsSearchMode(!isSearchMode);
                    setSearchProperties([]);
                    setSearchError("");
                  }}
                  className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
                >
                  {isSearchMode ? <FaEyeSlash /> : <FaEye />}
                  {isSearchMode ? "Browse Properties" : "Search Properties"}
                </button>
              </div>
            </div>

            {/* Search Controls (only in search mode) */}
            {isSearchMode && (
              <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <div className="flex gap-4">
                  <button
                    onClick={() => setFiltersOpen(!filtersOpen)}
                    className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
                  >
                    {filtersOpen ? <FaTimes /> : <FaFilter />}
                    {filtersOpen ? "Hide Filters" : "Show Filters"}
                  </button>
                  <button
                    onClick={handleSearch}
                    disabled={searchLoading}
                    className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-white transition-colors hover:bg-green-700 disabled:opacity-50"
                  >
                    {searchLoading ? (
                      <FaSpinner className="animate-spin" />
                    ) : (
                      <FaSearch />
                    )}
                    {searchLoading ? "Searching..." : "Search"}
                  </button>
                  <button
                    onClick={handleReset}
                    className="rounded-lg bg-gray-600 px-4 py-2 text-white transition-colors hover:bg-gray-700"
                  >
                    Reset
                  </button>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {searchProperties.length > 0 &&
                    `${searchProperties.length} properties found`}
                </div>
              </div>
            )}

            {/* Advanced Filters (only in search mode) */}
            {isSearchMode && (
              <AdvancedSearchFilters
                onFiltersChange={handleFiltersChange}
                onSearch={handleSearch}
                onReset={handleReset}
                isOpen={filtersOpen}
                onToggle={() => setFiltersOpen(!filtersOpen)}
              />
            )}

            {/* Error Message */}
            {searchError && (
              <div className="mb-6 rounded-lg border border-red-400 bg-red-100 p-4 text-red-700">
                {searchError}
              </div>
            )}

            {/* Loading State */}
            {loading || searchLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-blue-600"></div>
                <span className="ml-4 text-gray-600 dark:text-gray-300">
                  {isSearchMode
                    ? "Searching properties..."
                    : "Loading properties..."}
                </span>
              </div>
            ) : (
              /* Property Grid */
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3">
                {/* All Properties */}
                {!isSearchMode &&
                  properties.map((property) => (
                    <div
                      key={property.id}
                      className="relative rounded-xl bg-white p-6 shadow dark:bg-gray-800"
                    >
                      {/* Report Icon */}
                      <button
                        className="absolute top-4 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 border-red-400 bg-white shadow-lg transition-all duration-200 hover:bg-red-100"
                        title="Report this property"
                        onClick={() => handleReport(property)}
                      >
                        <FlagIcon className="h-6 w-6 text-red-500" />
                      </button>

                      {/* My Property Badge */}
                      {property.ownerId === userId && (
                        <div className="absolute top-4 left-4 z-10">
                          <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                            My Property
                          </span>
                        </div>
                      )}

                      <div>
                        <img
                          src={
                            property.image1 ||
                            "/images/property-placeholder.png"
                          }
                          alt={property.title}
                          className="mb-4 h-40 w-full rounded-lg object-cover"
                        />
                        <h2 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
                          {property.title}
                        </h2>
                        <p className="mb-1 text-gray-600 dark:text-gray-300">
                          {property.address}
                        </p>
                        <div className="mb-2 flex flex-wrap gap-2">
                          <span className="inline-block rounded bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                            {property.type}
                          </span>
                          <span className="inline-block rounded bg-green-100 px-3 py-1 text-xs font-semibold text-green-800 dark:bg-green-900 dark:text-green-200">
                            RM {property.price?.toLocaleString()}
                          </span>
                          <span
                            className={`inline-block rounded px-3 py-1 text-xs font-semibold ${getStatusColor(property.status)}`}
                          >
                            {property.status}
                          </span>
                        </div>
                        {/* Trust Score Badge */}
                        <div className="mb-2">
                          <TrustScoreBadge
                            trustScore={property.trustScore || 0}
                            trustBadge={property.trustBadge || "bronze"}
                            showScore={true}
                            showDescription={false}
                            size="sm"
                          />
                        </div>
                        {/* View Details Button */}
                        <div className="mt-4">
                          <Link
                            href={`/property/${property.id}`}
                            className="inline-block w-full rounded-lg bg-blue-600 px-4 py-2 text-center text-sm font-medium text-white transition-colors hover:bg-blue-700"
                          >
                            View Details
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}

                {/* Search Results */}
                {isSearchMode &&
                  searchProperties.map((property) => (
                    <div
                      key={property.propertyId}
                      className="overflow-hidden rounded-lg bg-white shadow-md transition-shadow hover:shadow-lg dark:bg-gray-800"
                    >
                      {/* Property Image */}
                      <div className="relative h-48 bg-gray-200">
                        {property.image1 ? (
                          <img
                            src={property.image1}
                            alt={property.title}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-gray-400">
                            No Image
                          </div>
                        )}
                        {/* Verification Badge */}
                        {property.verificationLevel && (
                          <div className="absolute top-2 left-2">
                            <span
                              className={`rounded-full px-2 py-1 text-xs font-semibold ${getVerificationBadgeColor(
                                property.verificationLevel,
                              )}`}
                            >
                              {property.verificationLevel}
                            </span>
                          </div>
                        )}
                        {/* Trust Score Badge */}
                        <div className="absolute top-2 right-2">
                          <TrustScoreBadge
                            trustScore={property.trustScore || 0}
                            trustBadge={property.trustBadge || "bronze"}
                            showScore={true}
                            showDescription={false}
                            size="sm"
                          />
                        </div>
                      </div>

                      {/* Property Details */}
                      <div className="p-4">
                        <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                          {property.title}
                        </h3>
                        <p className="mb-2 text-sm text-gray-600 dark:text-gray-300">
                          {property.location?.address ||
                            "Address not available"}
                        </p>
                        <p className="mb-3 text-xl font-bold text-green-600">
                          {formatPrice(property.price)}
                        </p>
                        <div className="mb-3 flex items-center justify-between text-sm text-gray-500">
                          <span className="capitalize">
                            {property.propertyType}
                          </span>
                          <span>{property.bedrooms || 0} beds</span>
                          <span>{property.bathrooms || 0} baths</span>
                        </div>

                        {/* Amenities */}
                        {property.amenities &&
                          property.amenities.length > 0 && (
                            <div className="mb-3">
                              <div className="flex flex-wrap gap-1">
                                {property.amenities
                                  .slice(0, 3)
                                  .map((amenity, index) => (
                                    <span
                                      key={index}
                                      className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-600"
                                    >
                                      {amenity}
                                    </span>
                                  ))}
                                {property.amenities.length > 3 && (
                                  <span className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-600">
                                    +{property.amenities.length - 3} more
                                  </span>
                                )}
                              </div>
                            </div>
                          )}

                        {/* Agent Info */}
                        {property.agentVerified && (
                          <div className="flex items-center gap-2 text-sm text-green-600">
                            <span className="h-2 w-2 rounded-full bg-green-500"></span>
                            Verified Agent
                          </div>
                        )}

                        {/* View Details Button */}
                        <div className="mt-4">
                          <Link
                            href={`/property/${property.propertyId}`}
                            className="inline-block w-full rounded-lg bg-blue-600 px-4 py-2 text-center text-sm font-medium text-white transition-colors hover:bg-blue-700"
                          >
                            View Details
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}

                {/* No Results Message */}
                {isSearchMode &&
                  searchProperties.length === 0 &&
                  !searchLoading && (
                    <div className="col-span-full py-12 text-center">
                      <FaSearch className="mx-auto mb-4 text-6xl text-gray-300" />
                      <h3 className="mb-2 text-xl font-semibold text-gray-600 dark:text-gray-400">
                        No properties found
                      </h3>
                      <p className="text-gray-500 dark:text-gray-500">
                        Try adjusting your search filters or browse all
                        properties
                      </p>
                    </div>
                  )}
              </div>
            )}

            {/* Report Modal */}
            {showReportModal && (
              <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
                <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
                  <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                    Report Property
                  </h3>
                  <div className="mb-4">
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Reason
                    </label>
                    <select
                      className="w-full rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      value={reportReason}
                      onChange={(e) => setReportReason(e.target.value)}
                    >
                      <option value="">Select a reason</option>
                      {REPORT_REASONS.map((reason) => (
                        <option key={reason} value={reason}>
                          {reason}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-4">
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Description (optional)
                    </label>
                    <textarea
                      className="w-full rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      rows={3}
                      value={reportDesc}
                      onChange={(e) => setReportDesc(e.target.value)}
                      placeholder="Describe the issue..."
                    />
                  </div>
                  {reportSuccess && (
                    <div className="mb-2 text-green-600 dark:text-green-400">
                      {reportSuccess}
                    </div>
                  )}
                  <div className="flex justify-end gap-2">
                    <button
                      className="rounded bg-gray-200 px-4 py-2 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                      onClick={() => setShowReportModal(false)}
                      disabled={reportLoading}
                    >
                      Cancel
                    </button>
                    <button
                      className="rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600 disabled:opacity-50"
                      onClick={handleSubmitReport}
                      disabled={reportLoading || !reportReason}
                    >
                      {reportLoading ? "Submitting..." : "Submit Report"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
