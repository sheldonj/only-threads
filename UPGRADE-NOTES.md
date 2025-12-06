# Tailwind CSS v3 → v4 Upgrade Summary

This document outlines the changes made to upgrade this project from Tailwind CSS v3 to v4, following the official upgrade guide and shadcn/ui v4 best practices.

## Changes Made

### 1. Dependencies Updated
**File:** `package.json`
- ✅ Updated `tailwindcss` from `^3.4.16` to `^4.1.17`
- ✅ Added `@tailwindcss/postcss` `^4.1.17` for PostCSS plugin integration

### 2. Configuration Migration
**Files:** `tailwind.config.ts` → `app/globals.css` + `tailwind-plugin.ts`

Tailwind v4 moves configuration from JavaScript to CSS:
- ✅ Backed up old `tailwind.config.ts` to `tailwind.config.ts.backup`
- ✅ Migrated theme configuration to CSS `@theme` directive in `app/globals.css`
- ✅ Moved custom plugins (bg-grid, bg-dot utilities) to `tailwind-plugin.ts`
- ✅ Configured container settings, border radius, shadows in CSS variables

### 3. CSS File Updates
**File:** `app/globals.css`
- ✅ Replaced `@tailwind base/components/utilities` with `@import "tailwindcss"`
- ✅ Added `@plugin "tailwindcss-animate"` for animations
- ✅ Added `@config "../tailwind-plugin.ts"` for custom utilities
- ✅ Added `@source` directives to detect classes in components
- ✅ Migrated container, radius, and shadow configurations to `@theme` block
- ✅ Removed duplicate accordion animations (now handled by tailwindcss-animate)
- ✅ Moved `.no-visible-scrollbar` utility to `@layer utilities`

### 4. Build Configuration
**Files:** `next.config.ts`, `postcss.config.mjs`
- ✅ Kept `next.config.ts` minimal (no changes needed for PostCSS approach)
- ✅ Updated `postcss.config.mjs` to use `@tailwindcss/postcss` plugin
- ✅ Removed old `tailwindcss` plugin reference from PostCSS config

### 5. shadcn/ui Configuration
**File:** `components.json`
- ✅ Set `tailwind.config` to empty string (v4 uses CSS config)
- ✅ Added `cssVariablesPrefix: ""` for v4 compatibility
- ✅ Maintained existing CSS variables and prefix settings

### 6. Deprecated Utilities Removed
**File:** `components/ui/tabs2.tsx`
- ✅ Replaced `bg-opacity-0` with `bg-transparent`
- ✅ Replaced `text-opacity-100` with `opacity-100`

## Custom Plugin Migration

The custom background utilities (bg-grid, bg-grid-small, bg-dot) and color variable injection have been moved to `tailwind-plugin.ts`. This file is referenced via `@config` in `globals.css` and provides:

- `bg-grid-{color}` - Grid background pattern
- `bg-grid-small-{color}` - Small grid background pattern  
- `bg-dot-{color}` - Dot background pattern
- Automatic CSS variable generation for all colors

## Browser Support

⚠️ **Important:** Tailwind CSS v4 requires:
- Safari 16.4+
- Chrome 111+
- Firefox 128+

If you need to support older browsers, consider staying on v3.4 or wait for a compatibility mode.

## Testing Checklist

Before deploying, verify:
- [ ] Development server starts without errors: `pnpm dev`
- [ ] All pages render correctly
- [ ] Dark mode toggle works
- [ ] All shadcn/ui components display properly
- [ ] Custom background utilities (bg-grid, bg-dot) work
- [ ] Animations function correctly
- [ ] No console errors related to Tailwind

## Next Steps

1. Run `pnpm dev` to start the development server
2. Test all pages and components visually
3. Verify responsive behavior works as expected
4. Check dark mode switching
5. Test any custom Tailwind utilities you've created
6. If everything works, delete `tailwind.config.ts.backup`

## Reverting (if needed)

If you encounter issues:
1. Restore `tailwind.config.ts.backup` to `tailwind.config.ts`
2. Revert `package.json` to use Tailwind v3
3. Restore original `app/globals.css` from git
4. Delete `tailwind-plugin.ts`
5. Restore `postcss.config.mjs`
6. Run `pnpm install`

## References

- [Tailwind CSS v4 Upgrade Guide](https://tailwindcss.com/docs/upgrade-guide)
- [shadcn/ui Tailwind v4 Guide](https://ui.shadcn.com/docs/tailwind-v4)
- [Tailwind CSS v4 Announcement](https://tailwindcss.com/blog/tailwindcss-v4)

