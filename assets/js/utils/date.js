/**
 * 日付操作ユーティリティ
 * 日付のフォーマット、計算、バリデーション機能
 */

/**
 * 日付操作クラス
 */
class DateUtils {
    /**
     * 日付をフォーマット
     * @param {Date|string} date - フォーマットする日付
     * @param {string} format - フォーマット文字列
     * @returns {string} - フォーマットされた日付文字列
     */
    static format(date, format = 'YYYY/MM/DD') {
        if (!date) return '';
        
        const d = new Date(date);
        if (isNaN(d.getTime())) return '';
        
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');
        const seconds = String(d.getSeconds()).padStart(2, '0');
        
        return format
            .replace('YYYY', year)
            .replace('MM', month)
            .replace('DD', day)
            .replace('HH', hours)
            .replace('mm', minutes)
            .replace('ss', seconds);
    }

    /**
     * 日本の標準的な形式で日付をフォーマット
     * @param {Date|string} date - フォーマットする日付
     * @param {boolean} includeTime - 時刻を含めるかどうか
     * @returns {string} - フォーマットされた日付文字列
     */
    static formatJapanese(date, includeTime = false) {
        if (!date) return '';
        
        const d = new Date(date);
        if (isNaN(d.getTime())) return '';
        
        const options = {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        };
        
        if (includeTime) {
            options.hour = '2-digit';
            options.minute = '2-digit';
        }
        
        return d.toLocaleDateString('ja-JP', options);
    }

    /**
     * 相対的な時間表示（〜前）
     * @param {Date|string} date - 基準日付
     * @returns {string} - 相対時間文字列
     */
    static timeAgo(date) {
        if (!date) return '';
        
        const d = new Date(date);
        if (isNaN(d.getTime())) return '';
        
        const now = new Date();
        const diffMs = now.getTime() - d.getTime();
        const diffMinutes = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const diffWeeks = Math.floor(diffDays / 7);
        const diffMonths = Math.floor(diffDays / 30);
        const diffYears = Math.floor(diffDays / 365);
        
        if (diffMinutes < 1) {
            return 'たった今';
        } else if (diffMinutes < 60) {
            return `${diffMinutes}分前`;
        } else if (diffHours < 24) {
            return `${diffHours}時間前`;
        } else if (diffDays < 7) {
            return `${diffDays}日前`;
        } else if (diffWeeks < 4) {
            return `${diffWeeks}週間前`;
        } else if (diffMonths < 12) {
            return `${diffMonths}ヶ月前`;
        } else {
            return `${diffYears}年前`;
        }
    }

    /**
     * 曜日を日本語で取得
     * @param {Date|string} date - 日付
     * @returns {string} - 曜日（漢字）
     */
    static getWeekdayJapanese(date) {
        if (!date) return '';
        
        const d = new Date(date);
        if (isNaN(d.getTime())) return '';
        
        const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
        return weekdays[d.getDay()];
    }

    /**
     * 月の名前を日本語で取得
     * @param {number} month - 月（0-11）
     * @returns {string} - 月名
     */
    static getMonthNameJapanese(month) {
        const months = [
            '1月', '2月', '3月', '4月', '5月', '6月',
            '7月', '8月', '9月', '10月', '11月', '12月'
        ];
        return months[month] || '';
    }

    /**
     * 日付の加算
     * @param {Date|string} date - 基準日付
     * @param {number} days - 追加する日数
     * @returns {Date} - 新しい日付
     */
    static addDays(date, days) {
        const d = new Date(date);
        d.setDate(d.getDate() + days);
        return d;
    }

    /**
     * 月の加算
     * @param {Date|string} date - 基準日付
     * @param {number} months - 追加する月数
     * @returns {Date} - 新しい日付
     */
    static addMonths(date, months) {
        const d = new Date(date);
        d.setMonth(d.getMonth() + months);
        return d;
    }

