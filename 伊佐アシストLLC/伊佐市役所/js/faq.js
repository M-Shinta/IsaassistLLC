/**
 * faq.js
 * FAQ一覧・検索画面のロジック
 *
 * 担当機能:
 *   - URLパラメータによる初期カテゴリ選択
 *   - カテゴリフィルタリング
 *   - キーワード検索（question / answer / tags の全文検索）
 *   - Web Speech APIを使った音声入力
 *   - FAQアイテムのアコーディオン展開
 */

'use strict';

// ========================================
// 状態管理
// ========================================

const faqState = {
  /** @type {string} 選択中のカテゴリID */
  activeCategory: 'all',

  /** @type {string} 現在の検索キーワード */
  searchQuery: '',

  /** @type {SpeechRecognition|null} 音声認識インスタンス */
  recognition: null,

  /** @type {boolean} 音声認識が動作中かどうか */
  isListening: false,
};

// ========================================
// 初期化
// ========================================

document.addEventListener('DOMContentLoaded', () => {
  buildCategoryFilter();
  renderFaqList(FAQ_ITEMS);
  applyInitialCategoryFromUrl();
  initSearchInput();
  initVoiceInput();
});

// ========================================
// カテゴリフィルター構築
// ========================================

/**
 * FAQ_CATEGORIESをもとにカテゴリフィルターボタンを動的に生成する。
 */
function buildCategoryFilter() {
  const container = document.getElementById('category-filter');
  if (!container) return;

  FAQ_CATEGORIES.forEach((category) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'filter-btn';
    btn.dataset.categoryId = category.id;
    btn.setAttribute('aria-pressed', category.id === 'all' ? 'true' : 'false');
    btn.setAttribute('aria-label', `${category.label}カテゴリで絞り込む`);

    // innerHTML禁止のためtextContentとariaで構成する
    const iconSpan = document.createElement('span');
    iconSpan.setAttribute('aria-hidden', 'true');
    iconSpan.textContent = category.icon + ' ';

    const labelSpan = document.createElement('span');
    labelSpan.textContent = category.label;

    btn.appendChild(iconSpan);
    btn.appendChild(labelSpan);

    if (category.id === 'all') {
      btn.classList.add('filter-btn--active');
    }

    btn.addEventListener('click', () => selectCategory(category.id));
    container.appendChild(btn);
  });
}

/**
 * カテゴリを選択してリストを再描画する。
 * @param {string} categoryId - 選択するカテゴリID
 */
function selectCategory(categoryId) {
  faqState.activeCategory = categoryId;

  // フィルターボタンのアクティブ状態を更新する
  document.querySelectorAll('.filter-btn').forEach((btn) => {
    const isActive = btn.dataset.categoryId === categoryId;
    btn.classList.toggle('filter-btn--active', isActive);
    btn.setAttribute('aria-pressed', String(isActive));
  });

  applyFilters();
}

// ========================================
// 検索入力
// ========================================

/**
 * 検索インプットのイベントを設定する。
 */
function initSearchInput() {
  const input    = document.getElementById('search-input');
  const clearBtn = document.getElementById('search-clear-btn');
  if (!input) return;

  input.addEventListener('input', () => {
    const query = input.value.trim();
    faqState.searchQuery = query;
    clearBtn.hidden = query.length === 0;
    applyFilters();
  });

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      input.value = '';
      faqState.searchQuery = '';
      clearBtn.hidden = true;
      input.focus();
      applyFilters();
    });
  }
}

// ========================================
// 音声入力（Web Speech API）
// ========================================

/**
 * Web Speech APIの音声入力を初期化する。
 * 非対応ブラウザの場合はボタンを非表示にする。
 */
function initVoiceInput() {
  const voiceBtn = document.getElementById('voice-input-btn');
  if (!voiceBtn) return;

  // Web Speech APIの対応チェック
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    // 非対応の場合はボタンを非表示にして終了
    voiceBtn.hidden = true;
    return;
  }

  faqState.recognition = new SpeechRecognition();
  faqState.recognition.lang = 'ja-JP';
  faqState.recognition.continuous = false;
  faqState.recognition.interimResults = false;

  faqState.recognition.addEventListener('result', handleSpeechResult);
  faqState.recognition.addEventListener('end', handleSpeechEnd);
  faqState.recognition.addEventListener('error', handleSpeechError);

  voiceBtn.addEventListener('click', toggleVoiceInput);
}

/**
 * 音声入力のオン/オフを切り替える。
 */
