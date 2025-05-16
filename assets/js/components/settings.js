/**
 * 設定コンポーネント
 * システム設定・評価期間・評価項目の管理
 */

/**
 * 設定管理クラス
 */
class SettingsComponent {
    constructor(apiClient, authManager, tenantConfig) {
        this.api = apiClient || window.app.api;
        this.auth = authManager || window.app.auth;
        this.database = window.app.database;
        this.currentUser = null;
        this.currentTenant = tenantConfig || window.getCurrentTenant();
        this.periods = [];
        this.categories = [];
        this.systemSettings = {};
        
        // DOM要素のキャッシュ
        this.elements = {
            // 評価期間関連
            periodsTable: null,
            periodModal: null,
            periodForm: null,
            periodId: null,
            periodName: null,
            periodStartDate: null,
            periodEndDate: null,
            periodIsActive: null,
            
            // 評価項目関連
            categoriesModal: null,
            categoriesTableBody: null,
            categoriesList: null,
            
            // システム設定関連
            systemSettingsForm: null,
            systemTheme: null,
            systemLanguage: null
        };
        
        console.log('設定コンポーネントが初期化されました');
    }

    /**
     * 設定コンポーネントの初期化
     */
    async initialize() {
        try {
            console.log('設定コンポーネントを初期化中...');
            
            // 認証状態の確認
            this.currentUser = this.auth.getCurrentUser();
            
            if (!this.currentUser) {
                throw new Error('ユーザーが認証されていません');
            }
            
            // 管理者権限の確認
            if (!this.auth.hasRole('admin')) {
                throw new Error('設定管理の権限がありません');
            }
            
            // DOM要素を取得
            this.cacheElements();
            
            // データを読み込み
            await this.loadData();
            
            // UIを更新
            this.updateUI();
            
            // イベントリスナーの設定
            this.setupEventListeners();
            
            console.log('設定コンポーネントの初期化が完了しました');
        } catch (error) {
            console.error('設定コンポーネント初期化エラー:', error);
            this.showErrorMessage('設定の初期化に失敗しました');
        }
    }

    /**
     * DOM要素をキャッシュ
     */
    cacheElements() {
        this.elements = {
            // 評価期間関連
            periodsTable: document.getElementById('periodsTable'),
            periodModal: document.getElementById('periodModal'),
            periodForm: document.getElementById('periodForm'),
            periodId: document.getElementById('periodId'),
            periodName: document.getElementById('periodName'),
            periodStartDate: document.getElementById('periodStartDate'),
            periodEndDate: document.getElementById('periodEndDate'),
            periodIsActive: document.getElementById('periodIsActive'),
            
            // 評価項目関連
            categoriesModal: document.getElementById('categoriesModal'),
            categoriesTableBody: document.getElementById('categoriesTableBody'),
            categoriesList: document.getElementById('categoriesList'),
            
            // システム設定関連
            systemSettingsForm: document.getElementById('systemSettingsForm'),
            systemTheme: document.getElementById('systemTheme'),
            systemLanguage: document.getElementById('systemLanguage')
        };
    }

    /**
     * データを読み込み
     */
    async loadData() {
        try {
            // 評価期間を読み込み
            await this.loadPeriods();
            
            // 評価カテゴリを読み込み
            await this.loadCategories();
            
            // システム設定を読み込み
            await this.loadSystemSettings();
            
        } catch (error) {
            console.error('データ読み込みエラー:', error);
            throw error;
        }
    }

    /**
     * 評価期間を読み込み
     */
    async loadPeriods() {
        if (window.evaluationConfig && window.evaluationConfig.mockData) {
            this.periods = [...window.evaluationConfig.mockData.periods];
        } else if (this.database) {
            this.periods = await this.database.getAll('periods');
        } else {
            this.periods = [];
        }
        
        console.log('評価期間読み込み完了:', this.periods);
    }

    /**
     * 評価カテゴリを読み込み
     */
    async loadCategories() {
        if (window.evaluationConfig && window.evaluationConfig.categorySets) {
            const categorySetName = this.currentTenant?.settings?.evaluationCategorySet || 'default';
            this.categories = window.evaluationConfig.categorySets[categorySetName] || [];
        } else {
            this.categories = [];
        }
        
        console.log('評価カテゴリ読み込み完了:', this.categories);
    }

