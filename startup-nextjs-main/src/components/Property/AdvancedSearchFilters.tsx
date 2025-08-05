"use client";
import React, { useState, useEffect } from "react";
import {
  FaFilter,
  FaTimes,
  FaSearch,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaUserCheck,
} from "react-icons/fa";

interface FilterState {
  verificationLevel: string;
  propertyType: string;
  minPrice: number;
  maxPrice: number;
  location: string;
  neighborhood: string;
  zipCode: string;
  amenities: string[];
  minDate: string;
  maxDate: string;
  agentVerified: boolean;
  minTrustScore: number;
  maxTrustScore: number;
}

interface AdvancedSearchFiltersProps {
  onFiltersChange: (filters: FilterState) => void;
  onSearch: () => void;
  onReset: () => void;
  isOpen: boolean;
  onToggle: () => void;
}

const AMENITIES_OPTIONS = [
  { value: "parking", label: "Parking" },
  { value: "gym", label: "Gym" },
  { value: "pool", label: "Pool" },
  { value: "security", label: "Security" },
  { value: "elevator", label: "Elevator" },
  { value: "balcony", label: "Balcony" },
  { value: "garden", label: "Garden" },
  { value: "air_conditioning", label: "Air Conditioning" },
  { value: "heating", label: "Heating" },
  { value: "internet", label: "Internet" },
  { value: "cable_tv", label: "Cable TV" },
  { value: "laundry", label: "Laundry" },
  { value: "storage", label: "Storage" },
  { value: "pet_friendly", label: "Pet Friendly" },
  { value: "furnished", label: "Furnished" },
  { value: "utilities_included", label: "Utilities Included" },
];

const PROPERTY_TYPES = [
  { value: "ALL", label: "All Types" },
  { value: "residential", label: "Residential" },
  { value: "condo", label: "Condo" },
  { value: "house", label: "House" },
  { value: "apartment", label: "Apartment" },
  { value: "land", label: "Land" },
  { value: "commercial", label: "Commercial" },
  { value: "industrial", label: "Industrial" },
];

const VERIFICATION_LEVELS = [
  { value: "ALL", label: "All Levels" },
  { value: "PLATINUM", label: "Platinum" },
  { value: "GOLD", label: "Gold" },
  { value: "SILVER", label: "Silver" },
  { value: "BRONZE", label: "Bronze" },
];

