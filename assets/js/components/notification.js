/**
 * Notification System - 評価ツール
 * ユーザーへの通知・フィードバックを管理するクラス
 */

EvaluationApp = EvaluationApp || {};

/**
 * 通知管理クラス
 */
EvaluationApp.Notification = class {
  constructor(container = null) {
    this.container = container || this.createContainer();
    this.notifications = new Map();
    this.queue = [];
    this.maxNotifications = 5;
    this.debug = EvaluationApp.Constants.APP.DEBUG;
    
    // 通知の設定
    this.defaultDuration = EvaluationApp.Constants.UI.NOTIFICATION_DURATION;
    this.animationDuration = 300;
    
    // イベントリスナー
    this.eventListeners = new Map();
    
    this.log('Notification system initialized');
    this.setupGlobalEventListeners();
  }

  /**
   * 通知コンテナの作成
   */
  createContainer() {
    let container = document.getElementById('notification-container');
    
    if (!container) {
      container = document.createElement('div');
      container.id = 'notification-container';
      container.className = 'position-fixed bottom-0 end-0 p-3';
      container.style.zIndex = '1055';
      document.body.appendChild(container);
    }
    
    return container;
  }

  /**
   * グローバルイベントリスナーの設定
   */
  setupGlobalEventListeners() {
    // カスタムイベントの監視
    document.addEventListener('notification:show', (event) => {
      const { title, message, type, options } = event.detail || {};
      this.show(title, message, type, options);
    });

    document.addEventListener('notification:success', (event) => {
      const { title, message, options } = event.detail || {};
      this.success(title, message, options);
    });

    document.addEventListener('notification:error', (event) => {
      const { title, message, options } = event.detail || {};
      this.error(title, message, options);
    });

    document.addEventListener('notification:warning', (event) => {
      const { title, message, options } = event.detail || {};
      this.warning(title, message, options);
    });

    document.addEventListener('notification:info', (event) => {
      const { title, message, options } = event.detail || {};
      this.info(title, message, options);
    });

    this.log('Global event listeners set up');
  }

  /**
   * 通知の表示
   * @param {string} title - 通知タイトル
   * @param {string} message - 通知メッセージ
   * @param {string} type - 通知タイプ (success, error, warning, info)
   * @param {Object} options - オプション設定
   */
  show(title, message = '', type = 'info', options = {}) {
    const config = {
      id: this.generateId(),
      title: title || '通知',
      message: message,
      type: type,
      duration: options.duration || this.getDurationByType(type),
      persistent: options.persistent || false,
      icon: options.icon || this.getIconByType(type),
      actions: options.actions || [],
      onClick: options.onClick || null,
      onClose: options.onClose || null,
      position: options.position || 'bottom-end',
      ...options
    };

    this.log('Showing notification:', config);

    // キューに追加
    this.queue.push(config);
    this.processQueue();

    return config.id;
  }

  /**
   * 成功通知
   */
  success(title, message = '', options = {}) {
    return this.show(title, message, 'success', options);
  }

  /**
   * エラー通知
   */
  error(title, message = '', options = {}) {
    return this.show(title, message, 'error', {
      persistent: true,
      ...options
    });
  }

  /**
   * 警告通知
   */
  warning(title, message = '', options = {}) {
    return this.show(title, message, 'warning', options);
  }

  /**
   * 情報通知
   */
  info(title, message = '', options = {}) {
    return this.show(title, message, 'info', options);
  }

  /**
   * 確認ダイアログ風通知
   */
  confirm(title, message, onConfirm, onCancel = null) {
    const actions = [
      {
        text: 'キャンセル',
        class: 'btn-outline-secondary',
        onClick: () => {
          if (onCancel) onCancel();
        }
      },
      {
        text: '確認',
        class: 'btn-primary',
        onClick: () => {
          if (onConfirm) onConfirm();
        }
      }
    ];

    return this.show(title, message, 'info', {
      persistent: true,
      actions: actions,
      icon: 'fas fa-question-circle'
    });
  }

  /**
   * 進捗通知
   */
  progress(title, message = '', options = {}) {
    const progressId = this.generateId();
    
    const config = {
      id: progressId,
      title: title,
      message: message,
      type: 'info',
      persistent: true,
      progress: 0,
      ...options
    };

    this.queue.push(config);
    this.processQueue();

    return {
      id: progressId,
      update: (progress, newMessage = null) => {
        this.updateProgress(progressId, progress, newMessage);
      },
      complete: (finalMessage = null) => {
        this.completeProgress(progressId, finalMessage);
      },
      fail: (errorMessage = null) => {
        this.failProgress(progressId, errorMessage);
      }
    };
  }

  /**
   * キューの処理
   */
  processQueue() {
    // 表示可能な通知数をチェック
    while (this.notifications.size < this.maxNotifications && this.queue.length > 0) {
      const config = this.queue.shift();
      this.displayNotification(config);
    }
  }

  /**
   * 通知の表示実行
   */
  displayNotification(config) {
    const notificationElement = this.createNotificationElement(config);
    
    // コンテナに追加
    this.container.appendChild(notificationElement);
    
    // 通知を管理対象に追加
    this.notifications.set(config.id, {
      config,
      element: notificationElement,
      timeout: null
    });

    // アニメーション
    setTimeout(() => {
      notificationElement.classList.add('show');
    }, 10);

    // 自動消去の設定
    if (!config.persistent && config.duration > 0) {
      this.setAutoHide(config.id, config.duration);
    }

    // クリックイベント
    if (config.onClick) {
      notificationElement.addEventListener('click', config.onClick);
    }

    this.log('Notification displayed:', config.id);
  }

  /**
   * 通知要素の作成
   */
  createNotificationElement(config) {
    const notification = document.createElement('div');
    notification.className = `toast notification-toast notification-${config.type}`;
    notification.setAttribute('role', 'alert');
    notification.setAttribute('aria-live', 'assertive');
    notification.setAttribute('aria-atomic', 'true');
    notification.dataset.notificationId = config.id;

    // 通知の構造
    const header = this.createNotificationHeader(config);
    const body = this.createNotificationBody(config);
    const footer = this.createNotificationFooter(config);

    notification.appendChild(header);
    notification.appendChild(body);
    
    if (footer) {
      notification.appendChild(footer);
    }

    return notification;
  }

  /**
   * 通知ヘッダーの作成
   */
  createNotificationHeader(config) {
    const header = document.createElement('div');
    header.className = 'toast-header';

    const icon = document.createElement('i');
    icon.className = `${config.icon} me-2 text-${this.getColorByType(config.type)}`;

    const title = document.createElement('strong');
    title.className = 'me-auto';
    title.textContent = config.title;

    const time = document.createElement('small');
    time.className = 'text-muted';
    time.textContent = this.formatTime(new Date());

    const closeButton = document.createElement('button');
    closeButton.type = 'button';
    closeButton.className = 'btn-close';
    closeButton.setAttribute('aria-label', 'Close');
    closeButton.addEventListener('click', () => {
      this.hide(config.id);
    });

    header.appendChild(icon);
    header.appendChild(title);
    header.appendChild(time);
    header.appendChild(closeButton);

    return header;
  }

  /**
   * 通知ボディの作成
   */
  createNotificationBody(config) {
    const body = document.createElement('div');
    body.className = 'toast-body';

    if (config.message) {
      const message = document.createElement('div');
      message.className = 'notification-message';
      message.textContent = config.message;
      body.appendChild(message);
    }

    // 進捗バー
    if (config.progress !== undefined) {
      const progressContainer = document.createElement('div');
      progressContainer.className = 'progress mt-2';
      progressContainer.style.height = '4px';

      const progressBar = document.createElement('div');
      progressBar.className = 'progress-bar';
      progressBar.style.width = `${config.progress}%`;
      progressBar.setAttribute('role', 'progressbar');
      progressBar.setAttribute('aria-valuenow', config.progress);
      progressBar.setAttribute('aria-valuemin', '0');
      progressBar.setAttribute('aria-valuemax', '100');

      progressContainer.appendChild(progressBar);
      body.appendChild(progressContainer);
    }

    return body;
  }

  /**
   * 通知フッターの作成
   */
  createNotificationFooter(config) {
    if (!config.actions || config.actions.length === 0) {
      return null;
    }

    const footer = document.createElement('div');
    footer.className = 'toast-footer border-top pt-2 mt-2';

    const buttonGroup = document.createElement('div');
    buttonGroup.className = 'd-flex gap-2 justify-content-end';

    config.actions.forEach(action => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = `btn btn-sm ${action.class || 'btn-outline-secondary'}`;
      button.textContent = action.text;
      
      button.addEventListener('click', () => {
        if (action.onClick) {
          action.onClick();
        }
        // アクション実行後に通知を閉じる
        this.hide(config.id);
      });

      buttonGroup.appendChild(button);
    });

    footer.appendChild(buttonGroup);
    return footer;
  }

  /**
   * 通知を隠す
   */
  hide(notificationId) {
    const notification = this.notifications.get(notificationId);
    
    if (!notification) {
      this.log('Notification not found:', notificationId);
      return;
    }

    this.log('Hiding notification:', notificationId);

    // タイムアウトをクリア
    if (notification.timeout) {
      clearTimeout(notification.timeout);
    }

    // アニメーション
    notification.element.classList.remove('show');
    notification.element.classList.add('hiding');

    // onClose コールバック
    if (notification.config.onClose) {
      notification.config.onClose();
    }

    // DOM から削除
    setTimeout(() => {
      if (notification.element.parentNode) {
        notification.element.parentNode.removeChild(notification.element);
      }
      this.notifications.delete(notificationId);
      
      // キューの処理
      this.processQueue();
    }, this.animationDuration);
  }

  /**
   * すべての通知を隠す
   */
  hideAll() {
    const notificationIds = Array.from(this.notifications.keys());
    notificationIds.forEach(id => this.hide(id));
  }

  /**
   * 指定タイプの通知を隠す
   */
  hideByType(type) {
    for (const [id, notification] of this.notifications) {
      if (notification.config.type === type) {
        this.hide(id);
      }
    }
  }

  /**
   * 進捗の更新
   */
  updateProgress(notificationId, progress, message = null) {
    const notification = this.notifications.get(notificationId);
    
    if (!notification) {
      return;
    }

    const progressBar = notification.element.querySelector('.progress-bar');
    if (progressBar) {
      progressBar.style.width = `${progress}%`;
      progressBar.setAttribute('aria-valuenow', progress);
    }

    if (message) {
      const messageElement = notification.element.querySelector('.notification-message');
      if (messageElement) {
        messageElement.textContent = message;
      }
    }

    // 進捗を設定に保存
    notification.config.progress = progress;
  }

  /**
   * 進捗完了
   */
  completeProgress(notificationId, finalMessage = null) {
    const notification = this.notifications.get(notificationId);
    
    if (!notification) {
      return;
    }

    // 進捗を100%に
    this.updateProgress(notificationId, 100, finalMessage || '完了しました');

    // タイプを成功に変更
    notification.config.type = 'success';
    notification.element.className = notification.element.className.replace('notification-info', 'notification-success');

    // アイコンを変更
    const icon = notification.element.querySelector('.toast-header i');
    if (icon) {
      icon.className = 'fas fa-check-circle me-2 text-success';
    }

    // 自動で閉じる
    setTimeout(() => {
      this.hide(notificationId);
    }, 2000);
  }

  /**
   * 進捗失敗
   */
  failProgress(notificationId, errorMessage = null) {
    const notification = this.notifications.get(notificationId);
    
    if (!notification) {
      return;
    }

    // メッセージを更新
    const messageElement = notification.element.querySelector('.notification-message');
    if (messageElement) {
      messageElement.textContent = errorMessage || 'エラーが発生しました';
    }

    // 進捗バーを非表示
    const progressContainer = notification.element.querySelector('.progress');
    if (progressContainer) {
      progressContainer.style.display = 'none';
    }

    // タイプをエラーに変更
    notification.config.type = 'error';
    notification.element.className = notification.element.className.replace('notification-info', 'notification-error');

    // アイコンを変更
    const icon = notification.element.querySelector('.toast-header i');
    if (icon) {
      icon.className = 'fas fa-exclamation-circle me-2 text-danger';
    }
  }

  /**
   * 自動非表示の設定
   */
  setAutoHide(notificationId, duration) {
    const notification = this.notifications.get(notificationId);
    
    if (!notification) {
      return;
    }

    notification.timeout = setTimeout(() => {
      this.hide(notificationId);
    }, duration);
  }

  // === ユーティリティメソッド === //

  /**
   * ID生成
   */
  generateId() {
    return 'notification_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  /**
   * タイプ別の期間取得
   */
  getDurationByType(type) {
    switch (type) {
      case 'success':
        return this.defaultDuration.SUCCESS;
      case 'error':
        return this.defaultDuration.ERROR;
      case 'warning':
        return this.defaultDuration.WARNING;
      case 'info':
      default:
        return this.defaultDuration.INFO;
    }
  }

  /**
   * タイプ別のアイコン取得
   */
  getIconByType(type) {
    const iconMap = {
      success: 'fas fa-check-circle',
      error: 'fas fa-exclamation-circle',
      warning: 'fas fa-exclamation-triangle',
      info: 'fas fa-info-circle'
    };
    return iconMap[type] || iconMap.info;
  }

  /**
   * タイプ別の色取得
   */
  getColorByType(type) {
    const colorMap = {
      success: 'success',
      error: 'danger',
      warning: 'warning',
      info: 'info'
    };
    return colorMap[type] || colorMap.info;
  }

  /**
   * 時刻フォーマット
   */
  formatTime(date) {
    return date.toLocaleTimeString('ja-JP', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * ログ出力
   */
  log(message, data = null) {
    if (this.debug) {
      console.log(`[Notification] ${message}`, data || '');
    }
  }

  /**
   * 通知システムの破棄
   */
  destroy() {
    this.log('Destroying notification system...');
    
    // すべての通知を隠す
    this.hideAll();
    
    // イベントリスナーの削除
    for (const [eventName, listeners] of this.eventListeners) {
      listeners.forEach(callback => {
        document.removeEventListener(eventName, callback);
      });
    }
    this.eventListeners.clear();
    
    // コンテナをクリア
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }
    
    this.log('Notification system destroyed');
  }

  /**
   * システム情報の取得
   */
  getInfo() {
    return {
      activeNotifications: this.notifications.size,
      queuedNotifications: this.queue.length,
      maxNotifications: this.maxNotifications,
      defaultDuration: this.defaultDuration
    };
  }
};

// グローバルヘルパー関数
window.showNotification = function(title, message, type = 'info', options = {}) {
  if (window.evaluationApp && window.evaluationApp.notification) {
    return window.evaluationApp.notification.show(title, message, type, options);
  } else {
    // フォールバック
    console.log(`[${type.toUpperCase()}] ${title}: ${message}`);
    alert(`${title}\n${message}`);
  }
};

window.showSuccess = function(title, message, options = {}) {
  return window.showNotification(title, message, 'success', options);
};

window.showError = function(title, message, options = {}) {
  return window.showNotification(title, message, 'error', options);
};

window.showWarning = function(title, message, options = {}) {
  return window.showNotification(title, message, 'warning', options);
};

window.showInfo = function(title, message, options = {}) {
  return window.showNotification(title, message, 'info', options);
};

// デバッグ用
if (EvaluationApp.Constants && EvaluationApp.Constants.APP.DEBUG) {
  console.log('Notification system loaded');
}
