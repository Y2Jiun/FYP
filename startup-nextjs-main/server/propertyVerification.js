const express = require("express");
const { db } = require("./firebaseAdmin");
const { getNextId } = require("./counterUtils");
const router = express.Router();

// 🔍 GET /api/property-verification/stats - Get verification statistics
router.get("/stats", async (req, res) => {
  try {
    const propertiesSnapshot = await db.collection("properties").get();
    const documentsSnapshot = await db.collection("propertyDocuments").get();
    const historySnapshot = await db
      .collection("propertyVerificationHistory")
      .get();

    const properties = propertiesSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    const documents = documentsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    const history = historySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Calculate statistics
    const stats = {
      totalProperties: properties.length,
      pendingVerification: properties.filter(
        (p) => p.status === "pending_verification",
      ).length,
      verifiedProperties: properties.filter((p) => p.status === "verified")
        .length,
      rejectedProperties: properties.filter((p) => p.status === "rejected")
        .length,
      totalDocuments: documents.length,
      pendingDocuments: documents.filter(
        (d) => d.verificationStatus === "pending",
      ).length,
      verifiedDocuments: documents.filter(
        (d) => d.verificationStatus === "verified",
      ).length,
      rejectedDocuments: documents.filter(
        (d) => d.verificationStatus === "rejected",
      ).length,
      averageVerificationTime: 24, // Mock data - would calculate from actual times
      verificationSuccessRate:
        properties.length > 0
          ? (properties.filter((p) => p.status === "verified").length /
              properties.length) *
            100
          : 0,
    };

    res.json(stats);
  } catch (error) {
    console.error("Error fetching verification stats:", error);
    res.status(500).json({ error: "Failed to fetch verification statistics" });
  }
});

// 📋 GET /api/property-verification/properties - Get all properties with verification status
router.get("/properties", async (req, res) => {
  try {
    const { status, agentId, search } = req.query;

    let query = db.collection("properties");

    if (status && status !== "all") {
      query = query.where("status", "==", status);
    }

    if (agentId) {
      query = query.where("agentId", "==", agentId);
    }

    const snapshot = await query.get();
    let properties = snapshot.docs.map((doc) => ({
      propertyId: doc.id,
      ...doc.data(),
    }));

    // Filter by search term if provided
    if (search) {
      const searchLower = search.toLowerCase();
      properties = properties.filter(
        (property) =>
          property.title?.toLowerCase().includes(searchLower) ||
          property.propertyId?.toLowerCase().includes(searchLower) ||
          property.location?.address?.toLowerCase().includes(searchLower),
      );
    }

    res.json(properties);
  } catch (error) {
    console.error("Error fetching properties:", error);
    res.status(500).json({ error: "Failed to fetch properties" });
  }
});

// 📄 GET /api/property-verification/documents - Get all property documents
router.get("/documents", async (req, res) => {
  try {
    const { status, propertyId, documentType, search } = req.query;

    let query = db.collection("propertyDocuments");

    if (status && status !== "all") {
      query = query.where("verificationStatus", "==", status);
    }

    if (propertyId) {
      query = query.where("propertyId", "==", propertyId);
    }

    if (documentType) {
      query = query.where("documentType", "==", documentType);
    }

    const snapshot = await query.get();
    let documents = snapshot.docs.map((doc) => ({
      documentId: doc.id,
      ...doc.data(),
    }));

    // Filter by search term if provided
    if (search) {
      const searchLower = search.toLowerCase();
      documents = documents.filter(
        (doc) =>
          doc.documentName?.toLowerCase().includes(searchLower) ||
          doc.documentId?.toLowerCase().includes(searchLower) ||
          doc.propertyId?.toLowerCase().includes(searchLower),
      );
    }

    res.json(documents);
  } catch (error) {
    console.error("Error fetching documents:", error);
    res.status(500).json({ error: "Failed to fetch documents" });
  }
});

// 📊 GET /api/property-verification/history - Get verification history
router.get("/history", async (req, res) => {
  try {
    const { propertyId, action, performedBy, limit = 50 } = req.query;

    let query = db.collection("propertyVerificationHistory");

    if (propertyId) {
      query = query.where("propertyId", "==", propertyId);
    }

    if (action) {
      query = query.where("action", "==", action);
    }

    if (performedBy) {
      query = query.where("performedBy", "==", performedBy);
    }

    query = query.orderBy("performedAt", "desc").limit(parseInt(limit));

    const snapshot = await query.get();
    const history = snapshot.docs.map((doc) => ({
      historyId: doc.id,
      ...doc.data(),
    }));

    res.json(history);
  } catch (error) {
    console.error("Error fetching verification history:", error);
    res.status(500).json({ error: "Failed to fetch verification history" });
  }
});

