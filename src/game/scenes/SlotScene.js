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
        this.isGameOver = false;
        
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
        
        // 1. サイバーな敵グラフィック（コンテナ構成：将来の画像差し替え対応）
        this.enemyContainer = this.add.container(200, 90);
        
        // 将来的にスプライト（画像）に差し替える場合のプレースホルダーとして保持
        this.enemySprite = null; // 例: this.add.image(0, 0, 'enemy_image')
        
        // ドローン/ロボット風サイバーグラフィックス
        this.enemyGraphics = this.add.graphics();
        this.drawCyberEnemy(0xaa0000, 0xff3333);
        this.enemyContainer.add(this.enemyGraphics);

        // 2. 常にフワフワと上下にゆっくり移動する浮遊アニメーション (Tween)
        this.tweens.add({
            targets: this.enemyContainer,
            y: { from: 85, to: 95 },
            yoyo: true,
            repeat: -1,
            duration: 1500,
            ease: 'Sine.easeInOut'
        });

        // 3. 一人称視点「ハッキングバイザー」風の四隅L字型装飾ライン（UI）
        const visorGraphics = this.add.graphics();
        visorGraphics.lineStyle(2, 0x00ff66, 0.7);
        const margin = 12;
        const len = 25;
        const w = 400;
        const h = 600;

        // 左上
        visorGraphics.beginPath();
        visorGraphics.moveTo(margin, margin + len);
        visorGraphics.lineTo(margin, margin);
        visorGraphics.lineTo(margin + len, margin);
        visorGraphics.strokePath();

        // 右上
        visorGraphics.beginPath();
        visorGraphics.moveTo(w - margin - len, margin);
        visorGraphics.lineTo(w - margin, margin);
        visorGraphics.lineTo(w - margin, margin + len);
        visorGraphics.strokePath();

        // 左下
        visorGraphics.beginPath();
        visorGraphics.moveTo(margin, h - margin - len);
        visorGraphics.lineTo(margin, h - margin);
        visorGraphics.lineTo(margin + len, h - margin);
        visorGraphics.strokePath();

        // 右下
        visorGraphics.beginPath();
        visorGraphics.moveTo(w - margin - len, h - margin);
        visorGraphics.lineTo(w - margin, h - margin);
        visorGraphics.lineTo(w - margin, h - margin - len);
        visorGraphics.strokePath();

        // バイザーの照準・スキャンラインなどの微小な装飾
        visorGraphics.lineStyle(1, 0x00ff66, 0.3);
        visorGraphics.strokeRect(margin + 5, margin + 5, w - (margin + 5) * 2, h - (margin + 5) * 2);

        this.dungeonText = this.add.text(200, 220, `【 地下${this.status.floor}階：通路 】\n前方に2つの扉がある。\n\n左リール：左の扉\n右リール：右の扉\n中リール：? × ?`, {
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

    drawCyberEnemy(baseColor, glowColor) {
        this.enemyGraphics.clear();
        
        // 外側のサイバーフレーム・装飾プロペラ/ウィング
        this.enemyGraphics.lineStyle(2, glowColor, 0.8);
        this.enemyGraphics.strokeRect(-45, -25, 90, 50);
        
        // コアボディ（六角形または多角形風）
        this.enemyGraphics.fillStyle(baseColor, 0.9);
        this.enemyGraphics.beginPath();
        this.enemyGraphics.moveTo(-35, 0);
        this.enemyGraphics.lineTo(-20, -20);
        this.enemyGraphics.lineTo(20, -20);
        this.enemyGraphics.lineTo(35, 0);
        this.enemyGraphics.lineTo(20, 20);
        this.enemyGraphics.lineTo(-20, 20);
        this.enemyGraphics.closePath();
        this.enemyGraphics.fillPath();
        this.enemyGraphics.strokePath();

        // 中央のサイバーアイ（発光センサー）
        this.enemyGraphics.fillStyle(glowColor, 1);
        this.enemyGraphics.fillCircle(0, 0, 8);
        this.enemyGraphics.lineStyle(1, 0xffffff, 1);
        this.enemyGraphics.strokeCircle(0, 0, 8);

        // 左右のジェネレーター・フィン
        this.enemyGraphics.fillStyle(0x333333, 1);
        this.enemyGraphics.fillRect(-55, -12, 12, 24);
        this.enemyGraphics.fillRect(43, -12, 12, 24);
        this.enemyGraphics.lineStyle(1, glowColor, 1);
        this.enemyGraphics.strokeRect(-55, -12, 12, 24);
        this.enemyGraphics.strokeRect(43, -12, 12, 24);
    }

    animateEnemyDamage() {
        this.drawCyberEnemy(0xffffff, 0xffffff);
        this.tweens.add({
            targets: this.enemyContainer,
            x: { from: 190, to: 210 },
            yoyo: true,
            duration: 40,
            repeat: 3,
            onComplete: () => {
                this.enemyContainer.setX(200);
                this.drawCyberEnemy(0xaa0000, 0xff3333);
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
        if (this.isGameOver || this.isSpinning.includes(true)) return;

        // ★ 追加：スピンするたびにHPを1消費する
        this.status.hp -= 1;

        // ★ 追加：スピンの消費でHPが0になった場合のゲームオーバー処理
        if (this.status.hp <= 0) {
            this.status.hp = 0;
            this.updateUI();
            this.dungeonText.setText(`【 SYSTEM DOWN 】\n行動する体力が尽きた。\nハッキングタワーの闇に飲まれる……\n\n(クリックで再挑戦)`);
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
        if (this.isGameOver || !this.isSpinning[col]) return; 

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
            
            // 敵からの攻撃でHPが10減る
            this.status.hp -= 10; 
            if (this.status.hp < 0) this.status.hp = 0; 
            
            this.animatePlayerDamage();

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
                
                this.enemyContainer.setAlpha(0);
                this.tweens.add({ targets: this.enemyContainer, alpha: 1, duration: 500 });
            });
        } else {
            this.dungeonText.setText(`【 アクション成功 】\n${resultText}\n\n次の行動を選択せよ（SPIN）`);
            this.updateUI();
        }
    }

    handleGameOver() {
        this.isGameOver = true;
        
        this.add.rectangle(200, 300, 400, 600, 0x000000, 0.6);

        this.input.once('pointerdown', () => {
            this.scene.restart();
        });
    }
}