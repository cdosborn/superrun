function game() {
    document.addEventListener('keydown', keyPressed, false);
    document.addEventListener('keyup', keyReleased, false); 
    canvas = document.getElementById("canvas");  
    ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = false;
    ctx.webkitImageSmoothingEnabled = false;
    ctx.mozImageSmoothingEnabled = false;

    canvas_bg = document.createElement("canvas");
    canvas_bg.width = 480;
    canvas_bg.height = 320;
    ctx_bg = canvas_bg.getContext("2d");
    ctx_bg.imageSmoothingEnabled = false;
    ctx_bg.webkitImageSmoothingEnabled = false;
    ctx_bg.mozImageSmoothingEnabled = false;

    super_run = new Sprite( {
        debugColor:"blue",
        type:"player",
        x:STARTX,
        y:STARTY,
        width:11,
        height:16,
        depth:3,
        flipped:false,
        states: {stand: {img:_IMAGES['superrun'],start:0,last:0,repeat:true},
                 stand_flip: {img:_IMAGES['superrun_flip'],start:0,last:0,repeat:true},
                 walk: {img:_IMAGES['superrun'],start:0,last:5,repeat:true},
                 walk_flip:{img:_IMAGES['superrun_flip'],start:0,last:5,repeat:true}},
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
            } else if (KEYS_DOWN[KEYS.UP] && this.dy > -4) {
                this.dy--;
            }

            var both = KEYS_DOWN[KEYS.RIGHT] && KEYS_DOWN[KEYS.LEFT];
            var left = KEYS_DOWN[KEYS.LEFT];
            var right = KEYS_DOWN[KEYS.RIGHT];

          //On key change instantly head that direction but not both pressed
          if (((right && this.dx < 0) || (left && this.dx > 0)) && !both) {
              this.dx *= -1;
          } 
              
            // Decrease veolcity when keys not pressed or both pressed 
            if (!right && !left) {
                this.dx = Math.round(this.dx / 4);
            }
            if (!KEYS_DOWN[KEYS.UP] && !KEYS_DOWN[KEYS.DOWN]) {
                this.dy = Math.round(this.dy / 4);
            }

            if (KEYS_DOWN[KEYS.A]) {
                COLLIDER.collision(this, SHEEP, 
                        function() {}, 
                        function() {
                            this["held"] = true;
                            //laying sheep are forced up
                            if (this.flipped) { 
                                this.set_state("walk_flip");
                            } else {
                                this.set_state("walk");
                            }
                            super_run.carrying.push(this);
                        });

                COLLIDER.collision(this, FIREFLYS, 
                        function() {}, 
                        function() {
                            this["held"] = true;
                            super_run.carrying.push(this);
                        });

                COLLIDER.collision(this, FLOWERS, 
                        function() {}, 
                        function() {
                            this["held"] = true;
                            super_run.carrying.push(this);
                        });
                
            } else if (KEYS_DOWN[KEYS.D]) { //"D(ROP)"
                var obj = this.carrying[this.carrying.length - 1];
                if (obj != undefined) {
                    obj["held"] = false;
                    this.carrying.pop();
                }
            } 
            if (this.dx > 0 || (this.dx == 0 && Math.abs(this.dy) > 0  && !this.flipped)) {
                this.set_state("walk");
            } else if (this.dx < 0 || (this.dx == 0 && Math.abs(this.dy) > 0 )) {
                this.set_state("walk_flip");
            } else if (!this.flipped) { //dx == 0
                this.set_state("stand");
            } else if (this.flipped) {
                this.set_state("stand_flip");
            }

            this.flipped = !(this._state == "walk" || this._state == "stand");

            safeMove(this);
        }});

    var flower_obj = {
        type:"flower",
        flipped:false,
        width:7,
        height:9,
        depth:1,
        states: {growing: {img:_IMAGES['flower'],start:0,repeat:false}},
        state: "growing",
        update: function(){
            if (this.held == true) {
                this.x = super_run.x - super_run.width/6;
                this.y = super_run.y + super_run.height/4;
            }
        }};

    var firefly_obj = {
        type:"firefly",
        flipped:false,
        width:2,
        height:1,
        depth:1,
        boid:{group:FIREFLYS, x:0, y:0},
        states: {flying: {img:_IMAGES['firefly'],start:0,repeat:true}},
        state: "flying",
        update: function(){
            if (CUR_HOUR > 20 || CUR_HOUR < 3) {
                this.set_state("flying");
            } else { 
                //inefficient
                this.set_state("ignore");
                return;
            } 

            var chance = chance(30);

            if (this.held == true) {
                    this.x = super_run.x - super_run.width/6;
                    this.y = super_run.y + super_run.height/4;
            } else if (chance) {
                this.x += ((Math.random() * 5)|0) * (FIREFLY_LOCUS_X > this.x) ? 1 : -1;
                this.y += ((Math.random() * 5)|0) * (FIREFLY_LOCUS_Y > this.y) ? 1 : -1;
            } else {
                this.x += (Math.random() * 10 - 5)|0;
                this.y += (Math.random() * 10 - 5)|0;
            }
        }};

    var sheep_obj = {
        type:"sheep",
        flipped:false,
        width:12,
        height:9,
        depth:4,
        angst:1,
        boid:{group:SHEEP, x:0, y:0},
        states: {stand: {img:_IMAGES['lamb'],start:0,last:0,repeat:true, flip:"stand_flip"},
                 stand_flip: {img:_IMAGES['lamb_flip'],start:0,last:0,repeat:true, flip:"stand"},
                 walk: {img:_IMAGES['lamb'],start:0,last:3,repeat:true, flip:"walk_flip"},
                 walk_flip:{img:_IMAGES['lamb_flip'],start:0,last:3,repeat:true, flip:"walk"},
                 lay: {img:_IMAGES['lamb'],seq:[4,5,6,7,8,9,9,9,9,8],start:0,repeat:false, flip:"lay_flip"},
                 lay_flip: {img:_IMAGES['lamb_flip'],seq:[4,5,6,7,8,9,9,9,9,8],start:0,repeat:false, flip:"lay"}},
        state: "stand",
        update: function() {
            var walking = this._state == "walk" || this._state == "walk_flip";
            var standing = this._state == "stand" || this._state == "stand_flip";
            var laying = this._state == "lay" || this._state == "lay_flip";

            //generate 0 - 99
            var rand = Math.floor(Math.random() * 100);
            var rand2 = Math.floor(Math.random() * 100);
            //determines if state changes 
            var reluctance = ((CUR_HOUR > 19 || CUR_HOUR < 5)) ? -5 : 0;
            reluctance += (laying) ? -9 : 0;
            var percent = 10 + reluctance;
            var change = chance(percent);
            var held = (this.held == undefined) ? false : this.held;

            if (change) {
                this.dx = this.dy = 0;
                var dir = (this.flipped) ? -1 : 1;
                var state = "";
                if (walking || laying) { // walk || lay -> stand
                    state = (this.flipped) ? "stand_flip" : "stand"; 
                } else { // stand -> walk || lay
                    var changeDir = chance(50);
                    if (changeDir) {this.flip()}
                    if (chance(70)) { //switch motion
                        state = (this.flipped) ? "walk_flip" : "walk"; 
                        this.dx += (chance(50))? this.angst * dir : 0;
                        this.dy += (chance(50))? this.angst * dir : 0;
                        if (this.dx == 0 && this.dy == 0) {
                            state = (this.flipped) ? "stand_flip" : "stand"; 
                        }
                    } else { //30 percent
                        state = (this.flipped) ? "lay_flip" : "lay"; 
                    }
                    if (changeDir) { //switch direction 
                        this.dx *= -1;
                        this.dy *= (chance(50))? -1 : 1;
                    }

                }
                this.set_state(state);
            }
  
            //sheep must be updated after super_run
            if (held) {
                this.y = super_run.y + Math.round(Math.random() * 4);
                this.x = super_run.x + Math.round(Math.random());
            } else {
                safeMove(this);
            }
        }};

    gate = new Sprite({ 
         type:"fence",
         x:112,
         y:43,
         width:25,
         height:25,
         depth:2,
         state:"close",
         states: { open: {img:_IMAGES['gate'],start:0,repeat:false},
                   close:{img:_IMAGES['gate'],start:0,repeat:false,reverse:true}},
         update: function() {
             if (this.collide(super_run)) {
                 this.set_state("open");
                 BOUNDS[3].width = 105;
             } else {
                 this.set_state("close");
                 BOUNDS[3].width = 136;
             } 

             if (this._state == "open") {
                 this.depth = -18;
             } else {
                 this.depth = 2;
             }
         }});

   fence_bottom = new Sprite({ 
         type:"fence",
         x:9,
         y:54,
         width:102,
         height:14,
         depth:2,
         state:"idle",
         states: { idle: {img:_IMAGES['fence_bottom'],start:0,repeat:false}},
         update: function() {}}); 


    SPRITES.push(super_run);
    var rand1, rand2;
    for (var i = 0; i < NUM_SHEEP; i++) {
        SHEEP[i] = new Sprite(sheep_obj); 
        rand1 = Math.floor(Math.random() * 10 - 5);
        rand2 = Math.floor(Math.random() * 10 - 5);
        SHEEP[i].x = rand1 + canvas.width/2;
        SHEEP[i].y = rand2 + canvas.height/2;
        SHEEP[i].angst = (Math.random() * 2)|0 + 1;
        SPRITES.push(SHEEP[i]);
    }

    for (var i = 0; i < NUM_FLOWERS; i++) {
        rand1 = Math.floor(Math.random() * canvas.width)
        rand2 = Math.floor(Math.random() * canvas.height)
        FLOWERS[i] = new Sprite(flower_obj);
        FLOWERS[i].x = rand1;
        FLOWERS[i].y = rand2;
        SPRITES.push(FLOWERS[i]);
    }

    for (var i = 0; i < NUM_FIREFLYS; i++) {
        FIREFLYS[i] = new Sprite(firefly_obj);
        rand1 = Math.floor(Math.random() * canvas.width)
        rand2 = Math.floor(Math.random() * canvas.height)
        FIREFLYS[i].x = rand1;
        FIREFLYS[i].y = rand2;
        SPRITES.push(FIREFLYS[i]);
    }

    SPRITES.push(gate);
    SPRITES.push(fence_bottom);

    super_run["carrying"] = [];

    bg();

    for (var i = 1; i < SCALE; i++) {
        setViewpoint(i + 1);
        ctx.save();
        ctx.scale(2,2);
    }

    setInterval(update,100);

}

