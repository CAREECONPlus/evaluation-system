/**
 * データベース管理 - IndexedDB を使用したローカルデータ永続化
 * Firebase移行時のデータアクセス層抽象化
 */

/**
 * データベース管理クラス
 */
class DatabaseManager {
    constructor() {
        this.dbName = 'evaluation_system';
        this.dbVersion = 1;
        this.db = null;
        
        // オブジェクトストア（テーブル）の定義
        this.stores = {
            'users': {
                keyPath: 'id',
                autoIncrement: false,
                indexes: [
                    { name: 'username', keyPath: 'username', unique: true },
                    { name: 'email', keyPath: 'email', unique: true },
                    { name: 'role', keyPath: 'role', unique: false }
                ]
            },
            'evaluations': {
                keyPath: 'id',
                autoIncrement: false,
                indexes: [
                    { name: 'userId', keyPath: 'userId', unique: false },
                    { name: 'periodId', keyPath: 'periodId', unique: false },
                    { name: 'status', keyPath: 'status', unique: false },
                    { name: 'updatedAt', keyPath: 'updatedAt', unique: false }
                ]
            },
            'periods': {
                keyPath: 'id',
                autoIncrement: false,
                indexes: [
                    { name: 'isActive', keyPath: 'isActive', unique: false },
                    { name: 'startDate', keyPath: 'startDate', unique: false }
                ]
            },
            'qualitativeItems': {
                keyPath: 'id',
                autoIncrement: false,
                indexes: [
                    { name: 'evaluationId', keyPath: 'evaluationId', unique: false }
                ]
            },
            'quantitativeRatings': {
                keyPath: 'id',
                autoIncrement: false,
                indexes: [
                    { name: 'evaluationId', keyPath: 'evaluationId', unique: false },
                    { name: 'categoryId', keyPath: 'categoryId', unique: false }
                ]
            },
            'settings': {
                keyPath: 'key',
                autoIncrement: false,
                indexes: []
            }
        };
    }

    /**
     * データベースの初期化
     */
    async initialize() {
        try {
            console.log('IndexedDB データベースを初期化中...');
            
            this.db = await this.openDatabase();
            
            // 初期データの投入（必要に応じて）
            await this.seedInitialData();
            
            console.log('データベースの初期化が完了しました');
            return true;
        } catch (error) {
            console.error('データベース初期化エラー:', error);
            throw error;
        }
    }

