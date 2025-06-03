/**
 * ユーザー管理ページコントローラー
 * 管理者・マネージャー向けのユーザー管理機能
 */
class UsersController {
    constructor() {
        this.users = [];
        this.filteredUsers = [];
        this.currentFilter = {
            search: '',
            role: '',
            status: '',
            department: ''
        };
        this.sortConfig = {
            field: 'name',
            direction: 'asc'
        };
        this.pagination = {
            currentPage: 1,
            itemsPerPage: 10,
            totalItems: 0
        };
        this.selectedUsers = new Set();
        
        this.createPageStructure();
        this.bindEvents();
    }

    createPageStructure() {
        const mainContent = document.getElementById('main-content');
        if (!mainContent) return;

        mainContent.innerHTML = `
            <div class="users-page">
                <div class="page-header">
                    <div class="header-content">
                        <h1>ユーザー管理</h1>
                        <div class="header-actions">
                            <button class="btn-primary" id="add-user-btn">
                                <i class="icon-plus"></i>
                                新規ユーザー
                            </button>
                            <button class="btn-secondary" id="bulk-actions-btn" style="display: none;">
                                <i class="icon-settings"></i>
                                一括操作
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
                            placeholder="名前、メール、部署で検索..."
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
                            <option value="staff">一般社員</option>
                        </select>
                        
                        <select id="status-filter" class="filter-select">
                            <option value="">すべてのステータス</option>
                            <option value="active">有効</option>
                            <option value="inactive">無効</option>
                            <option value="pending">承認待ち</option>
                        </select>
                        
                        <select id="department-filter" class="filter-select">
                            <option value="">すべての部署</option>
                            <option value="construction">工事部</option>
                            <option value="sales">営業部</option>
                            <option value="admin">管理部</option>
                            <option value="quality">品質管理部</option>
                        </select>
                        
                        <button id="clear-filters-btn" class="btn-text">
                            フィルタークリア
                        </button>
                    </div>
                </div>

                <!-- ユーザー一覧テーブル -->
                <div class="table-container">
                    <table class="users-table">
                        <thead>
                            <tr>
                                <th class="checkbox-column">
                                    <input type="checkbox" id="select-all-checkbox">
                                </th>
                                <th class="sortable" data-field="name">
                                    名前
                                    <i class="sort-icon"></i>
                                </th>
                                <th class="sortable" data-field="email">
                                    メールアドレス
                                    <i class="sort-icon"></i>
                                </th>
                                <th class="sortable" data-field="role">
                                    役職
                                    <i class="sort-icon"></i>
                                </th>
                                <th class="sortable" data-field="department">
                                    部署
                                    <i class="sort-icon"></i>
                                </th>
                                <th class="sortable" data-field="status">
                                    ステータス
                                    <i class="sort-icon"></i>
                                </th>
                                <th class="sortable" data-field="lastLogin">
                                    最終ログイン
                                    <i class="sort-icon"></i>
                                </th>
                                <th class="actions-column">操作</th>
                            </tr>
                        </thead>
                        <tbody id="users-table-body">
                            <!-- 動的に生成 -->
                        </tbody>
                    </table>
                </div>

                <!-- ペジネーション -->
                <div class="pagination-container">
                    <div class="pagination-info">
                        <span id="pagination-info-text"></span>
                    </div>
                    <div class="pagination-controls">
                        <button id="prev-page-btn" class="pagination-btn" disabled>
                            <i class="icon-chevron-left"></i>
                        </button>
                        <div id="page-numbers" class="page-numbers">
                            <!-- 動的に生成 -->
                        </div>
                        <button id="next-page-btn" class="pagination-btn" disabled>
                            <i class="icon-chevron-right"></i>
                        </button>
                    </div>
                    <div class="items-per-page">
                        <select id="items-per-page-select">
                            <option value="10">10件表示</option>
                            <option value="25">25件表示</option>
                            <option value="50">50件表示</option>
                            <option value="100">100件表示</option>
                        </select>
                    </div>
                </div>

                <!-- ローディング表示 -->
                <div id="users-loading" class="loading-overlay" style="display: none;">
                    <div class="loading-spinner"></div>
                    <div class="loading-text">読み込み中...</div>
                </div>

                <!-- 空の状態 -->
                <div id="empty-state" class="empty-state" style="display: none;">
                    <div class="empty-icon">
                        <i class="icon-users"></i>
                    </div>
                    <h3>ユーザーがいません</h3>
                    <p>新しいユーザーを追加してください。</p>
                    <button class="btn-primary" onclick="document.getElementById('add-user-btn').click()">
                        最初のユーザーを追加
                    </button>
                </div>
            </div>

            <!-- ユーザー編集モーダル -->
            <div id="user-modal" class="modal" style="display: none;">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2 id="user-modal-title">新規ユーザー</h2>
                        <button class="modal-close" id="user-modal-close">
                            <i class="icon-x"></i>
                        </button>
                    </div>
                    
                    <form id="user-form" class="modal-form">
                        <div class="form-section">
                            <h3>基本情報</h3>
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="user-name">氏名 <span class="required">*</span></label>
                                    <input type="text" id="user-name" name="name" required>
                                    <div class="error-message" id="name-error"></div>
                                </div>
                                <div class="form-group">
                                    <label for="user-email">メールアドレス <span class="required">*</span></label>
                                    <input type="email" id="user-email" name="email" required>
                                    <div class="error-message" id="email-error"></div>
                                </div>
                            </div>
                            
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="user-role">役職 <span class="required">*</span></label>
                                    <select id="user-role" name="role" required>
                                        <option value="">選択してください</option>
                                        <option value="admin">管理者</option>
                                        <option value="manager">マネージャー</option>
                                        <option value="supervisor">主任</option>
                                        <option value="staff">一般社員</option>
                                    </select>
                                    <div class="error-message" id="role-error"></div>
                                </div>
                                <div class="form-group">
                                    <label for="user-department">部署 <span class="required">*</span></label>
                                    <select id="user-department" name="department" required>
                                        <option value="">選択してください</option>
                                        <option value="construction">工事部</option>
                                        <option value="sales">営業部</option>
                                        <option value="admin">管理部</option>
                                        <option value="quality">品質管理部</option>
                                    </select>
                                    <div class="error-message" id="department-error"></div>
                                </div>
                            </div>
                        </div>

                        <div class="form-section">
                            <h3>権限設定</h3>
                            <div class="form-group">
                                <label for="user-status">ステータス</label>
                                <select id="user-status" name="status">
                                    <option value="active">有効</option>
                                    <option value="inactive">無効</option>
                                    <option value="pending">承認待ち</option>
                                </select>
                            </div>
                            
                            <div class="form-group">
                                <label>権限</label>
                                <div class="checkbox-group">
                                    <label class="checkbox-item">
                                        <input type="checkbox" name="permissions" value="evaluate">
                                        <span class="checkmark"></span>
                                        評価実施
                                    </label>
                                    <label class="checkbox-item">
                                        <input type="checkbox" name="permissions" value="manage_subordinates">
                                        <span class="checkmark"></span>
                                        部下管理
                                    </label>
                                    <label class="checkbox-item">
                                        <input type="checkbox" name="permissions" value="view_reports">
                                        <span class="checkmark"></span>
                                        レポート閲覧
                                    </label>
                                    <label class="checkbox-item">
                                        <input type="checkbox" name="permissions" value="manage_users">
                                        <span class="checkmark"></span>
                                        ユーザー管理
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div class="form-section" id="password-section">
                            <h3>パスワード設定</h3>
                            <div class="form-group">
                                <label for="user-password">パスワード <span class="required">*</span></label>
                                <input type="password" id="user-password" name="password">
                                <div class="form-help">8文字以上の英数字を入力してください</div>
                                <div class="error-message" id="password-error"></div>
                            </div>
                        </div>
                    </form>

                    <div class="modal-footer">
                        <button type="button" class="btn-secondary" id="user-cancel-btn">
                            キャンセル
                        </button>
                        <button type="submit" form="user-form" class="btn-primary" id="user-save-btn">
                            保存
                        </button>
                    </div>
                </div>
            </div>

            <!-- 一括操作モーダル -->
            <div id="bulk-actions-modal" class="modal" style="display: none;">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2>一括操作</h2>
                        <button class="modal-close" id="bulk-modal-close">
                            <i class="icon-x"></i>
                        </button>
                    </div>
                    
                    <div class="modal-body">
                        <p><span id="selected-count">0</span>人のユーザーが選択されています。</p>
                        
                        <div class="bulk-actions">
                            <button class="bulk-action-btn" data-action="activate">
                                <i class="icon-check"></i>
                                有効化
                            </button>
                            <button class="bulk-action-btn" data-action="deactivate">
                                <i class="icon-x"></i>
                                無効化
                            </button>
                            <button class="bulk-action-btn" data-action="delete">
                                <i class="icon-trash"></i>
                                削除
                            </button>
                            <button class="bulk-action-btn" data-action="export">
                                <i class="icon-download"></i>
                                CSVエクスポート
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    bindEvents() {
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
            } else if (e.target.id === 'status-filter') {
                this.currentFilter.status = e.target.value;
                this.applyFilters();
            } else if (e.target.id === 'department-filter') {
                this.currentFilter.department = e.target.value;
                this.applyFilters();
            } else if (e.target.id === 'items-per-page-select') {
                this.pagination.itemsPerPage = parseInt(e.target.value);
                this.pagination.currentPage = 1;
                this.renderTable();
            }
        });

        // ボタンクリック
        document.addEventListener('click', (e) => {
            if (e.target.id === 'add-user-btn') {
                this.openUserModal();
            } else if (e.target.id === 'clear-filters-btn') {
                this.clearFilters();
            } else if (e.target.id === 'bulk-actions-btn') {
                this.openBulkActionsModal();
            } else if (e.target.classList.contains('edit-user-btn')) {
                this.editUser(e.target.dataset.userId);
            } else if (e.target.classList.contains('delete-user-btn')) {
                this.deleteUser(e.target.dataset.userId);
            } else if (e.target.classList.contains('sortable')) {
                this.handleSort(e.target.dataset.field);
            } else if (e.target.classList.contains('page-number')) {
                this.goToPage(parseInt(e.target.dataset.page));
            } else if (e.target.id === 'prev-page-btn') {
                this.goToPage(this.pagination.currentPage - 1);
            } else if (e.target.id === 'next-page-btn') {
                this.goToPage(this.pagination.currentPage + 1);
            } else if (e.target.classList.contains('bulk-action-btn')) {
                this.executeBulkAction(e.target.dataset.action);
            }
        });

        // チェックボックス
        document.addEventListener('change', (e) => {
            if (e.target.id === 'select-all-checkbox') {
                this.toggleSelectAll(e.target.checked);
            } else if (e.target.classList.contains('user-checkbox')) {
                this.toggleUserSelection(e.target.dataset.userId, e.target.checked);
            }
        });

        // モーダル関連
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-close') || 
                e.target.id === 'user-cancel-btn' ||
                e.target.id === 'bulk-modal-close') {
                this.closeModals();
            }
        });

        // フォーム送信
        const userForm = document.getElementById('user-form');
        if (userForm) {
            userForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveUser();
            });
        }
    }

    async render() {
        this.showLoading();
        try {
            await this.loadUsers();
            this.applyFilters();
        } catch (error) {
            console.error('ユーザー一覧の読み込みに失敗:', error);
            window.notification.show('ユーザー一覧の読み込みに失敗しました', 'error');
        } finally {
            this.hideLoading();
        }
    }

    async loadUsers() {
        try {
            this.users = await window.api.getUsers();
        } catch (error) {
            console.error('ユーザーデータの取得に失敗:', error);
            this.users = [];
            throw error;
        }
    }

    applyFilters() {
        this.filteredUsers = this.users.filter(user => {
            // 検索フィルター
            if (this.currentFilter.search) {
                const searchTerm = this.currentFilter.search.toLowerCase();
                const matchesSearch = 
                    user.name.toLowerCase().includes(searchTerm) ||
                    user.email.toLowerCase().includes(searchTerm) ||
                    user.department.toLowerCase().includes(searchTerm);
                if (!matchesSearch) return false;
            }

            // 役職フィルター
            if (this.currentFilter.role && user.role !== this.currentFilter.role) {
                return false;
            }

            // ステータスフィルター
            if (this.currentFilter.status && user.status !== this.currentFilter.status) {
                return false;
            }

            // 部署フィルター
            if (this.currentFilter.department && user.department !== this.currentFilter.department) {
                return false;
            }

            return true;
        });

        this.applySorting();
        this.pagination.currentPage = 1;
        this.pagination.totalItems = this.filteredUsers.length;
        this.renderTable();
    }

    applySorting() {
        this.filteredUsers.sort((a, b) => {
            const field = this.sortConfig.field;
            let aValue = a[field] || '';
            let bValue = b[field] || '';

            // 日付フィールドの特別処理
            if (field === 'lastLogin') {
                aValue = new Date(aValue || 0);
                bValue = new Date(bValue || 0);
            }

            if (aValue < bValue) {
                return this.sortConfig.direction === 'asc' ? -1 : 1;
            }
            if (aValue > bValue) {
                return this.sortConfig.direction === 'asc' ? 1 : -1;
            }
            return 0;
        });
    }

    renderTable() {
        const tbody = document.getElementById('users-table-body');
        const emptyState = document.getElementById('empty-state');
        
        if (!tbody) return;

        // ページネーション計算
        const startIndex = (this.pagination.currentPage - 1) * this.pagination.itemsPerPage;
        const endIndex = startIndex + this.pagination.itemsPerPage;
        const pageUsers = this.filteredUsers.slice(startIndex, endIndex);

        if (this.filteredUsers.length === 0) {
            tbody.innerHTML = '';
            if (emptyState) emptyState.style.display = 'block';
            return;
        }

        if (emptyState) emptyState.style.display = 'none';

        tbody.innerHTML = pageUsers.map(user => `
            <tr class="user-row" data-user-id="${user.id}">
                <td class="checkbox-cell">
                    <input 
                        type="checkbox" 
                        class="user-checkbox" 
                        data-user-id="${user.id}"
                        ${this.selectedUsers.has(user.id) ? 'checked' : ''}
                    >
                </td>
                <td class="user-name">
                    <div class="user-info">
                        <div class="user-avatar">
                            ${user.name.charAt(0).toUpperCase()}
                        </div>
                        <div class="user-details">
                            <div class="name">${this.escapeHtml(user.name)}</div>
                            <div class="employee-id">${user.employeeId || ''}</div>
                        </div>
                    </div>
                </td>
                <td class="user-email">${this.escapeHtml(user.email)}</td>
                <td class="user-role">
                    <span class="role-badge role-${user.role}">
                        ${this.getRoleDisplayName(user.role)}
                    </span>
                </td>
                <td class="user-department">
                    ${this.getDepartmentDisplayName(user.department)}
                </td>
                <td class="user-status">
                    <span class="status-badge status-${user.status}">
                        ${this.getStatusDisplayName(user.status)}
                    </span>
                </td>
                <td class="user-last-login">
                    ${user.lastLogin ? this.formatDate(user.lastLogin) : '未ログイン'}
                </td>
                <td class="user-actions">
                    <div class="action-buttons">
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
                            ${user.role === 'admin' ? 'disabled' : ''}
                        >
                            <i class="icon-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');

        this.updateSortIndicators();
        this.renderPagination();
        this.updateBulkActionsButton();
    }

