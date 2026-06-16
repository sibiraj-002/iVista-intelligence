import { NextResponse } from "next/server";

import {
  deleteProjectFromFirestore,
  getProjectFromFirestore,
  updateProjectInFirestore,
} from "@/services/projects/firestore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function getProjectId(context) {
  const params = await context.params;

  return params.id;
}

export async function GET(_request, context) {
  try {
    const projectId = await getProjectId(context);
    const project = await getProjectFromFirestore(projectId);

    if (!project) {
      return NextResponse.json(
        {
          error: "Project not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({ project });
  } catch (error) {
    console.error("Projects API detail error:", error);

    return NextResponse.json(
      {
        error: error.message,
      },
      { status: 500 }
    );
  }
}

export async function PUT(request, context) {
  try {
    const projectId = await getProjectId(context);
    const project = await request.json();
    const updatedProject = await updateProjectInFirestore(projectId, project);

    return NextResponse.json({ project: updatedProject });
  } catch (error) {
    console.error("Projects API update error:", error);

    return NextResponse.json(
      {
        error: error.message,
      },
      { status: 500 }
    );
  }
}

export async function DELETE(_request, context) {
  try {
    const projectId = await getProjectId(context);
    const result = await deleteProjectFromFirestore(projectId);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Projects API delete error:", error);

    return NextResponse.json(
      {
        error: error.message,
      },
      { status: 500 }
    );
  }
}
