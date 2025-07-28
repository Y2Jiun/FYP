import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("image");

    if (!file) {
      return NextResponse.json(
        { error: "No image file provided" },
        { status: 400 },
      );
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Image size must be less than 5MB" },
        { status: 400 },
      );
    }

    // Check file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "Please select an image file" },
        { status: 400 },
      );
    }

    // Convert file to base64 for Cloudinary
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Image = buffer.toString("base64");
    const dataURI = `data:${file.type};base64,${base64Image}`;

    // Upload to Cloudinary
    const cloudinaryUrl = `https://api.cloudinary.com/v1_1/dvl5whm1n/image/upload`;
    const uploadData = new FormData();
    uploadData.append("file", dataURI);
    uploadData.append("upload_preset", "derrick");
    uploadData.append("folder", "chat-images");

    const response = await fetch(cloudinaryUrl, {
      method: "POST",
      body: uploadData,
    });

    if (!response.ok) {
      throw new Error("Failed to upload to Cloudinary");
    }

    const result = await response.json();

    return NextResponse.json({
      success: true,
      imageUrl: result.secure_url,
    });
  } catch (error) {
    console.error("Image upload error:", error);
    return NextResponse.json(
      {
        error: "Failed to upload image",
      },
      { status: 500 },
    );
  }
}