    updateSortIndicators() {
        const sortableHeaders = document.querySelectorAll('.sortable');
        sortableHeaders.forEach(header => {
            const sortIcon = header.querySelector('.sort-icon');
            if (header.dataset.field === this.sortConfig.field) {
                sortIcon.className = `sort-icon icon-chevron-${this.sortConfig.direction === 'asc' ? 'up' : 'down'}`;
                header.classList.add('sorted');
            } else {
                sortIcon.className = 'sort-icon';
                header.classList.remove('sorted');
            }
        });
    }

    renderPagination() {
        const totalPages = Math.ceil(this.pagination.totalItems / this.pagination.itemsPerPage);
        const currentPage = this.pagination.currentPage;

        // 情報表示
        const infoText = document.getElementById('pagination-info-text');
        if (infoText) {
            const startItem = (currentPage - 1) * this.pagination.itemsPerPage + 1;
            const endItem = Math.min(currentPage * this.pagination.itemsPerPage, this.pagination.totalItems);
            infoText.textContent = `${startItem}-${endItem} / ${this.pagination.totalItems}件`;
        }

        // ページ番号ボタン
        const pageNumbers = document.getElementById('page-numbers');
        if (pageNumbers) {
            const pages = this.generatePageNumbers(currentPage, totalPages);
            pageNumbers.innerHTML = pages.map(page => {
                if (page === '...') {
                    return '<span class="page-ellipsis">...</span>';
                }
                return `
                    <button 
                        class="page-number ${page === currentPage ? 'current' : ''}"
                        data-page="${page}"
                    >
                        ${page}
                    </button>
                `;
            }).join('');
        }

        // 前後ボタン
        const prevBtn = document.getElementById('prev-page-btn');
        const nextBtn = document.getElementById('next-page-btn');
        if (prevBtn) prevBtn.disabled = currentPage <= 1;
        if (nextBtn) nextBtn.disabled = currentPage >= totalPages;
    }

