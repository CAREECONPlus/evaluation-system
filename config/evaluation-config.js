/**
 * 評価項目設定とモックデータ
 * 業界・企業別の評価カテゴリとサンプルデータを定義
 */

// 評価基準の定義
const evaluationCriteria = {
  // 作業員/管理者用（技術系）
  technical: [
    { value: 0, label: 'レベル0', description: '作業できない/該当しない' },
    { value: 1, label: 'レベル1', description: '補助することができる' },
    { value: 2, label: 'レベル2', description: '指導を受けながらであればできる' },
    { value: 3, label: 'レベル3', description: '単独で業務を行うことができる' },
    { value: 4, label: 'レベル4', description: '指導を行うことができる' },
    { value: 5, label: 'レベル5', description: '全体の現場を仕切ることができる（複数人の管理）' }
  ],
  
  // 営業用
  sales: [
    { value: 1, label: 'レベル1', description: '69%' },
    { value: 2, label: 'レベル2', description: '70%' },
    { value: 3, label: 'レベル3', description: '90%' },
    { value: 4, label: 'レベル4', description: '100%' },
    { value: 5, label: 'レベル5', description: '110%' }
  ],
  
  // IT系（技術評価）
  it: [
    { value: 1, label: 'レベル1', description: '基礎的な知識がある' },
    { value: 2, label: 'レベル2', description: '指導の下で実装できる' },
    { value: 3, label: 'レベル3', description: '独立して実装できる' },
    { value: 4, label: 'レベル4', description: '設計・指導ができる' },
    { value: 5, label: 'レベル5', description: '技術リーダーとして牽引できる' }
  ],
  
  // 定性評価基準（全職種共通）
  qualitative: [
    { value: 1, label: 'レベル1', description: '全く実行できなかった' },
    { value: 2, label: 'レベル2', description: '一部実行できた' },
    { value: 3, label: 'レベル3', description: '実行できたが設定内容以上までは出来なかった' },
    { value: 4, label: 'レベル4', description: '実行できた' },
    { value: 5, label: 'レベル5', description: '設定内容以上のことを行えた' }
  ]
};

