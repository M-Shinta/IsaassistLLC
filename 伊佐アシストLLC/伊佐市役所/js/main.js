/**
 * main.js
 * 伊佐市役所 窓口案内システム — メインスクリプト
 *
 * 担当機能:
 *   - ローディングオーバーレイ制御
 *   - GSAPによる入場アニメーション
 *   - アイドルタイムアウト（60秒でホームリセット）
 *   - 文字サイズ拡大トグル（16px ⇔ 22px）
 *   - 言語切り替え（i18nとの連携）
 */

'use strict';

// ========================================
// 定数
// ========================================

/** アイドルと判定するまでの時間（ミリ秒） */
const IDLE_TIMEOUT_MS = 60_000;

/** タイムアウト警告ダイアログを表示してからリセットまでの秒数 */
const COUNTDOWN_SECONDS = 5;

/** タッチ・入力イベント: これらが発火すると「操作中」とみなす */
const USER_ACTIVITY_EVENTS = [
  'touchstart',
  'touchmove',
  'touchend',
  'pointerdown',
  'pointermove',
];

// ========================================
// 初期化
// ========================================

document.addEventListener('DOMContentLoaded', () => {
  initLoadingOverlay();
  initFontSizeToggle();
  initLangSwitcher();
  initIdleTimeout();
  // ホーム画面のみアニメーションを適用する
  if (document.body.classList.contains('page-home')) {
    initHomeAnimations();
  }
});

// ========================================
// ローディングオーバーレイ
// ========================================

/**
 * ページ読み込み完了後にローディングオーバーレイをフェードアウトする。
 * GSAPが利用可能な場合はGSAPで、そうでなければCSSクラスで処理する。
 */
function initLoadingOverlay() {
  const overlay = document.getElementById('loading-overlay');
  if (!overlay) return;

  // フォント読み込み完了を待つ（最大1.5秒）
  const hideOverlay = () => {
    if (typeof gsap !== 'undefined') {
      gsap.to(overlay, {
        opacity: 0,
        duration: 0.4,
        ease: 'power1.out',
        onComplete: () => overlay.classList.add('is-hidden'),
      });
    } else {
      overlay.classList.add('is-hidden');
    }
  };

  if (document.fonts && document.fonts.ready) {
    const timeout = setTimeout(hideOverlay, 1500);
    document.fonts.ready.then(() => {
      clearTimeout(timeout);
      hideOverlay();
    });
  } else {
    // FontsAPIが使えない環境では即座に非表示
    hideOverlay();
  }
}

// ========================================
// GSAPアニメーション（ホーム画面）
// ========================================

/**
 * ホーム画面のカテゴリタイル・見出しをGSAPでスタッガーアニメーションする。
 * GSAPが読み込めていない場合はCSS初期値を上書きして表示するだけに留める。
 */
function initHomeAnimations() {
  if (typeof gsap === 'undefined') {
    // フォールバック: opacity/transformをリセットして表示する
    document.querySelectorAll('.category-tile').forEach((tile) => {
      tile.style.opacity = '1';
      tile.style.transform = 'none';
    });
    return;
  }

  // ウェルカム見出しのフェードイン
  gsap.from('.welcome-heading', {
    opacity: 0,
    y: -20,
    duration: 0.6,
    ease: 'power2.out',
    delay: 0.2,
  });

  gsap.from('.welcome-subheading', {
    opacity: 0,
    y: -10,
    duration: 0.5,
    ease: 'power2.out',
    delay: 0.4,
  });

  // カテゴリタイルのスタッガー入場
  gsap.to('.category-tile', {
    opacity: 1,
    y: 0,
    duration: 0.5,
    ease: 'power2.out',
    stagger: 0.07,
    delay: 0.5,
  });

  // 検索CTAボタンのフェードイン
  gsap.from('.search-cta-btn', {
    opacity: 0,
    scale: 0.95,
    duration: 0.5,
    ease: 'back.out(1.4)',
    delay: 1.1,
  });
}

