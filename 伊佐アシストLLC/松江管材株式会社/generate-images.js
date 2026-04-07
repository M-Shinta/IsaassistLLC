/**
 * generate-images.js
 * ──────────────────────────────────────────────────────────────
 * Pollinations.ai (FLUX モデル) を使って松江管材株式会社サイト用の
 * 画像を生成し images/ フォルダに保存するスクリプト。
 *
 * ✅ APIキー不要・完全無料
 *
 * 実行方法:
 *   node generate-images.js
 * ──────────────────────────────────────────────────────────────
 */

const https = require("https");
const fs    = require("fs");
const path  = require("path");

// ── 保存先フォルダ ────────────────────────────────────────────
const OUTPUT_DIR = path.join(__dirname, "images");
if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

// ── Pollinations.ai 設定 ──────────────────────────────────────
// アスペクト比 → ピクセルサイズ変換マップ
const SIZES = {
  "3:4":  { w: 768,  h: 1024 },
  "4:3":  { w: 1024, h: 768  },
  "16:9": { w: 1344, h: 756  },
  "9:16": { w: 756,  h: 1344 },
  "1:1":  { w: 1024, h: 1024 },
};

// ── 生成する画像の定義リスト ──────────────────────────────────
//
//   fileName   : 保存ファイル名
//   aspectRatio: "1:1" | "3:4" | "4:3" | "9:16" | "16:9"
//   prompt     : Imagen への英語プロンプト（日本語プロンプトより精度が高い）
//
const IMAGE_LIST = [

  // ── ヒーローセクション（6枚）────────────────────────────────

  {
    fileName: "hero-1.jpg",
    aspectRatio: "3:4",   // 縦長 – 左上パネル
    prompt:
      "Industrial water pipe warehouse interior in Japan, " +
      "rows of blue and gray PVC and metal water supply pipes stacked neatly on metal shelves, " +
      "professional industrial photography, cinematic lighting, shallow depth of field, " +
      "cool blue tones, photorealistic, 8k quality",
  },
  {
    fileName: "hero-2.jpg",
    aspectRatio: "4:3",   // 横長 – 右上パネル
    prompt:
      "Japanese plumber installing water supply pipes at a residential construction site, " +
      "skilled worker connecting PVC pipes with professional tools, " +
      "safety helmet, work uniform, natural daylight, wide angle shot, " +
      "photorealistic, documentary photography style",
  },
  {
    fileName: "hero-3.jpg",
    aspectRatio: "3:4",   // 縦長 – 左中央パネル
    prompt:
      "Close-up macro photography of industrial water pipe valves and fittings, " +
      "brass gate valves, ball valves, pipe joints and couplings arranged on a dark surface, " +
      "professional product photography, studio lighting, metallic reflections, " +
      "photorealistic, high detail",
  },
  {
    fileName: "hero-4.jpg",
    aspectRatio: "16:9",  // 横長ワイド – 右下パネル
    prompt:
      "Underground water pipe installation work in Japan, " +
      "workers in orange safety vests laying large diameter water supply pipes in a trench, " +
      "construction site, excavator in background, late afternoon golden hour light, " +
      "wide cinematic shot, photorealistic",
  },
  {
    fileName: "hero-5.jpg",
    aspectRatio: "3:4",   // 縦長 – 中央右前面パネル
    prompt:
      "Japanese water utility company van and equipment, " +
      "close-up of water meters, pressure gauges and pipe system control panel, " +
      "professional infrastructure, technical photography, crisp focus, " +
      "steel and chrome metallic tones, photorealistic",
  },
  {
    fileName: "hero-6.jpg",
    aspectRatio: "16:9",  // 横長 – 左下パネル
    prompt:
      "Neat rows of water supply pipes and plumbing materials in a Japanese hardware wholesale warehouse, " +
      "various diameter pipes in blue, white and gray, organized inventory on industrial shelving, " +
      "warm warehouse lighting, wide angle, photorealistic",
  },

  // ── 事業内容カード（4枚）────────────────────────────────────

  {
    fileName: "service-1.jpg",
    aspectRatio: "4:3",   // 配管工事
    prompt:
      "Japanese professional plumber working on residential water pipe installation, " +
      "connecting copper and PVC water supply pipes with wrench and fittings, " +
      "under-sink cabinet work, clean professional environment, " +
      "natural lighting, photorealistic",
  },
  {
    fileName: "service-2.jpg",
    aspectRatio: "4:3",   // バルブ・継手販売
    prompt:
      "Collection of industrial water pipe valves, ball valves, gate valves, " +
      "various pipe fittings and couplings on a clean white background, " +
      "professional product photography, high key lighting, " +
      "brass and stainless steel materials, photorealistic",
  },
  {
    fileName: "service-3.jpg",
    aspectRatio: "4:3",   // 設備工事
    prompt:
      "Commercial building mechanical room with water pipes, pumps and valves, " +
      "Japanese HVAC and plumbing equipment installation, " +
      "clean industrial environment, professional photography, " +
      "pipes in blue and green colors labeled with Japanese tags, photorealistic",
  },
  {
    fileName: "service-4.jpg",
    aspectRatio: "4:3",   // 技術コンサルティング
    prompt:
      "Japanese engineer reviewing water system blueprints and technical drawings at a desk, " +
      "laptop, pipe diagrams, professional office setting, " +
      "consultation meeting, business casual attire, soft professional lighting, " +
      "photorealistic",
  },

  // ── 施工実績ギャラリー（9枚）────────────────────────────────

  {
    fileName: "gallery-1.jpg",
    aspectRatio: "16:9",  // ワイド – 大型プラント
    prompt:
      "Large industrial water treatment plant with complex pipe network in Japan, " +
      "multiple large diameter pipes, valves and pumps, " +
      "professional industrial photography, wide angle, cinematic, photorealistic",
  },
  {
    fileName: "gallery-2.jpg",
    aspectRatio: "4:3",   // 給排水設備
    prompt:
      "Water supply and drainage system installation in a Japanese apartment building, " +
      "exposed pipes in utility room, neatly arranged plumbing work, " +
      "professional photography, photorealistic",
  },
  {
    fileName: "gallery-3.jpg",
    aspectRatio: "4:3",   // バルブ設置
    prompt:
      "Industrial ball valve installation on water main pipe, " +
      "close-up of professional plumbing work, " +
      "shiny new fittings, clean background, photorealistic",
  },
  {
    fileName: "gallery-4.jpg",
    aspectRatio: "4:3",   // 空調配管
    prompt:
      "Air conditioning and ventilation pipe installation in commercial building Japan, " +
      "insulated pipes on ceiling, professional HVAC work, " +
      "clean industrial environment, photorealistic",
  },
  {
    fileName: "gallery-5.jpg",
    aspectRatio: "16:9",  // ワイド – 官公庁工事
    prompt:
      "Large scale municipal water infrastructure project in Japan, " +
      "government facility pipe installation, workers in safety gear, " +
      "wide cinematic photography, blue sky, photorealistic",
  },
  {
    fileName: "gallery-6.jpg",
    aspectRatio: "4:3",   // ガス配管
    prompt:
      "Gas pipe installation work at Japanese residential property, " +
      "yellow gas pipes with safety valves, professional technician, " +
      "photorealistic photography",
  },
  {
    fileName: "gallery-7.jpg",
    aspectRatio: "4:3",   // 工場改修
    prompt:
      "Factory pipe renovation work in Japan, " +
      "replacing old industrial water pipes with new ones, " +
      "workers with welding equipment, industrial environment, photorealistic",
  },
  {
    fileName: "gallery-8.jpg",
    aspectRatio: "4:3",   // マンション給水
    prompt:
      "Condominium water supply system upgrade in Japan, " +
      "modern pump room with pressure tanks and pipes, " +
      "clean technical photography, photorealistic",
  },
  {
    fileName: "gallery-9.jpg",
    aspectRatio: "4:3",   // 消火設備
    prompt:
      "Fire suppression sprinkler system installation in Japanese commercial building, " +
      "red fire pipes, sprinkler heads, professional work, " +
      "ceiling installation, photorealistic",
  },
];

