const { NextResponse } = require("next/server");
const { db } = require("../../../../../server/firebaseAdmin");
const { getOrIncrementCounter } = require("../../../../../server/counterUtils");

export async function POST(req) {
  try {
    const { documentId, status, notes, adminId } = await req.json();

    // Get document data to find the property and agent
    const documentDoc = await db
      .collection("propertyDocuments")
      .doc(documentId)
      .get();
    if (!documentDoc.exists) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 },
      );
    }

    const documentData = documentDoc.data();
    const propertyId = documentData.propertyId;

    // Get property data to find the agent
    const propertyDoc = await db.collection("properties").doc(propertyId).get();
    if (!propertyDoc.exists) {
      return NextResponse.json(
        { error: "Property not found" },
        { status: 404 },
      );
    }

    const propertyData = propertyDoc.data();
    const agentUID = propertyData.agentUID; // Get the agent's UID

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

    // Create notification for the agent
    if (agentUID) {
      try {
        // Get next notification ID
        const counterRef = db
          .collection("notificationCounter")
          .doc("notification");
        const counterSnap = await counterRef.get();
        let nextId = 1;
        if (counterSnap.exists) {
          const lastID = counterSnap.data().lastID;
          if (lastID && /^NID\d+$/.test(lastID)) {
            nextId = parseInt(lastID.replace("NID", "")) + 1;
          }
        }
        const notifId = `NID${nextId}`;
        await counterRef.set({ lastID: notifId });

        // Create notification data
        const notificationData = {
          NotificationID: notifId,
          title:
            status === "verified" ? "Document Verified" : "Document Rejected",
          content:
            status === "verified"
              ? `Your document "${documentData.documentName}" for property "${propertyData.title}" has been verified successfully.`
              : `Your document "${documentData.documentName}" for property "${propertyData.title}" has been rejected. ${notes ? `Reason: ${notes}` : ""}`,
          type: 0, // 0 = notification
          audience: 2, // 2 = agent audience
          createdBy: "admin",
          createdAt: new Date(),
          agentUID: agentUID,
          propertyId: propertyId,
          readBy: {}, // Start as unread
        };

        await db.collection("notification").doc(notifId).set(notificationData);
        console.log(
          "Document verification notification sent successfully to agent:",
          agentUID,
        );
      } catch (notificationError) {
        console.error(
          "Error creating document verification notification:",
          notificationError,
        );
        // Don't fail the document verification if notification fails
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("API error in verify-document:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
