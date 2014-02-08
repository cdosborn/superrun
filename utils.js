var canvas, canvas_bg, ctx, ctx_bg, super_run; 
var NUM_SHEEP = 10;
var DEBUG = false;
var SCALE = 3;
var KEYS_DOWN = {};
var KEYS = {
    SPACE:32,
    LEFT:37,
    RIGHT:39,
    UP:38,
    DOWN:40,
    SHIFT:16,
    A:65,
    D:68,
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
var FLOWERS = [];
var SHEEP = [];

var COLLIDER = {
    //returns collision:bool, side affects call objects with callbacks if collided
    collision : function(first, objs, fst_callback, snd_callback) {
        //if objs is not an array make it one
        if (objs.constructor.name != "Array") { 
            objs = [objs];
        }

        var once = false;
        for (var i = 0; i < objs.length; i++) {
            var second = objs[i];
            var x1 = first.x;
            var x2 = first.x + first.width;
            var y1 = first.y;
            var y2 = first.y + first.height;
            var x3 = second.x;
            var x4 = second.x + second.width;
            var y3 = second.y;
            var y4 = second.y + second.height;
            var collided = ((x3 >= x1 && x3 <= x2) || (x4 >= x1 && x3 <= x2)) && ((y3 >= y1 && y3 <= y2) || (y4 >= y1 && y3 <= y2));
            once = collided || once;
            if (collided) {
                if (fst_callback != undefined) {
                    fst_callback.apply(first,fst_callback.arguments);
                }
                if (snd_callback != undefined) {
                    snd_callback.apply(second,snd_callback.arguments);
                }
            }
        }
        return once;
    }
};


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

function Sprite(attr, obj_index) {
    this.x = attr.x;
    this.y = attr.y;
    this.debugColor = "blue";
    this.width = attr.width;
    this.height = attr.height;
    this.depth = attr.depth;
    this.dx = 0;
    this.dy = 0;
    this.flipped = attr.flipped;
    this.held = attr.held;
    this.obj_index = obj_index;
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

        if (DEBUG) {
            ctx.strokeStyle = this.debugColor;
            ctx.strokeRect(this.x, this.y, this.width, this.height);
            ctx.strokeRect(this.x, this.y + this.height - this.depth/2, this.width, this.depth);
        }
        context.drawImage(anim.img, frame * this.width, 0, this.width, this.height, this.x, this.y, this.width, this.height);
    };
    //This is a pretty neat idea VV worth talking about
    this.set_state = function(state) {
        if (this._state != state) { //setting different state
            var anim = this.states[state];
            this._frame = anim.start;
            this._state = state;
        }
    };
    this.collide = function(other) {
        return COLLIDER.collision(this,other);
    }

    this._state = attr.state;
    this._frame = 0;
    this._index = Math.round(this.y + this.height + this.depth/2);
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
