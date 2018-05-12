const fs = require('fs');
const moment = require('moment');
const express = require('express');
const app = express();
const path = require('path');
const resources = '/resources';


if ((process.argv).length !== 7) {
    console.log("Wrong arg num!!! Pleas enter npm run [method] [user_category] [device] [user_id] [static/dynamic]");
    process.exit();
}

// Tap or Swipe
const type = process.argv[2];

// motor or normal
const user = process.argv[3];

// mobile or desktop
const device = process.argv[4];

// static or dynamic
const assign = process.argv[6];

// 16, 32, 48
// let target_size = process.argv[5];

// 0, 0.5, 1
// const spacing = process.argv[6];

const swipeOptions = {
    OPTION_1: `${resources}/arrow_0.png`,
    OPTION_2: `${resources}/arrow_1.png`,
    OPTION_3: `${resources}/arrow_2.png`,
    OPTION_4: `${resources}/arrow_3.png`,
    EYETRACKER: `gesturetag`
};
const tapOptions = {
    OPTION_1: `${resources}/tap_topright.png`,
    OPTION_2: `${resources}/tap_bottomleft.png`,
    OPTION_3: `${resources}/tap_topleft.png`,
    OPTION_4: `${resources}/tap_bottomright.png`,
    OPTION_5: `${resources}/tap_topright.png`,
    OPTION_6: `${resources}/tap_bottomleft.png`,
    OPTION_7: `${resources}/tap_topleft.png`,
    OPTION_8: `${resources}/tap_bottomright.png`,
    EYETRACKER: `gesturetag`
};
const dwellOptions = {
    OPTION_1: `//:0`,
    OPTION_2: `//:0`,
    OPTION_3: `//:0`,
    OPTION_4: `//:0`,
    EYETRACKER: `dwell`
};

const user_id = process.argv[5];

const logfile = 'log/' + moment().format('MMDD-HHmm') + '_' + user_id + '_' + user + '.log';

let rawdata = fs.readFileSync(`./condition/${user_id}.json`);
let conditionOrders = JSON.parse(rawdata)[type];
let [target_size, spacing] = conditionOrders.shift();

var updateCondition = () => {
    if (conditionOrders.length === 0) {
        io.emit('done', 'done');
        return;
    }
    [target_size, spacing] = conditionOrders.shift();
    console.log(`update condition: ${target_size}, ${spacing}`);
    io.emit('target_size', target_size);
    io.emit('spacing', spacing);
};

app.use(resources, express.static('resources'));
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.get('/', (req, res) => {
    res.render('index', loadImages());
});

app.get('/tofu', (req, res) => {
    res.render('tofu', loadImages());
});

app.get('/tofum', (req, res) => {
    res.render('tofum', loadImages());
});

app.get('/gmail', (req, res) => {
    res.render('gmail', loadImages());
});

app.get('/youtube', (req, res) => {
    res.render('youtube', loadImages());
});

app.get('/swipe', (req, res) => {
    res.sendFile(path.join(__dirname, 'swipe.html'));
});


app.get('/pilot', (req, res) => {
    res.sendFile(path.join(__dirname, 'pilot.html'));
});


app.get('/tap', (req, res) => {
    res.sendFile(path.join(__dirname, 'tap.html'));
});

var http = require('http').Server(app);
var io = require('socket.io')(http);

var writeLog = (msg) => {
    var time = moment().format('MM/DD HH:mm:ss:SSS');
    msg = time + '\t' + msg + '\r\n';
    console.log(msg);
    fs.appendFile(logfile, msg, function(err) {
        if (err) console.error(err);
    });
};

var loadImages = () => {
    if (type === 'swipe')
        return swipeOptions;
    else if (type === 'tap')
        return tapOptions;
    else if (type === 'EyeGesture')
        return swipeOptions;
    else
        return dwellOptions;
}

