"use client";

interface EmptyStateProps {
  icon?: string;
  title: string;
  description: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
      {icon && (
        <div
          className="mb-4"
          style={{
            fontSize: 48,
            color: "var(--text-ghost, #6c7680)",
            lineHeight: 1,
          }}
        >
          {icon}
        </div>
      )}
      <h3
        style={{
          fontSize: 16,
          fontWeight: 700,
          color: "var(--text-primary, #ffffff)",
          marginBottom: 6,
        }}
      >
        {title}
      </h3>
      <p
        style={{
          fontSize: 13,
          color: "var(--text-ghost, #6c7680)",
          maxWidth: 320,
          lineHeight: 1.5,
        }}
      >
        {description}
      </p>
      {action && (
        <a
          href={action.href}
          onClick={action.onClick}
          className="mt-6 px-5 py-2.5 inline-block transition-colors"
          style={{
            borderRadius: 6,
            background: "var(--gold, #00e87b)",
            color: "var(--void, #04060a)",
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: 0.5,
            textDecoration: "none",
            cursor: "pointer",
          }}
        >
          {action.label}
        </a>
      )}
    </div>
  );
}
