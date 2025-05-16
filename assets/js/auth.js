/**
 * 認証管理 - デモ用認証システム
 * Firebase移行時の認証機能を見据えた抽象化レイヤー
 */

/**
 * 認証管理クラス
 */
class AuthManager {
    constructor(tenantConfig, apiClient) {
        this.tenantConfig = tenantConfig;
        this.apiClient = apiClient;
        this.currentUser = null;
        this.sessionToken = null;
        this.sessionTimeout = null;
        
        // 認証状態の変更コールバック
        this.onAuthStateChanged = null;
        
        // セッション設定
        this.sessionDuration = getConfig('local.auth.sessionTimeout') || 3600000; // 1時間
        this.rememberLogin = getConfig('local.auth.rememberLogin') || true;
        
        console.log('認証マネージャーが初期化されました');
    }

    /**
     * 認証システムの初期化
     */
    async initialize() {
        try {
            console.log('認証システムを初期化中...');
            
            // 自動ログイン設定の確認
            const autoLogin = getConfig('local.autoLogin');
            
            if (autoLogin && this.tenantConfig) {
                // デモモードでは企業のサンプルユーザーで自動ログイン
                await this.autoLogin();
            } else {
                // 既存のセッションがあるかチェック
                await this.restoreSession();
            }
            
            // セッション監視の開始
            this.startSessionMonitoring();
            
            console.log('認証システムの初期化が完了しました');
        } catch (error) {
            console.error('認証システムの初期化エラー:', error);
            throw error;
        }
    }

    /**
     * 自動ログイン（デモモード）
     */
    async autoLogin() {
        if (!this.tenantConfig || !this.tenantConfig.sampleUsers) {
            throw new Error('企業のサンプルユーザーが見つかりません');
        }

        // 管理者ユーザーを優先的に選択
        let selectedUser = this.tenantConfig.sampleUsers.find(user => user.role === 'admin');
        
        // 管理者がいない場合は最初のユーザー
        if (!selectedUser) {
            selectedUser = this.tenantConfig.sampleUsers[0];
        }

        if (!selectedUser) {
            throw new Error('ログイン可能なユーザーが見つかりません');
        }

        // ユーザー情報を設定
        this.currentUser = {
            id: selectedUser.id,
            username: selectedUser.id,
            full_name: selectedUser.name,
            email: selectedUser.email,
            role: selectedUser.role,
            position: selectedUser.position,
            tenantId: this.tenantConfig.id
        };

        // セッショントークンを生成
        this.sessionToken = this.generateSessionToken();
        
        // セッションを保存
        await this.saveSession();
        
        // UI更新
        this.updateUI();
        
        console.log(`自動ログイン完了: ${this.currentUser.full_name} (${this.currentUser.role})`);
        
        // 認証状態変更コールバックの実行
        if (this.onAuthStateChanged) {
            this.onAuthStateChanged(this.currentUser);
        }
    }

    /**
     * 既存セッションの復元
     */
    async restoreSession() {
        const sessionData = this.getStoredSession();
        
        if (!sessionData) {
            console.log('保存されたセッションが見つかりません');
            return false;
        }

        // セッションの有効性をチェック
        if (this.isSessionExpired(sessionData)) {
            console.log('セッションが期限切れです');
            this.clearStoredSession();
            return false;
        }

        // セッションを復元
        this.currentUser = sessionData.user;
        this.sessionToken = sessionData.token;
        
        // UI更新
        this.updateUI();
        
        console.log(`セッション復元完了: ${this.currentUser.full_name}`);
        
        // 認証状態変更コールバックの実行
        if (this.onAuthStateChanged) {
            this.onAuthStateChanged(this.currentUser);
        }
        
        return true;
    }

    /**
     * ログイン処理
     */
    async login(username, password) {
        try {
            console.log(`ログイン試行: ${username}`);
            
            // デモモードではサンプルユーザーから認証
            const user = this.findSampleUser(username, password);
            
            if (!user) {
                throw new Error('ユーザー名またはパスワードが正しくありません');
            }

            // ユーザー情報を設定
            this.currentUser = {
                id: user.id,
                username: user.id,
                full_name: user.name,
                email: user.email,
                role: user.role,
                position: user.position,
                tenantId: this.tenantConfig.id
            };

            // セッショントークンを生成
            this.sessionToken = this.generateSessionToken();
            
            // セッションを保存
            await this.saveSession();
            
            // UI更新
            this.updateUI();
            
            console.log(`ログイン成功: ${this.currentUser.full_name}`);
            
            // 認証状態変更コールバックの実行
            if (this.onAuthStateChanged) {
                this.onAuthStateChanged(this.currentUser);
            }
            
            return true;
        } catch (error) {
            console.error('ログインエラー:', error);
            throw error;
        }
    }

