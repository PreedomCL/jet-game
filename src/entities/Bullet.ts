import { Physics } from "phaser";
import GameScene from "../scenes/GameScene";
import Player from "./Player";

const bulletSpeed = 1000;
const bulletDecceleration = -1000;

export default class Bullet extends Physics.Arcade.Image {

    private lifeTime: number;

    public constructor(scene: GameScene, x: number, y: number, rotationRad: number) {
        super(scene, x, y, 'bullet');
        
        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.setVelocity(Math.cos(rotationRad) * bulletSpeed, Math.sin(rotationRad) * bulletSpeed);
        this.setAcceleration(Math.cos(rotationRad) * bulletDecceleration, Math.sin(rotationRad) * bulletDecceleration);
        this.setRotation(rotationRad);
        this.lifeTime = 1000;
    }

    public update(time: number, delta: number) {
        this.checkInBounds();
        this.lifeTime -= delta;
        if(this.lifeTime <= 0) {
            this.destroy();
        }
    }

    public onHitPlayer(player: Player): void {
        player.damage(10);
    }

    private checkInBounds(): void {
        if(this.x < 0)
            this.setX(this.x + this.scene.sys.game.canvas.width);
        if(this.x > this.scene.sys.game.canvas.width)
            this.setX(this.x - this.scene.sys.game.canvas.width);
        if(this.y < 0)
            this.setY(this.y + this.scene.sys.game.canvas.height);
        if(this.y > this.scene.sys.game.canvas.height)
            this.setY(this.y - this.scene.sys.game.canvas.height);
    }

}