function toggleVoiceInput() {
  if (faqState.isListening) {
    faqState.recognition.stop();
  } else {
    startListening();
  }
}

/**
 * 音声認識を開始し、UIを「聞き取り中」状態にする。
 */
function startListening() {
  const voiceBtn = document.getElementById('voice-input-btn');
  if (!voiceBtn) return;

  faqState.isListening = true;
  faqState.recognition.start();
  voiceBtn.setAttribute('aria-pressed', 'true');
  voiceBtn.setAttribute('aria-label', '音声入力を停止する');
  voiceBtn.classList.add('is-listening');
  showToast('話しかけてください...');
}

/**
 * 音声認識結果を受け取り、検索インプットに反映する。
 * @param {SpeechRecognitionEvent} event
 */
function handleSpeechResult(event) {
  const transcript = event.results[0][0].transcript;
  const input      = document.getElementById('search-input');
  const clearBtn   = document.getElementById('search-clear-btn');

  if (input) {
    input.value         = transcript;
    faqState.searchQuery = transcript;
    if (clearBtn) clearBtn.hidden = false;
    applyFilters();
  }

  showToast(`「${transcript}」で検索しています`);
}

/**
 * 音声認識終了時にUIを戻す。
 */
function handleSpeechEnd() {
  faqState.isListening = false;
  const voiceBtn = document.getElementById('voice-input-btn');
  if (!voiceBtn) return;

  voiceBtn.setAttribute('aria-pressed', 'false');
  voiceBtn.setAttribute('aria-label', '音声でキーワードを入力する');
  voiceBtn.classList.remove('is-listening');
}

/**
 * 音声認識エラー発生時の処理。
 * @param {SpeechRecognitionErrorEvent} event
 */
function handleSpeechError(event) {
  handleSpeechEnd();

  const errorMessages = {
    'not-allowed':  'マイクの使用が許可されていません。ブラウザの設定をご確認ください。',
    'no-speech':    '音声が聞き取れませんでした。もう一度お試しください。',
    'network':      'ネットワークエラーが発生しました。',
  };

  const message = errorMessages[event.error] || '音声認識でエラーが発生しました。';
  showToast(message, 3000);
}

// ========================================
// フィルタリング・検索
// ========================================

/**
 * 現在の状態（カテゴリ + キーワード）でFAQリストを絞り込んで再描画する。
 */
function applyFilters() {
  let filtered = FAQ_ITEMS;

  // カテゴリ絞り込み
  if (faqState.activeCategory !== 'all') {
    filtered = filtered.filter(
      (item) => item.categoryId === faqState.activeCategory
    );
  }

  // キーワード絞り込み（大文字小文字・全角半角を正規化して比較）
  if (faqState.searchQuery.length > 0) {
    const normalizedQuery = normalizeText(faqState.searchQuery);
    filtered = filtered.filter((item) => {
      return (
        normalizeText(item.question).includes(normalizedQuery) ||
        normalizeText(item.answer).includes(normalizedQuery)   ||
        item.tags.some((tag) => normalizeText(tag).includes(normalizedQuery))
      );
    });
  }

  renderFaqList(filtered);
}

/**
 * テキストを検索比較用に正規化する。
 * 全角英数字を半角に変換し、小文字に統一する。
 * @param {string} text - 入力テキスト
 * @returns {string} 正規化済みテキスト
 */
function normalizeText(text) {
  return text
    .normalize('NFKC')
    .toLowerCase();
}

// ========================================
// リスト描画
// ========================================

/**
 * FAQアイテムの配列をリスト要素として描画する。
 * @param {FaqItem[]} items - 表示するFAQアイテム
 */
function renderFaqList(items) {
  const listEl    = document.getElementById('faq-list');
  const countEl   = document.getElementById('faq-count');
  const noResults = document.getElementById('no-results');
  if (!listEl) return;

  // 既存の子要素をすべて削除する
  while (listEl.firstChild) {
    listEl.removeChild(listEl.firstChild);
  }

  const isEmpty = items.length === 0;

  if (countEl) {
    countEl.textContent = isEmpty
      ? ''
      : `${items.length}件のご質問が見つかりました`;
  }

  if (noResults) {
    noResults.classList.toggle('is-visible', isEmpty);
  }

  if (isEmpty) return;

  items.forEach((item) => {
    const li = buildFaqListItem(item);
    listEl.appendChild(li);
  });

  // GSAPでリストアイテムをスタッガーアニメーションする
  if (typeof gsap !== 'undefined') {
    gsap.from('.faq-item', {
      opacity: 0,
      y: 10,
      duration: 0.3,
      ease: 'power2.out',
      stagger: 0.04,
    });
  }
}