// ── Pollinations.ai リクエスト関数 ───────────────────────────
/**
 * Pollinations.ai の FLUX モデルで画像を生成してバッファを返す。
 * リダイレクトを再帰的に追いかける実装。
 *
 * @param {string} prompt      - 画像プロンプト
 * @param {string} aspectRatio - "3:4" | "4:3" | "16:9" など
 * @returns {Promise<Buffer>}  - 画像バイナリ
 */
function generateImage(prompt, aspectRatio) {
  const { w, h } = SIZES[aspectRatio] ?? { w: 1024, h: 1024 };
  const seed     = Math.floor(Math.random() * 9999999);
  const encoded  = encodeURIComponent(prompt);

  // Pollinations.ai エンドポイント
  // nologo=true  : ウォーターマークなし
  // enhance=true : プロンプト自動強化
  // model=flux   : FLUX.1 モデル指定
  const url =
    `https://image.pollinations.ai/prompt/${encoded}` +
    `?width=${w}&height=${h}&model=flux&nologo=true&enhance=true&seed=${seed}`;

  // リダイレクト対応の fetch ラッパー
  return fetchFollowRedirects(url);
}

/**
 * https.get でリダイレクトを最大 5 回追いかけ、画像バッファを返す。
 * @param {string} url
 * @param {number} [redirectCount=0]
 * @returns {Promise<Buffer>}
 */
