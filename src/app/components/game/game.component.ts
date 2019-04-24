import {Component, OnInit} from '@angular/core';

interface GameLocation {
  leftPosition: number;
  topPosition: number;
}

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})
export class GameComponent implements OnInit {
  POSITION_DELTA = 10;
  MAX_LEFT_POSITION = 550;

  playerPosition: GameLocation = {leftPosition: 300, topPosition: 550};
  missiles: GameLocation[] = [];
  enemies: GameLocation[] = [];

  constructor() {
    for (let leftPosition = 100; leftPosition <= 450; leftPosition += 50) {
      for (let topPosition = 100; topPosition <= 175; topPosition += 75) {
        this.enemies.push({leftPosition, topPosition});
      }
    }
  }

  ngOnInit(): void {
    setInterval(() => this.gameTick(), 10);
  }

  onKeyUp(e: KeyboardEvent): void {
     switch (e.code) {
      case 'Space':
        this.missiles.push({
          leftPosition: this.playerPosition.leftPosition + 15,
          topPosition: this.playerPosition.topPosition - 20
        });
        break;
      case 'ArrowLeft':
        if (this.playerPosition.leftPosition >= 20) {
          this.playerPosition.leftPosition -= this.POSITION_DELTA;
        }
        break;
      case 'ArrowUp':
        if (this.playerPosition.topPosition > 0) {
          this.playerPosition.topPosition -= this.POSITION_DELTA;
        }
        break;
      case 'ArrowRight':
        if (this.playerPosition.leftPosition < this.MAX_LEFT_POSITION) {
          this.playerPosition.leftPosition += this.POSITION_DELTA;
        }
        break;
      case 'ArrowDown':
        if (this.playerPosition.topPosition < 700) {
          this.playerPosition.topPosition += this.POSITION_DELTA;
        }
        break;
    }
  }

  moveMissiles = (): void => this.missiles.forEach(missile => missile.topPosition -= 5);
  moveEnemies = (): void => this.enemies.forEach(enemy => {
    enemy.topPosition++;
    if (enemy.topPosition === this.MAX_LEFT_POSITION) {
      enemy.topPosition = 0;
    }
  });

  detectCollisions(): void {
    const DELTA = 50;
    for (const enemy of this.enemies) {
      for (const missile of this.missiles) {
        if (missile.leftPosition <= (enemy.leftPosition + DELTA) && missile.leftPosition >= enemy.leftPosition &&
            missile.topPosition <= (enemy.topPosition + DELTA) && missile.topPosition >= enemy.topPosition) {
          this.enemies.splice(this.enemies.indexOf(enemy), 1);
          this.missiles.splice(this.missiles.indexOf(missile), 1);
        }
      }
    }
  }

  gameTick(): void {
    this.moveMissiles();
    this.moveEnemies();
    this.detectCollisions();
  }
}
