import {
  component$,
  useStore,
  useResource$,
  Resource,
  noSerialize,
  type NoSerialize,
  type QRL,
  $,
} from '@builder.io/qwik';

export default component$(() => {
  const github = useStore({org: 'abhishekkr'});

  const reposResource = useResource$<string[]>(async ({ track, cleanup }) => {
    track(() => github.org);
    const controller = new AbortController();  // abort if re-runs request received
    cleanup(() => controller.abort());
    return getRepositories(github.org, controller);
  });

  return (
    <main>
      <MouseXY/>
      <br/>
      <RecursiveStore/>
      <br/>
      <QRLStore/>
      <br/>
      <NonSerial/>
      <br/>
      <p>
        <label>GitHub org/user:&nbsp;
          <input value={github.org} onInput$={(ev) => (github.org = (ev.target as HTMLInputElement).value)} />
        </label>
      </p>
      <section>
        <ul>
          <Resource
            value={reposResource}
            onPending={() => <p>loading...</p>}
            onRejected={(error) => <>Error: {error.message}</>}
            onResolved={(repos) => (
              <ul>
                {repos.map((repo) => (
                  <li>
                    <a href={`https://github.com/${github.org}/${repo}`}>{repo}</a>
                  </li>
                ))}
              </ul>
            )}
          />
        </ul>
        <a href="/" preventdefault:click>No need to Click.</a>
      </section>
    </main>
  );
});

export async function getRepositories(username: string, controller?: AbortController): Promise<string[]> {
  console.log('FETCH', `https://api.github.com/users/${username}/repos`);
  const resp = await fetch(`https://api.github.com/users/${username}/repos`, {
    signal: controller?.signal,
  });
  const json = await resp.json();
  return Array.isArray(json) ? json.map((repo: { name: string }) => repo.name) : Promise.reject(json);
}

export const MouseXY = component$(() => {
  // can't be inline due to use of useStore
  const store = useStore({ x: 0, y: 0 });
  const docStore = useStore({ x: 0, y: 0 });
  return (
    <>
      <div onMouseMove$={(event) => { store.x = event.clientX; store.y = event.clientY; console.log(store); }} >
      Your latest mouse line location is ({store.x}, {store.y}).
      </div>
      <div document:onMouseMove$={(event) => { docStore.x = event.clientX; docStore.y = event.clientY; console.log(docStore); }} >
      Your mouse document location is ({docStore.x}, {docStore.y}).
      </div>
    </>
  );
});

export const RecursiveStore = component$(() => {
  const dat = useStore({ counter: { count: 0 }, list: [0] });
  const shallowDat = useStore({ counter: { count: 0 }, list: [0] }, { deep: false });

  return (
    <>
      <div>
        <Display counter={dat.counter} list={dat.list} />
        <button onClick$={() => dat.counter.count++}>+1 Count</button>
        <button onClick$={() => dat.list.push(0)}>+1 List element</button>
      </div>
      <div>
        <Display counter={shallowDat.counter} list={shallowDat.list} />
        <button onClick$={() => (shallowDat.counter = { count: shallowDat.counter.count+2 })}>+2 Count</button>
        <button onClick$={() => (shallowDat.list = [...shallowDat.list, 0, 0])}>+2 List element</button>
      </div>
    </>
  );
});
interface DisplayProps {
  counter: { count: number };
  list: number[];
}
export const Display = component$((props: DisplayProps) => {
  return (
    <div>Count: {props.counter.count}, List length: {props.list.length}</div>
  );
});

// Serializable example with QRLs & Cyclical reference
interface ParentStore {
  name: string;
  children: ChildStore[];
  greet: QRL<(p: ParentStore) => void>;
}
interface ChildStore { name: string; p: ParentStore; }
export const QRLStore = component$(() => {
  const alice: ParentStore = {
    name: 'Alice',
    children: [],
    greet: $((p) => alert(p.name)),
  };
  alice.children = [{ name: 'Bob', p: alice }, { name: 'Eve', p: alice }];
  const frnds = useStore<ParentStore>(alice, { deep: true });
  return (
    <>
      {frnds.name}&nbsp;
      <button onClick$={async () => await frnds.greet(alice)}>Greet</button>
      <ul>
        {frnds.children.map((child) => (
          <li>{child.name} is a friend of {child.p.name}&nbsp;
            <button onClick$={async () => await frnds.greet(child)}>Greet</button>
          </li>
        ))}
      </ul>
    </>
  );
});

// Non-Serializable Example
interface AppStore {
  time: null | string;
  cleanup: NoSerialize<() => void>;
}
export const NonSerial = component$(() => {
  const dat = useStore<AppStore>({
    time: null,
    cleanup: undefined,
  });
  return (
    <>
      <div>Current Time: {dat.time}</div>
      <button
        onClick$={() => {
          dat.time = new Date().toString();
          const id = setInterval(() => (dat.time = new Date().toString()), 1000);
          dat.cleanup = noSerialize(() => clearInterval(id));
        }}
      > start </button>
      <button
        onClick$={() => {
          dat.time = null;
          dat.cleanup && dat.cleanup();
          dat.cleanup = undefined;
        }}
      > stop </button>
    </>
  );
});

