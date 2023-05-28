import { component$ } from '@builder.io/qwik';
import { routeLoader$, routeAction$, Form, Link } from '@builder.io/qwik-city';


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
  const animeQuote = useAnimeQuote();
  const animeQuoteVoteAction = useAnimeQuoteVoteAction();

  return (
    <section class="section bright">
      <h3>Anime Quote</h3><br/>
      <b>{animeQuote.value.quote}</b><br/>
      <p>
          <i>"{animeQuote.value.character}"</i> in <i>"{animeQuote.value.anime}"</i>
      </p>
      <Form action={animeQuoteVoteAction}>
        <input type="hidden" name="anime" value={animeQuote.value.anime} />
        <button name="vote" value="up">👍</button>
        <button name="vote" value="down">👎</button>
      </Form>
      <Link href="/">Homepage</Link>
    </section>
  );
});
