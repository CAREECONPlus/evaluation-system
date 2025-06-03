/**
 * ダッシュボードページコントローラー
 * 建設業界の評価システムに特化したダッシュボード表示
 */
class DashboardController {
    constructor() {
        this.statsData = {};
        this.recentEvaluations = [];
        this.upcomingDeadlines = [];
        this.refreshInterval = null;
        
        console.log('Dashboard controller initialized');
    }

    async render() {
        const mainContent = document.getElementById('main-content');
        if (!mainContent) return;

        // ローディング表示
        this.showLoading();

        try {
            await this.loadDashboardData();
            this.createDashboardStructure();
            this.populateData();
            this.setupEventListeners();
            this.startAutoRefresh();
        } catch (error) {
            console.error('Dashboard render failed:', error);
            this.showError('ダッシュボードの読み込みに失敗しました');
        } finally {
            this.hideLoading();
        }
    }

    createDashboardStructure() {
        const mainContent = document.getElementById('main-content');
        if (!mainContent) return;

        mainContent.innerHTML = `
            <div class="dashboard-page">
                <!-- ページヘッダー -->
                <div class="page-header">
                    <div class="header-content">
                        <h1>ダッシュボード</h1>
                        <div class="header-actions">
                            <button class="btn-secondary" id="refresh-dashboard">
                                <i class="icon-refresh"></i>
                                更新
                            </button>
                            <button class="btn-primary" id="new-evaluation-btn">
                                <i class="icon-plus"></i>
                                新規評価
                            </button>
                        </div>
                    </div>
                </div>

                <!-- 統計カード -->
                <div class="stats-section">
                    <div class="stats-grid">
                        <div class="stat-card" id="total-evaluations-card">
                            <div class="stat-header">
                                <span class="stat-title">総評価数</span>
                                <i class="stat-icon icon-clipboard"></i>
                            </div>
                            <div class="stat-number" id="total-evaluations">0</div>
                            <div class="stat-change positive" id="total-change">
                                <i class="icon-trend-up"></i>
                                <span>+5.2% 前月比</span>
                            </div>
                        </div>

                        <div class="stat-card" id="pending-evaluations-card">
                            <div class="stat-header">
                                <span class="stat-title">未完了評価</span>
                                <i class="stat-icon icon-clock"></i>
                            </div>
                            <div class="stat-number" id="pending-evaluations">0</div>
                            <div class="stat-change neutral" id="pending-change">
                                <i class="icon-minus"></i>
                                <span>前月と同じ</span>
                            </div>
                        </div>

                        <div class="stat-card" id="average-score-card">
                            <div class="stat-header">
                                <span class="stat-title">平均評価</span>
                                <i class="stat-icon icon-star"></i>
                            </div>
                            <div class="stat-number" id="average-score">0.0</div>
                            <div class="stat-change positive" id="score-change">
                                <i class="icon-trend-up"></i>
                                <span>+0.3 前月比</span>
                            </div>
                        </div>

                        <div class="stat-card" id="completion-rate-card">
                            <div class="stat-header">
                                <span class="stat-title">完了率</span>
                                <i class="stat-icon icon-check-circle"></i>
                            </div>
                            <div class="stat-number" id="completion-rate">0%</div>
                            <div class="stat-change positive" id="completion-change">
                                <i class="icon-trend-up"></i>
                                <span>+12% 前月比</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- メインコンテンツグリッド -->
                <div class="dashboard-grid">
                    <!-- 最近の評価活動 -->
                    <div class="dashboard-card recent-evaluations-card">
                        <div class="card-header">
                            <h2>最近の評価活動</h2>
                            <a href="#" class="view-all-link" id="view-all-evaluations">
                                すべて表示 <i class="icon-arrow-right"></i>
                            </a>
                        </div>
                        <div class="card-content">
                            <div id="recent-evaluations-list" class="recent-evaluations-list">
                                <!-- 動的に生成 -->
                            </div>
                        </div>
                    </div>

                    <!-- 評価進捗チャート -->
                    <div class="dashboard-card chart-card">
                        <div class="card-header">
                            <h2>月別評価進捗</h2>
                            <div class="chart-controls">
                                <select id="chart-period" class="chart-period-select">
                                    <option value="6months">過去6ヶ月</option>
                                    <option value="1year">過去1年</option>
                                </select>
                            </div>
                        </div>
                        <div class="card-content">
                            <canvas id="evaluation-progress-chart" width="400" height="200"></canvas>
                        </div>
                    </div>

                    <!-- 評価期限アラート -->
                    <div class="dashboard-card deadlines-card">
                        <div class="card-header">
                            <h2>評価期限</h2>
                            <span class="urgent-badge" id="urgent-count">0</span>
                        </div>
                        <div class="card-content">
                            <div id="upcoming-deadlines" class="deadlines-list">
                                <!-- 動的に生成 -->
                            </div>
                        </div>
                    </div>

                    <!-- クイックアクション -->
                    <div class="dashboard-card quick-actions-card">
                        <div class="card-header">
                            <h2>クイックアクション</h2>
                        </div>
                        <div class="card-content">
                            <div class="quick-actions-grid">
                                <button class="quick-action-btn" id="start-evaluation">
                                    <i class="icon-edit"></i>
                                    <span>評価開始</span>
                                </button>
                                <button class="quick-action-btn" id="view-reports">
                                    <i class="icon-chart"></i>
                                    <span>レポート表示</span>
                                </button>
                                <button class="quick-action-btn" id="manage-users">
                                    <i class="icon-users"></i>
                                    <span>ユーザー管理</span>
                                </button>
                                <button class="quick-action-btn" id="export-data">
                                    <i class="icon-download"></i>
                                    <span>データ出力</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- 評価分布 -->
                    <div class="dashboard-card distribution-card">
                        <div class="card-header">
                            <h2>評価分布</h2>
                        </div>
                        <div class="card-content">
                            <canvas id="evaluation-distribution-chart" width="300" height="300"></canvas>
                        </div>
                    </div>
                </div>

                <!-- 通知・アラート -->
                <div id="dashboard-alerts" class="dashboard-alerts">
                    <!-- 動的に生成 -->
                </div>
            </div>
        `;
    }

