const sceneConfig = {
  active: false,
  visible: false,
  key: "Game",  
};

const TILE_WIDTH = 10;
const TILE_HEIGHT = 12;
const CANVAS_WIDTH = 480;
const CANVAS_HEIGHT = 576;
const TILE_SIZE = 48;
const MAX = 300;
const MIN = 30;

const tilesetImages = {
  'object':'object.png',
  'object2':'object2.png',
  'object4':'object4.png',
  'gg':'gg.png',
  'radio':'radio.png',
  'tree':'tree.png',
  'tile':'tile.png',
  'tile2':'tile2.png',
  'wall':'wall.png',
  'wedding':'wedding.png',
  'flower':'flower.png',
};

class GameScene extends Phaser.Scene {
  constructor() {
    super(sceneConfig);
    
    this.event = new Event(this);
    this.objectArr = new Array();
    this.block = false;
    this.destX = 0;
    this.destY = 0;
    this.roomNum = 1;
  }
  
  preload() {
    const g = this.add.graphics();
    this.load.on("progress", c=>{
        const {width: T, height: t} = this.sys.game.canvas;
        g.clear(),
        g.fillStyle(16777215),
        g.fillRect((T - MAX) / 2, (t - MIN) / 2, MAX * c, MIN),
        g.lineStyle(5, 16777215),
        g.strokeRect((T - MAX) / 2, (t - MIN) / 2, MAX, MIN)
    });
    this.load.on("complete", ()=>{
      g.destroy()
    });

    Object.entries(tilesetImages).forEach(
      ([key, value]) => {
        this.load.image(key, value);
      }
    );
    this.load.tilemapTiledJSON("world", "map.json");
    this.load.spritesheet("player", "character.png", {
        frameWidth: 48,
        frameHeight: 48,
      });
  }

