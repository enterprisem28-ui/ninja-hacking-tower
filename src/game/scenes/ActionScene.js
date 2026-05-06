import * as Phaser from 'phaser';

export class ActionScene extends Phaser.Scene {
    constructor() {
        super('ActionScene');
        this.ninja = null;
        this.platforms = null;
    }

    preload() {
        this.load.spritesheet('ninja_sheet', '/ninja_sheet.png', { frameWidth: 544, frameHeight: 516 });
    }

    create() {
        // スロットシーンを起動
        this.scene.launch('SlotScene');
        
        this.cameras.main.setViewport(0, 0, 400, 350);
        this.cameras.main.setBackgroundColor('#001133');

        this.platforms = this.physics.add.staticGroup();
        const ground = this.add.rectangle(200, 340, 400, 20, 0x555555);
        this.platforms.add(ground);

        // 忍者の作成（操作しないので変数 cursors は削除しました）
        this.ninja = this.physics.add.sprite(200, 100, 'ninja_sheet', 0);
        this.ninja.setScale(0.1);
        this.ninja.body.setCollideWorldBounds(true);
        this.physics.add.collider(this.ninja, this.platforms);

        // アニメーション設定
        this.anims.create({
            key: 'run',
            frames: this.anims.generateFrameNumbers('ninja_sheet', { start: 0, end: 2 }),
            frameRate: 10, repeat: -1
        });
        this.anims.create({
            key: 'idle',
            frames: [{ key: 'ninja_sheet', frame: 0 }],
            frameRate: 20
        });

        // 最初は待機状態
        this.ninja.anims.play('idle', true);

        // ==========================================
        // ★ 下画面（SlotScene）からの通信を受け取る設定
        // ==========================================
        const slotScene = this.scene.get('SlotScene');

        // ①「スロットが回り始めた！」という通知を受け取ったら
        slotScene.events.on('slot_start', () => {
            this.ninja.anims.play('run', true); // 期待感を煽るために走る！
        });

        // ②「スロットが揃った（当たり）！」という通知を受け取ったら
        slotScene.events.on('slot_win', () => {
            this.ninja.anims.play('idle', true);
            this.ninja.body.setVelocityY(-500); // 喜びの大ジャンプ！
        });

        // ③「スロットが外れた…」という通知を受け取ったら
        slotScene.events.on('slot_lose', () => {
            this.ninja.anims.play('idle', true); // 走るのをやめて止まる
        });
    }

    update() {
        // ★ プレイヤーの操作はしないので、ここは空っぽでOKです！
    }
}