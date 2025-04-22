/// <reference types="svelte" />

declare namespace svelteHTML {
  interface HTMLAttributes<T> {
    [key: string]: any;
  }
  
  interface SVGAttributes<T> {
    [key: string]: any;
  }
  
  interface DOMAttributes<T> {
    [key: string]: any;
  }
} 