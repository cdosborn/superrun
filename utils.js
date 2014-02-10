var canvas, canvas_bg, ctx, ctx_bg, super_run; 
var STARTX = 480/2;
var STARTY = 320/2;
var NUM_SHEEP = 25;
var DEBUG = false;
var MINSCALE = 1;
var SCALE = 2;
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

var SPRITES_INVIEW = [];
var BOUNDS = [
  //left fence
  {x:9,y:0,width:1,height:68},
  //right fence
  {x:136,y:0,width:8,height:68},
  //back fence
  {x:9,y:12,width:127,height:1},
  //front fence
  {x:0,y:68,width:111,height:1},
  //behind gate
  {x:127,y:50,width:8,height:9},
  //left canvas
  {x:-10,y:0,width:10,height:320},
  //right canvas
  {x:480,y:0,width:10,height:320},
  //top canvas
  {x:0,y:-10,width:480,height:10},
  //bottom canvas
  {x:0,y:320,width:480,height:10}
];

if (DEBUG) {
    NUM_SHEEP = 0;
    BOUNDS.push({x:100, y:100, width: 50, height:1});

}

var VIEW = {
    x:0,
    y:0,
    width:0,
    height:0
};

var SPRITES = [];
var FLOWERS = [];
var SHEEP = [];

