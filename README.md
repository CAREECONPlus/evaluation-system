# 評価システム（Local Edition）

> 企業向け人事評価管理システム - ローカル環境対応版

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)
![Bootstrap](https://img.shields.io/badge/Bootstrap-7952B3?logo=bootstrap&logoColor=white)

## 📋 概要

評価システムは、企業の人事評価プロセスを効率化・透明化するWebアプリケーションです。ローカル環境で動作し、ブラウザのストレージ機能を使用してデータを管理します。

### 主な特徴

- 🏢 **マルチテナント対応**: 複数企業の設定に対応
- 👥 **役割ベース管理**: 管理者、評価者、従業員の権限制御
- 📊 **定量・定性評価**: 数値評価と目標設定評価の両方をサポート
- 📈 **可視化レポート**: Chart.jsによる評価結果の視覚化
- 📱 **レスポンシブデザイン**: モバイル・タブレット対応
- 🔒 **ローカル保存**: ブラウザのIndexedDBによる安全なローカル保存
- 🎨 **テーマ切り替え**: 業界・企業に応じたカスタムテーマ

## 🚀 クイックスタート

### 前提条件

- モダンな Web ブラウザ（Chrome, Firefox, Safari, Edge）
- ローカルWebサーバー（推奨）または静的ファイル対応ブラウザ

### インストール

1. **リポジトリのクローン**
   ```bash
   git clone https://github.com/yourusername/evaluation-system.git
   cd evaluation-system
   ```

2. **ローカルサーバーの起動**（推奨）
   ```bash
   # Python 3を使用する場合
   python -m http.server 8000
   
   # Node.jsを使用する場合
   npx http-server .
   
   # VSCodeのLive Server拡張を使用することも可能
   ```

3. **ブラウザでアクセス**
   ```
   http://localhost:8000
   ```

### 初期設定

1. `index.html` にアクセス
2. 企業を選択（またはカスタム企業を作成）
3. サンプルユーザーでログイン（設定により自動生成）

## 📁 プロジェクト構造（MVP版）

```
evaluation-system/
├── index.html                    # ランディングページ・企業選択
├── app.html                      # メインアプリケーション
├── README.md                     # このファイル
├── LICENSE                       # ライセンス
├── assets/                       # 静的ファイル
│   ├── css/
│   │   ├── main.css              # メインスタイル（統合版）
│   │   └── themes/
│   │       └── default.css       # デフォルトテーマ
│   ├── js/
│   │   ├── app.js                # メインアプリケーション
│   │   ├── core/
│   │   │   ├── database.js       # データ永続化
│   │   │   ├── auth.js           # 認証シミュレーション
│   │   │   └── router.js         # ページルーティング
│   │   ├── components/
│   │   │   ├── dashboard.js      # ダッシュボード
│   │   │   ├── evaluation.js     # 評価機能
│   │   │   ├── user-management.js # ユーザー管理
│   │   │   └── settings.js       # 設定管理
│   │   └── utils/
│   │       ├── validation.js     # バリデーション
│   │       └── date.js          # 日付操作
│   └── images/                   # 画像ファイル
│       └── logo.png              # ロゴ
└── config/                       # 設定ファイル
    ├── app-config.js            # アプリケーション設定
    ├── evaluation-config.js     # 評価項目設定（モックデータ含む）
    └── tenant-config.js         # 企業別設定
```

## 🔧 主な機能

### 1. ダッシュボード
- 現在の評価期間表示
- 自己評価の進捗状況
- 最近の評価一覧
- 評価対象者の概要（評価者向け）

### 2. 評価管理
- **定量評価**: 技術スキル、営業成績等の数値評価
- **定性評価**: 目標設定と達成度評価（ウェイト配分可能）
- **下書き保存**: 途中保存機能
- **承認ワークフロー**: 評価者→管理者の2段階承認

### 3. ユーザー管理
- ユーザーの追加・編集・削除
- 役割ベースのアクセス制御
- 評価者の割り当て

### 4. 設定管理
- 評価期間の管理
- 評価カテゴリの設定
- 役職別評価項目のカスタマイズ

### 5. レポート機能
- 期間別評価推移
- レーダーチャートによる可視化
- 評価結果の比較分析

## 🎨 テーマ・カスタマイズ

### 事前定義テーマ
- **Default**: 一般企業向けの標準テーマ

### カスタムテーマの作成（将来拡張）
1. `assets/css/themes/` にCSSファイルを作成
2. `config/tenant-config.js` でテーマを指定
3. CSS変数を使用した色・スタイルの調整

## 👥 ユーザー権限

| 機能 | 従業員 | 評価者 | 管理者 |
|------|--------|--------|--------|
| 自己評価入力 | ✅ | ✅ | ✅ |
| 部下の評価確認 | ❌ | ✅ | ✅ |
| 評価の承認 | ❌ | ✅ | ✅ |
| ユーザー管理 | ❌ | ❌ | ✅ |
| システム設定 | ❌ | ❌ | ✅ |
| レポート閲覧 | 自分のみ | 部下含む | 全体 |

## 🔄 Firebase移行対応

このローカル版は、将来的なFirebase移行を考慮した設計となっています。

### 移行対応の特徴
- データアクセス層の抽象化
- 認証機能の抽象化
- 設定の外部化
- 非同期処理の一貫性

### 移行時の変更範囲
- **変更が必要**: データサービス実装、認証実装
- **変更不要**: UIコンポーネント、ビジネスロジック、CSS

## 🛠️ 開発

### 前提条件
- 現代的なブラウザ

### ローカル開発
```bash
# 開発サーバーの起動（例）
python -m http.server 8000

# または
npx http-server .
```

### 開発ガイドライン
- ES6+ の JavaScript を使用
- BEM 命名規則でCSS設計
- モジュール単位での実装
- 移行性を考慮した抽象化レイヤー

## 📚 ドキュメント

- [セットアップガイド](docs/SETUP.md) - 詳細な設定手順（将来追加）
- [ユーザーガイド](docs/USER_GUIDE.md) - 機能の使い方（将来追加）
- [カスタマイズガイド](docs/CUSTOMIZATION.md) - 企業向けカスタマイズ（将来追加）

## 🐛 バグ報告・機能要望

Issues や Pull Requests は GitHub で受け付けています。

### 報告時の情報
- ブラウザとバージョン
- 再現手順
- 期待される動作
- 実際の動作

## 📄 ライセンス

このプロジェクトは [MIT License](LICENSE) の下でライセンスされています。

## 🤝 貢献

1. このリポジトリをフォーク
2. 機能ブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add some amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. Pull Request を作成

## 📞 サポート

- GitHub Issues: [Issues](https://github.com/yourusername/evaluation-system/issues)
- ドキュメント: [Wiki](https://github.com/yourusername/evaluation-system/wiki)

## 🔗 関連リンク

- [Chart.js](https://www.chartjs.org/) - グラフ描画ライブラリ
- [Bootstrap](https://getbootstrap.com/) - CSSフレームワーク
- [Font Awesome](https://fontawesome.com/) - アイコンライブラリ

---

**Built with ❤️ for modern businesses**