    /**
     * 年の加算
     * @param {Date|string} date - 基準日付
     * @param {number} years - 追加する年数
     * @returns {Date} - 新しい日付
     */
    static addYears(date, years) {
        const d = new Date(date);
        d.setFullYear(d.getFullYear() + years);
        return d;
    }

    /**
     * 日付の差分を日数で取得
     * @param {Date|string} date1 - 日付1
     * @param {Date|string} date2 - 日付2
     * @returns {number} - 差分日数
     */
    static diffInDays(date1, date2) {
        const d1 = new Date(date1);
        const d2 = new Date(date2);
        const diffTime = Math.abs(d2.getTime() - d1.getTime());
        return Math.floor(diffTime / (1000 * 60 * 60 * 24));
    }

    /**
     * 今日かどうか判定
     * @param {Date|string} date - 判定する日付
     * @returns {boolean} - 今日の場合true
     */
    static isToday(date) {
        const d = new Date(date);
        const today = new Date();
        return d.toDateString() === today.toDateString();
    }

    /**
     * 今週かどうか判定
     * @param {Date|string} date - 判定する日付
     * @returns {boolean} - 今週の場合true
     */
    static isThisWeek(date) {
        const d = new Date(date);
        const today = new Date();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        startOfWeek.setHours(0, 0, 0, 0);
        
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);
        
