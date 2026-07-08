# Lottery

An app to draw a winner from a list of participants via a spinning
wheel — built with Vue 3, Nuxt 4 and shadcn-vue, in Iv's branding

## Features

- Enter a participant list (one name per line), remove individually via chips
- Set a prize per draw ("what is there to win")
- Spin the wheel with a smooth, decelerating animation to a random winner
- Winner dialog with name and prize
- Log with name, prize and time per draw
- Option to automatically remove the winner from the pool, so you can draw
  multiple prizes in a row without repeats

## Project structure

```
app/
  assets/css/tailwind.css   Tailwind v4 theme (Iv colors)
  components/
    ui/                     shadcn-vue components (Button, Card, Dialog, Table, ...)
    LotteryWheel.vue         Canvas wheel component
  composables/
    useLottery.ts            State: participants, prize, draw log
  utils/
    wheel.ts                 Pure logic: parsing names, choosing a winner, calculating rotation
  pages/
    index.vue                Main page
tests/unit/                  Vitest unit tests for utils/ and composables/
.github/workflows/deploy.yml GitHub Actions workflow for GitHub Pages
```

## Running locally

Requires Node.js 22+.

```bash
pnpm install
pnpm dev
```

The app then runs on http://localhost:3000.

## Testing

Unit tests run with [Vitest](https://vitest.dev):

```bash
pnpm test        # once
pnpm test:watch  # watch mode
```

The tests cover the core logic: parsing the participant list, randomly
choosing a winner, the wheel's rotation calculation, and the composable that
manages the draw state (participants, prize, log).

## Hosting on GitHub Pages

This repo contains a ready-to-use workflow (`.github/workflows/deploy.yml`) that,
on every push to `main`:

1. runs the unit tests,
2. statically builds the site with `nuxt build --preset github_pages`,
3. publishes the result to GitHub Pages via the official
   [`actions/deploy-pages`](https://github.com/actions/deploy-pages) action.

### One-time setup

1. In the repository settings, set **Settings → Pages → Source** to **GitHub
   Actions**.
2. Push to `main` (or start the workflow manually via **Actions → Deploy to
   GitHub Pages → Run workflow**).
3. The site will become available at `https://<username>.github.io/<repository-name>/`.

The workflow automatically derives the base URL from the repository name
(`NUXT_APP_BASE_URL: /${{ github.event.repository.name }}/`). If you use a custom
domain, remove that line (or set the value to `/`).

### Simulating a production build locally

```bash
NUXT_APP_BASE_URL=/iv-loterij/ npx nuxt build --preset github_pages
npx serve .output/public
```

## Customizing the logo and colors

- Logo: replace `public/logo.png`.
- Colors: adjust the CSS variables in `app/assets/css/tailwind.css`
  (`--background`, `--primary`/`--accent`, etc.).
