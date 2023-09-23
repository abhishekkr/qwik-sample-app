import {
  component$,
  createContextId,
  useContextProvider,
  useContext,
  useStore,
  useSignal,
  useOnDocument,
  useOnWindow,
  useStyles$,
  useStylesScoped$,
  useTask$,
  useVisibleTask$,
  useResource$,
  Resource,
  Slot,
  noSerialize,
  type NoSerialize,
  type QRL,
  implicit$FirstArg,
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
      <br/>
      <Greeter fw="Qwik" lang="JS" />
      <br/>
      <br/>
      <SampleTask/>
      <br/>
      <br/>
      <SampleCtx/>
      <br/>
      <br/>
      <SampleSignal/>
      <br/>
      <br/>
      <Clock/>
      <br/>
      <br/>
      <SampleSlot/>
      <br/>
      <br/>
      <SampleNamedSlot/>
      <br/>
      <br/>
      <SampleDelay/>
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
  const windowStore = useStore({ x: 0, y: 0 });
  useOnWindow('mousemove', $((event) => {
      windowStore.x = (event as MouseEvent).x;
      windowStore.y = (event as MouseEvent).y;
  }));
  return (
    <>
      <div onMouseMove$={(event) => { store.x = event.clientX; store.y = event.clientY; console.log(store); }} >
        Your latest mouse line location is ({store.x}, {store.y}).
      </div>
      <div document:onMouseMove$={(event) => { docStore.x = event.clientX; docStore.y = event.clientY; console.log(docStore); }} >
        Your mouse document location is ({docStore.x}, {docStore.y}).
      </div>
      <div>
        Window: ({windowStore.x}, {windowStore.y})
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
interface NoSerialStore {
  time: null | string;
  cleanup: NoSerialize<() => void>;
}
export const NonSerial = component$(() => {
  const dat = useStore<NoSerialStore>({
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

// Component Props
interface GreeterProps {
  salutation: string;
  name: string;
}
export const Greeter = component$((props: GreeterProps) => {
  const helloQrl = $(() => { return 'Hello'; });
  const sayitQrl = $((argName) => { alert("Hello " + argName); });

  return (
    <>
      <div>
        {props.fw} {props.lang}!
      </div>
      <GreeterCb salutation$={helloQrl} name$={() => {alert("World");}} sayit$={sayitQrl} />
    </>
  );
});
// Component Props of Callback fn
interface GreeterCbProps {
  salutation$: PropFunction<() => void>;
  name$: PropFunction<() => void>;
  sayit$: PropFunction<() => void>;
}
export const GreeterCb = component$((props: GreeterCbProps) => {
  return (
    <div>
      <button onClick$={props.name$}>{props.salutation$()}</button>
      <button onClick$={async () => {
        await props.sayit$("QwikJS");
      }}>say hello to Qwik</button>
    </div>
  );
});

// useTask sample
interface CountDelayStore {
  count: number;
  delayCount: number;
}
export const SampleTask = component$(() => {
  const store = useStore({
    count: 0,
    delayCount: 0,
  });
  console.log('Render: <App>');
  useTask$(({ track, cleanup }) => {
    track(() => store.count);
    const id = setTimeout(() => (store.delayCount = store.count), 1250);
    cleanup(() => clearTimeout(id));
  });
  return (
    <>
      <DisplayCountDelay store={store} />
      <button onClick$={() => store.count++}>+1</button>
    </>
  );
});
export const DisplayCountDelay = component$((props: { store: CountDelayStore }) => {
  return <>{props.store.count} | {props.store.delayCount} </>;
});

// use context
export const counterContext = createContextId<CountDelayStore>('CounterXY');
export const SampleCtx = component$(() => {
  const store = useStore({ count: 10 });
  useContextProvider( counterContext, store);
  return (
    <>
      <button onClick$={() => store.count++}>+1</button> <CtxCounter />;
    </>
  );
});
export const CtxCounter = component$(() => {
  const counter = useContext(counterContext);
  return (<>Context Counter at {counter.count}</>);
});

// use signal
export const SampleSignal = component$(() => {
  const store = useStore({ width: 0, height: 0 });
  const outputRef = useSignal<Element>();
  useVisibleTask$(() => {
    if (outputRef.value) {
      const rect = outputRef.value.getBoundingClientRect();
      store.width = Math.round(rect.width);
      store.height = Math.round(rect.height);
    }
  });

  return (
    <>
      <aside style={{ border: '1px solid red', width: '100px' }} ref={outputRef}>
        Change innerhtml text, stretch the box.
      </aside>
      <div>
        The above red box is {store.height} pixels high and {store.width} pixels wide.
      </div>
    </>
  );
});

// useVisibleTask$
interface ClockStore {
  hour: number;
  minute: number;
  second: number;
}
export function updateClock(c: ClockStore) {
  const now = new Date();
  c.second = now.getSeconds();
  c.minute = now.getMinutes();
  c.hour = now.getHours();
}
export const Clock = component$(() => {
  const store = useStore<ClockStore>({hour: 0, minute: 0, second: 0});
  useVisibleTask$(() => {
    const intervalId = setInterval(() => updateClock(store), 1000);
    return () => clearInterval(intervalId);
  });

  return (
    <div class="clock">
      {store.hour} <span> : </span> {store.minute} <span> : </span> {store.second}
    </div>
  );
});

// Projection with Panel & Slots
export const SampleSlot = component$(() => {
  const store = useStore({ count: 0 });
  console.log('Render: <App>');
  return (
    <Panel>
      Count: {store.count}. <button onClick$={() => store.count++}>+1</button>
    </Panel>
  );
});
export const Panel = component$(() => {
  useStyles$(`
    div {
      color: teal;
    }`);
  useStylesScoped$(`
    div {
      background-color: lightgray;
    }`);
  console.log('Render: <Panel>');
  return (
    <div style={{ border: '2px solid teal;', padding: '1em' }}>
      <Slot />
    </div>
  );
});

export function useMousePosition() {
  const mousePosition = useStore({ x: 0, y: 0 });
  useOnDocument('mousemove',
    $((event: Event) => {
      mousePosition.x = (event as MouseEvent).clientX;
      mousePosition.y = (event as MouseEvent).clientY;
    })
  );
  return mousePosition;
}

// Projection Named Slots & Fallback
export const SampleNamedSlot = component$(() => {
  console.log('SampleNamedSlot Render: <App>');
  const mousePosition = useMousePosition();
  return (
    <Collapsable>
      <div q:slot="closed">▶ (...)</div>
      <div q:slot="open">
        ▼<div>
           Collapsible content with Named Slot for open & closed states.<br/>
           (x: {mousePosition.x}, y: {mousePosition.y})
         </div>
      </div>
    </Collapsable>
  );
});
export const Collapsable = component$(() => {
  useStyles$(CSS);
  console.log('SampleNamedSlot Render: <Collapsable>');
  const store = useStore({name: '', open: false});
  return (
    <div onClick$={() => (store.open = !store.open)}>
      {store.open ? <Slot name="open" /> : <Slot name="closed" />}
      <br/>

      <section class="notset">
        <Slot name="notset" />
        <span>{$('Say Hello').resolve()} </span> // lazy-load constants
        <button onClick$={async () => alert(await $('Hello World!').resolve())}>click me</button>
        <br/>
        <label>
        Enter your name followed by the enter key:{' '}
        <input
          onInput$={(event) => { // lazy-load closures
            const input = event.target as HTMLInputElement;
            store.name = input.value;
          }}
          onChange$={() => {
            if (store.name) alert(store.name);
          }}
          value={store.name}
        />
      </label>
      </section>
    </div>
  );
});


export const CSS = `
/* Fallback for slot named "body" */
.notset:empty::before {
  content: 'Fallback body';
  color: orange;
}
`;

// Creating API with $, lazy-load alternative to setTimeout
export function delayQrl<T>(fn: QRL<() => T>, delayInMs: number): Promise<T> {
  return new Promise((res) => {
    setTimeout(() => { res(fn()); }, delayInMs);
  });
}
export const delay$ = implicit$FirstArg(delayQrl);

export const SampleDelay = component$(() => {
  const store = useStore({ count: 0, delay: 0 });
  const mousePosition = useMousePosition();
  return (
    <>
      Count: {store.count} <span>|</span> Delay: {store.delay}  <span>*</span>
      <button onClick$={async () => { store.count++; await delay$(() => store.delay++, 1000); }} >
        +1
      </button>
      <div>(x: {mousePosition.x}, y: {mousePosition.y})</div>
    </>
  );
});