function fetchFollowRedirects(url, redirectCount = 0) {
  return new Promise((resolve, reject) => {
    if (redirectCount > 5) { reject(new Error("リダイレクト上限超過")); return; }

    https.get(url, { timeout: 90000 }, (res) => {
      // 301/302/307/308 リダイレクト処理
      if ([301, 302, 307, 308].includes(res.statusCode) && res.headers.location) {
        return fetchFollowRedirects(res.headers.location, redirectCount + 1)
          .then(resolve).catch(reject);
      }

      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode}`)); return;
      }

      const chunks = [];
      res.on("data", (c) => chunks.push(c));
      res.on("end",  ()  => resolve(Buffer.concat(chunks)));
    }).on("error", reject);
  });
}

// ── 指定ミリ秒待機 ────────────────────────────────────────────
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ── メイン処理 ────────────────────────────────────────────────
(async () => {
  console.log("🖼  松江管材株式会社 — 画像生成スクリプト");
  console.log(`   対象: ${IMAGE_LIST.length} 枚  保存先: images/\n`);

  let successCount = 0;
  let failCount    = 0;

  for (let i = 0; i < IMAGE_LIST.length; i++) {
    const { fileName, aspectRatio, prompt } = IMAGE_LIST[i];
    const outputPath = path.join(OUTPUT_DIR, fileName);

    process.stdout.write(
      `[${String(i + 1).padStart(2, "0")}/${IMAGE_LIST.length}] ${fileName} (${aspectRatio}) ... `,
    );

    try {
      const buf = await generateImage(prompt, aspectRatio);
      fs.writeFileSync(outputPath, buf);
      console.log(`✅ 保存完了 (${buf.length.toLocaleString()} bytes)`);
      successCount++;
    } catch (err) {
      console.log(`❌ 失敗: ${err.message}`);
      failCount++;
    }

    // Pollinations.ai は無料 API のため 2 秒待機してサーバーを労る
    if (i < IMAGE_LIST.length - 1) {
      await sleep(2000);
    }
  }

  console.log(`\n📊 完了: 成功 ${successCount} 枚 / 失敗 ${failCount} 枚`);
  if (successCount > 0) {
    console.log("✨ index.html をブラウザで開いて確認してください。");
  }
})();
