/**
 * API Client - 評価ツール
 * サーバーとの通信を管理するクラス
 */

EvaluationApp = EvaluationApp || {};

/**
 * APIクライアントクラス
 * 本番環境では実際のAPIを呼び出し、デモモードではモックデータを使用
 */
EvaluationApp.ApiClient = class {
  constructor() {
    this.baseUrl = EvaluationApp.Constants.API.BASE_URL;
    this.endpoints = EvaluationApp.Constants.API.ENDPOINTS;
    this.isDemo = EvaluationApp.Constants.APP.DEMO_MODE;
    
    // 認証トークン
    this.authToken = null;
    this.refreshToken = null;
    
    // リクエスト設定
    this.timeout = 30000; // 30秒
    this.retryCount = 3;
    
    // デバッグ用
    this.debug = EvaluationApp.Constants.APP.DEBUG;
    
    this.log('API Client initialized', { isDemo: this.isDemo, baseUrl: this.baseUrl });
  }

  /**
   * 認証トークンの設定
   */
  setAuthToken(token, refreshToken = null) {
    this.authToken = token;
    this.refreshToken = refreshToken;
    
    // ローカルストレージに保存
    if (token) {
      localStorage.setItem(EvaluationApp.Constants.STORAGE_KEYS.AUTH_TOKEN, token);
      if (refreshToken) {
        localStorage.setItem(EvaluationApp.Constants.STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
      }
    } else {
      localStorage.removeItem(EvaluationApp.Constants.STORAGE_KEYS.AUTH_TOKEN);
      localStorage.removeItem(EvaluationApp.Constants.STORAGE_KEYS.REFRESH_TOKEN);
    }
  }

  /**
   * 認証トークンの取得
   */
  getAuthToken() {
    if (!this.authToken) {
      this.authToken = localStorage.getItem(EvaluationApp.Constants.STORAGE_KEYS.AUTH_TOKEN);
    }
    return this.authToken;
  }

  /**
   * 認証付きリクエストの実行
   */
  async fetchAuthenticated(endpoint, options = {}) {
    // デモモードの場合はモックAPIを使用
    if (this.isDemo) {
      return this.handleMockRequest(endpoint, options);
    }

    // 実際のAPI呼び出し
    return this.handleRealRequest(endpoint, options);
  }

  /**
   * モックリクエストの処理
   */
  async handleMockRequest(endpoint, options = {}) {
    this.log('Mock API request:', { endpoint, options });

    // エンドポイントに応じてモックAPIを呼び出し
    const method = options.method || 'GET';
    const body = options.body ? JSON.parse(options.body) : null;

    try {
      // ユーザー関連
      if (endpoint === '/users' && method === 'GET') {
        return await EvaluationApp.MockAPI.getUsers();
      }
      
      if (endpoint.startsWith('/users/') && endpoint.includes('/subordinates')) {
        const userId = parseInt(endpoint.split('/')[2]);
        return await EvaluationApp.MockAPI.getSubordinates(userId);
      }

      if (endpoint === '/users' && method === 'POST') {
        return await EvaluationApp.MockAPI.saveUser(body);
      }

      if (endpoint.startsWith('/users/') && method === 'PUT') {
        const userId = parseInt(endpoint.split('/')[2]);
        return await EvaluationApp.MockAPI.saveUser({ ...body, id: userId });
      }

      if (endpoint.startsWith('/users/') && method === 'DELETE') {
        const userId = parseInt(endpoint.split('/')[2]);
        return await EvaluationApp.MockAPI.deleteUser(userId);
      }

      // 評価関連
      if (endpoint === '/evaluations' && method === 'GET') {
        return await EvaluationApp.MockAPI.getEvaluations();
      }

      if (endpoint.startsWith('/evaluations/') && !endpoint.includes('/submit') && method === 'GET') {
        const evaluationId = parseInt(endpoint.split('/')[2]);
        return await EvaluationApp.MockAPI.getEvaluation(evaluationId);
      }

      if (endpoint === '/evaluations' && method === 'POST') {
        return await EvaluationApp.MockAPI.saveEvaluation(body);
      }

      if (endpoint.startsWith('/evaluations/') && endpoint.includes('/submit')) {
        const evaluationId = parseInt(endpoint.split('/')[2]);
        const status = body?.status || 'submitted';
        return await EvaluationApp.MockAPI.submitEvaluation(evaluationId, status);
      }

      // ダッシュボード
      if (endpoint === '/dashboard') {
        return await EvaluationApp.MockAPI.getDashboardData();
      }

      // 評価期間
      if (endpoint === '/evaluation-periods') {
        return await EvaluationApp.MockAPI.getPeriods();
      }

      // 評価カテゴリ
      if (endpoint === '/evaluation-categories') {
        return await EvaluationApp.MockAPI.getEvaluationCategories();
      }

      // 定性評価項目
      if (endpoint === '/qualitative-items') {
        return await EvaluationApp.MockAPI.getQualitativeItems();
      }

      // 認証関連（デモモードでは常に成功）
      if (endpoint.startsWith('/auth/')) {
        await EvaluationApp.MockAPI.delay();
        if (endpoint === '/auth/login') {
          return {
            token: 'demo_token_' + Date.now(),
            refreshToken: 'demo_refresh_' + Date.now(),
            user: EvaluationApp.MockData.currentUser
          };
        }
        if (endpoint === '/auth/profile') {
          return EvaluationApp.MockData.currentUser;
        }
        return { message: 'Success' };
      }

      // その他のエンドポイント
      await EvaluationApp.MockAPI.delay();
      return { message: 'デモモードでの操作が完了しました' };

    } catch (error) {
      this.log('Mock API error:', error);
      throw error;
    }
  }

  /**
   * 実際のAPIリクエストの処理
   */
  async handleRealRequest(endpoint, options = {}) {
    const url = this.baseUrl + endpoint;
    const token = this.getAuthToken();

    // リクエストヘッダーの設定
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // リクエスト設定
    const fetchOptions = {
      method: options.method || 'GET',
      headers,
      ...options
    };

    // AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);
    fetchOptions.signal = controller.signal;

    try {
      this.log('API request:', { url, method: fetchOptions.method });

      const response = await fetch(url, fetchOptions);
      clearTimeout(timeoutId);

      // ステータスコードの確認
      if (!response.ok) {
        await this.handleErrorResponse(response);
      }

      // レスポンスの解析
      const contentType = response.headers.get('content-type');
      let data;
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      this.log('API response:', data);
      return data;

    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        throw new Error('リクエストがタイムアウトしました');
      }

      // トークンが期限切れの場合はリフレッシュを試行
      if (error.status === 401 && this.refreshToken) {
        return await this.retryWithRefreshToken(endpoint, options);
      }

      throw error;
    }
  }

  /**
   * エラーレスポンスの処理
   */
  async handleErrorResponse(response) {
    let errorData;
    
    try {
      errorData = await response.json();
    } catch (e) {
      errorData = { message: response.statusText };
    }

    const error = new Error(errorData.message || `HTTP ${response.status}`);
    error.status = response.status;
    error.data = errorData;

    // 特定のエラーコードに対する処理
    switch (response.status) {
      case 401:
        this.emit('auth:token:expired');
        break;
      case 403:
        this.emit('auth:insufficient:permissions');
        break;
      case 404:
        error.message = 'データが見つかりません';
        break;
      case 500:
        error.message = 'サーバーエラーが発生しました';
        break;
    }

    throw error;
  }

  /**
   * トークンリフレッシュによるリトライ
   */
  async retryWithRefreshToken(endpoint, options) {
    try {
      const refreshResponse = await this.refreshAuthToken();
      this.setAuthToken(refreshResponse.token, refreshResponse.refreshToken);
      
      // 元のリクエストをリトライ
      return await this.handleRealRequest(endpoint, options);
      
    } catch (refreshError) {
      // リフレッシュに失敗した場合はログアウト
      this.emit('auth:refresh:failed');
      throw refreshError;
    }
  }

  /**
   * 認証トークンのリフレッシュ
   */
  async refreshAuthToken() {
    if (!this.refreshToken) {
      throw new Error('リフレッシュトークンがありません');
    }

    const response = await fetch(this.baseUrl + this.endpoints.AUTH.REFRESH, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        refreshToken: this.refreshToken
      })
    });

    if (!response.ok) {
      throw new Error('トークンリフレッシュに失敗しました');
    }

    return await response.json();
  }

  // === 便利メソッド === //

  /**
   * ユーザー一覧取得
   */
  async getUsers() {
    return await this.fetchAuthenticated('/users');
  }

  /**
   * 評価対象者取得
   */
  async getSubordinates(userId) {
    return await this.fetchAuthenticated(`/users/${userId}/subordinates`);
  }

  /**
   * 評価一覧取得
   */
  async getEvaluations(filters = {}) {
    const queryParams = new URLSearchParams();
    
    Object.keys(filters).forEach(key => {
      if (filters[key] !== null && filters[key] !== undefined) {
        queryParams.append(key, filters[key]);
      }
    });

    const endpoint = '/evaluations' + (queryParams.toString() ? '?' + queryParams.toString() : '');
    return await this.fetchAuthenticated(endpoint);
  }

  /**
   * 評価詳細取得
   */
  async getEvaluation(evaluationId) {
    return await this.fetchAuthenticated(`/evaluations/${evaluationId}`);
  }

  /**
   * ダッシュボードデータ取得
   */
  async getDashboardData() {
    return await this.fetchAuthenticated('/dashboard');
  }

  /**
   * 評価カテゴリ取得
   */
  async getEvaluationCategories(positionType = null) {
    const endpoint = '/evaluation-categories' + (positionType ? `?position=${positionType}` : '');
    return await this.fetchAuthenticated(endpoint);
  }

  /**
   * 定性評価項目取得
   */
  async getQualitativeItems(evaluationId) {
    return await this.fetchAuthenticated(`/evaluations/${evaluationId}/qualitative-items`);
  }

  /**
   * 評価期間一覧取得
   */
  async getPeriods() {
    return await this.fetchAuthenticated('/evaluation-periods');
  }

  /**
   * 評価保存
   */
  async saveEvaluation(evaluationData) {
    if (evaluationData.id) {
      // 更新
      return await this.fetchAuthenticated(`/evaluations/${evaluationData.id}`, {
        method: 'PUT',
        body: JSON.stringify(evaluationData)
      });
    } else {
      // 新規作成
      return await this.fetchAuthenticated('/evaluations', {
        method: 'POST',
        body: JSON.stringify(evaluationData)
      });
    }
  }

  /**
   * 評価提出
   */
  async submitEvaluation(evaluationId, status = 'submitted') {
    return await this.fetchAuthenticated(`/evaluations/${evaluationId}/submit`, {
      method: 'POST',
      body: JSON.stringify({ status })
    });
  }

  /**
   * 評価承認
   */
  async approveEvaluation(evaluationId, status = 'approved_by_evaluator') {
    return await this.fetchAuthenticated(`/evaluations/${evaluationId}/approve`, {
      method: 'POST',
      body: JSON.stringify({ status })
    });
  }

  /**
   * 評価差し戻し
   */
  async rejectEvaluation(evaluationId, reason = '') {
    return await this.fetchAuthenticated(`/evaluations/${evaluationId}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason })
    });
  }

  /**
   * ユーザー保存
   */
  async saveUser(userData) {
    if (userData.id) {
      // 更新
      return await this.fetchAuthenticated(`/users/${userData.id}`, {
        method: 'PUT',
        body: JSON.stringify(userData)
      });
    } else {
      // 新規作成
      return await this.fetchAuthenticated('/users', {
        method: 'POST',
        body: JSON.stringify(userData)
      });
    }
  }

  /**
   * ユーザー削除
   */
  async deleteUser(userId) {
    return await this.fetchAuthenticated(`/users/${userId}`, {
      method: 'DELETE'
    });
  }

  /**
   * ログイン
   */
  async login(username, password) {
    const response = await this.fetchAuthenticated('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });

    if (response.token) {
      this.setAuthToken(response.token, response.refreshToken);
    }

    return response;
  }

  /**
   * ログアウト
   */
  async logout() {
    try {
      await this.fetchAuthenticated('/auth/logout', {
        method: 'POST'
      });
    } catch (error) {
      // ログアウトAPIが失敗してもローカルのトークンは削除
      this.log('Logout API failed:', error);
    } finally {
      this.setAuthToken(null);
    }
  }

  /**
   * プロフィール取得
   */
  async getProfile() {
    return await this.fetchAuthenticated('/auth/profile');
  }

  /**
   * 評価基準取得
   */
  getEvaluationCriteria(positionType) {
    if (positionType === '営業') {
      return EvaluationApp.Constants.EVALUATION_CRITERIA.SALES;
    }
    return EvaluationApp.Constants.EVALUATION_CRITERIA.TECHNICAL;
  }

  /**
   * 定性評価基準取得
   */
  getQualitativeCriteria() {
    return EvaluationApp.Constants.EVALUATION_CRITERIA.QUALITATIVE;
  }

  // === ユーティリティメソッド === //

  /**
   * イベント発火
   */
  emit(eventName, data = null) {
    const event = new CustomEvent(eventName, { detail: data });
    document.dispatchEvent(event);
    
    if (this.debug) {
      this.log(`Event emitted: ${eventName}`, data);
    }
  }

  /**
   * ログ出力
   */
  log(message, data = null) {
    if (this.debug) {
      console.log(`[API] ${message}`, data || '');
    }
  }

  /**
   * エラーハンドリング
   */
  handleError(context, error) {
    console.error(`API Error in ${context}:`, error);
    
    // エラーイベントを発火
    this.emit('api:error', {
      context,
      error: {
        message: error.message,
        status: error.status,
        data: error.data
      }
    });
  }

  /**
   * 接続テスト
   */
  async testConnection() {
    try {
      if (this.isDemo) {
        await EvaluationApp.MockAPI.delay(100);
        return { status: 'ok', mode: 'demo' };
      }

      const response = await fetch(this.baseUrl + '/health', {
        method: 'GET',
        timeout: 5000
      });

      return {
        status: response.ok ? 'ok' : 'error',
        mode: 'production'
      };
    } catch (error) {
      return {
        status: 'error',
        mode: this.isDemo ? 'demo' : 'production',
        error: error.message
      };
    }
  }

  /**
   * API情報取得
   */
  getInfo() {
    return {
      baseUrl: this.baseUrl,
      isDemo: this.isDemo,
      hasAuthToken: !!this.authToken,
      timeout: this.timeout,
      retryCount: this.retryCount
    };
  }
};

// デバッグ用
if (EvaluationApp.Constants && EvaluationApp.Constants.APP.DEBUG) {
  console.log('API Client loaded');
}
