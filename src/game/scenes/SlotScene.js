import * as Phaser from 'phaser';
import { GameStatus } from '../logic/GameStatus';
import { SlotLogic } from '../logic/SlotLogic';

export class SlotScene extends Phaser.Scene {
    constructor() {
        super('SlotScene');
        // リールの絵柄配列（パチスロのリール帯）
        this.reelLayout = [0, 2, 1, 3, 0, 2, 1, 3, 0, 2, 3, 1]; 
        this.reels = [];
        this.reelPositions = [0, 0, 0]; // 現在のリール位置（インデックス）
        this.isSpinning = [false, false, false];
        this.spinTimers = [null, null, null];
        
        // ゲームステータスとロジックを外部モジュールに委譲
        this.status = new GameStatus();
        this.logic = new SlotLogic();
    }

    preload() {
        // 画像を読み込む
        this.load.image('sym0', '/symbol_7.png');
        this.load.image('sym1', '/symbol_bar.png');
        this.load.image('sym2', '/symbol_bell.png');
        this.load.image('sym3', '/symbol_cherry.png');
        
        // 音声ファイル
        this.load.audio('se_start', '/start.mp3');
        this.load.audio('se_stop', '/stop.mp3');
        this.load.audio('se_win', '/win.mp3');
    }

    create() {
        // 全体の画面サイズを縦に広げる（上半分:ダンジョン、下半分:スロット）
        this.cameras.main.setViewport(0, 0, 400, 600);
        this.cameras.main.setBackgroundColor('#111111');

       // ==========================================
        // 🏰 上半分：ダンジョン画面（主観視点）レイヤー
        // ==========================================
        // ダンジョンの枠線（ダミー）
        this.add.rectangle(200, 150, 380, 280, 0x000000).setStrokeStyle(4, 0xffffff);
        
        // --- ▼ ここから変更・追加 ▼ ---
        // 敵のダミーグラフィック（赤い四角形）を配置
        this.enemyGraphic = this.add.rectangle(200, 90, 80, 80, 0xaa0000);

        // 状況表示テキスト（Y座標を 150 から 220 に下げて敵と被らないように調整）
        this.dungeonText.setText('【 地下1階：通路 】\n前方に２つの扉がある。\n\n左リール：左の扉\n右リール：右の扉\n中リール：? × ?');
            fontSize: '18px', 
            fill: '#ffffff', 
            align: 'center',
            lineSpacing: 10
        }).setOrigin(0.5);
        // --- ▲ 変更・追加おわり ▲ ---
        // ==========================================
        // 🎰 下半分：スロット（UI）レイヤー
        // ==========================================
        // UI表示（Y座標に +300 して下半分に移動）
        this.uiText = this.add.text(10, 290, '', { fontSize: '16px', fill: '#00ff00', fontStyle: 'bold' });
        // SPINボタン（Y座標に +300 して下半分に移動）
        const spinBtn = this.add.rectangle(350, 325, 80, 40, 0x00aa00).setInteractive({ useHandCursor: true });
        this.add.text(350, 325, 'SPIN', { fontSize: '18px', fill: '#fff', fontStyle: 'bold' }).setOrigin(0.5);
        spinBtn.on('pointerdown', () => this.startSpin());

        // リール配置
        const colX = [65, 160, 255];
        for (let i = 0; i < 3; i++) {
            this.reels[i] = [];
            for (let r = 0; r < 3; r++) {
                // 画像のY座標に +300 して下半分に配置
                let img = this.add.image(colX[i], 370 + r * 60, 'sym0').setScale(0.07);
                this.reels[i].push(img);
            }

            // STOPボタン（Y座標に +300 して下半分に移動）
            let btn = this.add.rectangle(colX[i], 550, 80, 35, 0xcc0000).setInteractive({ useHandCursor: true });
            this.add.text(colX[i], 550, 'STOP', { fontSize: '16px', fill: '#fff', fontStyle: 'bold' }).setOrigin(0.5);
            btn.on('pointerdown', () => this.stopReel(i));
        }
    }
