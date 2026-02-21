import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { JWT } from "google-auth-library";

const SCOPES = [
  "https://www.googleapis.com/auth/spreadsheets",
  "https://www.googleapis.com/auth/drive.file",
];

async function getAuthClient() {
  const credentials = require("/root/.openclaw/workspace/hub/tools/service-account.json");
  
  return new JWT({
    email: credentials.client_email,
    key: credentials.private_key,
    scopes: SCOPES,
  });
}

export async function POST(req: NextRequest) {
  try {
    const { title, data } = await req.json();
    
    const auth = await getAuthClient();
    const sheets = google.sheets({ version: "v4", auth });
    
    // Create spreadsheet
    const sheet = await sheets.spreadsheets.create({
      requestBody: {
        properties: { title },
      },
    });
    
    const sheetId = sheet.data.spreadsheetId;
    
    // Add data if provided
    if (data && data.length > 0) {
      await sheets.spreadsheets.values.update({
        spreadsheetId: sheetId!,
        range: "Sheet1!A1",
        valueInputOption: "RAW",
        requestBody: { values: data },
      });
    }
    
    return NextResponse.json({
      success: true,
      id: sheetId,
      link: `https://docs.google.com/spreadsheets/d/${sheetId}/edit`,
    });
  } catch (error) {
    console.error("Error creating sheet:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create spreadsheet" },
      { status: 500 }
    );
  }
}
