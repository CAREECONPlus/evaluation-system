/**
 * アプリケーション基本設定
 * Firebase移行を考慮した設定構造
 */

// アプリケーション設定
const appConfig = {
  // 環境設定（'local' または 'firebase'）
  environment: 'local',
  
  // アプリケーション基本情報
  app: {
    name: '評価システム',
    version: '1.0.0',
    description: '企業向け人事評価管理システム',
    author: 'Evaluation System Team'
  },
  
  // ローカル環境設定
  local: {
    // 自動ログイン機能
    autoLogin: true,
    // デバッグモード
    debug: true,
    // データベース設定
    database: {
      type: 'indexeddb',
      name: 'evaluation_system',
      version: 1
    },
    // 認証設定
    auth: {
      type: 'simulation',
      sessionTimeout: 3600000, // 1時間（ミリ秒）
      rememberLogin: true
    }
  },
  
  // Firebase設定（将来の移行用）
  firebase: {
    // Firebase設定オブジェクト（実際の値は後で設定）
    config: {
      apiKey: "",
      authDomain: "",
      projectId: "",
      storageBucket: "",
      messagingSenderId: "",
      appId: ""
    },
    // Firestore設定
    firestore: {
      enablePersistence: true
    },
    // 認証設定
    auth: {
      enableMultiTenant: true,
      customClaims: true
    }
  },
  
  // UI設定
  ui: {
    // 言語設定
    language: 'ja',
    // デフォルトテーマ
    defaultTheme: 'default',
    // 利用可能テーマ
    availableThemes: [
      'default',
      'dark',
      'construction'
    ],
    // ページネーション
    itemsPerPage: 10,
    // 日付フォーマット
    dateFormat: 'YYYY/MM/DD',
    // 時刻フォーマット
    timeFormat: 'HH:mm'
  },
  
  // 評価設定
  evaluation: {
    // 評価スケール
    scales: {
      quantitative: {
        min: 0,
        max: 5,
        step: 1
      },
      qualitative: {
        min: 1,
        max: 5,
        step: 1
      }
    },
    // 定性評価のデフォルト項目数
    defaultQualitativeItems: 5,
    // ウェイトの最小単位（%）
    weightStep: 10,
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
    toastDuration: 5000
  },
  
  // セキュリティ設定
  security: {
    // パスワードの最小長（Firebase移行時に使用）
    minPasswordLength: 8,
    // ログイン失敗の最大試行回数
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
  
  // 開発設定
  development: {
    // コンソールログレベル
    logLevel: 'info', // 'debug', 'info', 'warn', 'error'
    // パフォーマンス測定
    enablePerfMeasure: true,
    // 開発者モード表示要素
    showDebugInfo: false
  }
};

// 環境に応じた設定オーバーライド
if (appConfig.environment === 'local') {
  // ローカル環境用の追加設定
  appConfig.local.enableDemo = true;
  appConfig.local.generateSampleData = true;
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

// グローバルに公開
window.appConfig = appConfig;
window.getConfig = getConfig;
window.setConfig = setConfig;

// 現在の環境を判定する関数
const isLocal = () => appConfig.environment === 'local';
const isFirebase = () => appConfig.environment === 'firebase';

window.isLocal = isLocal;
window.isFirebase = isFirebase;
