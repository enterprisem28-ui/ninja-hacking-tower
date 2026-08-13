import * as Phaser from 'phaser';
import { GameStatus } from '../logic/GameStatus';
import { SlotLogic } from '../logic/SlotLogic';

export class SlotScene extends Phaser.Scene {
    constructor() {
        super('SlotScene');
        this.reelLayout = [0, 2, 1, 3, 0, 2, 1, 3, 0, 2, 3, 1]; 
        this.reels = [];
        this.reelPositions = [0, 0, 0];
        this.isSpinning = [false, false, false];
        this.spinTimers = [null, null, null];
        this.isGameOver = false; // ★ 追加：ゲームオーバー判定
        
        this.status = new GameStatus();
        this.logic = new SlotLogic();
    }

    preload() {
        this.load.image('sym0', '/symbol_7.png');
        this.load.image('sym1', '/symbol_bar.png');
        this.load.image('sym2', '/symbol_bell.png');
        this.load.image('sym3', '/symbol_cherry.png');
        
        this.load.audio('se_start', '/start.mp3');
        this.load.audio('se_stop', '/stop.mp3');
        this.load.audio('se_win', '/win.mp3');
    }

    create() {
        this.cameras.main.setViewport(0, 0, 400, 600);
        this.cameras.main.setBackgroundColor('#111111');

        this.add.rectangle(200, 150, 380, 280, 0x000000).setStrokeStyle(4, 0xffffff);
        
        this.enemyGraphic = this.add.rectangle(200, 90, 80, 80, 0xaa0000);

        this.dungeonText = this.add.text(400, 220, `【 地下${this.status.floor}階：通路 】\n前方に2つの扉がある。\n\n左リール：左の扉\n右リール：右の扉\n中リール：? × ?`, {
            fontSize: '18px',
            fill: '#ffffff',
            align: 'center',
            lineSpacing: 10
        }).setOrigin(0.5);       

        this.uiText = this.add.text(10, 290, '', { fontSize: '16px', fill: '#00ff00', fontStyle: 'bold' });
        
        const spinBtn = this.add.rectangle(350, 325, 80, 40, 0x00aa00).setInteractive({ useHandCursor: true });
        this.add.text(350, 325, 'SPIN', { fontSize: '18px', fill: '#fff', fontStyle: 'bold' }).setOrigin(0.5);
        spinBtn.on('pointerdown', () => this.startSpin());

        const colX = [65, 160, 255];
        for (let i = 0; i < 3; i++) {
            this.reels[i] = [];
            for (let r = 0; r < 3; r++) {
                let img = this.add.image(colX[i], 370 + r * 60, 'sym0').setScale(0.07);
                this.reels[i].push(img);
            }

            let btn = this.add.rectangle(colX[i], 550, 80, 35, 0xcc0000).setInteractive({ useHandCursor: true });
            this.add.text(colX[i], 550, 'STOP', { fontSize: '16px', fill: '#fff', fontStyle: 'bold' }).setOrigin(0.5);
            btn.on('pointerdown', () => this.stopReel(i));
        }

        this.updateUI();
    }

    animateEnemyDamage() {
        this.enemyGraphic.setFillStyle(0xffffff);
        this.tweens.add({
            targets: this.enemyGraphic,
            x: { from: 190, to: 210 },
            yoyo: true,
            duration: 40,
            repeat: 3,
            onComplete: () => {
                this.enemyGraphic.setX(200);
                this.enemyGraphic.setFillStyle(0xaa0000);
            }
        });
    }

    animatePlayerDamage() {
        this.cameras.main.flash(300, 255, 0, 0);
        this.cameras.main.shake(300, 0.01);
    }
    
    updateUI() {
        this.uiText.setText(this.status.getStatusText());
    }

