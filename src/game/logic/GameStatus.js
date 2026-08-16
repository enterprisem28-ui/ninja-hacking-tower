export class GameStatus {
    constructor() {
        // プレイヤーのステータス
        this.hp = 10;
        this.battery = 10;

        // 敵のステータスと階層
        this.floor = 1;
        this.enemyMaxHp = 30; // 敵の最大HP
        this.enemyHp = this.enemyMaxHp; // 現在の敵のHP
    }

    // スピン時のバッテリー消費（足りなければ回せない）
    consumeBattery() {
        if (this.battery <= 0) return false;
        this.battery -= 5;
        if (this.battery < 0) this.battery = 0;
        return true;
    }

    // 役が揃った時の効果適用
    applyWin(type) {
        if (type === 0) return "強力な攻撃を繰り出した！";
        if (type === 1) return "防御の構えをとった！";
        
        // ベル(2)でバッテリー回復
        if (type === 2) {
            this.battery += 20;
            if (this.battery > 100) this.battery = 100;
            return "バッテリーを回復した！";
        }
        
        // チェリー(3)でHP回復
        if (type === 3) {
            this.hp += 20;
            if (this.hp > 100) this.hp = 100;
            return "HPを回復した！";
        }
        
        return "アクション成功！";
    }

    // 敵へのダメージ処理
    damageEnemy(amount) {
        this.enemyHp -= amount;
        if (this.enemyHp < 0) this.enemyHp = 0;
        return this.enemyHp;
    }

    // 次の階層へ進む処理（敵がタフになる）
    nextFloor() {
        this.floor++;
        this.enemyMaxHp += 10; 
        this.enemyHp = this.enemyMaxHp;
    }

    // UIに表示するテキストの生成
    getStatusText() {
        return `HP: ${this.hp} | BATT: ${this.battery} | 地下${this.floor}階 (敵HP: ${this.enemyHp}/${this.enemyMaxHp})`;
    }
}