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

    REND.width = 240;
    REND.height= 160;

    super_run = new Sprite( {
        debugColor:"blue",
        x:canvas.width/2,
        y:canvas.height/2,
        width:11,
        height:16,
        depth:2,
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
            }
            if (KEYS_DOWN[KEYS.UP] && this.dy > -4) {
                this.dy--;
            }

            //On key change instantly head that direction
            if (KEYS_DOWN[KEYS.LEFT] && this.dx > 0) {
                this.dx *= -1;
            }
            if (KEYS_DOWN[KEYS.RIGHT] && this.dx < 0) {
                this.dx *= -1;
            }

            // Decrease veolcity when keys not pressed or both pressed
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
            } else  if (this.dx > 0 || (this.dx == 0 && Math.abs(this.dy) > 0  && !this.flipped)) {
                this.set_state("walk");
            } else if (this.dx < 0 || (this.dx == 0 && Math.abs(this.dy) > 0 )) {
                this.set_state("walk_flip");
            } else if (!this.flipped) { //dx == 0
                this.set_state("stand");
            } else if (this.flipped) {
                this.set_state("stand_flip");
            }

            this.flipped = !(this._state == "walk" || this._state == "stand" || this._state == "pick_up");
            this.y += this.dy; 
            this.x += this.dx;


            if (this.collide(gate)){
                this.debugColor = "red";
            } else {
                this.debugColor = "blue";
            }
            
            this._index = Math.round(this.y + this.height + this.depth/2);

        }});

    var flower_obj = {
        flipped:false,
        width:7,
        height:9,
        depth:1,
        states: {growing: {img:_IMAGES['flower'],start:0,repeat:false}},
        state: "growing",
        update: function(){
            this._index = Math.round(this.y + this.height + this.depth/2);
        }};


    var sheep_obj = {
        flipped:false,
        width:12,
        height:9,
        depth:2,
        angst:1,
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

            this._index = Math.round(this.y + this.height + this.depth/2);
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
             } else {
                 this.set_state("close");
             } 

             if (this._state == "open") {
                 this.depth = -18;
             } else {
                 this.depth = 2;
             }
             this._index = Math.round(this.y + this.height + this.depth/2);
         }});

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
        if (a._index < b._index) {
            return -1;
        } else if (a._index > b._index) {
            return 1;
        } else {
            return 0;
        }
    });
    for (var i = 0; i < SPRITES.length; i++) { 
        SPRITES[i].draw();
    } 
}

function update() {
    for (var i = 0; i < SPRITES.length; i++) { 
        SPRITES[i].update();
    }

    //SCALING
    if (KEYS_DOWN[KEYS.SHIFT]) {
        if (KEYS_DOWN[KEYS.Z] && SCALE > 2) {
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
    ctx.clearRect(REND.x,REND.y,REND.width,REND.height);
    ctx.drawImage(canvas_bg,REND.x,REND.y,REND.width,REND.height,REND.x,REND.y,REND.width,REND.height);
    draw();
    ctx.drawImage(_IMAGES['fence_bottom'],9,54,102,14);
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

    REND.x = super_run.x - REND.width/2;
    REND.y = super_run.y - REND.height/2;

    VIEW.width = canvas.width / Math.pow(2,scale - 1);
    VIEW.height = canvas.height / Math.pow(2,scale - 1);

    VIEW.x = super_run.x - VIEW.width/2;
    VIEW.y = super_run.y - VIEW.height/2

    VIEW.x = Math.max(0,VIEW.x);
    VIEW.y = Math.max(0,VIEW.y);
    VIEW.x = Math.min(VIEW.x, canvas.width - VIEW.width);
    VIEW.y = Math.min(VIEW.y, canvas.height - VIEW.height);

    REND.x = Math.max(0,REND.x);
    REND.y = Math.max(0,REND.y);
    REND.x = Math.min(REND.x, canvas.width - REND.width);
    REND.y = Math.min(REND.y, canvas.height - REND.height);

}



window.onload = init;
