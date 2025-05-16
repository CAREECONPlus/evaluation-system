/**
 * 評価システム - メインアプリケーション
 * 企業選択からアプリケーション本体までの統合管理
 */

// ========================================
// グローバル変数
// ========================================

let currentTenant = null;
let auth = null;
let api = null;
let router = null;
let database = null;

// ========================================
// アプリケーション初期化
// ========================================

/**
 * アプリケーション初期化
 */
document.addEventListener('DOMContentLoaded', async () => {
    try {
        console.log('評価システムを初期化しています...');
        
        // ページタイプの判定
        const isIndexPage = document.getElementById('company-selection') !== null;
        const isAppPage = document.getElementById('main-navbar') !== null;
        
        if (isIndexPage) {
            // index.html: 企業選択ページの初期化
            await initializeCompanySelection();
        } else if (isAppPage) {
            // app.html: メインアプリケーションの初期化
            await initializeMainApplication();
        }
        
        console.log('評価システムの初期化が完了しました');
    } catch (error) {
        console.error('アプリケーション初期化エラー:', error);
        showErrorNotification('システムの初期化に失敗しました');
    }
});

// ========================================
// 企業選択ページ（index.html）
// ========================================

/**
 * 企業選択ページの初期化
 */
async function initializeCompanySelection() {
    console.log('企業選択ページを初期化中...');
    
    // 企業カードを生成
    renderCompanyCards();
    
    // 企業選択イベントの設定
    setupCompanySelection();
    
    // 既に選択済みの企業があるかチェック
    const selectedTenant = localStorage.getItem('selectedTenant');
    if (selectedTenant && getTenantConfig(selectedTenant)) {
        highlightSelectedCompany(selectedTenant);
    }
}

/**
 * 企業カードを生成して表示
 */
function renderCompanyCards() {
    const container = document.getElementById('company-list');
    if (!container) {
        console.error('企業一覧コンテナが見つかりません');
        return;
    }
    
    const tenants = getAllTenants();
    container.innerHTML = '';
    
    tenants.forEach(tenant => {
        const card = createCompanyCard(tenant);
        container.appendChild(card);
    });
}

/**
 * 企業カードの作成
 */
function createCompanyCard(tenant) {
    const card = document.createElement('div');
    card.className = 'col-md-6 col-lg-4 mb-4';
    
    const selectedTenant = localStorage.getItem('selectedTenant');
    const isSelected = selectedTenant === tenant.id;
    
    card.innerHTML = `
        <div class="card company-select-card ${isSelected ? 'selected' : ''}" 
             data-tenant-id="${tenant.id}"
             role="button"
             tabindex="0"
             aria-label="${tenant.displayName}を選択">
            <div class="card-header bg-primary text-white d-flex align-items-center">
                <i class="${tenant.icon} me-2 fs-4"></i>
                <h5 class="card-title mb-0">${tenant.displayName}</h5>
            </div>
            <div class="card-body">
                <p class="card-text text-muted">${tenant.description}</p>
                <div class="company-info">
                    <small class="text-muted">
                        <i class="fas fa-industry me-2"></i>
                        業界: ${getIndustryDisplayName(tenant.industry)}
                    </small>
                    <br>
                    <small class="text-muted">
                        <i class="fas fa-users me-2"></i>
                        サンプルユーザー: ${tenant.sampleUsers ? tenant.sampleUsers.length : 0}名
                    </small>
                </div>
                ${isSelected ? '<div class="mt-3"><i class="fas fa-check-circle text-success me-2"></i>選択済み</div>' : ''}
            </div>
            <div class="card-footer">
                <button class="btn btn-primary w-100 select-company-btn" 
                        data-tenant-id="${tenant.id}">
                    <i class="fas fa-sign-in-alt me-2"></i>
                    ${isSelected ? '再選択' : '選択'}
                </button>
            </div>
        </div>
    `;
    
    return card;
}

/**
 * 業界表示名の取得
 */
