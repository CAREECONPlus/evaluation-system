/**
 * mock-data.js - 建設業評価システム モックデータ
 * 開発・デモ用のサンプルデータ
 */

const mockData = {
    // ユーザーデータ
    users: [
        {
            id: '1',
            email: 'admin@company.com',
            password: 'password123',
            name: '田中 太郎',
            nameVi: 'Tanaka Taro',
            role: 'admin',
            roleJa: '管理者',
            roleVi: 'Quản trị viên',
            department: '建設部',
            departmentVi: 'Bộ phận Xây dựng',
            joinDate: '2020-04-01',
            avatar: '👨‍💼',
            permissions: ['view_all', 'create', 'edit', 'delete', 'admin']
        },
        {
            id: '2',
            email: 'manager@company.com',
            password: 'password123',
            name: '佐藤 花子',
            nameVi: 'Sato Hanako',
            role: 'manager',
            roleJa: 'マネージャー',
            roleVi: 'Quản lý',
            department: '現場管理部',
            departmentVi: 'Bộ phận Quản lý Công trường',
            joinDate: '2021-07-15',
            avatar: '👩‍💼',
            permissions: ['view_team', 'create', 'edit']
        },
        {
            id: '3',
            email: 'supervisor@company.com',
            password: 'password123',
            name: '鈴木 一郎',
            nameVi: 'Suzuki Ichiro',
            role: 'supervisor',
            roleJa: '主任',
            roleVi: 'Chủ nhiệm',
            department: '現場監督',
            departmentVi: 'Giám sát Công trường',
            joinDate: '2019-03-20',
            avatar: '👨‍🔧',
            permissions: ['view_subordinates', 'create', 'edit']
        },
        {
            id: '4',
            email: 'worker1@company.com',
            password: 'password123',
            name: '山田 太郎',
            nameVi: 'Yamada Taro',
            role: 'worker',
            roleJa: '作業員',
            roleVi: 'Công nhân',
            department: '建設作業',
            departmentVi: 'Thi công Xây dựng',
            joinDate: '2023-05-10',
            avatar: '👷‍♂️',
            isTrainee: true,
            country: 'Vietnam',
            permissions: ['view_own']
        },
        {
            id: '5',
            email: 'worker2@company.com',
            password: 'password123',
            name: '佐藤 次郎',
            nameVi: 'Sato Jiro',
            role: 'worker',
            roleJa: '作業員',
            roleVi: 'Công nhân',
            department: '建設作業',
            departmentVi: 'Thi công Xây dựng',
            joinDate: '2023-06-01',
            avatar: '👷‍♂️',
            isTrainee: false,
            permissions: ['view_own']
        }
    ],

    // 評価データ
    evaluations: [
        {
            id: '1',
            subordinate: '山田 太郎',
            subordinateVi: 'Yamada Taro',
            subordinateId: '4',
            evaluator: '田中 太郎',
            evaluatorVi: 'Tanaka Taro',
            evaluatorId: '1',
            status: 'completed',
            statusJa: '完了',
            statusVi: 'Hoàn thành',
            overallRating: 4.2,
            ratings: {
                safety: 5,
                quality: 4,
                efficiency: 4,
                teamwork: 5,
                communication: 3
            },
            overallComment: '総合的に優秀な作業員です。安全意識が高く、チームワークも良好です。',
            overallCommentVi: 'Là công nhân xuất sắc tổng thể. Ý thức an toàn cao, tinh thần đồng đội tốt.',
            categoryComments: {
                safety: '安全ルールを厳格に守り、危険予知能力も高い',
                safetyVi: 'Tuân thủ nghiêm ngặt quy tắc an toàn, khả năng dự đoán nguy hiểm cao',
                quality: '作業品質は良好だが、細部への注意がさらに必要',
                qualityVi: 'Chất lượng công việc tốt nhưng cần chú ý hơn đến chi tiết',
                efficiency: '作業スピードは適切で時間管理も良い',
                efficiencyVi: 'Tốc độ làm việc phù hợp và quản lý thời gian tốt',
                teamwork: '同僚との協力関係が非常に良好',
                teamworkVi: 'Mối quan hệ hợp tác với đồng nghiệp rất tốt',
                communication: '日本語でのコミュニケーションにやや改善の余地あり',
                communicationVi: 'Giao tiếp bằng tiếng Nhật còn có chỗ cần cải thiện'
            },
            period: '2025年第1四半期',
            periodVi: 'Quý 1 năm 2025',
            createdAt: '2025-03-31',
            updatedAt: '2025-04-01',
            reviewDate: '2025-06-01'
        },
        {
            id: '2',
            subordinate: '佐藤 次郎',
            subordinateVi: 'Sato Jiro',
            subordinateId: '5',
            evaluator: '鈴木 一郎',
            evaluatorVi: 'Suzuki Ichiro',
            evaluatorId: '3',
            status: 'draft',
            statusJa: '下書き',
            statusVi: 'Bản nháp',
            overallRating: 3.8,
            ratings: {
                safety: 4,
                quality: 4,
                efficiency: 3,
                teamwork: 4,
                communication: 4
            },
            overallComment: '経験豊富で安定した作業を行う。リーダーシップも発揮できる。',
            overallCommentVi: 'Có kinh nghiệm phong phú và làm việc ổn định. Có thể phát huy khả năng lãnh đạo.',
            period: '2025年第1四半期',
            periodVi: 'Quý 1 năm 2025',
            createdAt: '2025-04-15',
            updatedAt: '2025-04-15'
        }
    ],

    // 評価カテゴリ
    evaluationCategories: [
        {
            id: 'safety',
            name: '安全性',
            nameVi: 'An toàn',
            nameEn: 'Safety',
            description: '安全ルールの遵守、危険予知能力',
            descriptionVi: 'Tuân thủ quy tắc an toàn, khả năng nhận biết nguy hiểm',
            descriptionEn: 'Safety rule compliance, hazard recognition ability',
            weight: 25,
            color: '#1DCE85',
            icon: '🦺'
        },
        {
            id: 'quality',
            name: '品質',
            nameVi: 'Chất lượng',
            nameEn: 'Quality',
            description: '作業品質、仕上がりの精度',
            descriptionVi: 'Chất lượng công việc, độ chính xác hoàn thiện',
            descriptionEn: 'Work quality, finishing accuracy',
            weight: 25,
            color: '#244EFF',
            icon: '⭐'
        },
        {
            id: 'efficiency',
            name: '効率性',
            nameVi: 'Hiệu quả',
            nameEn: 'Efficiency',
            description: '作業スピード、時間管理',
            descriptionVi: 'Tốc độ làm việc, quản lý thời gian',
            descriptionEn: 'Work speed, time management',
            weight: 20,
            color: '#FFCE2C',
            icon: '⚡'
        },
        {
            id: 'teamwork',
            name: 'チームワーク',
            nameVi: 'Làm việc nhóm',
            nameEn: 'Teamwork',
            description: '協調性、チーム貢献度',
            descriptionVi: 'Khả năng hợp tác, mức độ đóng góp cho nhóm',
            descriptionEn: 'Cooperation, team contribution',
            weight: 15,
            color: '#FF2C5D',
            icon: '🤝'
        },
        {
            id: 'communication',
            name: 'コミュニケーション',
            nameVi: 'Giao tiếp',
            nameEn: 'Communication',
            description: '報告・連絡・相談',
            descriptionVi: 'Báo cáo, liên lạc, tham vấn',
            descriptionEn: 'Reporting, communication, consultation',
            weight: 15,
            color: '#82889D',
            icon: '💬'
        }
    ],

    // 評価レベル定義
    evaluationLevels: [
        {
            level: 1,
            name: '要指導',
            nameVi: 'Cần hướng dẫn',
            nameEn: 'Needs Guidance',
            description: '大幅な改善が必要',
            descriptionVi: 'Cần cải thiện đáng kể',
            color: '#FF2C5D',
            range: [1, 1.9]
        },
        {
            level: 2,
            name: '要改善',
            nameVi: 'Cần cải thiện',
            nameEn: 'Needs Improvement',
            description: '一部改善が必要',
            descriptionVi: 'Cần cải thiện một phần',
            color: '#FF8C42',
            range: [2, 2.9]
        },
        {
            level: 3,
            name: '普通',
            nameVi: 'Bình thường',
            nameEn: 'Average',
            description: '標準的なレベル',
            descriptionVi: 'Mức độ tiêu chuẩn',
            color: '#FFCE2C',
            range: [3, 3.9]
        },
        {
            level: 4,
            name: '良好',
            nameVi: 'Tốt',
            nameEn: 'Good',
            description: '期待を上回る',
            descriptionVi: 'Vượt mong đợi',
            color: '#4ECE85',
            range: [4, 4.9]
        },
        {
            level: 5,
            name: '優秀',
            nameVi: 'Xuất sắc',
            nameEn: 'Excellent',
            description: '非常に優秀',
            descriptionVi: 'Rất xuất sắc',
            color: '#1DCE85',
            range: [5, 5]
        }
    ],

    // プロジェクト/現場データ
    projects: [
        {
            id: 'proj_001',
            name: '東京駅前オフィスビル建設',
            nameVi: 'Xây dựng Tòa nhà Văn phòng trước Ga Tokyo',
            status: 'active',
            statusJa: '進行中',
            statusVi: 'Đang tiến hành',
            startDate: '2024-10-01',
            endDate: '2026-03-31',
            location: '東京都千代田区',
            locationVi: 'Chiyoda-ku, Tokyo',
            supervisor: '鈴木 一郎',
            supervisorVi: 'Suzuki Ichiro',
            workers: ['4', '5'],
            safetyLevel: 'high',
            safetyLevelJa: '高',
            safetyLevelVi: 'Cao'
        },
        {
            id: 'proj_002',
            name: '横浜マンション改修工事',
            nameVi: 'Cải tạo Chung cư Yokohama',
            status: 'planning',
            statusJa: '計画中',
            statusVi: 'Đang lập kế hoạch',
            startDate: '2025-07-01',
            endDate: '2025-12-31',
            location: '神奈川県横浜市',
            locationVi: 'Yokohama, Kanagawa',
            supervisor: '佐藤 花子',
            supervisorVi: 'Sato Hanako',
            workers: [],
            safetyLevel: 'medium',
            safetyLevelJa: '中',
            safetyLevelVi: 'Trung bình'
        }
    ],

    // 建設業界用語集
    constructionTerms: {
        ja: {
            'safety_first': '安全第一',
            'work_site': '作業現場',
            'construction_site': '建設現場',
            'supervisor': '現場監督',
            'foreman': '職長',
            'worker': '作業員',
            'trainee': '技能実習生',
            'apprentice': '見習い',
            'helmet': 'ヘルメット',
            'safety_vest': '安全ベスト',
            'safety_shoes': '安全靴',
            'tools': '工具',
            'materials': '資材',
            'concrete': 'コンクリート',
            'steel': '鋼材',
            'scaffolding': '足場',
            'crane': 'クレーン',
            'excavator': 'ショベルカー',
            'blueprint': '設計図',
            'inspection': '検査',
            'quality_control': '品質管理',
            'deadline': '工期',
            'overtime': '残業',
            'break_time': '休憩時間',
            'lunch_break': '昼休み',
            'morning_meeting': '朝礼',
            'safety_meeting': '安全会議',
            'accident': '事故',
            'incident': 'インシデント',
            'injury': '怪我',
            'first_aid': '応急処置',
            'emergency': '緊急事態'
        },
        vi: {
            'safety_first': 'An toàn trên hết',
            'work_site': 'Công trường làm việc',
            'construction_site': 'Công trường xây dựng',
            'supervisor': 'Giám sát công trường',
            'foreman': 'Đội trưởng',
            'worker': 'Công nhân',
            'trainee': 'Thực tập sinh kỹ năng',
            'apprentice': 'Học việc',
            'helmet': 'Mũ bảo hiểm',
            'safety_vest': 'Áo bảo hộ',
            'safety_shoes': 'Giày bảo hộ',
            'tools': 'Dụng cụ',
            'materials': 'Vật liệu',
            'concrete': 'Bê tông',
            'steel': 'Thép',
            'scaffolding': 'Giàn giáo',
            'crane': 'Cần cẩu',
            'excavator': 'Máy xúc',
            'blueprint': 'Bản vẽ thiết kế',
            'inspection': 'Kiểm tra',
            'quality_control': 'Kiểm soát chất lượng',
            'deadline': 'Thời hạn công trình',
            'overtime': 'Làm thêm giờ',
            'break_time': 'Giờ nghỉ',
            'lunch_break': 'Giờ nghỉ trưa',
            'morning_meeting': 'Họp sáng',
            'safety_meeting': 'Họp an toàn',
            'accident': 'Tai nạn',
            'incident': 'Sự cố',
            'injury': 'Chấn thương',
            'first_aid': 'Sơ cứu',
            'emergency': 'Tình huống khẩn cấp'
        }
    },

    // 統計データ
    statistics: {
        totalUsers: 5,
        totalEvaluations: 2,
        completedEvaluations: 1,
        averageRating: 4.0,
        categoryAverages: {
            safety: 4.5,
            quality: 4.0,
            efficiency: 3.5,
            teamwork: 4.5,
            communication: 3.5
        },
        monthlyStats: [
            { month: '2024-10', evaluations: 0, avgRating: 0 },
            { month: '2024-11', evaluations: 0, avgRating: 0 },
            { month: '2024-12', evaluations: 0, avgRating: 0 },
            { month: '2025-01', evaluations: 0, avgRating: 0 },
            { month: '2025-02', evaluations: 0, avgRating: 0 },
            { month: '2025-03', evaluations: 1, avgRating: 4.2 },
            { month: '2025-04', evaluations: 1, avgRating: 3.8 }
        ]
    },

    // システム設定
    systemSettings: {
        supportedLanguages: ['ja', 'vi', 'en'],
        defaultLanguage: 'ja',
        evaluationScale: {
            min: 1,
            max: 5,
            step: 0.1
        },
        notifications: {
            enabled: true,
            duration: 3000
        },
        features: {
            translation: true,
            export: true,
            charts: true,
            multiLanguage: true
        }
    }
};

