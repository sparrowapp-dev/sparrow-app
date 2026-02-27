/// <reference types="svelte" />
/// <reference types="vite/client" />

// Vite Web Worker import support
declare module "*?worker" {
  const workerConstructor: {
    new (): Worker;
  };
  export default workerConstructor;
}

// Vite inline Web Worker import support
declare module "*?worker&inline" {
  const workerConstructor: {
    new (): Worker;
  };
  export default workerConstructor;
}