/**
 * FAQアイテム1件分のリスト要素（<li>）を生成して返す。
 * FAQ詳細ページへのリンクとアコーディオン展開の両方に対応する。
 * @param {FaqItem} item
 * @returns {HTMLLIElement}
 */
function buildFaqListItem(item) {
  const li = document.createElement('li');
  li.className = 'faq-item';
  li.dataset.faqId = String(item.id);

  // 質問ボタン
  const questionBtn = document.createElement('button');
  questionBtn.type      = 'button';
  questionBtn.className = 'faq-item__question';
  questionBtn.setAttribute('aria-expanded', 'false');
  questionBtn.setAttribute('aria-controls', `faq-answer-${item.id}`);
  questionBtn.setAttribute('aria-label', `質問: ${item.question}`);

  const iconSpan = document.createElement('span');
  iconSpan.className = 'faq-item__question-icon';
  iconSpan.setAttribute('aria-hidden', 'true');
  iconSpan.textContent = 'Q';

  const textSpan = document.createElement('span');
  textSpan.className = 'faq-item__question-text';
  textSpan.textContent = item.question;

  const arrowSpan = document.createElement('span');
  arrowSpan.className = 'faq-item__arrow';
  arrowSpan.setAttribute('aria-hidden', 'true');
  arrowSpan.textContent = '›';

  questionBtn.appendChild(iconSpan);
  questionBtn.appendChild(textSpan);
  questionBtn.appendChild(arrowSpan);

  // 回答エリア
  const answerDiv = document.createElement('div');
  answerDiv.className = 'faq-item__answer';
  answerDiv.id        = `faq-answer-${item.id}`;
  answerDiv.setAttribute('role', 'region');
  answerDiv.setAttribute('aria-label', `回答: ${item.question}`);

  const answerInner = document.createElement('div');
  answerInner.className = 'faq-item__answer-inner';

  const answerText = document.createElement('p');
  answerText.className = 'faq-item__answer-text';
  answerText.textContent = item.answer;

  // 担当窓口情報がある場合のみ表示する
  if (item.window) {
    const windowInfo = document.createElement('p');
    windowInfo.className = 'faq-item__window-info';
    windowInfo.setAttribute('aria-label', `担当窓口: ${item.window}`);

    const windowLabel = document.createElement('strong');
    windowLabel.textContent = '担当窓口: ';
    const windowText = document.createTextNode(
      `${item.window}${item.floor ? `（${item.floor}）` : ''}`
    );

    windowInfo.appendChild(windowLabel);
    windowInfo.appendChild(windowText);
    answerInner.appendChild(answerText);
    answerInner.appendChild(windowInfo);
  } else {
    answerInner.appendChild(answerText);
  }

  // 詳細ページへのリンク
  const detailLink = document.createElement('a');
  detailLink.href      = `faq-detail.html?id=${item.id}`;
  detailLink.className = 'btn btn--outline';
  detailLink.setAttribute('aria-label', `「${item.question}」の詳細ページを開く`);
  detailLink.textContent = '詳細を見る';
  answerInner.appendChild(detailLink);

  answerDiv.appendChild(answerInner);

  questionBtn.addEventListener('click', () => toggleFaqItem(li, questionBtn));

  li.appendChild(questionBtn);
  li.appendChild(answerDiv);

  return li;
}

/**
 * FAQアイテムのアコーディオン開閉を切り替える。
 * @param {HTMLLIElement}    listItem  - 対象の<li>要素
 * @param {HTMLButtonElement} btn      - 質問ボタン要素
 */
function toggleFaqItem(listItem, btn) {
  const isOpen = listItem.classList.toggle('faq-item--open');
  btn.setAttribute('aria-expanded', String(isOpen));
}

// ========================================
// URLパラメータ処理
// ========================================

/**
 * URLの ?category= パラメータを読んで初期カテゴリを選択する。
 */
function applyInitialCategoryFromUrl() {
  const params     = new URLSearchParams(window.location.search);
  const categoryId = params.get('category');

  if (!categoryId) return;

  const isValidCategory = FAQ_CATEGORIES.some((c) => c.id === categoryId);
  if (isValidCategory) {
    selectCategory(categoryId);
  }
}
