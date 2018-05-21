var socket = io.connect();
var show_path = false;
var show_mouse = false;

var BTN_SIZE;
var SPACING;

const UP = 0,
    DOWN = 1,
    LEFT = 2,
    RIGHT = 3;

const color = ["yellow", "green", "blue", "deepskyblue"];

var currBtn = new Array(4).fill(null);
var isShown = new Array(4).fill(false);

var type, platform;
var dynamic = false;
const timeoutThreshold = 15000;


var clicked_button, target_btn, gesture;
var buttons = document.getElementsByTagName('button');

var already = new Array(buttons.length).fill(0);
var TimeStart = 0;
var TimeEnd = 0;
var dwelling = null;

var touch_timer, new_path, prevX, prevY;
var c = document.getElementById("canvas");
var cxt = c.getContext("2d");
var server_width = document.documentElement.clientWidth;
var server_height = document.documentElement.clientHeight;
var client_width, client_height;


var SkipBtnEdgePixel = 200;
const DistanceUpbound = 400;
const DEFAULT_TRIAL_NUM = 8;
const TOTAL_DISTANCE = 2400;
// (0,600,4000)    //(100,500,3200)    //(200,400,2400)

var trial_num = DEFAULT_TRIAL_NUM;



const TOFU_WIDTH = server_width / COL_NUM;
const TOFU_HEIGHT = server_height / RAW_NUM;

var LockerTimeEnd = new Array(buttons.length).fill(0.0);
var LockerTimeStart = new Array(buttons.length).fill(0.0);
var theTimeInterval = 0.0;
var LockedBtn = new Array();

var postBtnId = new Array(4).fill(0);
var touchLock = false;

var JumpDistance = new Array(DEFAULT_TRIAL_NUM).fill(0);
var CandidateButtonArray = new Array(buttons.length).fill(0);
var CurrentTarX = 0.0;
var CurrentTarY = 0.0;

var TrialTimeStart = new Date().getTime();
var TrialTimeEnd = new Date().getTime();
var TrialCompletionTime;
var trialTimer;
var ErrorCount = 0;
var ready = true;

var pgBar = $('#circle');
pgBar.circleProgress({
    startAngle: -Math.PI / 4 * 2,
    value: 0.0,
    size: 50,
    lineCap: 'round',
    fill: { gradient: ['#0681c4', '#4ac5f8'] },
});
const timeTd = 330.0;
var EyeErrorX = new Array(10).fill(0.0);
var EyeErrorY = new Array(10).fill(0.0);
var ErrorTimeStart = new Date().getTime();
var ErrorTimeEnd = new Date().getTime();
var ErrorIndex = 0;
var DwellSelectionCount = 0;
var MouseClickCount = 0;

var CalibrationStartTime = new Date().getTime();
var CalibrationState = false;

var EyeGestureTimeStart = new Array(buttons.length).fill(0.0);
var EyeGestureTimeEnd = new Array(buttons.length).fill(0.0);
var StayIndex = 0;
var EyeStayTimeEnd = new Date().getTime();
var EyeStayTimeStart = new Date().getTime();
var EyeStayX = new Array(10).fill(0.0);
var EyeStayY = new Array(10).fill(0.0);

var preTimeStamp = 0.0;

// smooth pursuit
const PURSUIT_HISTORY = 30;
var TotalCorrelationRecord = 0.0;
var PursuitY = new Array(4);
var PursuitX = new Array(4);
for (i = 0; i < 4; i++) {
    PursuitY[i] = new Array(PURSUIT_HISTORY).fill(0.0);
    PursuitX[i] = new Array(PURSUIT_HISTORY).fill(0.0);
}
var PursuitPointCount = 0;
var GoSmoothPursuit = false;
var GetPursuitPosition = true;
var PursuitIndex = 0;
var EyeArrayX = new Array(PURSUIT_HISTORY).fill(0.0);
var EyeArrayY = new Array(PURSUIT_HISTORY).fill(0.0);

var LeaveTimer;
var closeEye = false;

var adjustOrbitX = 0.0;
var adjustOrbitY = 0.0;

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

