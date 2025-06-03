/**
 * メインアプリケーションクラス
 * アプリケーション全体の初期化と管理を行う
 */
class App {
    constructor() {
        this.isInitialized = false;
        this.currentPage = null;
        this.version = '1.0.0';
        
        console.log('App constructor called');
    }

    async initialize() {
        try {
            console.log('Starting app initialization...');
            
            // ローディング表示
            this.showLoading();

            // 依存関係の確認
            this.checkDependencies();
            console.log('✅ Dependencies checked');

            // コンポーネントの初期化
            await this.initializeComponents();
            console.log('✅ Components initialized');

            // 認証状態の確認
            const isAuthenticated = await this.checkAuthState();
            console.log('✅ Auth state checked:', isAuthenticated);

            // ルーターの初期化
            this.initializeRouter();
            console.log('✅ Router initialized');

            // ナビゲーションの初期化
            this.initializeNavigation();
            console.log('✅ Navigation initialized');

            // 初期ページの表示
            this.loadInitialPage();
            console.log('✅ Initial page loaded');

            // アプリケーション準備完了
            this.onAppReady();
            console.log('✅ App ready');

            this.isInitialized = true;
            console.log('App initialization completed successfully');

        } catch (error) {
            console.error('App initialization failed:', error);
            this.handleInitializationError(error);
        } finally {
            // 確実にローディングを隠す
            console.log('🔄 Hiding loading indicator...');
            this.hideLoading();
            
            // 2秒後に再度確認（保険）
            setTimeout(() => {
                this.hideLoading();
                console.log('🔄 Loading indicator hide confirmed');
            }, 2000);
        }
    }

    checkDependencies() {
        const requiredObjects = [
            { name: 'window.AuthManager', obj: window.AuthManager },
            { name: 'window.ApiClient', obj: window.ApiClient },
            { name: 'window.notification', obj: window.notification },
            { name: 'window.dashboard', obj: window.dashboard }
        ];

        const missing = requiredObjects.filter(dep => !dep.obj);
        
        if (missing.length > 0) {
            throw new Error(`Missing dependencies: ${missing.map(m => m.name).join(', ')}`);
        }

        console.log('All dependencies are available');
    }

    async initializeComponents() {
        try {
            // 通知システムは既に初期化済み
            console.log('Notification system ready');

            // APIクライアントの接続テスト（モック環境では省略）
            if (window.api && window.api.useRealAPI) {
                const connectionTest = await window.api.testConnection();
                if (!connectionTest.success) {
                    console.warn('API connection test failed:', connectionTest.message);
                }
            }

            console.log('Components initialized successfully');
        } catch (error) {
            console.error('Component initialization failed:', error);
            throw error;
        }
    }

    async checkAuthState() {
        try {
            if (window.auth && window.auth.isAuthenticatedUser()) {
                console.log('User is authenticated:', window.auth.getCurrentUser());
                return true;
            } else {
                console.log('User is not authenticated');
                return false;
            }
        } catch (error) {
            console.error('Auth state check failed:', error);
            return false;
        }
    }

    initializeRouter() {
        if (!window.router) {
            console.error('Router not available');
            return;
        }

        // ルートの定義
        const routes = {
            '/': () => this.showLoginOrDashboard(),
            '/login': () => this.showLoginPage(),
            '/dashboard': () => this.showDashboard(),
            '/evaluations': () => this.showEvaluations(),
            '/evaluations/new': () => this.showNewEvaluation(),
            '/evaluations/:id': (id) => this.showEvaluation(id),
            '/evaluations/:id/edit': (id) => this.showEditEvaluation(id),
            '/users': () => this.showUsers(),
            '/users/:id': (id) => this.showUser(id),
            '/reports': () => this.showReports(),
            '/settings': () => this.showSettings()
        };

        // ルーターの設定
        window.router.setRoutes(routes);
        window.router.setNotFoundHandler(() => this.show404());
        window.router.setErrorHandler((error) => this.handleRouterError(error));

        console.log('Router initialized');
    }

    initializeNavigation() {
        if (window.navigation) {
            window.navigation.render();
            console.log('Navigation initialized');
        }
    }

    loadInitialPage() {
        // 現在のURLに基づいて初期ページを表示
        const path = window.location.pathname;
        console.log('🚀 Loading initial page for path:', path);
        
        // まずローディングを隠してからページ表示
        this.hideLoading();
        
        if (path === '/' || path === '') {
            console.log('📍 Showing login or dashboard');
            this.showLoginOrDashboard();
        } else {
            console.log('📍 Navigating to:', path);
            if (window.router) {
                window.router.navigate(path, false); // pushState=false for initial load
            } else {
                console.error('Router not available for navigation');
                this.showLoginOrDashboard();
            }
        }
    }

    onAppReady() {
        // アプリケーション準備完了時の処理
        this.setupGlobalEventListeners();
        this.startPeriodicTasks();
        
        // デバッグ情報の表示（開発環境のみ）
        if (window.DEBUG_MODE) {
            console.log('🚀 App ready!', {
                version: this.version,
                auth: window.auth?.debug(),
                api: window.api?.getApiInfo(),
                notification: window.notification?.getStats()
            });
        }

        // 準備完了通知
        window.notification?.success('システムが正常に起動しました', {
            duration: 3000
        });
    }

