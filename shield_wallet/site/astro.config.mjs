import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";

// https://astro.build/config
export default defineConfig({
  // Replace with the production Vercel URL once known. Used to generate
  // sitemap.xml and absolute canonical/OpenGraph URLs.
  site: "https://shield-wallet-docs.vercel.app",

  integrations: [
    starlight({
      title: "Aleo Shield Wallet Docs",
      description:
        "User guide and developer integration FAQ for the Shield browser wallet on Aleo. Public vs private balances, cross-chain swaps via Hyperlane, and dApp adapter integration.",
      logo: {
        src: "./src/assets/shield-logo.svg",
        replacesTitle: false,
      },
      favicon: "/favicon.svg",
      social: [
        {
          icon: "github",
          label: "GitHub",
          href: "https://github.com/casualcomputer/aleo-notebooks",
        },
      ],
      editLink: {
        baseUrl:
          "https://github.com/casualcomputer/aleo-notebooks/edit/main/shield_wallet/site/",
      },
      lastUpdated: true,
      pagination: true,
      sidebar: [
        {
          label: "Start here",
          items: [
            { label: "Overview", link: "/" },
          ],
        },
        {
          label: "User guide",
          items: [
            { label: "Complete user FAQ", link: "/users/" },
          ],
        },
        {
          label: "Developer guide",
          items: [
            { label: "Integration FAQ", link: "/developers/" },
          ],
        },
      ],
      head: [
        // Open Graph defaults — Starlight emits per-page OG too; this is the
        // fallback image for pages that don't set one explicitly.
        {
          tag: "meta",
          attrs: { property: "og:image", content: "/og-image.png" },
        },
        {
          tag: "meta",
          attrs: { name: "twitter:card", content: "summary_large_image" },
        },
        {
          tag: "meta",
          attrs: { name: "twitter:image", content: "/og-image.png" },
        },
        // Mermaid diagrams: load mermaid.js client-side so any
        // <pre class="mermaid"> block on a page renders to SVG.
        {
          tag: "script",
          attrs: { type: "module" },
          content: `
            import mermaid from "https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs";
            const isDark = document.documentElement.dataset.theme === "dark";
            mermaid.initialize({ startOnLoad: true, theme: isDark ? "dark" : "default", securityLevel: "loose" });
          `,
        },
      ],
      customCss: ["./src/styles/custom.css"],
    }),
  ],
});
