import { NextRequest, NextResponse } from "next/server";
import { simpleParser } from "mailparser";

const GMAIL_USER = process.env.GMAIL_USER;
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD;

// Gmail IMAP fetch
async function fetchEmails(limit: number = 10) {
  const { ImapFlow } = await import("imapflow");
  
  const client = new ImapFlow({
    host: "imap.gmail.com",
    port: 993,
    secure: true,
    auth: {
      user: GMAIL_USER!,
      pass: GMAIL_APP_PASSWORD!,
    },
    logger: false,
  });

  try {
    await client.connect();
    
    const lock = await client.getMailboxLock("INBOX");
    try {
      const messages = [];
      // Fetch last N messages
      const mailbox = client.mailbox;
      if (!mailbox) {
        throw new Error("No mailbox selected");
      }
      const totalMessages = mailbox.exists;
      const startSeq = Math.max(1, totalMessages - limit + 1);
      const seqSet = `${startSeq}:*`;
      
      for await (let message of client.fetch(
        seqSet,
        { source: true, envelope: true }
      )) {
        const parsed = await simpleParser(message.source || "");
        messages.push({
          id: message.uid,
          subject: parsed.subject || "(No subject)",
          from: parsed.from?.text || "Unknown",
          date: parsed.date,
          snippet: parsed.text?.substring(0, 200) || "",
          html: parsed.html || null,
        });
      }
      return messages.reverse(); // Newest first
    } finally {
      lock.release();
    }
  } finally {
    await client.logout();
  }
}

// GET - Fetch recent emails
export async function GET(request: NextRequest) {
  try {
    if (!GMAIL_USER || !GMAIL_APP_PASSWORD) {
      return NextResponse.json(
        { error: "Gmail credentials not configured" },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "10");

    const emails = await fetchEmails(limit);
    return NextResponse.json(emails);
  } catch (error) {
    console.error("Error fetching emails:", error);
    return NextResponse.json(
      { error: "Failed to fetch emails" },
      { status: 500 }
    );
  }
}

// POST - Send email
export async function POST(request: NextRequest) {
  try {
    if (!GMAIL_USER || !GMAIL_APP_PASSWORD) {
      return NextResponse.json(
        { error: "Gmail credentials not configured" },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { to, subject, text, html } = body;

    if (!to || !subject || !text) {
      return NextResponse.json(
        { error: "To, subject, and text required" },
        { status: 400 }
      );
    }

    // Use nodemailer for sending
    const nodemailer = await import("nodemailer");
    
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: GMAIL_USER,
        pass: GMAIL_APP_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: `"Mission Control" <${GMAIL_USER}>`,
      to,
      subject,
      text,
      html: html || text,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error sending email:", error);
    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 500 }
    );
  }
}
