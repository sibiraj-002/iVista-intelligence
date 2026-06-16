import { notFound } from "next/navigation";

import { ProjectDetailPage } from "@/components/projects/project-detail-page";
import { projects } from "@/components/projects/projects-data";

export function generateStaticParams() {
  return projects.map((project) => ({
    id: String(project.id),
  }));
}

export default async function ProjectDetails({ params }) {
  const { id } = await params;
  const project = projects.find((item) => String(item.id) === id);

  if (!project) {
    notFound();
  }

  return <ProjectDetailPage project={project} />;
}
