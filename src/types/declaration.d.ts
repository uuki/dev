declare module '*.yml' {
  const value: Record<string, unknown>;
  export default value;
}

declare module '*.module.scss';

// ---------------------------------------------------------------------------
// pubsub-js
// ---------------------------------------------------------------------------
declare module 'pubsub-js' {
  type SubscriberFn<T = unknown> = (message: string, data: T) => void;
  type Token = string;

  function subscribe<T = unknown>(message: string, fn: SubscriberFn<T>): Token;
  function unsubscribe(tokenOrFn: Token | SubscriberFn): boolean;
  function publish<T = unknown>(message: string, data?: T): boolean;
  function publishSync<T = unknown>(message: string, data?: T): boolean;
  function clearAllSubscriptions(): void;

  const PubSub: {
    subscribe: typeof subscribe;
    unsubscribe: typeof unsubscribe;
    publish: typeof publish;
    publishSync: typeof publishSync;
    clearAllSubscriptions: typeof clearAllSubscriptions;
  };

  export = PubSub;
}

// ---------------------------------------------------------------------------
// ua-parser-js (v1.x)
// ---------------------------------------------------------------------------
declare module 'ua-parser-js' {
  interface UABrowser {
    name?: string;
    version?: string;
    major?: string;
  }
  interface UAEngine {
    name?: string;
    version?: string;
  }
  interface UAOS {
    name?: string;
    version?: string;
  }
  interface UADevice {
    vendor?: string;
    model?: string;
    type?: string;
  }
  interface UACPU {
    architecture?: string;
  }
  interface IResult {
    ua: string;
    browser: UABrowser;
    engine: UAEngine;
    os: UAOS;
    device: UADevice;
    cpu: UACPU;
  }

  class UAParser {
    constructor(ua?: string, extensions?: object);
    getResult(): IResult;
    getBrowser(): UABrowser;
    getEngine(): UAEngine;
    getOS(): UAOS;
    getDevice(): UADevice;
    getCPU(): UACPU;
    getUA(): string;
  }

  namespace UAParser {
    type IResult = import('ua-parser-js').IResult;
  }

  export = UAParser;
}

// ---------------------------------------------------------------------------
// webfontloader
// ---------------------------------------------------------------------------
declare module 'webfontloader' {
  interface FontVariantMap {
    [familyName: string]: string;
  }
  interface Config {
    loading?: () => void;
    active?: () => void;
    inactive?: () => void;
    fontloading?: (familyName: string, fvd: string) => void;
    fontactive?: (familyName: string, fvd: string) => void;
    fontinactive?: (familyName: string, fvd: string) => void;
    timeout?: number;
    classes?: boolean;
    events?: boolean;
    custom?: {
      families?: string[];
      urls?: string[];
      testStrings?: FontVariantMap;
    };
    google?: {
      families?: string[];
      api?: string;
    };
    typekit?: {
      id?: string;
    };
    fontdeck?: {
      id?: string;
    };
    monotype?: {
      projectId?: string;
      version?: number;
      loadAllFonts?: boolean;
    };
  }

  function load(config: Config): void;

  const WebFont: { load: typeof load };
  export = WebFont;
}
