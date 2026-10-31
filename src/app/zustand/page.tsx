"use client";

import { Button } from "@/components/ui/button";
import { useCounterStore } from "./store";
import { useEffect } from "react";

const logCount = () => {
  const count = useCounterStore.getState().count;
  console.log("count: ", count);
};

const setCount = () => {
  const count = useCounterStore.setState({ count: 1 });
  console.log("count: ", count);
};

const setName = () => {
  const name = useCounterStore.setState({ name: "Mike" });
};

const Page = () => {
  const { count } = useCounterStore((state) => state);
  console.log("rerendered the page");
  return <OtherComponet count={count} />;
};

const OtherComponet = ({ count }: { count: number }) => {
  const increment = useCounterStore((state) => state.increment);
  const decrement = useCounterStore((state) => state.decrement);
  const name = useCounterStore((state) => state.name);
  const incrementAsync = useCounterStore((state) => state.incrementAsync);

  useEffect(() => {
    setCount();
    setName();
  }, []);
  return (
    <>
      <div>{count}</div>
      {/* <Button onClick={increment}>Increment</Button> */}
      <Button onClick={incrementAsync}>IncrementAsync</Button>
      <Button onClick={decrement}>Decrement</Button>
      <p>{name}</p>
    </>
  );
};

export default Page;

// function outerFunction(outer) {
//   return function innerFunction(inner) {
//     console.log("Outer variable is: ", outer);
//     console.log("inner variable is: ", inner);
//   };
// }

// const newFn = outerFunction("Mike");
// newFn("Mike's child");

// function createStore(initialState) {
//   let state = initialState;
//   const listeners = new Set();

//   function getState() {
//     return state;
//   }

//   function setState(partial) {
//     state = { ...state, ...partial };
//     listeners.forEach((listener) => listener(state));
//   }

//   function subscribe(listener) {
//     listeners.add(listener);
//     return () => listeners.delete(listener);
//   }
//   function getListeners() {
//     return listeners;
//   }

//   return { getState, setState, subscribe, getListeners };
// }

// const store = createStore({ count: 1, name: "Crode" });
// store.subscribe(() => console.log("hi"));
// console.log("listeners....", store.getListeners());

// console.log(store.getState());
// store.setState({ count: 10, name: "darboole" });
// console.log(store.getState());

// const newStore = createStore({ count: 100, name: "Mali" });
// newStore.subscribe(() => console.log("This belongs to Mali"));
// console.log(store.getState());

// newStore.setState({ count: 99, name: "Libka" });
// console.log(store.getState());

function userCanPick(selector) {
  const product = { name: "Energy drink", price: 19.99, expiry: 2028 };
  return selector(product);
}

console.log(userCanPick((given) => given.price * 500));
