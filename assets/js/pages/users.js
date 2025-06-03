/**
 * ユーザー管理ページコントローラー
 * ユーザーの一覧表示、作成、編集、削除を管理
 */
class UsersController {
    constructor() {
        this.users = [];
        this.filteredUsers = [];
        this.currentFilter = {
            search: '',
            role: '',
            department: '',
            status: ''
        };
        this.sortConfig = {
            field: 'name',
            direction: 'asc'
        };
        
        console.log('Users controller initialized');
    }

    async render(options = {}) {
        const { mode = 'list', userId = null } = options;
        
        try {
            this.showLoading();
            
            if (mode === 'list') {
                await this.renderUsersList();
            } else if (mode === 'detail' && userId) {
                await this.renderUserDetail(userId);
            }
            
        } catch (error) {
            console.error('Users page render failed:', error);
            this.showError('ユーザー管理ページの読み込みに失敗しました');
        } finally {
            this.hideLoading();
        }
    }

    async renderUsersList() {
        await this.loadUsers();
        this.createUsersListStructure();
        this.populateUsersList();
        this.setupEventListeners();
    }

    async loadUsers() {
        try {
            if (window.api) {
                this.users = await window.api.getUsers();
            } else {
                // モックデータを使用
                this.users = this.generateMockUsers();
            }
            
            this.applyFilters();
        } catch (error) {
            console.error('Failed to load users:', error);
            this.users = this.generateMockUsers();
            this.applyFilters();
        }
    }

    generateMockUsers() {
        return [
            {
                id: 'user-1',
                name: '田中 太郎',
                email: 'tanaka@company.com',
                role: 'manager',
                department: 'construction',
                position: 'マネージャー',
                status: 'active',
                createdAt: '2024-01-15T09:00:00Z',
                lastLogin: '2025-06-03T08:30:00Z'
            },
            {
                id: 'user-2',
                name: '佐藤 花子',
                email: 'sato@company.com',
                role: 'supervisor',
                department: 'construction',
                position: '主任',
                status: 'active',
                createdAt: '2024-02-01T09:00:00Z',
                lastLogin: '2025-06-02T17:45:00Z'
            },
            {
                id: 'user-3',
                name: '鈴木 一郎',
                email: 'suzuki@company.com',
                role: 'employee',
                department: 'construction',
                position: '作業員',
                status: 'active',
                createdAt: '2024-03-10T09:00:00Z',
                lastLogin: '2025-06-01T16:20:00Z'
            },
            {
                id: 'user-4',
                name: '山田 次郎',
                email: 'yamada@company.com',
                role: 'employee',
                department: 'construction',
                position: '作業員',
                status: 'inactive',
                createdAt: '2024-04-05T09:00:00Z',
                lastLogin: '2025-05-15T14:10:00Z'
            }
        ];
    }

