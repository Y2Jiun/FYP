import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

export interface TrustScoreResult {
  trustScore: number;
  trustBadge: string;
  requiredDocuments: number;
  verifiedDocuments: number;
}

/**
 * Calculate trust score for a property based on verified documents
 * @param propertyId - The property ID to calculate trust score for
 * @returns Promise<TrustScoreResult> - Trust score, badge, and document counts
 */
export async function calculateTrustScore(
  propertyId: string,
): Promise<TrustScoreResult> {
  try {
    // Get all documents for this property
    const documentsQuery = query(
      collection(db, "propertyDocuments"),
      where("propertyId", "==", propertyId),
    );

    const documentsSnapshot = await getDocs(documentsQuery);

    let requiredDocuments = 0;
    let verifiedDocuments = 0;

    // Count required and verified documents
    documentsSnapshot.forEach((doc) => {
      const documentData = doc.data();

      // Check if document is required (default to true if field doesn't exist)
      const isRequired = documentData.isRequired !== false;

      if (isRequired) {
        requiredDocuments++;
        console.log(
          `Required document: ${documentData.documentName} - Status: ${documentData.verificationStatus}`,
        );

        // Check if document is verified
        if (documentData.verificationStatus === "verified") {
          verifiedDocuments++;
          console.log(`✓ Verified document: ${documentData.documentName}`);
        } else {
          console.log(
            `✗ Pending/Rejected document: ${documentData.documentName} - Status: ${documentData.verificationStatus}`,
          );
        }
      } else {
        console.log(
          `Optional document: ${documentData.documentName} - Status: ${documentData.verificationStatus}`,
        );
      }
    });

    console.log(`Total required documents: ${requiredDocuments}`);
    console.log(`Total verified documents: ${verifiedDocuments}`);

    // Calculate trust score percentage
    let trustScore = 0;
    if (requiredDocuments > 0) {
      trustScore = Math.round((verifiedDocuments / requiredDocuments) * 100);
    }

    // Assign badge based on trust score
    let trustBadge = "bronze";
    if (trustScore >= 90) {
      trustBadge = "platinum";
    } else if (trustScore >= 70) {
      trustBadge = "gold";
    } else if (trustScore >= 50) {
      trustBadge = "silver";
    } else {
      trustBadge = "bronze";
    }

    return {
      trustScore,
      trustBadge,
      requiredDocuments,
      verifiedDocuments,
    };
  } catch (error) {
    console.error("Error calculating trust score:", error);
    // Return default values if calculation fails
    return {
      trustScore: 0,
      trustBadge: "bronze",
      requiredDocuments: 0,
      verifiedDocuments: 0,
    };
  }
}

/**
 * Get badge color and icon for display
 * @param badge - The badge level
 * @returns Object with color and icon information
 */
export function getBadgeInfo(badge: string) {
  const badgeInfo = {
    bronze: {
      color: "bg-amber-600",
      textColor: "text-amber-600",
      bgColor: "bg-amber-100",
      icon: "🥉",
      label: "Bronze",
    },
    silver: {
      color: "bg-gray-500",
      textColor: "text-gray-500",
      bgColor: "bg-gray-100",
      icon: "🥈",
      label: "Silver",
    },
    gold: {
      color: "bg-yellow-500",
      textColor: "text-yellow-500",
      bgColor: "bg-yellow-100",
      icon: "🥇",
      label: "Gold",
    },
    platinum: {
      color: "bg-purple-500",
      textColor: "text-purple-500",
      bgColor: "bg-purple-100",
      icon: "💎",
      label: "Platinum",
    },
  };

  return badgeInfo[badge as keyof typeof badgeInfo] || badgeInfo.bronze;
}

/**
 * Get trust score description based on badge
 * @param badge - The badge level
 * @returns Description of what the badge means
 */
export function getTrustScoreDescription(badge: string): string {
  const descriptions = {
    bronze: "Basic verification - Some documents verified",
    silver: "Good verification - Most documents verified",
    gold: "Excellent verification - Almost all documents verified",
    platinum: "Perfect verification - All documents verified",
  };

  return (
    descriptions[badge as keyof typeof descriptions] || descriptions.bronze
  );
}