function getIndustryDisplayName(industry) {
    const industryNames = {
        'construction': '建設業',
        'it': 'IT・システム',
        'sales': '営業・販売',
        'manufacturing': '製造業',
        'retail': '小売業',
        'finance': '金融業',
        'other': 'その他'
    };
    return industryNames[industry] || '不明';
}

/**
 * 企業選択関連のイベント設定
 */
function setupCompanySelection() {
    // 企業カードのクリックイベント
    document.addEventListener('click', (event) => {
        const companyCard = event.target.closest('.company-select-card');
        const selectButton = event.target.closest('.select-company-btn');
        
        if (selectButton) {
            event.preventDefault();
            const tenantId = selectButton.dataset.tenantId;
            selectCompany(tenantId);
        } else if (companyCard) {
            // カード全体のクリックでも選択可能
            const tenantId = companyCard.dataset.tenantId;
            selectCompany(tenantId);
        }
    });
    
    // キーボードナビゲーション
    document.addEventListener('keydown', (event) => {
        const companyCard = event.target.closest('.company-select-card');
        if (companyCard && (event.key === 'Enter' || event.key === ' ')) {
            event.preventDefault();
            const tenantId = companyCard.dataset.tenantId;
            selectCompany(tenantId);
        }
    });
}

/**
 * 企業選択処理
 */
async function selectCompany(tenantId) {
    try {
        const tenant = getTenantConfig(tenantId);
        if (!tenant) {
            throw new Error('無効な企業が選択されました');
        }
        
        // ローディング表示
        showLoadingOverlay('企業設定を適用中...');
        
        // 少し遅延を入れて自然な感じに
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // ローカルストレージに保存
        localStorage.setItem('selectedTenant', tenantId);
        
        // テーマ適用
        applyTenantTheme(tenant);
        
        // 評価データの初期化
        if (window.evaluationConfig && window.evaluationConfig.initializeEvaluationData) {
            window.evaluationConfig.initializeEvaluationData(tenant);
        }
        
        // ローディング非表示
        hideLoadingOverlay();
        
        // 成功メッセージ
        showSuccessNotification(
            `${tenant.displayName}が選択されました`,
            'アプリケーションページに移動します...'
        );
        
        // 少し待ってからアプリページに遷移
        setTimeout(() => {
            window.location.href = 'app.html';
        }, 1500);
        
    } catch (error) {
        console.error('企業選択エラー:', error);
        hideLoadingOverlay();
        showErrorNotification(error.message || '企業選択中にエラーが発生しました');
    }
}

/**
 * 選択済み企業のハイライト
 */
function highlightSelectedCompany(tenantId) {
    document.querySelectorAll('.company-select-card').forEach(card => {
        card.classList.remove('selected');
    });
    
    const selectedCard = document.querySelector(`[data-tenant-id="${tenantId}"]`);
    if (selectedCard) {
        selectedCard.classList.add('selected');
    }
}

/**
 * テーマの適用
 */
function applyTenantTheme(tenant) {
    if (!tenant.theme) return;
    
    // 既存のテーマクラスを削除
    document.body.classList.remove('theme-default', 'theme-construction', 'theme-dark');
    
    // 新しいテーマクラスを追加
    document.body.classList.add(`theme-${tenant.theme}`);
    
    // CSS変数でプライマリカラーを設定
    if (tenant.primaryColor) {
        document.documentElement.style.setProperty('--bs-primary', tenant.primaryColor);
        
        // RGB値に変換して設定
        const rgb = hexToRgb(tenant.primaryColor);
        if (rgb) {
            document.documentElement.style.setProperty(
                '--bs-primary-rgb', 
                `${rgb.r}, ${rgb.g}, ${rgb.b}`
            );
        }
    }
}

/**
 * HEXカラーをRGBに変換
 */
function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

// ========================================
// メインアプリケーション（app.html）
// ========================================

/**
 * メインアプリケーションの初期化
 */
