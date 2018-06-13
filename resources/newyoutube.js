var socket = io.connect();
var show_path = false;
var show_mouse = false;

const UP = 0,
    DOWN = 1,
    LEFT = 2,
    RIGHT = 3;

var currBtn = new Array(4).fill(null);
var isShown = new Array(4).fill(false);

var tester;
var type;
var platform;

const DEFAULT_TRIAL_NUM = 10;
var trial_num = DEFAULT_TRIAL_NUM;

var clicked_button, target_btn, gesture;
var buttons = document.getElementsByTagName('button');

var already = new Array(buttons.length).fill(0);
var TimeStart = new Date().getTime();
var TimeEnd = new Date().getTime();

var touch_timer, new_path, prevX, prevY;
var c = document.getElementById("canvas");
var cxt = c.getContext("2d");
var server_width = document.documentElement.clientWidth;
var server_height = document.documentElement.clientHeight;
var client_width, client_height;

var LockerTimeEnd = new Array(buttons.length).fill(0.0);
var LockerTimeStart = new Array(buttons.length).fill(0.0);
var theTimeInterval = 0.0;


var postBtnId = new Array(4).fill(0);
var touchLock = false;
var trialTimer;

var imgSet;
const img_prefix = 'http://localhost:3000/resources/';
const swipeImages = {
    up: img_prefix + 'arrow_0.png',
    down: img_prefix + 'arrow_1.png',
    left: img_prefix + 'arrow_2.png',
    right: img_prefix + 'arrow_3.png'
};
const tapImages = {
    up: img_prefix + 'tap_topright.png',
    down: img_prefix + 'tap_bottomleft.png',
    left: img_prefix + 'tap_topleft.png',
    right: img_prefix + 'tap_bottomright.png'
};

var pgBar = $('#circle');
pgBar.circleProgress({
    startAngle: -Math.PI / 4 * 2,
    value: 0.0,
    size: 50,
    lineCap: 'round',
    fill: { gradient: ['#0681c4', '#4ac5f8'] },
});
const timeTd = 330;
var outNum = 0;


$(document).keyup((e) => {
    // key "enter"
    if (e.which === 32) {
        socket.emit('start');
        trial_num = DEFAULT_TRIAL_NUM;
        showTarget();
    } else if (e.which === 69) // key "e"
        show_mouse = !show_mouse;
    else if (e.which === 80) // key "p"
        show_path = !show_path;
})

$(document).mousemove((e) => {
    if (show_mouse)
        changePos(e.pageX, e.pageY);
});

$(document).on('click', 'button', (function(e) {
    console.log("click!!");
    $(this).addClass('clicked');
    clicked_btn = $(this).parent().attr('id');
    log();
    LockerTimeEnd.fill(0.0);
    LockerTimeStart.fill(0.0);
    if ($(this).hasClass('target')) {
        $(this).removeClass('target');
        showTarget();
    }
    setTimeout(() => {
        $(this).removeClass('clicked');
    }, 500);
}));

socket.on('start_mobile', () => {
    console.log('START_MOBILE');
    trial_num = DEFAULT_TRIAL_NUM;
    showTarget();
});

socket.on('eyemove', (x, y) => {
    changePos(x * 1.11, y * 1.11);
});

socket.on('swipe', (dirStr) => {
    gesture = dir;
    var dir;
    if (dirStr == 'up') dir = UP;
    else if (dirStr == 'down') dir = DOWN;
    else if (dirStr == 'left') dir = LEFT;
    else if (dirStr == 'right') dir = RIGHT;
    enableClick(dir);
    swipeAndUnlock(dir);
});

socket.on('tap', (pos) => {
    gesture = pos;
    if (pos === 'topright' && isShown[0]) currBtn[0].click();
    if (pos === 'bottomleft' && isShown[1]) currBtn[1].click();
    if (pos === 'topleft' && isShown[2]) currBtn[2].click();
    if (pos === 'bottomright' && isShown[3]) currBtn[3].click();
});

socket.on('touch', (touch) => {
    touchLock = true
    if (show_path) {
        changePath(touch.x, touch.y);
        clearTimeout(touch_timer);
        touch_timer = setTimeout(clearCanvas, 300);
    }
});

socket.on('init', (method) => {
    type = method;
    console.log(type);
    if (type === 'swipe') imgSet = swipeImages;
    else if (type === 'tap') imgSet = tapImages;
});

socket.on('client_init', (width, height) => {
    client_width = width;
    client_height = height;
});

socket.on('user', (user) => {
    tester = user;
    console.log(tester);
});

socket.on('device', (device) => {
    platform = device;
    console.log(platform);
    if (platform === 'mobile') {
        socket.on('start_mobile', () => {
            console.log('START_MOBILE');
            trial_num = DEFAULT_TRIAL_NUM;
            AssignTargetAlgo();
            showTarget();
        });
        if (type === 'swipe') enableSwipe();
    }
});