$(document).keyup((e) => {
    // key "space" for entering trials
    //if (e.which === 32 && platform !== 'mobile') {
        if (e.which === 32 ) {
        e.preventDefault();
        socket.emit('start');
        trial_num = DEFAULT_TRIAL_NUM;
        JumpDistance.fill(0); //have to set to zero
        $(".block").show();
        AssignTargetAlgo();
        showTarget();
    } else if (e.which === 69) // key "e"
        show_mouse = !show_mouse;
    else if (e.which === 80) // key "p"
        show_path = !show_path;
    else if (e.which === 67) { // key "c"
        CalibrationStartTime = Date.now();
        CalibrationState = true;
    } else if (e.which === 83) { // key "s"
        $(".calibration").hide();
        CalibrationState = false;
    }
})

$(document).mousemove((e) => {
    UserState(Date.now());
    if (show_mouse)
        changePos(e.pageX, e.pageY);
});

$(document).mousedown((e) => {
    MouseClickCount++;
});

$(document).on('click', 'button', (function(e) {

    clearTimeout(trialTimer);
    $(this).addClass('clicked');
    GoSmoothPursuit = false;
    TrialTimeEnd = Date.now();
    TrialCompletionTime = TrialTimeEnd - TrialTimeStart

    LockerTimeEnd.fill(0.0);
    LockerTimeStart.fill(0.0);
    clicked_btn = $(this).parent().attr('id');
    if (!$(this).hasClass('target')) ErrorCount++;
    log();

    setTimeout(() => {
        $('.target').removeClass('target');
        $(this).removeClass('clicked');
        showTarget();
        clearTimeout(LeaveTimer);
    }, 200);

}));

socket.on('eyemove', (x, y, ts) => {
    // please add some comments about where the magic number is
    // and the reason.
    let magicScale = 1.0; //surface pro should be 0.8
    // closeEye = false;
    UserState(ts);
    changePos(x * magicScale, y * magicScale);
    Eyespacingerror(x * magicScale, y * magicScale);
});

socket.on('swipe', (dirStr) => {
    let dir;
    if (dirStr == 'up') dir = UP;
    else if (dirStr == 'down') dir = DOWN;
    else if (dirStr == 'left') dir = LEFT;
    else if (dirStr == 'right') dir = RIGHT;
    swipeAndUnlock(dir);
});

socket.on('done', (str) => {
    alert("You already finished one input method! Take a break.");
    clearTimeout(trialTimer);
    $(document).off('keyup');
});

socket.on('tap', (pos) => {
    gesture = pos;
    if (pos === 'topright' && isShown[0]) currBtn[0].click();
    if (pos === 'bottomleft' && isShown[1]) currBtn[1].click();
    if (pos === 'topleft' && isShown[2]) currBtn[2].click();
    if (pos === 'bottomright' && isShown[3]) currBtn[3].click();
});

socket.on('touch', (touch) => {
    touchLock = true;
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
    else if (type === 'EyeGesture') { imgSet = swipeImages; } else if (type === 'tap') imgSet = tapImages;
});

