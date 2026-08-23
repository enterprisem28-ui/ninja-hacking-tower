export class GameStatus {
    constructor() {
        // プレイヤーのステータス（バッテリーを廃止し、HPのみに統一）
        this.hp = 100;

        // 敵のステータスと階層
        this.floor = 1;
        this.enemyMaxHp = 30;
        this.enemyHp = this.enemyMaxHp;
    }

    // 役が揃った時の効果適用
    applyWin(type) {
        if (type === 0) return "強力な攻撃を繰り出した！";
        if (type === 1) return "防御の構えをとった！";
        
        // ベル(2)の効果を「HPの小回復」に変更
        if (type === 2) {
            this.hp += 10;
            if (this.hp > 100) this.hp = 100;
            return "HPを少し回復した！";
        }
        
        // チェリー(3)は「HPの大回復」
        if (type === 3) {
            this.hp += 20;
            if (this.hp > 100) this.hp = 100;
            return "HPを大きく回復した！";
        }
        
        return "アクション成功！";
    }

    // 敵へのダメージ処理
    damageEnemy(amount) {
        this.enemyHp -= amount;
        if (this.enemyHp < 0) this.enemyHp = 0;
        return this.enemyHp;
    }

    // 次の階層へ進む処理
    nextFloor() {
        this.floor++;
        this.enemyMaxHp += 10; 
        this.enemyHp = this.enemyMaxHp;
    }

    // UIに表示するテキストの生成（BATTの表示を削除）
    getStatusText() {
        return `HP: ${this.hp} | 地下${this.floor}階 (敵HP: ${this.enemyHp}/${this.enemyMaxHp})`;
    }
}