// ========================================
// 文字サイズ拡大トグル
// ========================================

/**
 * ヘッダーの「文字サイズ」ボタンで body に .font-large を付け外しする。
 * セッション中の設定はsessionStorageに保存し、ページ遷移後も維持する。
 */
function initFontSizeToggle() {
  const toggleBtn = document.getElementById('font-size-toggle');
  if (!toggleBtn) return;

  // 前回の設定を復元する
  const isFontLarge = sessionStorage.getItem('fontLarge') === 'true';
  applyFontSize(isFontLarge, toggleBtn);

  toggleBtn.addEventListener('click', () => {
    const nextState = !document.body.classList.contains('font-large');
    applyFontSize(nextState, toggleBtn);
    sessionStorage.setItem('fontLarge', String(nextState));
  });
}

/**
 * 文字サイズの拡大/標準状態を適用する。
 * @param {boolean} isLarge - trueで拡大モード
 * @param {HTMLButtonElement} btn  - トグルボタン要素
 */
function applyFontSize(isLarge, btn) {
  document.body.classList.toggle('font-large', isLarge);
  btn.setAttribute('aria-pressed', String(isLarge));
  btn.setAttribute(
    'aria-label',
    isLarge ? '文字を標準サイズに戻す' : '文字を大きくする'
  );
}

// ========================================
// 言語切り替え
// ========================================

/**
 * ヘッダーの言語ボタン群をハンドリングする。
 * 実際の翻訳はi18n.jsに委譲し、こちらはUI状態（aria-pressed, active class）のみ管理する。
 */
function initLangSwitcher() {
  const langBtns = document.querySelectorAll('.lang-btn');
  if (langBtns.length === 0) return;

  langBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const selectedLang = btn.dataset.lang;

      // aria-pressed とアクティブクラスを更新する
      langBtns.forEach((b) => {
        const isActive = b === btn;
        b.setAttribute('aria-pressed', String(isActive));
        b.classList.toggle('lang-btn--active', isActive);
      });

      // i18n.jsの切り替え関数を呼ぶ（存在する場合のみ）
      if (typeof setLanguage === 'function') {
        setLanguage(selectedLang);
      }
    });
  });
}

// ========================================
// アイドルタイムアウト
// ========================================

/**
 * アイドルタイムアウトの状態を管理するオブジェクト。
 * モジュールスコープに閉じてカプセル化する。
 */
const idleTimer = {
  /** @type {number|null} メインのアイドル計測タイマーID */
  mainTimerId: null,

  /** @type {number|null} カウントダウン用インターバルID */
  countdownIntervalId: null,

  /** @type {number} 残り秒数 */
  remainingSeconds: COUNTDOWN_SECONDS,

  /** @type {boolean} ダイアログが表示中かどうか */
  isWarningVisible: false,
};

/**
 * アイドルタイムアウト機能を初期化する。
 * ホーム画面は対象外（常にホームにいるため）。
 */
function initIdleTimeout() {
  const overlay    = document.getElementById('timeout-overlay');
  const cancelBtn  = document.getElementById('timeout-cancel-btn');
  if (!overlay || !cancelBtn) return;

  // ユーザー操作を検知して計測をリセットする
  USER_ACTIVITY_EVENTS.forEach((eventName) => {
    document.addEventListener(eventName, handleUserActivity, { passive: true });
  });

  cancelBtn.addEventListener('click', cancelTimeout);

  startIdleTimer();
}

/**
 * ユーザー操作発生時のハンドラ。
 * 警告ダイアログが出ていない場合のみタイマーをリセットする。
 */
function handleUserActivity() {
  if (idleTimer.isWarningVisible) return;
  resetIdleTimer();
}

