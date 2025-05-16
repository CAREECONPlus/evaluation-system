/**
 * 評価項目設定とモックデータ（建設業特化版）
 * BRANU株式会社向け建設業特化システム
 */

// 評価基準の定義
const evaluationCriteria = {
  // 建設技術系（現場作業員・管理者用）
  construction: [
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
  
  // 定性評価基準（全職種共通）
  qualitative: [
    { value: 1, label: 'レベル1', description: '全く実行できなかった' },
    { value: 2, label: 'レベル2', description: '一部実行できた' },
    { value: 3, label: 'レベル3', description: '実行できたが設定内容以上までは出来なかった' },
    { value: 4, label: 'レベル4', description: '実行できた' },
    { value: 5, label: 'レベル5', description: '設定内容以上のことを行えた' }
  ]
};

// 評価カテゴリセット（建設業特化）
const evaluationCategorySets = {
  // 建設業用カテゴリ（メイン）
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
  
  // 営業用カテゴリ（建設業の営業職）
  sales: [
    {
      id: 'sales-performance',
      name: '営業成績',
      positionTypes: ['営業'],
      weight: 70,
      items: [
        { id: 'sales-revenue', name: '利益額', type: 'target', target: 5000000, unit: '円' },
        { id: 'sales-count', name: '受注件数', type: 'target', target: 20, unit: '件' },
        { id: 'sales-average', name: '平均単価', type: 'calculated', unit: '円' }
      ]
    },
    {
      id: 'sales-activities',
      name: '営業活動',
      positionTypes: ['営業'],
      weight: 30,
      items: [
        { id: 'sales-prospecting', name: '新規開拓活動' },
        { id: 'sales-proposal', name: '提案力・プレゼン力' },
        { id: 'sales-negotiation', name: '価格交渉力' },
        { id: 'sales-relationship', name: '顧客関係維持' },
        { id: 'sales-follow-up', name: 'アフターフォロー' }
      ]
    }
  ]
};

// モックデータ（建設業特化）
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
  
  // 建設業向けサンプルユーザー
  users: [
    {
      id: 1,
      username: 'admin',
      full_name: '建設 太郎',
      email: 'admin@demo.com',
      role: 'admin',
      position: '代表',
      evaluator_id: null,
      evaluator_name: null,
      password: 'demo123'
    },
    {
      id: 2,
      username: 'manager',
      full_name: '現場 花子',
      email: 'manager@demo.com',
      role: 'evaluator',
      position: '管理者',
      evaluator_id: 1,
      evaluator_name: '建設 太郎',
      password: 'demo123'
    },
    {
      id: 3,
      username: 'employee',
      full_name: '作業 次郎',
      email: 'employee@demo.com',
      role: 'employee',
      position: '現場作業員',
      evaluator_id: 2,
      evaluator_name: '現場 花子',
      password: 'demo123'
    },
    {
      id: 4,
      username: 'sales1',
      full_name: '営業 三郎',
      email: 'sales1@demo.com',
      role: 'employee',
      position: '営業',
      evaluator_id: 1,
      evaluator_name: '建設 太郎',
      password: 'demo123'
    },
    {
      id: 5,
      username: 'worker1',
      full_name: '職人 四郎',
      email: 'worker1@demo.com',
      role: 'employee',
      position: '現場作業員',
      evaluator_id: 2,
      evaluator_name: '現場 花子',
      password: 'demo123'
    }
  ],
  
  // サンプル評価データ
  evaluations: [],
  
  // 定性評価テンプレート（建設業特化）
  qualitativeTemplates: [
    {
      id: 'template-safety',
      content: '安全意識の向上と事故防止活動の推進',
      defaultWeight: 25,
      applicablePositions: ['現場作業員', '管理者']
    },
    {
      id: 'template-quality',
      content: '施工品質の向上と技術力強化',
      defaultWeight: 25,
      applicablePositions: ['現場作業員', '管理者']
    },
    {
      id: 'template-efficiency',
      content: '工期短縮と作業効率化の実現',
      defaultWeight: 20,
      applicablePositions: ['現場作業員', '管理者']
    },
    {
      id: 'template-communication',
      content: '現場コミュニケーション改善と連携強化',
      defaultWeight: 15,
      applicablePositions: ['現場作業員', '管理者', '営業']
    },
    {
      id: 'template-customer-satisfaction',
      content: '顧客満足度向上への取り組み',
      defaultWeight: 15,
      applicablePositions: ['営業', '管理者']
    },
    {
      id: 'template-leadership',
      content: '部下指導・安全管理・現場統率力',
      defaultWeight: 20,
      applicablePositions: ['管理者']
    },
    {
      id: 'template-sales-expansion',
      content: '新規顧客開拓と売上向上',
      defaultWeight: 30,
      applicablePositions: ['営業']
    },
    {
      id: 'template-cost-management',
      content: '原価管理と利益率向上',
      defaultWeight: 15,
      applicablePositions: ['営業', '管理者']
    }
  ],

  // 建設業に特化したサンプル定性評価項目
  sampleQualitativeItems: [
    {
      id: 'qual-safety',
      content: '現場での安全意識向上と事故防止活動',
      weight: 25,
      selfRating: 4,
      selfComment: '毎日の安全確認とKY活動を徹底し、無事故で現場を運営',
      evaluatorRating: 4,
      evaluatorComment: '安全管理が徹底されており、他の作業員への指導も良好'
    },
    {
      id: 'qual-quality',
      content: '施工品質の向上と技術力強化',
      weight: 25,
      selfComment: 'クロス張りの技術を向上させ、仕上がり品質を高めた',
      evaluatorRating: 4,
      evaluatorComment: '技術力が着実に向上している'
    },
    {
      id: 'qual-efficiency',
      content: '作業効率化と工期短縮への貢献',
      weight: 20,
      selfRating: 3,
      selfComment: '段取り改善により作業時間を10%短縮',
      evaluatorRating: 4,
      evaluatorComment: '効率化への取り組みが素晴らしい'
    },
    {
      id: 'qual-teamwork',
      content: '現場チームワーク向上と情報共有',
      weight: 15,
      selfRating: 4,
      selfComment: '職人さんとの連携を密にし、円滑な現場運営に貢献',
      evaluatorRating: 4,
      evaluatorComment: 'コミュニケーション能力が高く、現場の雰囲気も良好'
    },
    {
      id: 'qual-improvement',
      content: '業務改善提案と実行',
      weight: 15,
      selfRating: 3,
      selfComment: '材料の効率的な配置方法を提案し実施',
      evaluatorRating: 3,
      evaluatorComment: '改善意識があり、今後より積極的な提案を期待'
    }
  ]
};

