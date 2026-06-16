import { NextResponse } from "next/server";

import {
  addProjectToFirestore,
  getProjectsFromFirestore,
} from "@/services/projects/firestore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const projects = await getProjectsFromFirestore();

    return NextResponse.json({ projects });
  } catch (error) {
    console.error("Projects API list error:", error);

    return NextResponse.json(
      {
        error: error.message,
      },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const project = await request.json();
    const result = await addProjectToFirestore(project);

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Projects API create error:", error);

    return NextResponse.json(
      {
        error: error.message,
      },
      { status: 500 }
    );
  }
}
