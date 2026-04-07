/**
 * escalate.js
 * 職員呼び出し・番号札発行画面のロジック
 *
 * 担当機能:
 *   - 職員呼び出しボタンの処理
 *   - 番号札カテゴリ選択
 *   - 番号札発行（デモ: ランダム番号生成）
 *   - 発行後の確認表示へのアニメーション遷移
 */

'use strict';

// ========================================
// 定数
// ========================================

/**
 * カテゴリごとの番号帯定義（デモ用）
 * 実際のシステムでは券売機APIと連携する
 */
const TICKET_RANGES = {
  general:   { prefix: 'A', min: 1,  max: 99,  label: '一般窓口' },
  mynumber:  { prefix: 'M', min: 1,  max: 30,  label: 'マイナンバー窓口' },
  tax:       { prefix: 'T', min: 1,  max: 50,  label: '税務窓口' },
  childcare: { prefix: 'C', min: 1,  max: 30,  label: '子育て窓口' },
};

/** 現在選択中のカテゴリ */
let selectedCategory = 'general';

// ========================================
// 初期化
// ========================================

document.addEventListener('DOMContentLoaded', () => {
  initTicketCategoryButtons();
  initCallStaffButton();
  initIssueTicketButton();
  animateEntrance();
});

// ========================================
// 入場アニメーション
// ========================================

function animateEntrance() {
  if (typeof gsap === 'undefined') return;

  gsap.from('.escalate-card', {
    opacity: 0,
    y: 30,
    duration: 0.5,
    ease: 'power2.out',
    stagger: 0.12,
    delay: 0.2,
  });
}

// ========================================
// 職員呼び出し
// ========================================

/**
 * 職員呼び出しボタンのイベントを設定する。
 */
function initCallStaffButton() {
  const btn = document.getElementById('call-staff-btn');
  if (!btn) return;

  btn.addEventListener('click', handleCallStaff);
}

/**
 * 職員呼び出し処理。
 * 実際の端末では呼び出しハードウェアAPIと連携する。
 */
function handleCallStaff() {
  const selectSection = document.getElementById('escalate-select');
  const calledSection = document.getElementById('escalate-called');
  if (!selectSection || !calledSection) return;

  // 選択画面を非表示にして確認表示へ切り替える
  selectSection.hidden = true;
  calledSection.hidden = false;

  if (typeof gsap !== 'undefined') {
    gsap.from(calledSection, {
      opacity: 0,
      scale: 0.95,
      duration: 0.4,
      ease: 'back.out(1.4)',
    });
  }

  // ページタイトルをスクリーンリーダー向けに更新する
  const pageTitle = document.querySelector('.page-header__title');
  if (pageTitle) pageTitle.textContent = '職員を呼び出しました';
}

// ========================================
// 番号札カテゴリ選択
// ========================================

/**
 * 番号札カテゴリボタンのイベントを設定する。
 */
function initTicketCategoryButtons() {
  const catBtns = document.querySelectorAll('.ticket-cat-btn');
  if (catBtns.length === 0) return;

  catBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      selectedCategory = btn.dataset.cat;

      catBtns.forEach((b) => {
        const isActive = b === btn;
        b.classList.toggle('ticket-cat-btn--active', isActive);
        b.setAttribute('aria-pressed', String(isActive));
      });
    });
  });
}

// ========================================
// 番号札発行
// ========================================

/**
 * 番号札発行ボタンのイベントを設定する。
 */
function initIssueTicketButton() {
  const btn = document.getElementById('issue-ticket-btn');
  if (!btn) return;

  btn.addEventListener('click', handleIssueTicket);
}

/**
 * 番号札発行処理（デモ）。
 * 実際の端末では券売機ハードウェアAPIと連携する。
 */
function handleIssueTicket() {
  const selectSection = document.getElementById('escalate-select');
  const issuedSection = document.getElementById('escalate-ticket-issued');
  if (!selectSection || !issuedSection) return;

  const range = TICKET_RANGES[selectedCategory] || TICKET_RANGES.general;

  // ランダムな番号を生成する（デモ）
  const num    = Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
  const numStr = String(num).padStart(2, '0');
  const ticket = `${range.prefix}${numStr}`;

  // 番号と待ち人数を表示する
  const ticketNumberEl  = document.getElementById('ticket-number');
  const waitInfoEl      = document.getElementById('ticket-wait-info');
  const waitCount       = Math.floor(Math.random() * 8) + 1; // 1〜8人（デモ）

  if (ticketNumberEl) ticketNumberEl.textContent = ticket;
  if (waitInfoEl) {
    waitInfoEl.textContent =
      `${range.label} / 現在の待ち人数: 約${waitCount}人`;
  }

  // 選択画面を非表示にして確認表示へ切り替える
  selectSection.hidden = true;
  issuedSection.hidden = false;

  if (typeof gsap !== 'undefined') {
    gsap.from(issuedSection, {
      opacity: 0,
      scale: 0.95,
      duration: 0.4,
      ease: 'back.out(1.4)',
    });
    // 番号をポップアップアニメーション
    gsap.from('.ticket-number', {
      scale: 0.5,
      opacity: 0,
      duration: 0.5,
      ease: 'back.out(2)',
      delay: 0.2,
    });
  }

  // ページタイトルをスクリーンリーダー向けに更新する
  const pageTitle = document.querySelector('.page-header__title');
  if (pageTitle) pageTitle.textContent = `番号札 ${ticket} を発行しました`;
}