    /**
     * ログアウト処理
     */
    async logout() {
        try {
            console.log('ログアウト処理中...');
            
            // セッションタイムアウトをクリア
            if (this.sessionTimeout) {
                clearTimeout(this.sessionTimeout);
                this.sessionTimeout = null;
            }
            
            // ユーザー情報とトークンをクリア
            this.currentUser = null;
            this.sessionToken = null;
            
            // 保存されたセッションを削除
            this.clearStoredSession();
            
            // UI更新
            this.updateUI();
            
            console.log('ログアウト完了');
            
            // 認証状態変更コールバックの実行
            if (this.onAuthStateChanged) {
                this.onAuthStateChanged(null);
            }
            
            // デモモードでは自動的に再ログイン
            if (getConfig('local.autoLogin')) {
                setTimeout(() => {
                    this.autoLogin();
                }, 1000);
            }
            
        } catch (error) {
            console.error('ログアウトエラー:', error);
            throw error;
        }
    }

    /**
     * サンプルユーザーの検索
     */
    findSampleUser(username, password) {
        if (!this.tenantConfig || !this.tenantConfig.sampleUsers) {
            return null;
        }

        return this.tenantConfig.sampleUsers.find(user => 
            (user.id === username || user.email === username) && 
            user.password === password
        );
    }

    /**
     * セッショントークンの生成
     */
    generateSessionToken() {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substr(2, 9);
        const tenantId = this.tenantConfig ? this.tenantConfig.id : 'unknown';
        
        return `${tenantId}_${timestamp}_${random}`;
    }

    /**
     * 現在のユーザーを取得
     */
    getCurrentUser() {
        return this.currentUser;
    }

    /**
     * 認証状態の確認
     */
    isAuthenticated() {
        return !!(this.currentUser && this.sessionToken);
    }

    /**
     * 権限チェック
     */
    hasRole(role) {
        if (!this.currentUser) return false;
        
        // 管理者は全ての権限を持つ
        if (this.currentUser.role === 'admin') return true;
        
        // 評価者は評価者権限を持つ
        if (role === 'evaluator' && this.currentUser.role === 'evaluator') return true;
        
        // 従業員は従業員権限を持つ（全員が持つ基本権限）
        if (role === 'employee') return true;
        
        return this.currentUser.role === role;
    }

    /**
     * 権限レベルの取得
     */
    getPermissionLevel() {
        if (!this.currentUser) return 0;
        
        const levels = {
            'admin': 3,
            'evaluator': 2,
            'employee': 1
        };
        
        return levels[this.currentUser.role] || 0;
    }

    /**
     * セッションの保存
     */
    async saveSession() {
        if (!this.currentUser || !this.sessionToken) return;

        const sessionData = {
            user: this.currentUser,
            token: this.sessionToken,
            createdAt: Date.now(),
            expiresAt: Date.now() + this.sessionDuration
        };

        if (this.rememberLogin) {
            // ローカルストレージに保存（ブラウザを閉じても保持）
            localStorage.setItem('auth_session', JSON.stringify(sessionData));
        } else {
            // セッションストレージに保存（ブラウザを閉じると削除）
            sessionStorage.setItem('auth_session', JSON.stringify(sessionData));
        }
    }

    /**
     * 保存されたセッションの取得
     */
    getStoredSession() {
        let sessionData = localStorage.getItem('auth_session');
        
        if (!sessionData) {
            sessionData = sessionStorage.getItem('auth_session');
        }
        
        if (!sessionData) return null;
        
        try {
            return JSON.parse(sessionData);
        } catch (error) {
            console.error('セッションデータの解析エラー:', error);
            return null;
        }
    }

    /**
     * セッションの期限切れチェック
     */
    isSessionExpired(sessionData) {
        if (!sessionData || !sessionData.expiresAt) return true;
        return Date.now() > sessionData.expiresAt;
    }

    /**
     * 保存されたセッションの削除
     */
    clearStoredSession() {
        localStorage.removeItem('auth_session');
        sessionStorage.removeItem('auth_session');
    }

