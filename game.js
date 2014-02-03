function init() {
    console.log("THIRD");
    document.addEventListener('keydown', keyPressed, false);
    document.addEventListener('keyup', keyReleased, false); 
    canvas = document.getElementById("canvas");  
    ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = false;
    ctx.webkitImageSmoothingEnabled = false;
    ctx.mozImageSmoothingEnabled = false;

    canvas_bg = document.createElement("canvas");
    canvas_bg.width = 640;
    canvas_bg.height = 480;
    ctx_bg = canvas_bg.getContext("2d");
    ctx_bg.imageSmoothingEnabled = false;
    ctx_bg.webkitImageSmoothingEnabled = false;
    ctx_bg.mozImageSmoothingEnabled = false;
    console.log("THIRD");

    var super_run = new Sprite( {
    //  x:canvas.width / (2 * SCALE),
    //  y:canvas.height / (2 * SCALE),
        x:canvas.width/2,
        y:canvas.height/2,
        width:11,
        height:16,
        flipped:false,
        index:0,
        states: {stand: {img:_IMAGES['superrun'],start:0,last:0,repeat:true},
                 stand_flip: {img:_IMAGES['superrun_flip'],start:0,last:0,repeat:true},
                 walk: {img:_IMAGES['superrun'],start:0,last:5,repeat:true},
                 walk_flip:{img:_IMAGES['superrun_flip'],start:0,last:5,repeat:true},
                 pick_up:{img:_IMAGES['superrun'],start:6,repeat:false},
                 pick_up_flip:{img:_IMAGES['superrun_flip'],start:6,repeat:false}},
        state: "stand",
        update: function() {
            if (KEYS_DOWN[KEYS.LEFT] && this.dx > -4) {
                this.dx--;
            }
            if (KEYS_DOWN[KEYS.RIGHT] && this.dx < 4) {
                this.dx++;
            }
            if (KEYS_DOWN[KEYS.DOWN] && this.dy < 4) {
                this.dy++;
            }
            if (KEYS_DOWN[KEYS.UP] && this.dy > -4) {
                this.dy--;
            }

            // Decrease veolcity when keys not pressed
            if (!KEYS_DOWN[KEYS.RIGHT] && !KEYS_DOWN[KEYS.LEFT]) {
                this.dx = Math.round(this.dx / 3);
            }
            if (!KEYS_DOWN[KEYS.UP] && !KEYS_DOWN[KEYS.DOWN]) {
                this.dy = Math.round(this.dy / 3);
            }

            if (KEYS_DOWN[KEYS.SPACE]) {
                var state = (!this.flipped) ? "pick_up" : "pick_up_flip";
                this.set_state(state);
                this.dx = this.dy = 0;
            } else  if (this.dx > 0 || (!this.flipped  && Math.abs(this.dy) > 0)) {
                this.set_state("walk");
            } else if (this.dx < 0 || (this.flipped  && Math.abs(this.dy) > 0)) {
                this.set_state("walk_flip");
            } else if (!this.flipped) { //dx == 0
                this.set_state("stand");
            } else if (this.flipped) {
                this.set_state("stand_flip");
            }

            this.flipped = !(this._state == "walk" || this._state == "stand" || this._state == "pick_up");
            this.y += this.dy; 
            this.x += this.dx;

        }});

    var attr = {
        flipped:false,
        width:12,
        height:9,
        angst:1,
        index:0,
        states: {stand: {img:_IMAGES['lamb'],start:0,last:0,repeat:true},
                 stand_flip: {img:_IMAGES['lamb_flip'],start:0,last:0,repeat:true},
                 walk: {img:_IMAGES['lamb'],start:0,last:3,repeat:true},
                 /*speak*/
                 /*stand*/
                 walk_flip:{img:_IMAGES['lamb_flip'],start:0,last:3,repeat:true}},
        state: "stand",
        update: function() {
            //generate 1:10 chance of switching states
            var rand = Math.floor(Math.random() * 100);
            var change = rand % 10 == 0;
            var walking = this.dx != 0;
            if (change) {
                console.log("CHANGE");
                this.dx = this.dy = 0;
                if (walking) {
                    var state = (this.flipped) ? "stand_flip" : "stand"; 
                    this.set_state(state);
                } else if (rand % 15 == 0) { //standing still change dir
                    var state = (!this.flipped) ? "stand_flip" : "stand"; 
                    this.set_state(state);
                } else {
                    var state = (this.flipped) ? "walk_flip" : "walk"; 
                    this.set_state(state);
                    while (this.dx == 0 && this.dy == 0) {
                        this.dx = Math.round(Math.random()) * this.angst;
                        this.dy = Math.round(Math.random()) * this.angst;
                    }
                    if (this.flipped) {
                        this.dx *= -1;
                        this.dy *= (Math.round(Math.random())) ? 1 : -1;
                    }
                } 
                this.flipped = !(this._state == "walk" || this._state == "stand");
            }

            this.y += this.dy; 
            this.x += this.dx;
        }};

    SPRITES.push(super_run);
    for (var i = 0; i < NUM_SHEEP; i++) {
        var sheep = new Sprite(attr); 
        sheep.x = canvas.width/2;
        sheep.y = canvas.height/2;
        sheep.angst = Math.floor(Math.random() * 2 + 1);
        SPRITES.push(sheep);    
    }

    bg();
//  ctx.translate(canvas.width/(2 * SCALE),canvas.height/(2 * SCALE));
    setInterval(update,100);

}

