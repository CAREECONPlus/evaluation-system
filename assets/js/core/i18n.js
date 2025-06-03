/**
 * 多言語対応システム (i18n)
 * 建設業評価システム用国際化ライブラリ
 * 
 * @author Construction Evaluation System
 * @version 1.0.0
 */
class I18n {
    constructor() {
        this.currentLanguage = 'ja';
        this.translations = {};
        this.fallbackLanguage = 'ja';
        this.loadedLanguages = new Set();
        
        // デフォルト翻訳データをロード
        this.loadDefaultTranslations();
    }

    /**
     * デフォルト翻訳データの読み込み
     */
    loadDefaultTranslations() {
        // 日本語（デフォルト）
        this.translations.ja = {
            'system.title': '建設業評価システム',
            'system.subtitle': 'システムにログインしてください',
            'login.email': 'メールアドレス',
            'login.password': 'パスワード',
            'login.submit': 'ログイン',
            'login.demo': 'デモアカウント',
            'login.welcome': 'さん、おかえりなさい！',
            'login.failed': 'ログインに失敗しました',
            'nav.dashboard': '📊 ダッシュボード',
            'nav.evaluations': '📋 評価一覧',
            'nav.logout': 'ログアウト',
            'dashboard.title': '📊 ダッシュボード',
            'dashboard.total': '総評価数',
            'dashboard.completed': '完了済み',
            'dashboard.average': '平均評価',
            'dashboard.items': '評価項目数',
            'dashboard.recent': '📈 最近の活動',
            'evaluation.new': '📝 新規評価作成',
            'evaluation.list': '📋 評価一覧',
            'evaluation.basic': '📋 基本情報',
            'evaluation.ratings': '⭐ 項目別評価',
            'evaluation.chart': '📊 評価チャート（リアルタイム更新）',
            'category.safety': '安全性',
            'category.safety_desc': '安全ルールの遵守、危険予知能力',
            'category.quality': '品質',
            'category.quality_desc': '作業品質、仕上がりの精度',
            'category.efficiency': '効率性',
            'category.efficiency_desc': '作業スピード、時間管理',
            'category.teamwork': 'チームワーク',
            'category.teamwork_desc': '協調性、チーム貢献度',
            'category.communication': 'コミュニケーション',
            'category.communication_desc': '報告・連絡・相談',
            'form.period': '評価期間',
            'form.target': '評価対象者',
            'form.save': '💾 評価を保存',
            'form.cancel': 'キャンセル',
            'form.not_entered': '未入力',
            'action.back': '← 評価一覧に戻る',
            'action.new': '➕ 新規評価',
            'action.detail': '👁️ 詳細',
            'action.dashboard': '🏠 ダッシュボード',
            'table.id': 'ID',
            'table.target': '評価対象者',
            'table.evaluator': '評価者',
            'table.period': '評価期間',
            'table.rating': '総合評価',
            'table.status': 'ステータス',
            'table.updated': '更新日',
            'table.actions': '操作',
            'message.saved': '評価を保存しました！',
            'message.deleted': '削除しました',
            'message.error': 'エラーが発生しました',
            'status.completed': '完了',
            'status.draft': '下書き',
            'status.in_progress': '作業中'
        };

        // ベトナム語
        this.translations.vi = {
            'system.title': 'Hệ thống Đánh giá Ngành Xây dựng',
            'system.subtitle': 'Vui lòng đăng nhập vào hệ thống',
            'login.email': 'Địa chỉ email',
            'login.password': 'Mật khẩu',
            'login.submit': 'Đăng nhập',
            'login.demo': 'Tài khoản Demo',
            'login.welcome': ', chào mừng bạn trở lại!',
            'login.failed': 'Đăng nhập thất bại',
            'nav.dashboard': '📊 Bảng điều khiển',
            'nav.evaluations': '📋 Danh sách đánh giá',
            'nav.logout': 'Đăng xuất',
            'dashboard.title': '📊 Bảng điều khiển',
            'dashboard.total': 'Tổng số đánh giá',
            'dashboard.completed': 'Đã hoàn thành',
            'dashboard.average': 'Điểm trung bình',
            'dashboard.items': 'Số tiêu chí',
            'dashboard.recent': '📈 Hoạt động gần đây',
            'evaluation.new': '📝 Tạo đánh giá mới',
            'evaluation.list': '📋 Danh sách đánh giá',
            'evaluation.basic': '📋 Thông tin cơ bản',
            'evaluation.ratings': '⭐ Đánh giá theo tiêu chí',
            'evaluation.chart': '📊 Biểu đồ đánh giá (Cập nhật thời gian thực)',
            'category.safety': 'An toàn',
            'category.safety_desc': 'Tuân thủ quy tắc an toàn, nhận biết nguy hiểm',
            'category.quality': 'Chất lượng',
            'category.quality_desc': 'Chất lượng công việc, độ chính xác',
            'category.efficiency': 'Hiệu quả',
            'category.efficiency_desc': 'Tốc độ làm việc, quản lý thời gian',
            'category.teamwork': 'Làm việc nhóm',
            'category.teamwork_desc': 'Khả năng hợp tác, đóng góp nhóm',
            'category.communication': 'Giao tiếp',
            'category.communication_desc': 'Báo cáo, liên lạc, tham vấn',
            'form.period': 'Kỳ đánh giá',
            'form.target': 'Người được đánh giá',
            'form.save': '💾 Lưu đánh giá',
            'form.cancel': 'Hủy',
            'form.not_entered': 'Chưa nhập',
            'action.back': '← Quay lại danh sách',
            'action.new': '➕ Đánh giá mới',
            'action.detail': '👁️ Chi tiết',
            'action.dashboard': '🏠 Bảng điều khiển',
            'table.id': 'ID',
            'table.target': 'Người được đánh giá',
            'table.evaluator': 'Người đánh giá',
            'table.period': 'Kỳ đánh giá',
            'table.rating': 'Điểm tổng thể',
            'table.status': 'Trạng thái',
            'table.updated': 'Ngày cập nhật',
            'table.actions': 'Thao tác',
            'message.saved': 'Đã lưu đánh giá thành công!',
            'message.deleted': 'Đã xóa thành công',
            'message.error': 'Đã xảy ra lỗi',
            'status.completed': 'Hoàn thành',
            'status.draft': 'Bản nháp',
            'status.in_progress': 'Đang thực hiện'
        };

        // 英語（将来の拡張用）
        this.translations.en = {
            'system.title': 'Construction Evaluation System',
            'system.subtitle': 'Please log in to the system',
            'login.email': 'Email Address',
            'login.password': 'Password',
            'login.submit': 'Login',
            'login.demo': 'Demo Account',
            'login.welcome': ', welcome back!',
            'login.failed': 'Login failed',
            'nav.dashboard': '📊 Dashboard',
            'nav.evaluations': '📋 Evaluations',
            'nav.logout': 'Logout',
            'dashboard.title': '📊 Dashboard',
            'dashboard.total': 'Total Evaluations',
            'dashboard.completed': 'Completed',
            'dashboard.average': 'Average Rating',
            'dashboard.items': 'Evaluation Items',
            'dashboard.recent': '📈 Recent Activities',
            'evaluation.new': '📝 New Evaluation',
            'evaluation.list': '📋 Evaluation List',
            'evaluation.basic': '📋 Basic Information',
            'evaluation.ratings': '⭐ Item Ratings',
            'evaluation.chart': '📊 Evaluation Chart (Real-time)',
            'category.safety': 'Safety',
            'category.safety_desc': 'Safety rule compliance, hazard awareness',
            'category.quality': 'Quality',
            'category.quality_desc': 'Work quality, precision',
            'category.efficiency': 'Efficiency',
            'category.efficiency_desc': 'Work speed, time management',
            'category.teamwork': 'Teamwork',
            'category.teamwork_desc': 'Cooperation, team contribution',
            'category.communication': 'Communication',
            'category.communication_desc': 'Reporting, coordination, consultation',
            'form.period': 'Evaluation Period',
            'form.target': 'Evaluation Target',
            'form.save': '💾 Save Evaluation',
            'form.cancel': 'Cancel',
            'form.not_entered': 'Not Entered',
            'action.back': '← Back to List',
            'action.new': '➕ New Evaluation',
            'action.detail': '👁️ Details',
            'action.dashboard': '🏠 Dashboard',
            'table.id': 'ID',
            'table.target': 'Target Person',
            'table.evaluator': 'Evaluator',
            'table.period': 'Period',
            'table.rating': 'Overall Rating',
            'table.status': 'Status',
            'table.updated': 'Updated',
            'table.actions': 'Actions',
            'message.saved': 'Evaluation saved successfully!',
            'message.deleted': 'Deleted successfully',
            'message.error': 'An error occurred',
            'status.completed': 'Completed',
            'status.draft': 'Draft',
            'status.in_progress': 'In Progress'
        };

        this.loadedLanguages.add('ja');
        this.loadedLanguages.add('vi');
        this.loadedLanguages.add('en');
    }

