import type { StorybookConfig } from '@storybook/react-vite';

import { dirname } from "path"

import { fileURLToPath } from "url"

import remarkGfm from "remark-gfm"

/**
* This function is used to resolve the absolute path of a package.
* It is needed in projects that use Yarn PnP or are set up within a monorepo.
*/
function getAbsolutePath(value: string) {
  return dirname(fileURLToPath(import.meta.resolve(`${value}/package.json`)))
}
const config: StorybookConfig = {
  "stories": [
    "../src/**/*.mdx",
    "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"
  ],
  "addons": [
    getAbsolutePath('@storybook/addon-vitest'),
    getAbsolutePath('@storybook/addon-a11y'),
    {
      name: getAbsolutePath('@storybook/addon-docs'),
      options: {
        // Plain Markdown tables in .mdx pages render as raw pipe-and-dash
        // text without this: Storybook's MDX compiler doesn't include GFM
        // (tables, strikethrough, task lists) by default.
        mdxPluginOptions: {
          mdxCompileOptions: {
            remarkPlugins: [remarkGfm],
          },
        },
      },
    },
  ],
  "framework": getAbsolutePath('@storybook/react-vite'),
  "core": {
    // Rule: the Storybook UI shows only the product name. Hide the
    // "what's new" release-notes notifications (base shadcn/Storybook
    // provenance lives in .storybook/TECHNICAL-NOTE.md instead).
    disableWhatsNewNotifications: true,
    disableTelemetry: true,
  },
};
export default config;