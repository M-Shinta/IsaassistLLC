/**
 * faq-detail.js
 * FAQ詳細画面のロジック
 *
 * 担当機能:
 *   - URLパラメータ ?id= からFAQアイテムを取得して描画
 *   - 関連FAQ（同カテゴリ）の表示
 *   - 解決確認ボタン
 */

'use strict';

// ========================================
// 初期化
// ========================================

document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const id = parseInt(params.get('id'), 10);

  const item = FAQ_ITEMS.find((f) => f.id === id);

  if (!item) {
    renderNotFound();
    return;
  }

  renderDetail(item);
  renderRelatedFaqs(item);

  // GSAPで入場アニメーション
  if (typeof gsap !== 'undefined') {
    gsap.from('.detail-card', {
      opacity: 0,
      y: 20,
      duration: 0.5,
      ease: 'power2.out',
    });
  }
});

// ========================================
// 詳細描画
// ========================================

/**
 * FAQアイテムの詳細カードを描画する。
 * @param {FaqItem} item
 */
function renderDetail(item) {
  const root = document.getElementById('faq-detail-root');
  if (!root) return;

  // ローディング表示を削除する
  const loading = document.getElementById('detail-loading');
  if (loading) loading.remove();

  // カテゴリ情報を取得する
  const category = FAQ_CATEGORIES.find((c) => c.id === item.categoryId);

  // ページタイトルを更新する
  const pageTitle = document.getElementById('page-title');
  if (pageTitle) pageTitle.textContent = '質問の詳細';

  // カードを構築する
  const card = document.createElement('article');
  card.className = 'detail-card';
  card.setAttribute('aria-labelledby', 'detail-question');

  // カテゴリバッジ
  if (category && category.id !== 'all') {
    const badge = document.createElement('p');
    badge.className = 'detail-category-badge';
    badge.setAttribute('aria-label', `カテゴリ: ${category.label}`);

    const icon = document.createElement('span');
    icon.setAttribute('aria-hidden', 'true');
    icon.textContent = category.icon + ' ';

    const label = document.createElement('span');
    label.textContent = category.label;

    badge.appendChild(icon);
    badge.appendChild(label);
    card.appendChild(badge);
  }

  // 質問
  const questionWrap = document.createElement('div');
  questionWrap.className = 'detail-question-wrap';

  const qLabel = document.createElement('span');
  qLabel.className = 'detail-label detail-label--q';
  qLabel.setAttribute('aria-hidden', 'true');
  qLabel.textContent = 'Q';

  const questionText = document.createElement('h2');
  questionText.className = 'detail-question';
  questionText.id = 'detail-question';
  questionText.textContent = item.question;

  questionWrap.appendChild(qLabel);
  questionWrap.appendChild(questionText);
  card.appendChild(questionWrap);

  // 回答
  const answerWrap = document.createElement('div');
  answerWrap.className = 'detail-answer-wrap';

  const aLabel = document.createElement('span');
  aLabel.className = 'detail-label detail-label--a';
  aLabel.setAttribute('aria-hidden', 'true');
  aLabel.textContent = 'A';

  const answerText = document.createElement('p');
  answerText.className = 'detail-answer';
  answerText.textContent = item.answer;

  answerWrap.appendChild(aLabel);
  answerWrap.appendChild(answerText);
  card.appendChild(answerWrap);

  // 担当窓口情報
  if (item.window) {
    const windowBox = document.createElement('div');
    windowBox.className = 'detail-window-box';
    windowBox.setAttribute('role', 'complementary');
    windowBox.setAttribute('aria-label', '担当窓口情報');

    const windowIcon = document.createElement('span');
    windowIcon.className = 'detail-window-icon';
    windowIcon.setAttribute('aria-hidden', 'true');
    windowIcon.textContent = '🏢';

    const windowInner = document.createElement('div');

    const windowLabel = document.createElement('p');
    windowLabel.className = 'detail-window-label';
    windowLabel.textContent = '担当窓口';

    const windowName = document.createElement('p');
    windowName.className = 'detail-window-name';
    windowName.textContent = item.window;
    if (item.floor) {
      const floorSpan = document.createElement('span');
      floorSpan.className = 'detail-window-floor';
      floorSpan.textContent = ` （${item.floor}）`;
      windowName.appendChild(floorSpan);
    }

    windowInner.appendChild(windowLabel);
    windowInner.appendChild(windowName);
    windowBox.appendChild(windowIcon);
    windowBox.appendChild(windowInner);
    card.appendChild(windowBox);
  }

  // タグ
  if (item.tags && item.tags.length > 0) {
    const tagsWrap = document.createElement('div');
    tagsWrap.className = 'detail-tags';
    tagsWrap.setAttribute('aria-label', '関連キーワード');

    item.tags.forEach((tag) => {
      const tagEl = document.createElement('span');
      tagEl.className = 'detail-tag';
      tagEl.textContent = `#${tag}`;
      tagsWrap.appendChild(tagEl);
    });

    card.appendChild(tagsWrap);
  }

  // 解決確認ボタン
  const resolvedWrap = document.createElement('div');
  resolvedWrap.className = 'detail-resolved-wrap';

  const resolvedLabel = document.createElement('p');
  resolvedLabel.className = 'detail-resolved-label';
  resolvedLabel.textContent = 'この回答で解決しましたか？';

  const btnGroup = document.createElement('div');
  btnGroup.className = 'detail-btn-group';
  btnGroup.setAttribute('role', 'group');
  btnGroup.setAttribute('aria-label', '解決確認');

  const yesBtn = document.createElement('button');
  yesBtn.type = 'button';
  yesBtn.className = 'btn btn--primary btn--large';
  yesBtn.setAttribute('aria-label', 'はい、解決しました');
  yesBtn.textContent = '✓ 解決した';
  yesBtn.addEventListener('click', () => handleResolved(true));

  const noBtn = document.createElement('button');
  noBtn.type = 'button';
  noBtn.className = 'btn btn--outline btn--large';
  noBtn.setAttribute('aria-label', 'いいえ、まだ解決していません');
  noBtn.textContent = '✗ 解決しなかった';
  noBtn.addEventListener('click', () => handleResolved(false));

  btnGroup.appendChild(yesBtn);
  btnGroup.appendChild(noBtn);
  resolvedWrap.appendChild(resolvedLabel);
  resolvedWrap.appendChild(btnGroup);
  card.appendChild(resolvedWrap);

  root.appendChild(card);
}

