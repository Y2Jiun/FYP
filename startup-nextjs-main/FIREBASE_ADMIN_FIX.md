# Firebase Admin SDK Path Resolution Fix

## 🔍 **Problem Identified**

The error `Cannot find module '/server/serviceAccountKey.json'` occurred because Next.js API routes have different path resolution than regular Node.js applications.

**Error**: Module path resolution failed when importing Firebase Admin configuration from server directory.

## 🛠️ **Solution Implemented**

### **1. Direct Firebase Admin Initialization in API Routes**

Instead of importing from a separate file, Firebase Admin is now initialized directly within each API route that needs it.

### **2. Dual Authentication Method**

The solution supports two authentication methods:

#### **Method A: Environment Variables (Recommended for Production)**
```bash
FIREBASE_PROJECT_ID=derrick-3157c
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@derrick-3157c.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n[your-private-key]\n-----END PRIVATE KEY-----\n"
```

#### **Method B: Hardcoded Service Account (Development Fallback)**
Service account credentials are embedded directly in the code as a fallback.

## 📋 **Files Fixed**

### **1. Updated API Routes:**
- `src/pages/api/proxy-document.ts` - Document proxy with Firebase Admin
- `src/pages/api/test-storage.ts` - Storage connectivity test

### **2. Key Changes:**
- ✅ Direct Firebase Admin initialization
- ✅ Embedded service account credentials as fallback
- ✅ Proper error handling
- ✅ Storage bucket configuration

## 🧪 **Testing**

### **Test Storage Connectivity:**
Visit: `http://localhost:3001/api/test-storage`

**Expected Success Response:**
```json
{
  "success": true,
  "message": "Firebase Storage is accessible",
  "bucketName": "derrick-3157c.appspot.com",
  "filesCount": 0,
  "timestamp": "2025-01-XX..."
}
```

### **Test Document Proxy:**
Visit: `http://localhost:3001/api/proxy-document?url=[firebase-storage-url]`

## 🔧 **Environment Variables Setup (Optional)**

Create a `.env.local` file in the root directory:

```bash
# Firebase Admin SDK Environment Variables
FIREBASE_PROJECT_ID=derrick-3157c
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@derrick-3157c.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----
MIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCya0k/Q/fnI4Kz
UMmhL3EgoUGwXbu4zXBBCRkLF10AOsT4/MdsymNFz4Xg7H0mR2jXrTebKAdYtvbt
dqWZ7CU8jUicWMoV2vHYKjXun4nqCm3UpW4Zd7iOr7SJpmM71XKgqdf/LDqllHDw
rRYA/KblsVmA6ukcOHlXgWFmi+D4Q0JbDKYxSo57pDbnHuvqaqqT4xwii3LrIugd
evlHK21hbZfkaiNKlqWl7z/DtlM4r75qoO1g5vDuyVAeD8LhmImDQu604anCd/g7
jOuUdJDI8YIVQHL+fMsnr+zWEkfunTyEuDoDaDfgjpYOg+d2J8nUse9xxV59TLnG
Ha4BvXI1AgMBAAECggEAFmrE8fo9+lBbomCO6N3fWqBwMrLgPHSxezZjq2FU2cvI
hlkqTFi0due/VDaaddYIjfqxTyENJUAdz9G1tlx1hEFjI2PDhlHzS3voOVJZv2pu
iMZ9Sh1g9qqMZjQd6T1lENsuLJ03xCidtRumNVsJNDhffMNnJRjSZCR5IquGCWMi
OzJN/eHGNeztvv9kIPCffWuPsb9MXeMxKwDGGb+9YWNvt6KMr9RFBXfclYHnt/pn
D1CBb74jfOvrG7qZ1Jxk+yhCUjV28gRfz1g5m2tbzqn0IsofnrQpeyvyPfA8WPhE
O4+MdikfLxNWVY9tTVQhhcFr0a2ei3tJqfhvwJyfYQKBgQDhBhFcFZuvIvaobu6R
jOb/AZajI59jtQ/7QBcZUC5cWz0FOFRUeSBp2dzMrR1oGkXkib1AHsmeIdWOu7G0
TJ7tt5NCfKNE0OKZ9NUszlOJkf7Z8xnzDGJWTF4jvwfANbq+MEwnkvgUmmfbw/xW
cmBMCioBDHkTQet0Oua6WFu91QKBgQDK+toAjU65jPtiVwsEpgnm551rNKkqnma1
zIiYpvYBT+i0tpHUfu+K09MmPxmHgN7jDQrbhQxZXc1B+Wj1th4M8eFS1oMk8DyW
4DzFhg/kBzmUGKj0bbEGlEAzACD10eCVO5Cj+psL3XrCERVS861JlF/iqvt2K+ET
owqwUegy4QKBgDx3z/RpzhMrFxM99BfiwDQobh1atjsp7ah7mXlw5XRmBCjB8U9d
2Ur4g2/w2SUfYka+iL+RRmaa+vNHFsK3kEGbAhRsv8b/RtVOSHao3yPpuo1A2WlJ
m6dLEEUU0XViOtNe0SgVQ1rt/xi8OrPUOnJUjOMJQgPdw/LQ3S2YDtcdAoGASaak
G7cqbaF+RbyXvuQQi7xXHmNJTrGTSzwgBGPwt6ErKwdj+trkSFd8MlCLDuPv/Crr
WaP5SyQCKoI5V47xcHkD7W7wvyJ8mbJb2sA+W9tTRS19gNOcfGqmsNrHGutAtmWa
oiV4xOFkfa59MlBA/IXeFP09qS9ayClM45WUz4ECgYA8pDlg397nUaLRKvO9KeFr
eEYaPw0sydJe4FMpVwPowt+OELrqWBeNpUAUB1MamyvqH5CJb6dDmUai6VWXwgrF
wuLSuKNHvmWR3kIdH3qPDLss3ZMI22AgYw/v95oBKG54dfspteo1zCTUpJscgM5C
RhbgTLkDuuMAkt2utZAz6A==
-----END PRIVATE KEY-----"
```

**Note:** The private key must be on a single line with `\n` for line breaks when using environment variables.

## ✅ **Expected Results**

After implementing this fix:

- ✅ No more "Cannot find module" errors
- ✅ Firebase Admin SDK initializes correctly
- ✅ Storage connectivity works
- ✅ Document proxy API functions properly
- ✅ Fallback authentication method available

## 🚀 **Next Steps**

1. **Test Storage Connectivity**: Visit `/api/test-storage`
2. **Test Document Reading**: Try the "Read Document" functionality
3. **Monitor Console**: Check for any remaining errors
4. **Optional**: Set up environment variables for production

## 🔒 **Security Notes**

- Service account credentials are embedded for development convenience
- For production, use environment variables instead
- Consider rotating service account keys periodically
- Ensure `.env.local` is in `.gitignore`

## 📞 **Troubleshooting**

If issues persist:

1. **Check Console Logs**: Look for Firebase initialization errors
2. **Verify Service Account**: Ensure it has Storage Admin permissions
3. **Test API Endpoints**: Use `/api/test-storage` to verify connectivity
4. **Check Network**: Ensure Firebase services are accessible
