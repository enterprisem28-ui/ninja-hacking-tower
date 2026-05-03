import * as Phaser from 'phaser';

export class ActionScene extends Phaser.Scene {
    constructor() {
        super('ActionScene');
        this.ninja = null;
        this.cursors = null;
    }

    create() {
        this.scene.launch('SlotScene');

        this.cameras.main.setViewport(0, 0, 400, 350);
        this.cameras.main.setBackgroundColor('#001133');

        this.add.text(20, 20, 'NINJA ACTION AREA', { 
            font: '24px Arial', 
            fill: '#ffffff' 
        });

        // 忍者の描画
        this.ninja = this.add.rectangle(200, 175, 32, 32, 0xffffff, 1);
        this.cursors = this.input.keyboard.createCursorKeys();
    }

    update() {
        if (this.cursors.left.isDown) {
            this.ninja.x -= 3;
        } else if (this.cursors.right.isDown) {
            this.ninja.x += 3;
        }
    }
}