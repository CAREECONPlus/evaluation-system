/**
 * 認証管理システム
 * ユーザーのログイン・ログアウト・権限管理を行う
 */
class AuthManager {
    constructor() {
        this.currentUser = null;
        this.isAuthenticated = false;
        this.sessionTimeout = 30 * 60 * 1000; // 30分
        this.sessionTimer = null;
        
        this.initializeAuth();
    }

    initializeAuth() {
        // セッションストレージから認証情報を復元
        this.restoreSession();
        
        // セッションタイムアウトの設定
        this.setupSessionTimeout();
        
        // ページ可視性の監視（タブ切り替え検知）
        this.setupVisibilityHandling();
    }

    async login(credentials) {
        try {
            const { email, password } = credentials;
            
            // デモモードの認証
            if (this.isDemoMode()) {
                return this.handleDemoLogin(email, password);
            }
            
            // 本番環境での認証
            const response = await window.api?.authenticate(credentials);
            
            if (response && response.user) {
                this.setCurrentUser(response.user, response.token);
                this.startSession();
                return { success: true, user: response.user };
            } else {
                throw new Error('認証に失敗しました');
            }
            
        } catch (error) {
            console.error('Login failed:', error);
            return { 
                success: false, 
                error: error.message || 'ログインに失敗しました' 
            };
        }
    }

    handleDemoLogin(email, password) {
        // デモアカウント
        const demoAccounts = [
            {
                id: 'demo-admin',
                email: 'admin@company.com',
                password: 'password123',
                name: '田中 太郎',
                role: 'admin',
                department: 'admin',
                position: '管理者',
                permissions: ['all']
            },
            {
                id: 'demo-manager',
                email: 'manager@company.com', 
                password: 'password123',
                name: '佐藤 花子',
                role: 'manager',
                department: 'construction',
                position: 'マネージャー',
                permissions: ['evaluate', 'manage_subordinates', 'view_reports']
            },
            {
                id: 'demo-supervisor',
                email: 'supervisor@company.com',
                password: 'password123', 
                name: '鈴木 一郎',
                role: 'supervisor',
                department: 'construction',
                position: '主任',
                permissions: ['evaluate', 'manage_subordinates']
            }
        ];

        const user = demoAccounts.find(account => 
            account.email === email && account.password === password
        );

        if (user) {
            const userWithoutPassword = { ...user };
            delete userWithoutPassword.password;
            
            this.setCurrentUser(userWithoutPassword, 'demo-token');
            this.startSession();
            
            return { success: true, user: userWithoutPassword };
        } else {
            return { 
                success: false, 
                error: 'メールアドレスまたはパスワードが正しくありません' 
            };
        }
    }

    logout() {
        this.clearSession();
        this.currentUser = null;
        this.isAuthenticated = false;
        
        // セッションストレージから削除
        sessionStorage.removeItem('auth_user');
        sessionStorage.removeItem('auth_token');
        sessionStorage.removeItem('auth_timestamp');
        
        // ログインページにリダイレクト
        if (window.router) {
            window.router.navigate('/login');
        }
    }

    setCurrentUser(user, token = null) {
        this.currentUser = user;
        this.isAuthenticated = true;
        
        // セッションストレージに保存
        sessionStorage.setItem('auth_user', JSON.stringify(user));
        if (token) {
            sessionStorage.setItem('auth_token', token);
        }
        sessionStorage.setItem('auth_timestamp', Date.now().toString());
    }

    getCurrentUser() {
        return this.currentUser;
    }

    isAuthenticatedUser() {
        return this.isAuthenticated && this.currentUser !== null;
    }

    hasRole(role) {
        if (!this.currentUser) return false;
        
        // adminは全ての権限を持つ
        if (this.currentUser.role === 'admin') return true;
        
        // 指定された役職をチェック
        return this.currentUser.role === role;
    }

    hasPermission(permission) {
        if (!this.currentUser) return false;
        
        // adminは全ての権限を持つ
        if (this.currentUser.role === 'admin') return true;
        
        // 権限配列をチェック
        return this.currentUser.permissions?.includes(permission) || 
               this.currentUser.permissions?.includes('all');
    }

    canEvaluate() {
        return this.hasPermission('evaluate');
    }

    canManageUsers() {
        return this.hasPermission('manage_users') || this.hasRole('admin');
    }

    canViewReports() {
        return this.hasPermission('view_reports');
    }