/**
 * Debug function to check all documents for a property
 * @param propertyId - The property ID to check
 * @returns Promise<void> - Logs detailed information about all documents
 */
export async function debugPropertyDocuments(
  propertyId: string,
): Promise<void> {
  try {
    console.log(`🔍 DEBUGGING DOCUMENTS FOR PROPERTY: ${propertyId}`);
    console.log("=".repeat(50));

    // Get all documents for this property
    const documentsQuery = query(
      collection(db, "propertyDocuments"),
      where("propertyId", "==", propertyId),
    );

    const documentsSnapshot = await getDocs(documentsQuery);

    if (documentsSnapshot.empty) {
      console.log("❌ No documents found for this property");
      return;
    }

    console.log(
      `📄 Found ${documentsSnapshot.size} documents for property ${propertyId}:`,
    );
    console.log("");

    let totalDocuments = 0;
    let requiredDocuments = 0;
    let verifiedDocuments = 0;
    let pendingDocuments = 0;
    let rejectedDocuments = 0;
    let optionalDocuments = 0;

    documentsSnapshot.forEach((doc, index) => {
      const documentData = doc.data();
      totalDocuments++;

      console.log(`📋 Document ${index + 1}:`);
      console.log(`   ID: ${documentData.documentId || doc.id}`);
      console.log(`   Name: ${documentData.documentName}`);
      console.log(`   Type: ${documentData.documentType}`);
      console.log(`   Property ID: ${documentData.propertyId}`);
      console.log(`   Required: ${documentData.isRequired}`);
      console.log(`   Status: ${documentData.verificationStatus}`);
      console.log(`   Uploaded By: ${documentData.uploadedBy}`);
      console.log("");

      // Count by status
      if (documentData.isRequired !== false) {
        requiredDocuments++;
        if (documentData.verificationStatus === "verified") {
          verifiedDocuments++;
        } else if (documentData.verificationStatus === "pending") {
          pendingDocuments++;
        } else if (documentData.verificationStatus === "rejected") {
          rejectedDocuments++;
        }
      } else {
        optionalDocuments++;
      }
    });

    console.log("📊 SUMMARY:");
    console.log(`   Total Documents: ${totalDocuments}`);
    console.log(`   Required Documents: ${requiredDocuments}`);
    console.log(`   Optional Documents: ${optionalDocuments}`);
    console.log(`   Verified: ${verifiedDocuments}`);
    console.log(`   Pending: ${pendingDocuments}`);
    console.log(`   Rejected: ${rejectedDocuments}`);

    if (requiredDocuments > 0) {
      const trustScore = Math.round(
        (verifiedDocuments / requiredDocuments) * 100,
      );
      console.log(
        `   Trust Score: ${trustScore}% (${verifiedDocuments}/${requiredDocuments})`,
      );

      let badge = "bronze";
      if (trustScore >= 90) badge = "platinum";
      else if (trustScore >= 70) badge = "gold";
      else if (trustScore >= 50) badge = "silver";

      console.log(`   Badge: ${badge.toUpperCase()}`);
    } else {
      console.log("   Trust Score: 0% (no required documents)");
    }

    console.log("=".repeat(50));
  } catch (error) {
    console.error("Error debugging property documents:", error);
  }
}

/**
 * Update property's trust score in Firestore
 * @param propertyId - The property ID to update
 * @returns Promise<boolean> - Success status
 */
export async function updatePropertyTrustScore(
  propertyId: string,
): Promise<boolean> {
  try {
    // Calculate trust score
    const trustScoreResult = await calculateTrustScore(propertyId);

    // Update property document with new trust score
    const { doc, updateDoc } = await import("firebase/firestore");
    const propertyRef = doc(db, "properties", propertyId);

    await updateDoc(propertyRef, {
      trustScore: trustScoreResult.trustScore,
      trustBadge: trustScoreResult.trustBadge,
      requiredDocuments: trustScoreResult.requiredDocuments,
      verifiedDocuments: trustScoreResult.verifiedDocuments,
      trustScoreLastUpdated: new Date(),
    });

    console.log(
      `Trust score updated for property ${propertyId}:`,
      trustScoreResult,
    );
    return true;
  } catch (error) {
    console.error("Error updating property trust score:", error);
    return false;
  }
}