    generatePageNumbers(current, total) {
        const pages = [];
        const delta = 2; // 現在ページの前後に表示するページ数

        if (total <= 7) {
            // 総ページ数が少ない場合は全て表示
            for (let i = 1; i <= total; i++) {
                pages.push(i);
            }
        } else {
            // 最初のページ
            pages.push(1);

            // 開始位置
            const start = Math.max(2, current - delta);
            const end = Math.min(total - 1, current + delta);

            // 省略記号（前）
            if (start > 2) {
                pages.push('...');
            }

            // 中間ページ
            for (let i = start; i <= end; i++) {
                pages.push(i);
            }

            // 省略記号（後）
            if (end < total - 1) {
                pages.push('...');
            }

            // 最後のページ
            if (total > 1) {
                pages.push(total);
            }
        }

        return pages;
    }

    handleSort(field) {
        if (this.sortConfig.field === field) {
            this.sortConfig.direction = this.sortConfig.direction === 'asc' ? 'desc' : 'asc';
        } else {
            this.sortConfig.field = field;
            this.sortConfig.direction = 'asc';
        }

        this.applySorting();
        this.renderTable();
    }

    goToPage(page) {
        const totalPages = Math.ceil(this.pagination.totalItems / this.pagination.itemsPerPage);
        if (page >= 1 && page <= totalPages) {
            this.pagination.currentPage = page;
            this.renderTable();
        }
    }

