/**
 * i18n-build.js
 * 빌드 시 한국어 텍스트를 각 언어로 치환해서 언어별 빌드 생성
 * 
 * 사용법:
 *   node scripts/i18n-build.js
 * 
 * 결과:
 *   dist/ko/  - 한국어 빌드
 *   dist/en/  - 영어 빌드
 *   dist/zh/  - 중국어 빌드
 *   dist/ja/  - 일본어 빌드
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// 번역 파일 로드
const translations = JSON.parse(
  fs.readFileSync(path.join(rootDir, 'translations.json'), 'utf-8')
);

const LANGUAGES = ['ko', 'en', 'zh', 'ja'];
const SRC_DIR = path.join(rootDir, 'src');
const BACKUP_DIR = path.join(rootDir, '.src-backup');
const DIST_DIR = path.join(rootDir, 'dist');

/**
 * 디렉토리 재귀 복사
 */
function copyDirSync(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      copyDirSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

/**
 * 디렉토리 삭제
 */
function rmDirSync(dir) {
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

/**
 * 소스 파일의 한국어 텍스트를 해당 언어로 치환
 */
function translateSourceFiles(lang) {
  const files = getAllFiles(SRC_DIR, ['.tsx', '.ts']);
  
  for (const file of files) {
    let content = fs.readFileSync(file, 'utf-8');
    
    // 번역 적용 (긴 텍스트부터 먼저 치환하여 부분 매칭 방지)
    const sortedKeys = Object.keys(translations).sort((a, b) => b.length - a.length);
    
    for (const koreanText of sortedKeys) {
      const translatedText = translations[koreanText][lang];
      if (translatedText && koreanText !== translatedText) {
        // 문자열 리터럴 내의 텍스트만 치환 (따옴표, 백틱 안)
        const escapedKorean = escapeRegExp(koreanText);
        
        // "텍스트", '텍스트', `텍스트`, {`텍스트`} 등 모두 처리
        const patterns = [
          new RegExp(`"${escapedKorean}"`, 'g'),
          new RegExp(`'${escapedKorean}'`, 'g'),
          new RegExp(`\`${escapedKorean}\``, 'g'),
          // JSX 텍스트 내부
          new RegExp(`>${escapedKorean}<`, 'g'),
          // placeholder, label 등 속성값
          new RegExp(`="${escapedKorean}"`, 'g'),
          new RegExp(`='${escapedKorean}'`, 'g'),
        ];
        
        const replacements = [
          `"${translatedText}"`,
          `'${translatedText}'`,
          `\`${translatedText}\``,
          `>${translatedText}<`,
          `="${translatedText}"`,
          `='${translatedText}'`,
        ];
        
        for (let i = 0; i < patterns.length; i++) {
          content = content.replace(patterns[i], replacements[i]);
        }
      }
    }
    
    fs.writeFileSync(file, content, 'utf-8');
  }
}

/**
 * 모든 파일 목록 가져오기
 */
function getAllFiles(dir, extensions) {
  const files = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      files.push(...getAllFiles(fullPath, extensions));
    } else if (extensions.some(ext => entry.name.endsWith(ext))) {
      files.push(fullPath);
    }
  }
  
  return files;
}

/**
 * 정규표현식 특수문자 이스케이프
 */
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * 메인 빌드 프로세스
 */
async function build() {
  console.log('🌍 다국어 빌드 시작...\n');
  
  // 1. 원본 소스 백업
  console.log('📦 소스 백업 중...');
  rmDirSync(BACKUP_DIR);
  copyDirSync(SRC_DIR, BACKUP_DIR);
  
  // 2. dist 폴더 초기화
  rmDirSync(DIST_DIR);
  fs.mkdirSync(DIST_DIR, { recursive: true });
  
  try {
    for (const lang of LANGUAGES) {
      console.log(`\n🔨 [${lang.toUpperCase()}] 빌드 중...`);
      
      // 소스 복원
      rmDirSync(SRC_DIR);
      copyDirSync(BACKUP_DIR, SRC_DIR);
      
      // 번역 적용
      console.log(`   📝 텍스트 번역 적용 중...`);
      translateSourceFiles(lang);
      
      // Vite 빌드 실행
      console.log(`   ⚡ Vite 빌드 실행 중...`);
      execSync('npm run build', { 
        cwd: rootDir, 
        stdio: 'inherit',
        env: { ...process.env, VITE_LANG: lang }
      });
      
      // 빌드 결과물을 언어별 폴더로 이동
      const langDist = path.join(DIST_DIR, lang);
      if (fs.existsSync(path.join(rootDir, 'dist', 'index.html'))) {
        // 기본 빌드가 dist에 생성된 경우
        fs.renameSync(path.join(rootDir, 'dist'), path.join(rootDir, `dist-${lang}-temp`));
        fs.mkdirSync(DIST_DIR, { recursive: true });
        fs.renameSync(path.join(rootDir, `dist-${lang}-temp`), langDist);
      }
      
      console.log(`   ✅ [${lang.toUpperCase()}] 빌드 완료!`);
    }
  } finally {
    // 3. 원본 소스 복원
    console.log('\n📦 소스 복원 중...');
    rmDirSync(SRC_DIR);
    copyDirSync(BACKUP_DIR, SRC_DIR);
    rmDirSync(BACKUP_DIR);
  }
  
  console.log('\n✨ 모든 빌드 완료!');
  console.log('\n📁 결과물:');
  for (const lang of LANGUAGES) {
    console.log(`   dist/${lang}/`);
  }
}

build().catch(console.error);
