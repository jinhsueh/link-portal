import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Build-time deck generators — standalone Node scripts, not part of the
    // app bundle. They legitimately import icon sets they don't all use.
    "docs/**",
  ]),
  {
    rules: {
      // This is a link-in-bio app: avatars, banners, social icons, and every
      // user-uploaded block image are dynamic, arbitrary remote URLs. Using
      // next/image would require enumerating remotePatterns for every host a
      // creator might paste AND incurs Vercel image-optimization billing per
      // transform. Plain <img> is the deliberate choice here, so silence the
      // rule rather than sprinkle 31 eslint-disable comments.
      "@next/next/no-img-element": "off",
      // Allow intentional destructure-omit (`const { passwordHash, ...safe }`)
      // and underscore-prefixed throwaways without tripping unused-vars.
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          ignoreRestSiblings: true,
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
    },
  },
]);

export default eslintConfig;
