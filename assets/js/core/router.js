/**
 * SPA用ルーター
 * ページ遷移とブラウザ履歴を管理
 */
class Router {
    constructor() {
        this.routes = new Map();
        this.currentRoute = null;
        this.params = {};
        this.query = {};
        this.middlewares = [];
        this.guards = [];
        
        this.initializeRoutes();
        this.bindEvents();
        this.handleInitialRoute();
    }

    initializeRoutes() {
        // ルート定義
        this.addRoute('/', {
            component: 'dashboard',
            title: 'ダッシュボード',
            requireAuth: true
        });

        this.addRoute('/dashboard', {
            component: 'dashboard',
            title: 'ダッシュボード',
            requireAuth: true
        });

        this.addRoute('/evaluations', {
            component: 'evaluations',
            title: '評価一覧',
            requireAuth: true
        });

        this.addRoute('/evaluations/new', {
            component: 'evaluation-form',
            title: '新規評価',
            requireAuth: true,
            action: 'new'
        });

        this.addRoute('/evaluations/:id/edit', {
            component: 'evaluation-form',
            title: '評価編集',
            requireAuth: true,
            action: 'edit'
        });

        this.addRoute('/evaluations/:id', {
            component: 'evaluation-detail',
            title: '評価詳細',
            requireAuth: true
        });

        this.addRoute('/subordinates', {
            component: 'subordinates',
            title: '評価対象者管理',
            requireAuth: true
        });

        this.addRoute('/users', {
            component: 'users',
            title: 'ユーザー管理',
            requireAuth: true,
            requireRole: ['admin', 'manager']
        });

        this.addRoute('/settings', {
            component: 'settings',
            title: '設定',
            requireAuth: true
        });

        this.addRoute('/reports', {
            component: 'reports',
            title: 'レポート',
            requireAuth: true
        });

        this.addRoute('/login', {
            component: 'login',
            title: 'ログイン',
            layout: 'auth'
        });

        this.addRoute('/404', {
            component: '404',
            title: 'ページが見つかりません'
        });
    }

    addRoute(path, config) {
        const pattern = this.pathToRegexp(path);
        this.routes.set(pattern.regex, {
            path,
            pattern,
            ...config
        });
    }

    pathToRegexp(path) {
        const keys = [];
        const regex = new RegExp(
            '^' + path
                .replace(/\/:([^/]+)/g, (match, key) => {
                    keys.push(key);
                    return '/([^/]+)';
                })
                .replace(/\*/g, '.*') + '$'
        );
        
        return { regex, keys };
    }