    createUsersListStructure() {
        const mainContent = document.getElementById('main-content');
        if (!mainContent) return;

        mainContent.innerHTML = `
            <div class="users-page">
                <!-- ページヘッダー -->
                <div class="page-header">
                    <div class="header-content">
                        <h1>ユーザー管理</h1>
                        <div class="header-actions">
                            <button class="btn-secondary" id="refresh-users">
                                <i class="icon-refresh"></i>
                                更新
                            </button>
                            <button class="btn-primary" id="add-user-btn">
                                <i class="icon-plus"></i>
                                新規ユーザー
                            </button>
                        </div>
                    </div>
                </div>

                <!-- フィルター・検索エリア -->
                <div class="filters-section">
                    <div class="search-box">
                        <input 
                            type="text" 
                            id="search-input" 
                            placeholder="名前、メールアドレスで検索..."
                            class="search-input"
                        >
                        <i class="search-icon icon-search"></i>
                    </div>
                    
                    <div class="filter-controls">
                        <select id="role-filter" class="filter-select">
                            <option value="">すべての役職</option>
                            <option value="admin">管理者</option>
                            <option value="manager">マネージャー</option>
                            <option value="supervisor">主任</option>
                            <option value="employee">従業員</option>
                        </select>
                        
                        <select id="department-filter" class="filter-select">
                            <option value="">すべての部署</option>
                            <option value="construction">建設部</option>
                            <option value="admin">管理部</option>
                            <option value="sales">営業部</option>
                        </select>
                        
                        <select id="status-filter" class="filter-select">
                            <option value="">すべてのステータス</option>
                            <option value="active">アクティブ</option>
                            <option value="inactive">非アクティブ</option>
                        </select>
                        
                        <button id="clear-filters-btn" class="btn-text">
                            フィルタークリア
                        </button>
                    </div>
                </div>

                <!-- ユーザー一覧テーブル -->
                <div class="table-container">
                    <div class="table-header">
                        <div class="table-controls">
                            <div class="results-count">
                                <span id="users-count">0</span> 名のユーザー
                            </div>
                            
                            <select id="sort-select" class="sort-select">
                                <option value="name-asc">名前（昇順）</option>
                                <option value="name-desc">名前（降順）</option>
                                <option value="role-asc">役職（昇順）</option>
                                <option value="role-desc">役職（降順）</option>
                                <option value="createdAt-desc">登録日（新しい順）</option>
                                <option value="createdAt-asc">登録日（古い順）</option>
                                <option value="lastLogin-asc">最終ログイン（古い順）</option>
                            </select>
                        </div>
                    </div>

                    <table class="users-table">
                        <thead>
                            <tr>
                                <th class="user-column">ユーザー</th>
                                <th class="role-column">役職</th>
                                <th class="department-column">部署</th>
                                <th class="status-column">ステータス</th>
                                <th class="last-login-column">最終ログイン</th>
                                <th class="actions-column">操作</th>
                            </tr>
                        </thead>
                        <tbody id="users-table-body">
                            <!-- 動的に生成 -->
                        </tbody>
                    </table>
                </div>

                <!-- 空の状態 -->
                <div id="empty-state" class="empty-state" style="display: none;">
                    <div class="empty-icon">
                        <i class="icon-users"></i>
                    </div>
                    <h3>ユーザーがありません</h3>
                    <p>条件に一致するユーザーが見つかりません。</p>
                    <button class="btn-primary" onclick="document.getElementById('add-user-btn').click()">
                        最初のユーザーを作成
                    </button>
                </div>
            </div>
        `;
    }

