export class GameStatus {
    constructor() {
        this.hp = 100;
        this.battery = 20;
        this.floor = 1;
        this.enemyHp = 100; // ★追加：敵のHP
    }

    consumeBattery() {
        if (this.battery > 0) {
            this.battery--;
            return true;
        }
        return false;
    }

    // ★変更：役に応じたアクションを実行し、画面に表示するテキストを返す
    applyWin(type) {
        let resultText = "";
        
        if (type === 0) { // 赤7：攻撃
            this.enemyHp -= 50;
            resultText = "【赤7】強烈な斬撃！敵に50のダメージ！";
        } else if (type === 1) { // BAR：特殊（ステルス）
            resultText = "【BAR】ステルス迷彩起動！敵の目を欺いた！";
        } else if (type === 2) { // ベル（黄）：補助（バッテリー回復）
            this.battery += 10;
            resultText = "【ベル】エネルギー吸収！バッテリーが10回復！";
        } else if (type === 3) { // チェリー（青）：回復
            this.hp += 30;
            if (this.hp > 100) this.hp = 100; // HPの最大値は100
            resultText = "【チェリー】ナノマシン作動！HPが30回復！";
        }

        this.checkFloorClear();
        return resultText;
    }

    checkFloorClear() {
        if (this.enemyHp <= 0) {
            this.floor++;
            this.enemyHp = 100 + (this.floor * 20); // 次の敵は強くなる
            this.battery += 10;
        }
    }

    getStatusText() {
        return `FLOOR: ${this.floor}  HP: ${this.hp}  BATT: ${this.battery}  ENEMY HP: ${this.enemyHp}`;
    }
}