// Moderation result type
export type ModerationResult = {
  flagged: boolean;
  reason?: string;
};

// Call your backend to moderate text
export async function moderateText(text: string): Promise<ModerationResult> {
  const res = await fetch("http://localhost:4000/api/moderate-text", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
  if (!res.ok) throw new Error("Failed to moderate text");
  return await res.json();
}

// Call your backend to moderate image
export async function moderateImage(
  imageUrl: string,
): Promise<ModerationResult> {
  const res = await fetch("http://localhost:4000/api/moderate-image", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ imageUrl }),
  });
  if (!res.ok) throw new Error("Failed to moderate image");
  return await res.json();
}
