/**
 * 企業設定（建設業専用版）
 * BRANU株式会社向け建設業特化システム
 */

// 建設業専用の企業設定
const tenantConfig = {
  'construction-demo': {
    // 企業基本情報
    id: 'construction-demo',
    name: 'ディーココンストラクション',
    displayName: 'ディーココンストラクション株式会社',
    description: '内装工事・リノベーション専門の建設会社',
    domain: 'demo.construction',
    industry: 'construction',
    
    // 設定
    settings: {
      // 評価カテゴリセット（建設業専用）
      evaluationCategorySet: 'construction',
      
      // 利用可能な役職（建設業特化）
      availablePositions: [
        '現場作業員',
        '管理者',
        '営業',
        '代表'
      ],
      
      // 利用可能な役割
      availableRoles: [
        'employee',    // 従業員
        'evaluator',   // 評価者
        'admin'        // 管理者
      ],
      
      // 評価期間設定
      evaluationPeriods: {
        defaultLength: 6, // 6ヶ月
        deadlineWarningDays: 7
      },
      
      // UI設定
      theme: 'construction',
      logo: 'assets/images/logo.png',
      primaryColor: '#1e6fff',
      
      // 機能設定
      features: {
        selfEvaluation: true,
        peerEvaluation: false,
        360Evaluation: false,
        goalSetting: true,
        skillMatrixs: true
      },
      
      // 通知設定
      notifications: {
        email: false,
        inApp: true,
        deadlineReminder: true
      }
    },
    
    // 建設業向けサンプルユーザー
    sampleUsers: [
      {
        id: 'admin',
        name: '建設 太郎',
        email: 'admin@demo.com',
        role: 'admin',
        position: '代表',
        department: '経営陣',
        password: 'demo123'
      },
      {
        id: 'manager',
        name: '現場 花子',
        email: 'manager@demo.com',
        role: 'evaluator',
        position: '管理者',
        department: '現場管理部',
        password: 'demo123'
      },
      {
        id: 'employee',
        name: '作業 次郎',
        email: 'employee@demo.com',
        role: 'employee',
        position: '現場作業員',
        department: '工事部',
        password: 'demo123'
      },
      {
        id: 'sales1',
        name: '営業 三郎',
        email: 'sales1@demo.com',
        role: 'employee',
        position: '営業',
        department: '営業部',
        password: 'demo123'
      },
      {
        id: 'worker1',
        name: '職人 四郎',
        email: 'worker1@demo.com',
        role: 'employee',
        position: '現場作業員',
        department: '工事部',
        password: 'demo123'
      }
    ],
    
    // 部署構成
    departments: [
      {
        id: 'management',
        name: '経営陣',
        description: '会社運営・経営戦略'
      },
      {
        id: 'construction',
        name: '工事部',
        description: '現場作業・施工管理'
      },
      {
        id: 'sales',
        name: '営業部',
        description: '営業・顧客対応'
      },
      {
        id: 'admin',
        name: '管理部',
        description: '総務・経理・人事'
      }
    ],
    
    // カスタムフィールド（建設業向け）
    customFields: {
      user: [
        {
          id: 'license',
          name: '資格・免許',
          type: 'text',
          options: [
            '建設業経理検定',
            '建築施工管理技術検定',
            '内装仕上げ施工技能検定',
            '建設業許可',
            '安全管理者'
          ]
        },
        {
          id: 'experience_years',
          name: '経験年数',
          type: 'number',
          unit: '年'
        },
        {
          id: 'specialization',
          name: '専門分野',
          type: 'select',
          options: [
            'クロス工事',
            '床工事',
            'シート工事',
            '施工管理',
            '営業',
            '積算・見積'
          ]
        }
      ],
      evaluation: [
        {
          id: 'safety_record',
          name: '安全実績',
          type: 'text',
          description: '当期の安全記録・事故歴'
        },
        {
          id: 'quality_awards',
          name: '品質評価',
          type: 'text',
          description: '品質に関する社内外評価'
        }
      ]
    },
    
    // 評価項目のカスタマイズ
    evaluationCustomization: {
      // 定量評価のウェイト調整
      quantitativeWeights: {
        'construction-cross-new': 20,
        'construction-cross-replace': 15,
        'construction-floor': 15,
        'construction-sheet': 15,
        'construction-misc': 10,
        'construction-management': 25,
        'sales-performance': 70,
        'sales-activities': 30
      },
      
      // 定性評価のデフォルト項目
      defaultQualitativeGoals: {
        '現場作業員': [
          '安全意識の向上と事故防止',
          '技術力向上と品質安定',
          '作業効率化への取り組み',
          'チームワークの向上',
          '後輩指導・技術伝承'
        ],
        '管理者': [
          '現場安全管理の徹底',
          '施工品質管理の向上',
          '工程管理と納期遵守',
          'チームマネジメント',
          'コストダウンの推進'
        ],
        '営業': [
          '売上目標の達成',
          '新規顧客開拓',
          '提案力の向上',
          '顧客満足度向上',
          'アフターフォロー強化'
        ],
        '代表': [
          '会社業績の向上',
          '組織力強化',
          '新事業展開',
          '人材育成',
          'ブランド価値向上'
        ]
      }
    },
    
    // 建設業特有の設定
    constructionSettings: {
      // 安全管理関連
      safety: {
        enableDailyKY: true,  // 日々のKY活動記録
        trackSafetyRecord: true,  // 安全実績追跡
        mandatorySafetyTraining: true  // 安全講習必須
      },
      
      // 品質管理関連
      quality: {
        enableQualityCheck: true,  // 品質チェック機能
        trackDefectRate: true,  // 不具合率追跡
        customerSatisfactionSurvey: true  // 顧客満足度調査
      },
      
      // プロジェクト管理関連
      project: {
        trackProjectProfit: true,  // 現場利益管理
        enableScheduleManagement: true,  // 工程管理
        trackMaterialCost: true  // 資材コスト管理
      }
    },
    
    // 初期データ
    initialData: {
      createSampleEvaluations: true,
      evaluationCount: 5,
      includeHistoricalData: true
    }
  }
};

