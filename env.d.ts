// env.d.ts (at the project root, alongside tsconfig.json)

declare namespace NodeJS {
    interface ProcessEnv {
      NEXT_PUBLIC_SCREENSHOT_ENDPOINT: string;
      // add any other NEXT_PUBLIC_… vars here
    }
  }
  
  // tell TS there really is a global `process` with that `env` shape
  declare var process: {
    env: NodeJS.ProcessEnv;
  };
  