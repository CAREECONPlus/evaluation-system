/**
 * 五角形チャート作成クラス
 * 建設業評価システム用の自作レーダーチャート
 * 
 * @author Construction Evaluation System
 * @version 1.0.0
 */
class PentagonChart {
    /**
     * コンストラクタ
     * @param {string} containerId - チャートを描画するコンテナのID
     * @param {Array} categories - 評価カテゴリの配列
     * @param {Array} data - 評価データの配列（0-5の数値）
     */
    constructor(containerId, categories, data = []) {
        this.container = document.getElementById(containerId);
        this.categories = categories;
        this.data = data.length ? data : categories.map(() => 0);
        this.size = 280;
        this.center = this.size / 2;
        this.maxRadius = this.size * 0.35;
        this.init();
    }

    /**
     * チャートの初期化
     */
    init() {
        if (!this.container) {
            console.error('Pentagon chart container not found:', this.containerId);
            return;
        }
        
        this.container.innerHTML = '';
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', this.size);
        svg.setAttribute('height', this.size);
        svg.setAttribute('viewBox', `0 0 ${this.size} ${this.size}`);

        this.drawGrid(svg);
        this.drawData(svg);
        this.drawLabels(svg);

        this.container.appendChild(svg);
    }

    /**
     * 五角形の頂点座標を計算
     * @param {number} radius - 半径
     * @returns {Array} 座標の配列
     */
    getPoints(radius) {
        const points = [];
        for (let i = 0; i < 5; i++) {
            const angle = (i * 2 * Math.PI / 5) - (Math.PI / 2);
            const x = this.center + radius * Math.cos(angle);
            const y = this.center + radius * Math.sin(angle);
            points.push([x, y]);
        }
        return points;
    }

    /**
     * グリッド（背景の五角形と線）を描画
     * @param {SVGElement} svg - SVG要素
     */
    drawGrid(svg) {
        // 同心五角形を5段階で描画
        for (let i = 1; i <= 5; i++) {
            const radius = (this.maxRadius * i) / 5;
            const points = this.getPoints(radius);
            const path = `M ${points[0][0]} ${points[0][1]} ` + 
                        points.slice(1).map(p => `L ${p[0]} ${p[1]}`).join(' ') + ' Z';

            const gridPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            gridPath.setAttribute('d', path);
            gridPath.setAttribute('class', 'pentagon-grid');
            gridPath.setAttribute('fill', 'none');
            gridPath.setAttribute('stroke', '#e0e0e0');
            gridPath.setAttribute('stroke-width', '1');
            svg.appendChild(gridPath);
        }

        // 中心から各頂点への放射線を描画
        for (let i = 0; i < 5; i++) {
            const angle = (i * 2 * Math.PI / 5) - (Math.PI / 2);
            const x = this.center + this.maxRadius * Math.cos(angle);
            const y = this.center + this.maxRadius * Math.sin(angle);

            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', this.center);
            line.setAttribute('y1', this.center);
            line.setAttribute('x2', x);
            line.setAttribute('y2', y);
            line.setAttribute('stroke', '#e0e0e0');
            line.setAttribute('stroke-width', '1');
            svg.appendChild(line);
        }
    }

    /**
     * 評価データを五角形で描画
     * @param {SVGElement} svg - SVG要素
     */
    drawData(svg) {
        const dataPoints = [];
        
        // 各評価項目の座標を計算
        for (let i = 0; i < 5; i++) {
            const value = this.data[i] || 0;
            const radius = (this.maxRadius * value) / 5;
            const angle = (i * 2 * Math.PI / 5) - (Math.PI / 2);
            const x = this.center + radius * Math.cos(angle);
            const y = this.center + radius * Math.sin(angle);
            dataPoints.push([x, y]);
        }

        if (dataPoints.length > 0) {
            // データエリア（塗りつぶし）を描画
            const path = `M ${dataPoints[0][0]} ${dataPoints[0][1]} ` + 
                        dataPoints.slice(1).map(p => `L ${p[0]} ${p[1]}`).join(' ') + ' Z';

            const dataPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            dataPath.setAttribute('d', path);
            dataPath.setAttribute('fill', 'rgba(25, 118, 210, 0.3)');
            dataPath.setAttribute('stroke', 'rgba(25, 118, 210, 1)');
            dataPath.setAttribute('stroke-width', '2');
            svg.appendChild(dataPath);

            // 各データポイントに円マーカーを描画
            dataPoints.forEach((point, index) => {
                const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                circle.setAttribute('cx', point[0]);
                circle.setAttribute('cy', point[1]);
                circle.setAttribute('r', 4);
                circle.setAttribute('fill', 'rgba(25, 118, 210, 1)');
                circle.setAttribute('stroke', '#fff');
                circle.setAttribute('stroke-width', '2');
                
                // ホバー効果のためのタイトル追加
                const title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
                title.textContent = `${this.categories[index]}: ${this.data[index] || 0}/5`;
                circle.appendChild(title);
                
                svg.appendChild(circle);
            });
        }
    }

    /**
     * 評価項目のラベルを描画
     * @param {SVGElement} svg - SVG要素
     */
    drawLabels(svg) {
        for (let i = 0; i < 5; i++) {
            const angle = (i * 2 * Math.PI / 5) - (Math.PI / 2);
            const labelRadius = this.maxRadius + 25;
            const x = this.center + labelRadius * Math.cos(angle);
            const y = this.center + labelRadius * Math.sin(angle);

            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', x);
            text.setAttribute('y', y);
            text.setAttribute('text-anchor', 'middle');
            text.setAttribute('dominant-baseline', 'middle');
            text.setAttribute('font-size', '12px');
            text.setAttribute('font-weight', 'bold');
            text.setAttribute('fill', '#1976d2');
            
            // 国際化対応のためのカテゴリ名取得
            const categoryName = this.getCategoryName ? this.getCategoryName(i) : this.categories[i];
            text.textContent = categoryName;
            svg.appendChild(text);
        }
    }

    /**
     * データを更新してチャートを再描画
     * @param {Array} newData - 新しい評価データ
     */
    updateData(newData) {
        this.data = newData;
        this.init();
    }

    /**
     * チャートのサイズを変更
     * @param {number} newSize - 新しいサイズ
     */
    resize(newSize) {
        this.size = newSize;
        this.center = this.size / 2;
        this.maxRadius = this.size * 0.35;
        this.init();
    }

    /**
     * チャートをPNG画像としてエクスポート
     * @returns {string} Data URL
     */
    exportAsPNG() {
        const svg = this.container.querySelector('svg');
        const svgData = new XMLSerializer().serializeToString(svg);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        
        canvas.width = this.size;
        canvas.height = this.size;
        
        return new Promise((resolve) => {
            img.onload = function() {
                ctx.drawImage(img, 0, 0);
                resolve(canvas.toDataURL());
            };
            img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
        });
    }

    /**
     * チャートの統計情報を取得
     * @returns {Object} 統計情報
     */
    getStatistics() {
        const validData = this.data.filter(value => value > 0);
        const sum = validData.reduce((acc, value) => acc + value, 0);
        const average = validData.length > 0 ? sum / validData.length : 0;
        const max = Math.max(...validData);
        const min = Math.min(...validData);
        
        return {
            average: Math.round(average * 100) / 100,
            max,
            min,
            total: sum,
            completedItems: validData.length,
            totalItems: this.data.length
        };
    }
}

// モジュールとしてエクスポート（ES6 modules対応）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PentagonChart;
}

// グローバルスコープにも追加（従来の使用法対応）
if (typeof window !== 'undefined') {
    window.PentagonChart = PentagonChart;
}
