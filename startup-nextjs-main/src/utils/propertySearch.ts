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

    // Only add basic constraints that we know exist in the data
    // More complex filtering will be done client-side

    // Property Type Filter (only if it's not ALL)
    if (filters.propertyType !== "ALL") {
      constraints.push(where("propertyType", "==", filters.propertyType));
    }

    // Price Range Filter (only if min price is set)
    if (filters.minPrice > 0) {
      constraints.push(where("price", ">=", filters.minPrice));
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
      // Verification Level Filter (using trustBadge field)
      if (filters.verificationLevel !== "ALL") {
        const propertyBadge = property.trustBadge?.toUpperCase() || "BRONZE";
        if (propertyBadge !== filters.verificationLevel) {
          return false;
        }
      }

      // Price Range Filter (client-side for max price)
      if (filters.maxPrice < 1000000 && property.price > filters.maxPrice) {
        return false;
      }

      // Trust Score Filter (client-side)
      if (
        filters.minTrustScore > 0 &&
        (property.trustScore || 0) < filters.minTrustScore
      ) {
        return false;
      }
      if (
        filters.maxTrustScore < 100 &&
        (property.trustScore || 0) > filters.maxTrustScore
      ) {
        return false;
      }

      // Location Filter (client-side)
      if (filters.location && property.address) {
        const addressLower = property.address.toLowerCase();
        const locationLower = filters.location.toLowerCase();
        if (!addressLower.includes(locationLower)) {
          return false;
        }
      }

      // Neighborhood Filter (client-side)
      if (filters.neighborhood && property.address) {
        const addressLower = property.address.toLowerCase();
        const neighborhoodLower = filters.neighborhood.toLowerCase();
        if (!addressLower.includes(neighborhoodLower)) {
          return false;
        }
      }

      // Zip Code Filter (client-side)
      if (filters.zipCode && property.postcode) {
        const propertyPostcode = property.postcode.toString();
        if (propertyPostcode !== filters.zipCode) {
          return false;
        }
      }

      // Date Range Filter (client-side)
      if (filters.minDate && property.createdAt) {
        const propertyDate = new Date(property.createdAt);
        const minDate = new Date(filters.minDate);
        if (propertyDate < minDate) {
          return false;
        }
      }
      if (filters.maxDate && property.createdAt) {
        const propertyDate = new Date(property.createdAt);
        const maxDate = new Date(filters.maxDate);
        if (propertyDate > maxDate) {
          return false;
        }
      }

      // Amenities Filter (client-side)
      if (filters.amenities.length > 0) {
        const hasAllAmenities = filters.amenities.every(
          (amenity) =>
            property.amenities?.includes(amenity) ||
            property.verifiedAmenities?.includes(amenity),
        );
        if (!hasAllAmenities) return false;
      }

      // Agent Verification Filter (client-side check)
      if (filters.agentVerified) {
        // For now, we'll consider all agents as verified since we don't have an agent verification field
        // In a real implementation, you'd check against a verified agents list
        if (!property.agentId) {
          return false;
        }
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
