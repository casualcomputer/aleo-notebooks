import { defineCollection, z } from "astro:content";
import { docsLoader } from "@astrojs/starlight/loaders";
import { docsSchema } from "@astrojs/starlight/schema";

// The canonical FAQ markdown lives in `shield_wallet/USERS.md` and
// `shield_wallet/DEVELOPERS.md` and is synced into this site by the
// `predev` / `prebuild` scripts. Those source files carry SEO-friendly
// frontmatter (`keywords`, `audience`) that other renderers may consume —
// Starlight's strict schema would reject them, so we extend the schema to
// accept (and ignore) the extras.
export const collections = {
  docs: defineCollection({
    loader: docsLoader(),
    schema: docsSchema({
      extend: z.object({
        keywords: z.array(z.string()).optional(),
        audience: z.string().optional(),
      }),
    }),
  }),
};
