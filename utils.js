var canvas, canvas_bg, ctx, ctx_bg; 
var NUM_SHEEP = 100;
var SCALE = 2;
var KEYS_DOWN = {};
var KEYS = {
    SPACE:32,
    LEFT:37,
    RIGHT:39,
    UP:38,
    DOWN:40,
    SHIFT:16,
    Z:90
};
var VIEW = {
    x:0,
    y:0,
    width:0,
    height:0
}

var SPRITES = [];

function keyPressed(e) {
    KEYS_DOWN[e.keyCode] = true;
    if([32, 37, 38, 39, 40].indexOf(e.keyCode) > -1) {
        e.preventDefault();
    }
};

function keyReleased(e) {
    KEYS_DOWN[e.keyCode] = false;
};

var _COLORS = {};
var _IMAGES = {
    fence: new Image(),
    gate: new Image(),
    superrun: new Image(),
    superrun_flip: new Image(),
    grass: new Image(),
    lamb: new Image(),
    lamb_flip: new Image()
};

_IMAGES['fence'].src = 'images/fence.png';
_IMAGES['gate'].src = 'images/frontfence.png';
_IMAGES['superrun'].src = 'images/super.png';
_IMAGES['superrun_flip'].src = 'images/superrs.png';
_IMAGES['grass'].src = 'images/grass-bg.png';
_IMAGES['lamb'].src = 'images/lamb.png';
_IMAGES['lamb_flip'].src = 'images/lambrs.png';


//idle state?? no draw
function Sprite(attr) {
    this.x = attr.x;
    this.y = attr.y;
    this.width = attr.width;
    this.height = attr.height;
    this.dx = 0;
    this.dy = 0;
    this.flipped = attr.flipped;
    this.held = attr.held;
    this.index = attr.index;
    this.images = attr.images;
    this.states = attr.states;
    this.update = attr.update;
    this.draw = function(context) {
        context = (context === undefined) ? ctx : context; 
        var anim = this.states[this._state];
        if (anim.last === undefined) {
            anim.last = anim.img.width / this.width - 1;
        }
        if (this._frame != anim.last ) {
            this._frame += 1;
        } else if (anim.repeat) {
            this._frame = anim.start;
        }
        context.drawImage(anim.img, this._frame * this.width, 0, this.width, this.height, this.x, this.y, this.width, this.height);
    };
    //This is a pretty neat idea VV worth talking about
    this.set_state = function(state) {
        if (this._state != state) {
            var anim = this.states[state];
            this._frame = anim.start;
            this._state = state;
        }
    };
    this.collide

    this._state = attr.state;
    this._frame = 0;
    //this._idle = true;


}

function fence() {
    if (openGate) {
        ctx.drawImage(_IMAGES['fence'],gateFrame * 147,0,147,66,7,2,147,66);
        gateFrame--;
        if (gateFrame<0) {gateFrame=0;}
    } else {
        ctx.drawImage(_IMAGES['fence'],gateFrame * 147,0,147,66,7,2,147,66);
        gateFrame++;
        if (gateFrame>3) {gateFrame=3;}

    }
}

function lamb() {	
    ctx.drawImage(_IMAGES['lamb'],(lambFrame * 12),0,12,9,lambX,lambY,12,9);
    lambFrame++;
    if(lambFrame>3) {lambFrame=0;}	
}



var gate = new Sprite( {
        x:0,
        y:0,
        index:0,
        states: {open: {img:_IMAGES['gate'],height:16,width:11,start:0,last:0,repeat:false},
                 close:{img:_IMAGES['gate'],height:16,width:11,start:6,last:0,repeat:false}},
        state: "stand",
        update: function() {
            if (KEYS_DOWN[KEYS.LEFT] && this.dx > -3) {
                this.dx--;
            }
            if (KEYS_DOWN[KEYS.RIGHT] && this.dx < 3) {
                this.dx++;
            }
            if (KEYS_DOWN[KEYS.DOWN] && this.dy < 3) {
                this.dy++;
            }
            if (KEYS_DOWN[KEYS.UP] && this.dy > -3) {
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

var lambFrame=0;
var gateFrame=3;
var superFrame=0;
var superKneelFrame=6;

var currentlyFlipped = false;
var lambFlipped = false;
var openGate = false;
var moving = false;
var kneeling = false;
var lambIsAttached = false;
var x = 100;
var y = 100;
var lambX = 200;
var lambY = 100;
var dx = 0;
var dy = 0;
var distX=0;
var distY=0;
var sector;


console.log("SECOND");
