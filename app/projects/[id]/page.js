import { ProjectDetailPage } from "@/components/projects/project-detail-page";

export const dynamic = "force-dynamic";

export default async function ProjectDetails({ params }) {
  const { id } = await params;

  return <ProjectDetailPage projectId={id} />;
}
