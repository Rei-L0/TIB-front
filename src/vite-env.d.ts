/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_KAKAO_MAP_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module 'mp4box' {
  const MP4Box: {
    createFile: () => any;
  };
  export default MP4Box;
}
