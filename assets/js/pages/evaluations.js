/**
 * 評価一覧ページコントローラー
 * 建設業界の評価システムに特化した評価一覧管理
 */
class EvaluationsController {
    constructor() {
        this.evaluations = [];
        this.filteredEvaluations = [];
        this.currentFilter = {
            period: '',
            status: '',
            subordinate: '',
            search: ''
        };
        this.sortConfig = {
            field: 'updatedAt',
            direction: 'desc'
        };
        this.pagination = {
            currentPage: 1,
            itemsPerPage: 10,
            totalItems: 0
        };
        
        this.createPageStructure();
        this.bindEvents();
    }

    createPageStructure() {
        const mainContent = document.getElementById('main-content');
        if (!mainContent) return;

        mainContent.innerHTML = `
            <div class="evaluations-page">
                <div class="page-header">
                    <div class="header-content">
                        <h1>評価一覧</h1>
                        <div class="header-actions">
                            <button class="btn-primary" id="new-evaluation-btn">
                                <i class="icon-plus"></i>
                                新規評価
                            </button>
                            <button class="btn-secondary" id="export-btn">
                                <i class="icon-download"></i>
                                エクスポート
                            </button>
                        </div>
                    </div>
                </div>

                <!-- 統計情報 -->
                <div class="stats-section">
                    <div class="stat-card">
                        <div class="stat-number" id="total-evaluations">0</div>
                        <div class="stat-label">総評価数</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number" id="pending-evaluations">0</div>
                        <div class="stat-label">未完了</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number" id="completed-evaluations">0</div>
                        <div class="stat-label">完了済み</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number" id="avg-score">0.0</div>
                        <div class="stat-label">平均評価</div>
                    </div>
                </div>

                <!-- フィルター・検索エリア -->
                <div class="filters-section">
                    <div class="search-box">
                        <input 
                            type="text" 
                            id="search-input" 
                            placeholder="名前、コメントで検索..."
                            class="search-input"
                        >
                        <i class="search-icon icon-search"></i>
                    </div>
                    
                    <div class="filter-controls">
                        <select id="period-filter" class="filter-select">
                            <option value="">すべての期間</option>
                        </select>
                        
                        <select id="status-filter" class="filter-select">
                            <option value="">すべてのステータス</option>
                            <option value="draft">下書き</option>
                            <option value="submitted">提出済み</option>
                            <option value="approved">承認済み</option>
                            <option value="completed">完了</option>
                        </select>
                        
                        <select id="subordinate-filter" class="filter-select">
                            <option value="">すべての対象者</option>
                        </select>
                        
                        <button id="clear-filters-btn" class="btn-text">
                            フィルタークリア
                        </button>
                    </div>
                </div>

                <!-- 評価一覧テーブル -->
                <div class="table-container">
                    <div class="table-header">
                        <div class="table-controls">
                            <select id="items-per-page" class="items-per-page-select">
                                <option value="10">10件表示</option>
                                <option value="25">25件表示</option>
                                <option value="50">50件表示</option>
                            </select>
                            
                            <select id="sort-select" class="sort-select">
                                <option value="updatedAt-desc">更新日時（新しい順）</option>
                                <option value="updatedAt-asc">更新日時（古い順）</option>
                                <option value="createdAt-desc">作成日時（新しい順）</option>
                                <option value="createdAt-asc">作成日時（古い順）</option>
                                <option value="subordinateName-asc">対象者名（昇順）</option>
                                <option value="subordinateName-desc">対象者名（降順）</option>
                                <option value="overallRating-desc">総合評価（高い順）</option>
                                <option value="overallRating-asc">総合評価（低い順）</option>
                            </select>
                        </div>
                    </div>

                    <table class="evaluations-table">
                        <thead>
                            <tr>
                                <th class="period-column">評価期間</th>
                                <th class="subordinate-column">評価対象者</th>
                                <th class="evaluator-column">評価者</th>
                                <th class="rating-column">総合評価</th>
                                <th class="progress-column">進捗</th>
                                <th class="status-column">ステータス</th>
                                <th class="date-column">更新日時</th>
                                <th class="actions-column">操作</th>
                            </tr>
                        </thead>
                        <tbody id="evaluations-table-body">
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
                </div>

                <!-- ローディング表示 -->
                <div id="evaluations-loading" class="loading-overlay" style="display: none;">
                    <div class="loading-spinner"></div>
                    <div class="loading-text">読み込み中...</div>
                </div>

                <!-- 空の状態 -->
                <div id="empty-state" class="empty-state" style="display: none;">
                    <div class="empty-icon">
                        <i class="icon-clipboard"></i>
                    </div>
                    <h3>評価がありません</h3>
                    <p>まだ評価が作成されていません。最初の評価を作成してみましょう。</p>
                    <button class="btn-primary" onclick="document.getElementById('new-evaluation-btn').click()">
                        最初の評価を作成
                    </button>
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
            if (e.target.id === 'period-filter') {
                this.currentFilter.period = e.target.value;
                this.applyFilters();
            } else if (e.target.id === 'status-filter') {
                this.currentFilter.status = e.target.value;
                this.applyFilters();
            } else if (e.target.id === 'subordinate-filter') {
                this.currentFilter.subordinate = e.target.value;
                this.applyFilters();
            } else if (e.target.id === 'items-per-page') {
                this.pagination.itemsPerPage = parseInt(e.target.value);
                this.pagination.currentPage = 1;
                this.renderTable();
            } else if (e.target.id === 'sort-select') {
                const [field, direction] = e.target.value.split('-');
                this.sortConfig.field = field;
                this.sortConfig.direction = direction;
                this.applySorting();
                this.renderTable();
            }
        });

        // ボタンクリック
        document.addEventListener('click', (e) => {
            if (e.target.id === 'new-evaluation-btn') {
                this.createNewEvaluation();
            } else if (e.target.id === 'export-btn') {
                this.exportEvaluations();
            } else if (e.target.id === 'clear-filters-btn') {
                this.clearFilters();
            } else if (e.target.classList.contains('view-evaluation-btn')) {
                this.viewEvaluation(e.target.dataset.evaluationId);
            } else if (e.target.classList.contains('edit-evaluation-btn')) {
                this.editEvaluation(e.target.dataset.evaluationId);
            } else if (e.target.classList.contains('delete-evaluation-btn')) {
                this.deleteEvaluation(e.target.dataset.evaluationId);
            } else if (e.target.classList.contains('page-number')) {
                this.goToPage(parseInt(e.target.dataset.page));
            } else if (e.target.id === 'prev-page-btn') {
                this.goToPage(this.pagination.currentPage - 1);
            } else if (e.target.id === 'next-page-btn') {
                this.goToPage(this.pagination.currentPage + 1);
            }
        });
    }

    async render() {
        this.showLoading();
        try {
            await this.loadEvaluations();
            await this.loadFilterOptions();
            this.updateStats();
            this.applyFilters();
        } catch (error) {
            console.error('評価一覧の読み込みに失敗:', error);
            window.notification.show('評価一覧の読み込みに失敗しました', 'error');
        } finally {
            this.hideLoading();
        }
    }

    async loadEvaluations() {
        try {
            this.evaluations = await window.api.getEvaluations();
        } catch (error) {
            console.error('評価データの取得に失敗:', error);
            this.evaluations = [];
            throw error;
        }
    }

    async loadFilterOptions() {
        try {
            // 評価期間の選択肢を読み込み
            const periods = await window.api.getEvaluationPeriods();
            const periodSelect = document.getElementById('period-filter');
            if (periodSelect) {
                periods.forEach(period => {
                    const option = document.createElement('option');
                    option.value = period.id;
                    option.textContent = `${period.name} (${period.startDate} 〜 ${period.endDate})`;
                    periodSelect.appendChild(option);
                });
            }

            // 評価対象者の選択肢を読み込み
            const subordinates = await window.api.getSubordinates();
            const subordinateSelect = document.getElementById('subordinate-filter');
            if (subordinateSelect) {
                subordinates.forEach(subordinate => {
                    const option = document.createElement('option');
                    option.value = subordinate.id;
                    option.textContent = `${subordinate.name} (${subordinate.position})`;
                    subordinateSelect.appendChild(option);
                });
            }

        } catch (error) {
            console.error('フィルターオプションの読み込みに失敗:', error);
        }
    }

    updateStats() {
        const total = this.evaluations.length;
        const pending = this.evaluations.filter(e => e.status === 'draft' || e.status === 'submitted').length;
        const completed = this.evaluations.filter(e => e.status === 'completed').length;
        const avgScore = total > 0 ? 
            this.evaluations.reduce((sum, e) => sum + (e.overallRating || 0), 0) / total : 0;

        document.getElementById('total-evaluations').textContent = total;
        document.getElementById('pending-evaluations').textContent = pending;
        document.getElementById('completed-evaluations').textContent = completed;
        document.getElementById('avg-score').textContent = avgScore.toFixed(1);
    }

    applyFilters() {
        this.filteredEvaluations = this.evaluations.filter(evaluation => {
            // 期間フィルター
            if (this.currentFilter.period && evaluation.evaluationPeriod !== this.currentFilter.period) {
                return false;
            }

            // ステータスフィルター
            if (this.currentFilter.status && evaluation.status !== this.currentFilter.status) {
                return false;
            }

            // 評価対象者フィルター
            if (this.currentFilter.subordinate && evaluation.subordinateId !== this.currentFilter.subordinate) {
                return false;
            }

            // 検索フィルター
            if (this.currentFilter.search) {
                const searchTerm = this.currentFilter.search.toLowerCase();
                const searchableText = [
                    evaluation.subordinateName,
                    evaluation.evaluatorName,
                    evaluation.overallComment,
                    evaluation.improvementSuggestions
                ].join(' ').toLowerCase();
                
                if (!searchableText.includes(searchTerm)) {
                    return false;
                }
            }

            return true;
        });

        this.applySorting();
        this.pagination.currentPage = 1;
        this.pagination.totalItems = this.filteredEvaluations.length;
        this.renderTable();
    }

    applySorting() {
        this.filteredEvaluations.sort((a, b) => {
            const field = this.sortConfig.field;
            let aValue = a[field];
            let bValue = b[field];

            // 日付フィールドの特別処理
            if (field.includes('At') || field.includes('Date')) {
                aValue = new Date(aValue || 0);
                bValue = new Date(bValue || 0);
            }

            // 数値フィールドの特別処理
            if (field === 'overallRating') {
                aValue = aValue || 0;
                bValue = bValue || 0;
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

    renderTable() {
        const tbody = document.getElementById('evaluations-table-body');
        const emptyState = document.getElementById('empty-state');
        
        if (!tbody) return;

        // ページネーション計算
        const startIndex = (this.pagination.currentPage - 1) * this.pagination.itemsPerPage;
        const endIndex = startIndex + this.pagination.itemsPerPage;
        const pageEvaluations = this.filteredEvaluations.slice(startIndex, endIndex);

        if (this.filteredEvaluations.length === 0) {
            tbody.innerHTML = '';
            if (emptyState) emptyState.style.display = 'block';
            return;
        }

        if (emptyState) emptyState.style.display = 'none';

        tbody.innerHTML = pageEvaluations.map(evaluation => `
            <tr class="evaluation-row" data-evaluation-id="${evaluation.id}">
                <td class="period-cell">
                    <div class="period-info">
                        <div class="period-name">${this.escapeHtml(evaluation.evaluationPeriodName || '未設定')}</div>
                        <div class="period-dates">${evaluation.periodStartDate || ''} 〜 ${evaluation.periodEndDate || ''}</div>
                    </div>
                </td>
                <td class="subordinate-cell">
                    <div class="user-info">
                        <div class="user-avatar">
                            ${evaluation.subordinateName ? evaluation.subordinateName.charAt(0).toUpperCase() : '?'}
                        </div>
                        <div class="user-details">
                            <div class="user-name">${this.escapeHtml(evaluation.subordinateName || '未設定')}</div>
                            <div class="user-position">${this.escapeHtml(evaluation.subordinatePosition || '')}</div>
                        </div>
                    </div>
                </td>
                <td class="evaluator-cell">
                    <div class="evaluator-name">${this.escapeHtml(evaluation.evaluatorName || '未設定')}</div>
                </td>
                <td class="rating-cell">
                    ${evaluation.overallRating ? `
                        <div class="rating-display">
                            <div class="rating-stars">
                                ${this.renderStars(evaluation.overallRating)}
                            </div>
                            <div class="rating-number">${evaluation.overallRating}/5</div>
                        </div>
                    ` : '<span class="text-muted">未評価</span>'}
                </td>
                <td class="progress-cell">
                    <div class="progress-info">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${this.calculateProgress(evaluation)}%"></div>
                        </div>
                        <div class="progress-text">${this.calculateProgress(evaluation)}%</div>
                    </div>
                </td>
                <td class="status-cell">
                    <span class="status-badge status-${evaluation.status}">
                        ${this.getStatusDisplayName(evaluation.status)}
                    </span>
                </td>
                <td class="date-cell">
                    <div class="date-info">
                        <div class="date-main">${this.formatDate(evaluation.updatedAt)}</div>
                        <div class="date-sub">作成: ${this.formatDate(evaluation.createdAt)}</div>
                    </div>
                </td>
                <td class="actions-cell">
                    <div class="action-buttons">
                        <button 
                            class="action-btn view-evaluation-btn" 
                            data-evaluation-id="${evaluation.id}"
                            title="詳細表示"
                        >
                            <i class="icon-eye"></i>
                        </button>
                        <button 
                            class="action-btn edit-evaluation-btn" 
                            data-evaluation-id="${evaluation.id}"
                            title="編集"
                            ${evaluation.status === 'completed' ? 'disabled' : ''}
                        >
                            <i class="icon-edit"></i>
                        </button>
                        <button 
                            class="action-btn delete-evaluation-btn" 
                            data-evaluation-id="${evaluation.id}"
                            title="削除"
                            ${evaluation.status === 'completed' ? 'disabled' : ''}
                        >
                            <i class="icon-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');

        this.renderPagination();
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
        const delta = 2;

        if (total <= 7) {
            for (let i = 1; i <= total; i++) {
                pages.push(i);
            }
        } else {
            pages.push(1);
            const start = Math.max(2, current - delta);
            const end = Math.min(total - 1, current + delta);

            if (start > 2) pages.push('...');
            for (let i = start; i <= end; i++) {
                pages.push(i);
            }
            if (end < total - 1) pages.push('...');
            if (total > 1) pages.push(total);
        }

        return pages;
    }