function sortRules(a, b) {
   if (a.type == "flower" && a.held) {
        return 1;
   } else if (b.type == "flower" && b.held) {
       return -1; 
   } else { 
        var a = a.getIndex();
        var b = b.getIndex();
        if (a < b) {
            return -1;
        } else if (a > b) {
            return 1;
        } else {
            return 0;
        }
   }
}

function draw() {
    SPRITES_INVIEW.sort(sortRules);
    for (var i = 0; i < SPRITES_INVIEW.length; i++) { 
        SPRITES_INVIEW[i].draw();
    } 

    for (var i = 0; i < BOUNDS.length && DEBUG; i++) { 
        ctx.strokeRect(BOUNDS[i].x, BOUNDS[i].y, BOUNDS[i].width, BOUNDS[i].height);
    } 

    darkenViewBy(DARKNESS);
    for (var i = 0; i < FIREFLYS.length && (CUR_HOUR > 19 || CUR_HOUR < 5); i++) { 
        FIREFLYS[i].draw();
    }

}

function update() {


    //SCALING
    if (KEYS_DOWN[KEYS.SHIFT]) {
        if (KEYS_DOWN[KEYS.Z] && SCALE > MINSCALE) {
            SCALE--;
            ctx.restore();
        }
    } else {
        if (KEYS_DOWN[KEYS.Z] && SCALE < 4) { 
            SCALE++;
            ctx.save();
            ctx.scale(2,2);
        }
    }

    super_run.update();
    SPRITES_INVIEW.push(super_run);
    setViewpoint();

    for (var i = 1; i < SPRITES.length; i++) { 
        SPRITES[i].update();
        if (inViewport(SPRITES[i])) {
            SPRITES_INVIEW.push(SPRITES[i]);
        }
    }


    var avgX = 0;
    var avgY = 0;
    for (var i = 0; i < FIREFLYS.length; i++) {
        avgX += FIREFLYS[i].x;
        avgY += FIREFLYS[i].y;
    }
    FIREFLY_LOCUS_X = avgX / FIREFLYS.length;
    FIREFLY_LOCUS_Y = avgY / FIREFLYS.length;

    setDaytime(CUR_HOUR);
        //ctx.strokeRect(VIEW.x, VIEW.y, VIEW.width, VIEW.height);
    //console.log("w: " + VIEW.width + ", h: " + VIEW.height + " x: " + VIEW.x + " y: " + VIEW.y + " scale: " + SCALE);
    
    ctx.save();
    ctx.translate(-VIEW.x, -VIEW.y);
    ctx.clearRect(VIEW.x,VIEW.y,VIEW.width,VIEW.height);
    ctx.drawImage(canvas_bg,VIEW.x,VIEW.y,VIEW.width,VIEW.height,VIEW.x,VIEW.y,VIEW.width,VIEW.height);
    draw();
    SPRITES_INVIEW.length = 0;
    ctx.restore();
}

