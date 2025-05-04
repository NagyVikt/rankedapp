# Intelligens Marketing Automatizálási Platform

**Verzió:** Beta 0.1

Ez a projekt egy TypeScript alapú intelligens marketing automatizálási platform fejlesztését célozza. A webalkalmazás mesterséges intelligencia segítségével automatizálja és optimalizálja a különböző marketing feladatokat, különös tekintettel az e-mail kampányokra, AI ügynökökre és SEO tartalomkészítésre. Képes kapcsolódni WooCommerce webshopokhoz termékadatok lekérésére és elemzésére.

## Főbb Funkcionalitások

* **E-mail Kampánykezelés:** Kampányok létrehozása, ütemezése, küldése, nyomon követése, A/B tesztelés, automatizált e-mailek (Unlayer, React Email).
* **Marketing AI Ügynök Feladatok (AI Job Tracker):** Előre definiált marketing feladatok automatizálása (pl. Elhagyott Kosár, Üdvözlő E-mail, Kupon Generátor, Influencer AI, Termékleírás SEO AI, Árfigyelő AI) webhookok és AI segítségével. A feladatok státusza követhető és naplózható.
* **AI SEO Tartalomírás:** Mesterséges intelligencia alkalmazása SEO-optimalizált tartalmak (blogbejegyzések, termékleírások stb.) létrehozására és optimalizálására.
* **WooCommerce Integráció:** Termékadatok (leírás, ár, SEO metaadatok) lekérése és elemzése API kulcsok segítségével.
* **Influencer Platform:** Influencerek regisztrációja, keresése, kampánykezelés.

## Felhasznált Technológiák

**Frontend & UI:**

* [Next.js (v15+, App Router)](https://nextjs.org/)
* [React (v18+)](https://react.dev/)
* [TypeScript (v5+)](https://www.typescriptlang.org/)
* [HeroUI/React](https://heroui.com/)
* [Radix UI](https://www.radix-ui.com/)
* [Tailwind CSS](https://tailwindcss.com/)
* [Class Variance Authority (cva)](https://cva.style/docs) (Hasonló a Tailwind Variants-hez)
* [tailwind-merge](https://github.com/dcastil/tailwind-merge)
* [Framer Motion](https://www.framer.com/motion/)
* [Recharts](https://recharts.org/)
* [Lucide React](https://lucide.dev/)
* [Iconify](https://iconify.design/)
* [@hello-pangea/dnd](https://github.com/hello-pangea/dnd) (Drag & Drop)
* [next-themes](https://github.com/pacocoursey/next-themes) (Téma váltás)

**Backend & Adatbázis:**

* [Supabase](https://supabase.com/) (Backend as a Service: PostgreSQL, Auth, Storage)
* [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
* [Drizzle ORM](https://orm.drizzle.team/)
* [Drizzle Kit](https://orm.drizzle.team/kit-docs/overview) (Migrációk)

**AI Integrációk:**

* [Vercel AI SDK](https://sdk.vercel.ai/)
* [OpenAI](https://openai.com/)
* [OpenRouter](https://openrouter.ai/)
* [Together AI](https://www.together.ai/)
* [DeepSeek](https://www.deepseek.com/)
* [Google Gemini](https://ai.google.dev/)
* [Firecrawl](https://firecrawl.dev/) (Web tartalom feldolgozás)

**E-mail:**

* [Unlayer (react-email-editor)](https://unlayer.com/) (Szerkesztő)
* [React Email](https://react.email/) (Sablonok, küldés)

**Fizetés:**

* [Stripe](https://stripe.com/)

**Állapotkezelés & Adatlekérés:**

* [SWR](https://swr.vercel.app/)
* [React Context API](https://react.dev/reference/react/useContext)

**Fejlesztési Eszközök & Egyéb:**

* [Biome](https://biomejs.dev/) (Linting/Formázás)
* [ESLint](https://eslint.org/) (Linting)
* [Zod](https://zod.dev/) (Validáció)
* [Upstash RateLimit](https://upstash.com/docs/ratelimit/overview)
* [Vercel Blob](https://vercel.com/storage/blob) (Fájltárolás)
* [Vercel Analytics](https://vercel.com/analytics)
* [Git](https://git-scm.com/) (Verziókezelés)
* [Docker](https://www.docker.com/) (Opcionális konténerizáció)

## Telepítés és Indítás

**Előfeltételek:**

* Node.js (ajánlott LTS verzió)
* npm vagy yarn csomagkezelő
* Git

**Telepítés:**

1.  **Klónozd a repository-t:**
    ```bash
    git clone https://github.com/NagyVikt/rankedapp.git # Helyettesítsd be a saját repository URL-eddel
    cd rankedapp
    ```

2.  **Telepítsd a függőségeket:**
    ```bash
    npm i
    ```
    *(Vagy ha yarn-t használsz: `yarn install`)*

3.  **Környezeti Változók Beállítása:**
    * Másold le a `.env.example` fájlt `.env.local` néven: `cp .env.example .env.local`
    * Töltsd ki a `.env.local` fájlt a szükséges értékekkel (Supabase URL/kulcsok, Stripe kulcsok, AI API kulcsok, adatbázis URL, Vercel Blob token, Upstash Redis URL/token stb.). Ezeket a megfelelő szolgáltatók adminisztrációs felületein találod.
    * **Fontos:** A `.env.local` fájlt soha ne tedd a verziókövető rendszerbe (a `.gitignore` fájlnak tartalmaznia kell).

4.  **Adatbázis Migráció (Drizzle):**
    * Győződj meg róla, hogy a `DATABASE_URL` helyesen van beállítva a `.env.local` fájlban.
    * Futtasd a migrációt a séma létrehozásához/frissítéséhez:
        ```bash
        npm run db:push
        ```
        *(Vagy a Drizzle Kit specifikus parancsát, ha van ilyen definiálva a `package.json`-ban)*

5.  **Fejlesztői Szerver Indítása:**
    ```bash
    npm run dev
    ```
    *(Vagy ha yarn-t használsz: `yarn dev`)*

Az alkalmazás alapértelmezetten a `http://localhost:3000` címen lesz elérhető.

## Következő Lépések

A projekt további fejlesztése a "Projekt Terv Vázlat" dokumentumban részletezett ütemezés szerint halad, beleértve a funkciók részletes specifikálását, UI/UX tervezést és az egyes modulok implementálását.