    toggleSelectAll(checked) {
        const checkboxes = document.querySelectorAll('.user-checkbox');
        checkboxes.forEach(checkbox => {
            checkbox.checked = checked;
            this.toggleUserSelection(checkbox.dataset.userId, checked);
        });
    }

    toggleUserSelection(userId, selected) {
        if (selected) {
            this.selectedUsers.add(userId);
        } else {
            this.selectedUsers.delete(userId);
        }
        this.updateBulkActionsButton();
    }

    updateBulkActionsButton() {
        const bulkBtn = document.getElementById('bulk-actions-btn');
        if (bulkBtn) {
            if (this.selectedUsers.size > 0) {
                bulkBtn.style.display = 'inline-flex';
                bulkBtn.textContent = `${this.selectedUsers.size}件選択中`;
            } else {
                bulkBtn.style.display = 'none';
            }
        }

        // 全選択チェックボックスの状態更新
        const selectAllCheckbox = document.getElementById('select-all-checkbox');
        if (selectAllCheckbox) {
            const visibleUsers = document.querySelectorAll('.user-checkbox');
            const selectedVisible = Array.from(visibleUsers).filter(cb => cb.checked).length;
            
            selectAllCheckbox.checked = visibleUsers.length > 0 && selectedVisible === visibleUsers.length;
            selectAllCheckbox.indeterminate = selectedVisible > 0 && selectedVisible < visibleUsers.length;
        }
    }

