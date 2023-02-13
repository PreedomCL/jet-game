import Phaser from 'phaser';
import config from './config';
import GameScene from './scenes/GameScene';
import PreloadScene from './scenes/PreloadScene';

new Phaser.Game(
    Object.assign(config, {
        scene: [PreloadScene, GameScene]
    })
);
