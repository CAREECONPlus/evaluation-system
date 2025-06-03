/**
 * Navigation Component - 評価ツール
 * メインナビゲーションバーを管理するクラス
 */

EvaluationApp = EvaluationApp || {};

/**
 * ナビゲーションクラス
 */
EvaluationApp.Navigation = class {
  constructor(container, authManager = null) {
    this.container = container;
    this.auth = authManager;
    this.currentRoute = null;
    this.debug = EvaluationApp.Constants.APP.DEBUG;
    
    // ナビゲーション項目の定義
    this.navigationItems = this.getNavigationItems();
    
    // イベントリスナー
    this.clickHandlers = new Map();
    
    this.log('Navigation component initialized');
  }

  /**
   * ナビゲーション項目の定義
   */
  getNavigationItems() {
    return [
      {
        id: 'dashboard',
        label: 'ダッシュボード',
        icon: 'fas fa-home',
        route: EvaluationApp.Constants.ROUTES.DASHBOARD,
        roles: ['admin', 'evaluator', 'employee'],
        order: 1
      },
      {
        id: 'evaluations',
        label: '評価一覧',
        icon: 'fas fa-clipboard-list',
        route: EvaluationApp.Constants.ROUTES.EVALUATIONS,
        roles: ['admin', 'evaluator', 'employee'],
        order: 2
      },
      {
        id: 'subordinates',
        label: '評価対象者',
        icon: 'fas fa-users',
        route: EvaluationApp.Constants.ROUTES.SUBORDINATES,
        roles: ['admin', 'evaluator'],
        order: 3,
        requiresEvaluator: true
      },
      {
        id: 'users',
        label: 'ユーザー管理',
        icon: 'fas fa-user-cog',
        route: EvaluationApp.Constants.ROUTES.USERS,
        roles: ['admin'],
        order: 4,
        adminOnly: true
      },
      {
        id: 'settings',
        label: '設定',
        icon: 'fas fa-cog',
        route: EvaluationApp.Constants.ROUTES.SETTINGS,
        roles: ['admin'],
        order: 5,
        adminOnly: true
      }
    ];
  }

  /**
   * ナビゲーションの描画
   */
  async render() {
    if (!this.container) {
      throw new Error('Navigation container not found');
    }

    // 現在のユーザー情報を取得
    const currentUser = this.auth ? this.auth.getCurrentUser() : null;
    
    // ナビゲーションHTMLの構築
    const navHTML = this.buildNavigationHTML(currentUser);
    
    // コンテナに挿入
    this.container.innerHTML = navHTML;
    
    // イベントリスナーの設定
    this.setupEventListeners();
    
    this.log('Navigation rendered');
  }

  /**
   * ナビゲーションHTMLの構築
   */
  buildNavigationHTML(currentUser) {
    const brandName = EvaluationApp.Constants.APP.NAME;
    const isAuthenticated = currentUser !== null;
    
    // 表示可能なナビゲーション項目をフィルタリング
    const visibleItems = this.getVisibleNavigationItems(currentUser);
    
    return `
      <div class="container-fluid">
        <!-- ブランド -->
        <a class="navbar-brand" href="#" data-route="dashboard">
          <i class="fas fa-chart-line me-2"></i>
          ${brandName}
        </a>
        
        <!-- ハンバーガーメニューボタン -->
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" 
                aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
          <span class="navbar-toggler-icon"></span>
        </button>
        
        <!-- ナビゲーションコンテンツ -->
        <div class="collapse navbar-collapse" id="navbarNav">
          ${isAuthenticated ? this.buildMainNavigation(visibleItems) : ''}
          ${isAuthenticated ? this.buildUserMenu(currentUser) : this.buildLoginButton()}
        </div>
      </div>
    `;
  }

  /**
   * メインナビゲーションの構築
   */
  buildMainNavigation(items) {
    if (!items.length) return '';
    
    const navItems = items
      .sort((a, b) => a.order - b.order)
      .map(item => `
        <li class="nav-item">
          <a class="nav-link" href="#" data-route="${item.route}" data-nav-item="${item.id}">
            <i class="${item.icon} me-1"></i>
            <span class="nav-text">${item.label}</span>
          </a>
        </li>
      `).join('');

    return `
      <ul class="navbar-nav me-auto">
        ${navItems}
      </ul>
    `;
  }

  /**
   * ユーザーメニューの構築
   */
  buildUserMenu(currentUser) {
    const displayName = currentUser.fullName || currentUser.full_name || currentUser.username;
    const userRole = this.getUserRoleLabel(currentUser.role);
    const userPosition = currentUser.position || '';
    
    return `
      <ul class="navbar-nav ms-auto">
        <!-- 通知アイコン（将来実装） -->
        <li class="nav-item me-3">
          <a class="nav-link position-relative" href="#" id="notification-bell">
            <i class="fas fa-bell"></i>
            <span class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger d-none" id="notification-count">
              0
            </span>
          </a>
        </li>
        
        <!-- ユーザードロップダウン -->
        <li class="nav-item dropdown">
          <a class="nav-link dropdown-toggle d-flex align-items-center" href="#" id="userDropdown" 
             role="button" data-bs-toggle="dropdown" aria-expanded="false">
            <div class="user-avatar me-2">
              <i class="fas fa-user-circle fa-lg"></i>
            </div>
            <div class="user-info d-none d-md-block">
              <div class="user-name">${displayName}</div>
              <div class="user-role small text-muted">${userRole}${userPosition ? ' / ' + userPosition : ''}</div>
            </div>
          </a>
          <ul class="dropdown-menu dropdown-menu-end">
            <li>
              <div class="dropdown-header">
                <strong>${displayName}</strong><br>
                <small class="text-muted">${userRole}${userPosition ? ' / ' + userPosition : ''}</small>
              </div>
            </li>
            <li><hr class="dropdown-divider"></li>
            <li>
              <a class="dropdown-item" href="#" data-action="profile">
                <i class="fas fa-user me-2"></i>プロフィール
              </a>
            </li>
            <li>
              <a class="dropdown-item" href="#" data-action="my-evaluations">
                <i class="fas fa-clipboard-check me-2"></i>自分の評価
              </a>
            </li>
            ${this.buildQuickActions(currentUser)}
            <li><hr class="dropdown-divider"></li>
            <li>
              <a class="dropdown-item" href="#" data-action="help">
                <i class="fas fa-question-circle me-2"></i>ヘルプ
              </a>
            </li>
            <li>
              <a class="dropdown-item text-danger" href="#" data-action="logout">
                <i class="fas fa-sign-out-alt me-2"></i>ログアウト
              </a>
            </li>
          </ul>
        </li>
      </ul>
    `;
  }

  /**
   * クイックアクションの構築
   */
  buildQuickActions(currentUser) {
    const actions = [];
    
    // 管理者用アクション
    if (this.auth && this.auth.hasRole('admin')) {
      actions.push(`
        <li>
          <a class="dropdown-item" href="#" data-route="users">
            <i class="fas fa-users-cog me-2"></i>ユーザー管理
          </a>
        </li>
        <li>
          <a class="dropdown-item" href="#" data-route="settings">
            <i class="fas fa-cog me-2"></i>システム設定
          </a>
        </li>
      `);
    }
    
    // 評価者用アクション
    if (this.auth && this.auth.hasRole('evaluator')) {
      actions.push(`
        <li>
          <a class="dropdown-item" href="#" data-route="subordinates">
            <i class="fas fa-clipboard-list me-2"></i>部下の評価確認
          </a>
        </li>
      `);
    }
    
    return actions.length > 0 ? '<li><hr class="dropdown-divider"></li>' + actions.join('') : '';
  }

  /**
   * ログインボタンの構築
   */
  buildLoginButton() {
    return `
      <ul class="navbar-nav ms-auto">
        <li class="nav-item">
          <a class="nav-link" href="#" data-action="login">
            <i class="fas fa-sign-in-alt me-1"></i>ログイン
          </a>
        </li>
      </ul>
    `;
  }

  /**
   * 表示可能なナビゲーション項目の取得
   */
  getVisibleNavigationItems(currentUser) {
    if (!currentUser) return [];
    
    return this.navigationItems.filter(item => {
      // 役割チェック
      if (item.roles && !item.roles.includes(currentUser.role)) {
        return false;
      }
      
      // 評価者権限が必要な項目
      if (item.requiresEvaluator && !this.auth?.hasRole('evaluator')) {
        return false;
      }
      
      // 管理者専用項目
      if (item.adminOnly && !this.auth?.hasRole('admin')) {
        return false;
      }
      
      return true;
    });
  }

  /**
   * ユーザー役割ラベルの取得
   */
  getUserRoleLabel(role) {
    const roleLabels = {
      admin: '管理者',
      evaluator: '評価者',
      employee: '従業員'
    };
    return roleLabels[role] || '不明';
  }

  /**
   * イベントリスナーの設定
   */
  setupEventListeners() {
    // ナビゲーションクリックイベント
    this.container.addEventListener('click', (event) => {
      event.preventDefault();
      
      const target = event.target.closest('a[data-route], a[data-action]');
      if (!target) return;
      
      const route = target.getAttribute('data-route');
      const action = target.getAttribute('data-action');
      
      if (route) {
        this.handleNavigation(route, event);
      } else if (action) {
        this.handleAction(action, event);
      }
    });
    
    // ドロップダウンイベント
    this.setupDropdownEvents();
    
    // 通知ベルクリック
    const notificationBell = this.container.querySelector('#notification-bell');
    if (notificationBell) {
      notificationBell.addEventListener('click', (event) => {
        event.preventDefault();
        this.handleNotificationClick();
      });
    }
    
    this.log('Event listeners set up');
  }

  /**
   * ドロップダウンイベントの設定
   */
  setupDropdownEvents() {
    const dropdown = this.container.querySelector('#userDropdown');
    if (!dropdown) return;
    
    // ドロップダウン表示時
    dropdown.addEventListener('show.bs.dropdown', () => {
      this.log('User dropdown opened');
    });
    
    // ドロップダウン非表示時
    dropdown.addEventListener('hide.bs.dropdown', () => {
      this.log('User dropdown closed');
    });
  }

  /**
   * ナビゲーション処理
   */
  handleNavigation(route, event) {
    this.log('Navigation to:', route);
    
    // 現在のルートと同じ場合は何もしない
    if (this.currentRoute === route) {
      return;
    }
    
    // ナビゲーションイベントを発火
    this.emit('navigation:request', { 
      route, 
      event,
      previousRoute: this.currentRoute 
    });
  }

  /**
   * アクション処理
   */
  async handleAction(action, event) {
    this.log('Action triggered:', action);
    
    switch (action) {
      case 'login':
        this.handleLogin();
        break;
        
      case 'logout':
        await this.handleLogout();
        break;
        
      case 'profile':
        this.handleProfile();
        break;
        
      case 'my-evaluations':
        this.handleMyEvaluations();
        break;
        
      case 'help':
        this.handleHelp();
        break;
        
      default:
        this.log('Unknown action:', action);
    }
  }

  /**
   * ログイン処理
   */
  handleLogin() {
    // ログインモーダルを表示（将来実装）
    this.emit('auth:login:request');
  }

  /**
   * ログアウト処理
   */
  async handleLogout() {
    if (!confirm('ログアウトしますか？')) {
      return;
    }
    
    try {
      if (this.auth) {
        await this.auth.logout();
      }
      
      // ナビゲーションを再描画
      await this.render();
      
    } catch (error) {
      this.log('Logout error:', error);
      // エラーが発生してもログアウトを実行
      this.emit('auth:logout:error', { error });
    }
  }

  /**
   * プロフィール表示
   */
  handleProfile() {
    this.emit('navigation:request', { 
      route: EvaluationApp.Constants.ROUTES.PROFILE 
    });
  }

  /**
   * 自分の評価表示
   */
  handleMyEvaluations() {
    this.emit('navigation:request', { 
      route: EvaluationApp.Constants.ROUTES.EVALUATIONS,
      filter: 'my'
    });
  }

  /**
   * ヘルプ表示
   */
  handleHelp() {
    // ヘルプページまたはモーダルを表示
    this.emit('help:show');
  }

  /**
   * 通知クリック処理
   */
  handleNotificationClick() {
    this.emit('notification:show');
  }

  /**
   * アクティブなナビゲーション項目の設定
   */
  setActiveItem(route) {
    this.currentRoute = route;
    
    // 全てのナビゲーション項目からactiveクラスを削除
    const navItems = this.container.querySelectorAll('.nav-link[data-nav-item]');
    navItems.forEach(item => {
      item.classList.remove('active');
    });
    
    // 対応するナビゲーション項目にactiveクラスを追加
    const activeItem = this.container.querySelector(`[data-route="${route}"]`);
    if (activeItem) {
      activeItem.classList.add('active');
    }
    
    this.log('Active navigation item set:', route);
  }

  /**
   * 通知数の更新
   */
  updateNotificationCount(count) {
    const badge = this.container.querySelector('#notification-count');
    if (!badge) return;
    
    if (count > 0) {
      badge.textContent = count > 99 ? '99+' : count.toString();
      badge.classList.remove('d-none');
    } else {
      badge.classList.add('d-none');
    }
    
    this.log('Notification count updated:', count);
  }

  /**
   * ナビゲーションの更新
   */
  async updateNavigation() {
    await this.render();
    this.log('Navigation updated');
  }

  /**
   * レスポンシブ対応
   */
  handleResize() {
    const navbar = this.container.querySelector('.navbar-collapse');
    if (!navbar) return;
    
    // モバイルサイズでドロップダウンが開いている場合は閉じる
    if (window.innerWidth >= 992) { // Bootstrap lg breakpoint
      const bsCollapse = bootstrap.Collapse.getInstance(navbar);
      if (bsCollapse) {
        bsCollapse.hide();
      }
    }
  }

  /**
   * イベント発火
   */
  emit(eventName, data = null) {
    const event = new CustomEvent(eventName, { detail: data });
    document.dispatchEvent(event);
    
    if (this.debug) {
      this.log(`Event emitted: ${eventName}`, data);
    }
  }

  /**
   * ログ出力
   */
  log(message, data = null) {
    if (this.debug) {
      console.log(`[Navigation] ${message}`, data || '');
    }
  }

  /**
   * ナビゲーションの破棄
   */
  destroy() {
    this.log('Destroying navigation...');
    
    // イベントリスナーの削除
    this.clickHandlers.forEach((handler, element) => {
      element.removeEventListener('click', handler);
    });
    this.clickHandlers.clear();
    
    // リサイズイベントリスナーの削除
    window.removeEventListener('resize', this.handleResize);
    
    // コンテナをクリア
    if (this.container) {
      this.container.innerHTML = '';
    }
    
    this.log('Navigation destroyed');
  }
};

// リサイズイベントの設定（グローバル）
window.addEventListener('resize', () => {
  if (window.evaluationApp && window.evaluationApp.navigation) {
    window.evaluationApp.navigation.handleResize();
  }
});

// デバッグ用
if (EvaluationApp.Constants && EvaluationApp.Constants.APP.DEBUG) {
  console.log('Navigation component loaded');
}