// ヘルパー関数
const getTenantConfig = (tenantId) => {
  return tenantConfig[tenantId] || null;
};

const getCurrentTenant = () => {
  const selectedTenant = localStorage.getItem('selectedTenant') || 'construction-demo';
  return getTenantConfig(selectedTenant);
};

const getAvailablePositions = (tenantId = null) => {
  const tenant = tenantId ? getTenantConfig(tenantId) : getCurrentTenant();
  return tenant ? tenant.settings.availablePositions : ['従業員', '管理者'];
};

const getAvailableRoles = (tenantId = null) => {
  const tenant = tenantId ? getTenantConfig(tenantId) : getCurrentTenant();
  return tenant ? tenant.settings.availableRoles : ['employee', 'evaluator', 'admin'];
};

const getDepartments = (tenantId = null) => {
  const tenant = tenantId ? getTenantConfig(tenantId) : getCurrentTenant();
  return tenant ? tenant.departments : [];
};

const getCustomFields = (type, tenantId = null) => {
  const tenant = tenantId ? getTenantConfig(tenantId) : getCurrentTenant();
  return tenant && tenant.customFields ? tenant.customFields[type] || [] : [];
};

const getDefaultQualitativeGoals = (position, tenantId = null) => {
  const tenant = tenantId ? getTenantConfig(tenantId) : getCurrentTenant();
  if (!tenant || !tenant.evaluationCustomization || !tenant.evaluationCustomization.defaultQualitativeGoals) {
    return [];
  }
  return tenant.evaluationCustomization.defaultQualitativeGoals[position] || [];
};

// 建設業特化の設定値取得
const getConstructionSettings = (tenantId = null) => {
  const tenant = tenantId ? getTenantConfig(tenantId) : getCurrentTenant();
  return tenant ? tenant.constructionSettings : null;
};

// バリデーション関数
const validateTenantConfig = (config) => {
  const errors = [];
  
  if (!config.id) errors.push('企業IDが設定されていません');
  if (!config.name) errors.push('企業名が設定されていません');
  if (!config.settings) errors.push('設定情報が不足しています');
  
  return errors;
};

// グローバルに公開
window.tenantConfig = tenantConfig;
window.getTenantConfig = getTenantConfig;
window.getCurrentTenant = getCurrentTenant;
window.getAvailablePositions = getAvailablePositions;
window.getAvailableRoles = getAvailableRoles;
window.getDepartments = getDepartments;
window.getCustomFields = getCustomFields;
window.getDefaultQualitativeGoals = getDefaultQualitativeGoals;
window.getConstructionSettings = getConstructionSettings;
window.validateTenantConfig = validateTenantConfig;

// デフォルトテナントの設定
window.defaultTenant = 'construction-demo';

// 初期化ログ
console.log('建設業特化テナント設定が読み込まれました');

// 初期化処理
document.addEventListener('DOMContentLoaded', () => {
  // デフォルトテナントの設定
  if (!localStorage.getItem('selectedTenant')) {
    localStorage.setItem('selectedTenant', 'construction-demo');
  }
  
  // 建設業特化フラグの設定
  const currentTenant = getCurrentTenant();
  if (currentTenant && currentTenant.industry === 'construction') {
    document.body.classList.add('construction-mode');
    console.log(`建設業特化モードで初期化: ${currentTenant.displayName}`);
  }
});
