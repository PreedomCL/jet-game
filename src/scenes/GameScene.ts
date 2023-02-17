import { Physics } from "phaser";
import Bullet from "../entities/Bullet";
import Player from "../entities/Player";
import SplitCamera from "../gfx/SplitCamera";

export default class GameScene extends Phaser.Scene
{
    private players: Phaser.GameObjects.Group;
    private bullets: Phaser.GameObjects.Group;
    private scoreBoardText: Phaser.GameObjects.Text;
    private scores: number[] = [0, 0];
    private player1controls: any;
    private player2controls: any;

    public player1: Player;
    public player2: Player;

    private splitCamera: SplitCamera;

    constructor() {
        super('gameScene');
    }
      
    create(): void {
        console.log('GameScene');
        this.players = this.add.group({ runChildUpdate: true });
        this.bullets = this.add.group({ runChildUpdate: true });

        this.physics.add.collider(
            this.bullets,
            this.players,
            (bullet: any, player: any) => { bullet.onHitPlayer(player) },
            () => {},
            this
        );
        
        this.scoreBoardText = this.add.text(0, 0, 'Player 1: 0 | Player 2: 0');
        this.scoreBoardText.setDepth(1);
        this.scoreBoardText.setX((this.sys.canvas.width/2)-this.scoreBoardText.width/2).setY((this.sys.canvas.height-20)-this.scoreBoardText.height/2);
        
        this.player1controls = {
            rollLeft: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
            rollRight: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
            shootBullet:  this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q)
        };
        this.player2controls = {
            rollLeft: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT),
            rollRight: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT),
            shootBullet:  this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.PERIOD)
        };
        this.startGame();
        this.splitCamera = new SplitCamera(this);
        //this.cameras.main.ignore([this.player1, this.player2]);
        this.cameras.main.setAlpha(0.5);
    }

    update(time: number, delta: number): void {
        this.splitCamera.update(time, delta);
        //this.updateMainCamera();
    }

    updateSplitCameras(): void {
        let angleBetween = Math.atan((this.player1.y-this.player2.y)/(this.player1.x-this.player2.x));
        let bisectLength = ((this.sys.canvas.width/2)/Math.cos(angleBetween))/2;
        let offsetX = Math.cos(angleBetween) * bisectLength;
    }

    updateMainCamera(): void {
        let cam: Phaser.Cameras.Scene2D.Camera = this.cameras.main;
        let minX: number = 10000, minY: number = 100000, maxX: number = -100000, maxY: number = -10000;

        this.players.getChildren().forEach(playerObj => {
            let player = playerObj as Player;
            if(player.x < minX) {
                minX = player.x;
            }
            if(player.x > maxX) {
                maxX = player.x;
            }
            if(player.y < minY) {
                minY = player.y;
            }
            if(player.y > maxY) {
                maxY = player.y;
            }
        });

        minX -= 20/cam.zoom;
        maxX += 20/cam.zoom;
        minY -= 20/cam.zoom;
        maxY += 20/cam.zoom;

        cam.centerOn(minX + (maxX - minX)/2, minY + (maxY - minY)/2);
        let viewportRatio: number = cam.width / cam.height;
        let fitZoom: number;
        let fitWidth: number = maxX-minX;
        let fitHeight: number = maxY-minY;
        if((fitWidth/fitHeight) > viewportRatio) {
            //Width is prioitized
            fitZoom = (cam.width/fitWidth);
        }else {
            //Height is prioritized
            fitZoom = (cam.height/fitHeight);
        }
        
        let targetZoom: number = Math.min(fitZoom, cam.zoom);
        console.log(`fitZoom/zoom: ${fitZoom/cam.zoom} | cam zoom: ${cam.zoom} | fit zoom: ${fitZoom}`);
        if(fitZoom/cam.zoom > 2) {
            targetZoom = fitZoom;
        }

        cam.setZoom(cam.zoom + (fitZoom-cam.zoom)*0.1);
    }

    startGame(): void {
        let player1X = Math.random() * this.sys.canvas.width/3;
        let player1Y = Math.random() * this.sys.canvas.height;

        let player2X = (Math.random() * this.sys.canvas.width/3) + (2 * this.sys.canvas.width/3);
        let player2Y = Math.random() * this.sys.canvas.height;

        //this.player1 = new Player(this, player1X, player1Y, 0 + Math.random() - 0.5, this.player1controls, 0);
        //this.player2 = new Player(this, player2X, player2Y, Math.PI + Math.random() - 0.5, this.player2controls, 1);

        this.player1 = new Player(this, 250, 300, Math.PI * (1/2), this.player1controls, 0);
        this.player2 = new Player(this, 550, 300, Math.PI * (3/2), this.player2controls, 0);

        this.bullets.clear(true);
        this.players.clear(true);
        this.players.add(this.player1);
        this.players.add(this.player2);

        this.scores = [0,0];
    }

    addBullet(bullet: Bullet): void {
        this.bullets.add(bullet);
    }

    onPlayerDie(deadPlayer: Player): void {
        deadPlayer.destroy(true);
        if(deadPlayer.getId() == 0) {
            this.scores[1]++;
            this.player1 = new Player(this, Math.random() * this.sys.canvas.width, Math.random() * this.sys.canvas.height, Math.random() * Math.PI * 2, this.player1controls, 0);
            this.players.add(this.player1);
        }else {
            this.scores[0]++;
            this.player2 = new Player(this, Math.random() * this.sys.canvas.width, Math.random() * this.sys.canvas.height, Math.random() * Math.PI * 2, this.player1controls, 0);
            this.players.add(this.player2);
        }
        this.updateScoreboard();
    }

    updateScoreboard(): void {
        this.scoreBoardText.setText(`Player 1: ${this.scores[0]} | Player 2: ${this.scores[1]}`);
        this.scoreBoardText.setX((this.sys.canvas.width/2)-this.scoreBoardText.width/2).setY((this.sys.canvas.height-20)-this.scoreBoardText.height/2);
    }
}