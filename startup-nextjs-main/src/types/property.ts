export interface Property {
  propertyId: string;
  title: string;
  description: string;
  price: number;
  location: {
    address: string;
    city: string;
    state: string;
    postalCode: string;
    neighborhood?: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  propertyType:
    | "condo"
    | "house"
    | "apartment"
    | "land"
    | "commercial"
    | "industrial"
    | "residential";
  bedrooms?: number;
  bathrooms?: number;
  size: number; // sq ft
  agentId: string;
  agentName?: string;
  status:
    | "pending_verification"
    | "verified"
    | "rejected"
    | "active"
    | "inactive";
  createdAt: any;
  updatedAt: any;
  verificationStatus: {
    documents: "pending" | "verified" | "rejected";
    details: "pending" | "verified" | "rejected";
    images: "pending" | "verified" | "rejected";
    overall: "pending" | "verified" | "rejected";
  };

  // New fields for advanced filtering
  trustScore: number; // 0-100
  verificationLevel: "BRONZE" | "SILVER" | "GOLD" | "PLATINUM";
  listedDate: any;
  verificationDate?: any;
  amenities: string[]; // ["parking", "gym", "pool", "security", "elevator", "balcony", "garden", "air_conditioning", "heating", "internet", "cable_tv", "laundry", "storage", "pet_friendly", "furnished", "utilities_included"]
  verifiedAmenities: string[]; // Amenities that have been verified
  neighborhood: string;
  zipCode: string;
  agentVerified: boolean;
  agentTrustScore?: number;
  priceHistory?: {
    date: any;
    price: number;
    change: number; // percentage change
  }[];
  marketData?: {
    averagePrice: number;
    priceRanking: number;
    marketTrend: "increasing" | "decreasing" | "stable";
    daysOnMarket: number;
  };
}

export interface PropertyDocument {
  documentId: string;
  propertyId: string;
  documentType:
    | "title_deed"
    | "land_certificate"
    | "building_plan"
    | "survey_plan"
    | "strata_title"
    | "individual_title"
    | "other";
  documentName: string;
  fileName: string;
  fileUrl: string;
  fileSize: number; // bytes
  uploadedBy: string; // agent ID
  uploadedAt: any;
  verificationStatus: "pending" | "verified" | "rejected";
  verifiedBy?: string; // admin ID
  verifiedAt?: any;
  verificationNotes?: string;
  isAuthentic?: boolean;
  documentHash: string; // for integrity verification
  expiryDate?: any; // if applicable
  documentNumber?: string;
}

export interface PropertyImage {
  imageId: string;
  propertyId: string;
  imageType:
    | "exterior"
    | "interior"
    | "floor_plan"
    | "location"
    | "amenities"
    | "other";
  imageName: string;
  imageUrl: string;
  thumbnailUrl: string;
  uploadedBy: string;
  uploadedAt: any;
  verificationStatus: "pending" | "verified" | "rejected";
  verifiedBy?: string;
  verifiedAt?: any;
  isAuthentic?: boolean;
  imageHash: string;
  metadata: {
    width: number;
    height: number;
    fileSize: number;
    cameraInfo?: string;
    location?: {
      lat: number;
      lng: number;
    };
  };
}

export interface VerificationHistory {
  historyId: string;
  propertyId: string;
  action:
    | "document_uploaded"
    | "document_verified"
    | "document_rejected"
    | "property_verified"
    | "property_rejected"
    | "image_uploaded"
    | "image_verified"
    | "image_rejected";
  performedBy: string; // agent or admin ID
  performedAt: any;
  details: {
    documentType?: string;
    documentId?: string;
    imageType?: string;
    imageId?: string;
    previousStatus?: string;
    newStatus?: string;
    notes?: string;
  };
  adminNotes?: string;
  verificationScore?: number; // 0-100
  automatedChecks?: {
    documentAuthenticity?: boolean;
    dataConsistency?: boolean;
    completenessCheck?: boolean;
    imageAuthenticity?: boolean;
  };
}

export interface PropertyVerificationStats {
  totalProperties: number;
  pendingVerification: number;
  verifiedProperties: number;
  rejectedProperties: number;
  totalDocuments: number;
  pendingDocuments: number;
  verifiedDocuments: number;
  rejectedDocuments: number;
  averageVerificationTime: number; // in hours
  verificationSuccessRate: number; // percentage
}

export interface DocumentType {
  id: string;
  name: string;
  description: string;
  isRequired: boolean;
  maxFileSize: number; // in MB
  allowedExtensions: string[];
  verificationCriteria: string[];
}

export interface VerificationCriteria {
  id: string;
  name: string;
  description: string;
  category: "document" | "property" | "image";
  weight: number; // 0-100
  isAutomated: boolean;
  manualCheckRequired: boolean;
}

export interface AgentVerificationProfile {
  agentId: string;
  agentName: string;
  totalProperties: number;
  verifiedProperties: number;
  rejectedProperties: number;
  averageVerificationTime: number;
  verificationSuccessRate: number;
  lastVerificationDate?: any;
  complianceScore: number; // 0-100
  documentsSubmitted: number;
  documentsVerified: number;
  documentsRejected: number;
}
