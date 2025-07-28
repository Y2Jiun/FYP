import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  QueryConstraint,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Property } from "@/types/property";

export interface FilterState {
  verificationLevel: string;
  propertyType: string;
  priceRange: { min: number; max: number };
  location: string;
  neighborhood: string;
  zipCode: string;
  amenities: string[];
  dateRange: { start: string; end: string };
  agentVerified: boolean;
  trustScore: { min: number; max: number };
}

export interface SearchResult {
  properties: Property[];
  totalCount: number;
  hasMore: boolean;
}

export class PropertySearchService {
  /**
   * Build Firestore query constraints based on filters
   */
  private static buildQueryConstraints(
    filters: FilterState,
  ): QueryConstraint[] {
    const constraints: QueryConstraint[] = [];

    // Verification Level Filter
    if (filters.verificationLevel !== "ALL") {
      constraints.push(
        where("verificationLevel", "==", filters.verificationLevel),
      );
    }

    // Property Type Filter
    if (filters.propertyType !== "ALL") {
      constraints.push(where("propertyType", "==", filters.propertyType));
    }

    // Price Range Filter
    if (filters.priceRange.min > 0) {
      constraints.push(where("price", ">=", filters.priceRange.min));
    }
    if (filters.priceRange.max < 1000000) {
      constraints.push(where("price", "<=", filters.priceRange.max));
    }

    // Trust Score Filter
    if (filters.trustScore.min > 0) {
      constraints.push(where("trustScore", ">=", filters.trustScore.min));
    }
    if (filters.trustScore.max < 100) {
      constraints.push(where("trustScore", "<=", filters.trustScore.max));
    }

    // Location Filter
    if (filters.location) {
      constraints.push(where("location.city", "==", filters.location));
    }

    // Neighborhood Filter
    if (filters.neighborhood) {
      constraints.push(where("neighborhood", "==", filters.neighborhood));
    }

    // Zip Code Filter
    if (filters.zipCode) {
      constraints.push(where("zipCode", "==", filters.zipCode));
    }

    // Agent Verification Filter
    if (filters.agentVerified) {
      constraints.push(where("agentVerified", "==", true));
    }

    // Date Range Filter (Listed Date)
    if (filters.dateRange.start) {
      const startDate = new Date(filters.dateRange.start);
      constraints.push(where("listedDate", ">=", startDate));
    }
    if (filters.dateRange.end) {
      const endDate = new Date(filters.dateRange.end);
      constraints.push(where("listedDate", "<=", endDate));
    }

    // Default ordering
    constraints.push(orderBy("createdAt", "desc"));

    return constraints;
  }

  /**
   * Apply client-side filters that can't be done in Firestore
   */
  private static applyClientSideFilters(
    properties: Property[],
    filters: FilterState,
  ): Property[] {
    return properties.filter((property) => {
      // Amenities Filter (Firestore doesn't support array-contains-all efficiently)
      if (filters.amenities.length > 0) {
        const hasAllAmenities = filters.amenities.every(
          (amenity) =>
            property.amenities?.includes(amenity) ||
            property.verifiedAmenities?.includes(amenity),
        );
        if (!hasAllAmenities) return false;
      }

      return true;
    });
  }

  /**
   * Search properties with advanced filters
   */
  static async searchProperties(
    filters: FilterState,
    pageSize: number = 20,
    lastDoc?: any,
  ): Promise<SearchResult> {
    try {
      const constraints = this.buildQueryConstraints(filters);

      // Add pagination
      if (lastDoc) {
        constraints.push(limit(pageSize));
      } else {
        constraints.push(limit(pageSize));
      }

      const propertiesRef = collection(db, "properties");
      const q = query(propertiesRef, ...constraints);

      const querySnapshot = await getDocs(q);

      let properties: Property[] = [];
      querySnapshot.forEach((doc) => {
        properties.push({ propertyId: doc.id, ...doc.data() } as Property);
      });

      // Apply client-side filters
      properties = this.applyClientSideFilters(properties, filters);

      const hasMore = querySnapshot.docs.length === pageSize;

      return {
        properties,
        totalCount: properties.length,
        hasMore,
      };
    } catch (error) {
      console.error("Error searching properties:", error);
      throw new Error("Failed to search properties");
    }
  }