// データアクセス用のヘルパー関数
const mockDataService = {
    /**
     * ユーザー認証
     * @param {string} email - メールアドレス
     * @param {string} password - パスワード
     * @returns {Object|null} ユーザー情報またはnull
     */
    authenticateUser(email, password) {
        return mockData.users.find(user => 
            user.email === email && user.password === password
        ) || null;
    },

    /**
     * ユーザー情報取得
     * @param {string} userId - ユーザーID
     * @returns {Object|null} ユーザー情報
     */
    getUserById(userId) {
        return mockData.users.find(user => user.id === userId) || null;
    },

    /**
     * 評価データ取得
     * @param {string} userId - ユーザーID
     * @returns {Array} 評価データ配列
     */
    getEvaluationsByUser(userId) {
        const user = this.getUserById(userId);
        if (!user) return [];

        if (user.role === 'admin') {
            return mockData.evaluations;
        } else if (user.role === 'manager' || user.role === 'supervisor') {
            return mockData.evaluations.filter(eval => 
                eval.evaluatorId === userId || eval.subordinateId === userId
            );
        } else {
            return mockData.evaluations.filter(eval => eval.subordinateId === userId);
        }
    },

    /**
     * 評価データ保存
     * @param {Object} evaluationData - 評価データ
     * @returns {Object} 保存された評価データ
     */
    saveEvaluation(evaluationData) {
        const newId = (mockData.evaluations.length + 1).toString();
        const evaluation = {
            id: newId,
            ...evaluationData,
            createdAt: new Date().toISOString().split('T')[0],
            updatedAt: new Date().toISOString().split('T')[0]
        };

        mockData.evaluations.push(evaluation);
        this.updateStatistics();
        
        return evaluation;
    },

    /**
     * 統計情報更新
     */
    updateStatistics() {
        const completed = mockData.evaluations.filter(e => e.status === 'completed');
        mockData.statistics.totalEvaluations = mockData.evaluations.length;
        mockData.statistics.completedEvaluations = completed.length;
        
        if (completed.length > 0) {
            const totalRating = completed.reduce((sum, e) => sum + e.overallRating, 0);
            mockData.statistics.averageRating = Math.round((totalRating / completed.length) * 10) / 10;
        }
    },

    /**
     * カテゴリ名取得（多言語対応）
     * @param {string} categoryId - カテゴリID
     * @param {string} language - 言語コード
     * @returns {string} カテゴリ名
     */
    getCategoryName(categoryId, language = 'ja') {
        const category = mockData.evaluationCategories.find(c => c.id === categoryId);
        if (!category) return categoryId;

        const nameKey = language === 'ja' ? 'name' : `name${language.charAt(0).toUpperCase() + language.slice(1)}`;
        return category[nameKey] || category.name;
    },

    /**
     * 建設業界用語取得
     * @param {string} term - 用語キー
     * @param {string} language - 言語コード
     * @returns {string} 用語
     */
    getConstructionTerm(term, language = 'ja') {
        return mockData.constructionTerms[language]?.[term] || term;
    }
};

// グローバルに公開
if (typeof window !== 'undefined') {
    window.mockData = mockData;
    window.mockDataService = mockDataService;
}

// Node.js環境での使用にも対応
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { mockData, mockDataService };
}

console.log('📦 mock-data.js loaded - Sample data ready');