        return d >= startOfWeek && d <= endOfWeek;
    }

    /**
     * 今月かどうか判定
     * @param {Date|string} date - 判定する日付
     * @returns {boolean} - 今月の場合true
     */
    static isThisMonth(date) {
        const d = new Date(date);
        const today = new Date();
        return d.getFullYear() === today.getFullYear() && 
               d.getMonth() === today.getMonth();
    }

    /**
     * 今年かどうか判定
     * @param {Date|string} date - 判定する日付
     * @returns {boolean} - 今年の場合true
     */
    static isThisYear(date) {
        const d = new Date(date);
        const today = new Date();
        return d.getFullYear() === today.getFullYear();
    }

    /**
     * 過去の日付かどうか判定
     * @param {Date|string} date - 判定する日付
     * @returns {boolean} - 過去の場合true
     */
    static isPast(date) {
        const d = new Date(date);
        const now = new Date();
        return d < now;
    }

    /**
     * 未来の日付かどうか判定
     * @param {Date|string} date - 判定する日付
     * @returns {boolean} - 未来の場合true
     */
    static isFuture(date) {
        const d = new Date(date);
        const now = new Date();
        return d > now;
    }

    /**
     * 月の最初の日を取得
     * @param {Date|string} date - 基準日付
     * @returns {Date} - 月の最初の日
     */
    static startOfMonth(date) {
        const d = new Date(date);
        return new Date(d.getFullYear(), d.getMonth(), 1);
    }

    /**
     * 月の最後の日を取得
     * @param {Date|string} date - 基準日付
     * @returns {Date} - 月の最後の日
     */
    static endOfMonth(date) {
        const d = new Date(date);
        return new Date(d.getFullYear(), d.getMonth() + 1, 0);
    }

    /**
     * 年の最初の日を取得
     * @param {Date|string} date - 基準日付
     * @returns {Date} - 年の最初の日
     */
    static startOfYear(date) {
        const d = new Date(date);
        return new Date(d.getFullYear(), 0, 1);
    }

    /**
     * 年の最後の日を取得
     * @param {Date|string} date - 基準日付
     * @returns {Date} - 年の最後の日
     */
    static endOfYear(date) {
        const d = new Date(date);
        return new Date(d.getFullYear(), 11, 31);
    }

    /**
     * 週の最初の日を取得（月曜日始まり）
     * @param {Date|string} date - 基準日付
     * @returns {Date} - 週の最初の日
     */
    static startOfWeek(date) {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1); // 月曜日始まり
        return new Date(d.setDate(diff));
    }

    /**
     * 週の最後の日を取得（日曜日終わり）
     * @param {Date|string} date - 基準日付
     * @returns {Date} - 週の最後の日
     */
    static endOfWeek(date) {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() + (7 - day) % 7;
        return new Date(d.setDate(diff));
    }

    /**
     * ISO週番号を取得
     * @param {Date|string} date - 日付
     * @returns {number} - 週番号
     */
    static getWeekNumber(date) {
        const d = new Date(date);
        d.setHours(0, 0, 0, 0);
        d.setDate(d.getDate() + 3 - (d.getDay() + 6) % 7);
        const week1 = new Date(d.getFullYear(), 0, 4);
        return 1 + Math.round(((d.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
    }

    /**
     * 営業日かどうか判定（土日祝日は除く）
     * @param {Date|string} date - 判定する日付
     * @param {Array} holidays - 祝日の配列（オプション）
     * @returns {boolean} - 営業日の場合true
     */
    static isBusinessDay(date, holidays = []) {
        const d = new Date(date);
        const day = d.getDay();
        
        // 土日は営業日ではない
        if (day === 0 || day === 6) {
            return false;
        }
        
        // 祝日チェック
        const dateString = this.format(d, 'YYYY-MM-DD');
        return !holidays.includes(dateString);
    }

    /**
     * 次の営業日を取得
     * @param {Date|string} date - 基準日付
     * @param {Array} holidays - 祝日の配列（オプション）
     * @returns {Date} - 次の営業日
     */
    static nextBusinessDay(date, holidays = []) {
        let d = new Date(date);
        d.setDate(d.getDate() + 1);
        
        while (!this.isBusinessDay(d, holidays)) {
            d.setDate(d.getDate() + 1);
        }
        
        return d;
    }

    /**
     * 前の営業日を取得
     * @param {Date|string} date - 基準日付
     * @param {Array} holidays - 祝日の配列（オプション）
     * @returns {Date} - 前の営業日
     */
    static previousBusinessDay(date, holidays = []) {
        let d = new Date(date);
        d.setDate(d.getDate() - 1);
        
        while (!this.isBusinessDay(d, holidays)) {
            d.setDate(d.getDate() - 1);
        }
        
        return d;
    }

    /**
     * 期間内の営業日数を計算
     * @param {Date|string} startDate - 開始日
     * @param {Date|string} endDate - 終了日
     * @param {Array} holidays - 祝日の配列（オプション）
     * @returns {number} - 営業日数
     */
    static countBusinessDays(startDate, endDate, holidays = []) {
        let count = 0;
        let current = new Date(startDate);
        const end = new Date(endDate);
        
        while (current <= end) {
            if (this.isBusinessDay(current, holidays)) {
                count++;
            }
            current.setDate(current.getDate() + 1);
        }
        
        return count;
    }

    /**
     * 日付の範囲を生成
     * @param {Date|string} startDate - 開始日
     * @param {Date|string} endDate - 終了日
     * @returns {Array<Date>} - 日付の配列
     */
    static dateRange(startDate, endDate) {
        const dates = [];
        let current = new Date(startDate);
        const end = new Date(endDate);
        
        while (current <= end) {
            dates.push(new Date(current));
            current.setDate(current.getDate() + 1);
        }
        
        return dates;
    }

    /**
     * 月のカレンダーデータを生成
     * @param {Date|string} date - 基準日付
     * @returns {Object} - カレンダーデータ
     */
    static generateCalendar(date) {
        const d = new Date(date);
        const year = d.getFullYear();
        const month = d.getMonth();
        
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const firstWeekday = firstDay.getDay();
        const daysInMonth = lastDay.getDate();
        
        // カレンダーの開始日（前月の日付を含む）
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstWeekday);
        
        // カレンダーの終了日（次月の日付を含む）
        const endDate = new Date(lastDay);
        const lastWeekday = lastDay.getDay();
        endDate.setDate(endDate.getDate() + (6 - lastWeekday));
        
        const weeks = [];
        let currentWeek = [];
        let current = new Date(startDate);
        
        while (current <= endDate) {
            currentWeek.push({
                date: new Date(current),
                isCurrentMonth: current.getMonth() === month,
                isToday: this.isToday(current)
            });
            
            if (currentWeek.length === 7) {
                weeks.push(currentWeek);
                currentWeek = [];
            }
            
            current.setDate(current.getDate() + 1);
        }
        
        return {
            year,
            month,
            monthName: this.getMonthNameJapanese(month),
            daysInMonth,
            weeks
        };
    }

    /**
     * 日付の妥当性を検証
     * @param {string} dateString - 日付文字列
     * @param {string} format - 期待するフォーマット
     * @returns {boolean} - 有効な日付の場合true
     */
    static isValid(dateString, format = 'YYYY-MM-DD') {
        if (!dateString) return false;
        
        // 基本的なフォーマットチェック
        if (format === 'YYYY-MM-DD') {
            const regex = /^\d{4}-\d{2}-\d{2}$/;
            if (!regex.test(dateString)) return false;
        }
        
        const date = new Date(dateString);
        return !isNaN(date.getTime());
    }

    /**
     * タイムゾーンを考慮した現在時刻を取得
     * @param {string} timezone - タイムゾーン（例: 'Asia/Tokyo'）
     * @returns {Date} - タイムゾーン調整済みの日付
     */
    static now(timezone = 'Asia/Tokyo') {
        return new Date(new Date().toLocaleString('en-US', { timeZone: timezone }));
    }

    /**
     * Unix タイムスタンプから日付を作成
     * @param {number} timestamp - Unix タイムスタンプ（秒）
     * @returns {Date} - 日付オブジェクト
     */
    static fromTimestamp(timestamp) {
        return new Date(timestamp * 1000);
    }

    /**
     * 日付をUnix タイムスタンプに変換
     * @param {Date|string} date - 日付
     * @returns {number} - Unix タイムスタンプ（秒）
     */
    static toTimestamp(date) {
        return Math.floor(new Date(date).getTime() / 1000);
    }

    /**
     * ISO 8601 形式の文字列から日付を作成
     * @param {string} isoString - ISO 8601形式の文字列
     * @returns {Date} - 日付オブジェクト
     */
    static fromISO(isoString) {
        return new Date(isoString);
    }

    /**
     * 日付をISO 8601 形式の文字列に変換
     * @param {Date|string} date - 日付
     * @returns {string} - ISO 8601形式の文字列
     */
    static toISO(date) {
        return new Date(date).toISOString();
    }
}

/**
 * 年齢計算クラス
 */
class AgeCalculator {
    /**
     * 年齢を計算（満年齢）
     * @param {Date|string} birthDate - 生年月日
     * @param {Date|string} referenceDate - 基準日（デフォルトは現在）
     * @returns {number} - 年齢
     */
    static calculate(birthDate, referenceDate = new Date()) {
        const birth = new Date(birthDate);
        const reference = new Date(referenceDate);
        
        let age = reference.getFullYear() - birth.getFullYear();
        
        // 誕生日がまだ来ていない場合は1を引く
        if (
            reference.getMonth() < birth.getMonth() ||
            (reference.getMonth() === birth.getMonth() && reference.getDate() < birth.getDate())
        ) {
            age--;
        }
        
        return age;
    }

    /**
     * 次の誕生日まで日数を計算
     * @param {Date|string} birthDate - 生年月日
     * @param {Date|string} referenceDate - 基準日（デフォルトは現在）
     * @returns {number} - 次の誕生日までの日数
     */
    static daysUntilNextBirthday(birthDate, referenceDate = new Date()) {
        const birth = new Date(birthDate);
        const reference = new Date(referenceDate);
        
        // 今年の誕生日
        const thisBirthday = new Date(reference.getFullYear(), birth.getMonth(), birth.getDate());
        
        // 今年の誕生日が過ぎている場合は来年の誕生日
        const nextBirthday = thisBirthday >= reference ? 
            thisBirthday : 
            new Date(reference.getFullYear() + 1, birth.getMonth(), birth.getDate());
        
        return DateUtils.diffInDays(reference, nextBirthday);
    }
}

/**
 * 期間クラス
 */
class Period {
    constructor(startDate, endDate) {
        this.startDate = new Date(startDate);
        this.endDate = new Date(endDate);
    }

    /**
     * 期間の長さを日数で取得
     * @returns {number} - 日数
     */
    getDurationInDays() {
        return DateUtils.diffInDays(this.startDate, this.endDate);
    }

    /**
     * 指定日が期間内かチェック
     * @param {Date|string} date - チェックする日付
     * @returns {boolean} - 期間内の場合true
     */
    contains(date) {
        const d = new Date(date);
        return d >= this.startDate && d <= this.endDate;
    }

    /**
     * 期間と重複するかチェック
     * @param {Period} other - 他の期間
     * @returns {boolean} - 重複する場合true
     */
    overlaps(other) {
        return this.startDate <= other.endDate && this.endDate >= other.startDate;
    }

    /**
     * 期間の交集合を取得
     * @param {Period} other - 他の期間
     * @returns {Period|null} - 交集合の期間（なければnull）
     */
    intersection(other) {
        if (!this.overlaps(other)) return null;
        
        const start = this.startDate > other.startDate ? this.startDate : other.startDate;
        const end = this.endDate < other.endDate ? this.endDate : other.endDate;
        
        return new Period(start, end);
    }

    /**
     * 期間を文字列で表現
     * @param {string} format - フォーマット
     * @returns {string} - 期間の文字列表現
     */
    toString(format = 'YYYY/MM/DD') {
        return `${DateUtils.format(this.startDate, format)} ～ ${DateUtils.format(this.endDate, format)}`;
    }
}

/**
 * 評価期間用のヘルパー関数
 */
class EvaluationPeriodUtils {
    /**
     * 評価期間の生成（四半期）
     * @param {number} year - 年
     * @returns {Array<Object>} - 四半期の評価期間
     */
    static generateQuarterly(year) {
        return [
            {
                name: `${year}年Q1`,
                startDate: `${year}-01-01`,
                endDate: `${year}-03-31`
            },
            {
                name: `${year}年Q2`,
                startDate: `${year}-04-01`,
                endDate: `${year}-06-30`
            },
            {
                name: `${year}年Q3`,
                startDate: `${year}-07-01`,
                endDate: `${year}-09-30`
            },
            {
                name: `${year}年Q4`,
                startDate: `${year}-10-01`,
                endDate: `${year}-12-31`
            }
        ];
    }

    /**
     * 評価期間の生成（半期）
     * @param {number} year - 年
     * @returns {Array<Object>} - 半期の評価期間
     */
    static generateSemiannual(year) {
        return [
            {
                name: `${year}年上期`,
                startDate: `${year}-04-01`,
                endDate: `${year}-09-30`
            },
            {
                name: `${year}年下期`,
                startDate: `${year}-10-01`,
                endDate: `${year + 1}-03-31`
            }
        ];
    }

    /**
     * 評価期間の生成（月次）
     * @param {number} year - 年
     * @returns {Array<Object>} - 月次の評価期間
     */
    static generateMonthly(year) {
        const periods = [];
        for (let month = 1; month <= 12; month++) {
            const startDate = new Date(year, month - 1, 1);
            const endDate = DateUtils.endOfMonth(startDate);
            
            periods.push({
                name: `${year}年${month}月`,
                startDate: DateUtils.format(startDate, 'YYYY-MM-DD'),
                endDate: DateUtils.format(endDate, 'YYYY-MM-DD')
            });
        }
        return periods;
    }

    /**
     * 現在の評価期間を取得
     * @param {Array<Object>} periods - 評価期間の配列
     * @returns {Object|null} - 現在の評価期間
     */
    static getCurrentPeriod(periods) {
        const now = new Date();
        return periods.find(period => {
            const p = new Period(period.startDate, period.endDate);
            return p.contains(now);
        }) || null;
    }

    /**
     * 期限までの日数を計算
     * @param {string} deadline - 期限日
     * @returns {number} - 期限までの日数（過ぎている場合は負の値）
     */
    static daysUntilDeadline(deadline) {
        const now = new Date();
        const deadlineDate = new Date(deadline);
        return Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    }

    /**
     * 期限の状態を取得
     * @param {string} deadline - 期限日
     * @returns {Object} - 期限の状態情報
     */
    static getDeadlineStatus(deadline) {
        const days = this.daysUntilDeadline(deadline);
        
        if (days < 0) {
            return {
                status: 'overdue',
                message: `${Math.abs(days)}日超過`,
                className: 'text-danger'
            };
        } else if (days === 0) {
            return {
                status: 'today',
                message: '今日が期限',
                className: 'text-warning'
            };
        } else if (days <= 3) {
            return {
                status: 'urgent',
                message: `あと${days}日`,
                className: 'text-warning'
            };
        } else if (days <= 7) {
            return {
                status: 'soon',
                message: `あと${days}日`,
                className: 'text-info'
            };
        } else {
            return {
                status: 'normal',
                message: `あと${days}日`,
                className: 'text-muted'
            };
        }
    }
}

// 日本の祝日（基本的なもの）
const JapaneseHolidays = {
    // 固定祝日
    fixed: {
        '01-01': '元日',
        '02-11': '建国記念の日',
        '04-29': '昭和の日',
        '05-03': '憲法記念日',
        '05-04': 'みどりの日',
        '05-05': 'こどもの日',
        '08-11': '山の日',
        '11-03': '文化の日',
        '11-23': '勤労感謝の日',
        '12-23': '天皇誕生日'
    },

    /**
     * 指定年の祝日を取得
     * @param {number} year - 年
     * @returns {Array<string>} - 祝日の配列（YYYY-MM-DD形式）
     */
    getHolidays(year) {
        const holidays = [];
        
        // 固定祝日
        for (const [date, name] of Object.entries(this.fixed)) {
            holidays.push(`${year}-${date}`);
        }
        
        // 成人の日（1月第2月曜日）
        holidays.push(this.getNthMonday(year, 1, 2));
        
        // 海の日（7月第3月曜日）
        holidays.push(this.getNthMonday(year, 7, 3));
        
        // 敬老の日（9月第3月曜日）
        holidays.push(this.getNthMonday(year, 9, 3));
        
        // 体育の日（10月第2月曜日）
        holidays.push(this.getNthMonday(year, 10, 2));
        
        // 春分の日（概算）
        const springEquinox = Math.floor(20.8431 + 0.242194 * (year - 1851) - Math.floor((year - 1851) / 4));
        holidays.push(`${year}-03-${String(springEquinox).padStart(2, '0')}`);
        
        // 秋分の日（概算）
        const autumnEquinox = Math.floor(23.2488 + 0.242194 * (year - 1851) - Math.floor((year - 1851) / 4));
        holidays.push(`${year}-09-${String(autumnEquinox).padStart(2, '0')}`);
        
        return holidays.sort();
    },

    /**
     * 指定月の第N月曜日を取得
     */
    getNthMonday(year, month, n) {
        const firstDay = new Date(year, month - 1, 1);
        const firstMonday = new Date(firstDay);
        firstMonday.setDate(1 + (8 - firstDay.getDay()) % 7);
        firstMonday.setDate(firstMonday.getDate() + (n - 1) * 7);
        return DateUtils.format(firstMonday, 'YYYY-MM-DD');
    }
};

// グローバルに公開
window.DateUtils = DateUtils;
window.AgeCalculator = AgeCalculator;
window.Period = Period;
window.EvaluationPeriodUtils = EvaluationPeriodUtils;
window.JapaneseHolidays = JapaneseHolidays;

console.log('Date utilities が読み込まれました');