    clearFilters() {
        this.currentFilter = {
            search: '',
            role: '',
            status: '',
            department: ''
        };

        // UI更新
        document.getElementById('search-input').value = '';
        document.getElementById('role-filter').value = '';
        document.getElementById('status-filter').value = '';
        document.getElementById('department-filter').value = '';

        this.applyFilters();
    }

    openUserModal(user = null) {
        const modal = document.getElementById('user-modal');
        const title = document.getElementById('user-modal-title');
        const form = document.getElementById('user-form');
        const passwordSection = document.getElementById('password-section');
        
        if (!modal || !form) return;

        this.clearFormErrors();
        
        if (user) {
            // 編集モード
            title.textContent = 'ユーザー編集';
            this.populateUserForm(user);
            passwordSection.style.display = 'none';
            this.currentEditingUser = user;
        } else {
            // 新規作成モード
            title.textContent = '新規ユーザー';
            form.reset();
            passwordSection.style.display = 'block';
            this.currentEditingUser = null;
        }

        modal.style.display = 'flex';
    }

    populateUserForm(user) {
        document.getElementById('user-name').value = user.name;
        document.getElementById('user-email').value = user.email;
        document.getElementById('user-role').value = user.role;
        document.getElementById('user-department').value = user.department;
        document.getElementById('user-status').value = user.status;

        // 権限チェックボックス
        const permissionCheckboxes = document.querySelectorAll('input[name="permissions"]');
        permissionCheckboxes.forEach(checkbox => {
            checkbox.checked = user.permissions?.includes(checkbox.value) || false;
        });
    }

