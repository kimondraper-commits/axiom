import { AimLoader } from "@/components/aim/aim-loader";

export const metadata = { title: "AIM Site Finder — AXIOM" };

export default function AimPage() {
  return (
    <div className="flex h-full">
      <AimLoader />
    </div>
  );
}