// 評価カテゴリセット
const evaluationCategorySets = {
  // 建設業用カテゴリ
  construction: [
    {
      id: 'construction-cross-new',
      name: 'クロス工事（新規）',
      positionTypes: ['現場作業員', '管理者'],
      weight: 20,
      items: [
        { id: 'cross-prep-1', name: '下地処理（パテ処理）' },
        { id: 'cross-prep-2', name: '寸法取り/材料発注' },
        { id: 'cross-install-1', name: 'クロス張り（無地 厚手）' },
        { id: 'cross-install-2', name: 'クロス張り（無地 薄手）' },
        { id: 'cross-install-3', name: 'クロス張り（柄物）' },
        { id: 'cross-safety', name: '安全管理（道具・機械の使用方法）' },
        { id: 'cross-prep-3', name: '施工準備（段取り）' }
      ]
    },
    {
      id: 'construction-cross-replace',
      name: 'クロス工事（張替）',
      positionTypes: ['現場作業員', '管理者'],
      weight: 15,
      items: [
        { id: 'replace-prep-1', name: '下地処理（パテ処理）' },
        { id: 'replace-prep-2', name: '寸法取り/材料発注' },
        { id: 'replace-install-1', name: 'クロス張り（無地 厚手）' },
        { id: 'replace-install-2', name: 'クロス張り（無地 薄手）' },
        { id: 'replace-install-3', name: 'クロス張り（柄物）' },
        { id: 'replace-safety', name: '安全管理' },
        { id: 'replace-prep-3', name: '施工準備（段取り）' }
      ]
    },
    {
      id: 'construction-floor',
      name: '床工事',
      positionTypes: ['現場作業員', '管理者'],
      weight: 15,
      items: [
        { id: 'floor-prep', name: '下地処理' },
        { id: 'floor-measure', name: '寸法取り/材料発注' },
        { id: 'floor-cushion', name: 'クッションフロア施工' },
        { id: 'floor-long', name: '長尺フロア施工' },
        { id: 'floor-carpet', name: 'タイルカーペット施工' },
        { id: 'floor-tile', name: 'フロアタイル施工' },
        { id: 'floor-baseboard', name: 'ソフト巾木施工' }
      ]
    },
    {
      id: 'construction-sheet',
      name: 'シート工事',
      positionTypes: ['現場作業員', '管理者'],
      weight: 15,
      items: [
        { id: 'sheet-prep', name: '下地処理' },
        { id: 'sheet-measure', name: '寸法取り/材料発注' },
        { id: 'sheet-dinoc', name: 'ダイノックシート施工' },
        { id: 'sheet-glass', name: 'ガラスフィルムシート施工' }
      ]
    },
    {
      id: 'construction-misc',
      name: '雑工事',
      positionTypes: ['現場作業員', '管理者'],
      weight: 10,
      items: [
        { id: 'misc-electric', name: '電気関係器具の取り付け' },
        { id: 'misc-water', name: '水道関係器具の取り付け' },
        { id: 'misc-wood', name: '木工事関係の施工' },
        { id: 'misc-blind', name: 'ロールスクリーン/ブラインド等の設置' },
        { id: 'misc-repair', name: '現場の不備の手直し' }
      ]
    },
    {
      id: 'construction-management',
      name: '施工管理',
      positionTypes: ['管理者'],
      weight: 25,
      items: [
        { id: 'mgmt-drawing', name: '施工図の作成' },
        { id: 'mgmt-method', name: '施工方法の検討' },
        { id: 'mgmt-electric-permit', name: '電力申請' },
        { id: 'mgmt-fire-permit', name: '消防申請' },
        { id: 'mgmt-budget', name: '予実管理（現場予算管理）' },
        { id: 'mgmt-safety-mgmt', name: '安全管理（安全書類の作成含む）' },
        { id: 'mgmt-estimate', name: '見積もりの作成' },
        { id: 'mgmt-invoice', name: '請求書の作成' },
        { id: 'mgmt-completion', name: '竣工書類の作成' },
        { id: 'mgmt-client', name: '施主様の対応' },
        { id: 'mgmt-expense', name: '経費管理' },
        { id: 'mgmt-schedule', name: '工程管理（工程表の作成）' },
        { id: 'mgmt-material', name: '材料の寸法取り/発注' },
        { id: 'mgmt-quality', name: '仕上がりのチェック' },
        { id: 'mgmt-order-check', name: '職人からの発注依頼の確認' },
        { id: 'mgmt-profit-rate', name: '利益率（20％/件）', type: 'calculated' },
        { id: 'mgmt-project-count', name: '管理件数（30件/半期）', type: 'calculated' }
      ]
    }
  ],
  
  // 営業用カテゴリ
  sales: [
    {
      id: 'sales-performance',
      name: '営業成績',
      positionTypes: ['営業'],
      weight: 100,
      items: [
        { id: 'sales-revenue', name: '利益額', type: 'target', target: 5000000 },
        { id: 'sales-count', name: '受注件数', type: 'target', target: 20 },
        { id: 'sales-average', name: '平均単価', type: 'calculated' }
      ]
    }
  ],
  
  // IT業界用カテゴリ
  it: [
    {
      id: 'it-technical',
      name: '技術スキル',
      positionTypes: ['エンジニア', 'マネージャー'],
      weight: 40,
      items: [
        { id: 'tech-programming', name: 'プログラミング能力' },
        { id: 'tech-architecture', name: 'システム設計能力' },
        { id: 'tech-debug', name: 'デバッグ・問題解決能力' },
        { id: 'tech-learning', name: '新技術の習得' },
        { id: 'tech-documentation', name: 'ドキュメント作成' }
      ]
    },
    {
      id: 'it-project',
      name: 'プロジェクト管理',
      positionTypes: ['マネージャー'],
      weight: 30,
      items: [
        { id: 'proj-planning', name: 'プロジェクト計画立案' },
        { id: 'proj-execution', name: 'プロジェクト実行管理' },
        { id: 'proj-risk', name: 'リスク管理' },
        { id: 'proj-communication', name: 'ステークホルダー対応' }
      ]
    },
    {
      id: 'it-quality',
      name: '品質管理',
      positionTypes: ['エンジニア', 'マネージャー'],
      weight: 30,
      items: [
        { id: 'quality-testing', name: 'テスト設計・実行' },
        { id: 'quality-review', name: 'コードレビュー' },
        { id: 'quality-improvement', name: '品質改善活動' }
      ]
    }
  ],
  
  // デフォルト（汎用）カテゴリ
  default: [
    {
      id: 'default-work-quality',
      name: '業務品質',
      positionTypes: ['従業員', '管理者'],
      weight: 30,
      items: [
        { id: 'work-accuracy', name: '正確性' },
        { id: 'work-efficiency', name: '効率性' },
        { id: 'work-deadline', name: '期限遵守' },
        { id: 'work-innovation', name: '改善提案' }
      ]
    },
    {
      id: 'default-communication',
      name: 'コミュニケーション',
      positionTypes: ['従業員', '管理者'],
      weight: 25,
      items: [
        { id: 'comm-reporting', name: '報告・連絡・相談' },
        { id: 'comm-teamwork', name: 'チームワーク' },
        { id: 'comm-customer', name: '顧客対応' }
      ]
    },
    {
      id: 'default-leadership',
      name: 'リーダーシップ',
      positionTypes: ['管理者'],
      weight: 25,
      items: [
        { id: 'lead-guidance', name: '部下指導' },
        { id: 'lead-decision', name: '意思決定' },
        { id: 'lead-motivation', name: 'チーム活性化' }
      ]
    },
    {
      id: 'default-growth',
      name: '自己成長',
      positionTypes: ['従業員', '管理者'],
      weight: 20,
      items: [
        { id: 'growth-learning', name: '自己研鑽' },
        { id: 'growth-challenge', name: '積極性' },
        { id: 'growth-adaptation', name: '適応力' }
      ]
    }
  ]
};

