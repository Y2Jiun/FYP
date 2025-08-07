// API route to proxy Firebase Storage documents to avoid CORS issues
import type { NextApiRequest, NextApiResponse } from "next";
// Import Firebase Admin directly to avoid path issues
import * as admin from "firebase-admin";

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  try {
    // Use environment variables for Firebase Admin
    if (
      process.env.FIREBASE_PROJECT_ID &&
      process.env.FIREBASE_CLIENT_EMAIL &&
      process.env.FIREBASE_PRIVATE_KEY
    ) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
        }),
        storageBucket: "derrick-3157c.appspot.com",
      });
    } else {
      // Fallback: use service account key directly
      const serviceAccount = {
        type: "service_account",
        project_id: "derrick-3157c",
        private_key_id: "1c70e1aea713b8c120fc442ce995b4c3faf9e187",
        private_key:
          "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCya0k/Q/fnI4Kz\nUMmhL3EgoUGwXbu4zXBBCRkLF10AOsT4/MdsymNFz4Xg7H0mR2jXrTebKAdYtvbt\ndqWZ7CU8jUicWMoV2vHYKjXun4nqCm3UpW4Zd7iOr7SJpmM71XKgqdf/LDqllHDw\nrRYA/KblsVmA6ukcOHlXgWFmi+D4Q0JbDKYxSo57pDbnHuvqaqqT4xwii3LrIugd\nevlHK21hbZfkaiNKlqWl7z/DtlM4r75qoO1g5vDuyVAeD8LhmImDQu604anCd/g7\njOuUdJDI8YIVQHL+fMsnr+zWEkfunTyEuDoDaDfgjpYOg+d2J8nUse9wxV59TLnG\nHa4BvXI1AgMBAAECggEAFmrE8fo9+lBbomCO6N3fWqBwMrLgPHSxezZjq2FU2cvI\nhlkqTFi0due/VDaaddYIjfqxTyENJUAdz9G1tlx1hEFjI2PDhlHzS3voOVJZv2pu\niMZ9Sh1g9qqMZjQd6T1lENsuLJ03xCidtRumNVsJNDhffMNnJRjSZCR5IquGCWMi\nOzJN/eHGNeztvv9kIPCffWuPsb9MXeMxKwDGGb+9YWNvt6KMr9RFBXfclYHnt/pn\nD1CBb74jfOvrG7qZ1Jxk+yhCUjV28gRfz1g5m2tbzqn0IsofnrQpeyvyPfA8WPhE\nO4+MdikfLxNWVY9tTVQhhcFr0a2ei3tJqfhvwJyfYQKBgQDhBhFcFZuvIvaobu6R\njOb/AZajI59jtQ/7QBcZUC5cWz0FOFRUeSBp2dzMrR1oGkXkib1AHsmeIdWOu7G0\nTJ7tt5NCfKNE0OKZ9NUszlOJkf7Z8xnzDGJWTF4jvwfANbq+MEwnkvgUmmfbw/xW\ncmBMCioBDHkTQet0Oua6WFu91QKBgQDK+toAjU65jPtiVwsEpgnm551rNKkqnma1\nzIiYpvYBT+i0tpHUfu+K09MmPxmHgN7jDQrbhQxZXc1B+Wj1th4M8eFS1oMk8DyW\n4DzFhg/kBzmUGKj0bbEGlEAzACD10eCVO5Cj+psL3XrCERVS861JlF/iqvt2K+ET\nowqwUegy4QKBgDx3z/RpzhMrFxM99BfiwDQobh1atjsp7ah7mXlw5XRmBCjB8U9d\n2Ur4g2/w2SUfYka+iL+RRmaa+vNHFsK3kEGbAhRsv8b/RtVOSHao3yPpuo1A2WlJ\nm6dLEEUU0XViOtNe0SgVQ1rt/xi8OrPUOnJUjOMJQgPdw/LQ3S2YDtcdAoGASaak\nG7cqbaF+RbyXvuQQi7xXHmNJTrGTSzwgBGPwt6ErKwdj+trkSFd8MlCLDuPv/Crr\nWaP5SyQCKoI5V47xcHkD7W7wvyJ8mbJb2sA+W9tTRS19gNOcfGqmsNrHGutAtmWa\noiV4xOFkfa59MlBA/IXeFP09qS9ayClM45WUz4ECgYA8pDlg397nUaLRKvO9KeFr\neEYaPw0sydJe4FMpVwPowt+OELrqWBeNpUAUB1MamyvqH5CJb6dDmUai6VWXwgrF\nwuLSuKNHvmWR3kIdH3qPDLss3ZMI22AgYw/v95oBKG54dfspteo1zCTUpJscgM5C\nRhbgTLkDuuMAkt2utZAz6A==\n-----END PRIVATE KEY-----\n",
        client_email:
          "firebase-adminsdk-fbsvc@derrick-3157c.iam.gserviceaccount.com",
        client_id: "113087527272280051552",
        auth_uri: "https://accounts.google.com/o/oauth2/auth",
        token_uri: "https://oauth2.googleapis.com/token",
        auth_provider_x509_cert_url:
          "https://www.googleapis.com/oauth2/v1/certs",
        client_x509_cert_url:
          "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40derrick-3157c.iam.gserviceaccount.com",
        universe_domain: "googleapis.com",
      };

      admin.initializeApp({
        credential: admin.credential.cert(
          serviceAccount as admin.ServiceAccount,
        ),
        storageBucket: "derrick-3157c.appspot.com",
      });
    }
  } catch (error) {
    console.error("Firebase Admin initialization failed:", error);
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { url } = req.query;

  if (!url || typeof url !== "string") {
    return res.status(400).json({ error: "URL parameter is required" });
  }

  try {
    // Validate that this is an allowed URL for security
    const isFirebaseUrl =
      url.includes("firebasestorage.googleapis.com") ||
      url.includes("storage.googleapis.com");
    const isCloudinaryUrl =
      url.includes("res.cloudinary.com") || url.includes("cloudinary.com");

    if (!isFirebaseUrl && !isCloudinaryUrl) {
      return res.status(400).json({
        error:
          "Invalid URL - only Firebase Storage and Cloudinary URLs are allowed",
      });
    }

    console.log("🔗 Proxy request for URL:", url);
    console.log("🔍 URL type:", { isFirebaseUrl, isCloudinaryUrl });

    let buffer: Buffer;
    let contentType = "application/octet-stream";

    try {
      // Method 1: Handle Cloudinary URLs (most common now)
      if (
        url.includes("res.cloudinary.com") ||
        url.includes("cloudinary.com")
      ) {
        console.log("☁️ Fetching from Cloudinary:", url);

        // Add headers to ensure proper content handling
        const response = await fetch(url, {
          method: "GET",
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            Accept: "application/pdf,image/*,*/*",
            "Accept-Language": "en-US,en;q=0.9",
            "Cache-Control": "no-cache",
          },
        });

        console.log("📊 Cloudinary Response:", {
          status: response.status,
          statusText: response.statusText,
          contentType: response.headers.get("content-type"),
          contentLength: response.headers.get("content-length"),
        });

        if (!response.ok) {
          console.error(
            `❌ Cloudinary fetch failed: ${response.status} ${response.statusText}`,
          );
          console.error(
            "📋 Response headers:",
            Object.fromEntries(response.headers.entries()),
          );

          // Try to get response body for more details
          try {
            const errorText = await response.text();
            console.error("📄 Error response body:", errorText);
          } catch (e) {
            console.error("Could not read error response body");
          }

          throw new Error(
            `Cloudinary fetch failed: ${response.status} ${response.statusText}`,
          );
        }

        buffer = Buffer.from(await response.arrayBuffer());
        contentType =
          response.headers.get("content-type") || "application/octet-stream";

        console.log(
          "Successfully fetched from Cloudinary, size:",
          buffer.length,
          "content-type:",
          contentType,
        );

        // Method 2: Handle Firebase Storage URLs (legacy)
      } else if (url.includes("firebasestorage.googleapis.com")) {
        // Extract file path from Firebase Storage URL
        const urlParts = url.split("/o/")[1];
        if (urlParts) {
          const filePath = decodeURIComponent(urlParts.split("?")[0]);

          const bucket = admin.storage().bucket();
          const file = bucket.file(filePath);

          // Download file using Admin SDK
          const [fileBuffer] = await file.download();
          buffer = fileBuffer;

          // Get file metadata for content type
          const [metadata] = await file.getMetadata();
          contentType = metadata.contentType || "application/octet-stream";
        } else {
          throw new Error("Invalid Firebase Storage URL format");
        }

        // Method 3: Handle other URLs (data URLs, etc.)
      } else if (url.startsWith("data:")) {
        // Handle base64 data URLs
        const [header, base64Data] = url.split(",");
        const mimeMatch = header.match(/data:([^;]+)/);
        contentType = mimeMatch ? mimeMatch[1] : "application/octet-stream";
        buffer = Buffer.from(base64Data, "base64");
      } else {
        // Try direct fetch for any other URL
        console.log("Trying direct fetch for URL:", url);
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(
            `Direct fetch failed: ${response.status} ${response.statusText}`,
          );
        }

        buffer = Buffer.from(await response.arrayBuffer());
        contentType =
          response.headers.get("content-type") || "application/octet-stream";
      }
    } catch (adminError) {
      console.log(
        "Firebase Admin SDK failed, trying direct fetch...",
        adminError,
      );

      // Method 2: Fallback to direct fetch
      const response = await fetch(url);

      if (!response.ok) {
        return res.status(response.status).json({
          error: `Failed to fetch document: ${response.statusText}`,
          adminError:
            adminError instanceof Error
              ? adminError.message
              : "Unknown admin error",
        });
      }

      contentType =
        response.headers.get("content-type") || "application/octet-stream";
      const arrayBuffer = await response.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
    }

    // Set appropriate headers
    res.setHeader("Content-Type", contentType);
    res.setHeader("Cache-Control", "public, max-age=3600"); // Cache for 1 hour
    res.setHeader("Access-Control-Allow-Origin", "*"); // Allow CORS

    // Send the file
    res.send(buffer);
  } catch (error) {
    console.error("Error proxying document:", error);
    res.status(500).json({
      error: "Failed to fetch document",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
