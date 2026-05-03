import Phaser from 'phaser';
import { ActionScene } from './scenes/ActionScene';
import { SlotScene } from './scenes/SlotScene';

const config = {
    type: Phaser.AUTO,
    width: 400,
    height: 700,
    backgroundColor: '#000000',
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    scene: [ActionScene, SlotScene]
};

new Phaser.Game(config);