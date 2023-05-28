import { component$ } from '@builder.io/qwik';
import { routeLoader$ } from '@builder.io/qwik-city';


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

export default component$(() => {
  const animeQuote = useAnimeQuote();
  return (
    <section class="section bright">
      <h3>Anime Quote</h3><br/>
      <b>{animeQuote.value.quote}</b><br/>
      <p>
          <i>"{animeQuote.value.character}"</i> in <i>"{animeQuote.value.anime}"</i>
      </p>
    </section>
  );
});