// モックデータ（サンプル）
const mockData = {
  // 評価期間
  periods: [
    {
      id: 'period-2024-h1',
      name: '2024年上期',
      startDate: '2024-04-01',
      endDate: '2024-09-30',
      isActive: false,
      evaluationDeadline: '2024-10-15',
      reviewDeadline: '2024-10-31'
    },
    {
      id: 'period-2024-h2',
      name: '2024年下期',
      startDate: '2024-10-01',
      endDate: '2025-03-31',
      isActive: true,
      evaluationDeadline: '2025-04-15',
      reviewDeadline: '2025-04-30'
    },
    {
      id: 'period-2023-h2',
      name: '2023年下期',
      startDate: '2023-10-01',
      endDate: '2024-03-31',
      isActive: false,
      evaluationDeadline: '2024-04-15',
      reviewDeadline: '2024-04-30'
    }
  ],
  
  // サンプル評価データ（企業選択後に動的生成）
  evaluations: [],
  
  // サンプルユーザーデータ（企業選択後に動的生成）
  users: [],
  
  // 定性評価のテンプレート
  qualitativeTemplates: [
    {
      id: 'template-communication',
      content: 'チーム内コミュニケーションの改善と情報共有の促進',
      defaultWeight: 30,
      applicablePositions: ['all']
    },
    {
      id: 'template-quality',
      content: '業務品質の向上と効率化の推進',
      defaultWeight: 25,
      applicablePositions: ['all']
    },
    {
      id: 'template-customer',
      content: '顧客満足度の向上に向けた取り組み',
      defaultWeight: 20,
      applicablePositions: ['営業', '管理者']
    },
    {
      id: 'template-leadership',
      content: '部下の指導・育成とチーム力向上',
      defaultWeight: 15,
      applicablePositions: ['管理者']
    },
    {
      id: 'template-safety',
      content: '安全意識の向上と事故防止活動',
      defaultWeight: 10,
      applicablePositions: ['現場作業員', '管理者']
    },
    {
      id: 'template-innovation',
      content: '業務改善・効率化の提案と実行',
      defaultWeight: 15,
      applicablePositions: ['all']
    },
    {
      id: 'template-skill',
      content: '専門スキル向上と新技術の習得',
      defaultWeight: 20,
      applicablePositions: ['エンジニア', '現場作業員']
    }
  ],

  // サンプル定性評価アイテム
  sampleQualitativeItems: [
    {
      id: 'qual-1',
      content: 'チーム内コミュニケーションの改善と情報共有の促進',
      weight: 30,
      selfRating: 4,
      selfComment: '定期的なミーティングを実施し、情報共有を徹底した',
      evaluatorRating: 4,
      evaluatorComment: 'チーム内の連携が良好になっている'
    },
    {
      id: 'qual-2',
      content: '顧客満足度の向上に向けた提案力の強化',
      weight: 20,
      selfRating: 3,
      selfComment: '顧客ニーズに合わせた提案を心がけた',
      evaluatorRating: 3,
      evaluatorComment: '提案内容の質をさらに高める余地あり'
    },
    {
      id: 'qual-3',
      content: '業務効率化のための改善提案',
      weight: 20,
      selfRating: 4,
      selfComment: '工程管理表のテンプレート化を実施',
      evaluatorRating: 5,
      evaluatorComment: '効率化に大きく貢献している'
    },
    {
      id: 'qual-4',
      content: '後輩指導とスキル伝達',
      weight: 15,
      selfRating: 3,
      selfComment: '指導の機会を作り、技術伝達に努めた',
      evaluatorRating: 3,
      evaluatorComment: 'より体系的な指導を期待'
    },
    {
      id: 'qual-5',
      content: '安全意識の向上と事故防止',
      weight: 15,
      selfRating: 4,
      selfComment: '安全チェックリストを作成し実施',
      evaluatorRating: 4,
      evaluatorComment: '安全意識が高く、他のスタッフへの良い影響がある'
    }
  ]
};