    setupGlobalEventListeners() {
        // グローバルキーボードショートカット
        document.addEventListener('keydown', (e) => {
            // Ctrl+/ でヘルプ表示
            if (e.ctrlKey && e.key === '/') {
                e.preventDefault();
                this.showHelp();
            }
            
            // Escキーでモーダル等を閉じる
            if (e.key === 'Escape') {
                this.handleEscapeKey();
            }
        });

        // ページの可視性変更監視
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                console.log('Page hidden');
            } else {
                console.log('Page visible');
                // ページが再表示された時の処理
                this.onPageVisible();
            }
        });

        // オンライン/オフライン状態の監視
        window.addEventListener('online', () => {
            window.notification?.success('インターネット接続が復旧しました');
        });

        window.addEventListener('offline', () => {
            window.notification?.warning('インターネット接続が失われました');
        });
    }

    startPeriodicTasks() {
        // 5分毎にセッション延長チェック
        setInterval(() => {
            if (window.auth?.isAuthenticatedUser()) {
                window.auth.extendSession();
            }
        }, 5 * 60 * 1000);

        // 10分毎に通知確認（本番環境のみ）
        if (window.api?.useRealAPI) {
            setInterval(() => {
                this.checkNotifications();
            }, 10 * 60 * 1000);
        }
    }

    // ページ表示メソッド群
    showLoginOrDashboard() {
        if (window.auth?.isAuthenticatedUser()) {
            this.showDashboard();
        } else {
            this.showLoginPage();
        }
    }

    showLoginPage() {
        console.log('🔐 Showing login page');
        this.setCurrentPage('login');
        this.hideLoading(); // 確実にローディングを隠す
        
        const mainContent = document.getElementById('main-content');
        if (!mainContent) {
            console.error('Main content element not found');
            return;
        }

        mainContent.innerHTML = `
            <div class="login-page">
                <div class="login-container">
                    <div class="login-header">
                        <h1>建設業評価システム</h1>
                        <p>ログインしてください</p>
                    </div>
                    
                    <form id="login-form" class="login-form">
                        <div class="form-group">
                            <label for="email">メールアドレス</label>
                            <input type="email" id="email" name="email" required 
                                   placeholder="example@company.com"
                                   value="admin@company.com">
                        </div>
                        
                        <div class="form-group">
                            <label for="password">パスワード</label>
                            <input type="password" id="password" name="password" required 
                                   placeholder="パスワード"
                                   value="password123">
                        </div>
                        
                        <button type="submit" class="btn-primary login-btn">
                            ログイン
                        </button>
                    </form>
                    
                    <div class="demo-info">
                        <h3>🚀 デモアカウント（テスト用）</h3>
                        <div class="demo-accounts">
                            <div class="demo-account">
                                <strong>👤 管理者:</strong><br>
                                admin@company.com / password123
                            </div>
                            <div class="demo-account">
                                <strong>👨‍💼 マネージャー:</strong><br>
                                manager@company.com / password123
                            </div>
                            <div class="demo-account">
                                <strong>👷 主任:</strong><br>
                                supervisor@company.com / password123
                            </div>
                        </div>
                        <p><small>※ 上記のアカウント情報は既に入力済みです</small></p>
                    </div>
                </div>
            </div>
        `;

        console.log('✅ Login page HTML set');
        this.setupLoginForm();
    }

    setupLoginForm() {
        const form = document.getElementById('login-form');
        if (!form) return;

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            const loginBtn = form.querySelector('.login-btn');
            loginBtn.textContent = 'ログイン中...';
            loginBtn.disabled = true;

            try {
                const result = await window.auth.login({ email, password });
                
                if (result.success) {
                    window.notification?.success(`${result.user.name}さん、おかえりなさい！`);
                    
                    // ナビゲーション更新
                    if (window.navigation) {
                        window.navigation.render();
                    }
                    
                    // ダッシュボードへリダイレクト
                    if (window.router) {
                        window.router.navigate('/dashboard');
                    }
                } else {
                    window.notification?.error(result.error);
                }
            } catch (error) {
                console.error('Login error:', error);
                window.notification?.error('ログインに失敗しました');
            } finally {
                loginBtn.textContent = 'ログイン';
                loginBtn.disabled = false;
            }
        });
    }

    showDashboard() {
        this.setCurrentPage('dashboard');
        if (window.dashboard) {
            window.dashboard.render();
        }
    }

    showEvaluations() {
        this.setCurrentPage('evaluations');
        if (window.evaluations) {
            window.evaluations.render();
        }
    }

    showNewEvaluation() {
        this.setCurrentPage('evaluation-new');
        if (window.evaluationForm) {
            window.evaluationForm.render();
        }
    }

    showEvaluation(id) {
        this.setCurrentPage('evaluation-view');
        if (window.evaluationForm) {
            window.evaluationForm.render({ mode: 'view', evaluationId: id });
        }
    }

    showEditEvaluation(id) {
        this.setCurrentPage('evaluation-edit');
        if (window.evaluationForm) {
            window.evaluationForm.render({ mode: 'edit', evaluationId: id });
        }
    }

    showUsers() {
        this.setCurrentPage('users');
        if (window.users) {
            window.users.render();
        }
    }

    showUser(id) {
        this.setCurrentPage('user-detail');
        if (window.users) {
            window.users.render({ mode: 'detail', userId: id });
        }
    }

    showReports() {
        this.setCurrentPage('reports');
        // レポートコントローラーは未実装のため、プレースホルダー表示
        const mainContent = document.getElementById('main-content');
        if (mainContent) {
            mainContent.innerHTML = `
                <div class="placeholder-page">
                    <h2>📊 レポート</h2>
                    <p>レポート機能は開発中です。</p>
                </div>
            `;
        }
    }

    showSettings() {
        this.setCurrentPage('settings');
        // 設定ページは未実装のため、プレースホルダー表示
        const mainContent = document.getElementById('main-content');
        if (mainContent) {
            mainContent.innerHTML = `
                <div class="placeholder-page">
                    <h2>⚙️ 設定</h2>
                    <p>設定ページは開発中です。</p>
                </div>
            `;
        }
    }

    show404() {
        this.setCurrentPage('404');
        const mainContent = document.getElementById('main-content');
        if (mainContent) {
            mainContent.innerHTML = `
                <div class="error-page">
                    <h2>404 - ページが見つかりません</h2>
                    <p>お探しのページは存在しないか、移動された可能性があります。</p>
                    <button onclick="window.router.navigate('/dashboard')" class="btn-primary">
                        ダッシュボードに戻る
                    </button>
                </div>
            `;
        }
    }

    // ユーティリティメソッド
    setCurrentPage(pageName) {
        this.currentPage = pageName;
        document.body.className = `page-${pageName}`;
    }

    showLoading() {
        console.log('📥 Showing loading indicator');
        const loadingIndicator = document.getElementById('loading-indicator');
        if (loadingIndicator) {
            loadingIndicator.style.display = 'flex';
            loadingIndicator.style.visibility = 'visible';
            loadingIndicator.style.opacity = '1';
        } else {
            console.warn('Loading indicator element not found');
        }
    }

    hideLoading() {
        console.log('📤 Hiding loading indicator');
        const loadingIndicator = document.getElementById('loading-indicator');
        if (loadingIndicator) {
            loadingIndicator.style.display = 'none';
            loadingIndicator.style.visibility = 'hidden';
            loadingIndicator.style.opacity = '0';
            console.log('✅ Loading indicator hidden successfully');
        } else {
            console.warn('Loading indicator element not found');
        }
        
        // メインコンテンツを確実に表示
        const mainContent = document.getElementById('main-content');
        if (mainContent) {
            mainContent.style.display = 'block';
            mainContent.style.visibility = 'visible';
            console.log('✅ Main content made visible');
        }
    }

    handleInitializationError(error) {
        const mainContent = document.getElementById('main-content');
        if (mainContent) {
            mainContent.innerHTML = `
                <div class="error-page">
                    <h2>🚨 アプリケーション初期化エラー</h2>
                    <p><strong>エラー:</strong> ${error.message}</p>
                    <div class="error-details">
                        <h3>考えられる原因:</h3>
                        <ul>
                            <li>JavaScriptファイルの読み込み失敗</li>
                            <li>ネットワーク接続の問題</li>
                            <li>ブラウザの互換性問題</li>
                        </ul>
                    </div>
                    <button onclick="location.reload()" class="btn-primary">
                        再読み込み
                    </button>
                </div>
            `;
        }
    }

    handleRouterError(error) {
        console.error('Router error:', error);
        window.notification?.error('ページの読み込みに失敗しました');
    }

    handleEscapeKey() {
        // モーダルやドロップダウンを閉じる処理
        console.log('Escape key pressed');
    }

    onPageVisible() {
        // ページが再表示された時の処理
        if (this.currentPage === 'dashboard' && window.dashboard) {
            window.dashboard.render();
        }
    }

    showHelp() {
        window.notification?.info('ヘルプ機能は開発中です', {
            title: 'ヘルプ'
        });
    }

    async checkNotifications() {
        try {
            if (window.auth?.isAuthenticatedUser()) {
                const notifications = await window.api?.getNotifications(window.auth.getCurrentUser().id);
                // 通知処理は実装予定
            }
        } catch (error) {
            console.error('Failed to check notifications:', error);
        }
    }

    // デバッグ用メソッド
    debug() {
        return {
            version: this.version,
            isInitialized: this.isInitialized,
            currentPage: this.currentPage,
            auth: window.auth?.debug(),
            api: window.api?.getApiInfo(),
            notification: window.notification?.getStats()
        };
    }

    // アプリケーション終了処理
    destroy() {
        // タイマーやイベントリスナーのクリーンアップ
        if (window.dashboard) {
            window.dashboard.destroy();
        }
        
        console.log('App destroyed');
    }
}

// グローバルインスタンス
window.App = App;
