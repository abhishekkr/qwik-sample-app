import { component$ } from '@builder.io/qwik';
import {
  routeLoader$,
  Link,
} from '@builder.io/qwik-city';
import { PrismaClient } from '@prisma/client';

export const useGetJournal = routeLoader$(async ({ params, status }) => {
  const journalId = parseInt(params['journalId'], 10);
  const prisma = new PrismaClient();
  const journal = await prisma.journal.findUnique({ where: { id: journalId } });
  if (!journal) {
    // Set the status to 404 if the journal is not found
    status(404);
  }
  return journal;
});

export default component$(() => {
  const journal = useGetJournal();
  return (
    <section>
      <section>
        <span class="title">Journal Detail:</span>
        <section class="menu">
          <Link href="/journal" class="menulink">Journals</Link>&nbsp;|&nbsp;
          <Link href="/" class="menulink">Homepage</Link>
        </section>
      </section>
      <br/>
      {journal.value ? (
        <>
          <p>Name: {journal.value.name} (<i>{journal.value.kind}</i>)</p>
          <p>Details: {journal.value.details}</p>
          <p>On: {journal.value.on_date}</p>
          <p>For: {journal.value.duration_minutes}min</p>
        </>
      ) : (
        <p>Journal not found</p>
      )}
    </section>
  );
});
