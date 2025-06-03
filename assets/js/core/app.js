/**
 * Main Application Class - 評価ツール
 * アプリケーションの中核となるクラス
 */

// EvaluationApp 名前空間の拡張
EvaluationApp = EvaluationApp || {};

/**
 * メインアプリケーションクラス
 */
EvaluationApp.App = class {
  constructor() {
    this.version = EvaluationApp.Constants.APP.VERSION;
    this.mode = EvaluationApp.Constants.APP.MODE;
    this.debug = EvaluationApp.Constants.APP.DEBUG;
    
    // コンポーネントインスタンス
    this.auth = null;
    this.router = null;
    this.api = null;
    this.notification = null;
    this.modal = null;
    this.navigation = null;
    
    // ページコントローラー
    this.pageControllers = new Map();
    
    // 初期化状態
    this.initialized = false;
    this.loading = false;
    
    // イベントリスナー管理
    this.eventListeners = new Map();
    
    // DOM要素キャッシュ
    this.elements = {
      loadingOverlay: null,
      appContent: null,
      modalContainer: null,
      notificationContainer: null,
      demoBadge: null,
      navbar: null
    };
    
    // バインド
    this.handleGlobalError = this.handleGlobalError.bind(this);
    this.handleBeforeUnload = this.handleBeforeUnload.bind(this);
    this.handleVisibilityChange = this.handleVisibilityChange.bind(this);
    
    if (this.debug) {
      console.log('EvaluationApp.App instance created');
    }
  }

  /**
   * アプリケーションの初期化
   */
  async initialize() {
    try {
      if (this.initialized) {
        console.warn('Application already initialized');
        return;
      }

      this.loading = true;
      this.log('Starting application initialization...');

      // DOM要素の取得とキャッシュ
      await this.cacheDOMElements();

      // グローバルイベントリスナーの設定
      this.setupGlobalEventListeners();

      // コアコンポーネントの初期化
      await this.initializeCore();

      // UIコンポーネントの初期化
      await this.initializeUI();

      // ページコントローラーの初期化
      await this.initializePageControllers();

      // 初期ルートの設定
      await this.setupInitialRoute();

      // ローディング画面を非表示
      this.hideLoadingOverlay();

      this.initialized = true;
      this.loading = false;

      this.log('Application initialized successfully');
      this.emit('app:initialized');

    } catch (error) {
      this.loading = false;
      this.handleInitializationError(error);
    }
  }

  /**
   * DOM要素のキャッシュ
   */
  async cacheDOMElements() {
    const selectors = {
      loadingOverlay: '#loading-overlay',
      appContent: '#app-content',
      modalContainer: '#modal-container',
      notificationContainer: '#notification-container',
      demoBadge: '#demo-badge',
      navbar: '#main-navbar'
    };

    for (const [key, selector] of Object.entries(selectors)) {
      this.elements[key] = document.querySelector(selector);
      if (!this.elements[key]) {
        throw new Error(`Required element not found: ${selector}`);
      }
    }

    this.log('DOM elements cached');
  }

  /**
   * グローバルイベントリスナーの設定
   */
  setupGlobalEventListeners() {
    // エラーハンドリング
    window.addEventListener('error', this.handleGlobalError);
    window.addEventListener('unhandledrejection', this.handleGlobalError);

    // ページライフサイクル
    window.addEventListener('beforeunload', this.handleBeforeUnload);
    document.addEventListener('visibilitychange', this.handleVisibilityChange);

    // ブラウザバック/フォワード
    window.addEventListener('popstate', (event) => {
      if (this.router) {
        this.router.handlePopState(event);
      }
    });

    // キーボードショートカット
    document.addEventListener('keydown', (event) => {
      this.handleKeyboardShortcuts(event);
    });

    this.log('Global event listeners set up');
  }

  /**
   * コアコンポーネントの初期化
   */
  async initializeCore() {
    // API クライアント
    if (typeof EvaluationApp.ApiClient !== 'undefined') {
      this.api = new EvaluationApp.ApiClient();
      this.log('API client initialized');
    }

    // 認証管理
    if (typeof EvaluationApp.Auth !== 'undefined') {
      this.auth = new EvaluationApp.Auth(this.api);
      await this.auth.initialize();
      this.log('Auth manager initialized');
    }

    // ルーター
    if (typeof EvaluationApp.Router !== 'undefined') {
      this.router = new EvaluationApp.Router(this);
      await this.router.initialize();
      this.log('Router initialized');
    }
  }

  /**
   * UIコンポーネントの初期化
   */
  async initializeUI() {
    // 通知システム
    if (typeof EvaluationApp.Notification !== 'undefined') {
      this.notification = new EvaluationApp.Notification(this.elements.notificationContainer);
      this.log('Notification system initialized');
    }

    // モーダル管理
    if (typeof EvaluationApp.Modal !== 'undefined') {
      this.modal = new EvaluationApp.Modal(this.elements.modalContainer);
      this.log('Modal manager initialized');
    }

    // ナビゲーション
    if (typeof EvaluationApp.Navigation !== 'undefined') {
      this.navigation = new EvaluationApp.Navigation(this.elements.navbar, this.auth);
      await this.navigation.render();
      this.log('Navigation initialized');
    }

    // デモバッジの表示/非表示
    this.setupDemoBadge();
  }

  /**
   * ページコントローラーの初期化
   */
  async initializePageControllers() {
    const controllerClasses = {
      dashboard: EvaluationApp.DashboardController,
      evaluations: EvaluationApp.EvaluationsController,
      subordinates: EvaluationApp.SubordinatesController,
      users: EvaluationApp.UsersController,
      settings: EvaluationApp.SettingsController,
      reports: EvaluationApp.ReportsController
    };

    for (const [name, ControllerClass] of Object.entries(controllerClasses)) {
      if (typeof ControllerClass !== 'undefined') {
        const controller = new ControllerClass(this);
        this.pageControllers.set(name, controller);
        this.log(`${name} controller initialized`);
      } else {
        console.warn(`Controller class not found: ${name}`);
      }
    }
  }

  /**
   * 初期ルートの設定
   */
  async setupInitialRoute() {
    if (this.router) {
      const initialRoute = this.getInitialRoute();
      await this.router.navigateTo(initialRoute);
      this.log(`Initial route set to: ${initialRoute}`);
    }
  }

  /**
   * 初期ルートの決定
   */
  getInitialRoute() {
    // URLフラグメントからルートを取得
    const hash = window.location.hash.substring(1);
    if (hash && this.router && this.router.isValidRoute(hash)) {
      return hash;
    }

    // 認証状態に基づいてデフォルトルートを決定
    if (this.auth && this.auth.isAuthenticated()) {
      return EvaluationApp.Constants.ROUTES.DASHBOARD;
    } else {
      return EvaluationApp.Constants.ROUTES.LOGIN;
    }
  }

  /**
   * デモバッジの設定
   */
  setupDemoBadge() {
    if (this.elements.demoBadge) {
      if (EvaluationApp.Constants.APP.DEMO_MODE) {
        this.elements.demoBadge.style.display = 'block';
      } else {
        this.elements.demoBadge.style.display = 'none';
      }
    }
  }

  /**
   * ローディング画面を非表示
   */
  hideLoadingOverlay() {
    if (this.elements.loadingOverlay) {
      // フェードアウトアニメーション
      this.elements.loadingOverlay.style.opacity = '0';
      
      setTimeout(() => {
        if (this.elements.loadingOverlay) {
          this.elements.loadingOverlay.style.display = 'none';
        }
      }, 300);
    }
  }

  /**
   * ページの表示
   */
  async showPage(pageName, data = {}) {
    try {
      this.log(`Showing page: ${pageName}`);

      // 現在のページを非表示
      this.hideAllPages();

      // ページコントローラーの取得
      const controller = this.pageControllers.get(pageName);
      if (!controller) {
        throw new Error(`Page controller not found: ${pageName}`);
      }

      // ページの読み込みと表示
      await controller.show(data);

      // ナビゲーションの更新
      if (this.navigation) {
        this.navigation.setActiveItem(pageName);
      }

      this.emit('page:shown', { page: pageName, data });

    } catch (error) {
      this.handleError('Failed to show page', error);
      
      // フォールバック: ダッシュボードに戻る
      if (pageName !== EvaluationApp.Constants.ROUTES.DASHBOARD) {
        this.router.navigateTo(EvaluationApp.Constants.ROUTES.DASHBOARD);
      }
    }
  }

  /**
   * すべてのページを非表示
   */
  hideAllPages() {
    const pages = this.elements.appContent.querySelectorAll('.page');
    pages.forEach(page => {
      page.classList.add('d-none');
    });
  }

  /**
   * グローバルエラーハンドラー
   */
  handleGlobalError(event) {
    console.error('Global error:', event);
    
    let message = 'An unexpected error occurred';
    let details = '';

    if (event.error) {
      message = event.error.message || message;
      details = event.error.stack || '';
    } else if (event.reason) {
      message = event.reason.message || event.reason || message;
      details = event.reason.stack || '';
    }

    this.showError('アプリケーションエラー', message, details);
  }

  /**
   * 初期化エラーハンドラー
   */
  handleInitializationError(error) {
    console.error('Initialization error:', error);
    this.hideLoadingOverlay();
    this.showError(
      'アプリケーション初期化エラー',
      error.message || 'アプリケーションの初期化に失敗しました',
      error.stack
    );
  }

  /**
   * エラー表示
   */
  showError(title, message, details = '') {
    // エラーモーダルの表示
    const errorModal = document.getElementById('error-modal');
    if (errorModal) {
      const errorMessage = document.getElementById('error-message');
      const errorDetails = document.getElementById('error-details');

      if (errorMessage) {
        errorMessage.textContent = message;
      }

      if (errorDetails && details) {
        errorDetails.textContent = details;
      }

      const modal = new bootstrap.Modal(errorModal);
      modal.show();
    } else {
      // フォールバック: alert
      alert(`${title}\n\n${message}`);
    }
  }

  /**
   * ページ離脱前の処理
   */
  handleBeforeUnload(event) {
    // 未保存のデータがある場合の警告
    const hasUnsavedData = this.checkUnsavedData();
    
    if (hasUnsavedData) {
      event.preventDefault();
      event.returnValue = '未保存のデータがあります。本当にページを離れますか？';
      return event.returnValue;
    }
  }

  /**
   * ページの可視性変更時の処理
   */
  handleVisibilityChange(event) {
    if (document.hidden) {
      this.log('Page hidden - pausing background tasks');
      this.emit('app:hidden');
    } else {
      this.log('Page visible - resuming background tasks');
      this.emit('app:visible');
    }
  }

  /**
   * キーボードショートカットの処理
   */
  handleKeyboardShortcuts(event) {
    // Ctrl/Cmd + キーの組み合わせ
    if (event.ctrlKey || event.metaKey) {
      switch (event.key) {
        case 's':
          event.preventDefault();
          this.emit('shortcut:save');
          break;
        case '/':
          event.preventDefault();
          this.emit('shortcut:search');
          break;
      }
    }

    // Escapeキー
    if (event.key === 'Escape') {
      this.emit('shortcut:escape');
    }
  }

  /**
   * 未保存データのチェック
   */
  checkUnsavedData() {
    // 各ページコントローラーに未保存データがあるかチェック
    for (const [name, controller] of this.pageControllers) {
      if (typeof controller.hasUnsavedData === 'function' && controller.hasUnsavedData()) {
        return true;
      }
    }
    return false;
  }

  /**
   * 汎用エラーハンドリング
   */
  handleError(context, error) {
    console.error(`Error in ${context}:`, error);
    
    if (this.notification) {
      this.notification.show(
        'エラー',
        error.message || 'エラーが発生しました',
        'danger'
      );
    }
  }

  /**
   * イベントエミッター
   */
  emit(eventName, data = null) {
    const event = new CustomEvent(eventName, { detail: data });
    document.dispatchEvent(event);
    
    if (this.debug) {
      console.log(`Event emitted: ${eventName}`, data);
    }
  }

  /**
   * イベントリスナーの追加
   */
  on(eventName, callback) {
    if (!this.eventListeners.has(eventName)) {
      this.eventListeners.set(eventName, []);
    }
    
    this.eventListeners.get(eventName).push(callback);
    document.addEventListener(eventName, callback);
  }

  /**
   * イベントリスナーの削除
   */
  off(eventName, callback) {
    const listeners = this.eventListeners.get(eventName);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
        document.removeEventListener(eventName, callback);
      }
    }
  }

  /**
   * ログ出力（デバッグモードのみ）
   */
  log(message, data = null) {
    if (this.debug) {
      console.log(`[App] ${message}`, data || '');
    }
  }

  /**
   * アプリケーションの破棄
   */
  destroy() {
    this.log('Destroying application...');

    // イベントリスナーの削除
    window.removeEventListener('error', this.handleGlobalError);
    window.removeEventListener('unhandledrejection', this.handleGlobalError);
    window.removeEventListener('beforeunload', this.handleBeforeUnload);
    document.removeEventListener('visibilitychange', this.handleVisibilityChange);

    // カスタムイベントリスナーの削除
    for (const [eventName, listeners] of this.eventListeners) {
      listeners.forEach(callback => {
        document.removeEventListener(eventName, callback);
      });
    }
    this.eventListeners.clear();

    // コンポーネントの破棄
    if (this.router && typeof this.router.destroy === 'function') {
      this.router.destroy();
    }

    if (this.auth && typeof this.auth.destroy === 'function') {
      this.auth.destroy();
    }

    // ページコントローラーの破棄
    for (const [name, controller] of this.pageControllers) {
      if (typeof controller.destroy === 'function') {
        controller.destroy();
      }
    }
    this.pageControllers.clear();

    this.initialized = false;
    this.log('Application destroyed');
  }

  /**
   * アプリケーション情報の取得
   */
  getInfo() {
    return {
      version: this.version,
      mode: this.mode,
      debug: this.debug,
      initialized: this.initialized,
      loading: this.loading,
      timestamp: new Date().toISOString()
    };
  }
};

/**
 * エラーハンドラーユーティリティ
 */
EvaluationApp.ErrorHandler = {
  showError(title, message, details = '') {
    const errorModal = document.getElementById('error-modal');
    if (errorModal) {
      const errorMessage = document.getElementById('error-message');
      const errorDetails = document.getElementById('error-details');

      if (errorMessage) {
        errorMessage.textContent = message;
      }

      if (errorDetails && details) {
        errorDetails.textContent = details;
        errorDetails.parentElement.style.display = 'block';
      } else if (errorDetails) {
        errorDetails.parentElement.style.display = 'none';
      }

      const modal = new bootstrap.Modal(errorModal);
      modal.show();
    } else {
      console.error(`${title}: ${message}`);
      alert(`${title}\n\n${message}`);
    }
  }
};

// グローバルに公開（デバッグ用）
if (EvaluationApp.Constants.APP.DEBUG) {
  window.EvaluationApp = EvaluationApp;
}