  /**
   * Get properties by verification level
   */
  static async getPropertiesByVerificationLevel(
    level: string,
  ): Promise<Property[]> {
    try {
      const propertiesRef = collection(db, "properties");
      const q = query(
        propertiesRef,
        where("verificationLevel", "==", level),
        orderBy("createdAt", "desc"),
      );

      const querySnapshot = await getDocs(q);
      const properties: Property[] = [];

      querySnapshot.forEach((doc) => {
        properties.push({ propertyId: doc.id, ...doc.data() } as Property);
      });

      return properties;
    } catch (error) {
      console.error("Error getting properties by verification level:", error);
      throw new Error("Failed to get properties");
    }
  }

  /**
   * Get properties by trust score range
   */
  static async getPropertiesByTrustScore(
    min: number,
    max: number,
  ): Promise<Property[]> {
    try {
      const propertiesRef = collection(db, "properties");
      const q = query(
        propertiesRef,
        where("trustScore", ">=", min),
        where("trustScore", "<=", max),
        orderBy("trustScore", "desc"),
      );

      const querySnapshot = await getDocs(q);
      const properties: Property[] = [];

      querySnapshot.forEach((doc) => {
        properties.push({ propertyId: doc.id, ...doc.data() } as Property);
      });

      return properties;
    } catch (error) {
      console.error("Error getting properties by trust score:", error);
      throw new Error("Failed to get properties");
    }
  }

  /**
   * Get properties with specific amenities
   */
  static async getPropertiesByAmenities(
    amenities: string[],
  ): Promise<Property[]> {
    try {
      // Note: Firestore doesn't support array-contains-all efficiently
      // This is a simplified version - in production, you might want to use
      // a different approach like Algolia or Elasticsearch
      const propertiesRef = collection(db, "properties");
      const q = query(propertiesRef, orderBy("createdAt", "desc"));

      const querySnapshot = await getDocs(q);
      const properties: Property[] = [];

      querySnapshot.forEach((doc) => {
        properties.push({ propertyId: doc.id, ...doc.data() } as Property);
      });

      // Filter by amenities client-side
      return properties.filter((property) => {
        return amenities.every(
          (amenity) =>
            property.amenities?.includes(amenity) ||
            property.verifiedAmenities?.includes(amenity),
        );
      });
    } catch (error) {
      console.error("Error getting properties by amenities:", error);
      throw new Error("Failed to get properties");
    }
  }

  /**
   * Get verified properties only
   */
  static async getVerifiedProperties(): Promise<Property[]> {
    try {
      const propertiesRef = collection(db, "properties");
      const q = query(
        propertiesRef,
        where("verificationStatus.overall", "==", "verified"),
        orderBy("createdAt", "desc"),
      );

      const querySnapshot = await getDocs(q);
      const properties: Property[] = [];

      querySnapshot.forEach((doc) => {
        properties.push({ propertyId: doc.id, ...doc.data() } as Property);
      });

      return properties;
    } catch (error) {
      console.error("Error getting verified properties:", error);
      throw new Error("Failed to get verified properties");
    }
  }

  /**
   * Get properties by verified agents
   */
  static async getPropertiesByVerifiedAgents(): Promise<Property[]> {
    try {
      const propertiesRef = collection(db, "properties");
      const q = query(
        propertiesRef,
        where("agentVerified", "==", true),
        orderBy("createdAt", "desc"),
      );

      const querySnapshot = await getDocs(q);
      const properties: Property[] = [];

      querySnapshot.forEach((doc) => {
        properties.push({ propertyId: doc.id, ...doc.data() } as Property);
      });

      return properties;
    } catch (error) {
      console.error("Error getting properties by verified agents:", error);
      throw new Error("Failed to get properties");
    }
  }
}
