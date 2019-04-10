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

  static getDivElement(objType: string, objLocation: GameLocation): string {
    return `<div class='${objType}' style='left:${objLocation.leftPosition}px; top:${objLocation.topPosition}px'></div>`;
  }

  drawMissiles(): void {
    let missileRefHtml = "";
    this.missiles.forEach(missile => missileRefHtml += GameComponent.getDivElement('missile', missile));
    this.missileRef.innerHTML = missileRefHtml;
  }

  drawEnemies(): void {
    let enemyRefHtml = "";
    this.enemies.forEach(enemy => enemyRefHtml += GameComponent.getDivElement('enemy', enemy));
    this.enemyRef.innerHTML = enemyRefHtml;
  }

  movePlayer(): void {
    this.playerRef.style.left = `${this.playerPosition.leftPosition}px`;
    this.playerRef.style.top = `${this.playerPosition.topPosition}px`;
  }

  moveMissiles(): void {
    for (let i = 0; i < this.missiles.length; i++) {
      this.missiles[i].topPosition -= 5
    }
  }

  moveEnemies(): void {
    for (let i = 0; i < this.enemies.length; i++) {
      this.enemies[i].topPosition++;
      if (this.enemies[i].topPosition === this.MAX_LEFT_POSITION) {
        this.enemies[i].topPosition = 0
      }
    }
  }

  detectCollisions(): void {
    for (let enemyIdx = 0; enemyIdx < this.enemies.length; enemyIdx++) {
      for (let missileIdx = 0; missileIdx < this.missiles.length; missileIdx++) {
        if (this.missiles[missileIdx].leftPosition >= this.enemies[enemyIdx].leftPosition &&
            this.missiles[missileIdx].leftPosition <= (this.enemies[enemyIdx].leftPosition + 50) &&
            this.missiles[missileIdx].topPosition <= (this.enemies[enemyIdx].topPosition + 50) &&
            this.missiles[missileIdx].topPosition >= this.enemies[enemyIdx].topPosition) {
          this.enemies.splice(enemyIdx, 1);
          this.missiles.splice(missileIdx, 1);
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
