import { Sidebar } from "@/components/layout/sidebar";
import type { SessionUser } from "@/lib/auth";

const GUEST_USER: SessionUser = {
  id: "guest",
  email: "guest@citypro.gov",
  name: "Guest",
  role: "VIEWER",
  department: null,
  image: null,
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "var(--bg-secondary)" }}>
      <Sidebar user={GUEST_USER} />
      <main className="flex-1 overflow-auto" style={{ background: "var(--bg-secondary)" }}>
        {children}
      </main>
    </div>
  );
}