socket.on('client_init', (width, height) => {
    client_width = width;
    client_height = height;
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

socket.on('assign', (assign) => {
    if (assign === 'dynamic') dynamic = true;
});

socket.on('target_size', function(target_size) {
    BTN_SIZE = Number(target_size) / DP_RATIO;
});

socket.on('spacing', function(spacing) {
    SPACING = Number(spacing);
});

function log() {
    cnt = DEFAULT_TRIAL_NUM - trial_num;
    console.log(gesture + ' ' + clicked_btn + ' ' + target_btn);
    socket.emit('log', cnt, gesture, clicked_btn, target_btn, TrialCompletionTime, ErrorCount, DwellSelectionCount, MouseClickCount);
}

function getBtnType(btn, x, y) {

    if (!dynamic) {
        if (imgSet["up"] == btn.children[0].src) return UP;
        else if (imgSet["down"] == btn.children[0].src) return DOWN;
        else if (imgSet["left"] == btn.children[0].src) return LEFT;
        else if (imgSet["right"] == btn.children[0].src) return RIGHT;
        return -1;
    }

    var midX = $(btn).offset().left + 0.5 * btn.offsetWidth;
    var midY = $(btn).offset().top + 0.5 * btn.offsetHeight;
    var diffX = midX - x;
    var diffY = midY - y;
    var slope = diffY / diffX;

    if (diffX > 0 && slope < 1 && slope > -1) return RIGHT;
    else if (diffX < 0 && slope < 1 && slope > -1) return LEFT;
    else if (diffY > 0 && (slope > 1 || slope < -1)) return DOWN;
    return UP;
}

function overlap(element, X, Y) {
    if ($(element).is(':hidden')) return;
    var top = $(element).offset().top;
    var left = $(element).offset().left;
    var right = Number($(element).offset().left) + Number($(element).width());
    var bottom = Number($(element).offset().top) + Number($(element).height());
    var threshold;

    if (type === 'dwell') threshold = 8;
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

    if (!ready) return;
    if (type === 'tap') return;

    clearTimeout(LeaveTimer);

    if (GoSmoothPursuit) {
        closeEye = false;
        LeaveTimer = setTimeout(() => {
            document.getElementById("play1").play();
        }, 1000);

        if (GetPursuitPosition) {
            GetPursuitPosition = false;
            var pursuitID = DeterminePursuit(eyeX, eyeY);
            if (pursuitID !== null) {
                // console.log("Choose orbit:" + pursuitID)
                // $('.orbit' + pursuitID).find(':button').click();
                $('.orbit' + pursuitID).parent().click();
                for (let l = 0; l < 4; l++) {
                    $('.trajectory').removeClass('orbit' + l);
                }
                $('.dot').hide();
                TotalCorrelationRecord = 0.0; // reset the overall threshold value
            }
            setTimeout(() => {
                GetPursuitPosition = true;
            }, 33);
        }

        return;
    }

    for (let l = 0; l < 4; l++) {
        $('.trajectory').removeClass('orbit' + l);
    }
    $('.dot').hide();

    if (touchLock) return;

    $('#eye_tracker').css({
        "left": eyeX,
        "top": eyeY
    });

    $('#canvas_container').css({
        "left": eyeX - 700,
        "top": eyeY - 500
    });


    if (CalibrationState) {
        Calibration(eyeX, eyeY);
        return;
    }

    var btn_num = buttons.length;

    // determine the index of gaze point
    var tofuX = Math.floor(eyeX / TOFU_WIDTH),
        tofuY = Math.floor(eyeY / TOFU_HEIGHT);
    var me = tofuX + tofuY * COL_NUM;

    if (type === 'dwell') {

        if (!overlap(buttons[me], eyeX, eyeY)) {
            dwelling = null;
            pgBar.circleProgress({ 'value': 0.0, animation: { duration: 10 } });
            return;
        }
        if (dwelling === me && overlap(buttons[me], eyeX, eyeY)) {
            // Have already looked at the target
            TimeEnd = Date.now();
            // check if dwell time is long enough
            if (TimeEnd - TimeStart > timeTd) {
                buttons[me].click();
                console.log('from ' + TimeStart % 100000 + ' to ' + TimeEnd % 100000);
                console.log("Dwell Selection Success!!" + dwelling);
                dwelling = null; // reinitialize
                pgBar.circleProgress({ 'value': 0.0, animation: { duration: 10 } });
            }
        } else { // First time to look at the target
            dwelling = me;
            TimeStart = Date.now();
            pgBar.circleProgress({ 'value': 1.0, animation: { duration: timeTd + 200 } });
            console.log("START");
        }

        return;
    }

    // the rest in this function only run when type === 'swipe' or 'EyeGesture'

    // the candidates are the nearest [up, down, left, right]
    var candidate = new Array(4).fill(-1);
    var dist = new Array(4).fill(5000000);

    //Dwell time locker reset
    DwellLockerReset(eyeX, eyeY);

    var neighborhood = [me, me - 1, me + 1,
        me - COL_NUM, me - COL_NUM - 1, me - COL_NUM + 1,
        me + COL_NUM, me + COL_NUM - 1, me + COL_NUM + 1
    ];
    isShown.fill(false);
    $('img').hide();

    // for each type of gesture, put the nearest's index in candidate[]
    for (var k = 0; k < 9; k++) {
        var i = neighborhood[k];
        if (i < 0 || i >= btn_num) continue;
        var btn = buttons[i];
        if (overlap(btn, eyeX, eyeY)) {
            var j = getBtnType(btn, eyeX, eyeY);
            var curr_dist = distance(btn, eyeX, eyeY);
            if (curr_dist < dist[j]) {
                candidate[j] = i;
                dist[j] = curr_dist;
                if (dynamic && type === 'swipe') {
                    $(btn).find('img').attr('src', img_prefix + 'arrow_' + j + '.png');
                }
            }
        }
    }

    for (var k = 0; k < 9; k++) {

        var i = neighborhood[k];
        if (i < 0 || i >= btn_num) continue;
        var btn = buttons[i];

        if (type === 'swipe') {
            if (isIn(i, candidate, 4)) {
                if (already[i]) { // Have already looked at the target
                    LockerTimeEnd[i] = Date.now(); // Record time then
                } else {
                    already[i] = 1; //First time to look at the target
                    LockerTimeStart[i] = Date.now(); // Record time then
                    LockedBtn.push(i);
                }
                theTimeInterval = LockerTimeEnd[i] - LockerTimeStart[i];
                $(btn).find('img').show();
                if (theTimeInterval > 150.0 && touchLock == false) {
                    for (var j = 0; j < 4; j++) {
                        if (getBtnType(btn, eyeX, eyeY) == j & LockerTimeEnd[postBtnId[j]] < LockerTimeEnd[i]) {
                            postBtnId[j] = i;
                            currBtn[j] = btn;
                            isShown[j] = true;
                        }
                    }
                }
            } else {
                isShown.fill(true);
                for (var j = 0; j < 4; j++)
                    currBtn[j] = buttons[postBtnId[j]];
                if (!isIn(i, postBtnId, 4)) {
                    LockerTimeEnd[i] = Date.now(); // Record time then
                    LockerTimeStart[i] = LockerTimeEnd[i]; // Record time then
                    already[i] = 0;
                }
            }
        } else if (type === 'EyeGesture') {

            if (isIn(i, candidate, 4)) {
                if (already[i]) { // Have already looked at the target
                    LockerTimeEnd[i] = Date.now(); // Record time then
                    EyeGestureTimeEnd[i] = Date.now();
                } else {
                    already[i] = 1; //First time to look at the target
                    LockerTimeStart[i] = Date.now(); // Record time then
                    EyeGestureTimeStart[i] = Date.now();

                }
                theTimeInterval = LockerTimeEnd[i] - LockerTimeStart[i];
                var j = getBtnType(btn, eyeX, eyeY);
                $(btn).find('.trajectory').show();

                if (theTimeInterval > 300.0) {
                    LockedBtn.push(i);
                    if (LockerTimeEnd[postBtnId[j]] < LockerTimeEnd[i]) {
                        postBtnId[j] = i;
                        currBtn[j] = btn;
                        isShown[j] = true;
                    }

                    if (!GoSmoothPursuit && EyeStay(eyeX, eyeY)) {

                        PursuitPointCount = 0;
                        GoSmoothPursuit = true;

                        for (var l = 0; l < 4; l++) {
                            $(buttons[candidate[l]]).find('.trajectory').addClass('orbit' + l);
                            // let trajectory start from different position with same angular speed
                            if (l % 2 !== 0)
                                $(buttons[candidate[l]]).find('.trajectory').find('.dot').css('top', '103%');
                            $(buttons[candidate[l]]).find('.trajectory').find('.dot').show();

                        }

                        EyeGestureTimeStart.fill(0.0);
                        EyeGestureTimeEnd.fill(0.0);
                    }

                }
            } else {
                isShown.fill(true);
                for (var j = 0; j < 4; j++) { currBtn[j] = buttons[postBtnId[j]]; }
                if (!isIn(i, postBtnId, 4)) {
                    LockerTimeEnd[i] = Date.now(); // Record time then
                    LockerTimeStart[i] = LockerTimeEnd[i]; // Record time then
                    already[i] = 0;
                }
            }
        }
    }

    for (var i = 0; i < buttons.length; i++)
        if (!isIn(i, candidate, 4))
            $(buttons[i]).find('.trajectory').hide();


        // free the memory
    candidate = null;
    dist = null;

}

function setBtnSize(element, size) {
    $(element).height(size - 2);
    $(element).width(size - 2);
    $(element).css('margin-top', -size / 2);
    $(element).css('margin-left', -size / 2);
    $(element).show();
    // $(element).parent().show();
}

var getSpacingSize = (isU2412) => {
    if (!isU2412)
        return 0.5;
    let size = 0.5;
    switch (BTN_SIZE) {
        case 16.0 / DP_RATIO:
            size = 0.8;
            break;
        case 32.0 / DP_RATIO:
            size = 0.7;
            break;
        case 48.0 / DP_RATIO:
            size = 0.6;
            break;
        default:
            break;
    }
    return size;
};

function showTarget() {

    clearTimeout(trialTimer);
    ready = false;
    GoSmoothPursuit = false;
    pgBar.circleProgress({ 'value': 0.0, animation: { duration: 10 } });

    if (trial_num === 0) {
        socket.emit('end');
        alert(`You finished ` + DEFAULT_TRIAL_NUM + ` trials. Please press space when you are ready for the next round.`);
        JumpDistance.fill(0);
        $(".block").hide();
        return;
    }

    trialTimer = setTimeout(() => {
        $('.target').removeClass('target');
        ErrorCount++;
        TrialCompletionTime = -1;
        clicked_btn = null;
        gesture = 'timeout';
        log();
        showTarget();
    }, timeoutThreshold);

    //reset preformance data
    // TrialTimeStart = Date.now();
    ErrorCount = 0;
    DwellSelectionCount = 0;
    MouseClickCount = 0;

    // select target
    var tar;
    while (true) {
        var btn_num = buttons.length - 2 * (RAW_NUM + COL_NUM) - 4;
        var temptar;

        if (trial_num === DEFAULT_TRIAL_NUM)
        //temptar = ButtonCandidate((server_width+server_height)/2, (server_width+server_height)/2, trial_num, btn_num);
        //temptar = Math.floor(Math.random() * btn_num) + RAW_NUM + 1;
            temptar = 180;
        else
            temptar = ButtonCandidate(CurrentTarX, CurrentTarY, trial_num, btn_num);

        if (!$(buttons[temptar]).hasClass('clicked')) {
            tar = temptar;
            break;
        }
    }

    // render target and its neighbor
    $(":button").hide();

    $(buttons[tar]).addClass('target');
    setBtnSize(buttons[tar], BTN_SIZE);
    target_btn = $(buttons[tar]).parent().attr('id');


    const spacingSize = getSpacingSize(true);
    // render neighbor
    // right
    setBtnSize(buttons[tar + 1], BTN_SIZE);
    $(buttons[tar + 1]).css('margin-left', (BTN_SIZE * (SPACING + spacingSize) - BIGGEST_BTN));
    // left
    setBtnSize(buttons[tar - 1], BTN_SIZE);
    $(buttons[tar - 1]).css('margin-left', (BIGGEST_BTN - BTN_SIZE * (SPACING + 1 + spacingSize)));
    // down
    setBtnSize(buttons[tar + COL_NUM], BTN_SIZE);
    $(buttons[tar + COL_NUM]).css('margin-top', (BTN_SIZE * (SPACING + spacingSize) - BIGGEST_BTN));
    // up
    setBtnSize(buttons[tar - COL_NUM], BTN_SIZE);
    $(buttons[tar - COL_NUM]).css('margin-top', (BIGGEST_BTN - BTN_SIZE * (SPACING + 1 + spacingSize)));

    var skip = [tar + 2, tar - 2, tar + 2 * COL_NUM, tar - 2 * COL_NUM,
        tar - COL_NUM - 1, tar - COL_NUM + 1, tar + COL_NUM - 1, tar + COL_NUM + 1
    ];

    // select distractors
    for (var cnt = 0; cnt < DISTRACT - 5;) {
        var rand = Math.floor(Math.random() * RAW_NUM * COL_NUM);
        if ($(buttons[rand]).is(':hidden') && !isIn(rand, skip, 8)) {
            var x = 16 * (Math.floor(Math.random() * 3) + BASE_BTN) / DP_RATIO;
            setBtnSize(buttons[rand], x);
            cnt++;
        }
    }

    CurrentTarX = $(buttons[tar]).offset().left + 0.5 * buttons[tar].offsetWidth;
    CurrentTarY = $(buttons[tar]).offset().top + 0.5 * buttons[tar].offsetHeight;
    trial_num -= 1;
    setTimeout(() => {
        ready = true;
        TrialTimeStart = Date.now();
    }, 500);
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

var getSwipeDirection = (direction) => {
    if (direction === Hammer.DIRECTION_UP) return UP;
    else if (direction === Hammer.DIRECTION_DOWN) return DOWN;
    else if (direction === Hammer.DIRECTION_LEFT) return LEFT;
    else if (direction === Hammer.DIRECTION_RIGHT) return RIGHT;
    return -1;
};

function enableSwipe() {
    const container = document.getElementById("MobileContainer");
    const manager = new Hammer.Manager(container);
    const swipe = new Hammer.Swipe();
    manager.add(swipe);

    // Single-touch swipe
    manager.on('swipe', (e) => {
        let hammerDir = e.offsetDirection;
        let dir = getSwipeDirection(hammerDir);
        swipeAndUnlock(dir);
    });

    // Multi-touch swipe
    manager.on('hammer.input', (ev) => {
        console.log(ev);
        if (ev.maxPointers > 1) {
            if (ev.isFinal === true) {
                let multidir = swipeAndUnlock(ev.direction);
                swipeAndUnlock(multidir);
            }
        }
    });
};

var swipeAndUnlock = (dir) => {
    if (isShown[dir]) {
        //console.log("swipe currbtn " + buttons[postBtnId[dir]]);
        buttons[postBtnId[dir]].click();
        already[postBtnId[dir]] = 0;
        touchLock = false;
        //console.log("swipe " + dir + ":" + String(postBtnId[dir]));
    }
}

function AssignTargetAlgo() {

    let Res = TOTAL_DISTANCE - 200 * DEFAULT_TRIAL_NUM;

    for (let i = 0; i < DEFAULT_TRIAL_NUM; i++) {
        while (JumpDistance[i] < DistanceUpbound && Res > 0) {
            let randnum = Math.ceil(Math.random() * Res);
            JumpDistance[i] += randnum;
            // Adjustment after adding the randnum on jump_distance
            if (JumpDistance[i] < DistanceUpbound) {
                Res -= randnum;
                break;
            } else {
                JumpDistance[i] -= randnum;
            }
        }
        // if Res didn't finish partition well, do repartition
        if (i === DEFAULT_TRIAL_NUM - 1 && Res !== 0) {
            i = 0;
            continue;
        }
    }

    // random permutation
    for (let i = DEFAULT_TRIAL_NUM - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        swap(JumpDistance[i], JumpDistance[j]);
    }

    // Adding back the base distance
    for (let i = 0; i < DEFAULT_TRIAL_NUM; i++)
        JumpDistance[i] += 200;

    console.log(JumpDistance);
}

function ButtonCandidate(midX, midY, trialNum, btn_num) {
    CandidateButtonArray.fill(0);
    var CandidateBtnX = 0.0;
    var CandidateBtnY = 0.0;
    var CandidateNum = 0;
    var esilon = 100.0;
    var NextTargetIndex
    var dis = JumpDistance[trialNum - 1];

    // THIS TRIAL POSITION
    while (CandidateNum == 0 || CandidateButtonArray[NextTargetIndex] == 0) {
        CandidateButtonArray.fill(0);
        CandidateNum = 0;
        esilon = esilon + 100.0
        for (var i = 0; i < btn_num; i++) {
            CandidateBtnX = $(buttons[i]).offset().left + 0.5 * buttons[i].offsetWidth;
            CandidateBtnY = $(buttons[i]).offset().top + 0.5 * buttons[i].offsetHeight;
            var thisbtndistance = Math.pow((CandidateBtnX - midX), 2) + Math.pow((CandidateBtnY - midY), 2)
            var upbound = dis * dis + esilon;
            var lowbound = dis * dis - esilon;
            if (thisbtndistance < upbound && thisbtndistance > lowbound && PreventBtnEdge(CandidateBtnX, CandidateBtnY)) {
                CandidateButtonArray[CandidateNum] = i;
                CandidateNum++;
            }
        }
        NextTargetIndex = Math.ceil(Math.random() * CandidateNum);
    }
    return CandidateButtonArray[NextTargetIndex];
}


function Eyespacingerror(x, y) {
    ErrorIndex = (ErrorIndex + 1) % 10;
    var XData = 0.0,
        YData = 0.0;
    for (var i = 0; i < 10; i++) {
        XData += EyeErrorX[i];
        YData += EyeErrorY[i];
    }

    var EyeXave = XData / 10;
    var EyeYave = YData / 10;
    EyeErrorX[ErrorIndex] = x;
    EyeErrorY[ErrorIndex] = y;
    for (var i = 0; i < 10; i++) {
        if ((EyeXave - EyeErrorX[i]) * (EyeXave - EyeErrorX[i]) + (EyeYave - EyeErrorY[i]) * (EyeYave - EyeErrorY[i]) > BTN_SIZE * BTN_SIZE) {
            ErrorTimeStart = Date.now();
        }
    }
    ErrorTimeEnd = Date.now();
    if (ErrorTimeEnd - ErrorTimeStart > 330) {
        DwellSelectionCount++;
        ErrorTimeStart = Date.now();
    }
}

function Calibration(eyeX, eyeY) {

    var CalibrateID = Math.ceil((Date.now() - CalibrationStartTime) / 3000);
    var CalibrateBtnX, CalibrateBtnY;

    if (CalibrateID < 10) {
        var c = document.getElementById("Calibration" + CalibrateID);
        $(c).show();

        CalibrateBtnX = $(c).offset().left + 0.5 * c.offsetWidth;
        CalibrateBtnY = $(c).offset().top + 0.5 * c.offsetHeight;
        for (var i = 0; i < 10; i++)
            if (i != CalibrateID) $(document.getElementById("Calibration" + i)).hide();

    } else {
        $(document.getElementById("Calibration9")).hide();
        CalibrationState = false;
    }

    socket.emit('Calibrationlog', eyeX, eyeY, CalibrateID, CalibrateBtnX, CalibrateBtnY);
}

function EyeStay(x, y) {
    //console.log(closeEye);
    if (closeEye === true) {
        EyeStayTimeStart = Date.now(); // reset the start timer for eye-stay
        closeEye = false;
        return false
    }
    StayIndex = (StayIndex + 1) % 10;
    var XData = 0.0,
        YData = 0.0;

    for (var i = 0; i < 10; i++) {
        XData += EyeStayX[i];
        YData += EyeStayY[i];
    }
    var EyeXave = XData / 10;
    var EyeYave = YData / 10;
    EyeStayX[StayIndex] = x;
    EyeStayY[StayIndex] = y;
    for (var i = 0; i < 10; i++) {
        if ((EyeXave - EyeStayX[i]) * (EyeXave - EyeStayX[i]) + (EyeYave - EyeStayY[i]) * (EyeYave - EyeStayY[i]) > BTN_SIZE * BTN_SIZE) {
            EyeStayTimeStart = Date.now();
            EyeStayTimeEnd = Date.now();
        }
    }
    EyeStayTimeEnd = Date.now();
    if (EyeStayTimeEnd - EyeStayTimeStart > 300) {
        // console.log("Dwell Stay!!");
        return true;
    }

    return false;
}

function DwellLockerReset(eyeX, eyeY) {
    if (type === 'swipe' || type === 'EyeGesture') {
        var TempLockedBtn = new Array();
        for (var k = 0; k < LockedBtn.length; k++) {
            if (!(overlap(buttons[LockedBtn[k]], eyeX, eyeY) && !isIn(LockedBtn[k], postBtnId, 4))) {
                LockerTimeEnd[LockedBtn[k]] = Date.now(); // Record time then
                LockerTimeStart[LockedBtn[k]] = LockerTimeEnd[LockedBtn[k]]; // Record time then
                already[LockedBtn[k]] = 0;
            } else {
                TempLockedBtn.push(LockedBtn[k])
            }
        }
        LockedBtn = TempLockedBtn;
    }
}

function getPearsonCorrelation(x, y) {
    let minLen = 0;
    let xy = [];
    let x2 = [];
    let y2 = [];
    let sum_x = 0;
    let sum_y = 0;
    let sum_xy = 0;
    let sum_x2 = 0;
    let sum_y2 = 0;

    if (x.length == y.length) {
        minLen = x.length;
    } else if (x.length > y.length) {
        minLen = y.length;
        console.error('x has more items in it, the last ' + (x.length - minLen) + ' item(s) will be ignored');
    } else {
        minLen = x.length;
        console.error('y has more items in it, the last ' + (y.length - minLen) + ' item(s) will be ignored');
    }

    for (var i = 0; i < minLen; i++) {
        xy.push(x[i] * y[i]);
        x2.push(x[i] * x[i]);
        y2.push(y[i] * y[i]);
    }

    for (var i = 0; i < minLen; i++) {
        sum_x += x[i];
        sum_y += y[i];
        sum_xy += xy[i];
        sum_x2 += x2[i];
        sum_y2 += y2[i];
    }
    return (minLen * sum_xy - sum_x * sum_y) / Math.sqrt((minLen * sum_x2 - sum_x * sum_x) * (minLen * sum_y2 - sum_y * sum_y));
}

function DeterminePursuit(eyeX, eyeY) {

    var x = [0, 0, 0, 0];
    var y = [0, 0, 0, 0];
    var canPursit = [0, 0, 0, 0];
    for (var i = 0; i < 4; i++) {
        if ($('.orbit' + i).length > 0) {
            var dot = $('.orbit' + i).parent().find('.dot');
            canPursit[i] = 1;
            x[i] = dot.offset().left + 0.5 * dot.width();
            y[i] = dot.offset().top + 0.5 * dot.height();
        }
    }

    PursuitIndex = (PursuitIndex + 1) % PURSUIT_HISTORY;
    EyeArrayX[PursuitIndex] = eyeX;
    EyeArrayY[PursuitIndex] = eyeY;

    for (var i = 0; i < 4; i++) {
        if (canPursit[i] === 0) continue;
        PursuitX[i][PursuitIndex] = x[i];
        PursuitY[i][PursuitIndex] = y[i];
    }

    pursuitID = null;
    // only more than PURSUIT_HISTORY point can go to calculate
    if (PursuitPointCount > PURSUIT_HISTORY) {
        for (var i = 0; i < 4; i++) {
            var Xcorrelation = getPearsonCorrelation(PursuitX[i], EyeArrayX);
            var Ycorrelation = getPearsonCorrelation(PursuitY[i], EyeArrayY);
            var totalcorrelation = Ycorrelation * Xcorrelation;
            if (Xcorrelation > 0.8 && Ycorrelation > 0.8 && totalcorrelation > TotalCorrelationRecord) {
                TotalCorrelationRecord = totalcorrelation;
                pursuitID = i;
            }
        }
    }

    PursuitPointCount++;
    return pursuitID;
}


function PreventOrbitEdge(x, y) {

    var edgeradius = 200;
    if (x < edgeradius && y < edgeradius) {
        adjustOrbitX = edgeradius;
        adjustOrbitY = edgeradius;
    } else if (x < edgeradius && y > edgeradius && y < server_height - edgeradius) {
        adjustOrbitX = edgeradius;
        adjustOrbitY = y;
    } else if (x < edgeradius && y > server_height - edgeradius) {
        adjustOrbitX = edgeradius;
        adjustOrbitY = server_height - edgeradius;
    } else if (x > edgeradius && x < server_width - edgeradius && y > server_height - edgeradius) {
        adjustOrbitX = x;
        adjustOrbitY = server_height - edgeradius;
    } else if (x > server_width - edgeradius && y > server_height - edgeradius) {
        adjustOrbitX = server_width - edgeradius;
        adjustOrbitY = server_height - edgeradius;
    } else if (x > server_width - edgeradius && y < server_height - edgeradius && y > edgeradius) {
        adjustOrbitX = server_width - edgeradius;
        adjustOrbitY = y;
    } else if (x > server_width - edgeradius && y < edgeradius) {
        adjustOrbitX = server_width - edgeradius;
        adjustOrbitY = edgeradius;
    } else if (x < server_width - edgeradius && x > edgeradius && y < edgeradius) {
        adjustOrbitX = x;
        adjustOrbitY = edgeradius;
    } else {
        adjustOrbitX = x;
        adjustOrbitY = y
    }
}


function PreventBtnEdge(x, y) {
    if (x > SkipBtnEdgePixel && x < server_width - SkipBtnEdgePixel && y > SkipBtnEdgePixel && x < server_height - SkipBtnEdgePixel)
        return true;
    else return false;
}



function UserState(ts) {
    var timestampinterval = ts - preTimeStamp;
    if (timestampinterval > 1000) {
        preTimeStamp = ts;
        UserAlready = false;
        GoSmoothPursuit = false;
        closeEye = true;
        console.log("close eyes")
    } else {
        UserAlready = true;
        preTimeStamp = ts;
    }
}