    restoreSession() {
        try {
            const userData = sessionStorage.getItem('auth_user');
            const timestamp = sessionStorage.getItem('auth_timestamp');
            
            if (userData && timestamp) {
                const sessionAge = Date.now() - parseInt(timestamp);
                
                // セッションがタイムアウトしていないかチェック
                if (sessionAge < this.sessionTimeout) {
                    this.currentUser = JSON.parse(userData);
                    this.isAuthenticated = true;
                    this.startSession();
                    return true;
                } else {
                    // セッションタイムアウト
                    this.clearSession();
                }
            }
        } catch (error) {
            console.error('Failed to restore session:', error);
            this.clearSession();
        }
        
        return false;
    }

    startSession() {
        this.clearSession(); // 既存のタイマーをクリア
        
        this.sessionTimer = setTimeout(() => {
            window.notification?.show('セッションがタイムアウトしました', 'warning');
            this.logout();
        }, this.sessionTimeout);
    }

    clearSession() {
        if (this.sessionTimer) {
            clearTimeout(this.sessionTimer);
            this.sessionTimer = null;
        }
    }

    extendSession() {
        // アクティビティがあった場合にセッションを延長
        sessionStorage.setItem('auth_timestamp', Date.now().toString());
        this.startSession();
    }

    setupSessionTimeout() {
        // ユーザーアクティビティの監視
        const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
        
        let lastActivity = Date.now();
        
        const updateActivity = () => {
            const now = Date.now();
            if (now - lastActivity > 60000) { // 1分間隔でチェック
                lastActivity = now;
                if (this.isAuthenticated) {
                    this.extendSession();
                }
            }
        };

        activityEvents.forEach(event => {
            document.addEventListener(event, updateActivity, true);
        });
    }

    setupVisibilityHandling() {
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden && this.isAuthenticated) {
                // タブが再表示された時にセッション有効性をチェック
                const timestamp = sessionStorage.getItem('auth_timestamp');
                if (timestamp) {
                    const sessionAge = Date.now() - parseInt(timestamp);
                    if (sessionAge >= this.sessionTimeout) {
                        window.notification?.show('セッションがタイムアウトしました', 'warning');
                        this.logout();
                    }
                }
            }
        });
    }

    isDemoMode() {
        // 開発環境またはデモモードの判定
        return window.location.hostname === 'localhost' || 
               window.location.hostname === '127.0.0.1' ||
               window.location.hostname === '' ||
               window.location.search.includes('demo=true');
    }

    // トークン関連
    getAuthToken() {
        return sessionStorage.getItem('auth_token');
    }

    setAuthToken(token) {
        sessionStorage.setItem('auth_token', token);
    }

    // パスワード変更
    async changePassword(currentPassword, newPassword) {
        try {
            if (this.isDemoMode()) {
                window.notification?.show('デモモードではパスワード変更はできません', 'info');
                return { success: false, error: 'デモモードでは利用できません' };
            }

            const result = await window.api?.changePassword({
                currentPassword,
                newPassword,
                userId: this.currentUser.id
            });

            if (result.success) {
                window.notification?.show('パスワードを変更しました', 'success');
                return { success: true };
            } else {
                throw new Error(result.error || 'パスワード変更に失敗しました');
            }

        } catch (error) {
            console.error('Password change failed:', error);
            return { 
                success: false, 
                error: error.message || 'パスワード変更に失敗しました' 
            };
        }
    }

    // プロフィール更新
    async updateProfile(profileData) {
        try {
            if (this.isDemoMode()) {
                // デモモードでは一時的に更新
                this.currentUser = { ...this.currentUser, ...profileData };
                sessionStorage.setItem('auth_user', JSON.stringify(this.currentUser));
                window.notification?.show('プロフィールを更新しました（デモモード）', 'success');
                return { success: true, user: this.currentUser };
            }

            const result = await window.api?.updateUserProfile(this.currentUser.id, profileData);
            
            if (result.success) {
                this.currentUser = { ...this.currentUser, ...result.user };
                sessionStorage.setItem('auth_user', JSON.stringify(this.currentUser));
                window.notification?.show('プロフィールを更新しました', 'success');
                return { success: true, user: this.currentUser };
            } else {
                throw new Error(result.error || 'プロフィール更新に失敗しました');
            }

        } catch (error) {
            console.error('Profile update failed:', error);
            return { 
                success: false, 
                error: error.message || 'プロフィール更新に失敗しました' 
            };
        }
    }

    // デバッグ用
    debug() {
        return {
            isAuthenticated: this.isAuthenticated,
            currentUser: this.currentUser,
            sessionTimeout: this.sessionTimeout,
            isDemoMode: this.isDemoMode()
        };
    }
}

// グローバルインスタンス（両方の名前で利用可能）
window.AuthManager = AuthManager;
window.auth = new AuthManager();
