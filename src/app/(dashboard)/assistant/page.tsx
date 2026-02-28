import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { ChatPanel } from "@/components/assistant/chat-panel";

export const metadata = { title: "AI Planning Assistant — City Pro" };

export default async function AssistantPage({
  searchParams,
}: {
  searchParams: Promise<{ projectId?: string; sessionId?: string }>;
}) {
  const { projectId, sessionId } = await searchParams;
  const session = await auth();

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
      where: { id: sessionId, userId: session!.user.id },
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
      <div className="border-b border-slate-200 px-6 py-4 bg-white flex items-center gap-3">
        <div className="w-8 h-8 bg-blue-700 rounded-lg flex items-center justify-center">
          <span className="text-white text-sm">AI</span>
        </div>
        <div>
          <h1 className="font-medium text-slate-900">AI Planning Assistant</h1>
          {project && (
            <p className="text-xs text-slate-500 mt-0.5">
              Context: {project.title} · {project.city}
            </p>
          )}
        </div>
      </div>

      <ChatPanel
        userId={session!.user.id}
        projectId={project?.id}
        initialMessages={existingMessages}
        sessionId={sessionId}
      />
    </div>
  );
}
