import * as Phaser from 'phaser';

export class ActionScene extends Phaser.Scene {
    constructor() {
        super('ActionScene');
        this.ninja = null;
        this.cursors = null;
        this.platforms = null; // 足場（地面）用の変数
    }

    create() {
        this.scene.launch('SlotScene');

        this.cameras.main.setViewport(0, 0, 400, 350);
        this.cameras.main.setBackgroundColor('#001133');

        this.add.text(20, 20, 'NINJA ACTION AREA', { 
            font: '24px Arial', 
            fill: '#ffffff' 
        });

        // --- 1. 足場（地面）を作る ---
        // 動かない物理オブジェクトのグループを作成
        this.platforms = this.physics.add.staticGroup();
        
        // 画面の下の方にグレーの横長四角形を置いて地面にする
        const ground = this.add.rectangle(200, 340, 400, 20, 0x555555);
        this.platforms.add(ground); // 物理エンジンに登録

        // --- 2. 忍者の設定 ---
        this.ninja = this.add.rectangle(200, 100, 32, 32, 0xffffff, 1);
        
        // 忍者に物理法則（重力など）を適用する
        this.physics.add.existing(this.ninja); 
        
        // 画面の枠から外に出ないようにする
        this.ninja.body.setCollideWorldBounds(true);

        // --- 3. 衝突判定 ---
        // 忍者と足場がぶつかる（乗れる）ようにする
        this.physics.add.collider(this.ninja, this.platforms);

        this.cursors = this.input.keyboard.createCursorKeys();
    }

    update() {
        // --- 4. 動きとジャンプの処理 ---
        
        // 左右の移動（速度で設定）
        if (this.cursors.left.isDown) {
            this.ninja.body.setVelocityX(-200);
        } else if (this.cursors.right.isDown) {
            this.ninja.body.setVelocityX(200);
        } else {
            // キーを離したらピタッと止まるようにする
            this.ninja.body.setVelocityX(0); 
        }

        // ジャンプ
        // 上キーが押されていて、かつ「足が地面についている時」だけジャンプ可能
        if (this.cursors.up.isDown && this.ninja.body.touching.down) {
            this.ninja.body.setVelocityY(-450); // マイナス方向（上）への力
        }
    }
}