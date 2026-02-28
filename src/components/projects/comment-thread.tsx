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
  return new Date(date).toLocaleDateString("en-US", {
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
    <div className="bg-white border border-slate-200 rounded-lg">
      <div className="px-5 py-4 border-b border-slate-100">
        <h2 className="font-medium text-slate-900">Comments ({comments.length})</h2>
      </div>

      {/* New comment form */}
      <div className="px-5 py-4 border-b border-slate-100">
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Add a comment…"
          rows={3}
          className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none"
        />
        <div className="mt-2 flex justify-end">
          <button
            onClick={() => submitComment()}
            disabled={!body.trim() || submitting}
            className="bg-blue-700 text-white px-4 py-1.5 rounded text-sm font-medium hover:bg-blue-800 disabled:opacity-50 transition-colors"
          >
            Post Comment
          </button>
        </div>
      </div>

      {/* Comment list */}
      <div className="divide-y divide-slate-100">
        {comments.length === 0 ? (
          <p className="px-5 py-6 text-sm text-slate-400 text-center">No comments yet.</p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="px-5 py-4">
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-medium text-slate-900">{getAuthorName(comment)}</span>
                  {comment.isPublic && (
                    <span className="text-xs bg-green-50 text-green-700 px-1.5 py-0.5 rounded">Public</span>
                  )}
                  {comment.isPublic && !comment.isApproved && (
                    <span className="text-xs bg-yellow-50 text-yellow-700 px-1.5 py-0.5 rounded">Pending</span>
                  )}
                </div>
                <span className="text-xs text-slate-400 shrink-0">{formatDate(comment.createdAt)}</span>
              </div>
              <p className="text-sm text-slate-700 leading-relaxed">{comment.body}</p>

              <div className="mt-2 flex gap-3">
                <button
                  onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                  className="text-xs text-slate-400 hover:text-blue-700 transition-colors"
                >
                  Reply
                </button>
                {canModerate && comment.isPublic && !comment.isApproved && (
                  <button
                    onClick={() => approveComment(comment.id)}
                    className="text-xs text-green-600 hover:text-green-800 transition-colors font-medium"
                  >
                    Approve
                  </button>
                )}
              </div>

              {/* Reply form */}
              {replyingTo === comment.id && (
                <div className="mt-3 pl-4 border-l-2 border-slate-100">
                  <textarea
                    value={replyBody}
                    onChange={(e) => setReplyBody(e.target.value)}
                    placeholder="Write a reply…"
                    rows={2}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none"
                  />
                  <div className="mt-1.5 flex gap-2 justify-end">
                    <button
                      onClick={() => { setReplyingTo(null); setReplyBody(""); }}
                      className="text-xs text-slate-400 hover:text-slate-600 px-3 py-1"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => submitComment(comment.id)}
                      disabled={!replyBody.trim() || submitting}
                      className="bg-blue-700 text-white px-3 py-1 rounded text-xs font-medium hover:bg-blue-800 disabled:opacity-50"
                    >
                      Reply
                    </button>
                  </div>
                </div>
              )}

              {/* Replies */}
              {comment.replies.length > 0 && (
                <div className="mt-3 pl-4 border-l-2 border-slate-100 space-y-3">
                  {comment.replies.map((reply) => (
                    <div key={reply.id}>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-sm font-medium text-slate-900">{getAuthorName(reply)}</span>
                        <span className="text-xs text-slate-400">{formatDate(reply.createdAt)}</span>
                      </div>
                      <p className="text-sm text-slate-700">{reply.body}</p>
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