    /**
     * 翻訳テキストを取得
     * @param {string} key - 翻訳キー
     * @param {Object} params - 置換パラメータ
     * @returns {string} 翻訳されたテキスト
     */
    t(key, params = {}) {
        let text = this.getTranslation(key);
        
        // パラメータ置換
        Object.keys(params).forEach(param => {
            text = text.replace(new RegExp(`{{${param}}}`, 'g'), params[param]);
        });
        
        return text;
    }

    /**
     * 翻訳を取得（内部メソッド）
     * @param {string} key - 翻訳キー
     * @returns {string} 翻訳テキスト
     */
    getTranslation(key) {
        // 現在の言語で翻訳を取得
        if (this.translations[this.currentLanguage] && 
            this.translations[this.currentLanguage][key]) {
            return this.translations[this.currentLanguage][key];
        }
        
        // フォールバック言語で翻訳を取得
        if (this.translations[this.fallbackLanguage] && 
            this.translations[this.fallbackLanguage][key]) {
            console.warn(`Translation missing for key "${key}" in language "${this.currentLanguage}", using fallback`);
            return this.translations[this.fallbackLanguage][key];
        }
        
        // 翻訳が見つからない場合はキーをそのまま返す
        console.warn(`Translation missing for key "${key}"`);
        return key;
    }

