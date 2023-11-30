const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false,
        },
    },
    scene: {
        preload: preload,
        create: create,
        update: update,
    },
};

const game = new Phaser.Game(config);

let player;
let cursors;
let stars;
let attractiveBoxes;
let redBoxes;
let laser;
let laserCooldownCounter;

const PLAYER_SIZE = 50;
const PLAYER_SPEED = 7;
const OBJECT_SIZE = 30;
const OBJECT_SPEED = 3;
const LASER_SPEED = 10;
const WINNING_SCORE = 60;

function preload() {
    this.load.image('star', 'star.png');
    this.load.image('player', 'player.png');
    this.load.audio('laser', 'path/to/laser.wav'); // Replace 'path/to/laser.wav' with the actual path
    this.load.audio('pickup', 'path/to/pickup.wav'); // Replace 'path/to/pickup.wav' with the actual path
}

function create() {
    stars = this.physics.add.group();
    attractiveBoxes = this.physics.add.group();
    redBoxes = this.physics.add.group();

    for (let i = 0; i < 100; i++) {
        const star = stars.create(Phaser.Math.Between(0, 800), Phaser.Math.Between(0, 600), 'star');
        star.setDisplaySize(2, 2);
    }

    player = this.physics.add.sprite(400, 550, 'player').setOrigin(0.5, 0.5);
    player.setCollideWorldBounds(true);

    cursors = this.input.keyboard.createCursorKeys();
    laserCooldownCounter = 0;

    this.sound.add('laser'); // Add the 'laser' sound to the game
    this.sound.add('pickup'); // Add the 'pickup' sound to the game
}

function update() {
    if (cursors.left.isDown && player.x > 0) {
        player.setVelocityX(-PLAYER_SPEED);
    } else if (cursors.right.isDown && player.x < 800) {
        player.setVelocityX(PLAYER_SPEED);
    } else {
        player.setVelocityX(0);
    }

    if (cursors.space.isDown && laserCooldownCounter <= 0) {
        fireLaser();
        laserCooldownCounter = 20;
    }

    laserCooldownCounter--;

    this.physics.overlap(player, attractiveBoxes, collectStar, null, this);
    this.physics.overlap(player, redBoxes, collectRedBox, null, this);

    stars.children.iterate((star) => {
        if (star.y > 600) {
            star.y = 0;
            star.x = Phaser.Math.Between(0, 800);
        }
    });

    if (checkWinCondition()) {
        console.log('You win!');
        // Add your win condition logic here
    }
}

function fireLaser() {
    laser = this.add.rectangle(player.x, player.y - 10, 3, 10, 0x00ff00);
    this.physics.add.existing(laser);
    laser.body.velocity.y = -LASER_SPEED;
    this.sound.play('laser'); // Play the 'laser' sound
}

function collectStar(player, star) {
    star.y = 0;
    star.x = Phaser.Math.Between(0, 800);
    laserCooldownCounter += 5; // Add some cooldown reduction for collecting stars
    this.sound.play('pickup'); // Play the 'pickup' sound
}

function collectRedBox(player, redBox) {
    redBox.y = 0;
    redBox.x = Phaser.Math.Between(0, 800);
    // Add logic for red box collection (e.g., decrease score or increase strikes)
}

function checkWinCondition() {
    // Add your win condition check logic here
    return false;
}