// ✅ POST /api/property-verification/verify-document - Verify or reject a document
router.post("/verify-document", async (req, res) => {
  try {
    const { documentId, status, notes, adminId } = req.body;

    if (!documentId || !status || !adminId) {
      return res
        .status(400)
        .json({ error: "Document ID, status, and admin ID are required" });
    }

    const documentRef = db.collection("propertyDocuments").doc(documentId);
    const documentDoc = await documentRef.get();

    if (!documentDoc.exists) {
      return res.status(404).json({ error: "Document not found" });
    }

    const documentData = documentDoc.data();

    if (!documentData.propertyId) {
      return res.status(400).json({ error: "Document is missing propertyId" });
    }

    // Update document verification status
    await documentRef.update({
      verificationStatus: status,
      verifiedBy: adminId,
      verifiedAt: new Date(),
      verificationNotes: notes || "",
    });

    // Get next history ID using counter
    const historyId = await getNextId("propertyVerificationHistory");

    // Add to verification history
    await db
      .collection("propertyVerificationHistory")
      .doc(historyId)
      .set({
        historyId,
        propertyId: documentData.propertyId,
        action: `document_${status}`,
        performedBy: adminId,
        performedAt: new Date(),
        details: {
          documentId: documentId,
          documentType: documentData.documentType,
          previousStatus: documentData.verificationStatus,
          newStatus: status,
          notes: notes,
        },
        adminNotes: notes,
      });

    res.json({ success: true, message: `Document ${status} successfully` });
  } catch (error) {
    console.error("Error verifying document:", error);
    res.status(500).json({ error: "Failed to verify document" });
  }
});

// ✅ POST /api/property-verification/verify-property - Verify or reject a property
router.post("/verify-property", async (req, res) => {
  try {
    const { propertyId, status, notes, adminId } = req.body;

    if (!propertyId || !status || !adminId) {
      return res
        .status(400)
        .json({ error: "Property ID, status, and admin ID are required" });
    }

    const propertyRef = db.collection("properties").doc(propertyId);
    const propertyDoc = await propertyRef.get();

    if (!propertyDoc.exists) {
      return res.status(404).json({ error: "Property not found" });
    }

    const propertyData = propertyDoc.data();

    // Update property verification status
    await propertyRef.update({
      status: status,
      "verificationStatus.overall": status,
      updatedAt: new Date(),
    });

    // Get next history ID using counter
    const historyId = await getNextId("propertyVerificationHistory");

    // Add to verification history
    await db
      .collection("propertyVerificationHistory")
      .doc(historyId)
      .set({
        historyId,
        propertyId: propertyId,
        action: `property_${status}`,
        performedBy: adminId,
        performedAt: new Date(),
        details: {
          previousStatus: propertyData.status,
          newStatus: status,
          notes: notes,
        },
        adminNotes: notes,
      });

    res.json({ success: true, message: `Property ${status} successfully` });
  } catch (error) {
    console.error("Error verifying property:", error);
    res.status(500).json({ error: "Failed to verify property" });
  }
});

// 📝 POST /api/property-verification/add-document - Add a new document (for testing)
router.post("/add-document", async (req, res) => {
  try {
    const {
      propertyId,
      documentType,
      documentName,
      fileName,
      fileUrl,
      fileSize,
      uploadedBy,
    } = req.body;

    if (
      !propertyId ||
      !documentType ||
      !documentName ||
      !fileName ||
      !fileUrl ||
      !uploadedBy
    ) {
      return res
        .status(400)
        .json({ error: "All document fields are required" });
    }

    // Use new counter utility
    const documentId = await getNextId("propertyDocuments");

    const documentData = {
      documentId,
      propertyId,
      documentType,
      documentName,
      fileName,
      fileUrl,
      fileSize: parseInt(fileSize) || 0,
      uploadedBy,
      uploadedAt: new Date(),
      verificationStatus: "pending",
      documentHash: `hash_${Date.now()}`,
      isAuthentic: true,
    };

    await db.collection("propertyDocuments").doc(documentId).set(documentData);

    // Use new counter utility for history
    const historyId = await getNextId("propertyVerificationHistory");
    await db
      .collection("propertyVerificationHistory")
      .doc(historyId)
      .set({
        historyId,
        propertyId: propertyId,
        action: "document_uploaded",
        performedBy: uploadedBy,
        performedAt: new Date(),
        details: {
          documentId: documentId,
          documentType: documentType,
          notes: "Document uploaded by agent",
        },
      });

    res.json({
      success: true,
      documentId,
      message: "Document added successfully",
    });
  } catch (error) {
    console.error("Error adding document:", error);
    res.status(500).json({ error: "Failed to add document" });
  }
});

