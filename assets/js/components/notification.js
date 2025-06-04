/**
 * notification.js - 建設業評価システム通知管理
 * トースト通知・アラート・確認ダイアログ
 */

class NotificationManager {
    constructor() {
        this.container = null;
        this.notifications = new Map();
        this.defaultOptions = {
            duration: 3000,
            position: 'top-right',
            maxNotifications: 5,
            animation: true,
            pauseOnHover: true,
            closeButton: true,
            sound: false
        };
        
        this.init();
    }
    
    init() {
        this.createContainer();
        this.setupStyles();
        console.log('🔔 Notification Manager initialized');
    }
    
    /**
     * 通知コンテナを作成
     */
    createContainer() {
        this.container = document.getElementById('notification-container');
        
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.id = 'notification-container';
            document.body.appendChild(this.container);
        }
        
        this.container.className = 'notification-container';
        this.container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: var(--z-index-toast);
            pointer-events: none;
            max-width: 400px;
        `;
    }
    
    /**
     * 通知スタイルを設定
     */
    setupStyles() {
        if (document.getElementById('notification-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            .notification-item {
                pointer-events: auto;
                margin-bottom: 12px;
                border-radius: var(--border-radius);
                box-shadow: var(--shadow-lg);
                overflow: hidden;
                transform: translateX(100%);
                transition: all var(--transition-base);
                max-width: 100%;
                word-wrap: break-word;
            }
            
            .notification-item.show {
                transform: translateX(0);
            }
            
            .notification-item.hide {
                transform: translateX(100%);
                opacity: 0;
            }
            
            .notification-content {
                padding: 16px 20px;
                display: flex;
                align-items: flex-start;
                gap: 12px;
                position: relative;
            }
            
            .notification-icon {
                font-size: 20px;
                flex-shrink: 0;
                margin-top: 2px;
            }
            
            .notification-body {
                flex: 1;
            }
            
            .notification-title {
                font-weight: var(--font-weight-semibold);
                margin-bottom: 4px;
                font-size: var(--font-size-sm);
            }
            
            .notification-message {
                font-size: var(--font-size-sm);
                line-height: var(--line-height-relaxed);
                opacity: 0.9;
            }
            
            .notification-close {
                position: absolute;
                top: 8px;
                right: 8px;
                background: none;
                border: none;
                color: inherit;
                cursor: pointer;
                width: 24px;
                height: 24px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
                opacity: 0.7;
                transition: var(--transition-fast);
            }
            
            .notification-close:hover {
                opacity: 1;
                background: rgba(255, 255, 255, 0.1);
            }
            
            .notification-progress {
                position: absolute;
                bottom: 0;
                left: 0;
                height: 3px;
                background: rgba(255, 255, 255, 0.3);
                transition: width linear;
            }
            
            /* 通知タイプ別スタイル */
            .notification-success {
                background: var(--color-success);
                color: white;
            }
            
            .notification-error {
                background: var(--color-danger);
                color: white;
            }
            
            .notification-warning {
                background: var(--color-warning);
                color: white;
            }
            
            .notification-info {
                background: var(--color-primary);
                color: white;
            }
            
            /* レスポンシブ対応 */
            @media (max-width: 768px) {
                .notification-container {
                    left: 12px;
                    right: 12px;
                    top: 12px;
                    max-width: none;
                }
                
                .notification-item {
                    transform: translateY(-100%);
                }
                
                .notification-item.show {
                    transform: translateY(0);
                }
                
                .notification-item.hide {
                    transform: translateY(-100%);
                }
            }
        `;
        
