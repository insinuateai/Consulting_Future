/**
 * Tailwind CSS v4 — this file is referenced via `@config` in globals.css.
 * In v4, all design tokens (colors, fonts, animations) live in CSS @theme blocks.
 * This file is kept minimal; its primary role is content path declaration.
 */
const config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/sections/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
}

export default config