function log() {
    cnt = DEFAULT_TRIAL_NUM - trial_num;
    console.log(gesture + ' ' + clicked_btn + ' ' + target_btn);
    socket.emit('log', cnt, gesture, clicked_btn, target_btn);
}

function getBtnType(btn) {
    if (imgSet["up"] == btn.children[0].src) return UP;
    else if (imgSet["down"] == btn.children[0].src) return DOWN;
    else if (imgSet["left"] == btn.children[0].src) return LEFT;
    else if (imgSet["right"] == btn.children[0].src) return RIGHT;
    return -1;
}

function overlap(element, X, Y) {
    var top = $(element).offset().top;
    var left = $(element).offset().left;
    var right = Number($(element).offset().left) + Number($(element).width());
    var bottom = Number($(element).offset().top) + Number($(element).height());
    var threshold;

    if (type === 'dwell') threshold = 0;
    else threshold = RADIUS;
    // in the element
    if (X >= left && X <= right && Y >= top && Y <= bottom) return true;
    else if (X < left && Y >= top && Y <= bottom) return (left - X) <= threshold;
    else if (X > right && Y >= top && Y <= bottom) return (X - right) <= threshold;
    else if (X >= left && X <= right && Y < top) return (top - Y) <= threshold;
    else if (X >= left && X <= right && Y > bottom) return (Y - bottom) <= threshold;
    else if (Math.pow((X - left), 2) + Math.pow((Y - top), 2) <= threshold * threshold)
        return true;
    else if (Math.pow((X - left), 2) + Math.pow((Y - bottom), 2) <= threshold * threshold)
        return true;
    else if (Math.pow((X - right), 2) + Math.pow((Y - top), 2) <= threshold * threshold)
        return true;
    else if (Math.pow((X - right), 2) + Math.pow((Y - bottom), 2) <= threshold * threshold)
        return true;
    return false;
}

function distance(element, X, Y) {
    // use jQuery to get ABSOLUTE position
    var midX = $(element).offset().left + 0.5 * element.offsetWidth;
    var midY = $(element).offset().top + 0.5 * element.offsetHeight;
    return (Math.pow((X - midX), 2) + Math.pow((Y - midY), 2));
}

function swap(x, y) {
    return [y, x];
}

function isIn(x, arr, len) {
    for (var i = 0; i < len; i++)
        if (x == arr[i]) return true;
    return false;
}

function changePos(eyeX, eyeY) {

    if (touchLock) return;
    $('#eye_tracker').css({
        "left": eyeX,
        "top": eyeY
    });

    $('#canvas_container').css({
        "left": eyeX - 700,
        "top": eyeY - 500
    });

    isShown.fill(false);

    // the candidates are the nearest [up, down, left, right]
    var btn_num = buttons.length;
    var candidate = new Array(4).fill(-1);
    var dist = new Array(4).fill(5000000);

    // Dwell time locker reset
    // DwellLockerReset(eyeX, eyeY);

    // for each type of gesture, put the nearest's index in candidate[]
    if (type === 'swipe') {
        for (var i = 0; i < btn_num; i++) {
            var btn = buttons[i];
            if (overlap(btn, eyeX, eyeY)) {
                var curr_dist = distance(btn, eyeX, eyeY);
                for (var j = 0; j < 4; j++) {
                    if (getBtnType(btn) == j && curr_dist < dist[j]) {
                        candidate[j] = i;
                        dist[j] = curr_dist;
                    }
                }
            }
        }
    } else if (type === 'dwell') {
        if (outNum >= btn_num) {
            pgBar.circleProgress({ 'value': 0.0, animation: { duration: 10 } });
            outNum = 0;
        }
    }
    for (var i = 0; i < btn_num; i++) {
        var btn = buttons[i];

        if (type === 'dwell') {
            if (overlap(btn, eyeX, eyeY)) {
                if (already[i]) { // Have already looked at the target
                    TimeEnd = Date.now(); // Record time then
                } else {
                    already[i] = 1; //First time to look at the target
                    TimeStart = Date.now(); // Record time then
                    pgBar.circleProgress({ 'value': 1.0, animation: { duration: timeTd + 20 } });
                }

                if (already[i] == 1 && TimeEnd - TimeStart > timeTd) {
                    clickablebtn = btn;
                    clickablebtn.click();
                    console.log("Selection Success!!");
                    already[i] = 0; // reinitialize
                    pgBar.circleProgress({ 'value': 0.0, animation: { duration: 10 } });
                }
                // Showing image 
                $(btn).find('img').show();
                outNum = 0;
            } else {
                $(btn).find('img').hide();
                already[i] = 0;
                outNum += 1;
            }
        } else if (type === 'swipe') {
            if (isIn(i, candidate, 4)) {
                if (already[i]) { // Have already looked at the target
                    LockerTimeEnd[i] = Date.now(); // Record time then
                } else {
                    already[i] = 1; //First time to look at the target
                    LockerTimeStart[i] = Date.now(); // Record time then
                }
                var theTimeInterval = LockerTimeEnd[i] - LockerTimeStart[i];
                $(btn).find('img').show();
                if (theTimeInterval > 150.0 && touchLock == false) {
                    for (var j = 0; j < 4; j++) {
                        if (getBtnType(btn) == j & LockerTimeEnd[postBtnId[j]] < LockerTimeEnd[i]) {
                            postBtnId[j] = i;
                            currBtn[j] = btn;
                            isShown[j] = true;
                        }
                    }
                }
            } else {
                $(btn).find('img').hide();
                isShown.fill(true);
                for (var j = 0; j < 4; j++)
                    currBtn[j] = buttons[postBtnId[j]];
                if (!isIn(i, postBtnId, 4)) {
                    LockerTimeEnd[i] = Date.now(); // Record time then
                    LockerTimeStart[i] = LockerTimeEnd[i]; // Record time then
                    already[i] = 0;
                }
            }
        }
    }
}

