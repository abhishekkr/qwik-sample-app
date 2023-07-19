import {
  component$,
  useStylesScoped$,
} from '@builder.io/qwik';
import {
  routeAction$,
  server$,
  Form,
  Link
} from '@builder.io/qwik-city';
import styles from "./index.css?inline";

export const useDelayedCall = routeAction$(async (data, requestEvent) => {
  const delay = function(time) {
    return new Promise(resolve => setTimeout(resolve, time));
  };
  try {
    // This will only run on the server when the user submits the form (or when the action is called programmatically)
    const userID = data.firstName + " " + data.lastName; // removed DB store for now
    console.log(userID + " waiting for " + data.delay);
    await delay(parseInt(data.delay));
    server$(() => {
      console.log("done waiting");
    })();
    return {
      success: true,
      delay: data.delay,
      userID,
    };
  } catch(error) {
    console.log("[ERROR]", error);
  }
  return ({
    success: false,
  });
});

export default component$(() => {
  useStylesScoped$(styles);
  const action = useDelayedCall();
 
  return (
    <>
      <section>
        <span class="title">Anime Quote</span>
        <Link href="/" class="menu">Homepage</Link>
      </section>
      <div class="subtitle">Submit for with delay in action, for a synchronous heavy task</div>
      <Form action={action}>
        <p>
          <label>First Name: </label> <input name="firstName" /><br/>
        </p>
        <p>
          <label>Last Name: </label> <input name="lastName" /><br/>
        </p>
        <p>
          <label>Result Delay: </label> <input name="delay" value="1000" /><br/>
        </p>
        <button type="submit">Add user</button>
      </Form>
      {action.value?.success && (
        // When the action is done successfully, the `action.value` property will contain the return value of the action
        <p>User {action.value.userID} added successfully & waited for {action.value.delay}</p>
      )}
    </>
  );
});