    goToPage(page) {
        const totalPages = Math.ceil(this.pagination.totalItems / this.pagination.itemsPerPage);
        if (page >= 1 && page <= totalPages) {
            this.pagination.currentPage = page;
            this.renderTable();
        }
    }

    clearFilters() {
        this.currentFilter = {
            period: '',
            status: '',
            subordinate: '',
            search: ''
        };

        // UI更新
        document.getElementById('search-input').value = '';
        document.getElementById('period-filter').value = '';
        document.getElementById('status-filter').value = '';
        document.getElementById('subordinate-filter').value = '';

        this.applyFilters();
    }

    createNewEvaluation() {
        if (window.router) {
            window.router.navigate('/evaluations/new');
        }
    }

    viewEvaluation(evaluationId) {
        if (window.router) {
            window.router.navigate(`/evaluations/${evaluationId}`);
        }
    }

    editEvaluation(evaluationId) {
        if (window.router) {
            window.router.navigate(`/evaluations/${evaluationId}/edit`);
        }
    }

    async deleteEvaluation(evaluationId) {
        const evaluation = this.evaluations.find(e => e.id === evaluationId);
        if (!evaluation) return;

        if (evaluation.status === 'completed') {
            window.notification.show('完了済みの評価は削除できません', 'error');
            return;
        }

        const confirmed = confirm(`${evaluation.subordinateName}の評価を削除しますか？\nこの操作は取り消せません。`);
        if (!confirmed) return;

        try {
            await window.api.deleteEvaluation(evaluationId);
            window.notification.show('評価を削除しました', 'success');
            
            await this.loadEvaluations();
            this.updateStats();
            this.applyFilters();

        } catch (error) {
            console.error('評価の削除に失敗:', error);
            window.notification.show('評価の削除に失敗しました', 'error');
        }
    }

