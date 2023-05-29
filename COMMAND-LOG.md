
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