var COLLIDER = {
    //returns collision:bool, side affects call objects with callbacks if collided
    collision: function(first, objs, fst_callback, snd_callback) {
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
    },
    checkMove: function(first, second, move) {
            var bb = first.getBoundingBox();
            var oldDx = move.dx;
            var oldDy = move.dy;
            var dx = first.dx;
            var dy = first.dy;
            var x1 = bb.x + move.dx;
            var x2 = bb.x + move.dx + bb.width;
            var y1 = bb.y + move.dy;
            var y2 = bb.y + move.dy + bb.height;
            var x3 = second.x;
            var x4 = second.x + second.width;
            var y3 = second.y;
            var y4 = second.y + second.height;
            //xLeft, xRight, yTop, yBottom
            var xL = (x3 >= x1 && x3 <= x2);
            var xM = (x1 >= x3 && x2 <= x4) || (x1 <= x3 && x2 >= x4);
            var xR = (x4 >= x1 && x4 <= x2);
            var yT = (y3 >= y1 && y3 <= y2);
            var yM = (y1 >= y3 && y2 <= y4) || (y1 <= y3 && y2 >= y4);
            var yB = (y4 >= y1 && y4 <= y2);
            var both = (xL || xR || xM) && (yT || yB || yM);
            var state = "";
            x1 = bb.x;
            x2 = bb.x + bb.width;
            y1 = bb.y;
            y2 = bb.y + bb.height;
            xL = x1 < x3;
            xM = (x1 >= x3 && x2 <= x4) || (x1 <= x3 && x2 >= x4);
            xR = x2 > x4;
            yT = y1 < y3;
            yM = (y1 >= y3 && y2 <= y4) || (y1 <= y3 && y2 >= y4);
            yB = y2 > y4;
            //state += (xL) ? "xL " : "";
            //state += (xR) ? "xR " : "";
            //state += (xM) ? "xM " : "";
            //state += (yT) ? "yT " : "";
            //state += (yB) ? "yB " : "";
            //state += (yM) ? "yM " : "";
            //console.log(state);

            if (both) {
                var xDif,yDif;
                xDif = move.dx;
                yDif = move.dy;

                if (xL && xR && yB && yT) {//9
                    //center
                    state += "9";
                } else if (xL && yM) {//4
                    //left-center
                    xDif = x3 - x2;
                    state += "4";
                } else if (xR && yM) {//5
                    //right-center  
                    xDif = x4 - x1;
                    state += "5";
                } else if (xM && yT) { //2
                    //up-center
                    yDif = y3 - y2;
                    state += "2";
                } else if (xM && yB) { //7
                    ///bottom-center
                    yDif = y4 - y1;
                    state += "7";
                } else if (xL && yT)  { // 1
                    //upper-left
                    state += "1";
                    xDif = x3 - x2;
                    yDif = y3 - y2;
                } else if (xR && yT)  { //3
                    //upper-right
                    state += "3";
                    xDif = x4 - x1;
                    yDif = y3 - y2;
                } else if (xL && yB) { //6
                    state += "6";
                    //bottom-left
                    xDif = x3 - x2;
                    yDif = -(y1 - y4);
                } else if (xR && yB) { //8
                    state += "8";
                    //bottom-right
                    xDif = x4 - x1;
                    yDif = -(y1 - y4);
                }

                var xDifAbs = Math.abs(xDif); 
                var yDifAbs = Math.abs(yDif); 
                var xOldDifAbs = Math.abs(oldDx); 
                var yOldDifAbs = Math.abs(oldDy); 

                if (xDifAbs > yDifAbs) {
                    move.dy = yDif; 
                } else if ( xDifAbs < yDifAbs) {
                    move.dx = xDif; 
                } else {
                    move.dx = xDif; 
                    move.dy = yDif; 
                }

                //console.log("y overlap " + yDif);
                //console.log("x overlap " + xDif);

                if (xDifAbs < xOldDifAbs) {
                    move.dx = xDif;
                }

                if (yDifAbs < yOldDifAbs) {
                    move.dy = yDif;
                }
                //console.log("dx " + move.dx);
                //console.log("yx " + move.dy);

            }
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
_IMAGES['flower'].src = 'images/floweranim.png';
_IMAGES['gate'].src = 'images/gate.png';
_IMAGES['grass'].src = 'images/grass-bg.png';
_IMAGES['lamb'].src = 'images/lamb.png';
_IMAGES['lamb_flip'].src = 'images/lambrs.png';
_IMAGES['superrun'].src = 'images/super.png';
_IMAGES['superrun_flip'].src = 'images/superrs.png';

function Sprite(attr, obj_index) {
    var me = this;
    me.x = attr.x;
    me.y = attr.y;
    me.debugColor = "blue";
    me.width = attr.width;
    me.height = attr.height;
    me.depth = attr.depth;
    me.getBoundingBox = function() {
        return {
            x:me.x, 
            y:me.y + me.height - me.depth/2,
            width:me.width,
            height:me.depth
        };
    };
    me.dx = 0;
    me.dy = 0;
    me.flipped = attr.flipped;
    me.held = attr.held;
    me.obj_index = obj_index;
    me.images = attr.images;
    me.states = attr.states;
    me.update = attr.update;
    me.draw = function(context) {
        context = (context == undefined) ? ctx : context; 
        var anim = me.states[me._state];
        if (anim.seq != undefined) {
            anim.last = anim.seq.length - 1;
            anim.start = 0;
        } else if (anim.last == undefined) {
            anim.last = anim.img.width / me.width - 1;
            //console.log(anim.last);
        }

        if (me._frame != anim.last ) {
            me._frame += 1;
        } else if (anim.repeat) {
            me._frame = anim.start;
        } 

        var frame;
        if (anim.reverse) {
            frame = anim.last - me._frame;
        } else {
            frame = me._frame;
        }

      //if (DEBUG) {
      //    ctx.strokeStyle = me.debugColor;
      //    var box = me.getBoundingBox();
      //    ctx.strokeRect(box.x, box.y, box.width, box.height);
      //    ctx.strokeRect(me.x, me.y, me.width, me.height);
      //}

        // if frame sequence
        if (anim.seq != undefined) {
            frame = anim.seq[me._frame];
        }
        context.drawImage(anim.img, frame * me.width, 0, me.width, me.height, me.x, me.y, me.width, me.height);
    };
    //This is a pretty neat idea VV worth talking about
    me.set_state = function(state) {
        if (me._state != state) { //setting different state
            var anim = me.states[state];
            me._frame = anim.start;
            me._state = state;
        }
    };
    me.collide = function(other) {
        return COLLIDER.collision(me,other);
    }
    me.getIndex = function() {
        return Math.round(me.y + me.height + me.depth/2);
    }
    me._state = attr.state;
    me._frame = 0;
    me._index = Math.round(me.y + me.height + me.depth/2);
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