    async exportEvaluations() {
        try {
            const csvData = this.generateCSV(this.filteredEvaluations);
            this.downloadCSV(csvData, 'evaluations.csv');
            window.notification.show('CSVファイルをダウンロードしました', 'success');
        } catch (error) {
            console.error('エクスポートに失敗:', error);
            window.notification.show('エクスポートに失敗しました', 'error');
        }
    }

    generateCSV(evaluations) {
        const headers = [
            '評価期間',
            '評価対象者',
            '評価者',
            '総合評価',
            '進捗率',
            'ステータス',
            '作成日時',
            '更新日時',
            '総合コメント',
            '改善提案'
        ];

        const rows = evaluations.map(evaluation => [
            evaluation.evaluationPeriodName || '',
            evaluation.subordinateName || '',
            evaluation.evaluatorName || '',
            evaluation.overallRating || '',
            `${this.calculateProgress(evaluation)}%`,
            this.getStatusDisplayName(evaluation.status),
            this.formatDate(evaluation.createdAt),
            this.formatDate(evaluation.updatedAt),
            evaluation.overallComment || '',
            evaluation.improvementSuggestions || ''
        ]);

        return [headers, ...rows]
            .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
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

    // ユーティリティメソッド
    calculateProgress(evaluation) {
        if (!evaluation) return 0;
        
        let progress = 0;
        
        // 基本情報が入力されている
        if (evaluation.subordinateId && evaluation.evaluationPeriod) {
            progress += 20;
        }
        
        // 定量評価が入力されている
        if (evaluation.ratings && Object.keys(evaluation.ratings).length > 0) {
            progress += 30;
        }
        
        // 定性評価のコメントが入力されている
        if (evaluation.comments && Object.keys(evaluation.comments).length > 0) {
            progress += 25;
        }
        
        // 総合評価が入力されている
        if (evaluation.overallRating) {
            progress += 15;
        }
        
        // 提出済み
        if (evaluation.status === 'submitted' || evaluation.status === 'completed') {
            progress = 100;
        }
        
        return Math.min(progress, 100);
    }

    renderStars(rating) {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            if (i <= rating) {
                stars.push('<i class="icon-star-filled"></i>');
            } else {
                stars.push('<i class="icon-star"></i>');
            }
        }
        return stars.join('');
    }