    bindEvents() {
        // ブラウザの戻る/進むボタン
        window.addEventListener('popstate', (e) => {
            this.handleRoute(window.location.pathname + window.location.search, false);
        });

        // リンククリック
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a[href]');
            if (link && this.isInternalLink(link)) {
                e.preventDefault();
                this.navigate(link.getAttribute('href'));
            }
        });
    }

    isInternalLink(link) {
        const href = link.getAttribute('href');
        
        // 外部リンクやメールリンクは除外
        if (href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('tel:')) {
            return false;
        }
        
        // target="_blank" は除外
        if (link.getAttribute('target') === '_blank') {
            return false;
        }
        
        return true;
    }

    handleInitialRoute() {
        const path = window.location.pathname + window.location.search;
        this.handleRoute(path, false);
    }

    async navigate(path, addToHistory = true) {
        await this.handleRoute(path, addToHistory);
    }

    async handleRoute(fullPath, addToHistory = true) {
        const [path, queryString] = fullPath.split('?');
        this.query = this.parseQuery(queryString || '');

        // ルートマッチング
        const matchedRoute = this.matchRoute(path);
        
        if (!matchedRoute) {
            return this.navigate('/404', addToHistory);
        }

        // ガード実行
        const guardResult = await this.executeGuards(matchedRoute, path);
        if (!guardResult.allowed) {
            if (guardResult.redirect) {
                return this.navigate(guardResult.redirect, addToHistory);
            }
            return;
        }

        // ミドルウェア実行
        for (const middleware of this.middlewares) {
            await middleware(matchedRoute, this.params, this.query);
        }

        // ブラウザ履歴更新
        if (addToHistory) {
            window.history.pushState({}, '', fullPath);
        }

        // ページタイトル更新
        document.title = `${matchedRoute.title} - 建設業評価システム`;

        // ルート情報保存
        this.currentRoute = matchedRoute;

        // ページ表示
        await this.renderPage(matchedRoute);
    }

    matchRoute(path) {
        for (const [regex, route] of this.routes) {
            const match = path.match(regex);
            if (match) {
                this.params = {};
                
                // パラメータ抽出
                route.pattern.keys.forEach((key, index) => {
                    this.params[key] = match[index + 1];
                });

                return route;
            }
        }
        return null;
    }

    parseQuery(queryString) {
        const query = {};
        if (queryString) {
            queryString.split('&').forEach(param => {
                const [key, value] = param.split('=');
                if (key) {
                    query[decodeURIComponent(key)] = decodeURIComponent(value || '');
                }
            });
        }
        return query;
    }

    async executeGuards(route, path) {
        // 認証チェック
        if (route.requireAuth && !window.auth.isAuthenticated()) {
            return {
                allowed: false,
                redirect: `/login?redirect=${encodeURIComponent(path)}`
            };
        }

        // ロールチェック
        if (route.requireRole) {
            const user = window.auth.getCurrentUser();
            if (!user || !route.requireRole.includes(user.role)) {
                window.notification.show('アクセス権限がありません', 'error');
                return {
                    allowed: false,
                    redirect: '/dashboard'
                };
            }
        }

        // カスタムガード実行
        for (const guard of this.guards) {
            const result = await guard(route, this.params, this.query);
            if (!result.allowed) {
                return result;
            }
        }

        return { allowed: true };
    }

    async renderPage(route) {
        try {
            // ローディング表示
            this.showLoading();

            // レイアウト適用
            await this.applyLayout(route.layout || 'default');

            // コンポーネント読み込み
            await this.loadComponent(route.component, route.action);

            // ナビゲーション更新
            this.updateNavigation(route);

        } catch (error) {
            console.error('ページの描画に失敗:', error);
            this.showError('ページの読み込みに失敗しました');
        } finally {
            this.hideLoading();
        }
    }

    async applyLayout(layoutType) {
        const appContainer = document.getElementById('app');
        if (!appContainer) return;

        switch (layoutType) {
            case 'auth':
                appContainer.className = 'app-container auth-layout';
                break;
            case 'minimal':
                appContainer.className = 'app-container minimal-layout';
                break;
            default:
                appContainer.className = 'app-container default-layout';
        }
    }

    async loadComponent(componentName, action = null) {
        const mainContent = document.getElementById('main-content');
        if (!mainContent) return;

        // コンポーネント初期化
        switch (componentName) {
            case 'dashboard':
                if (window.dashboard) {
                    await window.dashboard.render();
                }
                break;

            case 'evaluations':
                if (window.evaluations) {
                    await window.evaluations.render();
                }
                break;

            case 'evaluation-form':
                if (window.evaluationForm) {
                    if (action === 'new') {
                        const subordinateId = this.query.subordinate;
                        const periodId = this.query.period;
                        await window.evaluationForm.openNewEvaluation(subordinateId, periodId);
                    } else if (action === 'edit' && this.params.id) {
                        await window.evaluationForm.openEditEvaluation(this.params.id);
                    }
                }
                break;

            case 'evaluation-detail':
                if (window.evaluationDetail && this.params.id) {
                    await window.evaluationDetail.render(this.params.id);
                }
                break;

            case 'subordinates':
                if (window.subordinates) {
                    await window.subordinates.render();
                }
                break;

            case 'users':
                if (window.users) {
                    await window.users.render();
                }
                break;

            case 'settings':
                if (window.settings) {
                    await window.settings.render();
                }
                break;

            case 'reports':
                if (window.reports) {
                    await window.reports.render();
                }
                break;

            case 'login':
                if (window.login) {
                    const redirectPath = this.query.redirect || '/dashboard';
                    await window.login.render(redirectPath);
                }
                break;

            case '404':
                this.render404Page();
                break;

            default:
                throw new Error(`Unknown component: ${componentName}`);
        }
    }

    updateNavigation(route) {
        // アクティブなナビゲーション項目を更新
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.classList.remove('active');
            
            const href = item.getAttribute('href') || item.querySelector('a')?.getAttribute('href');
            if (href && this.isCurrentRoute(href, route.path)) {
                item.classList.add('active');
            }
        });
    }

    isCurrentRoute(href, currentPath) {
        // 完全一致
        if (href === currentPath) return true;
        
        // ダッシュボードの特別処理
        if ((href === '/' || href === '/dashboard') && 
            (currentPath === '/' || currentPath === '/dashboard')) {
            return true;
        }
        
        // 親パス一致（評価関連ページ）
        if (href === '/evaluations' && currentPath.startsWith('/evaluations')) {
            return true;
        }
        
        return false;
    }

    render404Page() {
        const mainContent = document.getElementById('main-content');
        if (mainContent) {
            mainContent.innerHTML = `
                <div class="error-page">
                    <div class="error-content">
                        <h1>404</h1>
                        <h2>ページが見つかりません</h2>
                        <p>お探しのページは存在しないか、移動した可能性があります。</p>
                        <div class="error-actions">
                            <a href="/dashboard" class="btn-primary">ダッシュボードに戻る</a>
                            <button onclick="history.back()" class="btn-secondary">前のページに戻る</button>
                        </div>
                    </div>
                </div>
            `;
        }
    }

    showLoading() {
        const loadingElement = document.getElementById('loading-indicator');
        if (loadingElement) {
            loadingElement.style.display = 'flex';
        }
    }

    hideLoading() {
        const loadingElement = document.getElementById('loading-indicator');
        if (loadingElement) {
            loadingElement.style.display = 'none';
        }
    }

    showError(message) {
        window.notification?.show(message, 'error');
    }

    // ミドルウェア登録
    use(middleware) {
        this.middlewares.push(middleware);
    }

    // ガード登録
    addGuard(guard) {
        this.guards.push(guard);
    }

    // 現在のルート情報取得
    getCurrentRoute() {
        return this.currentRoute;
    }

    // パラメータ取得
    getParams() {
        return { ...this.params };
    }

    // クエリパラメータ取得
    getQuery() {
        return { ...this.query };
    }

    // パラメータ付きURLの生成
    buildUrl(path, params = {}, query = {}) {
        let url = path;
        
        // パラメータ置換
        Object.keys(params).forEach(key => {
            url = url.replace(`:${key}`, params[key]);
        });
        
        // クエリパラメータ追加
        const queryString = Object.keys(query)
            .filter(key => query[key] !== null && query[key] !== undefined)
            .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(query[key])}`)
            .join('&');
        
        if (queryString) {
            url += `?${queryString}`;
        }
        
        return url;
    }

    // リダイレクト
    redirect(path) {
        return this.navigate(path, true);
    }

    // 置換（履歴に残さない）
    replace(path) {
        window.history.replaceState({}, '', path);
        return this.handleRoute(path, false);
    }

    // 戻る
    back() {
        window.history.back();
    }

    // 進む
    forward() {
        window.history.forward();
    }

    // 特定回数戻る
    go(delta) {
        window.history.go(delta);
    }

    // ブレッドクラム生成
    generateBreadcrumbs() {
        const breadcrumbs = [];
        const currentPath = this.currentRoute?.path;
        
        if (!currentPath || currentPath === '/' || currentPath === '/dashboard') {
            return breadcrumbs;
        }

        // ダッシュボードを常に最初に追加
        breadcrumbs.push({
            title: 'ダッシュボード',
            path: '/dashboard'
        });

        // パスベースでブレッドクラムを生成
        if (currentPath.startsWith('/evaluations')) {
            breadcrumbs.push({
                title: '評価一覧',
                path: '/evaluations'
            });
            
            if (currentPath.includes('/new')) {
                breadcrumbs.push({
                    title: '新規評価',
                    path: currentPath,
                    current: true
                });
            } else if (currentPath.includes('/edit')) {
                breadcrumbs.push({
                    title: '評価編集',
                    path: currentPath,
                    current: true
                });
            } else if (this.params.id) {
                breadcrumbs.push({
                    title: '評価詳細',
                    path: currentPath,
                    current: true
                });
            }
        } else {
            // その他のページ
            breadcrumbs.push({
                title: this.currentRoute.title,
                path: currentPath,
                current: true
            });
        }

        return breadcrumbs;
    }

    // ブレッドクラムHTML生成
    renderBreadcrumbs() {
        const breadcrumbs = this.generateBreadcrumbs();
        const container = document.getElementById('breadcrumbs');
        
        if (!container || breadcrumbs.length === 0) return;

        container.innerHTML = breadcrumbs.map((crumb, index) => {
            if (crumb.current) {
                return `<span class="breadcrumb-current">${crumb.title}</span>`;
            } else {
                return `<a href="${crumb.path}" class="breadcrumb-link">${crumb.title}</a>`;
            }
        }).join('<span class="breadcrumb-separator">›</span>');
    }

    // 開発者向けデバッグ情報
    debug() {
        return {
            currentRoute: this.currentRoute,
            params: this.params,
            query: this.query,
            path: window.location.pathname,
            routes: Array.from(this.routes.values()).map(r => r.path)
        };
    }
}

// グローバルインスタンス
window.router = new Router();