// --- ▼ 追加箇所：ダメージ演出用のアニメーション関数 ▼ ---
    animateEnemyDamage() {
        // ダメージを受けた瞬間に一瞬白く光らせる
        this.enemyGraphic.setFillStyle(0xffffff);
        
        // 左右に激しく揺らすアニメーション（Tween）
        this.tweens.add({
            targets: this.enemyGraphic,
            x: { from: 190, to: 210 }, // X座標を左右に動かす
            yoyo: true,                // 動いた後、元の位置に戻る動きを有効化
            duration: 40,              // 1回の揺れのスピード（40ミリ秒＝かなり速い）
            repeat: 3,                 // 3回繰り返す
            onComplete: () => {
                this.enemyGraphic.setX(200);             // 最後に確実な中央位置に戻す
                this.enemyGraphic.setFillStyle(0xaa0000); // 色も元の赤色に戻す
            }
        });
    }
    // --- ▲ 追加箇所おわり ▲ ---

    // --- ▼ 追加箇所：プレイヤーのダメージ演出（画面の赤フラッシュ＆シェイク） ▼ ---
    animatePlayerDamage() {
        // 画面全体を赤色（RGB: 255, 0, 0）で300ミリ秒フラッシュさせる
        this.cameras.main.flash(300, 255, 0, 0);
        
        // 画面全体を300ミリ秒、強さ0.01で揺らす
        this.cameras.main.shake(300, 0.01);
    }
    // --- ▲ 追加箇所おわり ▲ ---
    updateUI() {
        this.uiText.setText(this.status.getStatusText());
    }

    startSpin() {
        // 既に回っている、またはバッテリーが0なら何もしない
        if (this.isSpinning.includes(true) || !this.status.consumeBattery()) return;

        this.updateUI();
        
        if (this.cache.audio.exists('se_start')) this.sound.play('se_start');
        
        this.events.emit('slot_start');

        // 内部抽選と押し順リセットをロジックモジュールに委譲
        this.logic.leverOn();

        // スピン開始時にダンジョンのテキストを初期化
        this.dungeonText.setText('【 地下1階：通路 】\n前方に２つの扉がある。\n\n左リール：左の扉\n右リール：右の扉\n中リール：? × ?');

        // リール回転開始
        for (let i = 0; i < 3; i++) {
            this.isSpinning[i] = true;
            this.spinTimers[i] = this.time.addEvent({
                delay: 60, // リールの回転速度
                callback: () => this.updateReel(i),
                loop: true
            });
        }
    }

    updateReel(col) {
        this.reelPositions[col] = (this.reelPositions[col] + 1) % this.reelLayout.length;
        this.refreshReelImages(col);
    }

    refreshReelImages(col) {
        for (let r = 0; r < 3; r++) {
            let idx = (this.reelPositions[col] + r) % this.reelLayout.length;
            let symbolId = this.reelLayout[idx];
            this.reels[col][r].setTexture(`sym${symbolId}`);
        }
    }

    stopReel(col) {
        if (!this.isSpinning[col]) return;

        // --- スベリ制御の実装 ---
        let slide = 0;
        for (let s = 0; s <= 4; s++) {
            let checkIdx = (this.reelPositions[col] + 1 + s) % this.reelLayout.length;
            // 真ん中の段（r=1）にフラグの役を止めたい場合
            if (this.reelLayout[checkIdx] === this.logic.internalFlag) {
                slide = s;
                break;
            }
        }

        // スベリ分だけ位置を進めて停止
        this.reelPositions[col] = (this.reelPositions[col] + slide) % this.reelLayout.length;
        this.refreshReelImages(col);

        this.spinTimers[col].remove();
        this.isSpinning[col] = false;
        
        // 停止したリールを記録（押し順トラッキング）
        this.logic.recordStop(col);
        
        // 第1停止時（1つ目のリールが止まった瞬間）のルート表示
        if (this.logic.pushOrder.length === 1) {
            const actionText = this.logic.getFirstAction();
            this.dungeonText.setText(`【 地下1階：通路 】\n${actionText}\n\nそのまま残りのリールを止めて、\nアクション（役）を決定せよ！`);
        }

        if (this.cache.audio.exists('se_stop')) this.sound.play('se_stop');

        // すべてのリールが止まったら判定へ
        if (!this.isSpinning.includes(true)) {
            this.checkResult();
        }
    }

    checkResult() {
        // 中央ラインの判定
        const centerLine = [
            this.reelLayout[(this.reelPositions[0] + 1) % this.reelLayout.length],
            this.reelLayout[(this.reelPositions[1] + 1) % this.reelLayout.length],
            this.reelLayout[(this.reelPositions[2] + 1) % this.reelLayout.length]
        ];

        const pattern = this.logic.getPushPattern(); // 押し順パターンを取得
        
        if (centerLine[0] === centerLine[1] && centerLine[1] === centerLine[2]) {
            const winType = centerLine[0];
            this.handleWin(winType);
      } else {
            // ハズレ時のペナルティとテキスト表示
            this.events.emit('slot_lose');
            this.status.hp -= 10; 
            
            // --- ▼ 追加箇所：ハズレ時にプレイヤーダメージ演出を実行 ▼ ---
            this.animatePlayerDamage();
            // --- ▲ 追加箇所おわり ▲ ---

            this.dungeonText.setText(`【 行動失敗 】\n目押しミス！隙を突かれて敵の攻撃！\n(HP -10)\n\n次の行動を選択せよ（SPIN）`);
            this.updateUI();
        }
    }
    handleWin(type) {
        if (this.cache.audio.exists('se_win')) this.sound.play('se_win');
        this.events.emit('slot_win');
        
        // 新しい効果を適用し、結果のテキストを受け取る
        const resultText = this.status.applyWin(type);
        this.dungeonText.setText(`【 アクション成功 】\n${resultText}\n\n次の行動を選択せよ（SPIN）`);
        
        // --- ▼ 追加箇所：赤7（攻撃）が揃った時にダメージ演出を実行 ▼ ---
        if (type === 0) {
            this.animateEnemyDamage();
        }
        // --- ▲ 追加箇所おわり ▲ ---

        this.updateUI();
    }
}