    startSpin() {
        // ★ 変更：ゲームオーバー時は操作不可
        if (this.isGameOver || this.isSpinning.includes(true)) return;

        // ★ 変更：バッテリー消費チェックとバッテリー切れの処理
        if (!this.status.consumeBattery()) {
            this.dungeonText.setText(`【 BATTERY EMPTY 】\nデバイスの電源が落ちた。\n通信途絶……任務失敗。\n\n(クリックで再挑戦)`);
            this.handleGameOver();
            return;
        }

        this.updateUI();
        
        if (this.cache.audio.exists('se_start')) this.sound.play('se_start');
        
        this.events.emit('slot_start');
        this.logic.leverOn();

        this.dungeonText.setText(`【 地下${this.status.floor}階：通路 】\n前方に2つの扉がある。\n\n左リール：左の扉\n右リール：右の扉\n中リール：? × ?`);

        for (let i = 0; i < 3; i++) {
            this.isSpinning[i] = true;
            this.spinTimers[i] = this.time.addEvent({
                delay: 60,
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
        if (this.isGameOver || !this.isSpinning[col]) return; // ★ 変更：ゲームオーバー時は操作不可

        let slide = 0;
        for (let s = 0; s <= 4; s++) {
            let checkIdx = (this.reelPositions[col] + 1 + s) % this.reelLayout.length;
            if (this.reelLayout[checkIdx] === this.logic.internalFlag) {
                slide = s;
                break;
            }
        }

        this.reelPositions[col] = (this.reelPositions[col] + slide) % this.reelLayout.length;
        this.refreshReelImages(col);

        this.spinTimers[col].remove();
        this.isSpinning[col] = false;
        
        this.logic.recordStop(col);
        
        if (this.logic.pushOrder.length === 1) {
            const actionText = this.logic.getFirstAction();
            this.dungeonText.setText(`【 地下${this.status.floor}階：通路 】\n${actionText}\n\nそのまま残りのリールを止めて、\nアクション（役）を決定せよ！`);
        }

        if (this.cache.audio.exists('se_stop')) this.sound.play('se_stop');

        if (!this.isSpinning.includes(true)) {
            this.checkResult();
        }
    }

    checkResult() {
        const centerLine = [
            this.reelLayout[(this.reelPositions[0] + 1) % this.reelLayout.length],
            this.reelLayout[(this.reelPositions[1] + 1) % this.reelLayout.length],
            this.reelLayout[(this.reelPositions[2] + 1) % this.reelLayout.length]
        ];
        
        if (centerLine[0] === centerLine[1] && centerLine[1] === centerLine[2]) {
            const winType = centerLine[0];
            this.handleWin(winType);
        } else {
            this.events.emit('slot_lose');
            this.status.hp -= 10; 
            if (this.status.hp < 0) this.status.hp = 0; // ★ 追加：HPがマイナスにならないようにする
            
            this.animatePlayerDamage();

            // ★ 変更：プレイヤーのHPが0になった時のゲームオーバー処理
            if (this.status.hp <= 0) {
                this.dungeonText.setText(`【 SYSTEM DOWN 】\nダメージが限界を超えた。\nハッキングタワーの闇に飲まれる……\n\n(クリックで再挑戦)`);
                this.updateUI();
                this.handleGameOver();
            } else {
                this.dungeonText.setText(`【 行動失敗 】\n目押しミス！隙を突かれて敵の攻撃！\n(HP -10)\n\n次の行動を選択せよ（SPIN）`);
                this.updateUI();
            }
        }
    }
    
    handleWin(type) {
        if (this.cache.audio.exists('se_win')) this.sound.play('se_win');
        this.events.emit('slot_win');
        
        let resultText = this.status.applyWin(type);
        
        if (type === 0) {
            this.animateEnemyDamage();
            this.status.damageEnemy(15); 
            resultText += `\n敵に 15 のダメージ！`;
        }

        if (this.status.enemyHp <= 0) {
            this.dungeonText.setText(`【 撃破！！ 】\n敵を倒した！\n\n奥の階段を見つけ、次の階層へ進む……`);
            this.updateUI();

            this.time.delayedCall(2000, () => {
                this.status.nextFloor();
                this.dungeonText.setText(`【 地下${this.status.floor}階：通路 】\n新たな敵が立ちふさがった！\n\n行動を選択せよ（SPIN）`);
                this.updateUI();
                
                this.enemyGraphic.setAlpha(0);
                this.tweens.add({ targets: this.enemyGraphic, alpha: 1, duration: 500 });
            });
        } else {
            this.dungeonText.setText(`【 アクション成功 】\n${resultText}\n\n次の行動を選択せよ（SPIN）`);
            this.updateUI();
        }
    }

    // --- ▼ 追加：ゲームオーバー時の専用関数 ▼ ---
    handleGameOver() {
        this.isGameOver = true;
        
        // 画面全体を少し暗くする演出
        this.add.rectangle(200, 300, 400, 600, 0x000000, 0.6);

        // 画面のどこかをクリックしたら、シーンを再起動（最初からリトライ）
        this.input.once('pointerdown', () => {
            this.scene.restart();
        });
    }
    // --- ▲ 追加おわり ▲ ---
}