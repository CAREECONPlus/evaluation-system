/**
 * Dashboard Controller - 評価ツール
 * ダッシュボードページの表示と管理を行うクラス
 */

EvaluationApp = EvaluationApp || {};

/**
 * ダッシュボードコントローラークラス
 */
EvaluationApp.DashboardController = class {
  constructor(app) {
    this.app = app;
    this.api = app.api;
    this.auth = app.auth;
    this.debug = EvaluationApp.Constants.APP.DEBUG;
    
    // DOM要素
    this.container = null;
    this.elements = {};
    
    // データ
    this.dashboardData = null;
    this.refreshInterval = null;
    
    // 設定
    this.autoRefreshInterval = 5 * 60 * 1000; // 5分
    
    this.log('Dashboard controller initialized');
  }

  /**
   * ダッシュボードページの表示
   */
  async show(data = {}) {
    try {
      this.log('Showing dashboard page');
      
      // コンテナの取得
      this.container = document.getElementById('app-content');
      if (!this.container) {
        throw new Error('App content container not found');
      }
      
      // ローディング表示
      this.showLoading();
      
      // データの読み込み
      await this.loadDashboardData();
      
      // HTMLの描画
      await this.render();
      
      // イベントリスナーの設定
      this.setupEventListeners();
      
      // 自動リフレッシュの開始
      this.startAutoRefresh();
      
      this.log('Dashboard page shown successfully');
      
    } catch (error) {
      this.log('Error showing dashboard:', error);
      this.showError('ダッシュボードの読み込みに失敗しました', error.message);
    }
  }

  /**
   * ダッシュボードデータの読み込み
   */
  async loadDashboardData() {
    try {
      this.log('Loading dashboard data...');
      
      if (!this.api) {
        throw new Error('API client not available');
      }
      
      // ダッシュボードデータを取得
      this.dashboardData = await this.api.getDashboardData();
      
      this.log('Dashboard data loaded:', this.dashboardData);
      
    } catch (error) {
      this.log('Error loading dashboard data:', error);
      throw error;
    }
  }

  /**
   * ダッシュボードHTMLの描画
   */
  async render() {
    if (!this.dashboardData) {
      throw new Error('Dashboard data not loaded');
    }
    
    const currentUser = this.auth ? this.auth.getCurrentUser() : null;
    if (!currentUser) {
      throw new Error('User not authenticated');
    }
    
    const html = this.buildDashboardHTML(currentUser);
    this.container.innerHTML = html;
    
    // DOM要素の参照を取得
    this.cacheElements();
    
    // データの表示
    await this.updateDisplays();
    
    this.log('Dashboard rendered');
  }

  /**
   * ダッシュボードHTMLの構築
   */
  buildDashboardHTML(currentUser) {
    const userRole = currentUser.role;
    const activePeriod = this.dashboardData.activePeriod;
    
    return `
      <div class="dashboard-page page">
        <!-- ページヘッダー -->
        <div class="page-header d-flex justify-content-between align-items-center">
          <div>
            <h1 class="page-title">ダッシュボード</h1>
            <p class="page-subtitle">こんにちは、${currentUser.fullName || currentUser.full_name}さん</p>
          </div>
          <div class="page-actions">
            <button class="btn btn-outline-primary btn-sm me-2" id="refresh-dashboard">
              <i class="fas fa-sync-alt"></i> 更新
            </button>
            ${this.buildQuickActionButton(userRole)}
          </div>
        </div>

        <!-- サマリーカード -->
        <div class="row mb-4">
          ${this.buildSummaryCards(currentUser, activePeriod)}
        </div>

        <!-- メインコンテンツ -->
        <div class="row">
          <!-- 左カラム -->
          <div class="col-lg-8 mb-4">
            ${this.buildMainContent(currentUser)}
          </div>
          
          <!-- 右カラム -->
          <div class="col-lg-4 mb-4">
            ${this.buildSideContent(currentUser)}
          </div>
        </div>
      </div>
    `;
  }

  /**
   * サマリーカードの構築
   */
  buildSummaryCards(currentUser, activePeriod) {
    const cards = [];
    
    // 評価期間カード
    cards.push(`
      <div class="col-md-6 col-lg-3 mb-3">
        <div class="info-card">
          <div class="card-header">
            <h6 class="card-title m-0">
              <i class="fas fa-calendar-alt me-2"></i>現在の評価期間
            </h6>
          </div>
          <div class="card-body">
            <h5 class="mb-1" id="current-period-name">${activePeriod ? activePeriod.name : '未設定'}</h5>
            <p class="text-muted small mb-0" id="current-period-dates">
              ${activePeriod ? this.formatPeriodDates(activePeriod) : '-'}
            </p>
          </div>
        </div>
      </div>
    `);
    
    // 自己評価状況カード
    cards.push(`
      <div class="col-md-6 col-lg-3 mb-3">
        <div class="info-card">
          <div class="card-header bg-info">
            <h6 class="card-title m-0">
              <i class="fas fa-user-check me-2"></i>自己評価状況
            </h6>
          </div>
          <div class="card-body">
            <div id="self-evaluation-status" class="mb-2">読み込み中...</div>
            <div class="progress progress-custom mb-2">
              <div class="progress-bar progress-bar-custom" id="self-evaluation-progress" 
                   role="progressbar" style="width: 0%"></div>
            </div>
            <button class="btn btn-sm btn-outline-info w-100" id="evaluation-action-btn">
              評価を開始
            </button>
          </div>
        </div>
      </div>
    `);
    
    // 評価者向けカード
    if (this.auth && this.auth.hasRole('evaluator')) {
      cards.push(`
        <div class="col-md-6 col-lg-3 mb-3">
          <div class="info-card">
            <div class="card-header bg-success">
              <h6 class="card-title m-0">
                <i class="fas fa-users me-2"></i>評価対象者
              </h6>
            </div>
            <div class="card-body">
              <div class="stat-card">
                <div class="stat-value" id="subordinates-count">0</div>
                <div class="stat-label">評価対象者</div>
              </div>
              <div class="text-center mt-2">
                <span class="badge bg-warning" id="pending-evaluations-count">0件 審査待ち</span>
              </div>
            </div>
          </div>
        </div>
      `);
    }
    
    // 管理者向けカード
    if (this.auth && this.auth.hasRole('admin')) {
      cards.push(`
        <div class="col-md-6 col-lg-3 mb-3">
          <div class="info-card">
            <div class="card-header bg-primary">
              <h6 class="card-title m-0">
                <i class="fas fa-chart-bar me-2"></i>全体状況
              </h6>
            </div>
            <div class="card-body">
              <div class="stat-card">
                <div class="stat-value" id="total-evaluations">0</div>
                <div class="stat-label">総評価数</div>
              </div>
              <div class="text-center mt-2">
                <span class="badge bg-success" id="completed-rate">0% 完了</span>
              </div>
            </div>
          </div>
        </div>
      `);
    }
    
    return cards.join('');
  }

  /**
   * クイックアクションボタンの構築
   */
  buildQuickActionButton(userRole) {
    if (userRole === 'admin') {
      return `
        <div class="dropdown">
          <button class="btn btn-primary dropdown-toggle" type="button" data-bs-toggle="dropdown">
            <i class="fas fa-plus me-1"></i>クイックアクション
          </button>
          <ul class="dropdown-menu">
            <li><a class="dropdown-item" href="#" data-action="add-user">
              <i class="fas fa-user-plus me-2"></i>ユーザー追加
            </a></li>
            <li><a class="dropdown-item" href="#" data-action="add-period">
              <i class="fas fa-calendar-plus me-2"></i>評価期間追加
            </a></li>
            <li><hr class="dropdown-divider"></li>
            <li><a class="dropdown-item" href="#" data-action="export-data">
              <i class="fas fa-download me-2"></i>データエクスポート
            </a></li>
          </ul>
        </div>
      `;
    } else {
      return `
        <button class="btn btn-primary" id="start-evaluation">
          <i class="fas fa-edit me-1"></i>評価を開始
        </button>
      `;
    }
  }

  /**
   * メインコンテンツの構築
   */
  buildMainContent(currentUser) {
    return `
      <!-- 最近の評価 -->
      <div class="info-card mb-4">
        <div class="card-header">
          <h5 class="card-title m-0">
            <i class="fas fa-history me-2"></i>最近の評価
          </h5>
        </div>
        <div class="card-body">
          <div class="table-responsive">
            <table class="table table-hover">
              <thead>
                <tr>
                  <th>期間</th>
                  ${this.auth && this.auth.hasRole('evaluator') ? '<th>対象者</th>' : ''}
                  <th>自己評価</th>
                  <th>評価者評価</th>
                  <th>状態</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody id="recent-evaluations-table">
                <tr>
                  <td colspan="6" class="text-center">
                    <div class="loading-spinner">
                      <div class="spinner-border spinner-border-sm me-2"></div>
                      読み込み中...
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div class="card-footer">
          <a href="#" class="btn btn-outline-primary" data-route="evaluations">
            すべての評価を見る <i class="fas fa-arrow-right ms-1"></i>
          </a>
        </div>
      </div>

      <!-- 評価進捗チャート（管理者・評価者向け） -->
      ${this.auth && this.auth.hasRole('evaluator') ? this.buildProgressChart() : ''}
    `;
  }

  /**
   * サイドコンテンツの構築
   */
  buildSideContent(currentUser) {
    return `
      <!-- お知らせ -->
      <div class="info-card mb-4">
        <div class="card-header">
          <h5 class="card-title m-0">
            <i class="fas fa-bullhorn me-2"></i>お知らせ
          </h5>
        </div>
        <div class="card-body">
          <div id="announcements-list">
            ${this.buildAnnouncementsList()}
          </div>
        </div>
      </div>

      <!-- 今週の予定 -->
      <div class="info-card mb-4">
        <div class="card-header">
          <h5 class="card-title m-0">
            <i class="fas fa-calendar-week me-2"></i>今週の予定
          </h5>
        </div>
        <div class="card-body">
          <div id="schedule-list">
            ${this.buildScheduleList()}
          </div>
        </div>
      </div>

      <!-- クイックリンク -->
      <div class="info-card">
        <div class="card-header">
          <h5 class="card-title m-0">
            <i class="fas fa-link me-2"></i>クイックリンク
          </h5>
        </div>
        <div class="card-body">
          ${this.buildQuickLinks(currentUser)}
        </div>
      </div>
    `;
  }

  /**
   * 進捗チャートの構築
   */
  buildProgressChart() {
    return `
      <div class="info-card">
        <div class="card-header">
          <h5 class="card-title m-0">
            <i class="fas fa-chart-pie me-2"></i>評価進捗状況
          </h5>
        </div>
        <div class="card-body">
          <div class="chart-container">
            <canvas id="progress-chart" width="400" height="200"></canvas>
          </div>
          <div class="chart-legend mt-3" id="progress-legend">
            <!-- 凡例は動的に生成 -->
          </div>
        </div>
      </div>
    `;
  }

  /**
   * お知らせリストの構築
   */
  buildAnnouncementsList() {
    const announcements = [
      {
        title: '評価期間のお知らせ',
        content: '2024年上期の評価期間が開始されました。',
        date: '2024-09-01',
        type: 'info'
      },
      {
        title: 'システムメンテナンス',
        content: '定期メンテナンスを実施いたします。',
        date: '2024-08-28',
        type: 'warning'
      },
      {
        title: '評価基準の更新',
        content: '新しい評価基準が適用されました。',
        date: '2024-08-25',
        type: 'success'
      }
    ];

    return announcements.map(announcement => `
      <div class="alert alert-custom alert-${announcement.type} mb-2">
        <div class="d-flex">
          <div class="alert-icon">
            <i class="fas fa-${this.getAnnouncementIcon(announcement.type)}"></i>
          </div>
          <div class="flex-grow-1">
            <div class="alert-title">${announcement.title}</div>
            <div class="alert-message small">${announcement.content}</div>
            <div class="text-muted small mt-1">${this.formatDate(announcement.date)}</div>
          </div>
        </div>
      </div>
    `).join('');
  }

  /**
   * スケジュールリストの構築
   */
  buildScheduleList() {
    const schedule = [
      {
        title: '評価面談',
        time: '14:00',
        date: '今日',
        type: 'meeting'
      },
      {
        title: '評価提出期限',
        time: '23:59',
        date: '明日',
        type: 'deadline'
      },
      {
        title: '部下評価確認',
        time: '10:00',
        date: '明後日',
        type: 'review'
      }
    ];

    if (schedule.length === 0) {
      return '<p class="text-muted text-center">予定はありません</p>';
    }

    return schedule.map(item => `
      <div class="d-flex align-items-center mb-2 p-2 border-bottom">
        <div class="me-3">
          <i class="fas fa-${this.getScheduleIcon(item.type)} text-primary"></i>
        </div>
        <div class="flex-grow-1">
          <div class="fw-medium">${item.title}</div>
          <div class="small text-muted">${item.date} ${item.time}</div>
        </div>
      </div>
    `).join('');
  }

  /**
   * クイックリンクの構築
   */
  buildQuickLinks(currentUser) {
    const links = [];
    
    // 共通リンク
    links.push(`
      <a href="#" class="btn btn-outline-primary btn-sm w-100 mb-2" data-route="evaluations">
        <i class="fas fa-clipboard-list me-2"></i>評価一覧
      </a>
    `);

    // 評価者向けリンク
    if (this.auth && this.auth.hasRole('evaluator')) {
      links.push(`
        <a href="#" class="btn btn-outline-success btn-sm w-100 mb-2" data-route="subordinates">
          <i class="fas fa-users me-2"></i>評価対象者
        </a>
      `);
    }

    // 管理者向けリンク
    if (this.auth && this.auth.hasRole('admin')) {
      links.push(`
        <a href="#" class="btn btn-outline-info btn-sm w-100 mb-2" data-route="users">
          <i class="fas fa-user-cog me-2"></i>ユーザー管理
        </a>
        <a href="#" class="btn btn-outline-secondary btn-sm w-100 mb-2" data-route="settings">
          <i class="fas fa-cog me-2"></i>設定
        </a>
      `);
    }

    return links.join('');
  }

  /**
   * DOM要素の参照をキャッシュ
   */
  cacheElements() {
    this.elements = {
      currentPeriodName: document.getElementById('current-period-name'),
      currentPeriodDates: document.getElementById('current-period-dates'),
      selfEvaluationStatus: document.getElementById('self-evaluation-status'),
      selfEvaluationProgress: document.getElementById('self-evaluation-progress'),
      evaluationActionBtn: document.getElementById('evaluation-action-btn'),
      subordinatesCount: document.getElementById('subordinates-count'),
      pendingEvaluationsCount: document.getElementById('pending-evaluations-count'),
      totalEvaluations: document.getElementById('total-evaluations'),
      completedRate: document.getElementById('completed-rate'),
      recentEvaluationsTable: document.getElementById('recent-evaluations-table'),
      refreshBtn: document.getElementById('refresh-dashboard'),
      startEvaluationBtn: document.getElementById('start-evaluation'),
      progressChart: document.getElementById('progress-chart')
    };
  }

  /**
   * 表示内容の更新
   */
  async updateDisplays() {
    try {
      // 自己評価状況の更新
      await this.updateSelfEvaluationStatus();
      
      // 評価者向け情報の更新
      if (this.auth && this.auth.hasRole('evaluator')) {
        await this.updateEvaluatorInfo();
      }
      
      // 管理者向け情報の更新
      if (this.auth && this.auth.hasRole('admin')) {
        await this.updateAdminInfo();
      }
      
      // 最近の評価テーブルの更新
      await this.updateRecentEvaluations();
      
      // 進捗チャートの更新
      if (this.elements.progressChart) {
        await this.updateProgressChart();
      }
      
    } catch (error) {
      this.log('Error updating displays:', error);
    }
  }

  /**
   * 自己評価状況の更新
   */
  async updateSelfEvaluationStatus() {
    if (!this.elements.selfEvaluationStatus) return;
    
    const currentUser = this.auth.getCurrentUser();
    const activePeriod = this.dashboardData.activePeriod;
    
    if (!activePeriod) {
      this.elements.selfEvaluationStatus.textContent = '評価期間が設定されていません';
      return;
    }
    
    // 現在のユーザーの評価を取得
    const userEvaluation = this.dashboardData.evaluations.find(e => 
      e.user_id === currentUser.id && e.period_id === activePeriod.id
    );
    
    let statusText = '未評価';
    let progressPercent = 0;
    let actionText = '評価を開始';
    let actionClass = 'btn-outline-info';
    
    if (userEvaluation) {
      switch (userEvaluation.status) {
        case 'draft':
          statusText = '下書き保存中';
          progressPercent = 25;
          actionText = '評価を続ける';
          actionClass = 'btn-outline-warning';
          break;
        case 'submitted':
          statusText = '提出済み（評価者確認待ち）';
          progressPercent = 50;
          actionText = '評価を確認';
          actionClass = 'btn-outline-primary';
          break;
        case 'approved_by_evaluator':
          statusText = '一次承認済み（最終承認待ち）';
          progressPercent = 75;
          actionText = '評価を確認';
          actionClass = 'btn-outline-info';
          break;
        case 'approved_by_admin':
          statusText = '評価完了';
          progressPercent = 100;
          actionText = '評価結果を見る';
          actionClass = 'btn-outline-success';
          break;
      }
    }
    
    // 表示を更新
    this.elements.selfEvaluationStatus.textContent = statusText;
    this.elements.selfEvaluationProgress.style.width = `${progressPercent}%`;
    
    if (this.elements.evaluationActionBtn) {
      this.elements.evaluationActionBtn.textContent = actionText;
      this.elements.evaluationActionBtn.className = `btn btn-sm w-100 ${actionClass}`;
    }
  }

  /**
   * 評価者情報の更新
   */
  async updateEvaluatorInfo() {
    if (!this.elements.subordinatesCount) return;
    
    const subordinatesCount = this.dashboardData.subordinatesCount || 0;
    const pendingCount = this.dashboardData.pendingEvaluations ? this.dashboardData.pendingEvaluations.length : 0;
    
    this.elements.subordinatesCount.textContent = subordinatesCount;
    this.elements.pendingEvaluationsCount.textContent = `${pendingCount}件 審査待ち`;
  }

  /**
   * 管理者情報の更新
   */
  async updateAdminInfo() {
    if (!this.elements.totalEvaluations) return;
    
    const totalEvaluations = this.dashboardData.evaluations ? this.dashboardData.evaluations.length : 0;
    const completedEvaluations = this.dashboardData.evaluations ? 
      this.dashboardData.evaluations.filter(e => e.status === 'approved_by_admin').length : 0;
    
    const completedRate = totalEvaluations > 0 ? 
      Math.round((completedEvaluations / totalEvaluations) * 100) : 0;
    
    this.elements.totalEvaluations.textContent = totalEvaluations;
    this.elements.completedRate.textContent = `${completedRate}% 完了`;
  }

  /**
   * 最近の評価テーブルの更新
   */
  async updateRecentEvaluations() {
    if (!this.elements.recentEvaluationsTable) return;
    
    const evaluations = this.dashboardData.evaluations || [];
    const recentEvaluations = evaluations
      .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
      .slice(0, 5);
    
    if (recentEvaluations.length === 0) {
      this.elements.recentEvaluationsTable.innerHTML = `
        <tr>
          <td colspan="6" class="text-center">
            <div class="empty-state py-4">
              <div class="empty-state-icon">
                <i class="fas fa-clipboard-list"></i>
              </div>
              <div class="empty-state-title">評価データがありません</div>
              <div class="empty-state-description">まだ評価が作成されていません</div>
            </div>
          </td>
        </tr>
      `;
      return;
    }
    
    const isEvaluator = this.auth && this.auth.hasRole('evaluator');
    
    const rows = recentEvaluations.map(evaluation => {
      const statusInfo = this.getStatusInfo(evaluation.status);
      return `
        <tr>
          <td>${evaluation.period_name || '不明'}</td>
          ${isEvaluator ? `<td>${evaluation.user_name || '-'}</td>` : ''}
          <td>${evaluation.self_rating || '-'}</td>
          <td>${evaluation.evaluator_rating || '-'}</td>
          <td>
            <span class="status-badge status-${evaluation.status}">
              ${statusInfo.label}
            </span>
          </td>
          <td>
            <div class="action-buttons">
              <button class="btn btn-sm btn-outline-primary" 
                      onclick="app.showEvaluationDetail(${evaluation.id})">
                <i class="fas fa-eye"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
    
    this.elements.recentEvaluationsTable.innerHTML = rows;
  }

  /**
   * 進捗チャートの更新
   */
  async updateProgressChart() {
    if (!this.elements.progressChart) return;
    
    try {
      const ctx = this.elements.progressChart.getContext('2d');
      const evaluations = this.dashboardData.evaluations || [];
      
      // ステータス別の集計
      const statusCounts = {
        draft: 0,
        submitted: 0,
        approved_by_evaluator: 0,
        approved_by_admin: 0
      };
      
      evaluations.forEach(evaluation => {
        if (statusCounts.hasOwnProperty(evaluation.status)) {
          statusCounts[evaluation.status]++;
        }
      });
      
      // チャートデータ
      const chartData = {
        labels: ['下書き', '提出済', '一次承認済', '評価完了'],
        datasets: [{
          data: [
            statusCounts.draft,
            statusCounts.submitted,
            statusCounts.approved_by_evaluator,
            statusCounts.approved_by_admin
          ],
          backgroundColor: [
            'var(--color-gray-400)',
            'var(--color-warning)',
            'var(--color-info)',
            'var(--color-success)'
          ],
          borderWidth: 2,
          borderColor: 'var(--color-white)'
        }]
      };
      
      // チャートの作成
      new Chart(ctx, {
        type: 'doughnut',
        data: chartData,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            }
          }
        }
      });
      
    } catch (error) {
      this.log('Error updating progress chart:', error);
    }
  }

  /**
   * イベントリスナーの設定
   */
  setupEventListeners() {
    // 更新ボタン
    if (this.elements.refreshBtn) {
      this.elements.refreshBtn.addEventListener('click', () => {
        this.refreshDashboard();
      });
    }
    
    // 評価開始ボタン
    if (this.elements.startEvaluationBtn) {
      this.elements.startEvaluationBtn.addEventListener('click', () => {
        this.startEvaluation();
      });
    }
    
    // 評価アクションボタン
    if (this.elements.evaluationActionBtn) {
      this.elements.evaluationActionBtn.addEventListener('click', () => {
        this.handleEvaluationAction();
      });
    }
    
    // クイックアクション
    this.container.addEventListener('click', (event) => {
      const actionButton = event.target.closest('[data-action]');
      if (actionButton) {
        event.preventDefault();
        const action = actionButton.getAttribute('data-action');
        this.handleQuickAction(action);
      }
      
      const routeButton = event.target.closest('[data-route]');
      if (routeButton) {
        event.preventDefault();
        const route = routeButton.getAttribute('data-route');
        this.app.emit('navigation:request', { route });
      }
    });
  }

  /**
   * ダッシュボードの更新
   */
  async refreshDashboard() {
    try {
      this.log('Refreshing dashboard...');
      
      // 更新ボタンを無効化
      if (this.elements.refreshBtn) {
        this.elements.refreshBtn.disabled = true;
        this.elements.refreshBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i>更新中';
      }
      
      // データを再読み込み
      await this.loadDashboardData();
      
      // 表示を更新
      await this.updateDisplays();
      
      this.log('Dashboard refreshed successfully');
      
    } catch (error) {
      this.log('Error refreshing dashboard:', error);
      this.showError('更新に失敗しました', error.message);
    } finally {
      // 更新ボタンを有効化
      if (this.elements.refreshBtn) {
        this.elements.refreshBtn.disabled = false;
        this.elements.refreshBtn.innerHTML = '<i class="fas fa-sync-alt"></i> 更新';
      }
    }
  }

  /**
   * 評価開始処理
   */
  startEvaluation() {
    this.log('Starting evaluation...');
    this.app.emit('evaluation:start');
  }

  /**
   * 評価アクション処理
   */
  handleEvaluationAction() {
    this.log('Handling evaluation action...');
    // 現在の評価状況に応じてアクションを実行
    this.app.emit('evaluation:action');
  }

  /**
   * クイックアクション処理
   */
  handleQuickAction(action) {
    this.log('Quick action:', action);
    
    switch (action) {
      case 'add-user':
        this.app.emit('user:add');
        break;
      case 'add-period':
        this.app.emit('period:add');
        break;
      case 'export-data':
        this.app.emit('data:export');
        break;
      default:
        this.log('Unknown quick action:', action);
    }
  }

  /**
   * 自動リフレッシュの開始
   */
  startAutoRefresh() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
    
    this.refreshInterval = setInterval(() => {
      this.refreshDashboard();
    }, this.autoRefreshInterval);
    
    this.log('Auto refresh started');
  }

  /**
   * 自動リフレッシュの停止
   */
  stopAutoRefresh() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
      this.log('Auto refresh stopped');
    }
  }

  // === ユーティリティメソッド === //

  /**
   * 期間の日付フォーマット
   */
  formatPeriodDates(period) {
    const startDate = new Date(period.start_date).toLocaleDateString('ja-JP');
    const endDate = new Date(period.end_date).toLocaleDateString('ja-JP');
    return `${startDate} 〜 ${endDate}`;
  }

  /**
   * 日付フォーマット
   */
  formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('ja-JP');
  }

  /**
   * ステータス情報の取得
   */
  getStatusInfo(status) {
    const statusMap = {
      draft: { label: '下書き', class: 'status-draft' },
      submitted: { label: '提出済', class: 'status-submitted' },
      approved_by_evaluator: { label: '一次承認済', class: 'status-approved-evaluator' },
      approved_by_admin: { label: '評価完了', class: 'status-approved-admin' }
    };
    
    return statusMap[status] || { label: status, class: 'status-unknown' };
  }

  /**
   * お知らせアイコンの取得
   */
  getAnnouncementIcon(type) {
    const iconMap = {
      info: 'info-circle',
      warning: 'exclamation-triangle',
      success: 'check-circle',
      danger: 'times-circle'
    };
    return iconMap[type] || 'info-circle';
  }

  /**
   * スケジュールアイコンの取得
   */
  getScheduleIcon(type) {
    const iconMap = {
      meeting: 'users',
      deadline: 'clock',
      review: 'clipboard-check'
    };
    return iconMap[type] || 'calendar';
  }

  /**
   * ローディング表示
   */
  showLoading() {
    if (this.container) {
      this.container.innerHTML = `
        <div class="d-flex justify-content-center align-items-center" style="min-height: 400px;">
          <div class="loading-spinner">
            <div class="spinner-border text-primary me-3"></div>
            <span>ダッシュボードを読み込んでいます...</span>
          </div>
        </div>
      `;
    }
  }

  /**
   * エラー表示
   */
  showError(title, message) {
    if (this.container) {
      this.container.innerHTML = `
        <div class="alert alert-danger" role="alert">
          <h4 class="alert-heading">${title}</h4>
          <p>${message}</p>
          <hr>
          <button class="btn btn-outline-danger" onclick="location.reload()">
            <i class="fas fa-redo me-1"></i>ページを再読み込み
          </button>
        </div>
      `;
    }
  }

  /**
   * ログ出力
   */
  log(message, data = null) {
    if (this.debug) {
      console.log(`[Dashboard] ${message}`, data || '');
    }
  }

  /**
   * 未保存データの確認
   */
  hasUnsavedData() {
    // ダッシュボードには未保存データはない
    return false;
  }

  /**
   * コントローラーの破棄
   */
  destroy() {
    this.log('Destroying dashboard controller...');
    
    // 自動リフレッシュを停止
    this.stopAutoRefresh();
    
    // コンテナをクリア
    if (this.container) {
      this.container.innerHTML = '';
    }
    
    this.log('Dashboard controller destroyed');
  }
};

// デバッグ用
if (EvaluationApp.Constants && EvaluationApp.Constants.APP.DEBUG) {
  console.log('Dashboard controller loaded');
}