export default function AdvancedSearchFilters({
  onFiltersChange,
  onSearch,
  onReset,
  isOpen,
  onToggle,
}: AdvancedSearchFiltersProps) {
  const [filters, setFilters] = useState<FilterState>({
    verificationLevel: "ALL",
    propertyType: "ALL",
    minPrice: 0,
    maxPrice: 1000000,
    location: "",
    neighborhood: "",
    zipCode: "",
    amenities: [],
    minDate: "",
    maxDate: "",
    agentVerified: false,
    minTrustScore: 0,
    maxTrustScore: 100,
  });

  const [priceInputs, setPriceInputs] = useState({
    min: "",
    max: "",
  });

  const [trustScoreInputs, setTrustScoreInputs] = useState({
    min: "",
    max: "",
  });

  // Update filters when inputs change
  useEffect(() => {
    onFiltersChange(filters);
  }, [filters, onFiltersChange]);

  const handleFilterChange = (key: keyof FilterState, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handlePriceChange = (type: "min" | "max", value: string) => {
    setPriceInputs((prev) => ({ ...prev, [type]: value }));
    const numValue = value === "" ? 0 : parseInt(value);
    setFilters((prev) => ({
      ...prev,
      [type === "min" ? "minPrice" : "maxPrice"]: numValue,
    }));
  };

  const handleTrustScoreChange = (type: "min" | "max", value: string) => {
    setTrustScoreInputs((prev) => ({ ...prev, [type]: value }));
    const numValue = value === "" ? 0 : parseInt(value);
    setFilters((prev) => ({
      ...prev,
      [type === "min" ? "minTrustScore" : "maxTrustScore"]: numValue,
    }));
  };

  const handleAmenityToggle = (amenity: string) => {
    setFilters((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
    }));
  };

  const handleReset = () => {
    setFilters({
      verificationLevel: "ALL",
      propertyType: "ALL",
      minPrice: 0,
      maxPrice: 1000000,
      location: "",
      neighborhood: "",
      zipCode: "",
      amenities: [],
      minDate: "",
      maxDate: "",
      agentVerified: false,
      minTrustScore: 0,
      maxTrustScore: 100,
    });
    setPriceInputs({ min: "", max: "" });
    setTrustScoreInputs({ min: "", max: "" });
    onReset();
  };

  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
      >
        <FaFilter />
        Advanced Filters
      </button>
    );
  }

  return (
    <div className="rounded-lg border border-gray-600 bg-gray-800 p-6 shadow-lg">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-lg font-semibold text-white">
          <FaFilter />
          Advanced Search Filters
        </h3>
        <button onClick={onToggle} className="text-gray-400 hover:text-white">
          <FaTimes size={20} />
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Verification Level Filter */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-300">
            Verification Level
          </label>
          <select
            value={filters.verificationLevel}
            onChange={(e) =>
              handleFilterChange("verificationLevel", e.target.value)
            }
            className="w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
          >
            {VERIFICATION_LEVELS.map((level) => (
              <option key={level.value} value={level.value}>
                {level.label}
              </option>
            ))}
          </select>
        </div>

        {/* Property Type Filter */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-300">
            Property Type
          </label>
          <select
            value={filters.propertyType}
            onChange={(e) => handleFilterChange("propertyType", e.target.value)}
            className="w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
          >
            {PROPERTY_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        {/* Trust Score Range */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-300">
            Trust Score Range
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Min"
              value={trustScoreInputs.min}
              onChange={(e) => handleTrustScoreChange("min", e.target.value)}
              className="w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
              min="0"
              max="100"
            />
            <input
              type="number"
              placeholder="Max"
              value={trustScoreInputs.max}
              onChange={(e) => handleTrustScoreChange("max", e.target.value)}
              className="w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
              min="0"
              max="100"
            />
          </div>
        </div>

        {/* Price Range */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-300">
            Price Range
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Min Price"
              value={priceInputs.min}
              onChange={(e) => handlePriceChange("min", e.target.value)}
              className="w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
            />
            <input
              type="number"
              placeholder="Max Price"
              value={priceInputs.max}
              onChange={(e) => handlePriceChange("max", e.target.value)}
              className="w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Location */}
        <div>
          <label className="mb-2 block flex items-center gap-1 text-sm font-medium text-gray-300">
            <FaMapMarkerAlt />
            City/Location
          </label>
          <input
            type="text"
            placeholder="Enter city or location"
            value={filters.location}
            onChange={(e) => handleFilterChange("location", e.target.value)}
            className="w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
          />
        </div>

        {/* Neighborhood */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-300">
            Neighborhood
          </label>
          <input
            type="text"
            placeholder="Enter neighborhood"
            value={filters.neighborhood}
            onChange={(e) => handleFilterChange("neighborhood", e.target.value)}
            className="w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
          />
        </div>

        {/* Zip Code */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-300">
            Zip Code
          </label>
          <input
            type="text"
            placeholder="Enter zip code"
            value={filters.zipCode}
            onChange={(e) => handleFilterChange("zipCode", e.target.value)}
            className="w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
          />
        </div>

        {/* Date Range */}
        <div>
          <label className="mb-2 block flex items-center gap-1 text-sm font-medium text-gray-300">
            <FaCalendarAlt />
            Listed Date Range
          </label>
          <div className="flex gap-2">
            <input
              type="date"
              value={filters.minDate}
              onChange={(e) => handleFilterChange("minDate", e.target.value)}
              className="w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
            />
            <input
              type="date"
              value={filters.maxDate}
              onChange={(e) => handleFilterChange("maxDate", e.target.value)}
              className="w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Agent Verification */}
        <div>
          <label className="mb-2 block flex items-center gap-1 text-sm font-medium text-gray-300">
            <FaUserCheck />
            Agent Verification
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={filters.agentVerified}
              onChange={(e) =>
                handleFilterChange("agentVerified", e.target.checked)
              }
              className="rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-300">
              Verified Agents Only
            </span>
          </label>
        </div>
      </div>

      {/* Amenities Section */}
      <div className="mt-6">
        <label className="mb-3 block text-sm font-medium text-gray-300">
          Amenities
        </label>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
          {AMENITIES_OPTIONS.map((amenity) => (
            <label key={amenity.value} className="flex items-center">
              <input
                type="checkbox"
                checked={filters.amenities.includes(amenity.value)}
                onChange={() => handleAmenityToggle(amenity.value)}
                className="rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-300">
                {amenity.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-6 flex gap-3 border-t border-gray-600 pt-6">
        <button
          onClick={onSearch}
          className="flex items-center gap-2 rounded-md bg-blue-600 px-6 py-2 text-white transition-colors hover:bg-blue-700"
        >
          <FaSearch />
          Apply Filters
        </button>
        <button
          onClick={handleReset}
          className="flex items-center gap-2 rounded-md bg-gray-600 px-6 py-2 text-white transition-colors hover:bg-gray-700"
        >
          <FaTimes />
          Reset Filters
        </button>
      </div>
    </div>
  );
}
