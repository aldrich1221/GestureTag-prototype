var container = document.querySelector(".container");
const manager = new Hammer.Manager(container);
const swipe = new Hammer.Swipe();
//const db= new SQL.Database();
//db.run("CREATE TABLE pilot (col1,col2,col3)")


var PilotTest=[1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8];
var TaskArray=shuffle(PilotTest);
var TaskText=["up","left","down","right","upright","upleft","downleft","downright"]
var TaskCount=1;
console.log(TaskArray);
ShowTask(TaskCount)
var dirStr='';
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


manager.on('swipe', (e) => {

    var direction = e.offsetDirection;
    var angle = e.angle;
    dirStr = getSwipeDirectionFromAngle(angle);
    // console.log(`${dirStr}, ${angle}`);
    //emitSwipeGesture(dirStr);
  
});

/* send touch raw data */
manager.on('hammer.input', (ev) => {
    const touch = {
        type: ev.type,
        TaskCount:TaskCount,
        task: TaskArray[TaskCount-1],
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
       /*
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
        */
    var direction = ev.offsetDirection;
    var angle = ev.angle;
    let dir = getSwipeDirectionFromAngle(angle);

       
        var error
        if(TaskText[TaskArray[TaskCount-1]-1]==dir){error=0}
        else{error=1}
        const Errormsg={
                TaskCount:TaskCount,
                task: TaskArray[TaskCount-1],
                dir:dir,
                error:error
        }
        emitSwipeGesture(Errormsg);
        ev.target.innerText = `Task: ${TaskText[TaskArray[TaskCount-1]-1]} You do:${dir}  Error:${error}`
        if(TaskCount>=PilotTest.length){
             alert("Pilot Study is end!")
            window.location="/pilotResult";
      
        }
        else{

            TaskCount=TaskCount+1;
        ShowTask(TaskCount);

        }
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
    div.textContent = "Please Swipe:"+TaskText[TaskArray[TaskCount-1]-1];  
    var text = div.textContent;  
}


var getSwipeDirectionFromAngle = (angle) => {

    let dir = '';
    if (angle < 22.5 && angle >= -22.5) {
        dir = 'right';
    } else if (angle < -22.5 && angle >= -67.5) {
        dir = 'upright';
    } else if (angle < -67.5 && angle >= -112.5) {
        dir = 'up';
    } else if (angle < -112.5 && angle >= -157.5) {
        dir = 'upleft';
    } else if (angle < -157.5 || angle > 157.5) {
        dir = 'left';
    } else if (angle > 112.5 && angle <= 157.5) {
        dir = 'downleft';
    } else if (angle > 67.5 && angle <= 112.5) {
        dir = 'down';
    } else {
        dir = 'downright';
    }
    return dir;
};