/**
 * ルーティング管理 - SPA用シンプルルーター
 * ページ遷移とナビゲーション状態の管理
 */

/**
 * ルーターマネージャークラス
 */
class Router {
    constructor() {
        this.currentPage = 'dashboard';
        this.pages = new Map();
        this.onPageChange = null;
        this.history = [];
        this.maxHistoryLength = 10;
        
        // ページの定義
        this.definePages();
        
        // ブラウザの戻る/進むボタン対応
        this.setupBrowserNavigation();
        
        console.log('ルーターが初期化されました');
    }

    /**
     * ページの定義
     */
    definePages() {
        this.pages.set('dashboard', {
            name: 'dashboard',
            title: 'ダッシュボード',
            element: '#dashboard-page',
            requiredRole: 'employee',
            icon: 'fas fa-tachometer-alt'
        });

        this.pages.set('evaluations', {
            name: 'evaluations',
            title: '評価一覧',
            element: '#evaluations-page',
            requiredRole: 'employee',
            icon: 'fas fa-list-alt'
        });

        this.pages.set('subordinates', {
            name: 'subordinates',
            title: '評価対象者',
            element: '#subordinates-page',
            requiredRole: 'evaluator',
            icon: 'fas fa-users'
        });

        this.pages.set('users', {
            name: 'users',
            title: 'ユーザー管理',
            element: '#users-page',
            requiredRole: 'admin',
            icon: 'fas fa-user-cog'
        });

        this.pages.set('settings', {
            name: 'settings',
            title: '設定',
            element: '#settings-page',
            requiredRole: 'admin',
            icon: 'fas fa-cog'
        });

        this.pages.set('report', {
            name: 'report',
            title: '評価レポート',
            element: '#report-page',
            requiredRole: 'employee',
            icon: 'fas fa-chart-bar'
        });

        console.log(`${this.pages.size}個のページが定義されました`);
    }

    /**
     * ブラウザナビゲーションの設定
     */
    setupBrowserNavigation() {
        window.addEventListener('popstate', (event) => {
            if (event.state && event.state.page) {
                this.navigateTo(event.state.page, { skipHistory: true });
            }
        });
    }

    /**
     * ページ遷移
     */
    navigateTo(pageName, options = {}) {
        const { skipHistory = false, data = null } = options;

        // ページの存在確認
        if (!this.pages.has(pageName)) {
            console.error(`ページが見つかりません: ${pageName}`);
            return false;
        }

        const pageInfo = this.pages.get(pageName);

        // 権限チェック
        if (!this.checkPermission(pageInfo.requiredRole)) {
            console.warn(`ページ '${pageName}' へのアクセス権限がありません`);
            this.showPermissionDeniedMessage(pageInfo.title);
            return false;
        }

        // 現在のページと同じ場合は何もしない
        if (this.currentPage === pageName && !data) {
            return true;
        }

        // ページ遷移の実行
        const success = this.performPageTransition(pageName, pageInfo, data);

        if (success) {
            // 履歴に追加
            if (!skipHistory) {
                this.addToHistory(pageName, data);
                this.updateBrowserHistory(pageName);
            }

            // ページ変更イベントの発火
            if (this.onPageChange) {
                this.onPageChange(pageName, data);
            }

            console.log(`ページ遷移完了: ${this.currentPage} -> ${pageName}`);
        }

        return success;
    }

    /**
     * ページ遷移の実行
     */
    performPageTransition(pageName, pageInfo, data = null) {
        try {
            // 全てのページを非表示
            this.hideAllPages();

            // ターゲットページを表示
            const targetElement = document.querySelector(pageInfo.element);
            if (!targetElement) {
                console.error(`ページ要素が見つかりません: ${pageInfo.element}`);
                return false;
            }

            targetElement.classList.remove('d-none');

            // アクティブなナビゲーションリンクを更新
            this.updateActiveNavigation(pageName);

            // ページタイトルを更新
            this.updatePageTitle(pageInfo.title);

            // 現在のページを更新
            this.currentPage = pageName;

            // ページ固有のデータを渡す
            if (data) {
                this.passDataToPage(pageName, data);
            }

            return true;
        } catch (error) {
            console.error('ページ遷移エラー:', error);
            return false;
        }
    }

    /**
     * 全ページを非表示
     */
    hideAllPages() {
        document.querySelectorAll('.page').forEach(page => {
            page.classList.add('d-none');
        });
    }

