var canvas, canvas_bg, ctx, ctx_bg; 
var NUM_SHEEP = 4;
var DEBUG = true;
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
var REND = {
    x:0,
    y:0,
    width:0,
    height:0
}

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
    fence_top: new Image(),
    fence_bottom: new Image(),
    fence_left: new Image(),
    fence_right: new Image(),
    gate: new Image(),
    superrun: new Image(),
    superrun_flip: new Image(),
    grass: new Image(),
    lamb: new Image(),
    lamb_flip: new Image(),
    flower: new Image()
};

_IMAGES['fence_top'].src = 'images/fence_top.png';
_IMAGES['fence_bottom'].src = 'images/fence_bottom.png';
_IMAGES['fence_left'].src = 'images/fence_left.png';
_IMAGES['fence_right'].src = 'images/fence_right.png';
_IMAGES['gate'].src = 'images/gate.png';
_IMAGES['superrun'].src = 'images/super.png';
_IMAGES['superrun_flip'].src = 'images/superrs.png';
_IMAGES['grass'].src = 'images/grass-bg.png';
_IMAGES['lamb'].src = 'images/lamb.png';
_IMAGES['lamb_flip'].src = 'images/lambrs.png';
_IMAGES['flower'].src = 'images/floweranim.png';

function Sprite(attr) {
    this.x = attr.x;
    this.y = attr.y;
    this.debugColor = "blue";
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

        var frame;
        if (anim.reverse) {
            frame = anim.last - this._frame;
        } else {
            frame = this._frame;
        }

        ctx.strokeStyle = this.debugColor;
        ctx.strokeRect(this.x, this.y, this.width, this.height);
        context.drawImage(anim.img, frame * this.width, 0, this.width, this.height, this.x, this.y, this.width, this.height);
    };
    //This is a pretty neat idea VV worth talking about
    this.set_state = function(state) {
        if (this._state != state) {
            var anim = this.states[state];
            this._frame = anim.start;
            this._state = state;
        }
    };
    this.collide = function(other) {
        var x1 = this.x;
        var x2 = this.x + this.width;
        var y1 = this.y;
        var y2 = this.y + this.height;
        var x3 = other.x;
        var x4 = other.x + other.width;
        var y3 = other.y;
        var y4 = other.y + other.height;
        return ((x3 >= x1 && x3 <= x2) || (x4 >= x1 && x3 <= x2)) && ((y3 >= y1 && y3 <= y2) || (y4 >= y1 && y3 <= y2))
    }

    this._state = attr.state;
    this._frame = 0;
    //this._idle = true;


}



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
