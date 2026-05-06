import * as Phaser from 'phaser';

export class SlotScene extends Phaser.Scene {
    constructor() {
        super('SlotScene');
        this.reels = [[], [], []]; 
        this.spinTimers = [null, null, null];
        this.isSpinning = [false, false, false];
    }

    // ==========================================
    // ★ 新規追加：音声ファイルを読み込む
    // ==========================================
    preload() {
        // publicフォルダに用意したmp3ファイルを読み込みます
        this.load.audio('se_start', '/start.mp3');
        this.load.audio('se_stop', '/stop.mp3');
        this.load.audio('se_win', '/win.mp3');
    }

    create() {
        this.cameras.main.setViewport(0, 350, 400, 250);
        this.cameras.main.setBackgroundColor('#222222');

        this.add.text(20, 15, 'HACKING SLOT', { fontSize: '18px', fill: '#00ff00', fontStyle: 'bold' });

        const spinBtn = this.add.rectangle(330, 25, 100, 35, 0x00aa00).setInteractive({ useHandCursor: true });
        this.add.text(330, 25, 'SPIN', { fontSize: '20px', fill: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);

        spinBtn.on('pointerdown', () => {
            this.startAll();
        });

        const colX = [80, 200, 320];
        const rowY = [75, 125, 175];

        for (let c = 0; c < 3; c++) {
            this.add.rectangle(colX[c], 125, 80, 150).setStrokeStyle(4, 0x00aa00);

            for (let r = 0; r < 3; r++) {
                let numText = this.add.text(colX[c], rowY[r], '0', { fontSize: '40px', fill: '#ffffff' }).setOrigin(0.5);
                this.reels[c].push(numText);
            }

            let stopBtn = this.add.rectangle(colX[c], 225, 70, 30, 0xcc0000).setInteractive({ useHandCursor: true });
            this.add.text(colX[c], 225, 'STOP', { fontSize: '16px', fill: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);

            stopBtn.on('pointerdown', () => {
                this.stopColumn(c);
            });
        }
    }

    startAll() {
        if (this.isSpinning.includes(true)) return;

        for(let c = 0; c < 3; c++) {
            for(let r = 0; r < 3; r++) {
                this.reels[c][r].setColor('#ffffff');
            }
        }

        this.events.emit('slot_start');

        // ★ 音を鳴らす①：スピン開始音！
        this.sound.play('se_start');

        for (let c = 0; c < 3; c++) {
            this.isSpinning[c] = true;
            this.spinTimers[c] = this.time.addEvent({
                delay: 50,
                callback: () => {
                    for(let r = 0; r < 3; r++) {
                        this.reels[c][r].setText(Phaser.Math.Between(1, 3).toString());
                    }
                },
                loop: true
            });
        }
    }

    stopColumn(colIndex) {
        if (!this.isSpinning[colIndex]) return;

        // ★ 音を鳴らす②：リール停止音！
        this.sound.play('se_stop');

        this.spinTimers[colIndex].remove();
        this.isSpinning[colIndex] = false;

        if (!this.isSpinning.includes(true)) {
            this.checkWin();
        }
    }

    checkWin() {
        let isWin = false;

        const lines = [
            [{c:0, r:0}, {c:1, r:0}, {c:2, r:0}],
            [{c:0, r:1}, {c:1, r:1}, {c:2, r:1}],
            [{c:0, r:2}, {c:1, r:2}, {c:2, r:2}],
            [{c:0, r:0}, {c:1, r:1}, {c:2, r:2}],
            [{c:0, r:2}, {c:1, r:1}, {c:2, r:0}]
        ];

        lines.forEach(line => {
            let p1 = this.reels[line[0].c][line[0].r];
            let p2 = this.reels[line[1].c][line[1].r];
            let p3 = this.reels[line[2].c][line[2].r];

            if (p1.text === p2.text && p2.text === p3.text) {
                isWin = true;
                p1.setColor('#ffff00');
                p2.setColor('#ffff00');
                p3.setColor('#ffff00');
            }
        });

        if (isWin) {
            // ★ 音を鳴らす③：当たりのファンファーレ！
            this.sound.play('se_win');
            this.events.emit('slot_win');
        } else {
            this.events.emit('slot_lose');
        }
    }
}