    /**
     * システム設定を読み込み
     */
    async loadSystemSettings() {
        // デフォルト設定
        this.systemSettings = {
            theme: 'default',
            language: 'ja',
            itemsPerPage: 10,
            autoSave: true,
            notifications: true
        };
        
        // データベースから設定を読み込み（あれば）
        if (this.database) {
            try {
                const settings = await this.database.getAll('settings');
                settings.forEach(setting => {
                    this.systemSettings[setting.key] = setting.value;
                });
            } catch (error) {
                console.error('システム設定読み込みエラー:', error);
            }
        }
        
        console.log('システム設定読み込み完了:', this.systemSettings);
    }

    /**
     * UIを更新
     */
    updateUI() {
        this.updatePeriodsTable();
        this.updateCategoriesList();
        this.updateSystemSettingsForm();
    }

    /**
     * 評価期間テーブルを更新
     */
    updatePeriodsTable() {
        if (!this.elements.periodsTable) return;

        if (this.periods.length === 0) {
            this.elements.periodsTable.innerHTML = `
                <tr>
                    <td colspan="4" class="text-center text-muted py-3">
                        評価期間が設定されていません
                    </td>
                </tr>
            `;
            return;
        }

        const rows = this.periods.map(period => {
            const startDate = this.formatDate(period.startDate);
            const endDate = this.formatDate(period.endDate);
            const statusBadge = period.isActive ? 
                '<span class="badge bg-success">アクティブ</span>' : 
                '<span class="badge bg-secondary">非アクティブ</span>';
            
            return `
                <tr>
                    <td>${period.name}</td>
                    <td>${startDate} ～ ${endDate}</td>
                    <td>${statusBadge}</td>
                    <td>
                        <div class="btn-group btn-group-sm" role="group">
                            <button class="btn btn-outline-primary edit-period-btn" 
                                    data-period-id="${period.id}"
                                    title="編集">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-outline-danger delete-period-btn" 
                                    data-period-id="${period.id}"
                                    data-period-name="${period.name}"
                                    title="削除">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
        
        this.elements.periodsTable.innerHTML = rows;
    }

    /**
     * 評価カテゴリ一覧を更新
     */
    updateCategoriesList() {
        if (!this.elements.categoriesList) return;

        if (this.categories.length === 0) {
            this.elements.categoriesList.innerHTML = '<li class="text-muted">評価カテゴリが設定されていません</li>';
            return;
        }

        const listItems = this.categories.map(category => {
            const itemCount = category.items ? category.items.length : 0;
            const positionTypes = category.positionTypes ? category.positionTypes.join(', ') : '-';
            
            return `
                <li>
                    <strong>${category.name}</strong> (${category.weight}%)
                    <br>
                    <small class="text-muted">
                        対象: ${positionTypes} | 項目数: ${itemCount}
                    </small>
                </li>
            `;
        }).join('');
        
        this.elements.categoriesList.innerHTML = listItems;
    }

    /**
     * 評価カテゴリテーブルを更新
     */
    updateCategoriesTable() {
        if (!this.elements.categoriesTableBody) return;

        if (this.categories.length === 0) {
            this.elements.categoriesTableBody.innerHTML = `
                <tr>
                    <td colspan="4" class="text-center text-muted py-3">
                        評価カテゴリが設定されていません
                    </td>
                </tr>
            `;
            return;
        }

        const rows = this.categories.map(category => {
            const itemCount = category.items ? category.items.length : 0;
            const positionTypes = category.positionTypes ? category.positionTypes.join(', ') : '-';
            
            return `
                <tr>
                    <td>${category.name}</td>
                    <td>${positionTypes}</td>
                    <td>${itemCount}</td>
                    <td>
                        <div class="btn-group btn-group-sm" role="group">
                            <button class="btn btn-outline-primary edit-category-btn" 
                                    data-category-id="${category.id}"
                                    title="編集">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-outline-info view-category-items-btn" 
                                    data-category-id="${category.id}"
                                    title="項目表示">
                                <i class="fas fa-list"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
        
        this.elements.categoriesTableBody.innerHTML = rows;
    }

    /**
     * システム設定フォームを更新
     */
    updateSystemSettingsForm() {
        if (this.elements.systemTheme) {
            this.elements.systemTheme.value = this.systemSettings.theme || 'default';
        }
        
        if (this.elements.systemLanguage) {
            this.elements.systemLanguage.value = this.systemSettings.language || 'ja';
        }
    }

    /**
     * イベントリスナーを設定
     */
    setupEventListeners() {
        // 評価期間関連のイベント
        this.setupPeriodEventListeners();
        
        // 評価カテゴリ関連のイベント
        this.setupCategoryEventListeners();
        
        // システム設定関連のイベント
        this.setupSystemSettingsEventListeners();
    }

    /**
     * 評価期間関連のイベントリスナーを設定
     */
    setupPeriodEventListeners() {
        // 期間編集ボタン
        document.addEventListener('click', (event) => {
            if (event.target.closest('.edit-period-btn')) {
                const periodId = event.target.closest('.edit-period-btn')
                    .getAttribute('data-period-id');
                this.editPeriod(periodId);
            }
            
            if (event.target.closest('.delete-period-btn')) {
                const periodId = event.target.closest('.delete-period-btn')
                    .getAttribute('data-period-id');
                const periodName = event.target.closest('.delete-period-btn')
                    .getAttribute('data-period-name');
                this.deletePeriod(periodId, periodName);
            }
        });

        // 期間フォーム送信
        if (this.elements.periodForm) {
            this.elements.periodForm.addEventListener('submit', (event) => {
                event.preventDefault();
                this.savePeriod();
            });
        }

        // モーダル関連
        if (this.elements.periodModal) {
            this.elements.periodModal.addEventListener('hidden.bs.modal', () => {
                this.resetPeriodForm();
            });
        }
    }

    /**
     * 評価カテゴリ関連のイベントリスナーを設定
     */
    setupCategoryEventListeners() {
        // カテゴリ管理ボタン
        document.addEventListener('click', (event) => {
            if (event.target.closest('.edit-category-btn')) {
                const categoryId = event.target.closest('.edit-category-btn')
                    .getAttribute('data-category-id');
                this.editCategory(categoryId);
            }
            
            if (event.target.closest('.view-category-items-btn')) {
                const categoryId = event.target.closest('.view-category-items-btn')
                    .getAttribute('data-category-id');
                this.viewCategoryItems(categoryId);
            }
        });
    }

    /**
     * システム設定関連のイベントリスナーを設定
     */
    setupSystemSettingsEventListeners() {
        // テーマ変更
        if (this.elements.systemTheme) {
            this.elements.systemTheme.addEventListener('change', (event) => {
                this.changeTheme(event.target.value);
            });
        }

        // システム設定フォーム送信
        if (this.elements.systemSettingsForm) {
            this.elements.systemSettingsForm.addEventListener('submit', (event) => {
                event.preventDefault();
                this.saveSystemSettings();
            });
        }
    }

    /**
     * 評価期間モーダルを表示
     */
    showPeriodModal(periodId = null) {
        // モーダルタイトルを更新
        const modalTitle = document.getElementById('periodModalLabel');
        if (modalTitle) {
            modalTitle.textContent = periodId ? '評価期間編集' : '評価期間追加';
        }

        // フォームデータを設定
        if (periodId) {
            this.loadPeriodData(periodId);
        } else {
            this.resetPeriodForm();
        }

        // モーダルを表示
        const modal = new bootstrap.Modal(this.elements.periodModal);
        modal.show();
    }

    /**
     * 評価期間データを読み込み
     */
    loadPeriodData(periodId) {
        const period = this.periods.find(p => p.id === periodId);
        if (!period) return;

        if (this.elements.periodId) this.elements.periodId.value = period.id;
        if (this.elements.periodName) this.elements.periodName.value = period.name;
        if (this.elements.periodStartDate) this.elements.periodStartDate.value = period.startDate;
        if (this.elements.periodEndDate) this.elements.periodEndDate.value = period.endDate;
        if (this.elements.periodIsActive) this.elements.periodIsActive.checked = period.isActive;
    }

    /**
     * 評価期間フォームをリセット
     */
    resetPeriodForm() {
        if (this.elements.periodForm) {
            this.elements.periodForm.reset();
        }
    }

    /**
     * 評価期間を保存
     */
    async savePeriod() {
        try {
            // フォームデータを取得
            const formData = this.getPeriodFormData();
            
            // バリデーション
            const validationErrors = this.validatePeriodData(formData);
            if (validationErrors.length > 0) {
                this.showValidationErrors(validationErrors);
                return;
            }

            // 保存処理
            if (formData.id) {
                await this.updatePeriod(formData);
            } else {
                await this.createPeriod(formData);
            }

            // 成功メッセージ
            const message = formData.id ? '評価期間を更新しました' : '評価期間を作成しました';
            this.showSuccessMessage(message);

            // モーダルを閉じる
            const modal = bootstrap.Modal.getInstance(this.elements.periodModal);
            modal?.hide();

            // テーブルを更新
            await this.loadPeriods();
            this.updatePeriodsTable();

        } catch (error) {
            console.error('評価期間保存エラー:', error);
            this.showErrorMessage('評価期間の保存に失敗しました');
        }
    }

    /**
     * 評価期間フォームデータを取得
     */
    getPeriodFormData() {
        return {
            id: this.elements.periodId?.value || null,
            name: this.elements.periodName?.value || '',
            startDate: this.elements.periodStartDate?.value || '',
            endDate: this.elements.periodEndDate?.value || '',
            isActive: this.elements.periodIsActive?.checked || false
        };
    }

    /**
     * 評価期間データをバリデーション
     */
    validatePeriodData(data) {
        const errors = [];

        // 必須項目チェック
        if (!data.name) {
            errors.push('期間名は必須項目です');
        }

        if (!data.startDate) {
            errors.push('開始日は必須項目です');
        }

        if (!data.endDate) {
            errors.push('終了日は必須項目です');
        }

        // 日付の整合性チェック
        if (data.startDate && data.endDate) {
            const startDate = new Date(data.startDate);
            const endDate = new Date(data.endDate);
            
            if (startDate >= endDate) {
                errors.push('終了日は開始日より後である必要があります');
            }
        }

        // アクティブ期間の重複チェック
        if (data.isActive) {
            const existingActivePeriod = this.periods.find(p => 
                p.isActive && p.id !== data.id
            );
            
            if (existingActivePeriod) {
                errors.push('既にアクティブな期間が存在します。一度に一つの期間のみアクティブにできます。');
            }
        }

        return errors;
    }

    /**
     * 新しい評価期間を作成
     */
    async createPeriod(data) {
        const newPeriod = {
            ...data,
            id: `period-${Date.now()}`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        // モックデータに追加
        if (window.evaluationConfig && window.evaluationConfig.mockData) {
            window.evaluationConfig.mockData.periods.push(newPeriod);
        }

        // データベースに保存
        if (this.database) {
            await this.database.add('periods', newPeriod);
        }

        this.periods.push(newPeriod);
        return newPeriod;
    }

    /**
     * 評価期間を更新
     */
    async updatePeriod(data) {
        const periodIndex = this.periods.findIndex(p => p.id === data.id);
        if (periodIndex === -1) {
            throw new Error('更新対象の期間が見つかりません');
        }

        const updatedPeriod = {
            ...this.periods[periodIndex],
            ...data,
            updatedAt: new Date().toISOString()
        };

        // モックデータを更新
        if (window.evaluationConfig && window.evaluationConfig.mockData) {
            const mockIndex = window.evaluationConfig.mockData.periods.findIndex(p => p.id === data.id);
            if (mockIndex >= 0) {
                window.evaluationConfig.mockData.periods[mockIndex] = updatedPeriod;
            }
        }

        // データベースを更新
        if (this.database) {
            await this.database.put('periods', updatedPeriod);
        }

        this.periods[periodIndex] = updatedPeriod;
        return updatedPeriod;
    }

    /**
     * 評価期間を編集
     */
    editPeriod(periodId) {
        this.showPeriodModal(periodId);
    }

    /**
     * 評価期間を削除
     */
    async deletePeriod(periodId, periodName) {
        if (!confirm(`期間「${periodName}」を削除してもよろしいですか？\nこの期間に関連する評価データも削除される可能性があります。`)) {
            return;
        }

        try {
            // モックデータから削除
            if (window.evaluationConfig && window.evaluationConfig.mockData) {
                const mockIndex = window.evaluationConfig.mockData.periods.findIndex(p => p.id === periodId);
                if (mockIndex >= 0) {
                    window.evaluationConfig.mockData.periods.splice(mockIndex, 1);
                }
            }

            // データベースから削除
            if (this.database) {
                await this.database.delete('periods', periodId);
            }

            // ローカル配列から削除
            this.periods = this.periods.filter(p => p.id !== periodId);

            this.showSuccessMessage('評価期間を削除しました');
            this.updatePeriodsTable();

        } catch (error) {
            console.error('評価期間削除エラー:', error);
            this.showErrorMessage('評価期間の削除に失敗しました');
        }
    }

    /**
     * 評価カテゴリモーダルを表示
     */
    showCategoriesModal() {
        // カテゴリテーブルを更新
        this.updateCategoriesTable();
        
        // モーダルを表示
        const modal = new bootstrap.Modal(this.elements.categoriesModal);
        modal.show();
    }

    /**
     * 評価カテゴリを編集
     */
    editCategory(categoryId) {
        const category = this.categories.find(c => c.id === categoryId);
        if (!category) {
            this.showErrorMessage('カテゴリが見つかりません');
            return;
        }

        // カテゴリ編集の詳細実装
        // ここでは概要のみ表示
        this.showInfoMessage(`カテゴリ「${category.name}」の編集は将来のバージョンで実装予定です`);
    }

    /**
     * カテゴリ項目を表示
     */
    viewCategoryItems(categoryId) {
        const category = this.categories.find(c => c.id === categoryId);
        if (!category) {
            this.showErrorMessage('カテゴリが見つかりません');
            return;
        }

        // 項目詳細モーダルの生成
        const itemsHtml = category.items?.map(item => 
            `<li class="list-group-item">${item.name}</li>`
        ).join('') || '<li class="list-group-item text-muted">項目がありません</li>';

        const modalContent = `
            <div class="modal fade" id="categoryItemsModal" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header bg-primary text-white">
                            <h5 class="modal-title">${category.name} - 評価項目</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="mb-3">
                                <strong>対象役職:</strong> ${category.positionTypes?.join(', ') || '-'}
                            </div>
                            <div class="mb-3">
                                <strong>ウェイト:</strong> ${category.weight}%
                            </div>
                            <div>
                                <strong>評価項目:</strong>
                                <ul class="list-group mt-2">
                                    ${itemsHtml}
                                </ul>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">閉じる</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // 既存のモーダルを削除
        const existingModal = document.getElementById('categoryItemsModal');
        if (existingModal) {
            existingModal.remove();
        }

        // 新しいモーダルを追加
        document.body.insertAdjacentHTML('beforeend', modalContent);

        // モーダルを表示
        const modal = new bootstrap.Modal(document.getElementById('categoryItemsModal'));
        modal.show();
    }

    /**
     * システム設定を保存
     */
    async saveSystemSettings() {
        try {
            // フォームデータを取得
            const formData = new FormData(this.elements.systemSettingsForm);
            const settings = {};
            
            for (const [key, value] of formData.entries()) {
                settings[key.replace('system', '').toLowerCase()] = value;
            }

            // 設定を更新
            Object.assign(this.systemSettings, settings);

            // データベースに保存
            if (this.database) {
                for (const [key, value] of Object.entries(settings)) {
                    await this.database.put('settings', {
                        key: key,
                        value: value,
                        updatedAt: new Date().toISOString()
                    });
                }
            }

            this.showSuccessMessage('システム設定を保存しました');

        } catch (error) {
            console.error('システム設定保存エラー:', error);
            this.showErrorMessage('システム設定の保存に失敗しました');
        }
    }

    /**
     * テーマを変更
     */
    changeTheme(themeName) {
        // グローバルのテーマ管理システムがあれば使用
        if (window.app && window.app.themeManager) {
            window.app.themeManager.switchTheme(themeName);
        } else {
            // 簡易的なテーマ切り替え
            document.body.classList.remove('theme-default', 'theme-dark', 'theme-construction');
            document.body.classList.add(`theme-${themeName}`);
        }

        // 設定を保存
        this.systemSettings.theme = themeName;
        this.showSuccessMessage(`テーマを「${themeName}」に変更しました`);
    }

    /**
     * バリデーションエラーを表示
     */
    showValidationErrors(errors) {
        const errorMessage = '以下の項目を確認してください：\n' + errors.map(e => `• ${e}`).join('\n');
        alert(errorMessage);
    }

    /**
     * 日付をフォーマット
     */
    formatDate(dateString) {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('ja-JP', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
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
     * 情報メッセージを表示
     */
    showInfoMessage(message) {
        if (window.app && window.app.showInfoNotification) {
            window.app.showInfoNotification('情報', message);
        } else {
            console.log('情報:', message);
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
     * システムバックアップを作成
     */
    async createSystemBackup() {
        try {
            // 全データを取得
            const backupData = {
                periods: this.periods,
                categories: this.categories,
                settings: this.systemSettings,
                timestamp: new Date().toISOString(),
                version: '1.0.0'
            };

            // JSONファイルとしてダウンロード
            const jsonStr = JSON.stringify(backupData, null, 2);
            const blob = new Blob([jsonStr], { type: 'application/json' });
            const url = window.URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `evaluation_system_backup_${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            
            window.URL.revokeObjectURL(url);

            this.showSuccessMessage('システムバックアップを作成しました');

        } catch (error) {
            console.error('バックアップ作成エラー:', error);
            this.showErrorMessage('バックアップの作成に失敗しました');
        }
    }

    /**
     * システムバックアップを復元
     */
    async restoreSystemBackup(file) {
        try {
            const text = await file.text();
            const backupData = JSON.parse(text);

            // バックアップデータの妥当性チェック
            if (!backupData.periods || !backupData.settings) {
                throw new Error('無効なバックアップファイルです');
            }

            // データを復元
            if (backupData.periods) {
                this.periods = backupData.periods;
                // モックデータも更新
                if (window.evaluationConfig && window.evaluationConfig.mockData) {
                    window.evaluationConfig.mockData.periods = backupData.periods;
                }
            }

            if (backupData.categories) {
                this.categories = backupData.categories;
            }

            if (backupData.settings) {
                this.systemSettings = backupData.settings;
            }

            // UIを更新
            this.updateUI();

            this.showSuccessMessage('システムバックアップを復元しました');

        } catch (error) {
            console.error('バックアップ復元エラー:', error);
            this.showErrorMessage('バックアップの復元に失敗しました');
        }
    }

    /**
     * システム統計を取得
     */
    getSystemStatistics() {
        return {
            periodsCount: this.periods.length,
            activePeriod: this.periods.find(p => p.isActive)?.name || 'なし',
            categoriesCount: this.categories.length,
            theme: this.systemSettings.theme,
            language: this.systemSettings.language
        };
    }

    /**
     * コンポーネントの破棄
     */
    destroy() {
        // イベントリスナーの削除
        // メモリクリア
        this.periods = [];
        this.categories = [];
        this.systemSettings = {};
        this.elements = {};
        
        console.log('設定コンポーネントが破棄されました');
    }
}

// ========================================
// 設定コンポーネント初期化処理
// ========================================

/**
 * 設定ページの初期化
 */
function initializeSettings() {
    // アプリケーションオブジェクトが使用可能になるまで待機
    if (typeof window.app === 'undefined') {
        setTimeout(initializeSettings, 100);
        return;
    }
    
    // 設定コンポーネントのインスタンスを作成
    const settings = new SettingsComponent();
    
    // グローバルに登録
    if (!window.app.components) {
        window.app.components = {};
    }
    window.app.components.settings = settings;
    
    // 初期化を実行
    settings.initialize().catch(error => {
        console.error('設定コンポーネント初期化に失敗しました:', error);
    });
    
    return settings;
}

// ページ読み込み時の初期化
document.addEventListener('DOMContentLoaded', () => {
    // 設定ページの場合のみ初期化
    if (document.getElementById('settings-page')) {
        initializeSettings();
    }
});

// グローバルに公開
window.SettingsComponent = SettingsComponent;
window.initializeSettings = initializeSettings;

console.log('SettingsComponent が読み込まれました');