  create() {
    const tilemap = this.make.tilemap({ key: "world"});
    Object.entries(tilesetImages).forEach(
      ([key, value]) => {
        tilemap.addTilesetImage(key, key);
      }
    );
    for (let i = 0; i < tilemap.layers.length; i++) {
      const layer = tilemap.createLayer(i, Object.keys(tilesetImages));
      layer.scale = 1;
    }

    const playerSprite = this.add.sprite(0, 0, "player");
    playerSprite.scale = 1;
    const playerSprite2 = this.add.sprite(0, 0, "player");
    playerSprite2.scale = 1;
    const playerSprite3 = this.add.sprite(0, 0, "player");
    playerSprite3.scale = 1;
    
    this.cameras.main.startFollow(playerSprite, true);
    this.cameras.main.setBounds(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    const gridEngineConfig = {
      characters: [
        {
          id: "groom",
          sprite: playerSprite,
          walkingAnimationMapping: 3,
          speed: 7,
          startPosition: { x: TILE_WIDTH/2, y: TILE_HEIGHT/2 },
        },
        {
          id: "bride",
          sprite: playerSprite2,
          walkingAnimationMapping: 0,
          speed: 7,
          startPosition: { x: TILE_WIDTH + 1, y: TILE_HEIGHT/2 -1 },
        },
        {
          id: "bride2",
          sprite: playerSprite3,
          walkingAnimationMapping: 0,
          speed: 4,
          startPosition: { x: 24, y: 10 },
        }
      ],
    };
    this.gridEngine.create(tilemap, gridEngineConfig);
    
    // 마우스 클릭
    this.input.on('pointerdown', function (pointer) {
      var px = Math.floor(pointer.worldX / TILE_SIZE);
      var py = Math.floor(pointer.worldY / TILE_SIZE);
      this.scene.moveTo(px, py);
    });

    // 오브젝트 조회
    this.initObjects(tilemap.objects[0].objects);

    // 포지션 이벤트
    this.gridEngine.positionChangeFinished().subscribe(({ charId, exitTile, enterTile }) => {
      if (exitTile.x === enterTile.x && exitTile.y === enterTile.y) {
          return;
      }
      if (enterTile.x == 24 && enterTile.y == 2) {
        this.gridEngine.turnTowards(charId, "down");
        return;
      }

      for (const o of this.objectArr) {
        if (enterTile.x == o.x && enterTile.y == o.y) {
            this.event.trigger(o.name);
        }
      }
    });

    // 이동종료 이벤트
    this.gridEngine.movementStopped().subscribe(({ charId, direction }) => {
      const {x:px, y:py} = this.gridEngine.getPosition(charId);
      const direct = this.turn(px, py, this.destX, this.destY);
      if (direct == "") {
        return;
      }
      this.gridEngine.turnTowards(charId, direct);

      for (const o of this.objectArr) {
        if (this.destX == o.x && this.destY == o.y) {
            this.event.trigger(o.name);
        }
      }
    });

    // 첫번째 이벤트
    this.event.trigger("init");
  }

  update() {
    if (!this.block) {
      var charId = "groom";
      if (this.roomNum == 2) {
        charId = "bride";
      }
      else if (this.roomNum == 3) {
        charId = "bride2";
      }

      // 방향키 이벤트
      const cursors = this.input.keyboard.createCursorKeys();
      if (cursors.left.isDown) {
          this.gridEngine.move(charId, "left");
          this.destX -= 1;
      } else if (cursors.right.isDown) {
          this.gridEngine.move(charId, "right");
          this.destX += 1;
      } else if (cursors.up.isDown) {
          this.gridEngine.move(charId, "up");
          this.destY -= 1;
      } else if (cursors.down.isDown) {
          this.gridEngine.move(charId, "down");
          this.destY += 1;
      }
    }
  }

  initObjects(objects) {
    for (const o of objects) {
      this.objectArr.push({name:o.name, x:Math.floor(o.x / TILE_SIZE), y:Math.floor(o.y / TILE_SIZE)});
    }
  }

  moveTo(dx, dy) {
    this.destX = dx;
    this.destY = dy;

    var charId = "groom";
    if (this.roomNum == 2) {
      charId = "bride";
    }
    else if (this.roomNum == 3) {
      charId = "bride2";
    }

    this.gridEngine.moveTo(charId, { x: dx, y: dy }, {noPathFoundStrategy: "CLOSEST_REACHABLE" }).subscribe(() => {
      if (!this.gridEngine.isMoving(charId)) {
        const {x:px, y:py} = this.gridEngine.getPosition(charId);
        const direct = this.turn(px, py, dx, dy);
        if (direct == "") {
          return;
        }
        this.gridEngine.turnTowards(charId, direct);

        for (const o of this.objectArr) {
          if (dx == o.x && dy == o.y) {
              this.event.trigger(o.name);
          }
        }
      }
    });
  }

  turn(px, py, ox, oy) {
    if (px === ox && py === oy)
        return "";

    const horizontalDistance = ox - px;
    const verticalDistance = py - oy;

    if (verticalDistance > -horizontalDistance) {
      return verticalDistance > horizontalDistance ? "up" : "right";
    } else {
      return verticalDistance > horizontalDistance ? "left" : "down";
    }
  }

  position(charId, x, y) {
    this.gridEngine.setPosition(charId, { x: x, y: y });
  }

  moveCamera(roomNum) {
    this.roomNum = roomNum;

    this.cameras.main.setBounds(CANVAS_WIDTH * (roomNum - 1), 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  }

  acquire() {
    if (!this.block) {
      this.block = true;
      return true; // 락을 성공적으로 획득함
    } else {
      return false; // 락이 이미 획득되어 있음
    }
  }

  release() {
    this.block = false;
  }
}

class Event {
    constructor(s) {
      this.scene = s;
      this.prompt = new Prompt();
  
      // 버튼 이벤트
      this.prompt.textOutputEl.addEventListener('click', async (e) =>  {
        if (e.target.id == 'rosun') {
          var html = '<img src="rosun.jpg" alt="로순">';
          html += '<img src="rosun2.jpg" alt="로순">';
          html += '<img src="rosun3.jpg" alt="로순">';
          html += '<img src="rosun4.jpg" alt="로순">';
          html += '<video autoplay="true" loop muted playsinline><source src="rosun.mp4" type="video/mp4"></video>';

          document.querySelector("#popup_photo .content_image").innerHTML = html;
          document.getElementById("popup_photo").style.display = 'flex';
        }
        else if (e.target.id == 'leon') {
          var html = '<img src="leon.jpg" alt="레온">';
          html += '<img src="leon2.jpg" alt="레온">';
          html += '<img src="leon3.jpg" alt="레온">';
          html += '<img src="leon4.jpg" alt="레온">';
          html += '<img src="leon5.jpg" alt="레온">';

          document.querySelector("#popup_photo .content_image").innerHTML = html;
          document.getElementById("popup_photo").style.display = 'flex';
        }
        else if (e.target.id == 'photo') {
          var html = '<img src="photo.jpg" alt="웨딩사진">';
          html += '<img src="photo2.jpg" alt="웨딩사진">';
          html += '<img src="photo3.jpg" alt="웨딩사진">';
          html += '<img src="photo4.jpg" alt="웨딩사진">';
          html += '<img src="photo5.jpg" alt="웨딩사진">';
          html += '<img src="photo6.jpg" alt="웨딩사진">';
          html += '<img src="photo7.jpg" alt="웨딩사진">';
          html += '<img src="photo8.jpg" alt="웨딩사진">';

          document.querySelector("#popup_photo .content_image").innerHTML = html;
          document.getElementById("popup_photo").style.display = 'flex';
        }
        else if (e.target.id == 'account') {
          document.querySelector("#popup_html .content").innerHTML = await (await fetch('./account')).text();
          document.getElementById("popup_html").style.display = 'flex';
        }
        else if (e.target.id == 'location') {
          document.querySelector("#popup_html .content").innerHTML = await (await fetch('./location')).text();
          document.getElementById("popup_html").style.display = 'flex';
        }
        else if (e.target.id == 'reset') {
          this.trigger('init');
        }
      });
    }

    trigger(type) {
        if (!this.scene.acquire()) {
            return;
        }

        switch (type) {
          case "reset":
            this.prompt.addLine(type);
            break;
          case "init":         
            this.scene.position('groom', 5, 5);
            this.scene.moveCamera(1);   
            
            this.prompt.addLine('woong');
            break;
          case "woong":
            this.scene.moveCamera(1);
            this.scene.position('groom', 8, 5);
            this.scene.gridEngine.turnTowards('groom', 'left');
            
            this.prompt.addLine(type);
            break;
          case "ram":
            this.scene.moveCamera(2);
            this.scene.position('bride', 11, 5);
            this.scene.gridEngine.turnTowards('bride', 'right');

            this.prompt.addLine(type);
            break;
          case "ram2":
            this.scene.moveCamera(2);
            this.scene.position('bride', 18, 5);
            this.scene.gridEngine.turnTowards('bride', 'left');

            this.prompt.addLine('ram');
            break;
          case "wedding":
            this.scene.moveCamera(3);
            this.scene.position('groom', 25, 2);
            this.scene.position('bride2', 24, 10);
            this.scene.gridEngine.turnTowards('groom', 'down');
      
            // walk
            this.scene.moveTo(24, 2);
      
            this.prompt.addLine(type);
            break;
          case "boy":
          case "cd":
          case "computer":
          case "trophy":
          case "leon":
          case "people":
          case "girl":
          case "experience":
          case "job":
          case "family":
          case "rosun":
          case "photo":
          case "account":
          case "location":
            this.prompt.addLine(type);
            break;
        }
        
        this.scene.release();
    }
}

class Prompt {
    constructor() {
      this.TIMER_DELAY = 10;
      this.lineHtmlPos = 0;
      this.textOutputEl = null;
      this.timer = null;
      this.lineEl = null;
      this.lineHtml = "";
      this.textOutputEl = document.querySelector("#text-output");

      fetch("prompt.json")//json파일 읽어오기
        .then((response) => response.json())//읽어온 데이터를 json으로 변환
        .then((json) => {
            this.promptJson = json;
        });
    }
  
    addLine(type) {
      if (this.timer !== null) {
        clearTimeout(this.timer);
        this.timer = null;
  
        this.lineEl.innerHTML = this.lineHtml;
      }
  
      this.lineHtml = this.promptJson[type];
  
      this.lineEl = document.createElement("div");
      this.textOutputEl.append(this.lineEl);
  
      this.lineHtmlPos = 0;
      this.timer = setTimeout(() => this.onTimer(), this.TIMER_DELAY);
    }
  
    onTimer() {
      if (this.timer !== null) {
        if (this.lineHtml[this.lineHtmlPos] === "<") {
          const N = this.lineHtml.indexOf(">", this.lineHtmlPos);
          N !== -1 && (this.lineHtmlPos = N);
        }
        this.lineHtmlPos++;
        this.lineEl.innerHTML = this.lineHtml.slice(0, this.lineHtmlPos);
        this.textOutputEl.scrollTop = this.textOutputEl.scrollHeight;
        this.lineHtmlPos < this.lineHtml.length && (this.timer = setTimeout(() => this.onTimer(), this.TIMER_DELAY));
      }
    }
}

const gameConfig = {
    title: "Invitation",
    scene: GameScene,
    width: CANVAS_WIDTH,
    height: CANVAS_HEIGHT,
    scale: {
      autoCenter: Phaser.Scale.CENTER_BOTH,
      mode: Phaser.Scale.FIT
    },
    plugins: {
      scene: [
        {
          key: "gridEnginePlugin",
          plugin: GridEngine,
          mapping: "gridEngine",
        },
      ],
    },
    parent: "game"
};

const game = new Phaser.Game(gameConfig);