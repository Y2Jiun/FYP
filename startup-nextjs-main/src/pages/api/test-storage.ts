// API route to test Firebase Storage connectivity
import type { NextApiRequest, NextApiResponse } from "next";
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
          "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCya0k/Q/fnI4Kz\nUMmhL3EgoUGwXbu4zXBBCRkLF10AOsT4/MdsymNFz4Xg7H0mR2jXrTebKAdYtvbt\ndqWZ7CU8jUicWMoV2vHYKjXun4nqCm3UpW4Zd7iOr7SJpmM71XKgqdf/LDqllHDw\nrRYA/KblsVmA6ukcOHlXgWFmi+D4Q0JbDKYxSo57pDbnHuvqaqqT4xwii3LrIugd\nevlHK21hbZfkaiNKlqWl7z/DtlM4r75qoO1g5vDuyVAeD8LhmImDQu604anCd/g7\njOuUdJDI8YIVQHL+fMsnr+zWEkfunTyEuDoDaDfgjpYOg+d2J8nUse9xxV59TLnG\nHa4BvXI1AgMBAAECggEAFmrE8fo9+lBbomCO6N3fWqBwMrLgPHSxezZjq2FU2cvI\nhlkqTFi0due/VDaaddYIjfqxTyENJUAdz9G1tlx1hEFjI2PDhlHzS3voOVJZv2pu\niMZ9Sh1g9qqMZjQd6T1lENsuLJ03xCidtRumNVsJNDhffMNnJRjSZCR5IquGCWMi\nOzJN/eHGNeztvv9kIPCffWuPsb9MXeMxKwDGGb+9YWNvt6KMr9RFBXfclYHnt/pn\nD1CBb74jfOvrG7qZ1Jxk+yhCUjV28gRfz1g5m2tbzqn0IsofnrQpeyvyPfA8WPhE\nO4+MdikfLxNWVY9tTVQhhcFr0a2ei3tJqfhvwJyfYQKBgQDhBhFcFZuvIvaobu6R\njOb/AZajI59jtQ/7QBcZUC5cWz0FOFRUeSBp2dzMrR1oGkXkib1AHsmeIdWOu7G0\nTJ7tt5NCfKNE0OKZ9NUszlOJkf7Z8xnzDGJWTF4jvwfANbq+MEwnkvgUmmfbw/xW\ncmBMCioBDHkTQet0Oua6WFu91QKBgQDK+toAjU65jPtiVwsEpgnm551rNKkqnma1\nzIiYpvYBT+i0tpHUfu+K09MmPxmHgN7jDQrbhQxZXc1B+Wj1th4M8eFS1oMk8DyW\n4DzFhg/kBzmUGKj0bbEGlEAzACD10eCVO5Cj+psL3XrCERVS861JlF/iqvt2K+ET\nowqwUegy4QKBgDx3z/RpzhMrFxM99BfiwDQobh1atjsp7ah7mXlw5XRmBCjB8U9d\n2Ur4g2/w2SUfYka+iL+RRmaa+vNHFsK3kEGbAhRsv8b/RtVOSHao3yPpuo1A2WlJ\nm6dLEEUU0XViOtNe0SgVQ1rt/xi8OrPUOnJUjOMJQgPdw/LQ3S2YDtcdAoGASaak\nG7cqbaF+RbyXvuQQi7xXHmNJTrGTSzwgBGPwt6ErKwdj+trkSFd8MlCLDuPv/Crr\nWaP5SyQCKoI5V47xcHkD7W7wvyJ8mbJb2sA+W9tTRS19gNOcfGqmsNrHGutAtmWa\noiV4xOFkfa59MlBA/IXeFP09qS9ayClM45WUz4ECgYA8pDlg397nUaLRKvO9KeFr\neEYaPw0sydJe4FMpVwPowt+OELrqWBeNpUAUB1MamyvqH5CJb6dDmUai6VWXwgrF\nwuLSuKNHvmWR3kIdH3qPDLss3ZMI22AgYw/v95oBKG54dfspteo1zCTUpJscgM5C\nRhbgTLkDuuMAkt2utZAz6A==\n-----END PRIVATE KEY-----\n",
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

  try {
    // Test Firebase Admin Storage access
    const bucket = admin.storage().bucket();

    // Try to list some files (this will test permissions)
    const [files] = await bucket.getFiles({ maxResults: 1 });

    // Test basic bucket access
    const [metadata] = await bucket.getMetadata();

    return res.status(200).json({
      success: true,
      message: "Firebase Storage is accessible",
      bucketName: metadata.name,
      filesCount: files.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Firebase Storage test failed:", error);

    return res.status(500).json({
      success: false,
      error: "Firebase Storage access failed",
      details: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
    });
  }
}
