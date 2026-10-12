/* 카쿠 웹 버전(../)을 앱인토스 번들 폴더(dist/)로 복사한다.
   웹 소스는 고치지 않고, 복사본의 index.html에만 아래 세 가지를 바꾼다.
   1. window.KAKU_TOSS = true 를 심어 토스 모드를 켠다 (설치 안내·외부 링크·서비스워커 끄기 등)
   2. 확대 제스처를 끈다 (비게임 출시 체크리스트: 지도 등 예외를 빼고 확대·축소 비활성)
   3. PWA 매니페스트 링크를 뺀다 (토스 안에서는 설치 대상이 아님)
   치환 대상이 정확히 한 번씩 있어야 통과한다. 웹 index.html 구조가 바뀌면 여기서 바로 멈춘다. */
import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const web = join(here, '..');
const out = join(here, 'dist');

rmSync(out, { recursive: true, force: true });
mkdirSync(out);

for (const f of ['data.js', 'data_jlpt.js', 'data_kanji.js']) cpSync(join(web, f), join(out, f));
cpSync(join(web, 'icons'), join(out, 'icons'), { recursive: true });

let html = readFileSync(join(web, 'index.html'), 'utf8');
function replaceOnce(from, to) {
  const n = html.split(from).length - 1;
  if (n !== 1) throw new Error(`치환 대상이 ${n}번 있음 (1번이어야 함): ${from}`);
  html = html.replace(from, to);
}
replaceOnce(
  '<meta name="viewport" content="width=device-width, initial-scale=1.0">',
  '<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">\n'
  + '<script>window.KAKU_TOSS = true;</script>'
);
replaceOnce('<link rel="manifest" href="manifest.webmanifest">', '');
writeFileSync(join(out, 'index.html'), html);

console.log('dist/ 준비 완료: index.html(토스 모드), data*.js, icons/');
