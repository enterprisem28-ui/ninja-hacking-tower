import * as Phaser from 'phaser';

export class SlotScene extends Phaser.Scene {
    constructor() {
        super('SlotScene');
        // スロット用の変数を準備
        this.reels = [];      // 3つの数字テキストを入れる配列
        this.reelStates = []; // 各リールが回っているかどうかの状態(true/false)
        this.spaceKey = null; // 操作用のスペースキー
        this.timer = 0;       // 数字を切り替える速度を調整するためのタイマー
    }

    create() {
        this.cameras.main.setViewport(0, 350, 400, 350);
        this.cameras.main.setBackgroundColor('#333333');

        this.add.text(20, 20, 'HACKING SLOT AREA', { 
            font: '24px Arial', 
            fill: '#00ff00' 
        });

        const reelWidth = 80;
        const reelHeight = 120;
        const frameColor = 0x00ff00;
        const frameThickness = 4;
        
        // リールの位置（X座標）
        const reelX = [100, 200, 300];

        // 3つの枠と、その中の数字（テキスト）を作成
        for (let i = 0; i < 3; i++) {
            // 枠を描画
            this.add.rectangle(reelX[i], 175, reelWidth, reelHeight)
                .setStrokeStyle(frameThickness, frameColor);
            
            // 数字テキストを描画（初期値は'0'）
            const text = this.add.text(reelX[i], 175, '0', {
                font: '64px Arial',
                fill: '#ffffff'
            }).setOrigin(0.5); // テキストの中心を座標(reelX, 175)に合わせる

            this.reels.push(text);      // 配列にテキストを保存
            this.reelStates.push(false); // 初期状態は「止まっている(false)」
        }

        // スペースキーを入力として登録
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        // スペースキーが「押された瞬間」の処理
        this.spaceKey.on('down', () => {
            // もし3つとも止まっていたら、全部回し始める（スタート）
            if (!this.reelStates[0] && !this.reelStates[1] && !this.reelStates[2]) {
                this.reelStates = [true, true, true];
            } 
            // それ以外（どれかが回っている）なら、左から順番に止める
            else {
                if (this.reelStates[0]) {
                    this.reelStates[0] = false; // 左を止める
                } else if (this.reelStates[1]) {
                    this.reelStates[1] = false; // 真ん中を止める
                } else if (this.reelStates[2]) {
                    this.reelStates[2] = false; // 右を止める
                }
            }
        });
    }

    update(time, delta) {
        // --- スロットの数字をパラパラ変化させる処理 ---
        // deltaは前回のupdateからの経過時間（ミリ秒）
        this.timer += delta;

        // 50ミリ秒ごとに数字を更新する（数字を小さくすると回転が速くなる）
        if (this.timer > 50) {
            for (let i = 0; i < 3; i++) {
                // そのリールが「回っている(true)」状態なら
                if (this.reelStates[i]) {
                    // 0〜9のランダムな整数を生成してテキストを書き換える
                    const randomNum = Phaser.Math.Between(0, 9);
                    this.reels[i].setText(randomNum.toString());
                }
            }
            this.timer = 0; // タイマーをリセット
        }
    }
}