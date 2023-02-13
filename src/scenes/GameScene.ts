import Bullet from "../entities/Bullet";
import Player from "../entities/Player";

export default class GameScene extends Phaser.Scene
{
    private players: Phaser.GameObjects.Group;
    private bullets: Phaser.GameObjects.Group;
    private scoreBoardText: Phaser.GameObjects.Text;
    private scores: number[] = [0, 0];

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

        this.startRound();
    }

    startRound(): void {
        this.players.clear(true);
        this.bullets.clear(true);

        let player0X = Math.random() * this.sys.canvas.width/3;
        let player0Y = Math.random() * this.sys.canvas.height;

        let player1X = (Math.random() * this.sys.canvas.width/3) + (2 * this.sys.canvas.width/3);
        let player1Y = Math.random() * this.sys.canvas.height;

        //let angleRad = Math.atan((player0Y-player1Y)/(player0X-player1X));

        this.players.add(new Player(this, player0X, player0Y, 0 + Math.random() - 0.5, {
            rollLeft: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
            rollRight: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
            shootBullet:  this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q)
        }, 0));

        this.players.add(new Player(this, player1X, player1Y, Math.PI + Math.random() - 0.5, {
            rollLeft: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT),
            rollRight: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT),
            shootBullet:  this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.PERIOD)
        }, 1));
    }

    addBullet(bullet: Bullet): void {
        this.bullets.add(bullet);
    }

    onPlayerDie(deadPlayer: Player): void {
        this.startRound();
        if(deadPlayer.getId() == 0) {
            this.scores[1]++;
        }else {
            this.scores[0]++;
        }
        this.updateScoreboard();        
    }

    updateScoreboard(): void {
        this.scoreBoardText.setText(`Player 1: ${this.scores[0]} | Player 2: ${this.scores[1]}`);
        this.scoreBoardText.setX((this.sys.canvas.width/2)-this.scoreBoardText.width/2).setY((this.sys.canvas.height-20)-this.scoreBoardText.height/2);
    }
}