io.on('connection', function(socket) {
    console.log('a user connected');
    io.emit('init', type);
    io.emit('user', user);
    io.emit('device', device);
    io.emit('assign', assign);
    io.emit('target_size', target_size);
    io.emit('spacing', spacing);

    // set client's window size
    socket.on('client_init', function(width, height) {
        console.log('client_init');
        io.emit('client_init', width, height);
    })

    // recieve eye-tracker position
    socket.on('eyemove', function(x, y, ts) {
        io.emit('eyemove', x, y, ts);
    });

    // recieve swiping event
    if (type === 'swipe') {
        socket.on('swipe', function(dir) {
            if(dir.task!=null){
                 var msg=`TaskCount: ${dir.TaskCount} Task: ${dir.task} Swipe: ${dir.task} Error: ${dir.error}`;
                    writeSwipeErrorLog(msg)
                }
            io.emit('swipe', dir);
        });
    }

    //recieve tap event
    if (type === 'tap') {
        socket.on('tap', (location) => {
            console.log(`location: ${location}`);
            io.emit('tap', location);
        });
    }

    // receive touch raw data
    socket.on('touch', (event) => {
        if (event.type === 'hammer.input') {
            console.log(`Task: ${event.task} touchX: ${event.pos.x} touchY: ${event.pos.y}`)
            if(event.task!=null){
                        var msg=`Task: ${event.task} touchX: ${event.pos.x} touchY: ${event.pos.y}`;
                        writeTouchLog(msg);
                }
            io.emit('touch', event.pos);
        }
    });

    // start a trial
    socket.on('start', function() {
        // write the condition, too
        // writeLog('trial start (' + type + ')');
        writeLog(`trials start ( ${type} ), size: ${target_size}, spacing: ${spacing}`);
        if (device === 'mobile') io.emit('start_mobile');
    });

    // end of a trial
    socket.on('end', function() {
        writeLog('trial end');
        io.emit('end');
        updateCondition();
    });

    // log data
    socket.on('log', function(cnt, gesture, clicked_btn, target, TrialCompletionTime, ErrorCount, DwellSelectionCount, MouseClickCount) {
        var msg = '#' + cnt;
        msg += '\tevent:' + gesture;
        msg += '\ttarget:' + target;
        msg += '\tclick:' + clicked_btn;
        msg += '\tCompletionTime: ' + TrialCompletionTime;
        msg += '\tErrorCount: ' + ErrorCount;
        msg += '\tDwellSelectionCount: ' + DwellSelectionCount;
        msg += '\tMouseClickCount: ' + MouseClickCount;
        writeLog(msg);
    });

    socket.on('Calibrationlog', function(EyeX, EyeY, BtnID, BtnX, BtnY) {
        var msg = 'BtnID: ' + BtnID;
        msg += '\tBtnX: ' + BtnX;
        msg += '\tBtnY: ' + BtnY;
        msg += '\tEyeX: ' + EyeX;
        msg += '\tEyeY: ' + EyeY;

        writeLogCalibration(msg);
    });

});

http.listen(3000, function() {
    console.log('listening on *:3000');
});


var writeLogCalibration = (msg) => {
    var time = moment().format('MM/DD HH:mm:ss:SSS');
    var CalibrationLogmsg = time + '\t' + msg + '\r\n';
    var fileName = 'log/CalibrationLog_' + user_id + '_' + moment().format('MMDD-HHmm') + '.log';

    console.log(CalibrationLogmsg);
    fs.appendFile(fileName, CalibrationLogmsg, function(err) {
        if (err) console.error(err);
    });
};


var writeTouchLog= (msg) => {
    var time = moment().format('MM/DD HH:mm:ss:SSS');
    var TouchLogmsg = time + '\t' + msg + '\r\n';
    var fileName = 'log/TouchLog_' + user_id + '_' + moment().format('MMDD-HHmm')+ '.txt';

    console.log(TouchLogmsg);
    fs.appendFile(fileName, TouchLogmsg, function(err) {
        if (err) console.error(err);
    });
};

var writeSwipeErrorLog= (msg) => {
    var time = moment().format('MM/DD HH:mm:ss:SSS');
    var TouchLogmsg = time + '\t' + msg + '\r\n';
    var fileName = 'log/TouchErrorLog_' + user_id + '_' + moment().format('MMDD-HHmm')+ '.txt';

    console.log(TouchLogmsg);
    fs.appendFile(fileName, TouchLogmsg, function(err) {
        if (err) console.error(err);
    });
};
