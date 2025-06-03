/**
 * Authentication System - 評価ツール
 * ユーザー認証とセッション管理を行うクラス
 */

EvaluationApp = EvaluationApp || {};

/**
 * 認証管理クラス
 */
EvaluationApp.Auth = class {
  constructor(apiClient = null) {
    this.api = apiClient;
    this.currentUser = null;
    this.isAuthenticated = false;
    this.sessionTimeout = null;
    this.debug = EvaluationApp.Constants.APP.DEBUG;
    this.isDemo = EvaluationApp.Constants.APP.DEMO_MODE;
    
    // セッション設定
    this.sessionDuration = 8 * 60 * 60 * 1000; // 8時間
    this.warningTime = 15 * 60 * 1000; // 15分前に警告
    
    // イベントリスナー
    this.eventListeners = new Map();
    
    this.log('Auth manager initialized');
  }

  /**
   * 認証システムの初期化
   */
  async initialize() {
    try {
      // デモモードの場合は自動ログイン
      if (this.isDemo) {
        await this.handleDemoLogin();
        return;
      }

      // 保存されたトークンの確認
      const savedToken = localStorage.getItem(EvaluationApp.Constants.STORAGE_KEYS.AUTH_TOKEN);
      const savedUser = localStorage.getItem(EvaluationApp.Constants.STORAGE_KEYS.USER_DATA);
      
      if (savedToken && savedUser) {
        try {
          // トークンの有効性を確認
          if (this.api) {
            this.api.setAuthToken(savedToken);
            const userProfile = await this.api.getProfile();
            await this.setCurrentUser(userProfile);
            this.startSessionTimer();
            this.log('Auto-login successful');
          }
        } catch (error) {
          this.log('Auto-login failed:', error);
          this.clearAuthData();
        }
      }

    } catch (error) {
      this.log('Auth initialization error:', error);
      this.clearAuthData();
    }
  }

  /**
   * デモモード用自動ログイン
   */
  async handleDemoLogin() {
    try {
      this.log('Demo mode auto-login');
      
      // モックユーザーでログイン
      const demoUser = EvaluationApp.MockData.currentUser;
      await this.setCurrentUser(demoUser);
      
      // デモ用トークンを設定
      if (this.api) {
        this.api.setAuthToken('demo_token_' + Date.now());
      }
      
      this.emit('auth:login:success', { user: demoUser });
      
    } catch (error) {
      this.log('Demo login error:', error);
      throw error;
    }
  }

  /**
   * ログイン処理
   */
  async login(username, password) {
    try {
      this.log('Login attempt for:', username);

      // デモモードの場合
      if (this.isDemo) {
        return await this.handleDemoLogin();
      }

      // 実際のログイン処理
      if (!this.api) {
        throw new Error('API client not available');
      }

      const response = await this.api.login(username, password);
      
      if (response.user) {
        await this.setCurrentUser(response.user);
        this.startSessionTimer();
        this.emit('auth:login:success', { user: response.user });
        this.log('Login successful');
        return response;
      } else {
        throw new Error('Invalid login response');
      }

    } catch (error) {
      this.log('Login error:', error);
      this.emit('auth:login:failed', { error: error.message });
      throw error;
    }
  }

  /**
   * ログアウト処理
   */
  async logout() {
    try {
      this.log('Logout initiated');

      // セッションタイマーをクリア
      this.clearSessionTimer();

      // サーバーにログアウト通知（デモモード以外）
      if (!this.isDemo && this.api) {
        try {
          await this.api.logout();
        } catch (error) {
          // ログアウトAPIが失敗してもローカルデータは削除
          this.log('Logout API error (continuing):', error);
        }
      }

      // ローカルデータをクリア
      this.clearAuthData();
      
      this.emit('auth:logout');
      this.log('Logout completed');

    } catch (error) {
      this.log('Logout error:', error);
      // エラーが発生してもローカルデータはクリア
      this.clearAuthData();
      this.emit('auth:logout');
    }
  }

  /**
   * 現在のユーザー設定
   */
  async setCurrentUser(user) {
    this.currentUser = user;
    this.isAuthenticated = true;
    
    // ローカルストレージに保存
    localStorage.setItem(EvaluationApp.Constants.STORAGE_KEYS.USER_DATA, JSON.stringify(user));
    
    this.log('Current user set:', user.username);
    this.emit('auth:user:changed', { user });
  }

  /**
   * 認証データのクリア
   */
  clearAuthData() {
    this.currentUser = null;
    this.isAuthenticated = false;
    
    // ローカルストレージをクリア
    localStorage.removeItem(EvaluationApp.Constants.STORAGE_KEYS.AUTH_TOKEN);
    localStorage.removeItem(EvaluationApp.Constants.STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(EvaluationApp.Constants.STORAGE_KEYS.USER_DATA);
    
    // APIクライアントのトークンもクリア
    if (this.api) {
      this.api.setAuthToken(null);
    }
    
    this.log('Auth data cleared');
  }

  /**
   * セッションタイマーの開始
   */
  startSessionTimer() {
    this.clearSessionTimer();
    
    // セッション期限警告
    setTimeout(() => {
      this.showSessionWarning();
    }, this.sessionDuration - this.warningTime);
    
    // セッション期限切れ
    this.sessionTimeout = setTimeout(() => {
      this.handleSessionExpired();
    }, this.sessionDuration);
    
    this.log('Session timer started');
  }

  /**
   * セッションタイマーのクリア
   */
  clearSessionTimer() {
    if (this.sessionTimeout) {
      clearTimeout(this.sessionTimeout);
      this.sessionTimeout = null;
    }
  }

  /**
   * セッション期限警告
   */
  showSessionWarning() {
    this.emit('auth:session:warning');
    
    // ユーザーに警告表示
    if (confirm('セッションの期限が近づいています。続行しますか？')) {
      this.extendSession();
    }
  }

  /**
   * セッション期限切れ処理
   */
  handleSessionExpired() {
    this.log('Session expired');
    this.emit('auth:session:expired');
    
    // 自動ログアウト
    this.logout();
    
    // ユーザーに通知
    alert('セッションの期限が切れました。再度ログインしてください。');
  }

  /**
   * セッション延長
   */
  async extendSession() {
    try {
      if (this.isDemo) {
        // デモモードでは単純にタイマーを再開
        this.startSessionTimer();
        return;
      }

      // 実際のセッション延長処理
      if (this.api) {
        await this.api.getProfile(); // プロフィール取得でセッション確認
        this.startSessionTimer();
        this.log('Session extended');
      }
      
    } catch (error) {
      this.log('Session extension failed:', error);
      this.handleSessionExpired();
    }
  }

  // === 権限チェック === //

  /**
   * ログイン状態の確認
   */
  isUserAuthenticated() {
    return this.isAuthenticated && this.currentUser !== null;
  }

  /**
   * 役割の確認
   */
  hasRole(role) {
    if (!this.currentUser) return false;
    
    switch (role) {
      case EvaluationApp.Constants.USER_ROLES.ADMIN:
        return this.currentUser.role === EvaluationApp.Constants.USER_ROLES.ADMIN;
      
      case EvaluationApp.Constants.USER_ROLES.EVALUATOR:
        return this.currentUser.role === EvaluationApp.Constants.USER_ROLES.EVALUATOR || 
               this.currentUser.role === EvaluationApp.Constants.USER_ROLES.ADMIN;
      
      case EvaluationApp.Constants.USER_ROLES.EMPLOYEE:
        return true; // 全ユーザーが従業員権限を持つ
      
      default:
        return false;
    }
  }

  /**
   * 権限の確認
   */
  hasPermission(permission) {
    if (!this.currentUser) return false;
    
    const userRole = this.currentUser.role;
    
    // 管理者は全権限を持つ
    if (userRole === EvaluationApp.Constants.USER_ROLES.ADMIN) {
      return true;
    }
    
    // 権限マッピング
    const rolePermissions = {
      [EvaluationApp.Constants.USER_ROLES.EVALUATOR]: [
        EvaluationApp.Constants.PERMISSIONS.EVALUATION_READ,
        EvaluationApp.Constants.PERMISSIONS.EVALUATION_APPROVE,
        EvaluationApp.Constants.PERMISSIONS.USER_READ,
        EvaluationApp.Constants.PERMISSIONS.REPORT_VIEW
      ],
      [EvaluationApp.Constants.USER_ROLES.EMPLOYEE]: [
        EvaluationApp.Constants.PERMISSIONS.EVALUATION_CREATE,
        EvaluationApp.Constants.PERMISSIONS.EVALUATION_READ,
        EvaluationApp.Constants.PERMISSIONS.EVALUATION_UPDATE,
        EvaluationApp.Constants.PERMISSIONS.EVALUATION_SUBMIT
      ]
    };
    
    const permissions = rolePermissions[userRole] || [];
    return permissions.includes(permission);
  }

  /**
   * 自分の評価かどうかの確認
   */
  isOwnEvaluation(evaluation) {
    return this.currentUser && evaluation.user_id === this.currentUser.id;
  }

  /**
   * 評価対象者かどうかの確認
   */
  isSubordinate(userId) {
    if (!this.currentUser) return false;
    
    // 管理者は全員を評価可能
    if (this.hasRole(EvaluationApp.Constants.USER_ROLES.ADMIN)) {
      return true;
    }
    
    // 評価者の場合は直属の部下のみ
    if (this.hasRole(EvaluationApp.Constants.USER_ROLES.EVALUATOR)) {
      // 実際の実装では部下リストを確認
      return true; // デモ用に簡略化
    }
    
    return false;
  }

  // === ユーザー情報取得 === //

  /**
   * 現在のユーザー取得
   */
  getCurrentUser() {
    return this.currentUser;
  }

  /**
   * ユーザーID取得
   */
  getCurrentUserId() {
    return this.currentUser ? this.currentUser.id : null;
  }

  /**
   * ユーザー名取得
   */
  getCurrentUsername() {
    return this.currentUser ? this.currentUser.username : null;
  }

  /**
   * 表示名取得
   */
  getCurrentUserDisplayName() {
    return this.currentUser ? this.currentUser.fullName || this.currentUser.full_name : null;
  }

  /**
   * ユーザー役職取得
   */
  getCurrentUserPosition() {
    return this.currentUser ? this.currentUser.position : null;
  }

  // === イベント管理 === //

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
      console.log(`[Auth] ${message}`, data || '');
    }
  }

  // === ユーティリティ === //

  /**
   * パスワード強度チェック
   */
  checkPasswordStrength(password) {
    const requirements = EvaluationApp.Constants.VALIDATION.PASSWORD;
    const checks = {
      length: password.length >= requirements.MIN_LENGTH,
      uppercase: requirements.REQUIRE_UPPERCASE ? /[A-Z]/.test(password) : true,
      lowercase: requirements.REQUIRE_LOWERCASE ? /[a-z]/.test(password) : true,
      numbers: requirements.REQUIRE_NUMBERS ? /\d/.test(password) : true,
      symbols: requirements.REQUIRE_SYMBOLS ? /[!@#$%^&*(),.?":{}|<>]/.test(password) : true
    };
    
    const score = Object.values(checks).filter(Boolean).length;
    const total = Object.keys(checks).length;
    
    return {
      score,
      total,
      percentage: (score / total) * 100,
      checks,
      isValid: score === total
    };
  }

  /**
   * 認証情報の取得
   */
  getAuthInfo() {
    return {
      isAuthenticated: this.isAuthenticated,
      currentUser: this.currentUser,
      hasActiveSession: !!this.sessionTimeout,
      isDemo: this.isDemo,
      sessionDuration: this.sessionDuration,
      warningTime: this.warningTime
    };
  }

  /**
   * 認証システムの破棄
   */
  destroy() {
    this.log('Destroying auth manager...');
    
    // セッションタイマーをクリア
    this.clearSessionTimer();
    
    // イベントリスナーを削除
    for (const [eventName, listeners] of this.eventListeners) {
      listeners.forEach(callback => {
        document.removeEventListener(eventName, callback);
      });
    }
    this.eventListeners.clear();
    
    // 認証データをクリア
    this.clearAuthData();
    
    this.log('Auth manager destroyed');
  }
};

// デバッグ用
if (EvaluationApp.Constants && EvaluationApp.Constants.APP.DEBUG) {
  console.log('Auth system loaded');
}
