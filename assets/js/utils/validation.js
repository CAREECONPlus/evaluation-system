/**
 * バリデーションユーティリティ
 * フォーム入力値の検証とエラーメッセージ生成
 */

/**
 * バリデーションルールクラス
 */
class ValidationRules {
    /**
     * 必須項目チェック
     */
    static required(value, fieldName = 'この項目') {
        if (value === null || value === undefined || value === '') {
            return `${fieldName}は必須項目です`;
        }
        return null;
    }

    /**
     * 最小文字数チェック
     */
    static minLength(value, minLength, fieldName = 'この項目') {
        if (value && value.length < minLength) {
            return `${fieldName}は${minLength}文字以上で入力してください`;
        }
        return null;
    }

    /**
     * 最大文字数チェック
     */
    static maxLength(value, maxLength, fieldName = 'この項目') {
        if (value && value.length > maxLength) {
            return `${fieldName}は${maxLength}文字以下で入力してください`;
        }
        return null;
    }

    /**
     * メールアドレス形式チェック
     */
    static email(value, fieldName = 'メールアドレス') {
        if (!value) return null;
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            return `${fieldName}の形式が正しくありません`;
        }
        return null;
    }

    /**
     * 数値チェック
     */
    static numeric(value, fieldName = 'この項目') {
        if (value === null || value === undefined || value === '') return null;
        
        if (isNaN(Number(value))) {
            return `${fieldName}は数値で入力してください`;
        }
        return null;
    }

    /**
     * 最小値チェック
     */
    static min(value, minValue, fieldName = 'この項目') {
        if (value === null || value === undefined || value === '') return null;
        
        if (Number(value) < minValue) {
            return `${fieldName}は${minValue}以上で入力してください`;
        }
        return null;
    }

    /**
     * 最大値チェック
     */
    static max(value, maxValue, fieldName = 'この項目') {
        if (value === null || value === undefined || value === '') return null;
        
        if (Number(value) > maxValue) {
            return `${fieldName}は${maxValue}以下で入力してください`;
        }
        return null;
    }

    /**
     * 範囲チェック
     */
    static range(value, minValue, maxValue, fieldName = 'この項目') {
        if (value === null || value === undefined || value === '') return null;
        
        const numValue = Number(value);
        if (numValue < minValue || numValue > maxValue) {
            return `${fieldName}は${minValue}から${maxValue}の範囲で入力してください`;
        }
        return null;
    }

    /**
     * 正規表現チェック
     */
    static pattern(value, regex, fieldName = 'この項目', errorMessage = null) {
        if (!value) return null;
        
        if (!regex.test(value)) {
            return errorMessage || `${fieldName}の形式が正しくありません`;
        }
        return null;
    }

    /**
     * 日付形式チェック（YYYY-MM-DD）
     */
    static date(value, fieldName = '日付') {
        if (!value) return null;
        
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(value)) {
            return `${fieldName}はYYYY-MM-DD形式で入力してください`;
        }
        
        const date = new Date(value);
        if (isNaN(date.getTime())) {
            return `${fieldName}が正しくありません`;
        }
        return null;
    }

    /**
     * 日付範囲チェック
     */
    static dateRange(startDate, endDate, fieldName = '日付範囲') {
        if (!startDate || !endDate) return null;
        
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        if (start >= end) {
            return `${fieldName}の終了日は開始日より後の日付を指定してください`;
        }
        return null;
    }

    /**
     * パスワード強度チェック
     */
    static password(value, fieldName = 'パスワード') {
        if (!value) return null;
        
        // 最低8文字以上
        if (value.length < 8) {
            return `${fieldName}は8文字以上で入力してください`;
        }
        
        // 英字、数字、特殊文字を含むかチェック
        const hasLetter = /[a-zA-Z]/.test(value);
        const hasNumber = /[0-9]/.test(value);
        const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value);
        
        if (!hasLetter || !hasNumber) {
            return `${fieldName}は英字と数字を含む必要があります`;
        }
        
        return null;
    }

    /**
     * 同一値チェック（パスワード確認など）
     */
    static same(value1, value2, fieldName = 'この項目') {
        if (value1 !== value2) {
            return `${fieldName}が一致しません`;
        }
        return null;
    }

    /**
     * URLチェック
     */
    static url(value, fieldName = 'URL') {
        if (!value) return null;
        
        try {
            new URL(value);
            return null;
        } catch {
            return `${fieldName}の形式が正しくありません`;
        }
    }

    /**
     * 日本語文字チェック（ひらがな、カタカナ、漢字）
     */
    static japanese(value, fieldName = 'この項目') {
        if (!value) return null;
        
        const japaneseRegex = /^[ひらがなカタカナ漢字ー\s]+$/u;
        if (!japaneseRegex.test(value)) {
            return `${fieldName}は日本語で入力してください`;
        }
        return null;
    }

    /**
     * 半角英数字チェック
     */
    static alphanumeric(value, fieldName = 'この項目') {
        if (!value) return null;
        
        const alphanumericRegex = /^[a-zA-Z0-9]+$/;
        if (!alphanumericRegex.test(value)) {
            return `${fieldName}は半角英数字で入力してください`;
        }
        return null;
    }

    /**
     * カンマ区切り数値チェック（ウェイトの合計など）
     */
    static weightTotal(weights, total = 100, fieldName = 'ウェイトの合計') {
        const sum = weights.reduce((acc, weight) => acc + (Number(weight) || 0), 0);
        
        if (sum !== total) {
            return `${fieldName}は${total}%になるように調整してください（現在：${sum}%）`;
        }
        return null;
    }
}

