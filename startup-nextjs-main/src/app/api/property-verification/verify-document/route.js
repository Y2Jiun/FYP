const { NextResponse } = require("next/server");
const { db } = require("../../../../../server/firebaseAdmin");
const { getOrIncrementCounter } = require("../../../../../server/counterUtils");

export async function POST(req) {
  try {
    const { documentId, status, notes, adminId } = await req.json();

    // Update document status
    await db.collection("propertyDocuments").doc(documentId).update({
      verificationStatus: status,
      verifiedBy: adminId,
      verifiedAt: new Date(),
      verificationNotes: notes,
    });

    // Generate custom history ID
    const historyId = await getOrIncrementCounter(
      "propertyVerificationHistory",
    );

    // Add to verification history
    await db
      .collection("propertyVerificationHistory")
      .doc(historyId)
      .set({
        documentId,
        action: `document_${status}`,
        performedBy: adminId,
        performedAt: new Date(),
        details: { newStatus: status, notes },
      });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("API error in verify-document:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
