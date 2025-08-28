import { NextRequest, NextResponse } from "next/server";
import { RepoDesignation, spaceInfo, uploadFiles, listFiles } from "@huggingface/hub";

import { isAuthenticated } from "@/lib/auth";
import Project from "@/models/Project";
import dbConnect from "@/lib/mongodb";
import { Page } from "@/types";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ namespace: string; repoId: string }> }
) {
  const user = await isAuthenticated();

  if (user instanceof NextResponse || !user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();
  const param = await params;
  const { namespace, repoId } = param;

  const project = await Project.findOne({
    user_id: user.id,
    space_id: `${namespace}/${repoId}`,
  }).lean();
  if (!project) {
    return NextResponse.json(
      {
        ok: false,
        error: "Project not found",
      },
      { status: 404 }
    );
  }
  try {
    const space = await spaceInfo({
      name: namespace + "/" + repoId,
      accessToken: user.token as string,
      additionalFields: ["author"],
    });

    if (!space || space.sdk !== "static") {
      return NextResponse.json(
        {
          ok: false,
          error: "Space is not a static space",
        },
        { status: 404 }
      );
    }
    if (space.author !== user.name) {
      return NextResponse.json(
        {
          ok: false,
          error: "Space does not belong to the authenticated user",
        },
        { status: 403 }
      );
    }

    const repo: RepoDesignation = {
      type: "space",
      name: `${namespace}/${repoId}`,
    };

    const htmlFiles: Page[] = [];
    
    for await (const fileInfo of listFiles({repo, accessToken: user.token as string})) {
      if (fileInfo.path.endsWith(".html")) {
        const res = await fetch(`https://huggingface.co/spaces/${namespace}/${repoId}/raw/main/${fileInfo.path}`);
        if (res.ok) {
          const html = await res.text();
          htmlFiles.push({
            path: fileInfo.path,
            html,
          });
        }
      }
    }

    if (htmlFiles.length === 0) {
      return NextResponse.json(
        {
          ok: false,
          error: "No HTML files found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        project: {
          ...project,
          pages: htmlFiles,
        },
        ok: true,
      },
      { status: 200 }
    );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    if (error.statusCode === 404) {
      await Project.deleteOne({
        user_id: user.id,
        space_id: `${namespace}/${repoId}`,
      });
      return NextResponse.json(
        { error: "Space not found", ok: false },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: error.message, ok: false },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ namespace: string; repoId: string }> }
) {
  const user = await isAuthenticated();

  if (user instanceof NextResponse || !user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();
  const param = await params;
  const { namespace, repoId } = param;
  const { pages, prompts } = await req.json();

  const project = await Project.findOne({
    user_id: user.id,
    space_id: `${namespace}/${repoId}`,
  }).lean();
  if (!project) {
    return NextResponse.json(
      {
        ok: false,
        error: "Project not found",
      },
      { status: 404 }
    );
  }

  const repo: RepoDesignation = {
    type: "space",
    name: `${namespace}/${repoId}`,
  };

  const files: File[] = [];
  pages.forEach((page: Page) => {
    const file = new File([page.html], page.path, { type: "text/html" });
    files.push(file);
  });
  await uploadFiles({
    repo,
    files,
    accessToken: user.token as string,
    commitTitle: `${prompts[prompts.length - 1]} - Follow Up Deployment`,
  });

  await Project.updateOne(
    { user_id: user.id, space_id: `${namespace}/${repoId}` },
    {
      $set: {
        prompts: [
          ...(project && "prompts" in project ? project.prompts : []),
          ...prompts,
        ],
      },
    }
  );
  return NextResponse.json({ ok: true }, { status: 200 });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ namespace: string; repoId: string }> }
) {
  const user = await isAuthenticated();

  if (user instanceof NextResponse || !user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();
  const param = await params;
  const { namespace, repoId } = param;

  const space = await spaceInfo({
    name: namespace + "/" + repoId,
    accessToken: user.token as string,
    additionalFields: ["author"],
  });

  if (!space || space.sdk !== "static") {
    return NextResponse.json(
      {
        ok: false,
        error: "Space is not a static space",
      },
      { status: 404 }
    );
  }
  if (space.author !== user.name) {
    return NextResponse.json(
      {
        ok: false,
        error: "Space does not belong to the authenticated user",
      },
      { status: 403 }
    );
  }

  const project = await Project.findOne({
    user_id: user.id,
    space_id: `${namespace}/${repoId}`,
  }).lean();
  if (project) {
    // redirect to the project page if it already exists
    return NextResponse.json(
      {
        ok: false,
        error: "Project already exists",
        redirect: `/projects/${namespace}/${repoId}`,
      },
      { status: 400 }
    );
  }

  const newProject = new Project({
    user_id: user.id,
    space_id: `${namespace}/${repoId}`,
    prompts: [],
  });

  await newProject.save();
  return NextResponse.json(
    {
      ok: true,
      project: {
        id: newProject._id,
        space_id: newProject.space_id,
        prompts: newProject.prompts,
      },
    },
    { status: 201 }
  );
}
