import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { ChatPanel } from "@/components/assistant/chat-panel";

export const metadata = { title: "AI Planning Assistant — AXIOM" };

export default async function AssistantPage({
  searchParams,
}: {
  searchParams: Promise<{ projectId?: string; sessionId?: string }>;
}) {
  const { projectId, sessionId } = await searchParams;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  let project = null;
  if (projectId) {
    project = await db.project.findUnique({
      where: { id: projectId },
      select: { id: true, title: true, city: true, district: true, status: true, phase: true, description: true },
    });
  }

  let existingMessages: Array<{ role: string; content: string }> = [];
  if (sessionId) {
    const chatSession = await db.chatSession.findUnique({
      where: { id: sessionId, userId: session.user.id },
      include: { messages: { orderBy: { createdAt: "asc" } } },
    });
    if (chatSession) {
      existingMessages = chatSession.messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-4 flex items-center gap-3" style={{ borderBottom: "1px solid var(--border)", background: "var(--bg-secondary)" }}>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg, var(--gold-dim), var(--gold))" }}>
          <span style={{ color: "#fff", fontFamily: "var(--font-instrument, 'Open Sans', sans-serif)", fontWeight: 700, fontSize: 12 }}>AI</span>
        </div>
        <div>
          <h1 style={{ fontFamily: "var(--font-dm, 'Open Sans', sans-serif)", fontWeight: 500, color: "var(--text-primary)" }}>AI Planning Assistant</h1>
          {project && (
            <p style={{ fontSize: 11, color: "var(--text-ghost)", marginTop: 2 }}>
              Context: {project.title} · {project.city}
            </p>
          )}
        </div>
      </div>

      <ChatPanel
        userId={session.user.id}
        projectId={project?.id}
        initialMessages={existingMessages}
        sessionId={sessionId}
      />
    </div>
  );
}
