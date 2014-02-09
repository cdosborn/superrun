function init() {
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

    super_run = new Sprite( {
        debugColor:"blue",
        x:STARTX,
        y:STARTY,
        width:11,
        height:16,
        depth:3,
        flipped:false,
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
                var state = (!this.flipped) ? "pick_up" : "pick_up_flip";
                this.set_state(state);
                COLLIDER.collision(this, SHEEP, 
                        function() {this.dx = this.dy = 0;}, 
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
            } else if (KEYS_DOWN[KEYS.D]) { //"D(ROP)"
                var lamb = this.carrying[this.carrying.length - 1];
                if (lamb != undefined) {
                    lamb["held"] = false;
                    lamb.y = super_run.y + super_run.height - lamb.height;
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

            this.flipped = !(this._state == "walk" || this._state == "stand" || this._state == "pick_up");

            safeMove(this);

//          if (this.collide(gate)){
//              this.debugColor = "red";
//          } else {
//              this.debugColor = "blue";
//          }

        }});

    var flower_obj = {
        flipped:false,
        width:7,
        height:9,
        depth:1,
        states: {growing: {img:_IMAGES['flower'],start:0,repeat:false}},
        state: "growing",
        update: function(){
        }};


    var sheep_obj = {
        flipped:false,
        width:12,
        height:9,
        depth:4,
        angst:1,
        states: {stand: {img:_IMAGES['lamb'],start:0,last:0,repeat:true},
                 stand_flip: {img:_IMAGES['lamb_flip'],start:0,last:0,repeat:true},
                 walk: {img:_IMAGES['lamb'],start:0,last:3,repeat:true},
                 walk_flip:{img:_IMAGES['lamb_flip'],start:0,last:3,repeat:true},
                 lay: {img:_IMAGES['lamb'],seq:[4,5,6,7,8,9,9,9,9,8],start:0,repeat:false},
                 lay_flip: {img:_IMAGES['lamb_flip'],seq:[4,5,6,7,8,9,9,9,9,8],start:0,repeat:false}},
        state: "stand",
        update: function() {
            //generate 0 - 99
            var rand = Math.floor(Math.random() * 100);
            var rand2 = Math.floor(Math.random() * 100);
            //determines if state changes 
            var reluctance = (this._state == "lay" || this._state == "lay_flip") ? rand2 % 25 : 1;
            var change = rand % 10 == 0;
            var walking = this._state == "walk" || this._state == "walk_flip";
            var held = (this.held == undefined) ? false : this.held;
            if (change) {
                this.dx = this.dy = 0;
                if (walking) { // walk -> stand
                    var state = (this.flipped) ? "stand_flip" : "stand"; 
                    this.set_state(state);
                } else if (rand % 15 == 0 )  { // flipped -> not flipped
                    var state = (!this.flipped) ? "stand_flip" : "stand"; 
                    this.set_state(state);
                } else if (rand2 % 10 == 0 && this.angst == 1 && !held) {
                    var state = (this.flipped) ? "lay_flip" : "lay"; 
                    this.set_state(state);
                } else { //swap motion state, ex. stand -> walk, stand -> lay
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
                //fix to be more efficient
                this.flipped = !(this._state == "walk" || this._state == "stand" || this._state == "lay");
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
                 BOUNDS[3].width = 111;
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
         x:9,
         y:54,
         width:102,
         height:14,
         depth:2,
         state:"idle",
         states: { idle: {img:_IMAGES['fence_bottom'],start:0,repeat:false}},
         update: function() {}}); 

    for (var i = 0; i < NUM_SHEEP; i++) {
        SHEEP[i] = new Sprite(sheep_obj); 
        var rand1 = Math.floor(Math.random() * 10 - 5);
        var rand2 = Math.floor(Math.random() * 10 - 5);
        SHEEP[i].x = rand1 + canvas.width/2;
        SHEEP[i].y = rand2 + canvas.height/2;
        SHEEP[i].angst = Math.floor(Math.random() * 2 + 1);

        rand1 = Math.floor(Math.random() * canvas.width)
        rand2 = Math.floor(Math.random() * canvas.height)
        FLOWERS[i] = new Sprite(flower_obj);
        FLOWERS[i].x = rand1;
        FLOWERS[i].y = rand2;

        SPRITES.push(SHEEP[i]);
        SPRITES.push(FLOWERS[i]);
    }

    SPRITES.push(super_run);
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

function draw() {
    SPRITES.sort(function(a, b) {
        var a = a.getIndex();
        var b = b.getIndex();
        if (a < b) {
            return -1;
        } else if (a > b) {
            return 1;
        } else {
            return 0;
        }
    });
    for (var i = 0; i < SPRITES.length; i++) { 
        SPRITES[i].draw();
    } 
    for (var i = 0; i < BOUNDS.length && DEBUG; i++) { 
        ctx.strokeRect(BOUNDS[i].x, BOUNDS[i].y, BOUNDS[i].width, BOUNDS[i].height);
    } 
}
function update() {
    super_run.update();
    gate.update();
    for (var i = 0; i < SHEEP.length; i++) { 
        SHEEP[i].update();
    }
    for (var i = 0; i < SHEEP.length; i++) { 
        FLOWERS[i].update();
    }

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

    //ctx.strokeRect(VIEW.x, VIEW.y, VIEW.width, VIEW.height);
    //console.log("w: " + VIEW.width + ", h: " + VIEW.height + " x: " + VIEW.x + " y: " + VIEW.y + " scale: " + SCALE);
    
    setViewpoint(SCALE);
    ctx.save();
    ctx.translate(-VIEW.x, -VIEW.y);
    ctx.clearRect(VIEW.x,VIEW.y,VIEW.width,VIEW.height);
    ctx.drawImage(canvas_bg,VIEW.x,VIEW.y,VIEW.width,VIEW.height,VIEW.x,VIEW.y,VIEW.width,VIEW.height);
    draw();
    ctx.restore();
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
    ctx_bg.drawImage(_IMAGES['fence_top'],9,0,128,12);
    ctx_bg.drawImage(_IMAGES['fence_left'],0,0,9,68);
    ctx_bg.drawImage(_IMAGES['fence_right'],137,0,8,68);
}

function fg() {}

function returnRandY() {
    lambY = Math.floor((Math.random()*100)+25);
}

function returnRandX() {
    lambX = Math.floor((Math.random()*250)+25);
}

function printStats() {
    console.log("dx:" + dx + " dy:" + dy + (_DIRECTION.LEFT ? " <" : " >"));
}

function setViewpoint(scale) {
    VIEW.width = canvas.width / Math.pow(2,scale - 1);
    VIEW.height = canvas.height / Math.pow(2,scale - 1);
    VIEW.x = super_run.x - VIEW.width/2;
    VIEW.y = super_run.y - VIEW.height/2
    VIEW.x = Math.max(0,VIEW.x);
    VIEW.y = Math.max(0,VIEW.y);
    VIEW.x = Math.min(VIEW.x, canvas.width - VIEW.width);
    VIEW.y = Math.min(VIEW.y, canvas.height - VIEW.height);
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


window.onload = init;
