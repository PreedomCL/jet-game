import Phaser from 'phaser';

export default class PreloadScene extends Phaser.Scene {

    constructor() {
        super('preloadScene');
    }

    preload(): void {
        this.load.aseprite('f-15', 'assets/f-15.png', 'assets/f-15.json');
        this.load.image('bullet', 'assets/bullet.png');
    }

    update(time: number, delta: number): void {
        this.scene.start('gameScene');
    }
}