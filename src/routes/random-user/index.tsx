import {
  component$,
  useSignal,
  useStylesScoped$,
  useTask$,
} from '@builder.io/qwik';
import {
  routeLoader$,
  server$,
  Link
} from '@builder.io/qwik-city';
import VoteForm from "../../components/vote_form";
import styles from "./index.css?inline";

import { fetch } from "undici";

/*
 * doc: https://qwik.builder.io/docs/route-loader/
 *
 *
import { fetch, setGlobalDispatcher, Agent, Pool } from "undici";

setGlobalDispatcher(
  new Agent({ factory: (origin) => new Pool(origin, { connections: 128 }) })
);
*/

interface RandomUserProps {
  id?: {
    value: string;
  };
  gender?: string;
  name?: {
    title?: string;
    first?: string;
    last?: string;
  };
  picture?: {
    thumbnail?: string;
  };
}


export const useRandomUser = routeLoader$(async () => {
  try {
    const response = await fetch('https://randomuser.me/api/?results=1', {
      headers: {Accept: 'application/json'},
      host: "randomuser.me",
      "user-agent": "curl/8.0.1",
    });
    return (await response.json()) as {
      results?:  [RandomUserProps];
    };
  } catch(error) {
    console.log("[ERROR]", error);
  }
  return ({
    results: [{
      id: { value: "n/a" },
      gender: "male",
      name: { title: "Mr.", first: "John", last: "Doe", },
      picture: { thumbnail: "#" }
    }]
  });
});


export default component$(() => {
  useStylesScoped$(styles);
  const randomUser = useRandomUser();

  return (
    <section class="section bright">
      <section>
        <span class="title">Anime Quote</span>
        <Link href="/" class="menu">Homepage</Link>
      </section>
      <br/>
      <RandomUserDetails
        title={randomUser.value.results[0].name.title}
        firstName={randomUser.value.results[0].name.first}
        lastName={randomUser.value.results[0].name.last}
        picture={randomUser.value.results[0].picture.thumbnail}
      />
      <VoteForm
        category="randomUser"
        name={randomUser.value.results[0].id.value}
      />
    </section>
  );
});

const RandomUserDetails = component$<RandomUserProps>((props) => {
  const isFavSignal = useSignal(false);

  useTask$(({track}) => {
    track(() => isFavSignal.value);
    console.log('FAV (isomorphic)', isFavSignal.value);
    server$(() => {
      console.log('FAV (server)', isFavSignal.value);
    })(); // if not called, would remain as dead code without warning
  });

  return (<section>
    <div class="randomUser">
      <img src={props.picture}></img>
    </div>
    <br/>
    <div class="randomUserDetails">
        Name: <span class="randomUserName">{props.title} {props.firstName} {props.lastName}</span>
        <button onClick$={() => (isFavSignal.value = !isFavSignal.value)}>
          {isFavSignal.value ? '❤️' : '♡'}
        </button>
    </div>
    <br/>
  </section>)
});
