import { defineConfig } from "astro/config";
import preact from "@astrojs/preact";

export default defineConfig({
  site: "https://crosspec.com",
  integrations: [preact()],
  build: {
    inlineStylesheets: "auto",
  },
});
