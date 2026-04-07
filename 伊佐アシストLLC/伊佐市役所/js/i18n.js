/**
 * i18n.js
 * 伊佐市役所 窓口案内システム — 国際化（多言語対応）
 *
 * 対応言語: ja（日本語）/ en（英語）/ zh（中国語簡体）/ ko（韓国語）
 * 使い方: data-i18n="key" 属性を持つ要素のテキストを切り替える
 */

'use strict';

// ========================================
// 翻訳データ
// ========================================

/** @type {Object.<string, Object.<string, string>>} */
const I18N_MESSAGES = {

  ja: {
    skip_to_main:       'メインコンテンツへスキップ',
    loading:            '読み込み中...',
    timeout_warning:    '画面が自動でリセットされます',
    timeout_seconds_unit: '秒後にホームに戻ります',
    timeout_cancel:     '続けて操作する',
    city_name:          '伊佐市役所',
    system_name:        '窓口案内システム',
    font_size_label:    '文字サイズ',
    welcome_heading:    '何かお困りですか？',
    welcome_subheading: 'カテゴリをタップして、お調べになりたいことを選んでください。',
    category_heading:   'お手続きのカテゴリ',
    cat_residence:      '住民票・戸籍',
    cat_tax:            '税金・国保',
    cat_childcare:      '子育て・教育',
    cat_welfare:        '介護・福祉',
    cat_land:           '土地・建物',
    cat_environment:    'ごみ・環境',
    cat_floormap:       'フロアマップ',
    cat_other:          'その他・よくある質問',
    search_heading:     'キーワードで探す',
    search_cta:         'キーワードで探す',
    footer_support:     '解決しない場合は、窓口スタッフにお気軽にお声がけください。',
    footer_escalate:    '職員を呼ぶ / 番号札を発行する',
  },

  en: {
    skip_to_main:       'Skip to main content',
    loading:            'Loading...',
    timeout_warning:    'Screen will reset automatically',
    timeout_seconds_unit: ' seconds until returning to home',
    timeout_cancel:     'Continue',
    city_name:          'Isa City Hall',
    system_name:        'Counter Guide System',
    font_size_label:    'Font Size',
    welcome_heading:    'How can we help you?',
    welcome_subheading: 'Tap a category to find what you are looking for.',
    category_heading:   'Service Categories',
    cat_residence:      'Residence / Registry',
    cat_tax:            'Tax / Insurance',
    cat_childcare:      'Child / Education',
    cat_welfare:        'Care / Welfare',
    cat_land:           'Land / Building',
    cat_environment:    'Waste / Environment',
    cat_floormap:       'Floor Map',
    cat_other:          'Other / FAQ',
    search_heading:     'Search by keyword',
    search_cta:         'Search by keyword',
    footer_support:     'If you need further assistance, please ask a staff member.',
    footer_escalate:    'Call Staff / Get a Queue Number',
  },

  zh: {
    skip_to_main:       '跳至主要内容',
    loading:            '加载中...',
    timeout_warning:    '画面即将自动重置',
    timeout_seconds_unit: '秒后返回首页',
    timeout_cancel:     '继续操作',
    city_name:          '伊佐市政厅',
    system_name:        '窗口导览系统',
    font_size_label:    '字体大小',
    welcome_heading:    '请问有什么需要帮助的吗？',
    welcome_subheading: '请点击分类，选择您想查询的内容。',
    category_heading:   '办理类别',
    cat_residence:      '户籍・居民证明',
    cat_tax:            '税金・国保',
    cat_childcare:      '育儿・教育',
    cat_welfare:        '护理・福利',
    cat_land:           '土地・建筑',
    cat_environment:    '垃圾・环保',
    cat_floormap:       '楼层地图',
    cat_other:          '其他・常见问题',
    search_heading:     '关键词搜索',
    search_cta:         '关键词搜索',
    footer_support:     '如未能解决，请向窗口工作人员咨询。',
    footer_escalate:    '呼叫工作人员 / 取号',
  },

  ko: {
    skip_to_main:       '메인 콘텐츠로 건너뛰기',
    loading:            '로딩 중...',
    timeout_warning:    '화면이 자동으로 초기화됩니다',
    timeout_seconds_unit: '초 후 홈으로 돌아갑니다',
    timeout_cancel:     '계속 이용하기',
    city_name:          '이사시청',
    system_name:        '안내 시스템',
    font_size_label:    '글자 크기',
    welcome_heading:    '무엇을 도와드릴까요?',
    welcome_subheading: '카테고리를 탭하여 원하시는 항목을 선택해 주세요.',
    category_heading:   '서비스 카테고리',
    cat_residence:      '주민등록・호적',
    cat_tax:            '세금・건강보험',
    cat_childcare:      '육아・교육',
    cat_welfare:        '요양・복지',
    cat_land:           '토지・건물',
    cat_environment:    '쓰레기・환경',
    cat_floormap:       '플로어맵',
    cat_other:          '기타・자주 묻는 질문',
    search_heading:     '키워드로 검색',
    search_cta:         '키워드로 검색',
    footer_support:     '해결되지 않으면 창구 직원에게 말씀해 주세요.',
    footer_escalate:    '직원 호출 / 번호표 발급',
  },
};

// ========================================
// 状態
// ========================================

/** @type {string} 現在の言語コード */
let currentLang = 'ja';

// ========================================
// 初期化
// ========================================

document.addEventListener('DOMContentLoaded', () => {
  // sessionStorageから言語設定を復元する
  const saved = sessionStorage.getItem('lang');
  if (saved && I18N_MESSAGES[saved]) {
    currentLang = saved;
    applyTranslations(currentLang);
    syncLangButtons(currentLang);
  }
});

// ========================================
// 公開関数
// ========================================

/**
 * 言語を切り替えてページ全体のテキストを更新する。
 * main.jsのinitLangSwitcherから呼び出される。
 * @param {string} lang - 言語コード（'ja' / 'en' / 'zh' / 'ko'）
 */
function setLanguage(lang) {
  if (!I18N_MESSAGES[lang]) return;
  currentLang = lang;
  sessionStorage.setItem('lang', lang);
  applyTranslations(lang);
  syncLangButtons(lang);
}

/**
 * 指定キーの翻訳文字列を返す。
 * 見つからない場合はキーをそのまま返す。
 * @param {string} key - 翻訳キー
 * @returns {string}
 */
function t(key) {
  return (I18N_MESSAGES[currentLang] && I18N_MESSAGES[currentLang][key])
    || (I18N_MESSAGES['ja'] && I18N_MESSAGES['ja'][key])
    || key;
}

// ========================================
// 内部処理
// ========================================

/**
 * data-i18n属性を持つ全要素のテキストを指定言語に差し替える。
 * @param {string} lang - 言語コード
 */
function applyTranslations(lang) {
  const messages = I18N_MESSAGES[lang];
  if (!messages) return;

  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.dataset.i18n;
    if (messages[key]) {
      el.textContent = messages[key];
    }
  });

  // html要素のlang属性を更新する
  document.documentElement.lang = lang;
}

/**
 * 言語ボタンのaria-pressed・activeクラスを現在の言語に合わせて更新する。
 * @param {string} lang - 言語コード
 */
function syncLangButtons(lang) {
  document.querySelectorAll('.lang-btn').forEach((btn) => {
    const isActive = btn.dataset.lang === lang;
    btn.setAttribute('aria-pressed', String(isActive));
    btn.classList.toggle('lang-btn--active', isActive);
  });
}
