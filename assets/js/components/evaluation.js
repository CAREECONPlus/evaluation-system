/**
 * 評価コンポーネント
 * 定量評価・定性評価の入力・表示機能
 */

/**
 * 評価コンポーネントクラス
 */
class EvaluationComponent {
    constructor(apiClient, authManager, mode = 'default') {
        this.api = apiClient || window.app.api;
        this.auth = authManager || window.app.auth;
        this.database = window.app.database;
        this.mode = mode; // 'default', 'subordinates'
        this.currentUser = null;
        this.currentTenant = null;
        this.activePeriod = null;
        this.evaluationData = null;
        this.currentEvaluationId = null;
        this.isReadOnly = false;
        
        // DOM要素のキャッシュ
        this.elements = {
            modal: null,
            form: null,
            targetUser: null,
            period: null,
            position: null,
            quantitativeContainer: null,
            qualitativeContainer: null,
            totalWeightDisplay: null,
            saveDraftBtn: null,
            submitBtn: null
        };
        
        // 評価データの一時保存
        this.tempData = {
            quantitative: {},
            qualitative: []
        };
        
        console.log('評価コンポーネントが初期化されました');
    }

    /**
     * 評価コンポーネントの初期化
     */
    async initialize() {
        try {
            console.log('評価コンポーネントを初期化中...');
            
            // 認証状態と企業情報の取得
            this.currentUser = this.auth.getCurrentUser();
            this.currentTenant = window.getCurrentTenant ? window.getCurrentTenant() : null;
            
            if (!this.currentUser) {
                throw new Error('ユーザーが認証されていません');
            }
            
            // アクティブ期間の取得
            this.activePeriod = await this.getActivePeriod();
            
            // DOM要素を取得
            this.cacheElements();
            
            // イベントリスナーの設定
            this.setupEventListeners();
            
            // モードに応じた初期化
            if (this.mode === 'subordinates') {
                await this.initializeSubordinatesList();
            } else {
                await this.initializeEvaluationsList();
            }
            
            console.log('評価コンポーネントの初期化が完了しました');
        } catch (error) {
            console.error('評価コンポーネント初期化エラー:', error);
            this.showErrorMessage('評価システムの初期化に失敗しました');
        }
    }

    /**
     * DOM要素をキャッシュ
     */
    cacheElements() {
        this.elements = {
            modal: document.getElementById('evaluationModal'),
            form: document.getElementById('evaluationForm'),
            targetUser: document.getElementById('evalTargetUser'),
            period: document.getElementById('evalPeriod'),
            position: document.getElementById('evalPosition'),
            quantitativeContainer: document.getElementById('quantitativeCategoriesContainer'),
            qualitativeContainer: document.getElementById('qualitativeItemsContainer'),
            totalWeightDisplay: document.getElementById('totalWeightDisplay'),
            saveDraftBtn: document.getElementById('saveDraftBtn'),
            submitBtn: document.getElementById('submitEvaluationBtn'),
            evaluationsTable: document.getElementById('evaluationsTable'),
            subordinatesTable: document.getElementById('subordinatesTable'),
            evaluationPeriodFilter: document.getElementById('evaluationPeriodFilter')
        };
    }

    /**
     * 評価一覧ページの初期化
     */
    async initializeEvaluationsList() {
        try {
            // 期間フィルターを初期化
            await this.initializePeriodFilter();
            
            // 評価一覧を読み込み
            await this.loadEvaluationsList();
        } catch (error) {
            console.error('評価一覧初期化エラー:', error);
        }
    }

    /**
     * 評価対象者一覧ページの初期化
     */
    async initializeSubordinatesList() {
        try {
            // 評価対象者一覧を読み込み
            await this.loadSubordinatesList();
        } catch (error) {
            console.error('評価対象者一覧初期化エラー:', error);
        }
    }

    /**
     * 期間フィルターの初期化
     */
    async initializePeriodFilter() {
        if (!this.elements.evaluationPeriodFilter) return;

        const periods = await this.getAllPeriods();
        const filterElement = this.elements.evaluationPeriodFilter;
        
        // オプションをクリア
        filterElement.innerHTML = '<option value="">全期間</option>';
        
        // 期間オプションを追加
        periods.forEach(period => {
            const option = document.createElement('option');
            option.value = period.id;
            option.textContent = period.name;
            if (period.isActive) {
                option.selected = true;
            }
            filterElement.appendChild(option);
        });
        
        // フィルター変更イベント
        filterElement.addEventListener('change', () => {
            this.loadEvaluationsList();
        });
    }

