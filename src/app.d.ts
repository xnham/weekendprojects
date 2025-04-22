// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}

	// Add global gtag function declaration with more precise typing
	interface Window {
		dataLayer: any[];
		gtag: (
			command: 'event' | 'config' | 'js' | 'set',
			target: string | Date,
			params?: {
				[key: string]: any;
			}
		) => void;
	}
}

// Add Svelte HTML namespace declarations for better component typing
declare namespace svelte.JSX {
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

export {};