    getStatusDisplayName(status) {
        const statusNames = {
            draft: '下書き',
            submitted: '提出済み',
            approved: '承認済み',
            completed: '完了'
        };
        return statusNames[status] || status;
    }

    formatDate(dateString) {
        if (!dateString) return '';
        
        const date = new Date(dateString);
        const now = new Date();
        const diffInHours = (now - date) / (1000 * 60 * 60);
        
        if (diffInHours < 24) {
            return date.toLocaleTimeString('ja-JP', {
                hour: '2-digit',
                minute: '2-digit'
            });
        } else if (diffInHours < 24 * 7) {
            return date.toLocaleDateString('ja-JP', {
                month: 'numeric',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } else {
            return date.toLocaleDateString('ja-JP', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            });
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
        const loading = document.getElementById('evaluations-loading');
        if (loading) loading.style.display = 'flex';
    }

    hideLoading() {
        const loading = document.getElementById('evaluations-loading');
        if (loading) loading.style.display = 'none';
    }

    // 詳細検索機能
    openAdvancedSearch() {
        // 詳細検索モーダルを表示
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>詳細検索</h2>
                    <button class="modal-close">
                        <i class="icon-x"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <form id="advanced-search-form">
                        <div class="form-section">
                            <h3>日付範囲</h3>
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="date-from">開始日</label>
                                    <input type="date" id="date-from" name="dateFrom">
                                </div>
                                <div class="form-group">
                                    <label for="date-to">終了日</label>
                                    <input type="date" id="date-to" name="dateTo">
                                </div>
                            </div>
                        </div>
                        
                        <div class="form-section">
                            <h3>評価範囲</h3>
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="rating-min">最低評価</label>
                                    <select id="rating-min" name="ratingMin">
                                        <option value="">指定なし</option>
                                        <option value="1">1</option>
                                        <option value="2">2</option>
                                        <option value="3">3</option>
                                        <option value="4">4</option>
                                        <option value="5">5</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label for="rating-max">最高評価</label>
                                    <select id="rating-max" name="ratingMax">
                                        <option value="">指定なし</option>
                                        <option value="1">1</option>
                                        <option value="2">2</option>
                                        <option value="3">3</option>
                                        <option value="4">4</option>
                                        <option value="5">5</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        
                        <div class="form-section">
                            <h3>キーワード検索</h3>
                            <div class="form-group">
                                <label for="keyword-search">キーワード</label>
                                <input type="text" id="keyword-search" name="keyword" 
                                       placeholder="コメント、改善提案などから検索">
                            </div>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn-secondary" onclick="this.closest('.modal').remove()">
                        キャンセル
                    </button>
                    <button type="button" class="btn-primary" onclick="this.closest('.modal').remove()">
                        検索実行
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        modal.style.display = 'flex';
    }

    // 一括操作
    async bulkStatusUpdate(evaluationIds, newStatus) {
        try {
            await window.api.bulkUpdateEvaluations(evaluationIds, { status: newStatus });
            window.notification.show(`${evaluationIds.length}件の評価ステータスを更新しました`, 'success');
            
            await this.loadEvaluations();
            this.updateStats();
            this.applyFilters();
            
        } catch (error) {
            console.error('一括更新に失敗:', error);
            window.notification.show('一括更新に失敗しました', 'error');
        }
    }

    // 評価の複製
    async duplicateEvaluation(evaluationId) {
        try {
            const originalEvaluation = await window.api.getEvaluationById(evaluationId);
            if (!originalEvaluation) {
                throw new Error('元の評価が見つかりません');
            }

            // 複製用のデータを準備
            const duplicateData = {
                ...originalEvaluation,
                id: undefined,
                status: 'draft',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            const newEvaluation = await window.api.createEvaluation(duplicateData);
            window.notification.show('評価を複製しました', 'success');
            
            // 新しい評価の編集画面に遷移
            if (window.router) {
                window.router.navigate(`/evaluations/${newEvaluation.id}/edit`);
            }

        } catch (error) {
            console.error('評価の複製に失敗:', error);
            window.notification.show('評価の複製に失敗しました', 'error');
        }
    }

    // 印刷機能
    printEvaluations() {
        const printWindow = window.open('', '_blank');
        const printContent = this.generatePrintContent(this.filteredEvaluations);
        
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>評価一覧</title>
                <style>
                    body { font-family: Arial, sans-serif; font-size: 12px; }
                    table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                    th { background-color: #f5f5f5; font-weight: bold; }
                    .header { text-align: center; margin-bottom: 30px; }
                    .footer { margin-top: 30px; text-align: center; font-size: 10px; }
                    @media print { .no-print { display: none; } }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>評価一覧</h1>
                    <p>印刷日時: ${new Date().toLocaleString('ja-JP')}</p>
                </div>
                ${printContent}
                <div class="footer">
                    <p>建設業評価システム</p>
                </div>
            </body>
            </html>
        `);
        
        printWindow.document.close();
        printWindow.print();
    }

    generatePrintContent(evaluations) {
        const rows = evaluations.map(evaluation => `
            <tr>
                <td>${evaluation.evaluationPeriodName || ''}</td>
                <td>${evaluation.subordinateName || ''}</td>
                <td>${evaluation.evaluatorName || ''}</td>
                <td>${evaluation.overallRating || ''}</td>
                <td>${this.getStatusDisplayName(evaluation.status)}</td>
                <td>${this.formatDate(evaluation.updatedAt)}</td>
            </tr>
        `).join('');

        return `
            <table>
                <thead>
                    <tr>
                        <th>評価期間</th>
                        <th>評価対象者</th>
                        <th>評価者</th>
                        <th>総合評価</th>
                        <th>ステータス</th>
                        <th>更新日時</th>
                    </tr>
                </thead>
                <tbody>
                    ${rows}
                </tbody>
            </table>
        `;
    }
}

// グローバルインスタンス
window.evaluations = new EvaluationsController();
