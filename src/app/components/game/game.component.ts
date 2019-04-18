import {Component, OnInit, ViewChild} from '@angular/core';

interface GameLocation {
  leftPosition: number;
  topPosition: number;
}

@Component({
  selector: 'app-game',
  templateUrl: './index.html',
  styleUrls: ['./game.component.css']
})
export class GameComponent implements OnInit {
  @ViewChild('player') private playerRef: HTMLDivElement;
  @ViewChild('missiles') private missileRef: HTMLDivElement;
  @ViewChild('enemies') private enemyRef: HTMLDivElement;

  POSITION_DELTA = 10;
  MAX_LEFT_POSITION = 550;

  playerPosition: GameLocation = {leftPosition: 300, topPosition: 550};
  missiles: GameLocation[] = [];
  enemies: GameLocation[] = [
    {leftPosition: 100, topPosition: 100},
    {leftPosition: 150, topPosition: 100},
    {leftPosition: 200, topPosition: 100},
    {leftPosition: 250, topPosition: 100},
    {leftPosition: 300, topPosition: 100},
    {leftPosition: 350, topPosition: 100},
    {leftPosition: 400, topPosition: 100},
    {leftPosition: 450, topPosition: 100},
    {leftPosition: 100, topPosition: 175},
    {leftPosition: 150, topPosition: 175},
    {leftPosition: 200, topPosition: 175},
    {leftPosition: 250, topPosition: 175},
    {leftPosition: 300, topPosition: 175},
    {leftPosition: 350, topPosition: 175},
    {leftPosition: 400, topPosition: 175},
    {leftPosition: 450, topPosition: 175}
  ];

  static getDivElement(objType: string, objLocation: GameLocation): string {
    return `<div class="${objType}" style="left:${objLocation.leftPosition}px; top:${objLocation.topPosition}px;"></div>`;
  }

  ngOnInit(): void {
    setInterval(() => this.gameTick(), 10);
  }

  onKeyDown(e: KeyboardEvent): void {
    switch (e.keyCode) {
      case 32:
        this.missiles.push({
          leftPosition: this.playerPosition.leftPosition + 15,
          topPosition: this.playerPosition.topPosition - 20
        });
        this.drawMissiles();
        break;
      case 37:
        if (this.playerPosition.leftPosition >= 20) {
          this.playerPosition.leftPosition -= this.POSITION_DELTA;
          this.movePlayer();
        }
        break;
      case 38:
        if (this.playerPosition.topPosition > 0) {
          this.playerPosition.topPosition -= this.POSITION_DELTA;
          this.movePlayer();
        }
        break;
      case 39:
        if (this.playerPosition.leftPosition < this.MAX_LEFT_POSITION) {
          this.playerPosition.leftPosition += this.POSITION_DELTA;
          this.movePlayer();
        }
        break;
      case 40:
        if (this.playerPosition.topPosition < 700) {
          this.playerPosition.topPosition += this.POSITION_DELTA;
          this.movePlayer();
        }
        break;
    }
  }

  drawMissiles(): void {
    this.missileRef.innerHTML = this.missiles.map(missile => GameComponent.getDivElement('missile', missile)).join('');
  }

  drawEnemies(): void {
    this.enemyRef.innerHTML = this.enemies.map(enemy => GameComponent.getDivElement('enemy', enemy)).join('');
  }

  movePlayer(): void {
    this.playerRef.style.left = `${this.playerPosition.leftPosition}px`;
    this.playerRef.style.top = `${this.playerPosition.topPosition}px`;
  }

  moveMissiles(): void {
    for (const missile of this.missiles) {
      missile.topPosition -= 5;
    }
  }

  moveEnemies(): void {
    for (const enemy of this.enemies) {
      enemy.topPosition++;
      if (enemy.topPosition === this.MAX_LEFT_POSITION) {
        enemy.topPosition = 0;
      }
    }
  }

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
    this.drawMissiles();
    this.moveEnemies();
    this.drawEnemies();
    this.detectCollisions();
  }
}