// 評価項目取得ヘルパー関数
const getEvaluationCategories = (categorySet = 'default', positionType = null) => {
  let categories = evaluationCategorySets[categorySet] || evaluationCategorySets.default;
  
  // 役職タイプによるフィルタリング
  if (positionType) {
    categories = categories.filter(category => 
      category.positionTypes.includes(positionType) || 
      category.positionTypes.includes('all')
    );
  }
  
  return categories;
};

// 評価基準取得
const getEvaluationCriteria = (criteriaType = 'technical') => {
  return evaluationCriteria[criteriaType] || evaluationCriteria.technical;
};

// 定性評価テンプレート取得
const getQualitativeTemplates = (positionType = null) => {
  let templates = mockData.qualitativeTemplates;
  
  if (positionType) {
    templates = templates.filter(template => 
      template.applicablePositions.includes(positionType) || 
      template.applicablePositions.includes('all')
    );
  }
  
  return templates;
};

// 現在のアクティブ期間取得
const getActivePeriod = () => {
  return mockData.periods.find(period => period.isActive);
};

// 期間ID取得
const getPeriodById = (periodId) => {
  return mockData.periods.find(period => period.id === periodId);
};

// 評価データ生成（デモ用）
const generateSampleEvaluations = (tenantConfig) => {
  const sampleEvaluations = [];
  const activePeriod = getActivePeriod();
  
  if (!activePeriod || !tenantConfig.sampleUsers) {
    return sampleEvaluations;
  }
  
  tenantConfig.sampleUsers.forEach((user, index) => {
    const evaluation = {
      id: `eval-${user.id}-${activePeriod.id}`,
      userId: user.id,
      userName: user.name,
      periodId: activePeriod.id,
      periodName: activePeriod.name,
      status: ['draft', 'submitted', 'approved_by_evaluator'][index % 3],
      selfRating: 3.5 + (Math.random() * 1.5), // 3.5-5.0
      evaluatorRating: user.role === 'employee' ? (3.0 + Math.random() * 1.5) : null,
      submittedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // 過去一週間
      updatedAt: new Date(),
      qualitativeGoal: `${user.position}としての専門スキル向上と組織貢献`
    };
    
    sampleEvaluations.push(evaluation);
  });
  
  return sampleEvaluations;
};

// サンプルユーザー生成
const generateSampleUsers = (tenantConfig) => {
  if (!tenantConfig || !tenantConfig.sampleUsers) {
    return [];
  }

  return tenantConfig.sampleUsers.map((user, index) => ({
    id: index + 1,
    username: user.id,
    full_name: user.name,
    email: user.email,
    role: user.role,
    position: user.position,
    evaluator_id: user.role === 'employee' ? 
      findEvaluatorForUser(tenantConfig.sampleUsers, user) : null,
    evaluator_name: user.role === 'employee' ? 
      findEvaluatorNameForUser(tenantConfig.sampleUsers, user) : null,
    password: user.password,
    customFields: {}
  }));
};

// ユーザーの評価者を探す
const findEvaluatorForUser = (users, user) => {
  // まず同じ部署のマネージャーを探す
  const managers = users.filter(u => 
    u.role === 'evaluator' || u.role === 'admin'
  );
  
  if (managers.length > 0) {
    // 最初のマネージャーのインデックスを返す（本来はより複雑なロジック）
    return users.indexOf(managers[0]) + 1;
  }
  
  return null;
};

// 評価者名を取得
const findEvaluatorNameForUser = (users, user) => {
  const evaluatorIndex = findEvaluatorForUser(users, user);
  if (evaluatorIndex) {
    const evaluator = users[evaluatorIndex - 1];
    return evaluator ? evaluator.name : null;
  }
  return null;
};

// ランダムな評価履歴データ生成
const generateEvaluationHistory = (evaluationId) => {
  return [
    {
      timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10日前
      action: '自己評価提出',
      user: '田中一郎',
      details: '初回提出'
    },
    {
      timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7日前
      action: '評価者閲覧',
      user: '山田太郎',
      details: '初回閲覧'
    },
    {
      timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5日前
      action: '評価入力',
      user: '山田太郎',
      details: '評価者評価入力'
    },
    {
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3日前
      action: '一次承認',
      user: '山田太郎',
      details: '評価者承認'
    }
  ];
};