/** メインのアイドルタイマーを（再）開始する。 */
function startIdleTimer() {
  clearTimeout(idleTimer.mainTimerId);
  idleTimer.mainTimerId = setTimeout(showTimeoutWarning, IDLE_TIMEOUT_MS);
}

/** タイマーをリセットして再計測を始める。 */
function resetIdleTimer() {
  clearTimeout(idleTimer.mainTimerId);
  startIdleTimer();
}

/**
 * タイムアウト警告ダイアログを表示し、カウントダウンを開始する。
 */
function showTimeoutWarning() {
  const overlay         = document.getElementById('timeout-overlay');
  const secondsDisplay  = document.getElementById('timeout-seconds');
  const progressBar     = document.getElementById('timeout-bar');
  if (!overlay || !secondsDisplay || !progressBar) return;

  idleTimer.isWarningVisible  = true;
  idleTimer.remainingSeconds  = COUNTDOWN_SECONDS;

  overlay.hidden = false;
  secondsDisplay.textContent = String(COUNTDOWN_SECONDS);
  progressBar.style.width    = '100%';

  // 1秒後に幅をゼロにしてCSSトランジションでアニメーションさせる
  // （CSSの transition: width 1s linear を利用）
  requestAnimationFrame(() => {
    progressBar.style.width = '0%';
  });

  idleTimer.countdownIntervalId = setInterval(tickCountdown, 1000);
}

/**
 * 1秒ごとに呼ばれ、残り秒数を減らす。ゼロになるとホームへリセットする。
 */
function tickCountdown() {
  idleTimer.remainingSeconds -= 1;

  const secondsDisplay = document.getElementById('timeout-seconds');
  if (secondsDisplay) {
    secondsDisplay.textContent = String(idleTimer.remainingSeconds);
  }

  if (idleTimer.remainingSeconds <= 0) {
    resetToHome();
  }
}

/**
 * タイムアウトキャンセルボタン押下時の処理。
 * ダイアログを閉じてタイマーを再スタートする。
 */
function cancelTimeout() {
  clearInterval(idleTimer.countdownIntervalId);
  idleTimer.isWarningVisible = false;

  const overlay = document.getElementById('timeout-overlay');
  if (overlay) overlay.hidden = true;

  startIdleTimer();
}

/**
 * ホーム画面にリダイレクトする。
 * すでにホームにいる場合はオーバーレイを閉じてアニメーションを再生するだけにする。
 */
function resetToHome() {
  clearInterval(idleTimer.countdownIntervalId);
  idleTimer.isWarningVisible = false;

  const isHomePage = document.body.classList.contains('page-home');

  if (isHomePage) {
    // ホームにいる場合はオーバーレイを閉じて状態をリセットするだけ
    const overlay = document.getElementById('timeout-overlay');
    if (overlay) overlay.hidden = true;
    startIdleTimer();
    if (typeof gsap !== 'undefined') {
      initHomeAnimations();
    }
  } else {
    window.location.href = 'index.html';
  }
}

// ========================================
// ユーティリティ: トースト通知
// ========================================

/**
 * 画面下部にトースト通知を表示する。
 * 他のスクリプト（faq.js等）から呼び出されることを想定している。
 *
 * @param {string} message    - 表示するメッセージ
 * @param {number} [durationMs=2500] - 表示時間（ミリ秒）
 */
function showToast(message, durationMs = 2500) {
  let container = document.querySelector('.toast-container');

  // コンテナが存在しなければ動的に生成する
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.setAttribute('role', 'status');
  toast.setAttribute('aria-live', 'polite');
  toast.textContent = message;
  container.appendChild(toast);

  // 次のフレームでクラスを付けてCSSトランジションを発火させる
  requestAnimationFrame(() => {
    requestAnimationFrame(() => toast.classList.add('is-visible'));
  });

  setTimeout(() => {
    toast.classList.remove('is-visible');
    toast.addEventListener('transitionend', () => toast.remove(), { once: true });
  }, durationMs);
}
