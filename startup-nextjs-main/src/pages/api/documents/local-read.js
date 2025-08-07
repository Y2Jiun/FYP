// Completely FREE document reading API - No Firebase Storage needed
import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { documentId, documentPath } = req.body;

    // Option 1: Read from local uploads directory
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    const localFilePath = path.join(uploadsDir, documentPath);

    if (fs.existsSync(localFilePath)) {
      const fileBuffer = fs.readFileSync(localFilePath);
      const base64Data = fileBuffer.toString('base64');
      const mimeType = getMimeType(localFilePath);

      return res.status(200).json({
        success: true,
        data: {
          base64Data,
          mimeType,
          fileName: path.basename(localFilePath)
        }
      });
    }

    // Option 2: Return placeholder/demo data for testing
    return res.status(200).json({
      success: true,
      data: {
        base64Data: '', // Empty for now
        mimeType: 'application/pdf',
        fileName: 'demo-document.pdf',
        message: 'Use Upload & Read button for free document processing'
      }
    });

  } catch (error) {
    console.error('Error in local document read:', error);
    return res.status(500).json({ 
      error: 'Failed to read document locally',
      suggestion: 'Use the Upload & Read button instead'
    });
  }
}

function getMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const mimeTypes = {
    '.pdf': 'application/pdf',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.bmp': 'image/bmp',
    '.tiff': 'image/tiff'
  };
  return mimeTypes[ext] || 'application/octet-stream';
}
