/**
 * vite-plugin-i18n-replace.js
 * Vite 플러그인으로 빌드 시 한국어를 다른 언어로 치환
 * 
 * vite.config.ts에서 사용:
 * 
 * import { i18nReplace } from './plugins/vite-plugin-i18n-replace'
 * 
 * export default defineConfig({
 *   plugins: [react(), i18nReplace('en')]  // 'ko', 'en', 'zh', 'ja'
 * })
 */

import fs from 'fs';
import path from 'path';

export function i18nReplace(targetLang = 'ko') {
  // translations.json 로드
  let translations = {};
  
  return {
    name: 'vite-plugin-i18n-replace',
    
    configResolved(config) {
      const translationsPath = path.join(config.root, 'translations.json');
      if (fs.existsSync(translationsPath)) {
        translations = JSON.parse(fs.readFileSync(translationsPath, 'utf-8'));
      }
    },
    
    transform(code, id) {
      // .tsx, .ts, .jsx, .js 파일만 처리
      if (!/\.(tsx?|jsx?)$/.test(id)) return null;
      if (id.includes('node_modules')) return null;
      if (targetLang === 'ko') return null; // 한국어는 원본 그대로
      
      let result = code;
      
      // 긴 텍스트부터 치환 (부분 매칭 방지)
      const sortedKeys = Object.keys(translations).sort((a, b) => b.length - a.length);
      
      for (const koreanText of sortedKeys) {
        const translated = translations[koreanText]?.[targetLang];
        if (!translated || koreanText === translated) continue;
        
        const escaped = koreanText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        
        // 여러 패턴 치환
        result = result
          .replace(new RegExp(`"${escaped}"`, 'g'), `"${translated}"`)
          .replace(new RegExp(`'${escaped}'`, 'g'), `'${translated}'`)
          .replace(new RegExp(`\`${escaped}\``, 'g'), `\`${translated}\``)
          .replace(new RegExp(`>${escaped}<`, 'g'), `>${translated}<`)
          .replace(new RegExp(`="${escaped}"`, 'g'), `="${translated}"`)
          .replace(new RegExp(`='${escaped}'`, 'g'), `='${translated}'`);
      }
      
      return result !== code ? { code: result, map: null } : null;
    }
  };
}

export default i18nReplace;