async function initializeMainApplication() {
    console.log('メインアプリケーションを初期化中...');
    
    // 企業選択チェック
    const selectedTenant = localStorage.getItem('selectedTenant');
    if (!selectedTenant) {
        // 企業が選択されていない場合は企業選択ページに戻る
        window.location.href = 'index.html';
        return;
    }
    
    // 選択された企業の設定を取得
    currentTenant = getTenantConfig(selectedTenant);
    if (!currentTenant) {
        console.error('企業設定が見つかりません');
        window.location.href = 'index.html';
        return;
    }
    
    // テーマ適用
    applyTenantTheme(currentTenant);
    
    // コアクラスの初期化
    await initializeCoreServices();
    
    // UIコンポーネントの初期化
    initializeUIComponents();
    
    // ページルーティングの初期化
    initializeRouting();
    
    // デフォルトページの表示
    router.navigateTo('dashboard');
}

/**
 * コアサービスの初期化
 */
async function initializeCoreServices() {
    try {
        // データベース初期化（IndexedDB使用）
        if (window.DatabaseManager) {
            database = new window.DatabaseManager();
            await database.initialize();
        }
        
        // API初期化
        if (window.ApiClient) {
            api = new window.ApiClient(currentTenant);
        }
        
        // 認証初期化
        if (window.AuthManager) {
            auth = new window.AuthManager(currentTenant, api);
            await auth.initialize();
        }
        
        // ルーター初期化
        if (window.Router) {
            router = new window.Router();
        }
        
        console.log('コアサービスの初期化完了');
    } catch (error) {
        console.error('コアサービス初期化エラー:', error);
        throw error;
    }
}

/**
 * UIコンポーネントの初期化
 */
function initializeUIComponents() {
    // 企業名の表示
    updateCompanyBranding();
    
    // ナビゲーションの設定
    setupNavigation();
    
    // 通知システムの初期化
    initializeNotificationSystem();
    
    // モーダルの初期化
    initializeModals();
    
    // ツールチップの初期化
    initializeTooltips();
    
    // その他のグローバルUIイベント
    setupGlobalUIEvents();
}

/**
 * 企業ブランディングの更新
 */
function updateCompanyBranding() {
    // ナビゲーションバーのブランド名を更新
    const navbarBrand = document.querySelector('.navbar-brand');
    if (navbarBrand && currentTenant) {
        navbarBrand.innerHTML = `
            <i class="${currentTenant.icon} me-2"></i>
            ${currentTenant.displayName}
        `;
    }
    
    // ページタイトルを更新
    document.title = `評価システム - ${currentTenant.displayName}`;
    
    // デモバッジの更新
    const demoBadge = document.querySelector('.demo-badge');
    if (demoBadge) {
        demoBadge.textContent = `${currentTenant.name} - デモモード`;
    }
}

/**
 * ナビゲーションの設定
 */
function setupNavigation() {
    // ナビゲーションリンクのイベントリスナー設定
    document.querySelectorAll('[data-page]').forEach(link => {
        link.addEventListener('click', (event) => {
            event.preventDefault();
            const targetPage = link.getAttribute('data-page');
            if (router) {
                router.navigateTo(targetPage);
            }
        });
    });
    
    // アクティブリンクの管理
    updateActiveNavigation();
}

/**
 * アクティブナビゲーションの更新
 */
function updateActiveNavigation(activePage = null) {
    if (!activePage) {
        activePage = router ? router.getCurrentPage() : 'dashboard';
    }
    
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        
        if (link.getAttribute('data-page') === activePage) {
            link.classList.add('active');
        }
    });
}

/**
 * ルーティングの初期化
 */
