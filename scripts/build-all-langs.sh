#!/bin/bash
# build-all-langs.sh
# 모든 언어 버전을 빌드하는 스크립트
#
# 사용법: ./scripts/build-all-langs.sh

set -e

echo "🌍 다국어 빌드 시작..."

LANGUAGES=("ko" "en" "zh" "ja")
ROOT_DIR=$(cd "$(dirname "$0")/.." && pwd)

# dist 폴더 초기화
rm -rf "$ROOT_DIR/dist"
mkdir -p "$ROOT_DIR/dist"

for LANG in "${LANGUAGES[@]}"; do
  echo ""
  echo "🔨 [$LANG] 빌드 중..."
  
  # 환경변수로 언어 전달하여 빌드
  VITE_I18N_LANG=$LANG npm run build -- --outDir "dist/$LANG"
  
  echo "✅ [$LANG] 완료!"
done

echo ""
echo "✨ 모든 빌드 완료!"
echo ""
echo "📁 결과물:"
for LANG in "${LANGUAGES[@]}"; do
  echo "   dist/$LANG/"
done
