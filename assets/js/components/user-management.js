/**
 * ユーザー管理コンポーネント
 * ユーザーのCRUD操作と関係管理
 */

/**
 * ユーザー管理クラス
 */
class UserManagementComponent {
    constructor(apiClient, authManager) {
        this.api = apiClient || window.app.api;
        this.auth = authManager || window.app.auth;
        this.database = window.app.database;
        this.currentUser = null;
        this.currentTenant = null;
        this.users = [];
        this.isLoading = false;
        
        // DOM要素のキャッシュ
        this.elements = {
            usersTable: null,
            userModal: null,
            userForm: null,
            userId: null,
            userName: null,
            userEmail: null,
            userRole: null,
            userPosition: null,
            userEvaluator: null,
            searchInput: null,
            roleFilter: null,
            addUserBtn: null
        };
        
        // フォームモード（'create' or 'edit'）
        this.currentMode = 'create';
        this.currentUserId = null;
        
        console.log('ユーザー管理コンポーネントが初期化されました');
    }

    /**
     * ユーザー管理の初期化
     */
    async initialize() {
        try {
            console.log('ユーザー管理を初期化中...');
            
            // 認証状態と企業情報の取得
            this.currentUser = this.auth.getCurrentUser();
            this.currentTenant = window.getCurrentTenant ? window.getCurrentTenant() : null;
            
            if (!this.currentUser) {
                throw new Error('ユーザーが認証されていません');
            }
            
            // 管理者権限の確認
            if (!this.auth.hasRole('admin')) {
                throw new Error('ユーザー管理の権限がありません');
            }
            
            // DOM要素を取得
            this.cacheElements();
            
            // イベントリスナーの設定
            this.setupEventListeners();
            
            // ユーザー一覧を読み込み
            await this.loadUsers();
            
            // 評価者選択肢を初期化
            this.updateEvaluatorOptions();
            
            console.log('ユーザー管理の初期化が完了しました');
        } catch (error) {
            console.error('ユーザー管理初期化エラー:', error);
            this.showErrorMessage('ユーザー管理の初期化に失敗しました');
        }
    }

    /**
     * DOM要素をキャッシュ
     */
    cacheElements() {
        this.elements = {
            usersTable: document.getElementById('usersTable'),
            userModal: document.getElementById('userModal'),
            userForm: document.getElementById('userForm'),
            userId: document.getElementById('userId'),
            userName: document.getElementById('userName'),
            userEmail: document.getElementById('userEmail'),
            userRole: document.getElementById('userRole'),
            userPosition: document.getElementById('userPosition'),
            userEvaluator: document.getElementById('userEvaluator'),
            searchInput: document.getElementById('userSearchInput'),
            roleFilter: document.getElementById('userRoleFilter'),
            addUserBtn: document.querySelector('.btn[onclick*="userManagement.showUserModal"]')
        };
    }

    /**
     * ユーザー一覧を読み込み
     */
    async loadUsers() {
        if (!this.elements.usersTable) return;

        try {
            this.isLoading = true;
            this.showLoadingState();

            // ユーザーデータを取得
            this.users = await this.getAllUsers();
            
            // フィルターを適用
            const filteredUsers = this.applyFilters(this.users);
            
            // テーブルを更新
            this.renderUsersTable(filteredUsers);
            
        } catch (error) {
            console.error('ユーザー一覧読み込みエラー:', error);
            this.showErrorMessage('ユーザー一覧の読み込みに失敗しました');
        } finally {
            this.isLoading = false;
        }
    }

    /**
     * 全ユーザーを取得
     */
    async getAllUsers() {
        // モックデータから取得
        if (window.evaluationConfig && window.evaluationConfig.mockData) {
            return window.evaluationConfig.mockData.users.map(user => ({
                ...user,
                status: 'active',
                createdAt: new Date().toISOString(),
                lastLogin: new Date().toISOString()
            }));
        }

        // データベースから取得
        if (this.database) {
            try {
                return await this.database.getAll('users');
            } catch (error) {
                console.error('データベースユーザー取得エラー:', error);
            }
        }

        return [];
    }