    /**
     * 言語を変更
     * @param {string} language - 言語コード
     * @returns {Promise} 言語変更の完了を示すPromise
     */
    async setLanguage(language) {
        if (!this.isLanguageSupported(language)) {
            console.warn(`Language "${language}" is not supported`);
            return false;
        }

        // 言語ファイルがまだロードされていない場合は外部ファイルから読み込み
        if (!this.loadedLanguages.has(language)) {
            try {
                await this.loadLanguageFile(language);
            } catch (error) {
                console.error(`Failed to load language file for "${language}":`, error);
                return false;
            }
        }

        this.currentLanguage = language;
        this.saveLanguageToStorage();
        this.dispatchLanguageChangeEvent();
        return true;
    }

    /**
     * 外部言語ファイルを読み込み
     * @param {string} language - 言語コード
     * @returns {Promise} 読み込み完了のPromise
     */
    async loadLanguageFile(language) {
        const response = await fetch(`locales/${language}.json`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const translations = await response.json();
        this.translations[language] = translations;
        this.loadedLanguages.add(language);
    }

    /**
     * 対応言語かチェック
     * @param {string} language - 言語コード
     * @returns {boolean} 対応している場合true
     */
    isLanguageSupported(language) {
        return ['ja', 'vi', 'en'].includes(language);
    }

    /**
     * 現在の言語を取得
     * @returns {string} 言語コード
     */
    getCurrentLanguage() {
        return this.currentLanguage;
    }

    /**
     * 利用可能な言語一覧を取得
     * @returns {Array} 言語情報の配列
     */
    getAvailableLanguages() {
        return [
            { code: 'ja', name: '日本語', flag: '🇯🇵' },
            { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' },
            { code: 'en', name: 'English', flag: '🇺🇸' }
        ];
    }

    /**
     * ローカルストレージに言語設定を保存
     */
    saveLanguageToStorage() {
        try {
            localStorage.setItem('evaluationSystem_language', this.currentLanguage);
        } catch (error) {
            console.warn('Failed to save language to localStorage:', error);
        }
    }

    /**
     * ローカルストレージから言語設定を読み込み
     */
    loadLanguageFromStorage() {
        try {
            const savedLanguage = localStorage.getItem('evaluationSystem_language');
            if (savedLanguage && this.isLanguageSupported(savedLanguage)) {
                this.currentLanguage = savedLanguage;
            }
        } catch (error) {
            console.warn('Failed to load language from localStorage:', error);
        }
    }

    /**
     * 言語変更イベントを発火
     */
    dispatchLanguageChangeEvent() {
        const event = new CustomEvent('languageChanged', {
            detail: { language: this.currentLanguage }
        });
        document.dispatchEvent(event);
    }

    /**
     * ページ内の翻訳対象要素を自動更新
     */
    updatePageTranslations() {
        // data-i18n属性を持つ要素を自動翻訳
        const elements = document.querySelectorAll('[data-i18n]');
        elements.forEach(element => {
            const key = element.getAttribute('data-i18n');
            element.textContent = this.t(key);
        });

        // data-i18n-placeholder属性を持つ要素のプレースホルダーを翻訳
        const placeholderElements = document.querySelectorAll('[data-i18n-placeholder]');
        placeholderElements.forEach(element => {
            const key = element.getAttribute('data-i18n-placeholder');
            element.placeholder = this.t(key);
        });
    }

    /**
     * 初期化処理
     */
    init() {
        this.loadLanguageFromStorage();
        
        // DOM読み込み完了後に自動翻訳を実行
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.updatePageTranslations();
            });
        } else {
            this.updatePageTranslations();
        }

        // 言語変更イベントリスナーを設定
        document.addEventListener('languageChanged', () => {
            this.updatePageTranslations();
        });
    }
}

// グローバルインスタンスを作成
const i18n = new I18n();

// モジュールとしてエクスポート
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { I18n, i18n };
}

// グローバルスコープに追加
if (typeof window !== 'undefined') {
    window.I18n = I18n;
    window.i18n = i18n;
}