/**
 * バリデーター クラス
 */
class Validator {
    constructor() {
        this.errors = {};
        this.rules = {};
    }

    /**
     * ルールを追加
     */
    addRule(field, rules) {
        this.rules[field] = rules;
        return this;
    }

    /**
     * バリデーションを実行
     */
    validate(data) {
        this.errors = {};

        for (const [field, rules] of Object.entries(this.rules)) {
            this.validateField(field, data[field], rules);
        }

        return this.isValid();
    }

    /**
     * 単一フィールドのバリデーション
     */
    validateField(field, value, rules) {
        const fieldErrors = [];

        for (const rule of rules) {
            const error = this.executeRule(value, rule);
            if (error) {
                fieldErrors.push(error);
                // 必須チェックに失敗した場合は他のチェックをスキップ
                if (rule.name === 'required') {
                    break;
                }
            }
        }

        if (fieldErrors.length > 0) {
            this.errors[field] = fieldErrors;
        }
    }

    /**
     * ルールを実行
     */
    executeRule(value, rule) {
        const { name, params = [], message } = rule;
        const fieldName = rule.fieldName || 'この項目';

        // ValidationRules のメソッドを動的に呼び出し
        if (typeof ValidationRules[name] === 'function') {
            return ValidationRules[name](value, ...params, fieldName) || message;
        }

        return null;
    }

    /**
     * バリデーション結果が有効かチェック
     */
    isValid() {
        return Object.keys(this.errors).length === 0;
    }

    /**
     * エラーメッセージを取得
     */
    getErrors() {
        return this.errors;
    }

    /**
     * 特定フィールドのエラーメッセージを取得
     */
    getFieldErrors(field) {
        return this.errors[field] || [];
    }

    /**
     * 最初のエラーメッセージを取得
     */
    getFirstError() {
        for (const errors of Object.values(this.errors)) {
            if (errors.length > 0) {
                return errors[0];
            }
        }
        return null;
    }

    /**
     * 全エラーメッセージをフラットな配列で取得
     */
    getAllErrors() {
        const allErrors = [];
        for (const errors of Object.values(this.errors)) {
            allErrors.push(...errors);
        }
        return allErrors;
    }

    /**
     * エラーをクリア
     */
    clearErrors() {
        this.errors = {};
    }

    /**
     * 特定フィールドのエラーをクリア
     */
    clearFieldErrors(field) {
        delete this.errors[field];
    }
}

/**
 * フォームバリデーター クラス
 */
class FormValidator {
    constructor(formElement) {
        this.form = formElement;
        this.validator = new Validator();
        this.errorElements = new Map();
        this.isRealtime = false;
    }

    /**
     * リアルタイムバリデーションを有効化
     */
    enableRealtimeValidation() {
        this.isRealtime = true;
        this.setupRealtimeListeners();
        return this;
    }

    /**
     * リアルタイムバリデーションのリスナーを設定
     */
    setupRealtimeListeners() {
        const inputs = this.form.querySelectorAll('input, textarea, select');
        
        inputs.forEach(input => {
            input.addEventListener('blur', () => {
                this.validateSingleField(input.name || input.id);
            });
            
            input.addEventListener('input', () => {
                if (this.validator.getFieldErrors(input.name || input.id).length > 0) {
                    this.validateSingleField(input.name || input.id);
                }
            });
        });
    }

