import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { enhancedDocumentVerification } from "@/utils/aiDocumentVerification";

export async function POST(request) {
  try {
    const { documentId, documentData, documentType, propertyId } =
      await request.json();

    if (!documentId || !documentData || !documentType) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 },
      );
    }

    // Perform AI verification
    const aiResult = await enhancedDocumentVerification(
      documentId,
      documentData,
      documentType,
    );

    // Get property data for context
    let propertyData = null;
    if (propertyId) {
      const propertyRef = doc(db, "properties", propertyId);
      const propertySnap = await getDoc(propertyRef);
      if (propertySnap.exists()) {
        propertyData = propertySnap.data();
      }
    }

    // Update document with AI analysis results
    const documentRef = doc(db, "propertyDocuments", documentId);
    await updateDoc(documentRef, {
      aiAnalysis: {
        authenticity: aiResult.analysis.authenticity,
        completeness: aiResult.analysis.completeness,
        fraudRisk: aiResult.analysis.fraudRisk,
        confidence: aiResult.analysis.confidence,
        verificationStatus: aiResult.analysis.verificationStatus,
        issues: aiResult.analysis.issues,
        recommendations: aiResult.analysis.recommendations,
      },
      fraudDetection: {
        riskLevel: aiResult.fraudDetection.riskLevel,
        riskScore: aiResult.fraudDetection.riskScore,
        fraudIndicators: aiResult.fraudDetection.fraudIndicators,
        recommendations: aiResult.fraudDetection.recommendations,
        requiresManualReview: aiResult.fraudDetection.requiresManualReview,
      },
      finalRecommendation: aiResult.finalRecommendation,
      aiVerifiedAt: serverTimestamp(),
    });

    // Create verification history entry
    await addDoc(collection(db, "verificationHistory"), {
      documentId: documentId,
      propertyId: propertyId,
      action: "ai_verification",
      performedBy: "AI System",
      performedAt: serverTimestamp(),
      details: {
        analysis: aiResult.analysis,
        fraudDetection: aiResult.fraudDetection,
        finalRecommendation: aiResult.finalRecommendation,
      },
      verificationScore: aiResult.analysis.confidence,
    });

    // Send notification to agent if fraud is detected
    if (
      aiResult.fraudDetection.riskLevel === "critical" ||
      aiResult.fraudDetection.riskLevel === "high"
    ) {
      if (propertyData?.agentUID) {
        await addDoc(collection(db, "notification"), {
          notificationID: `AI_${Date.now()}`,
          userID: propertyData.agentUID,
          title: "AI Fraud Detection Alert",
          message: `High fraud risk detected in document ${documentId}. Manual review required.`,
          type: "fraud_alert",
          readBy: {},
          createdAt: serverTimestamp(),
          priority: "high",
        });
      }
    }

    return NextResponse.json({
      success: true,
      result: aiResult,
      message: "AI verification completed successfully",
    });
  } catch (error) {
    console.error("AI Document Verification Error:", error);
    return NextResponse.json(
      { error: "AI verification failed", details: error.message },
      { status: 500 },
    );
  }
}
