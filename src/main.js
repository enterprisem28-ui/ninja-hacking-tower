import Phaser from 'phaser';
// 読み込み先のパスに game/ を追加しました！
import { ActionScene } from './game/scenes/ActionScene';
import { SlotScene } from './game/scenes/SlotScene';

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