function initializeRouting() {
    if (!router) return;
    
    // ページ変更時のコールバック設定
    router.onPageChange = (pageName) => {
        updateActiveNavigation(pageName);
        
        // ページ固有の初期化処理を呼び出し
        const pageComponents = {
            'dashboard': () => window.DashboardComponent && new window.DashboardComponent(api, auth),
            'evaluations': () => window.EvaluationComponent && new window.EvaluationComponent(api, auth),
            'subordinates': () => window.EvaluationComponent && new window.EvaluationComponent(api, auth, 'subordinates'),
            'users': () => window.UserManagementComponent && new window.UserManagementComponent(api, auth),
            'settings': () => window.SettingsComponent && new window.SettingsComponent(api, auth, currentTenant)
        };
        
        const initComponent = pageComponents[pageName];
        if (initComponent) {
            initComponent();
        }
    };
}

/**
 * 通知システムの初期化
 */
function initializeNotificationSystem() {
    // トーストの初期化
    const toastElement = document.getElementById('notification-toast');
    if (toastElement) {
        // Bootstrap Toastの初期化処理があれば実行
        if (typeof bootstrap !== 'undefined' && bootstrap.Toast) {
            window.toastInstance = new bootstrap.Toast(toastElement);
        }
    }
}

/**
 * モーダルの初期化
 */
function initializeModals() {
    // 共通モーダルの初期化処理
    document.querySelectorAll('.modal').forEach(modal => {
        // モーダル表示時の処理
        modal.addEventListener('show.bs.modal', (event) => {
            const modalId = modal.id;
            console.log(`モーダル表示: ${modalId}`);
        });
        
        // モーダル非表示時の処理
        modal.addEventListener('hidden.bs.modal', (event) => {
            const modalId = modal.id;
            console.log(`モーダル非表示: ${modalId}`);
            
            // フォームのリセット
            const forms = modal.querySelectorAll('form');
            forms.forEach(form => form.reset());
        });
    });
}

/**
 * ツールチップの初期化
 */
function initializeTooltips() {
    // Bootstrap ツールチップの初期化
    if (typeof bootstrap !== 'undefined' && bootstrap.Tooltip) {
        const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
        tooltipTriggerList.forEach(tooltipTriggerEl => {
            new bootstrap.Tooltip(tooltipTriggerEl);
        });
    }
}

/**
 * グローバルUIイベントの設定
 */
function setupGlobalUIEvents() {
    // 企業切り替えボタン（もしあれば）
    const changeCompanyBtn = document.getElementById('change-company-btn');
    if (changeCompanyBtn) {
        changeCompanyBtn.addEventListener('click', () => {
            if (confirm('企業を変更しますか？現在の作業内容は保存されません。')) {
                window.location.href = 'index.html';
            }
        });
    }
    
    // ログアウトリンク
    const logoutLink = document.getElementById('logout-link');
    if (logoutLink) {
        logoutLink.addEventListener('click', (event) => {
            event.preventDefault();
            if (auth) {
                auth.logout();
            }
        });
    }
    
    // プロフィールリンク
    const profileLink = document.getElementById('profile-link');
    if (profileLink) {
        profileLink.addEventListener('click', (event) => {
            event.preventDefault();
            showUserProfile();
        });
    }
    
    // キーボードショートカット
    document.addEventListener('keydown', (event) => {
        // Ctrl+Shift+H でヘルプモーダル表示
        if (event.ctrlKey && event.shiftKey && event.key === 'H') {
            showHelpModal();
        }
        
        // Ctrl+Shift+D でデバッグ情報表示
        if (event.ctrlKey && event.shiftKey && event.key === 'D') {
            toggleDebugInfo();
        }
    });
}

// ========================================
// ユーティリティ関数
// ========================================

/**
 * ローディングオーバーレイの表示
 */
function showLoadingOverlay(message = 'Loading...') {
    let overlay = document.getElementById('loading-overlay');
    
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'loading-overlay';
        overlay.className = 'loading-overlay';
        overlay.innerHTML = `
            <div class="text-center">
                <div class="loading-spinner mb-3"></div>
                <p class="loading-message">${message}</p>
            </div>
        `;
        document.body.appendChild(overlay);
    } else {
        overlay.querySelector('.loading-message').textContent = message;
        overlay.style.display = 'flex';
    }
}

