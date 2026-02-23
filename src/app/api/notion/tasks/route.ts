import { NextRequest, NextResponse } from "next/server";
import { readFileSync } from "fs";
import { join } from "path";

const NOTION_KEY = readFileSync(join(process.env.HOME || "/root", ".config/notion/api_key"), "utf-8").trim();

const NOTION_API = "https://api.notion.com/v1";

// Helper to make Notion API calls
async function notionFetch(endpoint: string, options: RequestInit = {}) {
  const response = await fetch(`${NOTION_API}${endpoint}`, {
    ...options,
    headers: {
      "Authorization": `Bearer ${NOTION_KEY}`,
      "Notion-Version": "2025-09-03",
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Notion API error: ${error}`);
  }

  return response.json();
}

// GET - Fetch all tasks from database
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const databaseId = searchParams.get("databaseId");

    if (!databaseId) {
      return NextResponse.json({ error: "Database ID required" }, { status: 400 });
    }

    // Query the database
    const data = await notionFetch(`/databases/${databaseId}/query`, {
      method: "POST",
      body: JSON.stringify({}),
    });

    // Transform Notion pages to tasks
    const tasks = data.results.map((page: any) => {
      const properties = page.properties;
      
      return {
        id: page.id,
        name: properties.Name?.title?.[0]?.plain_text || "Untitled",
        status: properties.Status?.status?.name || "Backlog",
        priority: properties.Priority?.multi_select?.[0]?.name || "Medium",
        tag: properties.Tag?.multi_select?.map((t: any) => t.name) || [],
        description: properties.Description?.rich_text?.[0]?.plain_text || "",
        dueDate: properties["Due Date"]?.date?.start,
      };
    });

    return NextResponse.json(tasks);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return NextResponse.json(
      { error: "Failed to fetch tasks" },
      { status: 500 }
    );
  }
}

// POST - Create new task
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { databaseId, name, status, priority, tag, description } = body;

    if (!databaseId || !name) {
      return NextResponse.json(
        { error: "Database ID and name required" },
        { status: 400 }
      );
    }

    const page = await notionFetch("/pages", {
      method: "POST",
      body: JSON.stringify({
        parent: { database_id: databaseId },
        properties: {
          Name: { title: [{ text: { content: name } }] },
          Status: { status: { name: status || "Backlog" } },
          Priority: { multi_select: [{ name: priority || "Medium" }] },
          Tag: { multi_select: tag?.map((t: string) => ({ name: t })) || [] },
          Description: { rich_text: [{ text: { content: description || "" } }] },
        },
      }),
    });

    return NextResponse.json({ id: page.id, success: true });
  } catch (error) {
    console.error("Error creating task:", error);
    return NextResponse.json(
      { error: "Failed to create task" },
      { status: 500 }
    );
  }
}

// PATCH - Update task
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { pageId, ...updates } = body;

    if (!pageId) {
      return NextResponse.json({ error: "Page ID required" }, { status: 400 });
    }

    const properties: any = {};

    if (updates.name !== undefined) {
      properties.Name = { title: [{ text: { content: updates.name } }] };
    }

    if (updates.status !== undefined) {
      properties.Status = { status: { name: updates.status } };
    }

    if (updates.priority !== undefined) {
      properties.Priority = { multi_select: [{ name: updates.priority }] };
    }

    if (updates.tag !== undefined) {
      properties.Tag = { multi_select: updates.tag.map((t: string) => ({ name: t })) };
    }

    if (updates.description !== undefined) {
      properties.Description = { rich_text: [{ text: { content: updates.description } }] };
    }

    await notionFetch(`/pages/${pageId}`, {
      method: "PATCH",
      body: JSON.stringify({ properties }),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating task:", error);
    return NextResponse.json(
      { error: "Failed to update task" },
      { status: 500 }
    );
  }
}

// DELETE - Archive task (Notion doesn't support true delete via API)
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { pageId } = body;

    if (!pageId) {
      return NextResponse.json({ error: "Page ID required" }, { status: 400 });
    }

    // Archive the page
    await notionFetch(`/pages/${pageId}`, {
      method: "PATCH",
      body: JSON.stringify({ archived: true }),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting task:", error);
    return NextResponse.json(
      { error: "Failed to delete task" },
      { status: 500 }
    );
  }
}
