import type { MetadataRoute } from "next";

/**
 * The manifest is what makes Paloo installable. A phone only shows a
 * notification from a web app it treats as installed, so on iOS this is the
 * step that decides whether the banner ever appears.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "Paloo, account section queue",
    short_name: "Paloo",
    description: "A digital queue for the university account section.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#0b0c0e",
    theme_color: "#0b0c0e",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
