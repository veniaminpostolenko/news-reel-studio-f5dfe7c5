import { createFileRoute } from "@tanstack/react-router";
import { NewsPresentation } from "../components/NewsPresentation";

// No head() here: the home route inherits title/description/og/twitter from
// __root.tsx, and ships no og:image so serve-time hosting can inject the
// project's social preview (explicit og:image or latest screenshot).
export const Route = createFileRoute("/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "4 UUDIST — uudiste esitlus" },
      { name: "description", content: "Neli olulist uudist Eestist ja maailmast: poliitika, haridus, tehnoloogia ja sport." },
      { property: "og:title", content: "4 UUDIST — uudiste esitlus" },
      { property: "og:description", content: "Neli olulist uudist Eestist ja maailmast ühes visuaalses esitluses." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Index,
});

// IMPORTANT: Replace this placeholder. See ./README.md for routing conventions.
function Index() {
  return <NewsPresentation />;
}
