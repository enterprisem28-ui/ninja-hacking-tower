import * as Phaser from 'phaser';
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
    // ↓ここを追加！物理エンジン（Arcade Physics）を有効にする
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 800 }, // 下方向への重力（数字が大きいほど落下が速い）
            debug: false         // 判定の枠線を見たい時は true にします
        }
    },
    scene: [ActionScene, SlotScene]
};

new Phaser.Game(config);