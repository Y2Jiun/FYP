const { NextResponse } = require("next/server");
const { db } = require("../../../../../server/firebaseAdmin");
const { getOrIncrementCounter } = require("../../../../../server/counterUtils");

export async function POST(req) {
  try {
    const { propertyId, status, notes, adminId } = await req.json();

    // Update property status
    await db.collection("properties").doc(propertyId).update({
      status,
      updatedAt: new Date(),
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
        propertyId,
        action: `property_${status}`,
        performedBy: adminId,
        performedAt: new Date(),
        details: { newStatus: status, notes },
      });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("API error in verify-property:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
