import { useEffect, useRef } from "react";

const eventTarget = new EventTarget();

function useEvents() {
  const mapRef = useRef();

  useEffect(() => {
    mapRef.current = new Map();

    return () => {
      for (const [name, fun] of mapRef.current.entries()) {
        eventTarget.removeEventListener(name, fun);
      }
    };
  }, []);

  const onEvent = (name, fun) => {
    mapRef.current.set(name, fun);
    eventTarget.addEventListener(name, fun);
  };

  const dispatchEvent = (name, data) => {
    const ev = data ? new CustomEvent(name, data) : new Event(name);
    eventTarget.dispatchEvent(ev);
  };

  return {
    onEvent,
    dispatchEvent
  };
}

export default useEvents;