    /**
     * フィルターを適用
     */
    applyFilters(users) {
        let filtered = [...users];

        // 検索フィルター
        const searchTerm = this.elements.searchInput?.value.toLowerCase() || '';
        if (searchTerm) {
            filtered = filtered.filter(user => 
                user.full_name.toLowerCase().includes(searchTerm) ||
                user.email.toLowerCase().includes(searchTerm) ||
                user.username.toLowerCase().includes(searchTerm)
            );
        }

        // 役割フィルター
        const roleFilter = this.elements.roleFilter?.value || '';
        if (roleFilter) {
            filtered = filtered.filter(user => user.role === roleFilter);
        }

        return filtered;
    }

    /**
     * ユーザーテーブルをレンダリング
     */
    renderUsersTable(users) {
        if (!this.elements.usersTable) return;

        if (users.length === 0) {
            this.elements.usersTable.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center text-muted py-4">
                        <i class="fas fa-users fs-1 d-block mb-2 opacity-25"></i>
                        ${this.isLoading ? 'ユーザーを読み込み中...' : 'ユーザーが見つかりません'}
                    </td>
                </tr>
            `;
            return;
        }

        const rows = users.map(user => {
            const statusBadge = this.getStatusBadge(user.status);
            const roleBadge = this.getRoleBadge(user.role);
            const evaluatorName = user.evaluator_name || '-';
            const lastLogin = user.lastLogin ? this.formatDateTime(user.lastLogin) : '未ログイン';
            
            return `
                <tr>
                    <td>
                        <div class="d-flex align-items-center">
                            <div class="user-avatar me-2">
                                <i class="fas fa-user-circle fs-4 text-secondary"></i>
                            </div>
                            <div>
                                <div class="fw-bold">${user.full_name}</div>
                                <small class="text-muted">@${user.username}</small>
                            </div>
                        </div>
                    </td>
                    <td>${user.email}</td>
                    <td>${roleBadge}</td>
                    <td>${user.position || '-'}</td>
                    <td>${evaluatorName}</td>
                    <td>${statusBadge}</td>
                    <td>
                        <div class="btn-group btn-group-sm" role="group">
                            <button class="btn btn-outline-primary edit-user-btn" 
                                    data-user-id="${user.id}"
                                    title="編集">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-outline-info view-user-btn" 
                                    data-user-id="${user.id}"
                                    title="詳細">
                                <i class="fas fa-eye"></i>
                            </button>
                            ${user.id !== this.currentUser.id ? `
                                <button class="btn btn-outline-danger delete-user-btn" 
                                        data-user-id="${user.id}"
                                        data-user-name="${user.full_name}"
                                        title="削除">
                                    <i class="fas fa-trash"></i>
                                </button>
                            ` : ''}
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
        
        this.elements.usersTable.innerHTML = rows;
    }

    /**
     * ロードイン状態を表示
     */
    showLoadingState() {
        if (this.elements.usersTable) {
            this.elements.usersTable.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center py-4">
                        <div class="spinner-border text-primary" role="status">
                            <span class="visually-hidden">読み込み中...</span>
                        </div>
                        <div class="mt-2">ユーザーを読み込み中...</div>
                    </td>
                </tr>
            `;
        }
    }

    /**
     * イベントリスナーを設定
     */
    setupEventListeners() {
        // 検索入力
        if (this.elements.searchInput) {
            this.elements.searchInput.addEventListener('input', this.debounce(() => {
                this.loadUsers();
            }, 300));
        }

        // 役割フィルター
        if (this.elements.roleFilter) {
            this.elements.roleFilter.addEventListener('change', () => {
                this.loadUsers();
            });
        }

        // テーブルのボタンイベント
        document.addEventListener('click', (event) => {
            if (event.target.closest('.edit-user-btn')) {
                const userId = event.target.closest('.edit-user-btn')
                    .getAttribute('data-user-id');
                this.editUser(userId);
            }
            
            if (event.target.closest('.view-user-btn')) {
                const userId = event.target.closest('.view-user-btn')
                    .getAttribute('data-user-id');
                this.viewUser(userId);
            }
            
            if (event.target.closest('.delete-user-btn')) {
                const userId = event.target.closest('.delete-user-btn')
                    .getAttribute('data-user-id');
                const userName = event.target.closest('.delete-user-btn')
                    .getAttribute('data-user-name');
                this.deleteUser(userId, userName);
            }
        });

        // モーダル関連のイベント
        if (this.elements.userModal) {
            this.elements.userModal.addEventListener('hidden.bs.modal', () => {
                this.resetForm();
            });
        }

        // 役割変更時の評価者フィールド制御
        if (this.elements.userRole) {
            this.elements.userRole.addEventListener('change', () => {
                this.updateEvaluatorField();
            });
        }

        // フォーム送信
        if (this.elements.userForm) {
            this.elements.userForm.addEventListener('submit', (event) => {
                event.preventDefault();
                this.saveUser();
            });
        }
    }

    /**
     * ユーザーモーダルを表示
     */
    showUserModal(userId = null) {
        this.currentMode = userId ? 'edit' : 'create';
        this.currentUserId = userId;

        // モーダルタイトルを更新
        const modalTitle = document.getElementById('userModalLabel');
        if (modalTitle) {
            modalTitle.textContent = this.currentMode === 'edit' ? 'ユーザー編集' : 'ユーザー追加';
        }

        // フォームデータを設定
        if (userId) {
            this.loadUserData(userId);
        } else {
            this.resetForm();
        }

        // モーダルを表示
        const modal = new bootstrap.Modal(this.elements.userModal);
        modal.show();
    }

    /**
     * ユーザーデータを読み込み
     */
    async loadUserData(userId) {
        try {
            const user = this.users.find(u => u.id == userId);
            if (!user) {
                throw new Error('ユーザーが見つかりません');
            }

            // フォームにデータを設定
            if (this.elements.userId) this.elements.userId.value = user.id;
            if (this.elements.userName) this.elements.userName.value = user.full_name;
            if (this.elements.userEmail) this.elements.userEmail.value = user.email;
            if (this.elements.userRole) this.elements.userRole.value = user.role;
            if (this.elements.userPosition) this.elements.userPosition.value = user.position || '';
            
            // 評価者フィールドを更新
            this.updateEvaluatorField();
            
            if (this.elements.userEvaluator) {
                this.elements.userEvaluator.value = user.evaluator_id || '';
            }

        } catch (error) {
            console.error('ユーザーデータ読み込みエラー:', error);
            this.showErrorMessage('ユーザーデータの読み込みに失敗しました');
        }
    }

    /**
     * フォームをリセット
     */
    resetForm() {
        if (this.elements.userForm) {
            this.elements.userForm.reset();
        }
        
        this.currentUserId = null;
        this.updateEvaluatorField();
    }

    /**
     * 評価者フィールドを更新
     */
    updateEvaluatorField() {
        if (!this.elements.userRole || !this.elements.userEvaluator) return;

        const role = this.elements.userRole.value;
        const evaluatorField = this.elements.userEvaluator.closest('.mb-3');
        
        if (role === 'employee') {
            // 従業員の場合、評価者フィールドを表示
            evaluatorField.style.display = 'block';
            this.elements.userEvaluator.required = true;
        } else {
            // 管理者・評価者の場合、評価者フィールドを非表示
            evaluatorField.style.display = 'none';
            this.elements.userEvaluator.required = false;
            this.elements.userEvaluator.value = '';
        }
    }

    /**
     * 評価者選択肢を更新
     */
    updateEvaluatorOptions() {
        if (!this.elements.userEvaluator) return;

        // 現在の選択値を保存
        const currentValue = this.elements.userEvaluator.value;
        
        // オプションをクリア
        this.elements.userEvaluator.innerHTML = '<option value="">なし</option>';
        
        // 評価者・管理者のみを選択肢に追加
        const evaluators = this.users.filter(user => 
            user.role === 'evaluator' || user.role === 'admin'
        );
        
        evaluators.forEach(evaluator => {
            const option = document.createElement('option');
            option.value = evaluator.id;
            option.textContent = evaluator.full_name;
            if (evaluator.id == currentValue) {
                option.selected = true;
            }
            this.elements.userEvaluator.appendChild(option);
        });
    }

    /**
     * ユーザーを保存
     */
    async saveUser() {
        try {
            // フォームデータを取得
            const formData = this.getFormData();
            
            // バリデーション
            const validationErrors = this.validateUserData(formData);
            if (validationErrors.length > 0) {
                this.showValidationErrors(validationErrors);
                return;
            }

            // 保存処理
            if (this.currentMode === 'edit') {
                await this.updateUser(formData);
            } else {
                await this.createUser(formData);
            }

            // 成功メッセージ
            const message = this.currentMode === 'edit' ? 'ユーザーを更新しました' : 'ユーザーを作成しました';
            this.showSuccessMessage(message);

            // モーダルを閉じる
            const modal = bootstrap.Modal.getInstance(this.elements.userModal);
            modal?.hide();

            // ユーザー一覧を更新
            await this.loadUsers();
            this.updateEvaluatorOptions();

        } catch (error) {
            console.error('ユーザー保存エラー:', error);
            this.showErrorMessage('ユーザーの保存に失敗しました');
        }
    }

    /**
     * フォームデータを取得
     */
    getFormData() {
        return {
            id: this.elements.userId?.value || null,
            username: this.elements.userEmail?.value.split('@')[0] || '',
            full_name: this.elements.userName?.value || '',
            email: this.elements.userEmail?.value || '',
            role: this.elements.userRole?.value || 'employee',
            position: this.elements.userPosition?.value || '',
            evaluator_id: this.elements.userEvaluator?.value || null,
            evaluator_name: this.elements.userEvaluator?.selectedOptions[0]?.textContent === 'なし' ? null :
                           this.elements.userEvaluator?.selectedOptions[0]?.textContent || null
        };
    }

    /**
     * ユーザーデータをバリデーション
     */
    validateUserData(data) {
        const errors = [];

        // 必須項目チェック
        if (!data.full_name) {
            errors.push('氏名は必須項目です');
        }

        if (!data.email) {
            errors.push('メールアドレスは必須項目です');
        }

        // メールアドレス形式チェック
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (data.email && !emailRegex.test(data.email)) {
            errors.push('メールアドレスの形式が正しくありません');
        }

        // 重複チェック
        const existingUser = this.users.find(user => 
            user.email === data.email && user.id != data.id
        );
        if (existingUser) {
            errors.push('このメールアドレスは既に使用されています');
        }

        // 従業員の場合は評価者が必須
        if (data.role === 'employee' && !data.evaluator_id) {
            errors.push('従業員には評価者の設定が必要です');
        }

        return errors;
    }

    /**
     * バリデーションエラーを表示
     */
    showValidationErrors(errors) {
        const errorMessage = '以下の項目を確認してください：\n' + errors.map(e => `• ${e}`).join('\n');
        alert(errorMessage);
    }

    /**
     * 新しいユーザーを作成
     */
    async createUser(data) {
        // IDを生成
        const newId = `user-${Date.now()}`;
        
        const newUser = {
            ...data,
            id: newId,
            username: data.username || data.email.split('@')[0],
            password: 'demo123', // デモ用デフォルトパスワード
            status: 'active',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        // モックデータに追加
        if (window.evaluationConfig && window.evaluationConfig.mockData) {
            window.evaluationConfig.mockData.users.push(newUser);
        }

        // データベースに保存
        if (this.database) {
            await this.database.add('users', newUser);
        }

        return newUser;
    }

    /**
     * ユーザーを更新
     */
    async updateUser(data) {
        const existingUser = this.users.find(u => u.id == data.id);
        if (!existingUser) {
            throw new Error('更新対象のユーザーが見つかりません');
        }

        const updatedUser = {
            ...existingUser,
            ...data,
            username: data.username || data.email.split('@')[0],
            updatedAt: new Date().toISOString()
        };

        // モックデータを更新
        if (window.evaluationConfig && window.evaluationConfig.mockData) {
            const userIndex = window.evaluationConfig.mockData.users.findIndex(u => u.id == data.id);
            if (userIndex >= 0) {
                window.evaluationConfig.mockData.users[userIndex] = updatedUser;
            }
        }

        // データベースを更新
        if (this.database) {
            await this.database.put('users', updatedUser);
        }

        return updatedUser;
    }

    /**
     * ユーザーを編集
     */
    editUser(userId) {
        this.showUserModal(userId);
    }

    /**
     * ユーザー詳細を表示
     */
    viewUser(userId) {
        const user = this.users.find(u => u.id == userId);
        if (!user) {
            this.showErrorMessage('ユーザーが見つかりません');
            return;
        }

        // 詳細モーダルの内容を生成
        const modalContent = `
            <div class="modal fade" id="userDetailModal" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header bg-primary text-white">
                            <h5 class="modal-title">ユーザー詳細</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <dl class="row">
                                <dt class="col-4">氏名:</dt>
                                <dd class="col-8">${user.full_name}</dd>
                                <dt class="col-4">ユーザー名:</dt>
                                <dd class="col-8">@${user.username}</dd>
                                <dt class="col-4">メール:</dt>
                                <dd class="col-8">${user.email}</dd>
                                <dt class="col-4">役割:</dt>
                                <dd class="col-8">${this.getRoleDisplayName(user.role)}</dd>
                                <dt class="col-4">役職:</dt>
                                <dd class="col-8">${user.position || '-'}</dd>
                                <dt class="col-4">評価者:</dt>
                                <dd class="col-8">${user.evaluator_name || '-'}</dd>
                                <dt class="col-4">ステータス:</dt>
                                <dd class="col-8">${this.getStatusBadge(user.status)}</dd>
                                <dt class="col-4">作成日:</dt>
                                <dd class="col-8">${user.createdAt ? this.formatDateTime(user.createdAt) : '-'}</dd>
                                <dt class="col-4">最終ログイン:</dt>
                                <dd class="col-8">${user.lastLogin ? this.formatDateTime(user.lastLogin) : '未ログイン'}</dd>
                            </dl>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">閉じる</button>
                            <button type="button" class="btn btn-primary" onclick="window.app.components.userManagement.editUser('${user.id}'); bootstrap.Modal.getInstance(document.getElementById('userDetailModal')).hide();">
                                編集
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // 既存の詳細モーダルを削除
        const existingModal = document.getElementById('userDetailModal');
        if (existingModal) {
            existingModal.remove();
        }

        // 新しいモーダルを追加
        document.body.insertAdjacentHTML('beforeend', modalContent);

        // モーダルを表示
        const modal = new bootstrap.Modal(document.getElementById('userDetailModal'));
        modal.show();
    }

    /**
     * ユーザーを削除
     */
    async deleteUser(userId, userName) {
        if (!confirm(`「${userName}」を削除してもよろしいですか？\nこの操作は取り消せません。`)) {
            return;
        }

        try {
            // モックデータから削除
            if (window.evaluationConfig && window.evaluationConfig.mockData) {
                const userIndex = window.evaluationConfig.mockData.users.findIndex(u => u.id == userId);
                if (userIndex >= 0) {
                    window.evaluationConfig.mockData.users.splice(userIndex, 1);
                }
            }

            // データベースから削除
            if (this.database) {
                await this.database.delete('users', userId);
            }

            this.showSuccessMessage('ユーザーを削除しました');
            
            // ユーザー一覧を更新
            await this.loadUsers();
            this.updateEvaluatorOptions();

        } catch (error) {
            console.error('ユーザー削除エラー:', error);
            this.showErrorMessage('ユーザーの削除に失敗しました');
        }
    }

    /**
     * ステータスバッジを取得
     */
    getStatusBadge(status) {
        const statusMap = {
            'active': { label: 'アクティブ', class: 'bg-success' },
            'inactive': { label: '無効', class: 'bg-secondary' },
            'suspended': { label: '停止中', class: 'bg-warning text-dark' }
        };
        
        const statusInfo = statusMap[status] || statusMap['active'];
        return `<span class="badge ${statusInfo.class}">${statusInfo.label}</span>`;
    }

    /**
     * 役割バッジを取得
     */
    getRoleBadge(role) {
        const roleMap = {
            'admin': { label: '管理者', class: 'bg-danger' },
            'evaluator': { label: '評価者', class: 'bg-primary' },
            'employee': { label: '従業員', class: 'bg-info' }
        };
        
        const roleInfo = roleMap[role] || roleMap['employee'];
        return `<span class="badge ${roleInfo.class}">${roleInfo.label}</span>`;
    }

    /**
     * 役割の表示名を取得
     */
    getRoleDisplayName(role) {
        const roleNames = {
            'admin': '管理者',
            'evaluator': '評価者',
            'employee': '従業員'
        };
        return roleNames[role] || role;
    }

    /**
     * デバウンス関数
     */
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

    /**
     * 日時をフォーマット
     */
    formatDateTime(dateString) {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('ja-JP', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    /**
     * 成功メッセージを表示
     */
    showSuccessMessage(message) {
        if (window.app && window.app.showSuccessNotification) {
            window.app.showSuccessNotification('成功', message);
        } else {
            console.log('成功:', message);
        }
    }

    /**
     * エラーメッセージを表示
     */
    showErrorMessage(message) {
        if (window.app && window.app.showErrorNotification) {
            window.app.showErrorNotification('エラー', message);
        } else {
            console.error('エラー:', message);
        }
    }

    /**
     * ユーザー一覧をエクスポート
     */
    async exportUsers(format = 'csv') {
        try {
            const users = await this.getAllUsers();
            
            if (format === 'csv') {
                const csvContent = this.generateCSV(users);
                this.downloadFile(csvContent, 'users.csv', 'text/csv');
            } else if (format === 'json') {
                const jsonContent = JSON.stringify(users, null, 2);
                this.downloadFile(jsonContent, 'users.json', 'application/json');
            }
            
            this.showSuccessMessage('ユーザー一覧をエクスポートしました');
        } catch (error) {
            console.error('エクスポートエラー:', error);
            this.showErrorMessage('エクスポートに失敗しました');
        }
    }

    /**
     * CSV形式を生成
     */
    generateCSV(users) {
        const headers = ['氏名', 'ユーザー名', 'メール', '役割', '役職', '評価者', 'ステータス', '作成日'];
        const csvRows = [headers.join(',')];
        
        users.forEach(user => {
            const row = [
                `"${user.full_name}"`,
                `"${user.username}"`,
                `"${user.email}"`,
                `"${this.getRoleDisplayName(user.role)}"`,
                `"${user.position || ''}"`,
                `"${user.evaluator_name || ''}"`,
                `"${user.status || 'active'}"`,
                `"${user.createdAt ? this.formatDateTime(user.createdAt) : ''}"`
            ];
            csvRows.push(row.join(','));
        });
        
        return csvRows.join('\n');
    }

    /**
     * ファイルをダウンロード
     */
    downloadFile(content, filename, contentType) {
        const blob = new Blob([content], { type: contentType });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        window.URL.revokeObjectURL(url);
    }

    /**
     * ユーザー統計を取得
     */
    getUserStatistics() {
        const stats = {
            total: this.users.length,
            byRole: {},
            byStatus: {},
            activeCount: 0,
            withEvaluator: 0
        };

        this.users.forEach(user => {
            // 役割別統計
            stats.byRole[user.role] = (stats.byRole[user.role] || 0) + 1;
            
            // ステータス別統計
            const status = user.status || 'active';
            stats.byStatus[status] = (stats.byStatus[status] || 0) + 1;
            
            // アクティブユーザー数
            if (status === 'active') {
                stats.activeCount++;
            }
            
            // 評価者が設定されているユーザー数
            if (user.evaluator_id) {
                stats.withEvaluator++;
            }
        });

        return stats;
    }

    /**
     * コンポーネントの破棄
     */
    destroy() {
        // イベントリスナーの削除
        // メモリクリア
        this.users = [];
        this.elements = {};
        
        console.log('ユーザー管理コンポーネントが破棄されました');
    }
}

// ========================================
// ユーザー管理初期化処理
// ========================================

/**
 * ユーザー管理ページの初期化
 */
function initializeUserManagement() {
    // アプリケーションオブジェクトが使用可能になるまで待機
    if (typeof window.app === 'undefined') {
        setTimeout(initializeUserManagement, 100);
        return;
    }
    
    // ユーザー管理コンポーネントのインスタンスを作成
    const userManagement = new UserManagementComponent();
    
    // グローバルに登録
    if (!window.app.components) {
        window.app.components = {};
    }
    window.app.components.userManagement = userManagement;
    
    // 初期化を実行
    userManagement.initialize().catch(error => {
        console.error('ユーザー管理初期化に失敗しました:', error);
    });
    
    return userManagement;
}

// ページ読み込み時の初期化
document.addEventListener('DOMContentLoaded', () => {
    // ユーザー管理ページの場合のみ初期化
    if (document.getElementById('users-page')) {
        initializeUserManagement();
    }
});

// グローバルに公開
window.UserManagementComponent = UserManagementComponent;
window.initializeUserManagement = initializeUserManagement;

console.log('UserManagementComponent が読み込まれました');
