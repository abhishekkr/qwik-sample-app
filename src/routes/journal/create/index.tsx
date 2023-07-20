import {
  component$,
  useStylesScoped$,
} from '@builder.io/qwik';
import {
  routeAction$,
  zod$,
  z,
  Form,
  Link,
} from '@builder.io/qwik-city';
import { PrismaClient } from '@prisma/client';
import styles from "./index.css?inline";

export const useCreateJournal = routeAction$(
  async (data) => {
    data.duration_minutes = parseInt(data.duration_minutes);
    const prisma = new PrismaClient();
    const journal = await prisma.journal.create({
      data,
    });
    return journal;
  },
  zod$({
    name: z.string(),
    kind: z.string(),
    duration_minutes: z.string().refine(
      (x) => { return x.match(/[0-9]/g) != null; },
      { message: 'Must be a whole number.' }
    ),
    details: z.string(),
    on_date: z.string().refine(
      (x) => { return x.match(/^[0-9][0-9][0-9][0-9]\-[0-9][0-9]*\-[0-9][0-9]*$/) != null; },
      { message: 'Must be a YYYY-MM-DD format date.' }
    ),
  })
);

export default component$(() => {
  useStylesScoped$(styles);
  const createJournalAction = useCreateJournal();
  const getToDate = function(){
    const today = new Date();
    return today.getFullYear() + "-" + today.getMonth() + "-" + today.getDate();
  };
  return (
    <section>
      <section>
        <span class="title">Journal Entry:</span>
        <section class="menu">
          <Link href="/journal" class="menulink">Journal Entries.</Link>&nbsp;|&nbsp;
          <Link href="/" class="menulink">Homepage</Link>
        </section>
      </section>
      <Form action={createJournalAction}>
        <label>
          Name*
          <input name="name" value={createJournalAction.formData?.get('name')} />
        </label>
        <label>
          Kind
          <input name="kind" value={createJournalAction.formData?.get('kind')} />
        </label>
        <label>
          Duration* (in minutes)
          <input name="duration_minutes" value={createJournalAction.formData?.get('duration_minutes')} />
        </label>
        <label>
          Any Details
          <input name="details" value={createJournalAction.formData?.get('details')} />
        </label>
        <label>
          Date*
          <input name="on_date" value={createJournalAction.formData?.get('on_date') || getToDate()} />
        </label>
        <button type="submit">Create</button>
      </Form>
      {createJournalAction.value && (
        <div>
          <h2>Journal created successfully!</h2>
        </div>
      )}
    </section>
  );
});
