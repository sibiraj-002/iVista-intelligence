async function parseProjectResponse(response) {
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Project request failed.");
  }

  return data;
}

export async function getProjects() {
  const data = await parseProjectResponse(
    await fetch("/api/projects", {
      cache: "no-store",
    })
  );

  return data.projects;
}

export async function getProject(projectId) {
  const response = await fetch(`/api/projects/${projectId}`, {
    cache: "no-store",
  });

  if (response.status === 404) {
    return null;
  }

  const data = await parseProjectResponse(response);

  return data.project;
}

export async function addProject(project) {
  return parseProjectResponse(
    await fetch("/api/projects", {
      body: JSON.stringify(project),
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
    })
  );
}

export async function updateProject(projectId, project) {
  const data = await parseProjectResponse(
    await fetch(`/api/projects/${projectId}`, {
      body: JSON.stringify(project),
      headers: {
        "Content-Type": "application/json",
      },
      method: "PUT",
    })
  );

  return data.project;
}

export async function deleteProject(projectId) {
  return parseProjectResponse(
    await fetch(`/api/projects/${projectId}`, {
      method: "DELETE",
    })
  );
}
