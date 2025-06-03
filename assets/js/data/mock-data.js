/**
 * Mock Data - 評価ツール
 * デモ用のサンプルデータを定義
 */

EvaluationApp = EvaluationApp || {};

EvaluationApp.MockData = {
  
  // === 現在のユーザー === //
  currentUser: {
    id: 1,
    username: 'admin',
    fullName: '管理者',
    email: 'admin@construction-company.co.jp',
    role: 'admin',
    position: '代表',
    evaluator_id: null
  },

  // === ユーザー一覧 === //
  users: [
    {
      id: 1,
      username: 'admin',
      full_name: '管理者',
      email: 'admin@construction-company.co.jp',
      role: 'admin',
      position: '代表',
      evaluator_id: null,
      evaluator_name: null
    },
    {
      id: 2,
      username: 'yamada',
      full_name: '山田太郎',
      email: 'yamada@construction-company.co.jp',
      role: 'evaluator',
      position: '現場監督',
      evaluator_id: 1,
      evaluator_name: '管理者'
    },
    {
      id: 3,
      username: 'suzuki',
      full_name: '鈴木花子',
      email: 'suzuki@construction-company.co.jp',
      role: 'evaluator',
      position: '営業主任',
      evaluator_id: 1,
      evaluator_name: '管理者'
    },
    {
      id: 4,
      username: 'tanaka',
      full_name: '田中一郎',
      email: 'tanaka@construction-company.co.jp',
      role: 'employee',
      position: '現場作業員',
      evaluator_id: 2,
      evaluator_name: '山田太郎'
    },
    {
      id: 5,
      username: 'sato',
      full_name: '佐藤次郎',
      email: 'sato@construction-company.co.jp',
      role: 'employee',
      position: '営業',
      evaluator_id: 3,
      evaluator_name: '鈴木花子'
    },
    {
      id: 6,
      username: 'takahashi',
      full_name: '高橋三郎',
      email: 'takahashi@construction-company.co.jp',
      role: 'employee',
      position: '現場作業員',
      evaluator_id: 2,
      evaluator_name: '山田太郎'
    }
  ],

  // === 評価期間 === //
  periods: [
    {
      id: 1,
      name: '2024年上期',
      start_date: '2024-04-01',
      end_date: '2024-09-30',
      is_active: true
    },
    {
      id: 2,
      name: '2024年下期',
      start_date: '2024-10-01',
      end_date: '2025-03-31',
      is_active: false
    },
    {
      id: 3,
      name: '2023年下期',
      start_date: '2023-10-01',
      end_date: '2024-03-31',
      is_active: false
    }
  ],

  // === 評価データ === //
  evaluations: [
    {
      id: 1,
      user_id: 1,
      period_id: 1,
      period_name: '2024年上期',
      status: 'approved_by_admin',
      self_rating: 4.2,
      evaluator_rating: 4.3,
      updated_at: '2024-09-25T15:30:00Z',
      user_name: '管理者',
      qualitative_goal: '会社全体の売上向上と従業員満足度の改善'
    },
    {
      id: 2,
      user_id: 4,
      period_id: 1,
      period_name: '2024年上期',
      status: 'approved_by_evaluator',
      self_rating: 3.8,
      evaluator_rating: 4.0,
      updated_at: '2024-09-20T14:30:00Z',
      user_name: '田中一郎',
      qualitative_goal: 'クロス工事の技術向上と安全作業の徹底'
    },
    {
      id: 3,
      user_id: 5,
      period_id: 1,
      period_name: '2024年上期',
      status: 'submitted',
      self_rating: 4.1,
      evaluator_rating: null,
      updated_at: '2024-09-18T09:15:00Z',
      user_name: '佐藤次郎',
      qualitative_goal: '新規顧客開拓と既存顧客との関係強化'
    },
    {
      id: 4,
      user_id: 2,
      period_id: 1,
      period_name: '2024年上期',
      status: 'draft',
      self_rating: 3.9,
      evaluator_rating: null,
      updated_at: '2024-09-10T16:45:00Z',
      user_name: '山田太郎',
      qualitative_goal: '現場管理の効率化と部下の指導力向上'
    },
    {
      id: 5,
      user_id: 3,
      period_id: 1,
      period_name: '2024年上期',
      status: 'submitted',
      self_rating: 4.0,
      evaluator_rating: null,
      updated_at: '2024-09-22T11:20:00Z',
      user_name: '鈴木花子',
      qualitative_goal: '営業チームの売上目標達成と顧客満足度向上'
    },
    {
      id: 6,
      user_id: 6,
      period_id: 1,
      period_name: '2024年上期',
      status: 'draft',
      self_rating: null,
      evaluator_rating: null,
      updated_at: '2024-09-05T08:00:00Z',
      user_name: '高橋三郎',
      qualitative_goal: ''
    }
  ],

  // === 評価カテゴリ === //
  categories: [
    // 現場作業員用
    {
      id: 1,
      name: 'クロス工事（新規）',
      position_type: ['現場作業員'],
      weight: 25,
      items: [
        { id: 1, name: '下地処理（パテ処理）' },
        { id: 2, name: '寸法取り/材料発注' },
        { id: 3, name: 'クロス張り（無地 厚手）' },
        { id: 4, name: 'クロス張り（無地 薄手）' },
        { id: 5, name: 'クロス張り（柄物）' },
        { id: 6, name: '安全管理' },
        { id: 7, name: '施工準備（段取り）' }
      ]
    },
    {
      id: 2,
      name: 'クロス工事（張替）',
      position_type: ['現場作業員'],
      weight: 20,
      items: [
        { id: 8, name: '既存クロスの撤去' },
        { id: 9, name: '下地補修' },
        { id: 10, name: '新規クロス施工' },
        { id: 11, name: '仕上がり確認' }
      ]
    },
    {
      id: 3,
      name: '床工事',
      position_type: ['現場作業員'],
      weight: 20,
      items: [
        { id: 12, name: '下地処理' },
        { id: 13, name: 'クッションフロア施工' },
        { id: 14, name: 'タイルカーペット施工' },
        { id: 15, name: 'フロアタイル施工' },
        { id: 16, name: 'ソフト巾木施工' }
      ]
    },
    {
      id: 4,
      name: 'その他工事',
      position_type: ['現場作業員'],
      weight: 15,
      items: [
        { id: 17, name: 'シート工事' },
        { id: 18, name: '電気関係器具取付' },
        { id: 19, name: '水道関係器具取付' },
        { id: 20, name: '木工事関係施工' }
      ]
    },
    {
      id: 5,
      name: 'コミュニケーション',
      position_type: ['現場作業員'],
      weight: 20,
      items: [
        { id: 21, name: 'チーム内連携' },
        { id: 22, name: '顧客対応' },
        { id: 23, name: '報告・連絡・相談' },
        { id: 24, name: '改善提案' }
      ]
    },

    // 営業用
    {
      id: 6,
      name: '営業成績',
      position_type: ['営業'],
      weight: 60,
      items: [
        { id: 25, name: '売上目標達成率', target: 100, unit: '%' },
        { id: 26, name: '新規顧客獲得数', target: 5, unit: '件' },
        { id: 27, name: '既存顧客継続率', target: 95, unit: '%' }
      ]
    },
    {
      id: 7,
      name: '営業活動',
      position_type: ['営業'],
      weight: 40,
      items: [
        { id: 28, name: '顧客訪問回数' },
        { id: 29, name: '提案書作成' },
        { id: 30, name: 'アフターフォロー' },
        { id: 31, name: '市場調査・競合分析' }
      ]
    },

    // 管理者用（現場監督・営業主任・代表）
    {
      id: 8,
      name: '管理業務',
      position_type: ['現場監督', '営業主任', '代表'],
      weight: 40,
      items: [
        { id: 32, name: '部下の指導・育成' },
        { id: 33, name: 'スケジュール管理' },
        { id: 34, name: '品質管理' },
        { id: 35, name: '安全管理' },
        { id: 36, name: '予算管理' }
      ]
    },
    {
      id: 9,
      name: 'リーダーシップ',
      position_type: ['現場監督', '営業主任', '代表'],
      weight: 30,
      items: [
        { id: 37, name: 'チームをまとめる力' },
        { id: 38, name: '問題解決能力' },
        { id: 39, name: '判断力・決断力' },
        { id: 40, name: '情報共有・コミュニケーション' }
      ]
    },
    {
      id: 10,
      name: '業績・成果',
      position_type: ['現場監督', '営業主任', '代表'],
      weight: 30,
      items: [
        { id: 41, name: '担当業務の目標達成' },
        { id: 42, name: '業務効率の改善' },
        { id: 43, name: '顧客満足度向上' },
        { id: 44, name: '会社全体への貢献' }
      ]
    }
  ],

  // === 定性評価項目（サンプル） === //
  qualitativeItems: [
    {
      id: 1,
      content: "技術スキルの向上と新しい工法の習得",
      weight: 30,
      self_rating: 4,
      self_comment: "研修に参加し、新しいクロス工事の技術を習得した",
      evaluator_rating: 4,
      evaluator_comment: "積極的に学習し、現場でも活用している"
    },
    {
      id: 2,
      content: "安全作業の徹底と事故防止への取り組み",
      weight: 25,
      self_rating: 5,
      self_comment: "安全確認を毎回実施し、ヒヤリハット報告も積極的に行った",
      evaluator_rating: 5,
      evaluator_comment: "安全意識が非常に高く、他の作業員への良い影響がある"
    },
    {
      id: 3,
      content: "チームワークの向上と後輩指導",
      weight: 20,
      self_rating: 3,
      self_comment: "後輩への指導を心がけたが、まだ改善の余地がある",
      evaluator_rating: 4,
      evaluator_comment: "指導方法を工夫し、後輩の成長につながっている"
    },
    {
      id: 4,
      content: "顧客満足度の向上への貢献",
      weight: 15,
      self_rating: 4,
      self_comment: "丁寧な施工を心がけ、顧客からお褒めの言葉をいただいた",
      evaluator_rating: 4,
      evaluator_comment: "顧客対応が丁寧で、リピート率向上に貢献"
    },
    {
      id: 5,
      content: "業務効率化の提案と実践",
      weight: 10,
      self_rating: 3,
      self_comment: "作業手順の見直しを提案した",
      evaluator_rating: 3,
      evaluator_comment: "提案は良いが、実践への取り組みをさらに期待"
    }
  ],

  // === 審査待ち評価 === //
  pendingEvaluations: [
    {
      id: 3,
      user_id: 5,
      user_name: '佐藤次郎',
      status: 'submitted'
    },
    {
      id: 5,
      user_id: 3,
      user_name: '鈴木花子',
      status: 'submitted'
    }
  ],

  // === 会社情報 === //
  company: {
    name: '株式会社建設サンプル',
    address: '東京都XX区XX町1-2-3',
    phone: '03-1234-5678',
    established: '1990年4月1日',
    employees: 25,
    business: 'リフォーム・内装工事'
  }
};

