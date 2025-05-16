/**
 * アプリケーション基本設定（建設業特化版）
 * BRANU株式会社向け設定
 */

// アプリケーション設定（建設業特化）
const appConfig = {
  // 環境設定（常にlocalに固定）
  environment: 'local',
  
  // アプリケーション基本情報
  app: {
    name: 'CAREECON評価システム',
    version: '1.0.0',
    description: '建設業向け人事評価管理システム',
    author: 'BRANU株式会社',
    industry: 'construction'
  },
  
  // ローカル環境設定（建設業特化）
  local: {
    // 自動ログイン機能
    autoLogin: true,
    // デバッグモード
    debug: true,
    // データベース設定
    database: {
      type: 'indexeddb',
      name: 'careecon_construction',
      version: 1
    },
    // 認証設定
    auth: {
      type: 'simulation',
      sessionTimeout: 3600000, // 1時間
      rememberLogin: true
    },
    // 建設業特化設定
    constructionMode: true,
    singleTenant: true // 単一企業モード
  },
  
  // UI設定（建設業向け）
  ui: {
    // 言語設定
    language: 'ja',
    // デフォルトテーマ（建設業）
    defaultTheme: 'construction',
    // 利用可能テーマ
    availableThemes: [
      'default',
      'construction'
    ],
    // CAREECON ブランディング
    branding: {
      showLogo: true,
      logoPath: 'assets/images/logo.png',
      logoMaxHeight: '35px',
      companyName: 'CAREECON',
      primaryColor: '#1e6fff',
      accentColor: '#ff6b35'
    },
    // ページネーション
    itemsPerPage: 10,
    // 日付フォーマット
    dateFormat: 'YYYY/MM/DD',
    // 時刻フォーマット
    timeFormat: 'HH:mm'
  },
  
  // 評価設定（建設業特化）
  evaluation: {
    // 評価スケール
    scales: {
      construction: {
        min: 0,
        max: 5,
        step: 1
      },
      sales: {
        min: 1,
        max: 5,
        step: 1
      },
      qualitative: {
        min: 1,
        max: 5,
        step: 1
      }
    },
    // 建設業向け評価カテゴリ
    categories: {
      enabled: [
        'construction-cross-new',
        'construction-cross-replace', 
        'construction-floor',
        'construction-sheet',
        'construction-misc',
        'construction-management',
        'sales-performance',
        'sales-activities'
      ]
    },
    // 定性評価設定
    qualitative: {
      defaultItems: 5,
      weightStep: 5, // 5%単位
      mandatoryWeightTotal: 100
    },
    // 承認フロー
    approvalFlow: ['submitted', 'approved_by_evaluator', 'approved_by_admin'],
    // 自動保存間隔（秒）
    autoSaveInterval: 30
  },
  
  // 通知設定
  notifications: {
    // 評価期限通知（日前）
    evaluationDeadlineNotice: [7, 3, 1],
    // 承認待ち通知間隔（日）
    approvalReminderInterval: 2,
    // 通知の表示時間（ミリ秒）
    toastDuration: 5000,
    // 建設業特有の通知
    safetyNotifications: true,
    qualityNotifications: true
  },
  
  // セキュリティ設定
  security: {
    // ログイン試行制限
    maxLoginAttempts: 5,
    // ログイン失敗後のロックアウト時間（分）
    lockoutDuration: 15,
    // セッション有効期限チェック間隔（分）
    sessionCheckInterval: 5
  },
  
  // パフォーマンス設定
  performance: {
    // 遅延読み込み閾値（ピクセル）
    lazyLoadThreshold: 100,
    // IndexedDBの最大レコード数
    maxRecords: 10000,
    // キャッシュの有効期限（分）
    cacheExpiration: 60
  },
  
  // 建設業特化機能
  constructionFeatures: {
    // 安全管理機能
    safetyManagement: {
      enabled: true,
      trackSafetyRecord: true,
      dailyKYActivity: true
    },
    // 品質管理機能
    qualityManagement: {
      enabled: true,
      trackQualityMetrics: true,
      customerFeedback: true
    },
    // プロジェクト管理機能
    projectManagement: {
      enabled: true,
      profitTracking: true,
      materialCostManagement: true,
      scheduleManagement: true
    },
    // 技能評価機能
    skillAssessment: {
      enabled: true,
      trackCertifications: true,
      skillMatrixDisplay: true
    }
  },
  
  // 開発設定
  development: {
    // コンソールログレベル
    logLevel: 'info',
    // パフォーマンス測定
    enablePerfMeasure: true,
    // 開発者モード表示要素
    showDebugInfo: false
  }
};

// 建設業特化の設定オーバーライド
if (appConfig.local.constructionMode) {
  // 建設業モード用の追加設定
  appConfig.local.enableDemo = true;
  appConfig.local.generateSampleData = true;
  appConfig.local.singleTenant = true;
  
  // 評価項目を建設業に限定
  appConfig.evaluation.categorySet = 'construction';
  
  // ブランド設定の調整
  appConfig.ui.branding.showIndustryLabel = true;
  appConfig.ui.branding.industryLabel = '建設業特化';
}

// 設定の取得ヘルパー関数
const getConfig = (path) => {
  const keys = path.split('.');
  let current = appConfig;
  
  for (const key of keys) {
    if (current && typeof current === 'object' && key in current) {
      current = current[key];
    } else {
      return undefined;
    }
  }
  
  return current;
};

// 設定の更新ヘルパー関数
const setConfig = (path, value) => {
  const keys = path.split('.');
  const lastKey = keys.pop();
  let current = appConfig;
  
  for (const key of keys) {
    if (!(key in current)) {
      current[key] = {};
    }
    current = current[key];
  }
  
  current[lastKey] = value;
};

// 建設業特化設定の取得
const getConstructionConfig = () => {
  return appConfig.constructionFeatures;
};

// UI設定の取得
const getUIConfig = () => {
  return appConfig.ui;
};

// ブランド設定の取得
const getBrandingConfig = () => {
  return appConfig.ui.branding;
};

// グローバルに公開
window.appConfig = appConfig;
window.getConfig = getConfig;
window.setConfig = setConfig;
window.getConstructionConfig = getConstructionConfig;
window.getUIConfig = getUIConfig;
window.getBrandingConfig = getBrandingConfig;

// 環境判定関数
const isConstructionMode = () => appConfig.local.constructionMode;
const isSingleTenant = () => appConfig.local.singleTenant;
const isLocal = () => appConfig.environment === 'local';

window.isConstructionMode = isConstructionMode;
window.isSingleTenant = isSingleTenant;
window.isLocal = isLocal;

// 初期化ログ
console.log('建設業特化アプリケーション設定が読み込まれました');
console.log(`モード: ${appConfig.local.constructionMode ? '建設業特化' : '汎用'}`);
console.log(`テナント: ${appConfig.local.singleTenant ? '単一企業' : 'マルチテナント'}`);

// 初期化完了フラグ
window.appConfigLoaded = true;