    async saveUser() {
        this.clearFormErrors();
        
        const formData = this.collectFormData();
        if (!this.validateUserForm(formData)) {
            return;
        }

        try {
            if (this.currentEditingUser) {
                await window.api.updateUser(this.currentEditingUser.id, formData);
                window.notification.show('ユーザーを更新しました', 'success');
            } else {
                await window.api.createUser(formData);
                window.notification.show('ユーザーを作成しました', 'success');
            }

            this.closeModals();
            await this.loadUsers();
            this.applyFilters();

        } catch (error) {
            console.error('ユーザーの保存に失敗:', error);
            window.notification.show('ユーザーの保存に失敗しました', 'error');
        }
    }

    collectFormData() {
        const form = document.getElementById('user-form');
        const formData = new FormData(form);
        
        // 権限の収集
        const permissions = Array.from(document.querySelectorAll('input[name="permissions"]:checked'))
            .map(checkbox => checkbox.value);

        return {
            name: formData.get('name'),
            email: formData.get('email'),
            role: formData.get('role'),
            department: formData.get('department'),
            status: formData.get('status'),
            password: formData.get('password'),
            permissions
        };
    }

    validateUserForm(data) {
        let isValid = true;

        // 必須フィールドチェック
        if (!data.name?.trim()) {
            this.showFieldError('name', '氏名は必須です');
            isValid = false;
        }

        if (!data.email?.trim()) {
            this.showFieldError('email', 'メールアドレスは必須です');
            isValid = false;
        } else if (!this.isValidEmail(data.email)) {
            this.showFieldError('email', '正しいメールアドレスを入力してください');
            isValid = false;
        }

        if (!data.role) {
            this.showFieldError('role', '役職を選択してください');
            isValid = false;
        }

        if (!data.department) {
            this.showFieldError('department', '部署を選択してください');
            isValid = false;
        }

        // 新規作成時のパスワードチェック
        if (!this.currentEditingUser) {
            if (!data.password?.trim()) {
                this.showFieldError('password', 'パスワードは必須です');
                isValid = false;
            } else if (data.password.length < 8) {
                this.showFieldError('password', 'パスワードは8文字以上で入力してください');
                isValid = false;
            }
        }

        return isValid;
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    showFieldError(fieldName, message) {
        const errorElement = document.getElementById(`${fieldName}-error`);
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
        }
    }

    clearFormErrors() {
        const errorElements = document.querySelectorAll('.error-message');
        errorElements.forEach(element => {
            element.textContent = '';
            element.style.display = 'none';
        });
    }

    async editUser(userId) {
        const user = this.users.find(u => u.id === userId);
        if (user) {
            this.openUserModal(user);
        }
    }

    async deleteUser(userId) {
        const user = this.users.find(u => u.id === userId);
        if (!user) return;

        if (user.role === 'admin') {
            window.notification.show('管理者ユーザーは削除できません', 'error');
            return;
        }

        const confirmed = confirm(`${user.name}を削除しますか？\nこの操作は取り消せません。`);
        if (!confirmed) return;

        try {
            await window.api.deleteUser(userId);
            window.notification.show('ユーザーを削除しました', 'success');
            
            await this.loadUsers();
            this.applyFilters();
            this.selectedUsers.delete(userId);

        } catch (error) {
            console.error('ユーザーの削除に失敗:', error);
            window.notification.show('ユーザーの削除に失敗しました', 'error');
        }
    }