// 🏠 POST /api/property-verification/add-property - Add a new property (for testing)
router.post("/add-property", async (req, res) => {
  try {
    const {
      title,
      description,
      price,
      location,
      propertyType,
      agentId,
      agentName,
    } = req.body;

    if (!title || !price || !location || !propertyType || !agentId) {
      return res
        .status(400)
        .json({ error: "Required property fields are missing" });
    }

    // Use new counter utility
    const propertyId = await getNextId("properties");

    const propertyData = {
      propertyId,
      title,
      description: description || "",
      price: parseFloat(price),
      location,
      propertyType,
      agentId,
      agentName: agentName || "",
      status: "pending_verification",
      createdAt: new Date(),
      updatedAt: new Date(),
      verificationStatus: {
        documents: "pending",
        details: "pending",
        images: "pending",
        overall: "pending",
      },
    };

    await db.collection("properties").doc(propertyId).set(propertyData);

    res.json({
      success: true,
      propertyId,
      message: "Property added successfully",
    });
  } catch (error) {
    console.error("Error adding property:", error);
    res.status(500).json({ error: "Failed to add property" });
  }
});

// 🔍 GET /api/property-verification/agent-stats - Get agent verification statistics
router.get("/agent-stats/:agentId", async (req, res) => {
  try {
    const { agentId } = req.params;

    const propertiesSnapshot = await db
      .collection("properties")
      .where("agentId", "==", agentId)
      .get();
    const documentsSnapshot = await db
      .collection("propertyDocuments")
      .where("uploadedBy", "==", agentId)
      .get();

    const properties = propertiesSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    const documents = documentsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    const stats = {
      agentId,
      totalProperties: properties.length,
      verifiedProperties: properties.filter((p) => p.status === "verified")
        .length,
      rejectedProperties: properties.filter((p) => p.status === "rejected")
        .length,
      pendingProperties: properties.filter(
        (p) => p.status === "pending_verification",
      ).length,
      totalDocuments: documents.length,
      verifiedDocuments: documents.filter(
        (d) => d.verificationStatus === "verified",
      ).length,
      rejectedDocuments: documents.filter(
        (d) => d.verificationStatus === "rejected",
      ).length,
      pendingDocuments: documents.filter(
        (d) => d.verificationStatus === "pending",
      ).length,
      verificationSuccessRate:
        properties.length > 0
          ? (properties.filter((p) => p.status === "verified").length /
              properties.length) *
            100
          : 0,
    };

    res.json(stats);
  } catch (error) {
    console.error("Error fetching agent stats:", error);
    res.status(500).json({ error: "Failed to fetch agent statistics" });
  }
});

// 🔧 POST /api/property-verification/initialize-counters - Initialize all counters
router.post("/initialize-counters", async (req, res) => {
  try {
    // This endpoint is no longer needed as counters are managed by counterUtils
    // Keeping it for now, but it will not increment counters.
    res.json({ success: true, message: "Counters initialized (no effect)" });
  } catch (error) {
    console.error("Error initializing counters:", error);
    res.status(500).json({ error: "Failed to initialize counters" });
  }
});

// 📊 GET /api/property-verification/counters - Get all counter statistics
router.get("/counters", async (req, res) => {
  try {
    // This endpoint is no longer needed as counters are managed by counterUtils
    // Keeping it for now, but it will not return counters.
    res.json({ message: "Counters are managed by counterUtils" });
  } catch (error) {
    console.error("Error getting counters:", error);
    res.status(500).json({ error: "Failed to get counters" });
  }
});

module.exports = router;
