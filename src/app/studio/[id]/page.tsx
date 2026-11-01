import { FloorPlanStudio } from "@/features/floorplan/components/studio";

export const metadata = { title: "Studio: Hallcraft" };

export default async function StudioPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <FloorPlanStudio designId={id} />;
}
