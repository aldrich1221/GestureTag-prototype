var container = document.querySelector(".container");
const manager = new Hammer.Manager(container);
const swipe = new Hammer.Swipe();

var tester;
manager.add(swipe);
manager.add(new Hammer.Press({ event: 'superpress', time: 500 }));

socket.on('user', function(user) {
    tester = user;
    console.log(tester);
});

socket.on('init', function(method) {
    width = document.documentElement.clientWidth;
    height = document.documentElement.clientHeight;
    console.log(width + ' ' + height);
    socket.emit('client_init', width, height);
});

manager.on('superpress', (ev) => {
    console.log('LONG PRESS');
    emitMobileStart();
});

/* send touch raw data */
manager.on('hammer.input', (ev) => {
    const touch = {
        type: ev.type,
        pos: {
            x: ev.center.x,
            y: ev.center.y
        }
    };
    emitTouchData(touch);
    // console.log(touch.pos)
    // console.log(ev);

    if (ev.isFinal === true) {
        let multidir = ev.direction;
        let dir = '';
        if (multidir === Hammer.DIRECTION_RIGHT) {
            dir = 'right';
        } else if (multidir === Hammer.DIRECTION_UP) {
            dir = 'up';
        } else if (multidir === Hammer.DIRECTION_LEFT) {
            dir = 'left';
        } else if (multidir === Hammer.DIRECTION_DOWN) {
            dir = 'down';
        }
        emitSwipeGesture(dir);
        console.log("M: " + dir);
        ev.target.innerText = `${dir}`
    }

});