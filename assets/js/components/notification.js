/**
 * 通知システム
 * ユーザーへのフィードバック表示を管理
 */
class NotificationSystem {
    constructor() {
        this.notifications = [];
        this.container = null;
        this.defaultDuration = 5000; // 5秒
        this.maxNotifications = 5;
        
        this.init();
    }

    init() {
        this.createContainer();
        this.bindEvents();
    }

    createContainer() {
        // 通知コンテナが既に存在するかチェック
        this.container = document.getElementById('notification-container');
        
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.id = 'notification-container';
            this.container.className = 'notification-container';
            document.body.appendChild(this.container);
        }
    }

    bindEvents() {
        // 通知のクリックイベント（閉じる）
        this.container.addEventListener('click', (e) => {
            if (e.target.classList.contains('notification-close')) {
                const notification = e.target.closest('.notification');
                if (notification) {
                    this.removeNotification(notification.dataset.id);
                }
            } else if (e.target.classList.contains('notification')) {
                // 通知本体をクリックしても閉じる
                this.removeNotification(e.target.dataset.id);
            }
        });

        // キーボードイベント（Escapeで全て閉じる）
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.clearAll();
            }
        });
    }

    /**
     * 通知を表示
     * @param {string} message - 表示メッセージ
     * @param {string} type - 通知タイプ (success, error, warning, info)
     * @param {Object} options - オプション設定
     */
    show(message, type = 'info', options = {}) {
        const config = {
            duration: options.duration || this.defaultDuration,
            persistent: options.persistent || false,
            actionButton: options.actionButton || null,
            onAction: options.onAction || null,
            onClose: options.onClose || null,
            allowHtml: options.allowHtml || false,
            position: options.position || 'top-right'
        };

        const notification = this.createNotification(message, type, config);
        this.addNotification(notification);
        
        return notification.id;
    }

    createNotification(message, type, config) {
        const id = this.generateId();
        const timestamp = Date.now();

        const notification = {
            id,
            message,
            type,
            config,
            timestamp,
            element: null
        };

        // HTML要素を作成
        notification.element = this.createNotificationElement(notification);
        
        return notification;
    }

    createNotificationElement(notification) {
        const element = document.createElement('div');
        element.className = `notification notification-${notification.type}`;
        element.dataset.id = notification.id;
        
        // アニメーション用のクラス
        element.classList.add('notification-enter');

        // アイコンの決定
        const iconClass = this.getIconClass(notification.type);

        // メッセージの処理（HTMLかテキストか）
        const messageContent = notification.config.allowHtml 
            ? notification.message 
            : this.escapeHtml(notification.message);

        // アクションボタンの処理
        const actionButtonHtml = notification.config.actionButton
            ? `<button class="notification-action" data-id="${notification.id}">
                 ${this.escapeHtml(notification.config.actionButton)}
               </button>`
            : '';

        element.innerHTML = `
            <div class="notification-content">
                <div class="notification-icon">
                    <i class="${iconClass}"></i>
                </div>
                <div class="notification-body">
                    <div class="notification-message">${messageContent}</div>
                    ${actionButtonHtml}
                </div>
                <button class="notification-close" aria-label="閉じる">
                    <i class="icon-x"></i>
                </button>
            </div>
            ${!notification.config.persistent ? '<div class="notification-progress"></div>' : ''}
        `;

        // アクションボタンのイベント
        if (notification.config.actionButton && notification.config.onAction) {
            const actionBtn = element.querySelector('.notification-action');
            if (actionBtn) {
                actionBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    notification.config.onAction(notification.id);
                });
            }
        }

        return element;
    }

    addNotification(notification) {
        // 最大数チェック
        if (this.notifications.length >= this.maxNotifications) {
            this.removeOldestNotification();
        }

        // 通知を配列に追加
        this.notifications.push(notification);

        // DOMに追加
        this.container.appendChild(notification.element);

        // アニメーション開始
        requestAnimationFrame(() => {
            notification.element.classList.remove('notification-enter');
            notification.element.classList.add('notification-visible');
        });

        // プログレスバーアニメーション
        if (!notification.config.persistent) {
            this.startProgressAnimation(notification);
        }

        // 自動削除タイマー
        if (!notification.config.persistent && notification.config.duration > 0) {
            setTimeout(() => {
                this.removeNotification(notification.id);
            }, notification.config.duration);
        }
    }

    startProgressAnimation(notification) {
        const progressBar = notification.element.querySelector('.notification-progress');
        if (progressBar && notification.config.duration > 0) {
            progressBar.style.animationDuration = `${notification.config.duration}ms`;
            progressBar.classList.add('notification-progress-active');
        }
    }

    removeNotification(notificationId) {
        const index = this.notifications.findIndex(n => n.id === notificationId);
        if (index === -1) return;

        const notification = this.notifications[index];
        
        // 閉じるコールバック実行
        if (notification.config.onClose) {
            notification.config.onClose(notificationId);
        }

        // アニメーション
        notification.element.classList.add('notification-exit');
        
        // DOM削除
        setTimeout(() => {
            if (notification.element.parentNode) {
                notification.element.parentNode.removeChild(notification.element);
            }
            this.notifications.splice(index, 1);
        }, 300); // アニメーション時間
    }

    removeOldestNotification() {
        if (this.notifications.length > 0) {
            const oldest = this.notifications[0];
            this.removeNotification(oldest.id);
        }
    }

    clearAll() {
        const notificationIds = this.notifications.map(n => n.id);
        notificationIds.forEach(id => this.removeNotification(id));
    }

    // 便利メソッド
    success(message, options = {}) {
        return this.show(message, 'success', options);
    }

    error(message, options = {}) {
        return this.show(message, 'error', {
            duration: 8000, // エラーは少し長めに表示
            ...options
        });
    }

    warning(message, options = {}) {
        return this.show(message, 'warning', {
            duration: 6000,
            ...options
        });
    }

    info(message, options = {}) {
        return this.show(message, 'info', options);
    }

    // 確認ダイアログ風の通知
    confirm(message, onConfirm, onCancel = null) {
        return this.show(message, 'warning', {
            persistent: true,
            actionButton: '確認',
            onAction: (id) => {
                this.removeNotification(id);
                if (onConfirm) onConfirm();
            },
            onClose: (id) => {
                if (onCancel) onCancel();
            }
        });
    }

    // 進行状況表示
    progress(message, options = {}) {
        const id = this.show(message, 'info', {
            persistent: true,
            ...options
        });

        return {
            id,
            update: (newMessage) => {
                const notification = this.notifications.find(n => n.id === id);
                if (notification) {
                    const messageEl = notification.element.querySelector('.notification-message');
                    if (messageEl) {
                        messageEl.textContent = newMessage;
                    }
                }
            },
            complete: (finalMessage = null) => {
                if (finalMessage) {
                    const notification = this.notifications.find(n => n.id === id);
                    if (notification) {
                        const messageEl = notification.element.querySelector('.notification-message');
                        if (messageEl) {
                            messageEl.textContent = finalMessage;
                        }
                        notification.element.classList.remove('notification-info');
                        notification.element.classList.add('notification-success');
                    }
                }
                setTimeout(() => this.removeNotification(id), 2000);
            },
            error: (errorMessage) => {
                const notification = this.notifications.find(n => n.id === id);
                if (notification) {
                    const messageEl = notification.element.querySelector('.notification-message');
                    if (messageEl) {
                        messageEl.textContent = errorMessage;
                    }
                    notification.element.classList.remove('notification-info');
                    notification.element.classList.add('notification-error');
                }
                setTimeout(() => this.removeNotification(id), 5000);
            }
        };
    }

    // ユーティリティメソッド
    getIconClass(type) {
        const icons = {
            success: 'icon-check-circle',
            error: 'icon-x-circle',
            warning: 'icon-alert-triangle',
            info: 'icon-info'
        };
        return icons[type] || icons.info;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    generateId() {
        return `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    // 設定メソッド
    setDefaultDuration(duration) {
        this.defaultDuration = duration;
    }

    setMaxNotifications(max) {
        this.maxNotifications = max;
    }

    // 通知数の取得
    getNotificationCount() {
        return this.notifications.length;
    }

    // 特定タイプの通知数
    getNotificationCountByType(type) {
        return this.notifications.filter(n => n.type === type).length;
    }

    // 既存の通知の有無チェック
    hasNotification(type = null) {
        if (type) {
            return this.notifications.some(n => n.type === type);
        }
        return this.notifications.length > 0;
    }

    // 既存の通知を更新
    updateNotification(id, newMessage, newType = null) {
        const notification = this.notifications.find(n => n.id === id);
        if (notification) {
            const messageEl = notification.element.querySelector('.notification-message');
            if (messageEl) {
                messageEl.textContent = newMessage;
            }
            
            if (newType && newType !== notification.type) {
                notification.element.classList.remove(`notification-${notification.type}`);
                notification.element.classList.add(`notification-${newType}`);
                notification.type = newType;
                
                // アイコンも更新
                const iconEl = notification.element.querySelector('.notification-icon i');
                if (iconEl) {
                    iconEl.className = this.getIconClass(newType);
                }
            }
        }
    }

    // デバッグ用
    debug() {
        return {
            notifications: this.notifications,
            container: this.container,
            count: this.notifications.length
        };
    }
}

// CSS を動的に追加（必要な場合）
function injectNotificationStyles() {
    if (document.getElementById('notification-styles')) return;

    const style = document.createElement('style');
    style.id = 'notification-styles';
    style.textContent = `
        .notification-container {
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            pointer-events: none;
        }

        .notification {
            background: white;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            margin-bottom: 12px;
            min-width: 320px;
            max-width: 480px;
            position: relative;
            overflow: hidden;
            pointer-events: auto;
            cursor: pointer;
            transition: all 0.3s ease;
        }

        .notification-enter {
            transform: translateX(100%);
            opacity: 0;
        }

        .notification-visible {
            transform: translateX(0);
            opacity: 1;
        }

        .notification-exit {
            transform: translateX(100%);
            opacity: 0;
        }

        .notification-content {
            display: flex;
            padding: 16px;
            align-items: flex-start;
        }

        .notification-icon {
            margin-right: 12px;
            flex-shrink: 0;
        }

        .notification-body {
            flex: 1;
            min-width: 0;
        }

        .notification-message {
            font-size: 14px;
            line-height: 1.4;
            margin-bottom: 8px;
        }

        .notification-action {
            background: transparent;
            border: 1px solid currentColor;
            border-radius: 4px;
            padding: 4px 12px;
            font-size: 12px;
            cursor: pointer;
            transition: background 0.2s;
        }

        .notification-close {
            background: none;
            border: none;
            cursor: pointer;
            padding: 4px;
            margin-left: 8px;
            opacity: 0.6;
            transition: opacity 0.2s;
        }

        .notification-close:hover {
            opacity: 1;
        }

        .notification-progress {
            position: absolute;
            bottom: 0;
            left: 0;
            height: 3px;
            background: currentColor;
            opacity: 0.3;
            transform-origin: left;
            transform: scaleX(0);
        }

        .notification-progress-active {
            animation: notification-progress linear forwards;
        }

        @keyframes notification-progress {
            to { transform: scaleX(1); }
        }

        /* 通知タイプ別のスタイル */
        .notification-success {
            border-left: 4px solid #10b981;
            color: #065f46;
        }

        .notification-error {
            border-left: 4px solid #ef4444;
            color: #991b1b;
        }

        .notification-warning {
            border-left: 4px solid #f59e0b;
            color: #92400e;
        }

        .notification-info {
            border-left: 4px solid #3b82f6;
            color: #1e40af;
        }

        /* レスポンシブ対応 */
        @media (max-width: 640px) {
            .notification-container {
                top: 10px;
                right: 10px;
                left: 10px;
            }
            
            .notification {
                min-width: auto;
                max-width: none;
            }
        }
    `;
    
    document.head.appendChild(style);
}

// スタイルを注入
injectNotificationStyles();

// グローバルインスタンス
window.notification = new NotificationSystem();
