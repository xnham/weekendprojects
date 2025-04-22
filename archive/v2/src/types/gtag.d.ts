// Global gtag function
interface Window {
  gtag: (
    command: 'event' | 'config' | 'js' | 'set',
    target: string | Date,
    params?: {
      [key: string]: any;
    }
  ) => void;
  dataLayer: any[];
}

declare const gtag: Window['gtag'];