    /**
     * 単一フィールドのバリデーション
     */
    validateSingleField(fieldName) {
        const formData = new FormData(this.form);
        const data = {};
        for (const [key, value] of formData.entries()) {
            data[key] = value;
        }

        // 該当フィールドのルールのみ実行
        const fieldRules = this.validator.rules[fieldName];
        if (fieldRules) {
            this.validator.clearFieldErrors(fieldName);
            this.validator.validateField(fieldName, data[fieldName], fieldRules);
            this.displayFieldErrors(fieldName);
        }
    }

    /**
     * フォーム全体のバリデーション
     */
    validate() {
        const formData = new FormData(this.form);
        const data = {};
        for (const [key, value] of formData.entries()) {
            data[key] = value;
        }

        const isValid = this.validator.validate(data);
        this.displayErrors();
        
        return {
            isValid,
            errors: this.validator.getErrors(),
            data
        };
    }

    /**
     * ルールを追加
     */
    addRule(field, rules) {
        this.validator.addRule(field, rules);
        return this;
    }

    /**
     * エラーメッセージを表示
     */
    displayErrors() {
        // 既存のエラーメッセージをクリア
        this.clearErrorMessages();

        for (const [field, errors] of Object.entries(this.validator.getErrors())) {
            this.displayFieldErrors(field);
        }
    }

    /**
     * 特定フィールドのエラーメッセージを表示
     */
    displayFieldErrors(fieldName) {
        const errors = this.validator.getFieldErrors(fieldName);
        const field = this.form.querySelector(`[name="${fieldName}"], #${fieldName}`);
        
        if (!field) return;

        // 既存のエラーメッセージを削除
        this.clearFieldErrorMessage(fieldName);

        if (errors.length > 0) {
            // エラークラスを追加
            field.classList.add('is-invalid');
            
            // エラーメッセージ要素を作成
            const errorElement = document.createElement('div');
            errorElement.className = 'invalid-feedback';
            errorElement.textContent = errors[0]; // 最初のエラーメッセージのみ表示
            
            // フィールドの後に挿入
            field.parentNode.insertBefore(errorElement, field.nextSibling);
            this.errorElements.set(fieldName, errorElement);
        } else {
            // エラークラスを削除
            field.classList.remove('is-invalid');
        }
    }

    /**
     * エラーメッセージをクリア
     */
    clearErrorMessages() {
        for (const [fieldName, errorElement] of this.errorElements) {
            this.clearFieldErrorMessage(fieldName);
        }
    }

    /**
     * 特定フィールドのエラーメッセージをクリア
     */
    clearFieldErrorMessage(fieldName) {
        const field = this.form.querySelector(`[name="${fieldName}"], #${fieldName}`);
        const errorElement = this.errorElements.get(fieldName);
        
        if (field) {
            field.classList.remove('is-invalid');
        }
        
        if (errorElement) {
            errorElement.remove();
            this.errorElements.delete(fieldName);
        }
    }
}

/**
 * 評価システム専用バリデーション
 */
class EvaluationValidator {
    /**
     * 定量評価のバリデーション
     */
    static validateQuantitativeEvaluation(evaluationData) {
        const errors = [];
        
        if (!evaluationData.quantitative || Object.keys(evaluationData.quantitative).length === 0) {
            errors.push('定量評価項目が入力されていません');
        }
        
        // 各カテゴリの評価値をチェック
        for (const [itemId, itemData] of Object.entries(evaluationData.quantitative)) {
            if (itemData.selfRating === undefined || itemData.selfRating === null) {
                errors.push(`定量評価項目「${itemId}」の自己評価が入力されていません`);
            }
            
            if (itemData.selfRating < 0 || itemData.selfRating > 5) {
                errors.push(`定量評価項目「${itemId}」の評価値は0-5の範囲で入力してください`);
            }
        }
        
        return errors;
    }

    /**
     * 定性評価のバリデーション
     */
    static validateQualitativeEvaluation(evaluationData) {
        const errors = [];
        
        if (!evaluationData.qualitative || evaluationData.qualitative.length === 0) {
            errors.push('定性評価項目が入力されていません');
        }
        
        let totalWeight = 0;
        evaluationData.qualitative.forEach((item, index) => {
            const itemNumber = index + 1;
            
            // 内容の必須チェック
            if (!item.content || item.content.trim() === '') {
                errors.push(`定性評価項目${itemNumber}の内容が入力されていません`);
            }
            
            // ウェイトの必須チェック
            if (item.weight === undefined || item.weight === null || item.weight === '') {
                errors.push(`定性評価項目${itemNumber}のウェイトが入力されていません`);
            } else {
                const weight = Number(item.weight);
                if (weight < 0 || weight > 100) {
                    errors.push(`定性評価項目${itemNumber}のウェイトは0-100の範囲で入力してください`);
                }
                totalWeight += weight;
            }
            
            // 評価値のチェック
            if (item.selfRating < 1 || item.selfRating > 5) {
                errors.push(`定性評価項目${itemNumber}の自己評価は1-5の範囲で入力してください`);
            }
        });
        
        // ウェイト合計のチェック
        if (Math.abs(totalWeight - 100) > 0.01) {
            errors.push(`定性評価のウェイト合計は100%にしてください（現在：${totalWeight}%）`);
        }
        
        return errors;
    }