/**
 * ローディングオーバーレイの非表示
 */
function hideLoadingOverlay() {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
        overlay.style.display = 'none';
    }
}

/**
 * 成功通知の表示
 */
function showSuccessNotification(title, message = '') {
    showNotification(title, message, 'success');
}

/**
 * エラー通知の表示
 */
function showErrorNotification(title, message = '') {
    showNotification(title, message, 'danger');
}

/**
 * 情報通知の表示
 */
function showInfoNotification(title, message = '') {
    showNotification(title, message, 'info');
}

/**
 * 警告通知の表示
 */
function showWarningNotification(title, message = '') {
    showNotification(title, message, 'warning');
}

/**
 * 通知の表示
 */
function showNotification(title, message = '', type = 'info') {
    const toastElement = document.getElementById('notification-toast');
    const titleElement = document.getElementById('toast-title');
    const messageElement = document.getElementById('toast-message');
    
    if (!toastElement || !titleElement || !messageElement) {
        console.warn('通知要素が見つかりません');
        return;
    }
    
    // 内容を設定
    titleElement.textContent = title;
    messageElement.textContent = message;
    
    // 既存のクラスを削除
    toastElement.className = 'toast';
    
    // タイプに応じたクラスを追加
    const typeClasses = {
        'success': 'bg-success text-white',
        'danger': 'bg-danger text-white',
        'warning': 'bg-warning text-dark',
        'info': 'bg-info text-white'
    };
    
    if (typeClasses[type]) {
        toastElement.classList.add(...typeClasses[type].split(' '));
    }
    
    // トーストを表示
    if (window.toastInstance) {
        window.toastInstance.show();
    } else if (typeof bootstrap !== 'undefined' && bootstrap.Toast) {
        const toast = new bootstrap.Toast(toastElement);
        toast.show();
    }
}

/**
 * ユーザープロフィールの表示
 */