        document.head.appendChild(style);
    }
    
    /**
     * 通知を表示
     * @param {string} message - メッセージ
     * @param {string} type - 通知タイプ (success, error, warning, info)
     * @param {Object} options - オプション
     * @returns {string} 通知ID
     */
    show(message, type = 'info', options = {}) {
        const config = { ...this.defaultOptions, ...options };
        const id = this.generateId();
        
        // 最大通知数チェック
        if (this.notifications.size >= config.maxNotifications) {
            this.removeOldest();
        }
        
        const notification = this.createNotification(id, message, type, config);
        this.notifications.set(id, notification);
        
        // コンテナに追加
        this.container.appendChild(notification.element);
        
        // アニメーション開始
        setTimeout(() => {
            notification.element.classList.add('show');
        }, 10);
        
        // 自動削除タイマー設定
        if (config.duration > 0) {
            notification.timer = setTimeout(() => {
                this.hide(id);
            }, config.duration);
            
            // プログレスバー更新
            if (notification.progressBar) {
                notification.progressBar.style.width = '100%';
                notification.progressBar.style.transitionDuration = config.duration + 'ms';
                
                setTimeout(() => {
                    notification.progressBar.style.width = '0%';
                }, 10);
            }
        }
        
        // ホバー時の一時停止
        if (config.pauseOnHover) {
            notification.element.addEventListener('mouseenter', () => {
                if (notification.timer) {
                    clearTimeout(notification.timer);
                    notification.timer = null;
                }
                if (notification.progressBar) {
                    notification.progressBar.style.animationPlayState = 'paused';
                }
            });
            
            notification.element.addEventListener('mouseleave', () => {
                if (config.duration > 0) {
                    const remainingTime = config.duration * 0.3; // 簡易実装
                    notification.timer = setTimeout(() => {
                        this.hide(id);
                    }, remainingTime);
                }
            });
        }
        
        // 音声再生
        if (config.sound) {
            this.playSound(type);
        }
        
        console.log(`🔔 Notification shown: ${type} - ${message}`);
        return id;
    }
    
    /**
     * 通知要素を作成
     * @param {string} id - 通知ID
     * @param {string} message - メッセージ
     * @param {string} type - タイプ
     * @param {Object} config - 設定
     * @returns {Object} 通知オブジェクト
     */
    createNotification(id, message, type, config) {
        const element = document.createElement('div');
        element.className = `notification-item notification-${type}`;
        element.dataset.notificationId = id;
        
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };
        
        const titles = {
            success: i18n.t?.('notification.success') || '成功',
            error: i18n.t?.('notification.error') || 'エラー',
            warning: i18n.t?.('notification.warning') || '警告',
            info: i18n.t?.('notification.info') || '情報'
        };
        
        element.innerHTML = `
            <div class="notification-content">
                <div class="notification-icon">${icons[type] || 'ℹ️'}</div>
                <div class="notification-body">
                    <div class="notification-title">${titles[type]}</div>
                    <div class="notification-message">${this.escapeHtml(message)}</div>
                </div>
                ${config.closeButton ? '<button class="notification-close">×</button>' : ''}
            </div>
            ${config.duration > 0 ? '<div class="notification-progress"></div>' : ''}
        `;
        
        // 閉じるボタンのイベント
        if (config.closeButton) {
            const closeButton = element.querySelector('.notification-close');
            closeButton.addEventListener('click', () => {
                this.hide(id);
            });
        }
        
        const progressBar = element.querySelector('.notification-progress');
        
        return {
            id,
            element,
            progressBar,
            timer: null,
            type,
            message,
            createdAt: Date.now()
        };
    }
    
    /**
     * 通知を非表示
     * @param {string} id - 通知ID
     */
    hide(id) {
        const notification = this.notifications.get(id);
        if (!notification) return;
        
        // タイマークリア
        if (notification.timer) {
            clearTimeout(notification.timer);
        }
        
        // アニメーション開始
        notification.element.classList.add('hide');
        
        // DOM削除
        setTimeout(() => {
            if (notification.element.parentNode) {
                notification.element.parentNode.removeChild(notification.element);
            }
            this.notifications.delete(id);
        }, 300);
    }
    
    /**
     * すべての通知をクリア
     */
    clear() {
        this.notifications.forEach((notification, id) => {
            this.hide(id);
        });
    }
    
    /**
     * 最古の通知を削除
     */
    removeOldest() {
        let oldestId = null;
        let oldestTime = Date.now();
        
        this.notifications.forEach((notification, id) => {
            if (notification.createdAt < oldestTime) {
                oldestTime = notification.createdAt;
                oldestId = id;
            }
        });
        
        if (oldestId) {
            this.hide(oldestId);
        }
    }
    
    /**
     * 確認ダイアログを表示
     * @param {string} message - メッセージ
     * @param {Object} options - オプション
     * @returns {Promise<boolean>} ユーザーの選択結果
     */
    async confirm(message, options = {}) {
        const config = {
            title: '確認',
            confirmText: 'OK',
            cancelText: 'キャンセル',
            type: 'warning',
            ...options
        };
        
        return new Promise((resolve) => {
            const modal = this.createConfirmModal(message, config);
            document.body.appendChild(modal);
            
            // 表示アニメーション
            setTimeout(() => {
                modal.classList.add('show');
            }, 10);
            
            // イベントリスナー設定
            const cleanup = () => {
                modal.classList.remove('show');
                setTimeout(() => {
                    if (modal.parentNode) {
                        modal.parentNode.removeChild(modal);
                    }
                }, 300);
            };
            
            modal.querySelector('.confirm-ok').addEventListener('click', () => {
                cleanup();
                resolve(true);
            });
            
            modal.querySelector('.confirm-cancel').addEventListener('click', () => {
                cleanup();
                resolve(false);
            });
            
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    cleanup();
                    resolve(false);
                }
            });
        });
    }
    
    /**
     * 確認モーダルを作成
     * @param {string} message - メッセージ
     * @param {Object} config - 設定
     * @returns {HTMLElement} モーダル要素
     */
    createConfirmModal(message, config) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: var(--modal-backdrop-bg);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: var(--z-index-modal);
            opacity: 0;
            visibility: hidden;
            transition: var(--transition-base);
        `;
        
        modal.innerHTML = `
            <div class="modal-content" style="
                background: var(--modal-content-bg);
                border-radius: var(--modal-content-border-radius);
                box-shadow: var(--shadow-xl);
                max-width: 400px;
                width: 90%;
                transform: scale(0.9);
                transition: var(--transition-base);
            ">
                <div class="modal-header" style="
                    background: var(--color-${config.type});
                    color: var(--color-white);
                    padding: var(--spacing-md) var(--spacing-lg);
                    border-radius: var(--modal-content-border-radius) var(--modal-content-border-radius) 0 0;
                ">
                    <h3 style="margin: 0; font-size: var(--font-size-lg);">${config.title}</h3>
                </div>
                <div class="modal-body" style="padding: var(--spacing-lg);">
                    <p style="margin: 0; line-height: var(--line-height-relaxed);">${this.escapeHtml(message)}</p>
                </div>
                <div class="modal-footer" style="
                    padding: var(--spacing-md) var(--spacing-lg);
                    border-top: 1px solid var(--border-color);
                    display: flex;
                    justify-content: flex-end;
                    gap: var(--spacing-sm);
                ">
                    <button class="btn btn-secondary confirm-cancel">${config.cancelText}</button>
                    <button class="btn btn-primary confirm-ok">${config.confirmText}</button>
                </div>
            </div>
        `;
        
        modal.addEventListener('transitionend', () => {
            if (modal.classList.contains('show')) {
                modal.style.opacity = '1';
                modal.style.visibility = 'visible';
                modal.querySelector('.modal-content').style.transform = 'scale(1)';
            }
        });
        
        return modal;
    }
    
    /**
     * ID生成
     * @returns {string} ユニークID
     */
    generateId() {
        return 'notif_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    /**
     * HTMLエスケープ
     * @param {string} text - エスケープするテキスト
     * @returns {string} エスケープ済みテキスト
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    /**
     * 音声再生
     * @param {string} type - 通知タイプ
     */
    playSound(type) {
        try {
            // Web Audio APIを使用した簡易音声生成
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            // タイプ別の音声設定
            const soundSettings = {
                success: { frequency: 800, duration: 200 },
                error: { frequency: 300, duration: 500 },
                warning: { frequency: 600, duration: 300 },
                info: { frequency: 500, duration: 150 }
            };
            
            const settings = soundSettings[type] || soundSettings.info;
            
            oscillator.frequency.setValueAtTime(settings.frequency, audioContext.currentTime);
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + settings.duration / 1000);
            
            oscillator.start();
            oscillator.stop(audioContext.currentTime + settings.duration / 1000);
        } catch (error) {
            console.warn('Failed to play notification sound:', error);
        }
    }
    
    /**
     * 通知統計情報取得
     * @returns {Object} 統計情報
     */
    getStats() {
        const stats = {
            total: 0,
            byType: { success: 0, error: 0, warning: 0, info: 0 },
            active: this.notifications.size
        };
        
        this.notifications.forEach(notification => {
            stats.total++;
            stats.byType[notification.type] = (stats.byType[notification.type] || 0) + 1;
        });
        
        return stats;
    }
}

// 通知ヘルパー関数
const notificationHelpers = {
    /**
     * 成功通知
     * @param {string} message - メッセージ
     * @param {Object} options - オプション
     */
    success(message, options = {}) {
        return notificationManager.show(message, 'success', options);
    },
    
    /**
     * エラー通知
     * @param {string} message - メッセージ
     * @param {Object} options - オプション
     */
    error(message, options = {}) {
        return notificationManager.show(message, 'error', {
            duration: 5000, // エラーは長めに表示
            ...options
        });
    },
    
    /**
     * 警告通知
     * @param {string} message - メッセージ
     * @param {Object} options - オプション
     */
    warning(message, options = {}) {
        return notificationManager.show(message, 'warning', options);
    },
    
    /**
     * 情報通知
     * @param {string} message - メッセージ
     * @param {Object} options - オプション
     */
    info(message, options = {}) {
        return notificationManager.show(message, 'info', options);
    },
    
    /**
     * 翻訳関連通知
     * @param {string} type - 通知タイプ
     * @param {string} message - メッセージ
     */
    translation(type, message) {
        const icons = {
            translating: '🌐',
            success: '✅',
            failed: '❌'
        };
        
        const titles = {
            translating: '翻訳中...',
            success: '翻訳完了',
            failed: '翻訳失敗'
        };
        
        return this[type === 'translating' ? 'info' : type === 'success' ? 'success' : 'error'](
            `${icons[type]} ${titles[type]}: ${message}`,
            { duration: type === 'translating' ? 1000 : 3000 }
        );
    },
    
    /**
     * 建設業界専用通知
     * @param {string} type - 通知タイプ
     * @param {string} action - アクション
     * @param {Object} data - データ
     */
    construction(type, action, data = {}) {
        const messages = {
            safety: {
                alert: `🦺 安全警告: ${data.message || '安全確認が必要です'}`,
                check: `✅ 安全チェック完了: ${data.area || '作業エリア'}`,
                training: `📚 安全教育: ${data.topic || '新しい安全手順'}が追加されました`
            },
            evaluation: {
                saved: `💾 評価を保存しました: ${data.target || '対象者'}`,
                submitted: `📋 評価を提出しました: ${data.period || '評価期間'}`,
                approved: `✅ 評価が承認されました: ${data.evaluator || '評価者'}より`
            },
            work: {
                start: `🏗️ 作業開始: ${data.task || '作業内容'}`,
                complete: `🎉 作業完了: ${data.task || '作業内容'}`,
                break: `☕ 休憩時間: ${data.duration || '15分'}間の休憩を開始`
            }
        };
        
        const message = messages[type]?.[action] || `${type}: ${action}`;
        const notificationType = action.includes('alert') || action.includes('warning') ? 'warning' :
                               action.includes('complete') || action.includes('approved') ? 'success' : 'info';
        
        return this[notificationType](message);
    },
    
    /**
     * プログレス通知（長時間処理用）
     * @param {string} title - タイトル
     * @param {number} progress - 進捗（0-100）
     * @param {string} id - 通知ID（更新用）
     */
    progress(title, progress, id = null) {
        const message = `${title}<br><div style="margin-top: 8px; background: rgba(255,255,255,0.3); border-radius: 10px; height: 6px;"><div style="background: white; height: 100%; border-radius: 10px; width: ${progress}%; transition: width 0.3s;"></div></div><div style="margin-top: 4px; font-size: 12px;">${progress}%</div>`;
        
        if (id && notificationManager.notifications.has(id)) {
            // 既存の通知を更新
            const notification = notificationManager.notifications.get(id);
            notification.element.querySelector('.notification-message').innerHTML = message;
            return id;
        } else {
            // 新しい通知を作成
            return this.info(message, { duration: 0, closeButton: false });
        }
    }
};

// グローバルインスタンス作成
const notificationManager = new NotificationManager();

// グローバルに公開
if (typeof window !== 'undefined') {
    window.notificationManager = notificationManager;
    window.showNotification = notificationManager.show.bind(notificationManager);
    window.hideNotification = notificationManager.hide.bind(notificationManager);
    window.clearNotifications = notificationManager.clear.bind(notificationManager);
    window.confirmDialog = notificationManager.confirm.bind(notificationManager);
    
    // ヘルパー関数もグローバルに
    Object.assign(window, notificationHelpers);
}

console.log('🔔 notification.js loaded - Notification system ready');
