import {
  component$,
} from '@builder.io/qwik';
import {
  routeAction$,
  Form,
} from '@builder.io/qwik-city';


export const useVoteAction = routeAction$((props) => {
  console.log('[vote]', props.name, '|', props.category);
});

interface VoteProps {
  category?: string;
  name?: string;
}

export default component$<VoteProps>((props) => {
  const voteAction = useVoteAction();

  return (<section class="voteForm">
        <Form action={voteAction}>
          <input type="hidden" name="category" value={props.category} />
          <input type="hidden" name="name" value={props.name} />
          <button name="vote" value="up">👍</button>
          <button name="vote" value="down">👎</button>
        </Form>
    </section>);
});