    /**
     * セッション監視の開始
     */
    startSessionMonitoring() {
        // 定期的にセッションの有効性をチェック
        const checkInterval = getConfig('security.sessionCheckInterval') * 60 * 1000 || 300000; // 5分
        
        setInterval(() => {
            if (this.isAuthenticated()) {
                const sessionData = this.getStoredSession();
                
                if (!sessionData || this.isSessionExpired(sessionData)) {
                    console.log('セッションが期限切れになりました');
                    this.logout();
                }
            }
        }, checkInterval);
    }

    /**
     * UIの更新
     */
    updateUI() {
        // ユーザー名の表示
        const usernameElement = document.getElementById('current-username');
        if (usernameElement) {
            usernameElement.textContent = this.currentUser ? 
                this.currentUser.full_name : 'ゲスト';
        }

        // 権限に応じた要素の表示/非表示
        this.updatePermissionBasedUI();
    }

    /**
     * 権限ベースのUI更新
     */
    updatePermissionBasedUI() {
        // 管理者専用要素
        const adminOnlyElements = document.querySelectorAll('.admin-only');
        adminOnlyElements.forEach(element => {
            if (this.hasRole('admin')) {
                element.classList.remove('d-none');
            } else {
                element.classList.add('d-none');
            }
        });

        // 評価者専用要素
        const evaluatorOnlyElements = document.querySelectorAll('.evaluator-only');
        evaluatorOnlyElements.forEach(element => {
            if (this.hasRole('evaluator')) {
                element.classList.remove('d-none');
            } else {
                element.classList.add('d-none');
            }
        });

        // 従業員専用要素
        const employeeOnlyElements = document.querySelectorAll('.employee-only');
        employeeOnlyElements.forEach(element => {
            if (this.hasRole('employee')) {
                element.classList.remove('d-none');
            } else {
                element.classList.add('d-none');
            }
        });
    }

    /**
     * パスワードの変更（デモ版では無効）
     */
    async changePassword(oldPassword, newPassword) {
        // デモモードでは実装しない
        throw new Error('デモモードではパスワード変更はサポートされていません');
    }

    /**
     * プロフィールの更新
     */
    async updateProfile(updates) {
        if (!this.currentUser) {
            throw new Error('ログインしていません');
        }

        // デモモードでは一時的に更新（永続化しない）
        Object.assign(this.currentUser, updates);
        
        // UI更新
        this.updateUI();
        
        console.log('プロフィールが更新されました（一時的）');
        
        return true;
    }

    /**
     * 認証トークンの取得
     */
    getAuthToken() {
        return this.sessionToken;
    }

    /**
     * 認証状態の変更監視
     */
    onAuthStateChange(callback) {
        this.onAuthStateChanged = callback;
    }

    /**
     * セッション情報の取得
     */
    getSessionInfo() {
        if (!this.isAuthenticated()) return null;

        const sessionData = this.getStoredSession();
        if (!sessionData) return null;

        return {
            user: this.currentUser,
            token: this.sessionToken,
            createdAt: new Date(sessionData.createdAt),
            expiresAt: new Date(sessionData.expiresAt),
            remainingTime: sessionData.expiresAt - Date.now(),
            remainingMinutes: Math.floor((sessionData.expiresAt - Date.now()) / 60000)
        };
    }

    /**
     * デバッグ情報の取得
     */
    getDebugInfo() {
        return {
            isAuthenticated: this.isAuthenticated(),
            currentUser: this.currentUser,
            hasToken: !!this.sessionToken,
            tenantId: this.tenantConfig ? this.tenantConfig.id : null,
            sessionInfo: this.getSessionInfo(),
            permissionLevel: this.getPermissionLevel()
        };
    }

    /**
     * ログイン履歴の記録（将来の拡張用）
     */
    async recordLoginHistory() {
        // 将来の実装用
        // DatabaseManagerを使用してログイン履歴を記録
    }

    /**
     * セキュリティレポートの生成
     */
    generateSecurityReport() {
        return {
            lastLogin: this.getSessionInfo()?.createdAt,
            sessionDuration: this.sessionDuration / 60000, // 分単位
            rememberLogin: this.rememberLogin,
            permissionLevel: this.getPermissionLevel(),
            tenantAccess: this.tenantConfig ? this.tenantConfig.id : null
        };
    }
}

// グローバルに公開
window.AuthManager = AuthManager;

console.log('AuthManager が読み込まれました');
