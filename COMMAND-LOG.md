
## Builder.io's Qwik

* getting started

```
node -v  # <16

npm create qwik@latest   # name: simple-app; type: empty app
cd simple-app

npm install vite@latest

npm start
```

* `routeLoader$` to send data from server to client; `routeAction$` to send data from client to server (using browser's native form API, prefers JS.. works even if JS is disabled)

* Qwik has built-in [Zod](https://zod.dev/) support for TypeScript-first schema validation. With actions can create type-safe forms with data validated at server using `zod$()`

* `npm run qwik add` & select `Adapter: Static Site`; then tweak new `vite.config.ts` for *origin* & *outDir* for SSG support.. everything works, remember the dynamic called data would get static though

> as /anime would show static quote since the page would make call during generate & keep that as there is no SSR

* adding quick `Link` tags in `/` & `/anime` components for cross-browsing

* reactive state is created with `useSignal()` (takes value, for reactive signal) or `useStore()` (takes object as init value & reactivity extends to nested objects/arrays)

> `useSignal()` to signal fav-ing an Anime in sample-app

* Qwik has 3 lifecycle stages: `Task` (run before rendering & state change; run sequentially; block render), `Render` (runs after Task, before VisibleTask), `VisibleTask` (runs when component become visible on browser)

> * `useTask$()` hooks to exec on component creation; runs at least once in server/browser based on where initially rendered.. if tracking state change, will run again (always in browser)
>
> * `useTask$()` without [tracking](https://qwik.builder.io/docs/components/tasks/#track), behaves like `mount` hook so no `on-mount` hook in Qwik

* creating `index.css` at `/anime` component path, `import styles in './index.css?inline'` and `useStylesScoped$(styles);`

* `npm run preview` would create a preview production build; network tab shows bundles instantly delivered from [ServiceWorker cache](https://qwik.builder.io/docs/advanced/speculative-module-fetching/)

> Service Workers aid with connectivity loss issues. Can set an app to use cached asset first, **offline first**. [more](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers)

* Prisma support for DB/Models, with Zod for validations.

> * `npm run qwik add prisma` to add Prisma support, adds default `user` schema & routes.. which I cleaned before proceeding
> * added `Journal` model, `npx prisma migrate dev --name journal` to generate migration SQL and applying it
> * `npx prisma migrate reset` to reset DB state, drops and re-create (for dev only, as incurrs data loss)
> * with `routeAction$` and prisma client Form data can be idiomatically processed

---
