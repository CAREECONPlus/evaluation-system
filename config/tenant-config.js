/**
 * 企業（テナント）別設定
 * 複数企業に対応した設定管理
 */

// 企業別設定
const tenantConfig = {
  // デモ建設会社
  'demo-construction': {
    id: 'demo-construction',
    name: 'デモ建設',
    displayName: 'デモ建設株式会社',
    description: '建設業向けの評価システムデモ',
    industry: 'construction',
    
    // 外観設定
    icon: 'fas fa-hard-hat',
    logo: 'assets/images/construction-logo.png',
    theme: 'construction',
    primaryColor: '#001350',
    
    // 企業固有設定
    settings: {
      // 役職一覧
      positions: [
        '現場作業員',
        '管理者',
        '代表'
      ],
      
      // 評価カテゴリセット
      evaluationCategorySet: 'construction',
      
      // 評価期間の設定
      evaluationPeriods: {
        frequency: 'semiannual', // 半期ごと
        customPeriods: [
          {
            name: '2024年上期',
            startDate: '2024-04-01',
            endDate: '2024-09-30'
          },
          {
            name: '2024年下期',
            startDate: '2024-10-01',
            endDate: '2025-03-31'
          }
        ]
      },
      
      // 承認フロー設定
      approvalFlow: {
        enableEvaluatorApproval: true,
        enableAdminApproval: true,
        allowSelfEvaluation: true
      },
      
      // 通知設定
      notifications: {
        evaluationDeadline: true,
        approvalReminder: true,
        statusUpdate: true
      }
    },
    
    // デモ用サンプルユーザー
    sampleUsers: [
      {
        id: 'admin-construction',
        name: '建設 太郎',
        email: 'admin@demo-construction.local',
        role: 'admin',
        position: '代表',
        password: 'demo123'
      },
      {
        id: 'manager-construction',
        name: '現場 花子',
        email: 'manager@demo-construction.local',
        role: 'evaluator',
        position: '管理者',
        password: 'demo123'
      },
      {
        id: 'employee-construction',
        name: '作業 次郎',
        email: 'employee@demo-construction.local',
        role: 'employee',
        position: '現場作業員',
        password: 'demo123'
      }
    ]
  },
  
  // デモIT会社
  'demo-it': {
    id: 'demo-it',
    name: 'デモIT',
    displayName: 'デモIT株式会社',
    description: 'IT企業向けの評価システムデモ',
    industry: 'it',
    
    // 外観設定
    icon: 'fas fa-laptop-code',
    logo: 'assets/images/it-logo.png',
    theme: 'default',
    primaryColor: '#007bff',
    
    // 企業固有設定
    settings: {
      // 役職一覧
      positions: [
        'エンジニア',
        'マネージャー',
        '経営者'
      ],
      
      // 評価カテゴリセット
      evaluationCategorySet: 'it',
      
      // 評価期間の設定
      evaluationPeriods: {
        frequency: 'quarterly', // 四半期ごと
        customPeriods: [
          {
            name: '2024年Q1',
            startDate: '2024-01-01',
            endDate: '2024-03-31'
          },
          {
            name: '2024年Q2',
            startDate: '2024-04-01',
            endDate: '2024-06-30'
          }
        ]
      },
      
      // 承認フロー設定
      approvalFlow: {
        enableEvaluatorApproval: true,
        enableAdminApproval: false, // IT企業は1段階承認
        allowSelfEvaluation: true
      },
      
      // 通知設定
      notifications: {
        evaluationDeadline: true,
        approvalReminder: true,
        statusUpdate: false
      }
    },
    
    // デモ用サンプルユーザー
    sampleUsers: [
      {
        id: 'admin-it',
        name: 'IT 代表',
        email: 'admin@demo-it.local',
        role: 'admin',
        position: '経営者',
        password: 'demo123'
      },
      {
        id: 'manager-it',
        name: 'プロジェクト マネージャー',
        email: 'manager@demo-it.local',
        role: 'evaluator',
        position: 'マネージャー',
        password: 'demo123'
      },
      {
        id: 'engineer-it',
        name: 'システム エンジニア',
        email: 'engineer@demo-it.local',
        role: 'employee',
        position: 'エンジニア',
        password: 'demo123'
      }
    ]
  },
  
  // デモ営業会社
  'demo-sales': {
    id: 'demo-sales',
    name: 'デモ営業',
    displayName: 'デモ営業株式会社',
    description: '営業特化型の評価システムデモ',
    industry: 'sales',
    
    // 外観設定
    icon: 'fas fa-chart-line',
    logo: 'assets/images/sales-logo.png',
    theme: 'default',
    primaryColor: '#28a745',
    
    // 企業固有設定
    settings: {
      // 役職一覧
      positions: [
        '営業',
        '営業管理者',
        '役員'
      ],
      
      // 評価カテゴリセット
      evaluationCategorySet: 'sales',
      
      // 評価期間の設定
      evaluationPeriods: {
        frequency: 'monthly', // 毎月
        autoGenerate: true // 自動生成
      },
      
      // 承認フロー設定
      approvalFlow: {
        enableEvaluatorApproval: true,
        enableAdminApproval: true,
        allowSelfEvaluation: true
      },
      
      // 通知設定
      notifications: {
        evaluationDeadline: true,
        approvalReminder: true,
        statusUpdate: true
      }
    },
    
    // デモ用サンプルユーザー
    sampleUsers: [
      {
        id: 'admin-sales',
        name: '営業 役員',
        email: 'admin@demo-sales.local',
        role: 'admin',
        position: '役員',
        password: 'demo123'
      },
      {
        id: 'manager-sales',
        name: '営業 管理者',
        email: 'manager@demo-sales.local',
        role: 'evaluator',
        position: '営業管理者',
        password: 'demo123'
      },
      {
        id: 'sales-rep',
        name: '営業 担当',
        email: 'sales@demo-sales.local',
        role: 'employee',
        position: '営業',
        password: 'demo123'
      }
    ]
  }
};

