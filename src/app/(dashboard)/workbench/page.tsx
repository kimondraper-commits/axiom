import { WorkbenchLoader } from "@/components/workbench/workbench-loader";

export const metadata = { title: "Workbench — AXIOM" };

export default function WorkbenchPage() {
  return (
    <div className="flex h-full">
      <WorkbenchLoader />
    </div>
  );
}