// 評価項目取得ヘルパー関数
const getEvaluationCategories = (positionType = null) => {
  let categories = [];
  
  // 役職に応じてカテゴリを選択
  if (positionType === '営業') {
    categories = evaluationCategorySets.sales;
  } else {
    categories = evaluationCategorySets.construction;
  }
  
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
const getEvaluationCriteria = (positionType = '現場作業員') => {
  if (positionType === '営業') {
    return evaluationCriteria.sales;
  }
  return evaluationCriteria.construction;
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

// 評価データ生成（建設業向け）
const generateSampleEvaluations = (users) => {
  const sampleEvaluations = [];
  const activePeriod = getActivePeriod();
  
  if (!activePeriod || !users) {
    return sampleEvaluations;
  }
  
  users.forEach((user, index) => {
    const evaluation = {
      id: `eval-${user.id}-${activePeriod.id}`,
      userId: user.id,
      userName: user.full_name,
      periodId: activePeriod.id,
      periodName: activePeriod.name,
      position: user.position,
      status: ['draft', 'submitted', 'approved_by_evaluator'][index % 3],
      selfRating: 3.5 + (Math.random() * 1.5), // 3.5-5.0
      evaluatorRating: user.role === 'employee' ? (3.0 + Math.random() * 1.5) : null,
      submittedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // 過去一週間
      updatedAt: new Date(),
      qualitativeGoal: getDefaultQualitativeGoal(user.position)
    };
    
    sampleEvaluations.push(evaluation);
  });
  
  return sampleEvaluations;
};

// 役職に応じたデフォルト定性目標を取得
const getDefaultQualitativeGoal = (position) => {
  const goals = {
    '現場作業員': '安全意識の向上と技術力強化による品質向上',
    '管理者': '現場管理力の向上と部下指導・安全統括責任',
    '営業': '顧客満足度向上と売上目標達成への貢献',
    '代表': '会社全体の業績向上と組織力強化'
  };
  
  return goals[position] || '業務品質の向上と組織貢献';
};

// 営業職用のサンプルデータ生成
const generateSalesQuantitativeData = () => {
  return {
    revenue: {
      target: 5000000,
      actual: 5250000,
      rating: 4.2,
      comment: '目標を105%達成し、高単価案件を多く受注',
      achievement: 105.0
    },
    count: {
      target: 20,
      actual: 19,
      rating: 3.8,
      comment: '目標の95%を達成、質重視で営業活動',
      achievement: 95.0
    },
    average: {
      calculated: 276316, // actual revenue / actual count
      rating: 4.0,
      comment: '高単価案件の受注に成功'
    }
  };
};

// 建設技術者用のサンプルデータ生成
const generateConstructionQuantitativeData = (categoryId, position) => {
  const ratings = [];
  const categories = getEvaluationCategories(position);
  const category = categories.find(cat => cat.id === categoryId);
  
  if (!category) return [];
  
  category.items.forEach(item => {
    let baseRating = Math.floor(Math.random() * 3) + 2; // 2-4のベース
    
    // 役職に応じて評価レベルを調整
    if (position === '管理者' && item.name.includes('管理')) {
      baseRating = Math.max(baseRating, 4); // 管理者は管理系で最低4
    }
    
    const rating = {
      itemId: item.id,
      itemName: item.name,
      selfRating: baseRating,
      evaluatorRating: Math.min(baseRating + (Math.random() > 0.5 ? 1 : 0), 5),
      selfComment: generateConstructionComment(item.name, 'self'),
      evaluatorComment: generateConstructionComment(item.name, 'evaluator'),
      lastUpdated: new Date()
    };
    
    ratings.push(rating);
  });
  
  return ratings;
};

// 建設業向けのコメント生成
const generateConstructionComment = (itemName, type) => {
  const selfComments = {
    'クロス張り': 'クロス張りの技術が向上し、仕上がり品質が安定',
    '下地処理': '下地処理を丁寧に行い、仕上がりの美しさを重視',
    '安全管理': '安全第一を心がけ、KY活動を徹底実施',
    '施工管理': '工程管理を徹底し、品質・安全・工期を両立',
    '材料発注': '適切な材料選定と効率的な発注で工程短縮に貢献'
  };
  
  const evaluatorComments = {
    'クロス張り': '技術力が着実に向上している。継続的な成長が見られる',
    '下地処理': '丁寧な作業で高品質な仕上がりを実現',
    '安全管理': '安全意識が高く、他の作業員への指導も良好',
    '施工管理': '管理能力が向上し、現場をよくまとめている',
    '材料発注': '計画的な発注で材料ロスを最小限に抑えている'
  };
  
  // キーワードマッチングで適切なコメントを選択
  for (const keyword in selfComments) {
    if (itemName.includes(keyword)) {
      return type === 'self' ? selfComments[keyword] : evaluatorComments[keyword];
    }
  }
  
  // デフォルトコメント
  return type === 'self' ? 
    `${itemName}について適切に対応し、品質向上に努めた` :
    `${itemName}のスキルが向上しており、今後の成長が期待される`;
};

// データエクスポート用関数
const exportEvaluationData = (format = 'json') => {
  const data = {
    periods: mockData.periods,
    users: mockData.users,
    evaluations: mockData.evaluations,
    qualitativeTemplates: mockData.qualitativeTemplates,
    categorySet: 'construction', // 建設業特化を明示
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

// 初期化関数
const initializeEvaluationData = () => {
  // 建設業特化版の初期化
  mockData.evaluations = generateSampleEvaluations(mockData.users);
  console.log('建設業特化評価データを初期化しました');
};

// グローバルに公開（建設業特化版）
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
  generateSalesQuantitativeData,
  generateConstructionQuantitativeData,
  generateConstructionComment,
  initializeEvaluationData,
  exportEvaluationData,
  validateEvaluationData,
  getCurrentCategorySet: () => 'construction' // 常に建設業を返す
};

// 初期化ログ
console.log('建設業特化評価設定が読み込まれました');

// DOMContentLoaded時の初期化
document.addEventListener('DOMContentLoaded', () => {
  initializeEvaluationData();
});

// 建設業特化のデフォルト設定
window.isConstructionSpecialized = true;
