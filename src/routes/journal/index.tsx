import {
  component$,
  useStylesScoped$,
} from '@builder.io/qwik';
import {
  routeLoader$,
  Link
} from '@builder.io/qwik-city';
import { PrismaClient } from '@prisma/client';
import styles from "./index.css?inline";

export const useGetJournals = routeLoader$(async () => {
  const prisma = new PrismaClient();
  const journals = await prisma.journal.findMany();
  return journals;
});

export default component$(() => {
  useStylesScoped$(styles);
  const journals = useGetJournals();

  return (
    <section class="section bright">
      <section>
        <span class="title">Journal</span>
        <section class="menu">
          <Link href="/journal/create" class="menulink">Make a new journal entry.</Link>&nbsp;|&nbsp;
          <Link href="/" class="menulink">Homepage</Link>
        </section>
      </section>
      <br/>
      <ul>
        {journals.value.map((journal) => (
          <li key={journal.id}>
            <a href={`/journal/${journal.id}`}>
              {journal.name} ({journal.duration_minutes}min) on {journal.on_date}
            </a>: <i>{journal.details}</i>
          </li>
        ))}
      </ul>
    </section>
  );
});