    /**
     * 評価全体のバリデーション
     */
    static validateEvaluation(evaluationData) {
        const errors = [];
        
        // 定量評価のバリデーション
        errors.push(...this.validateQuantitativeEvaluation(evaluationData));
        
        // 定性評価のバリデーション
        errors.push(...this.validateQualitativeEvaluation(evaluationData));
        
        // 全体的なバリデーション
        if (!evaluationData.userId) {
            errors.push('評価対象者が指定されていません');
        }
        
        if (!evaluationData.periodId) {
            errors.push('評価期間が指定されていません');
        }
        
        return errors;
    }
}

/**
 * ユーザー管理専用バリデーション
 */
class UserValidator {
    /**
     * ユーザーデータのバリデーション
     */
    static validateUser(userData, existingUsers = []) {
        const validator = new Validator();
        
        validator
            .addRule('full_name', [
                { name: 'required', fieldName: '氏名' },
                { name: 'maxLength', params: [100], fieldName: '氏名' }
            ])
            .addRule('email', [
                { name: 'required', fieldName: 'メールアドレス' },
                { name: 'email', fieldName: 'メールアドレス' },
                { name: 'maxLength', params: [255], fieldName: 'メールアドレス' }
            ])
            .addRule('role', [
                { name: 'required', fieldName: '役割' }
            ]);
        
        const isValid = validator.validate(userData);
        const errors = validator.getAllErrors();
        
        // 重複チェック
        const duplicateUser = existingUsers.find(user => 
            user.email === userData.email && user.id !== userData.id
        );
        if (duplicateUser) {
            errors.push('このメールアドレスは既に使用されています');
        }
        
        // 従業員の評価者チェック
        if (userData.role === 'employee' && !userData.evaluator_id) {
            errors.push('従業員には評価者の設定が必要です');
        }
        
        return {
            isValid: errors.length === 0,
            errors
        };
    }
}

// ========================================
// ヘルパー関数
// ========================================

/**
 * バリデーションルールビルダー
 */
function createValidationRule(name, params = [], fieldName = null, message = null) {
    return { name, params, fieldName, message };
}

/**
 * 複数ルールのビルダー
 */
function buildRules(fieldName) {
    const rules = [];
    
    return {
        required(message = null) {
            rules.push(createValidationRule('required', [], fieldName, message));
            return this;
        },
        
        minLength(length, message = null) {
            rules.push(createValidationRule('minLength', [length], fieldName, message));
            return this;
        },
        
        maxLength(length, message = null) {
            rules.push(createValidationRule('maxLength', [length], fieldName, message));
            return this;
        },
        
        email(message = null) {
            rules.push(createValidationRule('email', [], fieldName, message));
            return this;
        },
        
        numeric(message = null) {
            rules.push(createValidationRule('numeric', [], fieldName, message));
            return this;
        },
        
        min(value, message = null) {
            rules.push(createValidationRule('min', [value], fieldName, message));
            return this;
        },
        
        max(value, message = null) {
            rules.push(createValidationRule('max', [value], fieldName, message));
            return this;
        },
        
        range(min, max, message = null) {
            rules.push(createValidationRule('range', [min, max], fieldName, message));
            return this;
        },
        
        pattern(regex, message = null) {
            rules.push(createValidationRule('pattern', [regex], fieldName, message));
            return this;
        },
        
        date(message = null) {
            rules.push(createValidationRule('date', [], fieldName, message));
            return this;
        },
        
        build() {
            return rules;
        }
    };
}

// グローバルに公開
window.ValidationRules = ValidationRules;
window.Validator = Validator;
window.FormValidator = FormValidator;
window.EvaluationValidator = EvaluationValidator;
window.UserValidator = UserValidator;
window.createValidationRule = createValidationRule;
window.buildRules = buildRules;

console.log('Validation utilities が読み込まれました');