    /**
     * アクティブナビゲーションの更新
     */
    updateActiveNavigation(pageName) {
        // 全てのnavリンクから'active'クラスを削除
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });

        // 対象のnavリンクに'active'クラスを追加
        const activeLink = document.querySelector(`[data-page="${pageName}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }
    }

    /**
     * ページタイトルの更新
     */
    updatePageTitle(title) {
        // ブラウザのタイトルを更新
        document.title = `${title} - 評価システム`;

        // ページ内のタイトル要素も更新（もしあれば）
        const pageTitleElement = document.querySelector('.page-title');
        if (pageTitleElement) {
            pageTitleElement.textContent = title;
        }
    }

    /**
     * 権限チェック
     */
    checkPermission(requiredRole) {
        // グローバルなauth オブジェクトが存在する場合のみチェック
        if (typeof window.app !== 'undefined' && window.app.auth) {
            return window.app.auth.hasRole(requiredRole);
        }

        // auth が利用できない場合はアクセスを許可（初期化中など）
        return true;
    }

    /**
     * 権限不足メッセージの表示
     */
    showPermissionDeniedMessage(pageName) {
        // 通知システムが利用可能な場合
        if (typeof window.app !== 'undefined' && window.app.showWarningNotification) {
            window.app.showWarningNotification(
                'アクセス権限がありません',
                `「${pageName}」ページへのアクセス権限がありません。`
            );
        } else {
            alert(`「${pageName}」ページへのアクセス権限がありません。`);
        }
    }

    /**
     * 履歴への追加
     */
    addToHistory(pageName, data = null) {
        const historyEntry = {
            page: pageName,
            data: data,
            timestamp: Date.now()
        };

        this.history.push(historyEntry);

        // 履歴の長さを制限
        if (this.history.length > this.maxHistoryLength) {
            this.history.shift();
        }
    }

    /**
     * ブラウザ履歴の更新
     */
    updateBrowserHistory(pageName) {
        const url = new URL(window.location);
        url.searchParams.set('page', pageName);
        
        window.history.pushState(
            { page: pageName },
            ``,
            url.toString()
        );
    }

    /**
     * ページにデータを渡す
     */
    passDataToPage(pageName, data) {
        // ページ固有のデータハンドリング
        switch (pageName) {
            case 'report':
                if (data && data.evaluationId) {
                    // 評価レポートページに評価IDを渡す
                    window.currentEvaluationId = data.evaluationId;
                }
                break;
                
            case 'evaluations':
                if (data && data.filter) {
                    // 評価一覧ページにフィルター情報を渡す
                    window.evaluationFilter = data.filter;
                }
                break;
                
            default:
                // その他のページのデータハンドリング
                if (data) {
                    window.pageData = data;
                }
                break;
        }
    }

    /**
     * 現在のページを取得
     */
    getCurrentPage() {
        return this.currentPage;
    }

    /**
     * ページ情報を取得
     */
    getPageInfo(pageName) {
        return this.pages.get(pageName) || null;
    }

    /**
     * 利用可能なページ一覧を取得
     */
    getAvailablePages() {
        const availablePages = [];
        
        for (const [pageName, pageInfo] of this.pages) {
            if (this.checkPermission(pageInfo.requiredRole)) {
                availablePages.push({
                    name: pageName,
                    title: pageInfo.title,
                    icon: pageInfo.icon
                });
            }
        }
        
        return availablePages;
    }

    /**
     * 戻る
     */
    goBack() {
        if (this.history.length < 2) {
            console.log('戻れる履歴がありません');
            return false;
        }

        // 現在のページを履歴から削除
        this.history.pop();
        
        // 前のページを取得
        const previousEntry = this.history[this.history.length - 1];
        
        // 前のページに移動
        return this.navigateTo(previousEntry.page, {
            skipHistory: true,
            data: previousEntry.data
        });
    }

    /**
     * 履歴をクリア
     */
    clearHistory() {
        this.history = [];
        console.log('ナビゲーション履歴がクリアされました');
    }

    /**
     * 履歴の取得
     */
    getHistory() {
        return [...this.history];
    }

    /**
     * URLからページを復元
     */
    restoreFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        const pageName = urlParams.get('page');
        
        if (pageName && this.pages.has(pageName)) {
            this.navigateTo(pageName, { skipHistory: true });
        } else {
            // URLにページ指定がない場合はデフォルトページ
            this.navigateTo('dashboard');
        }
    }

    /**
     * ページのプリロード
     */
    preloadPage(pageName) {
        const pageInfo = this.pages.get(pageName);
        if (!pageInfo) return false;

        const element = document.querySelector(pageInfo.element);
        if (element) {
            // ページ要素が既に存在する場合はプリロード完了
            return true;
        }

        // 動的にページをロードする場合の処理
        // （現在のシステムでは全ページが既にHTMLに含まれているため不要）
        
        return true;
    }

    /**
     * ページ間のメッセージ送信
     */
    sendMessage(fromPage, toPage, message) {
        console.log(`ページ間メッセージ: ${fromPage} -> ${toPage}`, message);
        
        // カスタムイベントを発火
        const event = new CustomEvent('pageMessage', {
            detail: {
                from: fromPage,
                to: toPage,
                message: message
            }
        });
        
        document.dispatchEvent(event);
    }

    /**
     * ページ間メッセージの監視
     */
    onMessage(callback) {
        document.addEventListener('pageMessage', (event) => {
            if (event.detail.to === this.currentPage || event.detail.to === '*') {
                callback(event.detail);
            }
        });
    }

    /**
     * ルーターの状態を取得
     */
    getState() {
        return {
            currentPage: this.currentPage,
            history: this.getHistory(),
            availablePages: this.getAvailablePages()
        };
    }

    /**
     * ページ遷移のミドルウェア
     */
    addMiddleware(middleware) {
        if (typeof middleware !== 'function') {
            console.error('ミドルウェアは関数である必要があります');
            return;
        }

        // ミドルウェアのチェーン実装
        const originalNavigateTo = this.navigateTo.bind(this);
        
        this.navigateTo = (pageName, options = {}) => {
            // ミドルウェアの実行
            const shouldContinue = middleware({
                from: this.currentPage,
                to: pageName,
                options: options
            });

            if (shouldContinue !== false) {
                return originalNavigateTo(pageName, options);
            }

            return false;
        };
    }

    /**
     * デバッグ情報の取得
     */
    getDebugInfo() {
        return {
            currentPage: this.currentPage,
            totalPages: this.pages.size,
            historyLength: this.history.length,
            lastNavigation: this.history[this.history.length - 1],
            availablePages: this.getAvailablePages().map(p => p.name)
        };
    }
}

// グローバルに公開
window.Router = Router;

console.log('Router が読み込まれました');
