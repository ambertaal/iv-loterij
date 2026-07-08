# Iv Loterij

Een trekkingsinstrument om uit een lijst deelnemers een winnaar te trekken via een
draaiend rad — gebouwd met Vue 3, Nuxt 4 en shadcn-vue, in de huisstijl van Iv
(donkere achtergrond, groen accent `#78c864`, witte tekst).

## Functionaliteit

- Deelnemerslijst invoeren (één naam per regel), individueel verwijderen via chips
- Prijs instellen per trekking ("wat is er te winnen")
- Rad draaien met een vloeiende, vertragende animatie naar een willekeurige winnaar
- Winnaar-dialoog met naam en prijs
- Trekkingslogboek met naam, prijs en tijdstip per trekking
- Optie om de winnaar automatisch uit de pool te verwijderen, zodat je meerdere
  prijzen achter elkaar kunt trekken zonder herhaling

## Projectstructuur

```
app/
  assets/css/tailwind.css   Tailwind v4 theme (Iv-kleuren)
  components/
    ui/                     shadcn-vue componenten (Button, Card, Dialog, Table, ...)
    LotteryWheel.vue         Canvas-rad component
  composables/
    useLottery.ts            State: deelnemers, prijs, trekkingslogboek
  utils/
    wheel.ts                 Pure logica: namen parsen, winnaar kiezen, rotatie berekenen
  pages/
    index.vue                Hoofdpagina
tests/unit/                  Vitest unit tests voor utils/ en composables/
.github/workflows/deploy.yml GitHub Actions workflow voor GitHub Pages
```

## Lokaal draaien

Vereist Node.js 20+.

```bash
npm install
npm run dev
```

De app draait daarna op http://localhost:3000.

## Testen

Unit tests draaien met [Vitest](https://vitest.dev):

```bash
npm run test        # eenmalig
npm run test:watch  # watch mode
```

De tests dekken de kernlogica: het parsen van de deelnemerslijst, het willekeurig
kiezen van een winnaar, de rotatieberekening van het rad, en de composable die de
trekkingsstate (deelnemers, prijs, logboek) beheert.

## Hosten op GitHub Pages

Deze repo bevat een kant-en-klare workflow (`.github/workflows/deploy.yml`) die bij
elke push naar `main`:

1. de unit tests draait,
2. de site statisch bouwt met `nuxt build --preset github_pages`,
3. het resultaat publiceert naar GitHub Pages via de officiële
   [`actions/deploy-pages`](https://github.com/actions/deploy-pages) action.

### Eenmalige instellingen

1. Zet in de repository-instellingen **Settings → Pages → Source** op **GitHub
   Actions**.
2. Push naar `main` (of start de workflow handmatig via **Actions → Deploy naar
   GitHub Pages → Run workflow**).
3. De site komt beschikbaar op `https://<gebruikersnaam>.github.io/<repository-naam>/`.

De workflow leidt de base-URL automatisch af uit de repository-naam
(`NUXT_APP_BASE_URL: /${{ github.event.repository.name }}/`). Gebruik je een custom
domain, verwijder dan die regel (of zet de waarde op `/`).

### Lokaal een productie-build simuleren

```bash
NUXT_APP_BASE_URL=/iv-loterij/ npx nuxt build --preset github_pages
npx serve .output/public
```

## Het logo en de kleuren aanpassen

- Logo: vervang `public/iv-logo.png`.
- Kleuren: pas de CSS-variabelen aan in `app/assets/css/tailwind.css`
  (`--background`, `--primary`/`--accent`, etc.).
