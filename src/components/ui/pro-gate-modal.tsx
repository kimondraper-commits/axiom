"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";

interface ProGateModalProps {
  feature: string;
  description: string;
  trigger: React.ReactNode;
}

export function ProGateModal({ feature, description, trigger }: ProGateModalProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay
          className="fixed inset-0 z-50"
          style={{ background: "rgba(4,6,10,0.85)" }}
        />
        <Dialog.Content
          className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[420px] max-w-[90vw]"
          style={{
            background: "var(--carbon, #0d1117)",
            border: "1px solid var(--gold, #00e87b)",
            borderRadius: 12,
            padding: 32,
            boxShadow: "0 0 40px rgba(0,232,123,0.1)",
          }}
        >
          <div className="text-center">
            <div
              className="inline-flex items-center gap-2 px-3 py-1 mb-4 rounded-full"
              style={{
                background: "var(--gold-glow, rgba(0,232,123,0.1))",
                border: "1px solid var(--gold, #00e87b)",
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-jetbrains, 'PT Mono', monospace)",
                  fontSize: 9,
                  letterSpacing: 2,
                  textTransform: "uppercase",
                  color: "var(--gold, #00e87b)",
                  fontWeight: 700,
                }}
              >
                AXIOM PRO
              </span>
            </div>

            <Dialog.Title
              style={{
                fontSize: 20,
                fontWeight: 700,
                color: "var(--text-primary, #ffffff)",
                marginBottom: 8,
              }}
            >
              {feature}
            </Dialog.Title>

            <Dialog.Description
              style={{
                fontSize: 13,
                color: "var(--text-ghost, #6c7680)",
                lineHeight: 1.6,
                marginBottom: 24,
              }}
            >
              {description}
            </Dialog.Description>

            <div className="flex gap-3 justify-center">
              <button
                className="px-6 py-2.5 transition-colors"
                style={{
                  borderRadius: 6,
                  background: "var(--gold, #00e87b)",
                  color: "var(--void, #04060a)",
                  border: "none",
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                COMING SOON
              </button>
              <Dialog.Close asChild>
                <button
                  className="px-6 py-2.5 transition-colors"
                  style={{
                    borderRadius: 6,
                    background: "transparent",
                    color: "var(--text-ghost, #6c7680)",
                    border: "1px solid var(--border, rgba(255,255,255,0.08))",
                    fontSize: 12,
                    cursor: "pointer",
                  }}
                >
                  Close
                </button>
              </Dialog.Close>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
