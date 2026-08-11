export class SlotLogic {
    constructor() {
        this.pushOrder = []; 
        this.internalFlag = null;
    }

    leverOn() {
        this.pushOrder = []; 
        
        const rand = Math.floor(Math.random() * 100) + 1;
        if (rand <= 5) this.internalFlag = 0;       // 5%：赤7
        else if (rand <= 15) this.internalFlag = 1; // 10%：BAR
        else if (rand <= 35) this.internalFlag = 2; // 20%：ベル
        else if (rand <= 55) this.internalFlag = 3; // 20%：チェリー
        else this.internalFlag = -1;                // 45%：ハズレ（フラグ無し）
        
        return this.internalFlag;
    }

    recordStop(colIndex) {
        this.pushOrder.push(colIndex);
    }

    getPushPattern() {
        const orderStr = this.pushOrder.join('');
        if (orderStr === '012') return '順押し';      
        if (orderStr === '021') return 'ハサミ打ち';  
        if (orderStr === '210') return '逆押し';      
        return '変則押し';                            
    }

    // 第1停止で選択したルートをテキストで返す
   getFirstAction() {
        if (this.pushOrder.length === 0) return null;
        const first = this.pushOrder[0];
        if (first === 0) return '【左の扉】へ進むルートを選択した！';
        if (first === 1) return '【 ？ × ？ 】\n己の勘で残りのリールを止めろ！'; // 中押しは単なる押し順当て
        if (first === 2) return '【右の扉】へ進むルートを選択した！';
   }