function showUserProfile() {
    if (!auth || !auth.getCurrentUser()) {
        showWarningNotification('未ログイン', 'ログインしてください');
        return;
    }
    
    const user = auth.getCurrentUser();
    const modalContent = `
        <div class="modal fade" id="profile-modal" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header bg-primary text-white">
                        <h5 class="modal-title">ユーザープロフィール</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <dl class="row">
                            <dt class="col-4">ユーザー名:</dt>
                            <dd class="col-8">${user.username}</dd>
                            <dt class="col-4">氏名:</dt>
                            <dd class="col-8">${user.full_name || '-'}</dd>
                            <dt class="col-4">メール:</dt>
                            <dd class="col-8">${user.email || '-'}</dd>
                            <dt class="col-4">役割:</dt>
                            <dd class="col-8">${getRoleDisplayName(user.role)}</dd>
                            <dt class="col-4">役職:</dt>
                            <dd class="col-8">${user.position || '-'}</dd>
                            <dt class="col-4">所属企業:</dt>
                            <dd class="col-8">${currentTenant ? currentTenant.displayName : '-'}</dd>
                        </dl>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">閉じる</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // 既存のプロフィールモーダルを削除
    const existingModal = document.getElementById('profile-modal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // 新しいモーダルを追加
    document.body.insertAdjacentHTML('beforeend', modalContent);
    
    // モーダルを表示
    const modal = new bootstrap.Modal(document.getElementById('profile-modal'));
    modal.show();
}

/**
 * 役割表示名の取得
 */
function getRoleDisplayName(role) {
    const roleNames = {
        'admin': '管理者',
        'evaluator': '評価者',
        'employee': '従業員'
    };
    return roleNames[role] || role;
}

/**
 * デバッグ情報の表示切り替え
 */
function toggleDebugInfo() {
    let debugPanel = document.getElementById('debug-panel');
    
    if (!debugPanel) {
        debugPanel = document.createElement('div');
        debugPanel.id = 'debug-panel';
        debugPanel.className = 'position-fixed bottom-0 start-0 bg-dark text-white p-3 m-3 rounded';
        debugPanel.style.zIndex = '2000';
        debugPanel.style.maxWidth = '300px';
        debugPanel.style.fontSize = '0.875rem';
        
        const debugInfo = {
            '現在企業': currentTenant ? currentTenant.displayName : 'なし',
            '現在ユーザー': auth && auth.getCurrentUser() ? auth.getCurrentUser().username : 'なし',
            '現在ページ': router ? router.getCurrentPage() : 'なし',
            'ローカルストレージ': `${Object.keys(localStorage).length} 項目`,
            'セッション': auth && auth.isAuthenticated() ? '有効' : '無効'
        };
        
        let debugHTML = '<strong>デバッグ情報</strong><hr>';
        for (const [key, value] of Object.entries(debugInfo)) {
            debugHTML += `<div>${key}: ${value}</div>`;
        }
        debugHTML += '<hr><button class="btn btn-sm btn-outline-light" onclick="document.getElementById(\'debug-panel\').remove()">閉じる</button>';
        
        debugPanel.innerHTML = debugHTML;
        document.body.appendChild(debugPanel);
    } else {
        debugPanel.remove();
    }
}

/**
 * ヘルプモーダルの表示
 */
function showHelpModal() {
    const modalContent = `
        <div class="modal fade" id="help-modal" tabindex="-1">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header bg-primary text-white">
                        <h5 class="modal-title">ヘルプ</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <h6>キーボードショートカット</h6>
                        <ul>
                            <li><kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>H</kbd>: ヘルプ表示</li>
                            <li><kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>D</kbd>: デバッグ情報表示</li>
                        </ul>
                        
                        <h6>主要機能</h6>
                        <ul>
                            <li><strong>ダッシュボード</strong>: 評価状況の概要確認</li>
                            <li><strong>評価一覧</strong>: 自分の評価履歴の確認</li>
                            <li><strong>評価対象者</strong>: 部下の評価管理（評価者のみ）</li>
                            <li><strong>ユーザー管理</strong>: ユーザーの追加・編集（管理者のみ）</li>
                            <li><strong>設定</strong>: システム設定の管理（管理者のみ）</li>
                        </ul>
                        
                        <h6>デモモードについて</h6>
                        <p>このシステムはデモモードで動作しており、実際のデータは保存されません。<br>
                        作成したデータは一時的に保存され、ページを再読み込みすると初期状態に戻ります。</p>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">閉じる</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // 既存のヘルプモーダルを削除
    const existingModal = document.getElementById('help-modal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // 新しいモーダルを追加
    document.body.insertAdjacentHTML('beforeend', modalContent);
    
    // モーダルを表示
    const modal = new bootstrap.Modal(document.getElementById('help-modal'));
    modal.show();
}

// ========================================
// エクスポート (グローバル関数として設定)
// ========================================

// 主要オブジェクトをグローバルに公開
window.app = {
    currentTenant,
    auth,
    api,
    router,
    database,
    showNotification,
    showSuccessNotification,
    showErrorNotification,
    showInfoNotification,
    showWarningNotification,
    showLoadingOverlay,
    hideLoadingOverlay,
    updateActiveNavigation,
    toggleDebugInfo
};

// ========================================
// エラーハンドリング
// ========================================

// グローバルエラーハンドラー
window.addEventListener('error', (event) => {
    console.error('グローバルエラー:', event.error);
    showErrorNotification(
        'システムエラー',
        event.error.message || 'アプリケーションでエラーが発生しました'
    );
});

// Promise エラーハンドラー
window.addEventListener('unhandledrejection', (event) => {
    console.error('未処理のPromiseエラー:', event.reason);
    showErrorNotification(
        'システムエラー',
        '非同期処理でエラーが発生しました'
    );
    event.preventDefault();
});

console.log('評価システム app.js が読み込まれました');
