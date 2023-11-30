// Import libraries
const pygame = require('pygame');
const random = require('random');

// Initialize pygame
pygame.init();

// Define constants
const WIDTH = 800;
const HEIGHT = 600;
const PLAYER_SIZE = 50;
const PLAYER_SPEED = 7;
const OBJECT_SIZE = 30;
const OBJECT_SPEED = 3;
const BACKGROUND_COLOR = [0, 0, 0];
const STAR_COLOR = [255, 255, 255];
const STAR_COUNT = 100;
const STAR_RADIUS = 2;
const LASER_COLOR = [0, 255, 0];
const LASER_SPEED = 10;

const WHITE = [255, 255, 255];
const RED = [255, 0, 0];
const GREEN = [0, 255, 0];
const BLUE = [0, 0, 255];
const YELLOW = [255, 255, 0];
const PURPLE = [128, 0, 128];
const CYAN = [0, 255, 255];
const ORANGE = [255, 165, 0];

// Create screen
const screen = pygame.display.set_mode([WIDTH, HEIGHT]);
pygame.display.set_caption("Avoid the Falling Objects");

// Generate stars
const stars = [];
for (let i = 0; i < STAR_COUNT; i++) {
  const star = [random.randint(0, WIDTH), random.randint(0, HEIGHT)];
  stars.push(star);
}

// Load player image
let player = pygame.image.load("player.png");
player = pygame.transform.scale(player, [PLAYER_SIZE, PLAYER_SIZE]);
let player_x = (WIDTH - PLAYER_SIZE) / 2;
let player_y = HEIGHT - PLAYER_SIZE;

// Generate objects
const objects = [];
const object_count = 5;
for (let i = 0; i < object_count; i++) {
  const object_x = random.randint(0, WIDTH - OBJECT_SIZE);
  const object_y = random.randint(-HEIGHT, 0);
  objects.push([object_x, object_y]);
}

// Generate attractive boxes
const attractive_boxes = [];
const attractive_box_count = 3;
const attractive_box_colors = [CYAN, ORANGE, PURPLE];
for (let i = 0; i < attractive_box_count; i++) {
  const box_x = random.randint(0, WIDTH - OBJECT_SIZE);
  const box_y = random.randint(-HEIGHT, -i * HEIGHT / attractive_box_count);
  attractive_boxes.push([box_x, box_y, random.choice(attractive_box_colors)]);
}

// Generate red boxes
const red_boxes = [];
const red_box_count = 3;
for (let i = 0; i < red_box_count; i++) {
  const red_box_x = random.randint(0, WIDTH - OBJECT_SIZE);
  const red_box_y = random.randint(-HEIGHT, 0);
  red_boxes.push([red_box_x, red_box_y, RED]);
}

// Initialize laser variables
let laser = null;
const lasers = [];
const LASER_COOLDOWN = 20;
let laser_cooldown_counter = 0;

// Initialize game state variables
const START = 0;
const RUNNING = 1;
const GAME_OVER = 2;
let game_state = START;

// Define winning score
const WINNING_SCORE = 60;

// Initialize game variables
let running = true;
let score = 0;
let strikes = 3;
const font = pygame.font.Font(None, 36);
const clock = pygame.time.Clock();