// テナント取得ヘルパー関数
const getTenantConfig = (tenantId) => {
  return tenantConfig[tenantId] || null;
};

// テナント一覧取得
const getAllTenants = () => {
  return Object.values(tenantConfig);
};

// 現在のテナント取得
const getCurrentTenant = () => {
  const selectedTenant = localStorage.getItem('selectedTenant');
  return selectedTenant ? getTenantConfig(selectedTenant) : null;
};

// テナント設定更新
const updateTenantConfig = (tenantId, updates) => {
  if (tenantConfig[tenantId]) {
    tenantConfig[tenantId] = { ...tenantConfig[tenantId], ...updates };
    return true;
  }
  return false;
};

// カスタムテナント追加
const addCustomTenant = (tenantData) => {
  const tenantId = tenantData.id || `custom-${Date.now()}`;
  
  // デフォルト設定をマージ
  const defaultTenant = {
    id: tenantId,
    name: tenantData.name || 'カスタム企業',
    displayName: tenantData.displayName || tenantData.name,
    description: tenantData.description || '',
    industry: tenantData.industry || 'other',
    icon: 'fas fa-building',
    logo: '',
    theme: 'default',
    primaryColor: '#007bff',
    settings: {
      positions: ['従業員', '管理者', '代表'],
      evaluationCategorySet: 'default',
      evaluationPeriods: {
        frequency: 'semiannual',
        customPeriods: []
      },
      approvalFlow: {
        enableEvaluatorApproval: true,
        enableAdminApproval: true,
        allowSelfEvaluation: true
      },
      notifications: {
        evaluationDeadline: true,
        approvalReminder: true,
        statusUpdate: true
      }
    },
    sampleUsers: [
      {
        id: `admin-${tenantId}`,
        name: '管理者',
        email: `admin@${tenantId}.local`,
        role: 'admin',
        position: '代表',
        password: 'demo123'
      }
    ]
  };
  
  tenantConfig[tenantId] = { ...defaultTenant, ...tenantData };
  return tenantConfig[tenantId];
};

// グローバルに公開
window.tenantConfig = tenantConfig;
window.getTenantConfig = getTenantConfig;
window.getAllTenants = getAllTenants;
window.getCurrentTenant = getCurrentTenant;
window.updateTenantConfig = updateTenantConfig;
window.addCustomTenant = addCustomTenant;

// 業界別テーママッピング
const industryThemeMap = {
  'construction': 'construction',
  'it': 'default',
  'sales': 'default',
  'manufacturing': 'default',
  'retail': 'default',
  'finance': 'default',
  'other': 'default'
};

window.industryThemeMap = industryThemeMap;