function showTarget() {
    if (trial_num == 0) {
        socket.emit('end');
        return;
    }

    clearTimeout(trialTimer);
    trialTimer = setTimeout(() => {
        console.log('timeout QQ');
        $('.target').removeClass('target');
        clicked_btn = null;
        gesture = 'timeout';
        log();
        showTarget();
    }, 20000);

    while (true) {
        var btn_num = buttons.length;
        var rand = Math.floor(Math.random() * btn_num);
        console.log(trial_num + ' ' + rand);
        if (!$(buttons[rand]).hasClass('clicked')) break;
    }
    $(buttons[rand]).addClass('target');
    target_btn = $(buttons[rand]).parent().attr('id');
    trial_num -= 1;
}

function changePath(pathX, pathY) {
    cxt.fillStyle = "#FF2345";
    pathX = pathX * server_width / client_width;
    pathY = pathY * server_height / client_height;
    if (!new_path) {
        cxt.moveTo(prevX, prevY);
        cxt.lineTo(pathX, pathY);
        cxt.stroke();
    }
    prevX = pathX;
    prevY = pathY;
    new_path = false;
}

function clearCanvas() {
    cxt.clearRect(0, 0, 1400, 1000);
    cxt.beginPath();
    new_path = true;
}

var getSwipeDirectionFromAngle = (angle, direction) => {
    if (direction === Hammer.DIRECTION_UP) return UP;
    else if (direction === Hammer.DIRECTION_DOWN) return DOWN;
    else if (direction === Hammer.DIRECTION_LEFT) return LEFT;
    else if (direction === Hammer.DIRECTION_RIGHT) return RIGHT;
    return -1;
};

function enableSwipe() {
    var container = document.getElementById("MobileContainer");
    const manager = new Hammer.Manager(container);
    const swipe = new Hammer.Swipe();
    manager.add(swipe);

    manager.on('swipe', (e) => {
        var direction = e.offsetDirection;
        var angle = e.angle;
        var dir = getSwipeDirectionFromAngle(angle, direction);
        enableClick(dir);
        swipeAndUnlock(dir);
    });

    manager.on('hammer.input', (ev) => {
        console.log(ev);
        // If one can only do multi-touch swipe
        if (ev.maxPointers > 1) {
            if (ev.isFinal === true) {
                let multidir = ev.direction;
                if (multidir === Hammer.DIRECTION_UP) enableClick(UP);
                else if (multidir === Hammer.DIRECTION_DOWN) enableClick(DOWN);
                else if (multidir === Hammer.DIRECTION_LEFT) enableClick(LEFT);
                else if (multidir === Hammer.DIRECTION_RIGHT) enableClick(RIGHT);
            }
        }
    });
};

function enableClick(dir) {
    if (isShown[dir])
        buttons[postBtnId[dir]].click();
}

var swipeAndUnlock = (dir) => {
    if (isShown[dir]) {
        currBtn[dir].click();
        already[postBtnId[dir]] = 0;
        touchLock = false;
        console.log("swipe " + dir + ":" + String(postBtnId[dir]));
    }
}

function DwellLockerReset(eyeX, eyeY) {
    if (type === 'swipe' || type === 'EyeGesture') {
        for (var k = 0; k < buttons.length; k++) {
            if (!(overlap(buttons[k], eyeX, eyeY) || isIn(k, postBtnId, 4))) {
                LockerTimeEnd[k] = Date.now(); // Record time then
                LockerTimeStart[k] = LockerTimeEnd[k]; // Record time then
                already[k] = 0;
            }
        }
    }
}