    /**
     * データベースを開く
     */
    openDatabase() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);

            request.onerror = () => {
                reject(new Error('データベースの開放に失敗しました'));
            };

            request.onsuccess = (event) => {
                resolve(event.target.result);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                this.createObjectStores(db);
            };
        });
    }

    /**
     * オブジェクトストアの作成
     */
    createObjectStores(db) {
        console.log('オブジェクトストアを作成中...');

        for (const [storeName, config] of Object.entries(this.stores)) {
            // 既存のストアがある場合は削除
            if (db.objectStoreNames.contains(storeName)) {
                db.deleteObjectStore(storeName);
            }

            // ストアを作成
            const store = db.createObjectStore(storeName, {
                keyPath: config.keyPath,
                autoIncrement: config.autoIncrement
            });

            // インデックスを作成
            config.indexes.forEach(index => {
                store.createIndex(index.name, index.keyPath, {
                    unique: index.unique
                });
            });

            console.log(`オブジェクトストア '${storeName}' を作成しました`);
        }
    }

    /**
     * 初期データの投入
     */
    async seedInitialData() {
        // 設定データが空の場合のみ初期データを投入
        const existingSettings = await this.getAll('settings');
        
        if (existingSettings.length === 0) {
            console.log('初期設定データを投入中...');
            
            const initialSettings = [
                {
                    key: 'app_version',
                    value: '1.0.0',
                    updatedAt: new Date().toISOString()
                },
                {
                    key: 'last_seeded',
                    value: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                }
            ];

            for (const setting of initialSettings) {
                await this.add('settings', setting);
            }
        }
    }

    /**
     * トランザクションの取得
     */
    getTransaction(storeNames, mode = 'readonly') {
        if (!this.db) {
            throw new Error('データベースが初期化されていません');
        }

        return this.db.transaction(storeNames, mode);
    }

    /**
     * オブジェクトストアの取得
     */
    getStore(storeName, mode = 'readonly') {
        const transaction = this.getTransaction([storeName], mode);
        return transaction.objectStore(storeName);
    }

    /**
     * データの追加
     */
    async add(storeName, data) {
        return new Promise((resolve, reject) => {
            try {
                // タイムスタンプを追加
                const dataWithTimestamp = {
                    ...data,
                    createdAt: data.createdAt || new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                };

                const store = this.getStore(storeName, 'readwrite');
                const request = store.add(dataWithTimestamp);

                request.onsuccess = () => {
                    resolve(dataWithTimestamp);
                };

                request.onerror = () => {
                    reject(new Error(`データの追加に失敗しました: ${request.error}`));
                };
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * データの更新（追加または上書き）
     */
    async put(storeName, data) {
        return new Promise((resolve, reject) => {
            try {
                // タイムスタンプを更新
                const dataWithTimestamp = {
                    ...data,
                    updatedAt: new Date().toISOString()
                };

                const store = this.getStore(storeName, 'readwrite');
                const request = store.put(dataWithTimestamp);

                request.onsuccess = () => {
                    resolve(dataWithTimestamp);
                };

                request.onerror = () => {
                    reject(new Error(`データの更新に失敗しました: ${request.error}`));
                };
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * データの取得（単一）
     */
    async get(storeName, key) {
        return new Promise((resolve, reject) => {
            try {
                const store = this.getStore(storeName, 'readonly');
                const request = store.get(key);

                request.onsuccess = () => {
                    resolve(request.result);
                };

                request.onerror = () => {
                    reject(new Error(`データの取得に失敗しました: ${request.error}`));
                };
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * データの取得（全て）
     */
    async getAll(storeName, query = null) {
        return new Promise((resolve, reject) => {
            try {
                const store = this.getStore(storeName, 'readonly');
                const request = store.getAll(query);

                request.onsuccess = () => {
                    resolve(request.result);
                };

                request.onerror = () => {
                    reject(new Error(`データの取得に失敗しました: ${request.error}`));
                };
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * インデックスを使用したデータの取得
     */
    async getByIndex(storeName, indexName, value) {
        return new Promise((resolve, reject) => {
            try {
                const store = this.getStore(storeName, 'readonly');
                const index = store.index(indexName);
                const request = index.getAll(value);

                request.onsuccess = () => {
                    resolve(request.result);
                };

                request.onerror = () => {
                    reject(new Error(`インデックス検索に失敗しました: ${request.error}`));
                };
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * データの削除
     */
    async delete(storeName, key) {
        return new Promise((resolve, reject) => {
            try {
                const store = this.getStore(storeName, 'readwrite');
                const request = store.delete(key);

                request.onsuccess = () => {
                    resolve(true);
                };

                request.onerror = () => {
                    reject(new Error(`データの削除に失敗しました: ${request.error}`));
                };
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * ストア内の全データを削除
     */
    async clear(storeName) {
        return new Promise((resolve, reject) => {
            try {
                const store = this.getStore(storeName, 'readwrite');
                const request = store.clear();

                request.onsuccess = () => {
                    resolve(true);
                };

                request.onerror = () => {
                    reject(new Error(`ストアの削除に失敗しました: ${request.error}`));
                };
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * データ数の取得
     */
    async count(storeName, query = null) {
        return new Promise((resolve, reject) => {
            try {
                const store = this.getStore(storeName, 'readonly');
                const request = store.count(query);

                request.onsuccess = () => {
                    resolve(request.result);
                };

                request.onerror = () => {
                    reject(new Error(`カウントの取得に失敗しました: ${request.error}`));
                };
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * 複合クエリ（条件でフィルタリング）
     */
    async query(storeName, filter = null, sortBy = null, limit = null) {
        return new Promise((resolve, reject) => {
            try {
                const store = this.getStore(storeName, 'readonly');
                const request = store.getAll();

                request.onsuccess = () => {
                    let results = request.result;

                    // フィルタリング
                    if (filter && typeof filter === 'function') {
                        results = results.filter(filter);
                    }

                    // ソート
                    if (sortBy) {
                        results.sort((a, b) => {
                            const aVal = this.getNestedValue(a, sortBy.field);
                            const bVal = this.getNestedValue(b, sortBy.field);
                            
                            if (sortBy.direction === 'desc') {
                                return bVal > aVal ? 1 : bVal < aVal ? -1 : 0;
                            } else {
                                return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
                            }
                        });
                    }

                    // 制限
                    if (limit && limit > 0) {
                        results = results.slice(0, limit);
                    }

                    resolve(results);
                };

                request.onerror = () => {
                    reject(new Error(`クエリの実行に失敗しました: ${request.error}`));
                };
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * ネストされたオブジェクトプロパティの取得
     */
    getNestedValue(obj, path) {
        return path.split('.').reduce((value, key) => {
            return value && value[key] !== undefined ? value[key] : undefined;
        }, obj);
    }

    /**
     * バッチ操作（複数のデータを一括処理）
     */
    async batch(operations) {
        const transaction = this.getTransaction(['users', 'evaluations', 'periods', 'qualitativeItems', 'quantitativeRatings', 'settings'], 'readwrite');
        
        const promises = operations.map(operation => {
            return new Promise((resolve, reject) => {
                const store = transaction.objectStore(operation.storeName);
                let request;

                switch (operation.type) {
                    case 'add':
                        request = store.add(operation.data);
                        break;
                    case 'put':
                        request = store.put(operation.data);
                        break;
                    case 'delete':
                        request = store.delete(operation.key);
                        break;
                    default:
                        reject(new Error(`不明な操作タイプ: ${operation.type}`));
                        return;
                }

                request.onsuccess = () => resolve(request.result);
                request.onerror = () => reject(request.error);
            });
        });

        return Promise.all(promises);
    }

    /**
     * データのエクスポート
     */
    async exportData() {
        const exportData = {};
        
        for (const storeName of Object.keys(this.stores)) {
            exportData[storeName] = await this.getAll(storeName);
        }
        
        exportData.exportedAt = new Date().toISOString();
        exportData.version = this.dbVersion;
        
        return exportData;
    }

    /**
     * データのインポート
     */
    async importData(data) {
        if (!data || typeof data !== 'object') {
            throw new Error('無効なインポートデータです');
        }

        // バージョンチェック
        if (data.version && data.version > this.dbVersion) {
            console.warn('インポートデータのバージョンが新しいです。互換性の問題が発生する可能性があります。');
        }

        const operations = [];

        for (const [storeName, storeData] of Object.entries(data)) {
            if (storeName === 'exportedAt' || storeName === 'version') {
                continue;
            }

            if (Object.keys(this.stores).includes(storeName) && Array.isArray(storeData)) {
                // 既存データをクリア
                await this.clear(storeName);
                
                // 新しいデータを追加
                for (const item of storeData) {
                    operations.push({
                        type: 'add',
                        storeName: storeName,
                        data: item
                    });
                }
            }
        }

        await this.batch(operations);
        console.log(`データのインポートが完了しました: ${operations.length} 件`);
    }

    /**
     * データベースの削除
     */
    async deleteDatabase() {
        return new Promise((resolve, reject) => {
            if (this.db) {
                this.db.close();
                this.db = null;
            }

            const deleteRequest = indexedDB.deleteDatabase(this.dbName);

            deleteRequest.onsuccess = () => {
                console.log('データベースが削除されました');
                resolve(true);
            };

            deleteRequest.onerror = () => {
                reject(new Error('データベースの削除に失敗しました'));
            };

            deleteRequest.onblocked = () => {
                console.warn('データベースの削除がブロックされました。他のタブを閉じてください。');
            };
        });
    }

    /**
     * データベースのサイズを取得（概算）
     */
    async getDatabaseSize() {
        try {
            const sizes = {};
            let totalSize = 0;

            for (const storeName of Object.keys(this.stores)) {
                const data = await this.getAll(storeName);
                const jsonStr = JSON.stringify(data);
                const size = new Blob([jsonStr]).size;
                sizes[storeName] = size;
                totalSize += size;
            }

            sizes.total = totalSize;
            sizes.totalFormatted = this.formatBytes(totalSize);

            return sizes;
        } catch (error) {
            console.error('データベースサイズの取得に失敗しました:', error);
            return null;
        }
    }

    /**
     * バイトを人間が読みやすい形式に変換
     */
    formatBytes(bytes, decimals = 2) {
        if (bytes === 0) return '0 Bytes';

        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }

    /**
     * 設定値の取得
     */
    async getSetting(key) {
        const setting = await this.get('settings', key);
        return setting ? setting.value : null;
    }

    /**
     * 設定値の設定
     */
    async setSetting(key, value) {
        const setting = {
            key: key,
            value: value,
            updatedAt: new Date().toISOString()
        };
        return await this.put('settings', setting);
    }

    /**
     * データベースの健全性チェック
     */
    async healthCheck() {
        const health = {
            connected: !!this.db,
            version: this.dbVersion,
            stores: {},
            issues: []
        };

        if (!this.db) {
            health.issues.push('データベースに接続されていません');
            return health;
        }

        // 各ストアの健全性をチェック
        for (const storeName of Object.keys(this.stores)) {
            try {
                const count = await this.count(storeName);
                health.stores[storeName] = {
                    exists: true,
                    count: count
                };
            } catch (error) {
                health.stores[storeName] = {
                    exists: false,
                    error: error.message
                };
                health.issues.push(`ストア ${storeName} にアクセスできません: ${error.message}`);
            }
        }

        return health;
    }
}

// グローバルに公開
window.DatabaseManager = DatabaseManager;

console.log('DatabaseManager が読み込まれました');
