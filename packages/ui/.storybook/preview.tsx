import type { Preview } from '@storybook/react-vite'

import "./fonts.css"
import "../src/styles/globals.css"

// Rule 9: the theme switch sets the theme on the document root element, not
// just the story wrapper, so dialogs, menus and popovers rendered in a
// portal outside the story (Radix) also pick it up.
function applyTheme(theme: string) {
  document.documentElement.classList.toggle("dark", theme === "dark")
}

// `design-system:test` (package.json) runs the Storybook/Vitest project
// twice, once per VITE_STORYBOOK_THEME value, so every story is checked —
// contrast, a11y, interactions — in both themes, not only the default.
const initialTheme = import.meta.env.VITE_STORYBOOK_THEME === "dark" ? "dark" : "light"

const preview: Preview = {
  initialGlobals: {
    theme: initialTheme,
  },
  globalTypes: {
    theme: {
      name: "Theme",
      description: "Light or dark theme, set on <html> (rule 9)",
      toolbar: {
        icon: "mirror",
        items: [
          { value: "light", title: "Light" },
          { value: "dark", title: "Dark" },
        ],
        dynamicTitle: true,
      },
    },
  },
  decorators: [
    (Story, context) => {
      applyTheme(context.globals.theme ?? initialTheme)
      return <Story />
    },
  ],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: {
      // 'error' fails the Vitest run (and therefore `npm test`/CI) on any
      // violation, instead of only surfacing it in the Storybook UI.
      test: "error",
    },
  },
};

export default preview;