    openBulkActionsModal() {
        const modal = document.getElementById('bulk-actions-modal');
        const countElement = document.getElementById('selected-count');
        
        if (modal && countElement) {
            countElement.textContent = this.selectedUsers.size;
            modal.style.display = 'flex';
        }
    }

    async executeBulkAction(action) {
        const selectedIds = Array.from(this.selectedUsers);
        if (selectedIds.length === 0) return;

        let confirmed = true;
        let message = '';

        switch (action) {
            case 'activate':
                message = `${selectedIds.length}人のユーザーを有効化しますか？`;
                break;
            case 'deactivate':
                message = `${selectedIds.length}人のユーザーを無効化しますか？`;
                break;
            case 'delete':
                message = `${selectedIds.length}人のユーザーを削除しますか？\nこの操作は取り消せません。`;
                break;
            case 'export':
                this.exportSelectedUsers(selectedIds);
                this.closeModals();
                return;
        }

        confirmed = confirm(message);
        if (!confirmed) return;

        try {
            switch (action) {
                case 'activate':
                    await window.api.bulkUpdateUsers(selectedIds, { status: 'active' });
                    window.notification.show('ユーザーを有効化しました', 'success');
                    break;
                case 'deactivate':
                    await window.api.bulkUpdateUsers(selectedIds, { status: 'inactive' });
                    window.notification.show('ユーザーを無効化しました', 'success');
                    break;
                case 'delete':
                    await window.api.bulkDeleteUsers(selectedIds);
                    window.notification.show('ユーザーを削除しました', 'success');
                    break;
            }

            this.selectedUsers.clear();
            this.closeModals();
            await this.loadUsers();
            this.applyFilters();

        } catch (error) {
            console.error('一括操作に失敗:', error);
            window.notification.show('一括操作に失敗しました', 'error');
        }
    }

    exportSelectedUsers(userIds) {
        const selectedUsers = this.users.filter(user => userIds.includes(user.id));
        const csvData = this.generateCSV(selectedUsers);
        this.downloadCSV(csvData, 'selected_users.csv');
        window.notification.show('CSVファイルをダウンロードしました', 'success');
    }

    generateCSV(users) {
        const headers = ['氏名', 'メールアドレス', '役職', '部署', 'ステータス', '最終ログイン'];
        const rows = users.map(user => [
            user.name,
            user.email,
            this.getRoleDisplayName(user.role),
            this.getDepartmentDisplayName(user.department),
            this.getStatusDisplayName(user.status),
            user.lastLogin ? this.formatDate(user.lastLogin) : '未ログイン'
        ]);

        return [headers, ...rows]
            .map(row => row.map(cell => `"${cell}"`).join(','))
            .join('\n');
    }

    downloadCSV(csvData, filename) {
        const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.click();
        URL.revokeObjectURL(link.href);
    }

    closeModals() {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            modal.style.display = 'none';
        });
        this.currentEditingUser = null;
    }

    showLoading() {
        const loading = document.getElementById('users-loading');
        if (loading) loading.style.display = 'flex';
    }

    hideLoading() {
        const loading = document.getElementById('users-loading');
        if (loading) loading.style.display = 'none';
    }

    // ユーティリティメソッド
    getRoleDisplayName(role) {
        const roleNames = {
            admin: '管理者',
            manager: 'マネージャー',
            supervisor: '主任',
            staff: '一般社員'
        };
        return roleNames[role] || role;
    }

    getDepartmentDisplayName(department) {
        const departmentNames = {
            construction: '工事部',
            sales: '営業部',
            admin: '管理部',
            quality: '品質管理部'
        };
        return departmentNames[department] || department;
    }

    getStatusDisplayName(status) {
        const statusNames = {
            active: '有効',
            inactive: '無効',
            pending: '承認待ち'
        };
        return statusNames[status] || status;
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('ja-JP', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    escapeHtml(text) {
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
}

// グローバルインスタンス
window.users = new UsersController();
