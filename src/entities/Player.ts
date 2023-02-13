import Phaser, { Scene } from "phaser";
import GameScene from "../scenes/GameScene";
import Bullet from "./Bullet";

const bulletSpeed = 1000;
const rollConstant = 0.01;

export default class Player extends Phaser.Physics.Arcade.Sprite {

    private gameScene: GameScene;
    private controls: any;
    private angleRadians: number;
    private speed: number;
    private roll: number;
    private health: number;
    private id: number;

    public constructor(scene: GameScene, x: number, y: number, angleRad: number, controls: any, id: number) {
        super(scene, x, y, 'f-15', 3);

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.gameScene = scene;
        this.controls = controls;
        this.angleRadians = angleRad;
        this.speed = 75;
        this.roll = 0;
        this.health = 10;
        this.id = id;
    }

    public update(time: number, delta: number): void {

        //Update velocity and rotation
        this.setVelocity(Math.cos(this.angleRadians) * this.speed, Math.sin(this.angleRadians) * this.speed);
        this.setRotation(this.angleRadians);
        this.angleRadians += -this.roll * rollConstant;
        
        //Check for roll left/right
        if(this.keyJustDown(this.controls.rollLeft)) {
            this.roll = this.clamp(this.roll + 1, -3, 3);
        }else if(this.keyJustDown(this.controls.rollRight)) {
            this.roll = this.clamp(this.roll -1, -3, 3);
        }
        
        //Check for shoot bullet
        if(this.keyJustDown(this.controls.shootBullet)) {
            this.shootBullet();
        }

        //Set correct animation
        this.setFrame(this.roll + 3);

        this.checkInBounds();
    }

    public damage(damage: number) {
        this.health -= damage;
        if(this.health <= 0) {
            this.gameScene.onPlayerDie(this);
        }
    }

    public getId(): number {
        return this.id;
    }

    private shootBullet(): void {
        this.gameScene.addBullet(new Bullet(this.gameScene, this.x, this.y, this.angleRadians + (Math.random()-0.5)*0.01));
    }

    private keyJustDown(key: Phaser.Input.Keyboard.Key): boolean {
        return Phaser.Input.Keyboard.JustDown(key);
    }

    private clamp(number: number, low: number, high: number): number {
        return Math.max(low, Math.min(number, high));
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