// 初期化関数（企業選択時に呼び出される）
const initializeEvaluationData = (tenantConfig) => {
  // 選択された企業に基づいてモックデータを初期化
  if (tenantConfig) {
    mockData.users = generateSampleUsers(tenantConfig);
    mockData.evaluations = generateSampleEvaluations(tenantConfig);
  }
};

// カテゴリ別サンプル定量評価データ生成
const generateSampleQuantitativeData = (categoryId, positionType) => {
  const ratings = [];
  
  // カテゴリに基づいて適切な評価データを生成
  const categories = getEvaluationCategories(getCurrentCategorySet(), positionType);
  const category = categories.find(cat => cat.id === categoryId);
  
  if (!category) return [];
  
  category.items.forEach(item => {
    const rating = {
      itemId: item.id,
      itemName: item.name,
      selfRating: Math.floor(Math.random() * 4) + 2, // 2-5
      evaluatorRating: Math.floor(Math.random() * 4) + 2, // 2-5
      selfComment: `${item.name}について適切に対応できました`,
      evaluatorComment: `${item.name}のスキルが向上しています`,
      lastUpdated: new Date()
    };
    
    ratings.push(rating);
  });
  
  return ratings;
};

// 現在の企業のカテゴリセットを取得
const getCurrentCategorySet = () => {
  const currentTenant = window.getCurrentTenant ? window.getCurrentTenant() : null;
  return currentTenant ? currentTenant.settings.evaluationCategorySet : 'default';
};

// 営業職用のサンプルデータ生成
const generateSalesQuantitativeData = () => {
  return {
    revenue: {
      target: 5000000,
      actual: 5250000,
      rating: 4.2,
      comment: '目標を105%達成できた'
    },
    count: {
      target: 20,
      actual: 19,
      rating: 3.8,
      comment: '目標の95%を達成'
    },
    average: {
      calculated: 276316, // actual revenue / actual count
      rating: 4.0,
      comment: '高単価案件の受注に注力した'
    }
  };
};

// データエクスポート用関数
const exportEvaluationData = (format = 'json') => {
  const data = {
    periods: mockData.periods,
    users: mockData.users,
    evaluations: mockData.evaluations,
    qualitativeTemplates: mockData.qualitativeTemplates,
    exportedAt: new Date().toISOString()
  };
  
  if (format === 'json') {
    return JSON.stringify(data, null, 2);
  } else if (format === 'csv') {
    // CSVエクスポートの実装（簡略版）
    let csv = 'ユーザー名,役職,評価期間,ステータス,自己評価,評価者評価\n';
    data.evaluations.forEach(eval => {
      const user = data.users.find(u => u.id === eval.userId);
      csv += `${user ? user.full_name : '不明'},${user ? user.position : '不明'},${eval.periodName},${eval.status},${eval.selfRating || ''},${eval.evaluatorRating || ''}\n`;
    });
    return csv;
  }
  
  return data;
};

// バリデーション関数
const validateEvaluationData = (evaluationData) => {
  const errors = [];
  
  // 定性評価のウェイト合計チェック
  if (evaluationData.qualitative) {
    const totalWeight = evaluationData.qualitative.reduce((sum, item) => 
      sum + (parseInt(item.weight) || 0), 0
    );
    
    if (totalWeight !== 100) {
      errors.push(`定性評価のウェイト合計が${totalWeight}%です。100%になるように調整してください。`);
    }
  }
  
  // 必須項目チェック
  if (!evaluationData.quantitative || evaluationData.quantitative.length === 0) {
    errors.push('定量評価が入力されていません。');
  }
  
  return errors;
};

// グローバルに公開
window.evaluationConfig = {
  criteria: evaluationCriteria,
  categorySets: evaluationCategorySets,
  mockData: mockData,
  getEvaluationCategories,
  getEvaluationCriteria,
  getQualitativeTemplates,
  getActivePeriod,
  getPeriodById,
  generateSampleEvaluations,
  generateSampleUsers,
  generateEvaluationHistory,
  generateSampleQuantitativeData,
  generateSalesQuantitativeData,
  initializeEvaluationData,
  exportEvaluationData,
  validateEvaluationData,
  getCurrentCategorySet
};

// 初期化ログ
console.log('評価設定が読み込まれました');

// 企業選択時の初期化処理
document.addEventListener('DOMContentLoaded', () => {
  // 企業が選択された際の処理
  const selectedTenant = localStorage.getItem('selectedTenant');
  if (selectedTenant && window.getTenantConfig) {
    const tenantConfig = window.getTenantConfig(selectedTenant);
    if (tenantConfig) {
      initializeEvaluationData(tenantConfig);
      console.log(`${tenantConfig.displayName}の評価データを初期化しました`);
    }
  }
});