    /**
     * 評価一覧を読み込み
     */
    async loadEvaluationsList() {
        if (!this.elements.evaluationsTable) return;

        try {
            const selectedPeriod = this.elements.evaluationPeriodFilter?.value || '';
            const evaluations = await this.getUserEvaluations(this.currentUser.id, selectedPeriod);
            
            this.renderEvaluationsTable(evaluations);
        } catch (error) {
            console.error('評価一覧読み込みエラー:', error);
            this.showErrorMessage('評価一覧の読み込みに失敗しました');
        }
    }

    /**
     * 評価対象者一覧を読み込み
     */
    async loadSubordinatesList() {
        if (!this.elements.subordinatesTable) return;

        try {
            const subordinates = await this.getSubordinateEvaluations();
            this.renderSubordinatesTable(subordinates);
        } catch (error) {
            console.error('評価対象者一覧読み込みエラー:', error);
            this.showErrorMessage('評価対象者一覧の読み込みに失敗しました');
        }
    }

    /**
     * 評価一覧テーブルをレンダリング
     */
    renderEvaluationsTable(evaluations) {
        if (!this.elements.evaluationsTable) return;

        if (evaluations.length === 0) {
            this.elements.evaluationsTable.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center text-muted py-4">
                        <i class="fas fa-inbox fs-1 d-block mb-2 opacity-25"></i>
                        評価データがありません
                    </td>
                </tr>
            `;
            return;
        }

        const rows = evaluations.map(evaluation => {
            const statusBadge = `<span class="badge ${this.getStatusClass(evaluation.status)}">${this.getStatusDisplayText(evaluation.status)}</span>`;
            const selfRating = evaluation.selfRating ? evaluation.selfRating.toFixed(1) : '-';
            const evaluatorRating = evaluation.evaluatorRating ? evaluation.evaluatorRating.toFixed(1) : '-';
            const lastModified = this.formatDateTime(evaluation.updatedAt);
            
            return `
                <tr>
                    <td>${evaluation.periodName}</td>
                    <td class="evaluator-only" style="display: none;">${evaluation.userName || '-'}</td>
                    <td>${selfRating}</td>
                    <td>${evaluatorRating}</td>
                    <td>${statusBadge}</td>
                    <td>${lastModified}</td>
                    <td>
                        <div class="btn-group btn-group-sm" role="group">
                            <button class="btn btn-outline-primary view-evaluation-btn" 
                                    data-evaluation-id="${evaluation.id}"
                                    title="詳細を見る">
                                <i class="fas fa-eye"></i>
                            </button>
                            ${evaluation.status === 'draft' || evaluation.status === 'not_started' ? `
                                <button class="btn btn-outline-success edit-evaluation-btn" 
                                        data-evaluation-id="${evaluation.id}"
                                        title="編集">
                                    <i class="fas fa-edit"></i>
                                </button>
                            ` : ''}
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
        
        this.elements.evaluationsTable.innerHTML = rows;
    }

    /**
     * 評価対象者一覧テーブルをレンダリング
     */
    renderSubordinatesTable(subordinates) {
        if (!this.elements.subordinatesTable) return;

        if (subordinates.length === 0) {
            this.elements.subordinatesTable.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center text-muted py-4">
                        <i class="fas fa-users fs-1 d-block mb-2 opacity-25"></i>
                        評価対象者がいません
                    </td>
                </tr>
            `;
            return;
        }

        const rows = subordinates.map(subordinate => {
            const statusBadge = `<span class="badge ${this.getStatusClass(subordinate.status)}">${this.getStatusDisplayText(subordinate.status)}</span>`;
            const rating = subordinate.selfRating ? subordinate.selfRating.toFixed(1) : '-';
            const lastModified = subordinate.lastModified ? this.formatDateTime(subordinate.lastModified) : '-';
            
            return `
                <tr>
                    <td>
                        <div class="d-flex align-items-center">
                            <div class="position-icon position-${subordinate.position.toLowerCase()}">
                                <i class="fas fa-user"></i>
                            </div>
                            ${subordinate.userName}
                        </div>
                    </td>
                    <td>${subordinate.position}</td>
                    <td>${rating}</td>
                    <td>${statusBadge}</td>
                    <td>${lastModified}</td>
                    <td>
                        <div class="btn-group btn-group-sm" role="group">
                            <button class="btn btn-outline-primary evaluate-subordinate-btn" 
                                    data-user-id="${subordinate.userId}"
                                    data-user-name="${subordinate.userName}"
                                    title="評価する">
                                <i class="fas fa-star"></i>
                            </button>
                            <button class="btn btn-outline-info view-subordinate-evaluation-btn" 
                                    data-user-id="${subordinate.userId}"
                                    title="詳細を見る">
                                <i class="fas fa-eye"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
        
        this.elements.subordinatesTable.innerHTML = rows;
    }

    /**
     * イベントリスナーを設定
     */
    setupEventListeners() {
        // 評価詳細表示ボタン
        document.addEventListener('click', (event) => {
            if (event.target.closest('.view-evaluation-btn')) {
                const evaluationId = event.target.closest('.view-evaluation-btn')
                    .getAttribute('data-evaluation-id');
                this.viewEvaluation(evaluationId);
            }
            
            if (event.target.closest('.edit-evaluation-btn')) {
                const evaluationId = event.target.closest('.edit-evaluation-btn')
                    .getAttribute('data-evaluation-id');
                this.editEvaluation(evaluationId);
            }
            
            if (event.target.closest('.evaluate-subordinate-btn')) {
                const userId = event.target.closest('.evaluate-subordinate-btn')
                    .getAttribute('data-user-id');
                const userName = event.target.closest('.evaluate-subordinate-btn')
                    .getAttribute('data-user-name');
                this.evaluateSubordinate(userId, userName);
            }
            
            if (event.target.closest('.view-subordinate-evaluation-btn')) {
                const userId = event.target.closest('.view-subordinate-evaluation-btn')
                    .getAttribute('data-user-id');
                this.viewSubordinateEvaluation(userId);
            }
        });

        // 評価保存ボタン
        if (this.elements.saveDraftBtn) {
            this.elements.saveDraftBtn.addEventListener('click', () => {
                this.saveEvaluation('draft');
            });
        }

        if (this.elements.submitBtn) {
            this.elements.submitBtn.addEventListener('click', () => {
                this.saveEvaluation('submitted');
            });
        }

        // 定性評価項目の追加/削除
        document.addEventListener('click', (event) => {
            if (event.target.closest('.add-qualitative-item-btn')) {
                this.addQualitativeItem();
            }
            
            if (event.target.closest('.remove-qualitative-item-btn')) {
                const itemElement = event.target.closest('.qualitative-item');
                this.removeQualitativeItem(itemElement);
            }
        });

        // ウェイト変更の監視
        document.addEventListener('input', (event) => {
            if (event.target.classList.contains('qualitative-weight-input')) {
                this.updateTotalWeight();
            }
        });
    }

    /**
     * 評価モーダルを表示
     */
    async showEvaluationModal(options = {}) {
        const { userId, periodId, mode = 'self', evaluationId = null } = options;
        
        try {
            // モーダルの準備
            if (!this.elements.modal) {
                console.error('評価モーダルが見つかりません');
                return;
            }

            // 評価データを読み込み
            if (evaluationId) {
                this.evaluationData = await this.getEvaluation(evaluationId);
                this.isReadOnly = this.evaluationData.status === 'approved_by_admin';
            } else {
                this.evaluationData = await this.createNewEvaluation(userId, periodId);
                this.isReadOnly = false;
            }

            // モーダル内容を更新
            await this.updateModalContent(mode);

            // モーダルを表示
            const modal = new bootstrap.Modal(this.elements.modal);
            modal.show();

        } catch (error) {
            console.error('評価モーダル表示エラー:', error);
            this.showErrorMessage('評価モーダルの表示に失敗しました');
        }
    }

    /**
     * モーダル内容を更新
     */
    async updateModalContent(mode) {
        // 基本情報を設定
        if (this.elements.targetUser) {
            this.elements.targetUser.textContent = this.evaluationData.userName;
        }
        if (this.elements.period) {
            this.elements.period.textContent = this.evaluationData.periodName;
        }
        if (this.elements.position) {
            this.elements.position.textContent = this.evaluationData.position;
        }

        // 読み取り専用モードの設定
        if (this.isReadOnly) {
            this.elements.saveDraftBtn?.classList.add('d-none');
            this.elements.submitBtn?.classList.add('d-none');
        } else {
            this.elements.saveDraftBtn?.classList.remove('d-none');
            this.elements.submitBtn?.classList.remove('d-none');
        }

        // 定量評価を描画
        await this.renderQuantitativeEvaluation();

        // 定性評価を描画
        await this.renderQualitativeEvaluation();
    }

    /**
     * 定量評価を描画
     */
    async renderQuantitativeEvaluation() {
        if (!this.elements.quantitativeContainer) return;

        try {
            const categories = this.getEvaluationCategories();
            const quantitativeData = this.evaluationData.quantitative || {};

            let html = '';

            for (const category of categories) {
                html += `
                    <div class="category-section mb-4">
                        <div class="category-header">
                            <h6 class="mb-0">
                                <i class="fas fa-chart-bar me-2"></i>
                                ${category.name}
                                <span class="badge bg-secondary ms-2">ウェイト: ${category.weight}%</span>
                            </h6>
                        </div>
                        <div class="category-items">
                `;

                for (const item of category.items) {
                    const itemData = quantitativeData[item.id] || {};
                    const selfRating = itemData.selfRating || 0;
                    const evaluatorRating = itemData.evaluatorRating || 0;
                    const isEvaluatorMode = this.currentUser.id !== this.evaluationData.userId;

                    html += `
                        <div class="category-item">
                            <div class="row align-items-center">
                                <div class="col-md-4">
                                    <label class="form-label">${item.name}</label>
                                </div>
                                <div class="col-md-4">
                                    <div class="evaluation-scale-container">
                                        <label class="form-label text-muted">自己評価</label>
                                        <div class="evaluation-scale" data-item-id="${item.id}" data-type="self">
                                            ${this.renderEvaluationScale(selfRating, !this.isReadOnly && !isEvaluatorMode)}
                                        </div>
                                    </div>
                                </div>
                                ${isEvaluatorMode || this.auth.hasRole('evaluator') ? `
                                    <div class="col-md-4">
                                        <div class="evaluation-scale-container">
                                            <label class="form-label text-muted">評価者評価</label>
                                            <div class="evaluation-scale" data-item-id="${item.id}" data-type="evaluator">
                                                ${this.renderEvaluationScale(evaluatorRating, !this.isReadOnly && isEvaluatorMode)}
                                            </div>
                                        </div>
                                    </div>
                                ` : ''}
                            </div>
                        </div>
                    `;
                }

                html += `
                        </div>
                    </div>
                `;
            }

            this.elements.quantitativeContainer.innerHTML = html;

            // 評価スケールのイベントリスナーを設定
            this.setupQuantitativeEventListeners();

        } catch (error) {
            console.error('定量評価描画エラー:', error);
            this.elements.quantitativeContainer.innerHTML = `
                <div class="alert alert-danger">
                    定量評価の読み込みに失敗しました
                </div>
            `;
        }
    }

    /**
     * 定性評価を描画
     */
    async renderQualitativeEvaluation() {
        if (!this.elements.qualitativeContainer) return;

        try {
            const qualitativeData = this.evaluationData.qualitative || [];
            const isEvaluatorMode = this.currentUser.id !== this.evaluationData.userId;

            let html = '';

            if (qualitativeData.length === 0 && !this.isReadOnly) {
                // デフォルトの定性評価項目を追加
                qualitativeData.push({
                    id: `qual-${Date.now()}`,
                    content: '',
                    weight: 100,
                    selfRating: 0,
                    selfComment: '',
                    evaluatorRating: 0,
                    evaluatorComment: ''
                });
            }

            qualitativeData.forEach((item, index) => {
                html += this.renderQualitativeItem(item, index, isEvaluatorMode);
            });

            if (!this.isReadOnly) {
                html += `
                    <div class="text-center mt-3">
                        <button type="button" class="btn btn-outline-primary add-qualitative-item-btn">
                            <i class="fas fa-plus me-2"></i>項目を追加
                        </button>
                    </div>
                `;
            }

            this.elements.qualitativeContainer.innerHTML = html;

            // 定性評価のイベントリスナーを設定
            this.setupQualitativeEventListeners();

            // 総ウェイトを更新
            this.updateTotalWeight();

        } catch (error) {
            console.error('定性評価描画エラー:', error);
            this.elements.qualitativeContainer.innerHTML = `
                <div class="alert alert-danger">
                    定性評価の読み込みに失敗しました
                </div>
            `;
        }
    }

    /**
     * 評価スケールのHTMLを生成
     */
    renderEvaluationScale(currentValue, isEditable) {
        let html = '';
        const criteria = this.getEvaluationCriteria();

        for (const criterion of criteria) {
            const isSelected = currentValue === criterion.value;
            const classes = `evaluation-scale-item ${isSelected ? 'selected' : ''} ${!isEditable ? 'readonly' : ''}`;
            
            html += `
                <div class="${classes}" data-value="${criterion.value}" title="${criterion.description}">
                    <div class="scale-value">${criterion.value}</div>
                    <div class="scale-label">${criterion.label}</div>
                </div>
            `;
        }

        return html;
    }

    /**
     * 定性評価項目のHTMLを生成
     */
    renderQualitativeItem(item, index, isEvaluatorMode) {
        const selfDisabled = this.isReadOnly || isEvaluatorMode;
        const evaluatorDisabled = this.isReadOnly || !isEvaluatorMode;

        return `
            <div class="qualitative-item border rounded p-3 mb-3" data-item-id="${item.id}">
                <div class="row">
                    <div class="col-md-6">
                        <div class="mb-3">
                            <label class="form-label">定性目標</label>
                            <textarea class="form-control qualitative-content" 
                                      rows="3" 
                                      placeholder="定性的な目標を記入してください"
                                      ${selfDisabled ? 'readonly' : ''}>${item.content}</textarea>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">ウェイト(%)</label>
                            <input type="number" 
                                   class="form-control qualitative-weight-input"
                                   min="0" 
                                   max="100" 
                                   step="10"
                                   value="${item.weight}"
                                   ${selfDisabled ? 'readonly' : ''}>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="mb-3">
                            <label class="form-label text-muted">自己評価</label>
                            <div class="evaluation-scale qualitative-scale" 
                                 data-item-id="${item.id}" 
                                 data-type="self">
                                ${this.renderEvaluationScale(item.selfRating, !selfDisabled)}
                            </div>
                            <textarea class="form-control mt-2 qualitative-self-comment" 
                                      rows="2" 
                                      placeholder="自己評価コメント"
                                      ${selfDisabled ? 'readonly' : ''}>${item.selfComment || ''}</textarea>
                        </div>
                        ${isEvaluatorMode || this.auth.hasRole('evaluator') ? `
                            <div class="mb-3">
                                <label class="form-label text-muted">評価者評価</label>
                                <div class="evaluation-scale qualitative-scale" 
                                     data-item-id="${item.id}" 
                                     data-type="evaluator">
                                    ${this.renderEvaluationScale(item.evaluatorRating, !evaluatorDisabled)}
                                </div>
                                <textarea class="form-control mt-2 qualitative-evaluator-comment" 
                                          rows="2" 
                                          placeholder="評価者コメント"
                                          ${evaluatorDisabled ? 'readonly' : ''}>${item.evaluatorComment || ''}</textarea>
                            </div>
                        ` : ''}
                    </div>
                </div>
                ${!this.isReadOnly && !isEvaluatorMode ? `
                    <div class="text-end">
                        <button type="button" class="btn btn-sm btn-outline-danger remove-qualitative-item-btn">
                            <i class="fas fa-times me-1"></i>削除
                        </button>
                    </div>
                ` : ''}
            </div>
        `;
    }

    /**
     * 定量評価のイベントリスナーを設定
     */
    setupQuantitativeEventListeners() {
        document.querySelectorAll('.evaluation-scale:not(.readonly) .evaluation-scale-item').forEach(item => {
            item.addEventListener('click', (event) => {
                const scaleContainer = event.target.closest('.evaluation-scale');
                const itemId = scaleContainer.getAttribute('data-item-id');
                const type = scaleContainer.getAttribute('data-type');
                const value = parseInt(event.target.closest('.evaluation-scale-item').getAttribute('data-value'));

                // 選択状態を更新
                scaleContainer.querySelectorAll('.evaluation-scale-item').forEach(el => {
                    el.classList.remove('selected');
                });
                event.target.closest('.evaluation-scale-item').classList.add('selected');

                // 一時データに保存
                if (!this.tempData.quantitative[itemId]) {
                    this.tempData.quantitative[itemId] = {};
                }
                this.tempData.quantitative[itemId][`${type}Rating`] = value;
            });
        });
    }

    /**
     * 定性評価のイベントリスナーを設定
     */
    setupQualitativeEventListeners() {
        // 定性評価スケールのクリック
        document.querySelectorAll('.qualitative-scale:not(.readonly) .evaluation-scale-item').forEach(item => {
            item.addEventListener('click', (event) => {
                const scaleContainer = event.target.closest('.evaluation-scale');
                const itemId = scaleContainer.getAttribute('data-item-id');
                const type = scaleContainer.getAttribute('data-type');
                const value = parseInt(event.target.closest('.evaluation-scale-item').getAttribute('data-value'));

                // 選択状態を更新
                scaleContainer.querySelectorAll('.evaluation-scale-item').forEach(el => {
                    el.classList.remove('selected');
                });
                event.target.closest('.evaluation-scale-item').classList.add('selected');

                // 一時データに保存
                this.updateQualitativeItemData(itemId, `${type}Rating`, value);
            });
        });

        // テキスト入力の変更
        document.querySelectorAll('.qualitative-content, .qualitative-self-comment, .qualitative-evaluator-comment').forEach(input => {
            input.addEventListener('change', (event) => {
                const itemElement = event.target.closest('.qualitative-item');
                const itemId = itemElement.getAttribute('data-item-id');
                const fieldName = event.target.classList.contains('qualitative-content') ? 'content' :
                                event.target.classList.contains('qualitative-self-comment') ? 'selfComment' : 'evaluatorComment';
                
                this.updateQualitativeItemData(itemId, fieldName, event.target.value);
            });
        });
    }

    /**
     * 定性評価項目データを更新
     */
    updateQualitativeItemData(itemId, fieldName, value) {
        if (!this.tempData.qualitative) {
            this.tempData.qualitative = [];
        }

        let item = this.tempData.qualitative.find(q => q.id === itemId);
        if (!item) {
            item = { id: itemId };
            this.tempData.qualitative.push(item);
        }

        item[fieldName] = value;
    }

    /**
     * 定性評価項目を追加
     */
    addQualitativeItem() {
        const newItem = {
            id: `qual-${Date.now()}`,
            content: '',
            weight: 0,
            selfRating: 0,
            selfComment: '',
            evaluatorRating: 0,
            evaluatorComment: ''
        };

        const isEvaluatorMode = this.currentUser.id !== this.evaluationData.userId;
        const itemHtml = this.renderQualitativeItem(newItem, 0, isEvaluatorMode);
        
        // 追加ボタンの前に挿入
        const addButton = this.elements.qualitativeContainer.querySelector('.add-qualitative-item-btn').closest('.text-center');
        addButton.insertAdjacentHTML('beforebegin', itemHtml);

        this.setupQualitativeEventListeners();
        this.updateTotalWeight();
    }

    /**
     * 定性評価項目を削除
     */
    removeQualitativeItem(itemElement) {
        const itemId = itemElement.getAttribute('data-item-id');
        
        // 一時データからも削除
        this.tempData.qualitative = this.tempData.qualitative.filter(q => q.id !== itemId);
        
        // DOMから削除
        itemElement.remove();
        
        this.updateTotalWeight();
    }

    /**
     * 総ウェイトを更新
     */
    updateTotalWeight() {
        const weightInputs = document.querySelectorAll('.qualitative-weight-input');
        let totalWeight = 0;

        weightInputs.forEach(input => {
            totalWeight += parseInt(input.value) || 0;
        });

        if (this.elements.totalWeightDisplay) {
            const isValid = totalWeight === 100;
            const className = isValid ? 'text-success' : 'text-danger';
            
            this.elements.totalWeightDisplay.innerHTML = `
                <span class="${className}">
                    <i class="fas ${isValid ? 'fa-check-circle' : 'fa-exclamation-triangle'} me-2"></i>
                    合計ウェイト: ${totalWeight}%
                </span>
            `;
        }

        return totalWeight;
    }

    /**
     * 評価を保存
     */
    async saveEvaluation(status) {
        try {
            // 入力データを収集
            const evaluationData = await this.collectEvaluationData();
            evaluationData.status = status;

            // バリデーション
            const validationErrors = this.validateEvaluationData(evaluationData);
            if (validationErrors.length > 0) {
                this.showValidationErrors(validationErrors);
                return;
            }

            // 保存処理
            const savedEvaluation = await this.saveEvaluationData(evaluationData);

            // 成功メッセージ
            const message = status === 'draft' ? '下書きを保存しました' : '評価を提出しました';
            this.showSuccessMessage(message);

            // モーダルを閉じる
            const modal = bootstrap.Modal.getInstance(this.elements.modal);
            modal?.hide();

            // ページを更新
            this.refreshCurrentPage();

        } catch (error) {
            console.error('評価保存エラー:', error);
            this.showErrorMessage('評価の保存に失敗しました');
        }
    }

    /**
     * 入力データを収集
     */
    async collectEvaluationData() {
        const data = {
            id: this.evaluationData.id,
            userId: this.evaluationData.userId,
            periodId: this.evaluationData.periodId,
            quantitative: { ...this.tempData.quantitative },
            qualitative: [...this.tempData.qualitative],
            updatedAt: new Date().toISOString()
        };

        // 定性評価データを収集
        document.querySelectorAll('.qualitative-item').forEach(itemElement => {
            const itemId = itemElement.getAttribute('data-item-id');
            const content = itemElement.querySelector('.qualitative-content').value;
            const weight = parseInt(itemElement.querySelector('.qualitative-weight-input').value) || 0;
            const selfComment = itemElement.querySelector('.qualitative-self-comment')?.value || '';
            const evaluatorComment = itemElement.querySelector('.qualitative-evaluator-comment')?.value || '';

            let item = data.qualitative.find(q => q.id === itemId);
            if (!item) {
                item = { id: itemId };
                data.qualitative.push(item);
            }

            Object.assign(item, {
                content,
                weight,
                selfComment,
                evaluatorComment
            });
        });

        return data;
    }

    /**
     * 評価データをバリデーション
     */
    validateEvaluationData(data) {
        const errors = [];

        // 定性評価のウェイト合計チェック
        if (data.qualitative && data.qualitative.length > 0) {
            const totalWeight = data.qualitative.reduce((sum, item) => 
                sum + (parseInt(item.weight) || 0), 0
            );
            
            if (totalWeight !== 100) {
                errors.push(`定性評価のウェイト合計が${totalWeight}%です。100%になるように調整してください。`);
            }
        }

        // 必須項目のチェック
        if (data.status === 'submitted') {
            // 提出時のバリデーション
            const hasQuantitative = Object.keys(data.quantitative).length > 0;
            const hasQualitative = data.qualitative && data.qualitative.length > 0;

            if (!hasQuantitative) {
                errors.push('定量評価が入力されていません。');
            }

            if (!hasQualitative) {
                errors.push('定性評価が入力されていません。');
            }
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
     * 評価データを保存
     */
    async saveEvaluationData(data) {
        // モックデータに保存（実際の実装ではAPIを使用）
        if (window.evaluationConfig && window.evaluationConfig.mockData) {
            const evaluations = window.evaluationConfig.mockData.evaluations;
            const existingIndex = evaluations.findIndex(e => e.id === data.id);
            
            if (existingIndex >= 0) {
                evaluations[existingIndex] = { ...evaluations[existingIndex], ...data };
            } else {
                evaluations.push(data);
            }
        }

        // データベースに保存
        if (this.database) {
            await this.database.put('evaluations', data);
        }

        return data;
    }

    /**
     * 現在のページを更新
     */
    refreshCurrentPage() {
        if (this.mode === 'subordinates') {
            this.loadSubordinatesList();
        } else {
            this.loadEvaluationsList();
        }
    }

    /**
     * アクティブな評価期間を取得
     */
    async getActivePeriod() {
        if (window.evaluationConfig && window.evaluationConfig.getActivePeriod) {
            return window.evaluationConfig.getActivePeriod();
        }
        return null;
    }

    /**
     * 全ての評価期間を取得
     */
    async getAllPeriods() {
        if (window.evaluationConfig && window.evaluationConfig.mockData) {
            return window.evaluationConfig.mockData.periods;
        }
        return [];
    }

    /**
     * ユーザーの評価一覧を取得
     */
    async getUserEvaluations(userId, periodId = '') {
        if (window.evaluationConfig && window.evaluationConfig.mockData) {
            let evaluations = window.evaluationConfig.mockData.evaluations
                .filter(e => e.userId === userId);
            
            if (periodId) {
                evaluations = evaluations.filter(e => e.periodId === periodId);
            }
            
            return evaluations.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
        }
        return [];
    }

    /**
     * 評価対象者の評価状況を取得
     */
    async getSubordinateEvaluations() {
        if (!this.auth.hasRole('evaluator')) return [];

        // dashboard.jsと同じロジックを使用
        const subordinates = [];

        if (window.evaluationConfig && window.evaluationConfig.mockData) {
            const users = window.evaluationConfig.mockData.users;
            const evaluations = window.evaluationConfig.mockData.evaluations;
            
            const subordinateUsers = users.filter(user => 
                user.role === 'employee' && 
                user.evaluator_id === this.currentUser.id
            );
            
            for (const user of subordinateUsers) {
                const evaluation = evaluations.find(e => 
                    e.userId === user.id && e.periodId === this.activePeriod?.id
                );
                
                subordinates.push({
                    userId: user.id,
                    userName: user.full_name,
                    position: user.position,
                    status: evaluation ? evaluation.status : 'not_started',
                    selfRating: evaluation ? evaluation.selfRating : null,
                    lastModified: evaluation ? evaluation.updatedAt : null
                });
            }
        }

        return subordinates;
    }

    /**
     * 評価データを取得
     */
    async getEvaluation(evaluationId) {
        if (window.evaluationConfig && window.evaluationConfig.mockData) {
            return window.evaluationConfig.mockData.evaluations.find(e => e.id === evaluationId);
        }
        return null;
    }

    /**
     * 新しい評価を作成
     */
    async createNewEvaluation(userId, periodId) {
        const user = await this.getUser(userId);
        const period = await this.getPeriod(periodId);
        
        return {
            id: `eval-${userId}-${periodId}`,
            userId: userId,
            userName: user ? user.full_name : 'Unknown',
            periodId: periodId,
            periodName: period ? period.name : 'Unknown',
            position: user ? user.position : 'Unknown',
            status: 'not_started',
            quantitative: {},
            qualitative: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
    }

    /**
     * ユーザー情報を取得
     */
    async getUser(userId) {
        if (window.evaluationConfig && window.evaluationConfig.mockData) {
            return window.evaluationConfig.mockData.users.find(u => u.id === userId);
        }
        return null;
    }

    /**
     * 期間情報を取得
     */
    async getPeriod(periodId) {
        if (window.evaluationConfig && window.evaluationConfig.mockData) {
            return window.evaluationConfig.mockData.periods.find(p => p.id === periodId);
        }
        return null;
    }

    /**
     * 評価カテゴリを取得
     */
    getEvaluationCategories() {
        const currentTenant = window.getCurrentTenant ? window.getCurrentTenant() : null;
        const categorySet = currentTenant ? currentTenant.settings.evaluationCategorySet : 'default';
        
        if (window.evaluationConfig && window.evaluationConfig.getEvaluationCategories) {
            return window.evaluationConfig.getEvaluationCategories(categorySet);
        }
        return [];
    }

    /**
     * 評価基準を取得
     */
    getEvaluationCriteria() {
        if (window.evaluationConfig && window.evaluationConfig.getEvaluationCriteria) {
            return window.evaluationConfig.getEvaluationCriteria('qualitative');
        }
        return [
            { value: 1, label: 'レベル1', description: '全く実行できなかった' },
            { value: 2, label: 'レベル2', description: '一部実行できた' },
            { value: 3, label: 'レベル3', description: '実行できたが設定内容以上までは出来なかった' },
            { value: 4, label: 'レベル4', description: '実行できた' },
            { value: 5, label: 'レベル5', description: '設定内容以上のことを行えた' }
        ];
    }

    /**
     * 評価を表示（読み取り専用）
     */
    async viewEvaluation(evaluationId) {
        await this.showEvaluationModal({ evaluationId, mode: 'view' });
    }

    /**
     * 評価を編集
     */
    async editEvaluation(evaluationId) {
        await this.showEvaluationModal({ evaluationId, mode: 'edit' });
    }

    /**
     * 部下を評価
     */
    async evaluateSubordinate(userId, userName) {
        if (!this.activePeriod) {
            this.showWarningMessage('アクティブな評価期間がありません');
            return;
        }

        await this.showEvaluationModal({
            userId,
            periodId: this.activePeriod.id,
            mode: 'evaluator'
        });
    }

    /**
     * 部下の評価を表示
     */
    async viewSubordinateEvaluation(userId) {
        if (!this.activePeriod) return;

        const evaluationId = `eval-${userId}-${this.activePeriod.id}`;
        await this.viewEvaluation(evaluationId);
    }

    /**
     * ステータスの表示テキストを取得
     */
    getStatusDisplayText(status) {
        const statusMap = {
            'not_started': '未開始',
            'draft': '下書き',
            'submitted': '提出済み',
            'approved_by_evaluator': '評価者承認済み',
            'approved_by_admin': '管理者承認済み'
        };
        return statusMap[status] || status;
    }

    /**
     * ステータスのCSSクラスを取得
     */
    getStatusClass(status) {
        const statusClassMap = {
            'not_started': 'bg-secondary',
            'draft': 'bg-warning text-dark',
            'submitted': 'bg-info',
            'approved_by_evaluator': 'bg-primary',
            'approved_by_admin': 'bg-success'
        };
        return statusClassMap[status] || 'bg-secondary';
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
     * 警告メッセージを表示
     */
    showWarningMessage(message) {
        if (window.app && window.app.showWarningNotification) {
            window.app.showWarningNotification('警告', message);
        } else {
            console.warn('警告:', message);
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
     * コンポーネントの破棄
     */
    destroy() {
        // イベントリスナーの削除
        // メモリクリア
        this.evaluationData = null;
        this.tempData = { quantitative: {}, qualitative: [] };
        this.elements = {};
        
        console.log('評価コンポーネントが破棄されました');
    }
}

// ========================================
// 評価コンポーネント初期化処理
// ========================================

/**
 * 評価ページの初期化
 */
function initializeEvaluationComponent(mode = 'default') {
    // アプリケーションオブジェクトが使用可能になるまで待機
    if (typeof window.app === 'undefined') {
        setTimeout(() => initializeEvaluationComponent(mode), 100);
        return;
    }
    
    // 評価コンポーネントのインスタンスを作成
    const evaluation = new EvaluationComponent(null, null, mode);
    
    // グローバルに登録
    if (!window.app.components) {
        window.app.components = {};
    }
    window.app.components.evaluation = evaluation;
    
    // 初期化を実行
    evaluation.initialize().catch(error => {
        console.error('評価コンポーネント初期化に失敗しました:', error);
    });
    
    return evaluation;
}

// ページ読み込み時の初期化
document.addEventListener('DOMContentLoaded', () => {
    // 評価一覧ページ
    if (document.getElementById('evaluations-page')) {
        initializeEvaluationComponent('default');
    }
    
    // 評価対象者一覧ページ
    if (document.getElementById('subordinates-page')) {
        initializeEvaluationComponent('subordinates');
    }
});

// グローバルに公開
window.EvaluationComponent = EvaluationComponent;
window.initializeEvaluationComponent = initializeEvaluationComponent;

console.log('EvaluationComponent が読み込まれました');