/**
 * モックAPIクライアント
 * 実際のAPIの代わりにモックデータを返す
 */
EvaluationApp.MockAPI = {
  
  // 遅延をシミュレート
  delay: (ms = 300) => new Promise(resolve => setTimeout(resolve, ms)),

  // 現在のユーザー取得
  async getCurrentUser() {
    await this.delay();
    return EvaluationApp.MockData.currentUser;
  },

  // ユーザー一覧取得
  async getUsers() {
    await this.delay();
    return [...EvaluationApp.MockData.users];
  },

  // 評価対象者取得
  async getSubordinates(evaluatorId) {
    await this.delay();
    return EvaluationApp.MockData.users.filter(u => u.evaluator_id === evaluatorId);
  },

  // 評価一覧取得
  async getEvaluations(userId = null, periodId = null) {
    await this.delay();
    let evaluations = [...EvaluationApp.MockData.evaluations];
    
    if (userId) {
      evaluations = evaluations.filter(e => e.user_id === userId);
    }
    
    if (periodId) {
      evaluations = evaluations.filter(e => e.period_id === periodId);
    }
    
    return evaluations;
  },

  // 評価詳細取得
  async getEvaluation(evaluationId) {
    await this.delay();
    const evaluation = EvaluationApp.MockData.evaluations.find(e => e.id === evaluationId);
    if (!evaluation) {
      throw new Error('評価データが見つかりません');
    }
    return { ...evaluation };
  },

  // ダッシュボードデータ取得
  async getDashboardData() {
    await this.delay();
    const activePeriod = EvaluationApp.MockData.periods.find(p => p.is_active);
    const currentUser = EvaluationApp.MockData.currentUser;
    
    return {
      activePeriod,
      evaluations: EvaluationApp.MockData.evaluations,
      pendingEvaluations: EvaluationApp.MockData.pendingEvaluations,
      subordinatesCount: EvaluationApp.MockData.users.filter(u => u.evaluator_id === currentUser.id).length
    };
  },

  // 評価カテゴリ取得
  async getEvaluationCategories(positionType = null) {
    await this.delay();
    let categories = [...EvaluationApp.MockData.categories];
    
    if (positionType) {
      categories = categories.filter(c => 
        Array.isArray(c.position_type) 
          ? c.position_type.includes(positionType)
          : c.position_type === positionType
      );
    }
    
    return categories;
  },

  // 定性評価項目取得
  async getQualitativeItems(evaluationId) {
    await this.delay();
    return [...EvaluationApp.MockData.qualitativeItems];
  },

  // 評価期間一覧取得
  async getPeriods() {
    await this.delay();
    return [...EvaluationApp.MockData.periods];
  },

  // 評価保存
  async saveEvaluation(evaluationData) {
    await this.delay();
    
    // 新規作成の場合
    if (!evaluationData.id) {
      const newId = Math.max(...EvaluationApp.MockData.evaluations.map(e => e.id)) + 1;
      const newEvaluation = {
        ...evaluationData,
        id: newId,
        updated_at: new Date().toISOString()
      };
      EvaluationApp.MockData.evaluations.push(newEvaluation);
      return newEvaluation;
    }
    
    // 更新の場合
    const index = EvaluationApp.MockData.evaluations.findIndex(e => e.id === evaluationData.id);
    if (index === -1) {
      throw new Error('評価データが見つかりません');
    }
    
    EvaluationApp.MockData.evaluations[index] = {
      ...EvaluationApp.MockData.evaluations[index],
      ...evaluationData,
      updated_at: new Date().toISOString()
    };
    
    return EvaluationApp.MockData.evaluations[index];
  },

  // 評価提出
  async submitEvaluation(evaluationId, status = 'submitted') {
    await this.delay();
    
    const evaluation = EvaluationApp.MockData.evaluations.find(e => e.id === evaluationId);
    if (!evaluation) {
      throw new Error('評価データが見つかりません');
    }
    
    evaluation.status = status;
    evaluation.updated_at = new Date().toISOString();
    
    return { message: '評価を更新しました', evaluation };
  },

  // ユーザー保存
  async saveUser(userData) {
    await this.delay();
    
    if (!userData.id) {
      // 新規作成
      const newId = Math.max(...EvaluationApp.MockData.users.map(u => u.id)) + 1;
      const newUser = { ...userData, id: newId };
      EvaluationApp.MockData.users.push(newUser);
      return newUser;
    } else {
      // 更新
      const index = EvaluationApp.MockData.users.findIndex(u => u.id === userData.id);
      if (index === -1) {
        throw new Error('ユーザーが見つかりません');
      }
      EvaluationApp.MockData.users[index] = { ...EvaluationApp.MockData.users[index], ...userData };
      return EvaluationApp.MockData.users[index];
    }
  },

  // ユーザー削除
  async deleteUser(userId) {
    await this.delay();
    
    const index = EvaluationApp.MockData.users.findIndex(u => u.id === userId);
    if (index === -1) {
      throw new Error('ユーザーが見つかりません');
    }
    
    const deletedUser = EvaluationApp.MockData.users.splice(index, 1)[0];
    return { message: 'ユーザーを削除しました', user: deletedUser };
  }
};

// デバッグ用
if (EvaluationApp.Constants && EvaluationApp.Constants.APP.DEBUG) {
  console.log('Mock data loaded:', EvaluationApp.MockData);
  console.log('Mock API loaded:', EvaluationApp.MockAPI);
}
