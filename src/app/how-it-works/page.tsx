import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Space_Grotesk, IBM_Plex_Mono } from "next/font/google";
import PipelineDiagram from "@/components/marketing/PipelineDiagram";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-plus-jakarta",
});
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-space-grotesk",
});
const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-ibm-mono",
});

export const metadata: Metadata = {
  title: "How AXIOM works — AXIOM",
  description:
    "A multi-agent planning pipeline built for NSW councils. See how Planner, Researcher, Coder, and Reviewer agents hand off a planning question to a signed deliverable.",
};

export default function HowItWorksPage() {
  return (
    <div
      className={`${plusJakarta.variable} ${spaceGrotesk.variable} ${ibmPlexMono.variable}`}
      style={{
        minHeight: "100vh",
        background: "#f6f7f4",
        color: "#0d1220",
        fontFamily: "var(--font-plus-jakarta), 'Plus Jakarta Sans', system-ui, sans-serif",
      }}
    >
      <header
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: "80px 36px 24px",
        }}
      >
        <h1
          style={{
            fontFamily: "var(--font-space-grotesk), 'Space Grotesk', system-ui, sans-serif",
            fontSize: "clamp(36px, 5vw, 56px)",
            fontWeight: 600,
            color: "#0d1220",
            letterSpacing: "-0.8px",
            lineHeight: 1.05,
            marginBottom: 14,
          }}
        >
          How AXIOM works
        </h1>
        <p
          style={{
            fontSize: 17,
            color: "#2a3244",
            lineHeight: 1.5,
            maxWidth: 640,
          }}
        >
          A multi-agent planning pipeline built for NSW councils.
        </p>
      </header>

      <PipelineDiagram />
    </div>
  );
}
