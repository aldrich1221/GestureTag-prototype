var container = document.querySelector(".container");
const manager = new Hammer.Manager(container);
const swipe = new Hammer.Swipe();
//const db= new SQL.Database();
//db.run("CREATE TABLE pilot (col1,col2,col3)")


var PilotTest=["up","up","down","down","left","left","right","right"];
var TaskArray=shuffle(PilotTest);
var TaskCount=0;
console.log(TaskArray);
ShowTask(TaskCount)

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
        TaskCount:TaskCount,
        task: TaskArray[TaskCount],
        pos: {
            x: ev.center.x,
            y: ev.center.y
        }
    };
    //db.run("INSERT INTO pilot VALUES (?,?,?)",[1,ev.center.x,ev.center.y])
    
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

        var error
        if(TaskArray[TaskCount]==dir){error=0}
        else{error=1}
        const Errormsg={
                TaskCount:TaskCount,
                task: TaskArray[TaskCount],
                dir:dir,
                error:error
        }
        emitSwipeGesture(Errormsg);
        ev.target.innerText = `Task: ${TaskArray[TaskCount]} You do:${dir}  Error:${error}`

        TaskCount=TaskCount+1;
        ShowTask(TaskCount);
    }

});

var forceFullScreen = () => {
    var doc = window.document;
    var docEl = doc.documentElement;

    var requestFullScreen = docEl.requestFullscreen || docEl.mozRequestFullScreen || docEl.webkitRequestFullScreen || docEl.msRequestFullscreen;
    // var cancelFullScreen = doc.exitFullscreen || doc.mozCancelFullScreen || doc.webkitExitFullscreen || doc.msExitFullscreen;
    console.log('haha');
    if (!doc.fullscreenElement && !doc.mozFullScreenElement && !doc.webkitFullscreenElement && !doc.msFullscreenElement) {
        console.log('not yet');
        requestFullScreen.call(docEl);
        document.getElementById('full').remove();
    }
}

function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

function ShowTask(TaskCount){
    var div = document.getElementById("TaskText");  
    div.textContent = TaskArray[TaskCount];  
    var text = div.textContent;  
}