    async loadDashboardData() {
        try {
            if (window.api) {
                // APIから実際のデータを取得
                const [stats, recentEvals, deadlines] = await Promise.all([
                    window.api.getDashboardStats(),
                    window.api.getEvaluations({ limit: 5, sort: 'updatedAt', order: 'desc' }),
                    window.api.getUpcomingDeadlines()
                ]);

                this.statsData = stats;
                this.recentEvaluations = recentEvals;
                this.upcomingDeadlines = deadlines;
            } else {
                // モックデータを使用
                this.generateMockData();
            }
        } catch (error) {
            console.error('Failed to load dashboard data:', error);
            this.generateMockData();
        }
    }

    generateMockData() {
        // モックデータの生成
        this.statsData = {
            totalEvaluations: 127,
            pendingEvaluations: 23,
            averageScore: 4.2,
            completionRate: 87
        };

        this.recentEvaluations = [
            {
                id: '1',
                subordinateName: '田中 太郎',
                evaluatorName: '佐藤 花子',
                status: 'completed',
                updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
                overallRating: 4.5
            },
            {
                id: '2',
                subordinateName: '山田 次郎',
                evaluatorName: '鈴木 一郎',
                status: 'pending',
                updatedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
                overallRating: null
            },
            {
                id: '3',
                subordinateName: '伊藤 三郎',
                evaluatorName: '佐藤 花子',
                status: 'submitted',
                updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
                overallRating: 3.8
            }
        ];

        this.upcomingDeadlines = [
            {
                id: '1',
                title: '第2四半期評価',
                deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
                priority: 'high',
                remainingDays: 3
            },
            {
                id: '2',
                title: '新人評価期間',
                deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                priority: 'medium',
                remainingDays: 7
            }
        ];
    }

    populateData() {
        // 統計データの表示
        document.getElementById('total-evaluations').textContent = this.statsData.totalEvaluations || 0;
        document.getElementById('pending-evaluations').textContent = this.statsData.pendingEvaluations || 0;
        document.getElementById('average-score').textContent = (this.statsData.averageScore || 0).toFixed(1);
        document.getElementById('completion-rate').textContent = `${this.statsData.completionRate || 0}%`;

        // 最近の評価活動
        this.renderRecentEvaluations();

        // 期限アラート
        this.renderUpcomingDeadlines();

        // チャートの描画
        this.renderCharts();
    }

