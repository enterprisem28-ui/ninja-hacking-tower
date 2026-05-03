import Phaser from 'phaser';

export class SlotScene extends Phaser.Scene {
    constructor() {
        super('SlotScene');
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

        this.add.rectangle(100, 175, reelWidth, reelHeight).setStrokeStyle(frameThickness, frameColor);
        this.add.rectangle(200, 175, reelWidth, reelHeight).setStrokeStyle(frameThickness, frameColor);
        this.add.rectangle(300, 175, reelWidth, reelHeight).setStrokeStyle(frameThickness, frameColor);
    }
}