/**
 * 解決確認ボタン押下時の処理。
 * @param {boolean} resolved - 解決した場合はtrue
 */
function handleResolved(resolved) {
  if (resolved) {
    // 解決済みメッセージを表示してホームへ
    if (typeof showToast === 'function') {
      showToast('お役に立てて嬉しいです！ホームに戻ります。', 2000);
    }
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 2200);
  } else {
    // 未解決なら職員呼び出しページへ
    window.location.href = 'escalate.html';
  }
}

/**
 * FAQが見つからなかった場合のエラー表示。
 */
function renderNotFound() {
  const root = document.getElementById('faq-detail-root');
  if (!root) return;

  const loading = document.getElementById('detail-loading');
  if (loading) loading.remove();

  const errEl = document.createElement('div');
  errEl.className = 'no-results';
  errEl.setAttribute('role', 'status');

  const icon = document.createElement('div');
  icon.className = 'no-results__icon';
  icon.setAttribute('aria-hidden', 'true');
  icon.textContent = '🔎';

  const title = document.createElement('p');
  title.className = 'no-results__title';
  title.textContent = '質問が見つかりませんでした';

  const text = document.createElement('p');
  text.className = 'no-results__text';
  text.textContent = 'URLをご確認いただくか、一覧ページからお探しください。';

  const link = document.createElement('a');
  link.href = 'faq.html';
  link.className = 'btn btn--primary btn--large';
  link.setAttribute('aria-label', 'よくある質問の一覧に戻る');
  link.textContent = 'よくある質問に戻る';

  errEl.appendChild(icon);
  errEl.appendChild(title);
  errEl.appendChild(text);
  errEl.appendChild(link);
  root.appendChild(errEl);
}

// ========================================
// 関連FAQ
// ========================================

/**
 * 同カテゴリの関連FAQを最大3件表示する。
 * @param {FaqItem} currentItem - 現在表示中のアイテム
 */
function renderRelatedFaqs(currentItem) {
  const related = FAQ_ITEMS.filter(
    (item) => item.categoryId === currentItem.categoryId && item.id !== currentItem.id
  ).slice(0, 3);

  if (related.length === 0) return;

  const root = document.getElementById('faq-detail-root');
  if (!root) return;

  const section = document.createElement('section');
  section.className = 'related-faqs';
  section.setAttribute('aria-labelledby', 'related-heading');

  const heading = document.createElement('h2');
  heading.className = 'related-faqs__heading';
  heading.id = 'related-heading';
  heading.textContent = '関連する質問';
  section.appendChild(heading);

  const list = document.createElement('ul');
  list.className = 'related-faqs__list';
  list.setAttribute('role', 'list');

  related.forEach((item) => {
    const li = document.createElement('li');
    li.setAttribute('role', 'listitem');

    const link = document.createElement('a');
    link.href = `faq-detail.html?id=${item.id}`;
    link.className = 'related-faqs__item';
    link.setAttribute('aria-label', `関連質問: ${item.question}`);

    const qIcon = document.createElement('span');
    qIcon.className = 'related-faqs__q-icon';
    qIcon.setAttribute('aria-hidden', 'true');
    qIcon.textContent = 'Q';

    const qText = document.createElement('span');
    qText.className = 'related-faqs__q-text';
    qText.textContent = item.question;

    const arrow = document.createElement('span');
    arrow.className = 'related-faqs__arrow';
    arrow.setAttribute('aria-hidden', 'true');
    arrow.textContent = '›';

    link.appendChild(qIcon);
    link.appendChild(qText);
    link.appendChild(arrow);
    li.appendChild(link);
    list.appendChild(li);
  });

  section.appendChild(list);
  root.appendChild(section);

  // GSAPでフェードイン
  if (typeof gsap !== 'undefined') {
    gsap.from('.related-faqs', {
      opacity: 0,
      y: 15,
      duration: 0.4,
      ease: 'power2.out',
      delay: 0.3,
    });
  }
}