    renderRecentEvaluations() {
        const container = document.getElementById('recent-evaluations-list');
        if (!container) return;

        if (this.recentEvaluations.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="icon-clipboard"></i>
                    <p>最近の評価活動がありません</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.recentEvaluations.map(evaluation => `
            <div class="recent-evaluation-item" data-evaluation-id="${evaluation.id}">
                <div class="evaluation-info">
                    <div class="evaluation-participants">
                        <span class="subordinate">${evaluation.subordinateName}</span>
                        <span class="evaluator">評価者: ${evaluation.evaluatorName}</span>
                    </div>
                    <div class="evaluation-meta">
                        <span class="status-badge status-${evaluation.status}">
                            ${this.getStatusDisplayName(evaluation.status)}
                        </span>
                        ${evaluation.overallRating ? `
                            <div class="rating-display">
                                ${this.renderStars(evaluation.overallRating)}
                                <span class="rating-number">${evaluation.overallRating}</span>
                            </div>
                        ` : ''}
                    </div>
                </div>
                <div class="evaluation-time">
                    ${this.formatRelativeTime(evaluation.updatedAt)}
                </div>
            </div>
        `).join('');
    }

    renderUpcomingDeadlines() {
        const container = document.getElementById('upcoming-deadlines');
        const urgentCount = document.getElementById('urgent-count');
        
        if (!container) return;

        const urgentDeadlines = this.upcomingDeadlines.filter(d => d.priority === 'high');
        if (urgentCount) {
            urgentCount.textContent = urgentDeadlines.length;
            urgentCount.style.display = urgentDeadlines.length > 0 ? 'inline' : 'none';
        }

        if (this.upcomingDeadlines.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="icon-calendar"></i>
                    <p>期限の迫った評価はありません</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.upcomingDeadlines.map(deadline => `
            <div class="deadline-item priority-${deadline.priority}">
                <div class="deadline-info">
                    <h4>${deadline.title}</h4>
                    <p class="deadline-date">${this.formatDate(deadline.deadline)}</p>
                </div>
                <div class="deadline-countdown">
                    <span class="days-remaining">${deadline.remainingDays}日</span>
                    <span class="remaining-label">残り</span>
                </div>
            </div>
        `).join('');
    }

    renderCharts() {
        // 評価進捗チャート
        this.renderProgressChart();
        
        // 評価分布チャート
        this.renderDistributionChart();
    }

    renderProgressChart() {
        const canvas = document.getElementById('evaluation-progress-chart');
        if (!canvas) return;

        // Chart.jsが利用可能かチェック
        if (typeof Chart === 'undefined') {
            canvas.parentElement.innerHTML = '<p>チャートライブラリが読み込まれていません</p>';
            return;
        }

        const ctx = canvas.getContext('2d');
        
        // モックデータ
        const chartData = {
            labels: ['1月', '2月', '3月', '4月', '5月', '6月'],
            datasets: [{
                label: '完了した評価',
                data: [12, 19, 15, 25, 22, 30],
                borderColor: '#4CAF50',
                backgroundColor: 'rgba(76, 175, 80, 0.1)',
                fill: true
            }, {
                label: '未完了の評価',
                data: [3, 5, 8, 6, 4, 2],
                borderColor: '#FF9800',
                backgroundColor: 'rgba(255, 152, 0, 0.1)',
                fill: true
            }]
        };

        new Chart(ctx, {
            type: 'line',
            data: chartData,
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    renderDistributionChart() {
        const canvas = document.getElementById('evaluation-distribution-chart');
        if (!canvas) return;

        if (typeof Chart === 'undefined') {
            canvas.parentElement.innerHTML = '<p>チャートライブラリが読み込まれていません</p>';
            return;
        }

        const ctx = canvas.getContext('2d');
        
        const chartData = {
            labels: ['5.0', '4.0-4.9', '3.0-3.9', '2.0-2.9', '1.0-1.9'],
            datasets: [{
                data: [25, 45, 20, 8, 2],
                backgroundColor: [
                    '#4CAF50',
                    '#8BC34A',
                    '#FFC107',
                    '#FF9800',
                    '#F44336'
                ]
            }]
        };

        new Chart(ctx, {
            type: 'doughnut',
            data: chartData,
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    setupEventListeners() {
        // 更新ボタン
        document.getElementById('refresh-dashboard')?.addEventListener('click', () => {
            this.render();
        });

        // 新規評価ボタン
        document.getElementById('new-evaluation-btn')?.addEventListener('click', () => {
            if (window.router) {
                window.router.navigate('/evaluations/new');
            }
        });

        // すべて表示リンク
        document.getElementById('view-all-evaluations')?.addEventListener('click', (e) => {
            e.preventDefault();
            if (window.router) {
                window.router.navigate('/evaluations');
            }
        });

        // クイックアクション
        document.getElementById('start-evaluation')?.addEventListener('click', () => {
            if (window.router) {
                window.router.navigate('/evaluations/new');
            }
        });

        document.getElementById('view-reports')?.addEventListener('click', () => {
            if (window.router) {
                window.router.navigate('/reports');
            }
        });

        document.getElementById('manage-users')?.addEventListener('click', () => {
            if (window.router) {
                window.router.navigate('/users');
            }
        });

        document.getElementById('export-data')?.addEventListener('click', () => {
            this.exportDashboardData();
        });

        // 最近の評価アイテムクリック
        document.addEventListener('click', (e) => {
            const evaluationItem = e.target.closest('.recent-evaluation-item');
            if (evaluationItem) {
                const evaluationId = evaluationItem.dataset.evaluationId;
                if (window.router && evaluationId) {
                    window.router.navigate(`/evaluations/${evaluationId}`);
                }
            }
        });
    }

    startAutoRefresh() {
        // 5分毎に自動更新
        this.refreshInterval = setInterval(() => {
            this.loadDashboardData().then(() => {
                this.populateData();
            });
        }, 5 * 60 * 1000);
    }

    stopAutoRefresh() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
            this.refreshInterval = null;
        }
    }

    async exportDashboardData() {
        try {
            const data = {
                stats: this.statsData,
                recentEvaluations: this.recentEvaluations,
                upcomingDeadlines: this.upcomingDeadlines,
                exportedAt: new Date().toISOString()
            };

            const blob = new Blob([JSON.stringify(data, null, 2)], {
                type: 'application/json'
            });

            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `dashboard-data-${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            URL.revokeObjectURL(url);

            window.notification?.show('ダッシュボードデータをエクスポートしました', 'success');
        } catch (error) {
            console.error('Export failed:', error);
            window.notification?.show('エクスポートに失敗しました', 'error');
        }
    }

    // ユーティリティメソッド
    getStatusDisplayName(status) {
        const statusNames = {
            draft: '下書き',
            pending: '未完了',
            submitted: '提出済み',
            approved: '承認済み',
            completed: '完了'
        };
        return statusNames[status] || status;
    }

    renderStars(rating) {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;

        for (let i = 0; i < fullStars; i++) {
            stars.push('<i class="icon-star-filled"></i>');
        }

        if (hasHalfStar) {
            stars.push('<i class="icon-star-half"></i>');
        }

        const emptyStars = 5 - Math.ceil(rating);
        for (let i = 0; i < emptyStars; i++) {
            stars.push('<i class="icon-star"></i>');
        }

        return stars.join('');
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

    formatDate(dateString) {
        if (!dateString) return '';
        
        const date = new Date(dateString);
        return date.toLocaleDateString('ja-JP', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
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
                    <button onclick="window.dashboard.render()" class="btn-primary">
                        再試行
                    </button>
                </div>
            `;
        }
    }

    // クリーンアップ
    destroy() {
        this.stopAutoRefresh();
        
        // イベントリスナーの削除
        document.removeEventListener('click', this.handleClick);
    }

    // デバッグ用メソッド
    debug() {
        return {
            statsData: this.statsData,
            recentEvaluations: this.recentEvaluations,
            upcomingDeadlines: this.upcomingDeadlines,
            refreshInterval: this.refreshInterval !== null
        };
    }
}

// グローバルインスタンス
window.dashboard = new DashboardController();
