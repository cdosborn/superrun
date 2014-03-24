var canvas, canvas_bg, ctx, ctx_bg, super_run; 
var DARKNESS = 0;
var DEG_OF_DARK = 10;
var MAX_DARK = 8;
//locus is the center point they revolve around
var FIREFLY_LOCUS_X = Math.floor(Math.random() * 480);
var FIREFLY_LOCUS_Y = Math.floor(Math.random() * 320);

var CUR_HOUR = getLocalTime();
var STARTX = 480/2;
var STARTY = 320/2;
var NUM_SHEEP = 5;
var NUM_FLOWERS = 5;
var NUM_FIREFLYS = 10;
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
    CUR_HOUR = undefined;
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
var FIREFLYS = [];

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
            //ignores collision between picked up objs
            if (second.holder != first) {
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
        }
        return once;
    },
    checkMove: function(first, second, move) {
            var bb = (first.getBoundingBox != undefined)? first.getBoundingBox() : first;
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
    flower: new Image(),
    firefly: new Image(),
    dinosaur_stand: new Image(),
    dinosaur_walk: new Image(),
    dinosaur_eat: new Image()
};

_IMAGES['fence_top'].src =      'images/fence_top.png';
_IMAGES['fence_bottom'].src =   'images/fence_bottom.png';
_IMAGES['fence_left'].src =     'images/fence_left.png';
_IMAGES['fence_right'].src =    'images/fence_right.png';
_IMAGES['firefly'].src =        'images/firefly.png';
_IMAGES['flower'].src =         'images/floweranim.png';
_IMAGES['gate'].src =           'images/gate.png';
_IMAGES['grass'].src =          'images/grass-bg.png';
_IMAGES['lamb'].src =           'images/lamb.png';
_IMAGES['lamb_flip'].src =      'images/lambrs.png';
_IMAGES['superrun'].src =       'images/super.png';
_IMAGES['superrun_flip'].src =  'images/superrs.png';
_IMAGES['dinosaur_stand'].src = 'images/trex-stand.png';
_IMAGES['dinosaur_walk'].src =  'images/trex-walk.png';
_IMAGES['dinosaur_eat'].src =  'images/trex-eat.png';

function Sprite(attr) {
    var me = this;
    me.type = attr.type;
    me.x = attr.x;
    me.y = attr.y;
    if (attr.head) {
        me.head = attr.head;
    }
    if (attr.target) {
        me.target = attr.target;
    }
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
    me.dx = (attr.dx == undefined)? 0 : attr.dx;
    me.dy = (attr.dy == undefined)? 0 : attr.dy;
    me.boid = attr.boid;
    me.flipped = attr.flipped;
    me.holder = attr.holder;
    me.images = attr.images;
    me.states = attr.states;
    me.update = attr.update;
    me.draw = function(context) {
        if (me._state == "ignore") {
            return;
        }
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

      //if (true) {
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
            if (anim == undefined) {
                console.log(me.type);
                console.log(state);
            }
            me._frame = (state == "ignore") ? undefined : anim.start;
            me._state = state;
        }
    };
    me.flip = function() {
        var anim = me.states[me._state];
        if (anim.hasOwnProperty("flip")) {
            me.set_state(anim.flip);
        }
        me.flipped = !me.flipped;
    }
    me.collide = function(other) {
        return COLLIDER.collision(me,other);
    }
    me.getIndex = function() {
        return Math.round(me.y + me.height + me.depth/2);
    }
    me._state = attr.state;
    me._frame = 0;
    me._index = Math.round(me.y + me.height + me.depth/2);
    me.states["ignore"] = {};
}

function getLocalTime() {
    var date = new Date();
    var hour = date.getUTCHours() - date.getTimezoneOffset()/60;
    return (hour < 0) ? 24 + hour : hour;
}

//takes a percentage and rolls the dice
function chance(percentage) {
    var rand = (Math.random() * 100)|0;
    return rand < percentage;
}

//move to tests file
function testChance(per, n) {
    var sum = 0;
    for(var i = 0; i < n; i++) {
       if (chance(per)) {
           sum++;
       } 
    }
    console.log("tested " + per + "% chance " + n + " times: " + (sum / n * 100) + "%");
}

//returns smallest signed distance between two rects
//if second comes before first horizontally dx < 0
function distanceBetween(first, second) {
    var x1,x2,x3,x4,y1,y2,y3,y4;
    var xL,xM,xR,yB,yM,yT;
    //xLeft, xRight, yTop, yBottom
    x1 = first.x;
    x2 = first.x + first.width;
    y1 = first.y;
    y2 = first.y + first.height;
    x3 = second.x;
    x4 = second.x + second.width;
    y3 = second.y;
    y4 = second.y + second.height;
    xL = x1 < x3;
    xM = (x1 >= x3 && x2 <= x4) || (x1 <= x3 && x2 >= x4);
    xR = x2 > x4;
    yT = y1 < y3;
    yM = (y1 >= y3 && y2 <= y4) || (y1 <= y3 && y2 >= y4);
    yB = y2 > y4;
    both = (xL || xR || xM) && (yT || yB || yM);

    var xDif = 0, yDif = 0;

    if (xL && xR && yB && yT) {//9
        //center
    } else if (xL && yM) {//4
        //left-center
        xDif = x3 - x2;
    } else if (xR && yM) {//5
        //right-center  
        xDif = x4 - x1;
    } else if (xM && yT) { //2
        //up-center
        yDif = y3 - y2;
    } else if (xM && yB) { //7
        ///bottom-center
        yDif = y4 - y1;
    } else if (xL && yT)  { // 1
        //upper-left
        xDif = x3 - x2;
        yDif = y3 - y2;
    } else if (xR && yT)  { //3
        //upper-right
        xDif = x4 - x1;
        yDif = y3 - y2;
    } else if (xL && yB) { //6
        //bottom-left
        xDif = x3 - x2;
        yDif = -(y1 - y4);
    } else if (xR && yB) { //8
        //bottom-right
        xDif = x4 - x1;
        yDif = -(y1 - y4);
    }

    //console.log("dx: " + xDif + " dy: " + yDif);
     
    return {
        dx:xDif,
        dy:yDif
    }
}