// Main game loop
while (running) {
  for (const event of pygame.event.get()) {
    if (event.type === pygame.QUIT) {
      running = false;
    }
  }

  if (game_state === START) {
    const keys = pygame.key.get_pressed();
    if (keys[pygame.K_SPACE]) {
      game_state = RUNNING;
    }
  }

  if (game_state === RUNNING) {
    const keys = pygame.key.get_pressed();
    if (keys[pygame.K_LEFT] && player_x > 0) {
      player_x -= PLAYER_SPEED;
    }
    if (keys[pygame.K_RIGHT] && player_x < WIDTH - PLAYER_SIZE) {
      player_x += PLAYER_SPEED;
    }

    screen.fill(BACKGROUND_COLOR);

    for (const star of stars) {
      pygame.draw.circle(screen, STAR_COLOR, star, STAR_RADIUS);
    }

    screen.blit(player, [player_x, player_y]);

    for (let i = 0; i < attractive_boxes.length; i++) {
      const [box_x, box_y, color] = attractive_boxes[i];
      pygame.draw.rect(screen, color, [box_x, box_y, OBJECT_SIZE, OBJECT_SIZE]);
      attractive_boxes[i] = [box_x, box_y + OBJECT_SPEED, color];
      if (box_y > HEIGHT) {
        attractive_boxes[i] = [random.randint(0, WIDTH - OBJECT_SIZE), random.randint(-HEIGHT, 0), random.choice(attractive_box_colors)];
      }
      if (player_x < box_x < player_x + PLAYER_SIZE && player_y < box_y < player_y + PLAYER_SIZE) {
        pickup_sound.play();
        attractive_boxes[i] = [random.randint(0, WIDTH - OBJECT_SIZE), random.randint(-HEIGHT, 0), random.choice(attractive_box_colors)];
        score += 1;
      }
    }

    for (let i = 0; i < red_boxes.length; i++) {
      const [red_box_x, red_box_y, color] = red_boxes[i];
      pygame.draw.rect(screen, color, [red_box_x, red_box_y, OBJECT_SIZE, OBJECT_SIZE]);
      red_boxes[i] = [red_box_x, red_box_y + OBJECT_SPEED, color];
      if (red_box_y > HEIGHT) {
        red_boxes[i] = [random.randint(0, WIDTH - OBJECT_SIZE), random.randint(-HEIGHT, 0), RED];
      }
      if (player_x < red_box_x < player_x + PLAYER_SIZE && player_y < red_box_y < player_y + PLAYER_SIZE) {
        pickup_sound.play();
        red_boxes[i] = [random.randint(0, WIDTH - OBJECT_SIZE), random.randint(-HEIGHT, 0), RED];
        score += 1;
      }
    }

    if (laser) {
      let laser_y = laser[1];
      laser_y -= LASER_SPEED;
      pygame.draw.line(screen, LASER_COLOR, [laser[0], laser_y], [laser[0], laser_y - 10], 3);
      laser = [laser[0], laser_y];
      if (laser[1] < 0) {
        laser = null;
      }
    }

    if (laser_cooldown_counter > 0) {
      laser_cooldown_counter -= 1;
    }

    if (keys[pygame.K_SPACE] && laser_cooldown_counter === 0) {
      laser = [player_x + PLAYER_SIZE / 2, player_y];
      laser_sound.play();
      laser_cooldown_counter = LASER_COOLDOWN;
    }

    for (let i = 0; i < attractive_boxes.length; i++) {
      const [box_x, box_y, color] = attractive_boxes[i];
      if (laser && box_x < laser[0] < box_x + OBJECT_SIZE && box_y < laser[1] < box_y + OBJECT_SIZE) {
        attractive_boxes[i] = [random.randint(0, WIDTH - OBJECT_SIZE), random.randint(-HEIGHT, 0), random.choice(attractive_box_colors)];
      }
    }

    for (let i = 0; i < attractive_boxes.length; i++) {
      const [box_x, box_y, color] = attractive_boxes[i];
      if (color !== RED && player_x < box_x < player_x + PLAYER_SIZE && player_y < box_y < player_y + PLAYER_SIZE) {
        pickup_sound.play();
        attractive_boxes[i] = [random.randint(0, WIDTH - OBJECT_SIZE), random.randint(-HEIGHT, 0), random.choice(attractive_box_colors)];
        strikes -= 1;
      }
    }

    if (score >= WINNING_SCORE) {
      game_state = GAME_OVER;
    }

    if (strikes <= 0) {
      game_state = GAME_OVER;
      game_over_sound.play();
    }
  }

  if (game_state === GAME_OVER) {
    const keys = pygame.key.get_pressed();
    if (keys[pygame.K_SPACE]) {
      game_state = START;
      player_x = (WIDTH - PLAYER_SIZE) / 2;
      player_y = HEIGHT - PLAYER_SIZE;
      score = 0;
      strikes = 3;
      attractive_boxes = [];
      for (let i = 0; i < attractive_box_count; i++) {
        const box_x = random.randint(0, WIDTH - OBJECT_SIZE);
        const box_y = random.randint(-HEIGHT, 0);
        attractive_boxes.push([box_x, box_y, random.choice(attractive_box_colors)]);
      }
      red_boxes = [];
      for (let i = 0; i < red_box_count; i++) {
        const red_box_x = random.randint(0, WIDTH - OBJECT_SIZE);
        const red_box_y = random.randint(-HEIGHT, 0);
        red_boxes.push([red_box_x, red_box_y, RED]);
      }
    }
  }

  const score_text = font.render(`Score: ${score}`, true, WHITE);
  screen.blit(score_text, [10, 10]);
  const strikes_text = font.render(`Strikes: ${strikes}`, true, WHITE);
  screen.blit(strikes_text, [WIDTH - 150, 10]);
  pygame.display.update();
  clock.tick(60);
}

pygame.quit();


