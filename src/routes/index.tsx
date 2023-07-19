import { component$, useStylesScoped$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import { Link } from '@builder.io/qwik-city';
import styles from "./index.css?inline";

export default component$(() => {
  useStylesScoped$(styles);
  return (
    <>
      <h1>Hi 👋</h1>
      <p>
        This is Sample App, created with Empty App starter.
      </p>
      <ul>
        <li><Link href="/random-user">Random User, with routeLoader$</Link></li>
        <li><Link href="/use-action">Sample For, with routeAction$</Link></li>
      </ul>
    </>
  );
});

export const head: DocumentHead = {
  title: 'Welcome to Qwik',
  meta: [
    {
      name: 'description',
      content: 'Qwik site description',
    },
  ],
};