function gameLogic() {
    if(KEYS_DOWN[KEYS.LEFT] === true) {
        if (dx != -6) {
            dx--;
        }
    }
    if(KEYS_DOWN[KEYS.RIGHT]) {
        if (dx != 6) {
            dx++;
        }
    }
    if(KEYS_DOWN[KEYS.UP]) {
        if (dy != -3) {
            dy--;
        }
    }
    if(KEYS_DOWN[KEYS.DOWN]) {
        if (dy != 3) {
            dy++;
        }
    }

    if (!KEYS_DOWN[KEYS.LEFT] && !KEYS_DOWN[KEYS.RIGHT]) {
        dx = 0;
    }

    if (!KEYS_DOWN[KEYS.UP] && !KEYS_DOWN[KEYS.DOWN]) {
        dy = 0;
    }

    if (KEYS_DOWN[KEYS.SPACE]) {
        if ((distX<=8 && distX>=-6) && (distY<=-3 && distY>=-10)) {
            lambX = x;
            lambY = y + 4;
            lambIsAttached=true;
        } else {
            moving=false;
            dx=0;
            dy=0;
        }
    } else {
        if (lambIsAttached) {
            lambIsAttached=false;
            lambY+=4;
        }
        superKneelFrame=6; //Set the kneel frame counter to beginning	
    }


    if (dx == 0 && dy == 0) { 
        moving=false;
    } else {moving=true;}

    //Right Barrier 
    if (x<=148 && y<54 && x>140 && KEYS_DOWN[KEYS.LEFT]) {
        dx=0;
        x=Math.max(x,148);
    } else if (x>=133 && y<54 && x<140 && KEYS_DOWN[KEYS.RIGHT]) {
        dx=0;
        x=Math.min(x,133);
    } else if (x<=16 && y<54 && KEYS_DOWN[KEYS.LEFT]) { //Left Barrier
        dx=0;
        x=Math.max(x,16);
    }

    if (y<=0 && x>=16 && x<=133 && KEYS_DOWN[KEYS.UP]) { //northern bound
        dy=0;
        y=Math.max(y,0);
        if (lambIsAttached) {lambY=Math.max(lambY, 4);}

    } else if (y>=50 && y<53 && x>=0 && x<=115 && KEYS_DOWN[KEYS.DOWN]) {
        dy=0;
        y=Math.min(y,50);
        if (lambIsAttached) {lambY=Math.min(lambY, 58);}

    } else if (y<=55 && y>52 && x>=0 && x<=115 && KEYS_DOWN[KEYS.UP]) {
        dy=0;
        y=Math.max(y,55);
        if (lambIsAttached) {lambY=Math.max(lambY, 59);}
    }

    if ((x>=105 && x<=145) && (y>=20 && y<=70)) { //super is in area to open the gate
        openGate=true;
    } else {openGate=false;}
}

function render(lastRender) {
      requestAnimationFrame();
}

function update() {
    for (var i = 0; i < SPRITES.length; i++) { 
        SPRITES[i].update();
    }

    VIEW.x = SPRITES[0].x - 320/2;
    VIEW.y = SPRITES[0].y - 240/2;
    VIEW.width = 320;
    VIEW.height = 240;

    ctx.translate(-SPRITES[0].dx,-SPRITES[0].dy);
    
    //SCALING
    if (KEYS_DOWN[KEYS.SHIFT]) {
        if (KEYS_DOWN[KEYS.Z] && SCALE > 1) {
            SCALE--;
            ctx.scale(.5,.5);
            ctx.translate(SPRITES[0].x,SPRITES[0].y);
        }
    } else {
        if (KEYS_DOWN[KEYS.Z] && SCALE < 5) { 
            SCALE++;
            ctx.scale(2,2);
            ctx.translate(-SPRITES[0].x/2,-SPRITES[0].y/2);
        }
    }
    clear();


    ctx.drawImage(canvas_bg,VIEW.x,VIEW.y,VIEW.width,VIEW.height,VIEW.x,VIEW.y,VIEW.width,VIEW.height);
  //bg();
    fence();
    ffence();
    for (var i = 0; i < SPRITES.length; i++) { 
        SPRITES[i].draw();
    }

    //x and y value not w and h
//  viewport_w = canvas.width / Math.pow(2, SCALE - 1);
//  viewport_h = canvas.height / Math.pow(2, SCALE - 1);
//  ctx.strokeRect(SPRITES[0].x - viewport_w/2,SPRITES[0].y - viewport_h/2,viewport_w,viewport_h);
    

        //printStats();

}

function clear() {
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    // Will always clear the right space
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
}

function bg() {
    ctx_bg.drawImage(_IMAGES['grass'],0,0,640,480);
}

function ffence() {
    ctx.drawImage(_IMAGES['gate'],0,2,160,80);
}

function returnRandY() {
    lambY = Math.floor((Math.random()*100)+25);
}

function returnRandX() {
    lambX = Math.floor((Math.random()*250)+25);
}

function lamb() {	
    ctx.drawImage(_IMAGES['lamb'],(lambFrame * 12),0,12,9,lambX,lambY,12,9);
    lambFrame++;
    if(lambFrame>3) {lambFrame=0;}	
}

function printStats() {
    console.log("dx:" + dx + " dy:" + dy + (_DIRECTION.LEFT ? " <" : " >"));
}



window.onload = init;
