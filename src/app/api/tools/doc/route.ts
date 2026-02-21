import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { JWT } from "google-auth-library";
import { readFileSync } from "fs";
import { join } from "path";

const SCOPES = [
  "https://www.googleapis.com/auth/documents",
  "https://www.googleapis.com/auth/drive.file",
];

async function getAuthClient() {
  // Read service account credentials from file
  const credPath = join(process.cwd(), "service-account.json");
  const credentials = JSON.parse(readFileSync(credPath, "utf-8"));
  
  return new JWT({
    email: credentials.client_email,
    key: credentials.private_key,
    scopes: SCOPES,
  });
}

export async function POST(req: NextRequest) {
  try {
    const { title, content } = await req.json();
    
    const auth = await getAuthClient();
    const docs = google.docs({ version: "v1", auth });
    
    // Create document
    const doc = await docs.documents.create({
      requestBody: { title },
    });
    
    const docId = doc.data.documentId;
    
    // Add content if provided
    if (content) {
      await docs.documents().batchUpdate({
        documentId: docId!,
        requestBody: {
          requests: [
            {
              insertText: {
                location: { index: 1 },
                text: content,
              },
            },
          ],
        },
      });
    }
    
    return NextResponse.json({
      success: true,
      id: docId,
      link: `https://docs.google.com/document/d/${docId}/edit`,
    });
  } catch (error) {
    console.error("Error creating doc:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create document" },
      { status: 500 }
    );
  }
}
