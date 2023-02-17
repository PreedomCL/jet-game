import Phaser from "phaser";
import config from "../config";
import GameScene from "../scenes/GameScene";

interface cameraOrigins {
    x1: number,
    y1: number,
    x2: number,
    y2: number
}

export default class SplitCamera {

    private scene: GameScene;
    private player1Camera: Phaser.Cameras.Scene2D.Camera;
    private player2Camera: Phaser.Cameras.Scene2D.Camera;
    
    private player1MaskGraphics: Phaser.GameObjects.Graphics;
    private player2MaskGraphics: Phaser.GameObjects.Graphics;

    private dividerGraphics: Phaser.GameObjects.Graphics;
    private debugGraphics: Phaser.GameObjects.Graphics;

    private ellipseRadiusX: number;
    private ellipseRadiusY: number;

    constructor(scene: GameScene) {
        this.scene = scene;

        this.dividerGraphics = this.scene.add.graphics();
        this.debugGraphics = this.scene.add.graphics();

        this.player1Camera = this.scene.cameras.add(0, 0, config.scale.width, config.scale.height, false, "player1Camera");
        this.player2Camera = this.scene.cameras.add(0, 0, config.scale.width, config.scale.height, false, "player2Camera");

        this.player1Camera.startFollow(this.scene.player1, false);
        this.player2Camera.startFollow(this.scene.player2, false);

        this.player1Camera.ignore(this.dividerGraphics);
        this.player2Camera.ignore(this.dividerGraphics);

        this.player1Camera.setTint(0xff0000);

        this.ellipseRadiusX = config.scale.width * 0.25;
        this.ellipseRadiusY = config.scale.height * 0.25;

        this.player1MaskGraphics = new Phaser.GameObjects.Graphics(scene);
        this.player2MaskGraphics = new Phaser.GameObjects.Graphics(scene);

        this.player1Camera.setMask(this.player1MaskGraphics.createGeometryMask());
        this.player2Camera.setMask(this.player2MaskGraphics.createGeometryMask());

        this.makeGraphics();
    }

    private makeGraphics(): void {

        let hypot = Math.hypot(config.scale.width, config.scale.height);

        this.dividerGraphics.setPosition(config.scale.width/2, config.scale.height/2);
        this.dividerGraphics.lineStyle(2, 0x000000, 1.0);
        this.dividerGraphics.lineBetween(-hypot/2, 0, hypot/2, 0);
        this.dividerGraphics.stroke();
        this.dividerGraphics.strokeCircle(0,0,10);

        this.player1MaskGraphics.setPosition(config.scale.width/2, config.scale.height/2);
        this.player1MaskGraphics.fillStyle(0x000000, 0);
        this.player1MaskGraphics.fillRect(-hypot/2,0, hypot, hypot/2);

        this.player2MaskGraphics.setPosition(config.scale.width/2, config.scale.height/2);
        this.player2MaskGraphics.fillStyle(0x000000, 0);
        this.player2MaskGraphics.fillRect(-hypot/2,0, hypot, hypot/2);
    }

    public update(time: number, delta: number): void {
        let slope: number;
        let player1Right= this.scene.player1.x > this.scene.player2.x;
        let player1Bottom = this.scene.player1.y > this.scene.player2.y;
        if(player1Right) {
            slope = (this.scene.player1.y - this.scene.player2.y) / (this.scene.player1.x - this.scene.player2.x);
        }else {
            slope = (this.scene.player2.y - this.scene.player1.y) / (this.scene.player2.x - this.scene.player1.x);
        }

        let cameraOrigins = this.calculateOrigins(slope);

        //this.debugGraphics.fillStyle(0xff0000);
        //this.debugGraphics.fillPoint(this.scene.player1.x, this.scene.player1.y);

        if(player1Right) {
            this.player1Camera.x = cameraOrigins.x1;
            this.player1Camera.y = cameraOrigins.y1;
            this.player2Camera.x = cameraOrigins.x2;
            this.player2Camera.y = cameraOrigins.y2;
        }else {
            this.player1Camera.x = cameraOrigins.x2;
            this.player1Camera.y = cameraOrigins.y2;
            this.player2Camera.x = cameraOrigins.x1;
            this.player2Camera.y = cameraOrigins.y1;
        }

        let dividerSlope = this.calculateDividerSlope(cameraOrigins.x1, cameraOrigins.y1);
        let dividerAngle = Math.atan(dividerSlope);

        this.dividerGraphics.setRotation(dividerAngle);

        if(!player1Bottom) {
            this.player1MaskGraphics.setRotation(dividerAngle + Math.PI);
            this.player2MaskGraphics.setRotation(dividerAngle);
        }else {
            this.player1MaskGraphics.setRotation(dividerAngle);
            this.player2MaskGraphics.setRotation(dividerAngle + Math.PI);
        }     
    }

    private calculateDividerSlope(x: number, y: number): number {
        let a = this.ellipseRadiusX;
        let b = this.ellipseRadiusY;
        return -((2*x*b*b)/(2*y*a*a));
    }

    private calculateOrigins(slope: number): cameraOrigins {
        let a = this.ellipseRadiusX;
        let b = this.ellipseRadiusY;
        let m = slope;
        
        let x = a*b*(Math.sqrt(((a*a)*(m*m)+(b*b)))/((a*a)*(m*m)+(b*b)));
        let y = m*x;

        return { x1: x, y1: y, x2: -x, y2: -y };
    }
    
}