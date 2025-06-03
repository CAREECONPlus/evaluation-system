/**
 * シンプルなクライアントサイドルーター
 * ページルーティングとナビゲーション管理
 */
class Router {
    constructor() {
        this.routes = {};
        this.currentRoute = null;
        this.notFoundHandler = null;
        this.errorHandler = null;
        this.beforeRouteHandlers = [];
        this.afterRouteHandlers = [];
        
        this.initializeRouter();
    }

    initializeRouter() {
        // ブラウザの戻る/進むボタン対応
        window.addEventListener('popstate', (e) => {
            this.handleRoute(window.location.pathname);
        });

        console.log('Router initialized');
    }

    setRoutes(routes) {
        this.routes = routes;
    }

    setNotFoundHandler(handler) {
        this.notFoundHandler = handler;
    }

    setErrorHandler(handler) {
        this.errorHandler = handler;
    }

    addBeforeRouteHandler(handler) {
        this.beforeRouteHandlers.push(handler);
    }

    addAfterRouteHandler(handler) {
        this.afterRouteHandlers.push(handler);
    }

    navigate(path, pushState = true) {
        try {
            console.log('Navigating to:', path);

            // 認証チェック（ログインページ以外）
            if (path !== '/login' && !this.isAuthenticated()) {
                console.log('User not authenticated, redirecting to login');
                this.navigate('/login', pushState);
                return;
            }

            // ブラウザ履歴に追加
            if (pushState && window.location.pathname !== path) {
                history.pushState(null, null, path);
            }

            // ルート処理
            this.handleRoute(path);

        } catch (error) {
            console.error('Navigation error:', error);
            this.handleError(error);
        }
    }

    handleRoute(path) {
        try {
            console.log('Handling route:', path);

            // beforeRouteハンドラーの実行
            for (const handler of this.beforeRouteHandlers) {
                const result = handler(path);
                if (result === false) {
                    console.log('Route blocked by beforeRoute handler');
                    return;
                }
            }

            this.currentRoute = path;

            // ルートマッチング
            const matchedRoute = this.matchRoute(path);
            
            if (matchedRoute) {
                // ルートハンドラーの実行
                matchedRoute.handler(...matchedRoute.params);
            } else {
                // 404ハンドラーの実行
                if (this.notFoundHandler) {
                    this.notFoundHandler(path);
                } else {
                    this.defaultNotFoundHandler(path);
                }
            }

            // afterRouteハンドラーの実行
            for (const handler of this.afterRouteHandlers) {
                handler(path);
            }

        } catch (error) {
            console.error('Route handling error:', error);
            this.handleError(error);
        }
    }

    matchRoute(path) {
        // 完全一致を優先
        if (this.routes[path]) {
            return {
                handler: this.routes[path],
                params: []
            };
        }

        // パラメータ付きルートのマッチング
        for (const [route, handler] of Object.entries(this.routes)) {
            const match = this.matchParameterizedRoute(route, path);
            if (match) {
                return {
                    handler,
                    params: match.params
                };
            }
        }

        return null;
    }

    matchParameterizedRoute(routePattern, actualPath) {
        // :id などのパラメータを含むルートのマッチング
        const routeParts = routePattern.split('/');
        const pathParts = actualPath.split('/');

        if (routeParts.length !== pathParts.length) {
            return null;
        }

        const params = [];
        
        for (let i = 0; i < routeParts.length; i++) {
            const routePart = routeParts[i];
            const pathPart = pathParts[i];

            if (routePart.startsWith(':')) {
                // パラメータ部分
                params.push(pathPart);
            } else if (routePart !== pathPart) {
                // 固定部分が一致しない
                return null;
            }
        }

        return { params };
    }

    isAuthenticated() {
        // 認証状態のチェック
        return window.auth && window.auth.isAuthenticatedUser && window.auth.isAuthenticatedUser();
    }

    getCurrentRoute() {
        return this.currentRoute;
    }

    back() {
        history.back();
    }

    forward() {
        history.forward();
    }

    replace(path) {
        history.replaceState(null, null, path);
        this.handleRoute(path);
    }

    defaultNotFoundHandler(path) {
        console.warn('Route not found:', path);
        
        const mainContent = document.getElementById('main-content');
        if (mainContent) {
            mainContent.innerHTML = `
                <div class="error-page">
                    <h2>404 - ページが見つかりません</h2>
                    <p>お探しのページ「${path}」は存在しません。</p>
                    <button onclick="window.router.navigate('/dashboard')" class="btn-primary">
                        ダッシュボードに戻る
                    </button>
                </div>
            `;
        }
    }

    handleError(error) {
        console.error('Router error:', error);
        
        if (this.errorHandler) {
            this.errorHandler(error);
        } else {
            if (window.notification) {
                window.notification.error(`ページの読み込みに失敗しました: ${error.message}`);
            }
        }
    }

    // ルート登録の便利メソッド
    get(path, handler) {
        this.routes[path] = handler;
    }

    // パス生成ヘルパー
    generatePath(pattern, params = {}) {
        let path = pattern;
        
        for (const [key, value] of Object.entries(params)) {
            path = path.replace(`:${key}`, value);
        }
        
        return path;
    }

    // クエリパラメータの解析
    getQueryParams() {
        const params = new URLSearchParams(window.location.search);
        const result = {};
        
        for (const [key, value] of params) {
            result[key] = value;
        }
        
        return result;
    }

    // ハッシュの取得
    getHash() {
        return window.location.hash.substring(1);
    }

    // パスとクエリパラメータを含むフルURLの生成
    buildUrl(path, params = {}) {
        const url = new URL(path, window.location.origin);
        
        for (const [key, value] of Object.entries(params)) {
            url.searchParams.set(key, value);
        }
        
        return url.pathname + url.search;
    }

    // デバッグ用メソッド
    debug() {
        return {
            currentRoute: this.currentRoute,
            routes: Object.keys(this.routes),
            isAuthenticated: this.isAuthenticated(),
            pathname: window.location.pathname,
            search: window.location.search,
            hash: window.location.hash
        };
    }

    // ルーターのリセット
    reset() {
        this.routes = {};
        this.currentRoute = null;
        this.beforeRouteHandlers = [];
        this.afterRouteHandlers = [];
    }

    // ルーティングガード
    addAuthGuard() {
        this.addBeforeRouteHandler((path) => {
            if (path !== '/login' && !this.isAuthenticated()) {
                this.navigate('/login');
                return false;
            }
            return true;
        });
    }

    // ページタイトルの設定
    setPageTitle(title) {
        document.title = title ? `${title} - 建設業評価システム` : '建設業評価システム';
    }

    // ブレッドクラムの更新
    updateBreadcrumbs(items) {
        const breadcrumbsContainer = document.getElementById('breadcrumbs');
        if (!breadcrumbsContainer) return;

        if (!items || items.length === 0) {
            breadcrumbsContainer.style.display = 'none';
            return;
        }

        breadcrumbsContainer.style.display = 'block';
        breadcrumbsContainer.innerHTML = items.map((item, index) => {
            const isLast = index === items.length - 1;
            
            if (isLast) {
                return `<span class="breadcrumb-current">${item.label}</span>`;
            } else {
                return `<a href="#" onclick="window.router.navigate('${item.path}')" class="breadcrumb-link">${item.label}</a>`;
            }
        }).join(' <span class="breadcrumb-separator">></span> ');
    }
}

// グローバルインスタンスの作成
window.router = new Router();
