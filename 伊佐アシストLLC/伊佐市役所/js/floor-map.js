/**
 * floor-map.js
 * フロアマップ画面のロジック
 *
 * 担当機能:
 *   - フロアタブの切り替え（1F / 2F / 3F）
 *   - タブ切り替え時のGSAPアニメーション
 */

'use strict';

// ========================================
// 初期化
// ========================================

document.addEventListener('DOMContentLoaded', () => {
  initFloorTabs();
  animateInitialPanel();
});

// ========================================
// フロアタブ切り替え
// ========================================

/**
 * フロア切り替えタブのイベントを設定する。
 */
function initFloorTabs() {
  const tabs = document.querySelectorAll('.floor-tab');
  if (tabs.length === 0) return;

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const targetFloor = tab.dataset.floor;
      switchFloor(targetFloor);
    });
  });
}

/**
 * 指定フロアのパネルを表示し、他を非表示にする。
 * @param {string} floor - フロアID（'1f' / '2f' / '3f'）
 */
function switchFloor(floor) {
  const tabs   = document.querySelectorAll('.floor-tab');
  const panels = document.querySelectorAll('.floor-panel');

  // タブの状態を更新する
  tabs.forEach((tab) => {
    const isActive = tab.dataset.floor === floor;
    tab.classList.toggle('floor-tab--active', isActive);
    tab.setAttribute('aria-selected', String(isActive));
  });

  // パネルの表示を切り替える
  panels.forEach((panel) => {
    const isTarget = panel.id === `panel-${floor}`;
    panel.hidden = !isTarget;
    panel.classList.toggle('floor-panel--active', isTarget);
  });

  // 表示されたパネルをアニメーションする
  const targetPanel = document.getElementById(`panel-${floor}`);
  if (targetPanel && typeof gsap !== 'undefined') {
    gsap.from(targetPanel, {
      opacity: 0,
      x: 20,
      duration: 0.3,
      ease: 'power2.out',
    });
    gsap.from(targetPanel.querySelectorAll('.window-item'), {
      opacity: 0,
      y: 8,
      duration: 0.25,
      ease: 'power2.out',
      stagger: 0.05,
      delay: 0.1,
    });
  }
}

/**
 * 初期表示（1階）のアニメーションを実行する。
 */
function animateInitialPanel() {
  if (typeof gsap === 'undefined') return;

  gsap.from('.floor-map-svg', {
    opacity: 0,
    scale: 0.97,
    duration: 0.5,
    ease: 'power2.out',
    delay: 0.2,
  });

  gsap.from('.window-item', {
    opacity: 0,
    y: 10,
    duration: 0.3,
    ease: 'power2.out',
    stagger: 0.06,
    delay: 0.4,
  });
}