function clear() {
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    // Will always clear the right space
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
}

function darkenViewBy(x) {
    var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    for (var i = 0; i < imageData.data.length;i) {
            imageData.data[i] = colorShift(imageData.data[i], x, DEG_OF_DARK); 
            i++;
            imageData.data[i] = colorShift(imageData.data[i], x, DEG_OF_DARK); 
            i++;
            imageData.data[i] = colorShift(imageData.data[i], x, DEG_OF_DARK); 
            i+=2;
    }
    ctx.putImageData(imageData,0,0);
}

function colorShift(pixelValue, degree, maxDegree) { 
    var dif = 0;
    var inc = 0;
    var shift = 0;
    if (degree > 0) { 
        dif = 255 - pixelValue;
    } else {
        dif = pixelValue;
    } 
    inc = dif/maxDegree;
    shift = inc * degree;
    return pixelValue + shift;
}

function bg() {
    ctx_bg.drawImage(_IMAGES['grass'],0,0,640,480);
    ctx_bg.drawImage(_IMAGES['fence_top'],9,0,128,12);
    ctx_bg.drawImage(_IMAGES['fence_left'],0,0,9,68);
    ctx_bg.drawImage(_IMAGES['fence_right'],137,0,8,68);
}

function returnRandY() {
    lambY = Math.floor((Math.random()*100)+25);
}

