import { Property } from "@/types/property";

export interface TrustScoreFactors {
  documentVerification: number; // 0-100
  imageVerification: number; // 0-100
  agentVerification: number; // 0-100
  propertyDetailsVerification: number; // 0-100
  legalCompliance: number; // 0-100
  financialTransparency: number; // 0-100
  neighborhoodData: number; // 0-100
  marketData: number; // 0-100
}

export interface VerificationBadges {
  ownership: boolean;
  legal: boolean;
  financial: boolean;
  structural: boolean;
  agent: boolean;
  neighborhood: boolean;
  market: boolean;
}

export class TrustScoreCalculator {
  /**
   * Calculate trust score based on verification factors
   */
  static calculateTrustScore(factors: TrustScoreFactors): number {
    const weights = {
      documentVerification: 0.25,
      imageVerification: 0.15,
      agentVerification: 0.2,
      propertyDetailsVerification: 0.15,
      legalCompliance: 0.1,
      financialTransparency: 0.05,
      neighborhoodData: 0.05,
      marketData: 0.05,
    };

    let totalScore = 0;
    let totalWeight = 0;

    Object.entries(factors).forEach(([factor, score]) => {
      const weight = weights[factor as keyof TrustScoreFactors];
      totalScore += score * weight;
      totalWeight += weight;
    });

    return Math.round(totalScore / totalWeight);
  }

  /**
   * Determine verification level based on trust score
   */
  static getVerificationLevel(
    trustScore: number,
  ): "BRONZE" | "SILVER" | "GOLD" | "PLATINUM" {
    if (trustScore >= 90) return "PLATINUM";
    if (trustScore >= 75) return "GOLD";
    if (trustScore >= 50) return "SILVER";
    return "BRONZE";
  }

  /**
   * Calculate trust score from property data
   */
  static calculateFromProperty(property: Property): {
    trustScore: number;
    verificationLevel: "BRONZE" | "SILVER" | "GOLD" | "PLATINUM";
    badges: VerificationBadges;
  } {
    const factors: TrustScoreFactors = {
      documentVerification: this.calculateDocumentVerification(property),
      imageVerification: this.calculateImageVerification(property),
      agentVerification: this.calculateAgentVerification(property),
      propertyDetailsVerification:
        this.calculatePropertyDetailsVerification(property),
      legalCompliance: this.calculateLegalCompliance(property),
      financialTransparency: this.calculateFinancialTransparency(property),
      neighborhoodData: this.calculateNeighborhoodData(property),
      marketData: this.calculateMarketData(property),
    };

    const trustScore = this.calculateTrustScore(factors);
    const verificationLevel = this.getVerificationLevel(trustScore);
    const badges = this.calculateBadges(property);

    return {
      trustScore,
      verificationLevel,
      badges,
    };
  }

  /**
   * Calculate document verification score
   */
  private static calculateDocumentVerification(property: Property): number {
    const verificationStatus = property.verificationStatus;

    let score = 0;
    if (verificationStatus.documents === "verified") score += 50;
    else if (verificationStatus.documents === "pending") score += 25;

    // Additional points for having multiple document types
    const documentTypes = [
      "title_deed",
      "land_certificate",
      "building_plan",
      "survey_plan",
    ];
    const hasDocuments = documentTypes.length; // This would be calculated from actual documents
    score += Math.min(hasDocuments * 10, 50); // Max 50 points for document variety

    return Math.min(score, 100);
  }

  /**
   * Calculate image verification score
   */
  private static calculateImageVerification(property: Property): number {
    const verificationStatus = property.verificationStatus;

    let score = 0;
    if (verificationStatus.images === "verified") score += 60;
    else if (verificationStatus.images === "pending") score += 30;

    // Additional points for having multiple image types
    const imageTypes = ["exterior", "interior", "floor_plan", "location"];
    const hasImages = imageTypes.length; // This would be calculated from actual images
    score += Math.min(hasImages * 10, 40); // Max 40 points for image variety

    return Math.min(score, 100);
  }

  /**
   * Calculate agent verification score
   */
  private static calculateAgentVerification(property: Property): number {
    let score = 0;

    if (property.agentVerified) score += 60;
    if (property.agentTrustScore)
      score += Math.min(property.agentTrustScore, 40);

    return Math.min(score, 100);
  }

  /**
   * Calculate property details verification score
   */
  private static calculatePropertyDetailsVerification(
    property: Property,
  ): number {
    const verificationStatus = property.verificationStatus;

    let score = 0;
    if (verificationStatus.details === "verified") score += 60;
    else if (verificationStatus.details === "pending") score += 30;

    // Additional points for completeness
    const requiredFields = [
      "title",
      "description",
      "price",
      "location",
      "propertyType",
      "size",
    ];
    const hasRequiredFields = requiredFields.filter(
      (field) =>
        property[field as keyof Property] !== undefined &&
        property[field as keyof Property] !== "",
    ).length;

    score += Math.min((hasRequiredFields / requiredFields.length) * 40, 40);

    return Math.min(score, 100);
  }

  /**
   * Calculate legal compliance score
   */
  private static calculateLegalCompliance(property: Property): number {
    // This would be calculated based on legal document verification
    // For now, return a base score
    return 70; // Placeholder
  }

  /**
   * Calculate financial transparency score
   */
  private static calculateFinancialTransparency(property: Property): number {
    // This would be calculated based on financial document verification
    // For now, return a base score
    return 60; // Placeholder
  }

  /**
   * Calculate neighborhood data score
   */
  private static calculateNeighborhoodData(property: Property): number {
    let score = 0;

    if (property.neighborhood) score += 30;
    if (property.zipCode) score += 20;
    if (property.location?.coordinates) score += 25;

    // Additional points for having neighborhood information
    // This would be calculated from actual neighborhood data
    score += 25; // Placeholder for neighborhood data

    return Math.min(score, 100);
  }

  /**
   * Calculate market data score
   */
  private static calculateMarketData(property: Property): number {
    let score = 0;

    if (property.marketData) {
      if (property.marketData.averagePrice) score += 25;
      if (property.marketData.priceRanking) score += 25;
      if (property.marketData.marketTrend) score += 25;
      if (property.marketData.daysOnMarket) score += 25;
    }

    return Math.min(score, 100);
  }

  /**
   * Calculate verification badges
   */
  private static calculateBadges(property: Property): VerificationBadges {
    return {
      ownership: property.verificationStatus.documents === "verified",
      legal: property.verificationStatus.documents === "verified", // Simplified
      financial: property.verificationStatus.documents === "verified", // Simplified
      structural: property.verificationStatus.images === "verified",
      agent: property.agentVerified || false,
      neighborhood: !!property.neighborhood,
      market: !!property.marketData,
    };
  }

  /**
   * Update property with calculated trust score and verification level
   */
  static async updatePropertyTrustScore(
    propertyId: string,
    property: Property,
  ): Promise<{
    trustScore: number;
    verificationLevel: "BRONZE" | "SILVER" | "GOLD" | "PLATINUM";
    badges: VerificationBadges;
  }> {
    const result = this.calculateFromProperty(property);

    // Here you would update the property in Firestore
    // For now, just return the calculated values
    return result;
  }
}
