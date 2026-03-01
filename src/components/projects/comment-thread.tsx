"use client";

import { useState } from "react";

interface Reply {
  id: string;
  body: string;
  authorId: string | null;
  authorName: string | null;
  author: { name: string | null } | null;
  isPublic: boolean;
  isApproved: boolean;
  createdAt: Date | string;
}

interface Comment extends Reply {
  replies: Reply[];
}

interface CommentThreadProps {
  projectId: string;
  comments: Comment[];
  currentUserId?: string;
  canModerate?: boolean;
}

function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString("en-AU", {
    month: "short", day: "numeric", year: "numeric",
  });
}

function getAuthorName(c: Reply) {
  return c.author?.name ?? c.authorName ?? "Anonymous";
}

export function CommentThread({ projectId, comments: initial, currentUserId, canModerate }: CommentThreadProps) {
  const [comments, setComments] = useState(initial);
  const [body, setBody] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyBody, setReplyBody] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submitComment(parentId?: string) {
    const text = parentId ? replyBody : body;
    if (!text.trim()) return;
    setSubmitting(true);

    try {
      const res = await fetch(`/api/projects/${projectId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: text.trim(), parentId }),
      });
      const json = await res.json();

      if (res.ok) {
        if (parentId) {
          setComments((prev) =>
            prev.map((c) =>
              c.id === parentId
                ? { ...c, replies: [...c.replies, { ...json.data, replies: [], author: null }] }
                : c
            )
          );
          setReplyingTo(null);
          setReplyBody("");
        } else {
          setComments((prev) => [{ ...json.data, replies: [], author: null }, ...prev]);
          setBody("");
        }
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function approveComment(id: string) {
    await fetch(`/api/projects/${projectId}/comments`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, isApproved: true }),
    });
    setComments((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isApproved: true } : c))
    );
  }

  return (
    <div style={{ background: "var(--carbon)", border: "1px solid var(--border)", borderRadius: 3 }}>
      <div className="px-5 py-4" style={{ borderBottom: "1px solid var(--border)" }}>
        <h2 style={{ fontFamily: "var(--font-outfit, 'Outfit', sans-serif)", fontWeight: 500, color: "var(--text-primary)" }}>Comments ({comments.length})</h2>
      </div>

      {/* New comment form */}
      <div className="px-5 py-4" style={{ borderBottom: "1px solid var(--border)" }}>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Add a comment…"
          rows={3}
          className="w-full resize-none"
        />
        <div className="mt-2 flex justify-end">
          <button
            onClick={() => submitComment()}
            disabled={!body.trim() || submitting}
            style={{ background: "linear-gradient(135deg, var(--gold-dim), var(--gold))", color: "var(--void)", padding: "6px 16px", borderRadius: 4, fontSize: 13, fontWeight: 600, opacity: (!body.trim() || submitting) ? 0.5 : 1 }}
          >
            Post Comment
          </button>
        </div>
      </div>

      {/* Comment list */}
      <div>
        {comments.length === 0 ? (
          <p className="px-5 py-6 text-center" style={{ fontSize: 13, color: "var(--text-ghost)" }}>No comments yet.</p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="px-5 py-4" style={{ borderBottom: "1px solid var(--border)" }}>
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-1.5">
                  <span style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)" }}>{getAuthorName(comment)}</span>
                  {comment.isPublic && (
                    <span style={{ fontSize: 11, background: "rgba(34,197,94,0.12)", color: "#4ade80", padding: "1px 6px", borderRadius: 4 }}>Public</span>
                  )}
                  {comment.isPublic && !comment.isApproved && (
                    <span style={{ fontSize: 11, background: "rgba(245,158,11,0.12)", color: "#f59e0b", padding: "1px 6px", borderRadius: 4 }}>Pending</span>
                  )}
                </div>
                <span style={{ fontSize: 11, color: "var(--text-ghost)" }} className="shrink-0">{formatDate(comment.createdAt)}</span>
              </div>
              <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6 }}>{comment.body}</p>

              <div className="mt-2 flex gap-3">
                <button
                  onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                  style={{ fontSize: 11, color: "var(--text-ghost)" }}
                >
                  Reply
                </button>
                {canModerate && comment.isPublic && !comment.isApproved && (
                  <button
                    onClick={() => approveComment(comment.id)}
                    style={{ fontSize: 11, color: "#4ade80", fontWeight: 500 }}
                  >
                    Approve
                  </button>
                )}
              </div>

              {/* Reply form */}
              {replyingTo === comment.id && (
                <div className="mt-3 pl-4" style={{ borderLeft: "2px solid var(--border)" }}>
                  <textarea
                    value={replyBody}
                    onChange={(e) => setReplyBody(e.target.value)}
                    placeholder="Write a reply…"
                    rows={2}
                    className="w-full resize-none"
                  />
                  <div className="mt-1.5 flex gap-2 justify-end">
                    <button
                      onClick={() => { setReplyingTo(null); setReplyBody(""); }}
                      style={{ fontSize: 11, color: "var(--text-ghost)", padding: "4px 12px" }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => submitComment(comment.id)}
                      disabled={!replyBody.trim() || submitting}
                      style={{ background: "linear-gradient(135deg, var(--gold-dim), var(--gold))", color: "var(--void)", padding: "4px 12px", borderRadius: 4, fontSize: 11, fontWeight: 600, opacity: (!replyBody.trim() || submitting) ? 0.5 : 1 }}
                    >
                      Reply
                    </button>
                  </div>
                </div>
              )}

              {/* Replies */}
              {comment.replies.length > 0 && (
                <div className="mt-3 pl-4 space-y-3" style={{ borderLeft: "2px solid var(--border)" }}>
                  {comment.replies.map((reply) => (
                    <div key={reply.id}>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)" }}>{getAuthorName(reply)}</span>
                        <span style={{ fontSize: 11, color: "var(--text-ghost)" }}>{formatDate(reply.createdAt)}</span>
                      </div>
                      <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>{reply.body}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
