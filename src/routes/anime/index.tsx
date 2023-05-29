import {
  component$,
  useSignal,
  useStylesScoped$,
  useTask$,
} from '@builder.io/qwik';
import {
  routeLoader$,
  routeAction$,
  server$,
  Form,
  Link
} from '@builder.io/qwik-city';
import styles from "./index.css?inline";


export const useAnimeQuote = routeLoader$(async () => {
  const response = await fetch('https://animechan.vercel.app/api/random', {
    headers: {Accept: 'application/json'},
  });
  return (await response.json()) as {
    anime: string;
    character: string;
    quote: string;
  };
});


export const useAnimeQuoteVoteAction = routeAction$((props) => {
  console.log('[vote]', props);
});


export default component$(() => {
  useStylesScoped$(styles);
  const isFavSignal = useSignal(false);
  const animeQuote = useAnimeQuote();
  const animeQuoteVoteAction = useAnimeQuoteVoteAction();

  useTask$(({track}) => {
    track(() => isFavSignal.value);
    console.log('FAV (isomorphic)', isFavSignal.value);
    server$(() => {
      console.log('FAV (server)', isFavSignal.value);
    })(); // if not called, would remain as dead code without warning
  });

  return (
    <section class="section bright">
      <section>
        <span class="title">Anime Quote</span>
        <Link href="/" class="menu">Homepage</Link>
      </section><br/>
      <section class="animeQuote">
        <span>{animeQuote.value.quote}</span>
      </section><br/>
      <section class="animeQuoteDetails">
          <span class="animeCharacter">"{animeQuote.value.character}"</span> in
          <span class="animeName">"{animeQuote.value.anime}" </span>
          <button onClick$={() => (isFavSignal.value = !isFavSignal.value)}>
            {isFavSignal.value ? '❤️' : '♡'}
          </button>
      </section><br/>
      <section class="animeVoteForm">
        <Form action={animeQuoteVoteAction}>
          <input type="hidden" name="anime" value={animeQuote.value.anime} />
          <button name="vote" value="up">👍</button>
          <button name="vote" value="down">👎</button>
        </Form>
      </section><br/>
    </section>
  );
});