function returnRandX() {
    lambX = Math.floor((Math.random()*250)+25);
}

function printStats() {
    //console.log("dx:" + dx + " dy:" + dy + (_DIRECTION.LEFT ? " <" : " >"));
    console.log("num of sprites on screen " + SPRITES_INVIEW.length);
}

function setViewpoint(scale) {
    scale = (scale == undefined) ? SCALE : scale;
    VIEW.width = canvas.width / Math.pow(2,scale - 1);
    VIEW.height = canvas.height / Math.pow(2,scale - 1);
    VIEW.x = super_run.x - VIEW.width/2;
    VIEW.y = super_run.y - VIEW.height/2
    VIEW.x = Math.max(0,VIEW.x);
    VIEW.y = Math.max(0,VIEW.y);
    VIEW.x = Math.min(VIEW.x, canvas.width - VIEW.width);
    VIEW.y = Math.min(VIEW.y, canvas.height - VIEW.height);
}

function setDaytime(hour) {
    hour = (hour == undefined) ? getLocalTime() : Math.min(Math.max(hour, 0), 23); 
    if (hour < 7) {
        DARKNESS = -(MAX_DARK - hour);
    } else if (hour > 15) { 
        DARKNESS = -(hour - 16);
    } else { 
        DARKNESS = 0;
    }
}

function safeMove(obj) {
    var hit;
    var move = {dx:obj.dx,dy:obj.dy};
    for (var i = 0; i < BOUNDS.length && !hit; i++) {
        COLLIDER.checkMove(obj,BOUNDS[i],move);
    }
    obj.x += move.dx;
    obj.y += move.dy;
}

function inViewport(obj) {
    var collide = COLLIDER.collision(obj, VIEW);
    return collide;
}