    populateUsersList() {
        const tbody = document.getElementById('users-table-body');
        const emptyState = document.getElementById('empty-state');
        const usersCount = document.getElementById('users-count');
        
        if (!tbody) return;

        // 結果数の表示
        if (usersCount) {
            usersCount.textContent = this.filteredUsers.length;
        }

        if (this.filteredUsers.length === 0) {
            tbody.innerHTML = '';
            if (emptyState) emptyState.style.display = 'block';
            return;
        }

        if (emptyState) emptyState.style.display = 'none';

        tbody.innerHTML = this.filteredUsers.map(user => `
            <tr class="user-row" data-user-id="${user.id}">
                <td class="user-cell">
                    <div class="user-info">
                        <div class="user-avatar">
                            ${user.name.charAt(0).toUpperCase()}
                        </div>
                        <div class="user-details">
                            <div class="user-name">${this.escapeHtml(user.name)}</div>
                            <div class="user-email">${this.escapeHtml(user.email)}</div>
                        </div>
                    </div>
                </td>
                <td class="role-cell">
                    <span class="role-badge role-${user.role}">
                        ${this.getRoleDisplayName(user.role)}
                    </span>
                </td>
                <td class="department-cell">
                    <span class="department-name">${this.getDepartmentDisplayName(user.department)}</span>
                    <div class="position-name">${this.escapeHtml(user.position || '')}</div>
                </td>
                <td class="status-cell">
                    <span class="status-badge status-${user.status}">
                        ${this.getStatusDisplayName(user.status)}
                    </span>
                </td>
                <td class="last-login-cell">
                    <div class="last-login-info">
                        ${user.lastLogin ? this.formatRelativeTime(user.lastLogin) : '未ログイン'}
                    </div>
                </td>
                <td class="actions-cell">
                    <div class="action-buttons">
                        <button 
                            class="action-btn view-user-btn" 
                            data-user-id="${user.id}"
                            title="詳細表示"
                        >
                            <i class="icon-eye"></i>
                        </button>
                        <button 
                            class="action-btn edit-user-btn" 
                            data-user-id="${user.id}"
                            title="編集"
                        >
                            <i class="icon-edit"></i>
                        </button>
                        <button 
                            class="action-btn delete-user-btn" 
                            data-user-id="${user.id}"
                            title="削除"
                            ${user.id === window.auth?.getCurrentUser()?.id ? 'disabled' : ''}
                        >
                            <i class="icon-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    setupEventListeners() {
        // 検索
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.addEventListener('input', this.debounce((e) => {
                this.currentFilter.search = e.target.value;
                this.applyFilters();
            }, 300));
        }

        // フィルター
        document.addEventListener('change', (e) => {
            if (e.target.id === 'role-filter') {
                this.currentFilter.role = e.target.value;
                this.applyFilters();
            } else if (e.target.id === 'department-filter') {
                this.currentFilter.department = e.target.value;
                this.applyFilters();
            } else if (e.target.id === 'status-filter') {
                this.currentFilter.status = e.target.value;
                this.applyFilters();
            } else if (e.target.id === 'sort-select') {
                const [field, direction] = e.target.value.split('-');
                this.sortConfig.field = field;
                this.sortConfig.direction = direction;
                this.applySorting();
                this.populateUsersList();
            }
        });

        // ボタンクリック
        document.addEventListener('click', (e) => {
            if (e.target.id === 'add-user-btn') {
                this.showAddUserModal();
            } else if (e.target.id === 'refresh-users') {
                this.render();
            } else if (e.target.id === 'clear-filters-btn') {
                this.clearFilters();
            } else if (e.target.classList.contains('view-user-btn')) {
                this.viewUser(e.target.dataset.userId);
            } else if (e.target.classList.contains('edit-user-btn')) {
                this.editUser(e.target.dataset.userId);
            } else if (e.target.classList.contains('delete-user-btn')) {
                this.deleteUser(e.target.dataset.userId);
            }
        });
    }

    applyFilters() {
        this.filteredUsers = this.users.filter(user => {
            // 検索フィルター
            if (this.currentFilter.search) {
                const searchTerm = this.currentFilter.search.toLowerCase();
                const searchableText = [
                    user.name,
                    user.email,
                    user.position
                ].join(' ').toLowerCase();
                
                if (!searchableText.includes(searchTerm)) {
                    return false;
                }
            }

            // 役職フィルター
            if (this.currentFilter.role && user.role !== this.currentFilter.role) {
                return false;
            }

            // 部署フィルター
            if (this.currentFilter.department && user.department !== this.currentFilter.department) {
                return false;
            }

            // ステータスフィルター
            if (this.currentFilter.status && user.status !== this.currentFilter.status) {
                return false;
            }

            return true;
        });

        this.applySorting();
        this.populateUsersList();
    }

    applySorting() {
        this.filteredUsers.sort((a, b) => {
            const field = this.sortConfig.field;
            let aValue = a[field];
            let bValue = b[field];

            // 日付フィールドの特別処理
            if (field.includes('At') || field === 'lastLogin') {
                aValue = new Date(aValue || 0);
                bValue = new Date(bValue || 0);
            }

            // 文字列フィールドの特別処理
            if (typeof aValue === 'string') {
                aValue = aValue.toLowerCase();
                bValue = bValue.toLowerCase();
            }

            let comparison = 0;
            if (aValue < bValue) comparison = -1;
            if (aValue > bValue) comparison = 1;

            return this.sortConfig.direction === 'asc' ? comparison : -comparison;
        });
    }

    clearFilters() {
        this.currentFilter = {
            search: '',
            role: '',
            department: '',
            status: ''
        };

        // UI更新
        document.getElementById('search-input').value = '';
        document.getElementById('role-filter').value = '';
        document.getElementById('department-filter').value = '';
        document.getElementById('status-filter').value = '';

        this.applyFilters();
    }

    showAddUserModal() {
        if (window.notification) {
            window.notification.info('新規ユーザー作成機能は開発中です');
        }
    }

    viewUser(userId) {
        if (window.router) {
            window.router.navigate(`/users/${userId}`);
        }
    }

    editUser(userId) {
        if (window.notification) {
            window.notification.info('ユーザー編集機能は開発中です');
        }
    }

    async deleteUser(userId) {
        const user = this.users.find(u => u.id === userId);
        if (!user) return;

        // 自分自身は削除できない
        if (userId === window.auth?.getCurrentUser()?.id) {
            window.notification?.error('自分自身を削除することはできません');
            return;
        }

        const confirmed = confirm(`${user.name}を削除しますか？\nこの操作は取り消せません。`);
        if (!confirmed) return;

        try {
            if (window.api) {
                await window.api.deleteUser(userId);
            } else {
                // モックモードでは配列から削除
                this.users = this.users.filter(u => u.id !== userId);
            }

            window.notification?.success('ユーザーを削除しました');
            this.applyFilters();

        } catch (error) {
            console.error('User deletion failed:', error);
            window.notification?.error('ユーザーの削除に失敗しました');
        }
    }

    async renderUserDetail(userId) {
        // ユーザー詳細ページ（開発中）
        const mainContent = document.getElementById('main-content');
        if (mainContent) {
            mainContent.innerHTML = `
                <div class="user-detail-page">
                    <h2>👤 ユーザー詳細</h2>
                    <p>ユーザー詳細ページは開発中です。</p>
                    <p>ユーザーID: ${userId}</p>
                    <button onclick="window.router.navigate('/users')" class="btn-primary">
                        ユーザー一覧に戻る
                    </button>
                </div>
            `;
        }
    }

    // ユーティリティメソッド
    getRoleDisplayName(role) {
        const roleNames = {
            admin: '管理者',
            manager: 'マネージャー',
            supervisor: '主任',
            employee: '従業員'
        };
        return roleNames[role] || role;
    }

    getDepartmentDisplayName(department) {
        const departmentNames = {
            construction: '建設部',
            admin: '管理部',
            sales: '営業部'
        };
        return departmentNames[department] || department;
    }

    getStatusDisplayName(status) {
        const statusNames = {
            active: 'アクティブ',
            inactive: '非アクティブ'
        };
        return statusNames[status] || status;
    }

    formatRelativeTime(dateString) {
        if (!dateString) return '';

        const date = new Date(dateString);
        const now = new Date();
        const diffInMinutes = Math.floor((now - date) / (1000 * 60));

        if (diffInMinutes < 1) {
            return 'たった今';
        } else if (diffInMinutes < 60) {
            return `${diffInMinutes}分前`;
        } else if (diffInMinutes < 1440) {
            return `${Math.floor(diffInMinutes / 60)}時間前`;
        } else if (diffInMinutes < 10080) {
            return `${Math.floor(diffInMinutes / 1440)}日前`;
        } else {
            return date.toLocaleDateString('ja-JP');
        }
    }

    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    showLoading() {
        const loadingIndicator = document.getElementById('loading-indicator');
        if (loadingIndicator) {
            loadingIndicator.style.display = 'flex';
        }
    }

    hideLoading() {
        const loadingIndicator = document.getElementById('loading-indicator');
        if (loadingIndicator) {
            loadingIndicator.style.display = 'none';
        }
    }

    showError(message) {
        const mainContent = document.getElementById('main-content');
        if (mainContent) {
            mainContent.innerHTML = `
                <div class="error-page">
                    <div class="error-icon">
                        <i class="icon-alert-circle"></i>
                    </div>
                    <h2>エラー</h2>
                    <p>${message}</p>
                    <button onclick="window.users.render()" class="btn-primary">
                        再試行
                    </button>
                </div>
            `;
        }
    }

    // デバッグ用
    debug() {
        return {
            users: this.users.length,
            filteredUsers: this.filteredUsers.length,
            currentFilter: this.currentFilter,
            sortConfig: this.sortConfig
        };
    }
}

// グローバルインスタンス
window.users = new UsersController();
