import { useEffect, useRef } from "react";

const eventTarget = new EventTarget();
export const events = {
  onEvent(name, callback) {
    eventTarget.addEventListener(name, callback);
  },
  onceEvent(name, callback) {
    eventTarget.addEventListener(name, callback, { once: true });
  },
  dispatchEvent(name, data) {
    const ev = data ? new CustomEvent(name, data) : new Event(name);
    eventTarget.dispatchEvent(ev);
  }
};

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
    events.onEvent(name, fun);
  };

  const onceEvent = (name, fun) => {
    mapRef.current.set(name, fun);
    events.onceEvent(name, fun);
  };

  const dispatchEvent = (name, data) => events.dispatchEvent(name, data);

  return {
    onEvent,
    onceEvent,
    dispatchEvent
  };
}

export default useEvents;
