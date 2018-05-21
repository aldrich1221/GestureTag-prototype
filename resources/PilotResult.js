var socket = io.connect();
var Data1=[0]
var Data2=[0]
var Data3=[0]
var Data4=[0]
var originalX=0.0
var originalY=0.0
var vectorX
var vectorY
var X1=[]
var X2=[]
var X3=[]
var X4=[]
var X5=[]
var X6=[]
var X7=[]
var X8=[]



var Y1=[]
var Y2=[]
var Y3=[]
var Y4=[]
var Y5=[]
var Y6=[]
var Y7=[]
var Y8=[]


var D1
var D2
var D3
var D4
var num=0
var count=0
var error1=0
var error2=0
var error3=0
var error4=0
var error5=0
var error6=0
var error7=0
var error8=0

socket.on('Errormsg', function(task,error) {
	count++;
console.log("Task "+task +"Error: "+error)
	if(task==1&&error==1){error1++}
	else if(task==2&&error==1){error2++}
		else if(task==3&&error==1){error3++}
			else if(task==4&&error==1){error4++}
					else if(task==5&&error==1){error5++}
							else if(task==6&&error==1){error6++}
									else if(task==7&&error==1){error7++}
										else if(task==8&&error==1){error8++}


				if(count==16){
					  var div1 = document.getElementById("Error1");  
   					 div1.textContent = "Up  Error:"+error1 
    				 var div2 = document.getElementById("Error2");  
   					 div2.textContent = "Left Error:"+error2
    				 var div3 = document.getElementById("Error3");  
   					 div3.textContent = "Down Error:"+error3 
   					 var div4 = document.getElementById("Error4");  
   					 div4.textContent = "Right Error:"+error4 

   					  var div5 = document.getElementById("Error5");  
   					 div5.textContent = "Upright  Error:"+error5 
    				 var div6 = document.getElementById("Error6");  
   					 div6.textContent = "UpLeft Error:"+error6
    				 var div7 = document.getElementById("Error7");  
   					 div7.textContent = "Downleft Error:"+error7 
   					 var div8 = document.getElementById("Error8");  
   					 div8.textContent = "downRight Error:"+error8 

				}


})
socket.on('Touchdata', function(tasknum,task,dataX,dataY,datacount) {
	
	Data1[num]=tasknum
	Data2[num]=task
	Data3[num]=dataX
	Data4[num]=dataY
	

	if(num==datacount-1)
	{

		for(var i=0;i<datacount;i++){	
			//console.log(Data1[i]+" "+Data2[i]+" "+Data3[i]+" "+Data4[i]+" ")
	if(Data3[i]!=0.0){
		if(i!=0){
			if(Data1[i]!=Data1[i-1]&&Data2[i]>0){
				originalX=Data3[i]
				originalY=Data4[i]	
				//console.log("originalX:"+originalX +" and "+originalY);	
			}//new task
			else{
				vectorX=Data3[i]-originalX
				vectorY=-Data4[i]+originalY
				//console.log("vector:"+vectorX +" and "+vectorY);
				if(Data2[i]==1){X1.push(vectorX);Y1.push(vectorY);}
				else if (Data2[i]==2){X2.push(vectorX);Y2.push(vectorY);}	
				else if (Data2[i]==3){X3.push(vectorX);Y3.push(vectorY);}	
				else if (Data2[i]==4){X4.push(vectorX);Y4.push(vectorY);}
				else if(Data2[i]==5){X5.push(vectorX);Y5.push(vectorY);}
				else if (Data2[i]==6){X6.push(vectorX);Y6.push(vectorY);}	
				else if (Data2[i]==7){X7.push(vectorX);Y7.push(vectorY);}	
				else if (Data2[i]==8){X8.push(vectorX);Y8.push(vectorY);}		
			}
		}
		else{
			originalX=Data3[i]
			originalY=Data4[i]
		}
}
}

//console.log(" Up: "+ MaxAngle(X1,Y1)+" Left: "+ MaxAngle(X2,Y2)+" Down: "+ MaxAngle(X3,Y3)+" Right: "+ MaxAngle(X4,Y4))

    var div1 = document.getElementById("Result1");  
    div1.textContent = "Up Angle :"+MaxAngle(X1,Y1) 
    var div2 = document.getElementById("Result2");  
    div2.textContent = "Left Angle :"+MaxAngle(X2,Y2)
    var div3 = document.getElementById("Result3");  
    div3.textContent = "Down Angle :"+MaxAngle(X3,Y3)
    var div4 = document.getElementById("Result4");  
    div4.textContent = "Right Angle :"+MaxAngle(X4,Y4)
    var div5 = document.getElementById("Result5");  
    div5.textContent = "UpRight Angle :"+MaxAngle(X5,Y5) 
    var div6 = document.getElementById("Result6");  
    div6.textContent = "UpLeft Angle :"+MaxAngle(X6,Y6)
    var div7 = document.getElementById("Result7");  
    div7.textContent = "DownLeft Angle :"+MaxAngle(X7,Y7)
    var div8 = document.getElementById("Result8");  
    div8.textContent = "DownRight Angle :"+MaxAngle(X8,Y8)
    
//console.log(X1)
var trace1 = {
  x: X1,
  y: Y1,
  mode: 'markers',
  type: 'scatter',
  name: 'Up',
  //text: ['A-1', 'A-2', 'A-3', 'A-4', 'A-5'],
  marker: { size: 12 }
};

var trace2 = {
  x: X2,
  y: Y2,
  mode: 'markers',
  type: 'scatter',
  name: 'Left',
  //text: ['B-a', 'B-b', 'B-c', 'B-d', 'B-e'],
  marker: { size: 12 }
};

var trace3 = {
  x: X3,
  y: Y3,
  mode: 'markers',
  type: 'scatter',
  name: 'Down',
  //text: ['B-a', 'B-b', 'B-c', 'B-d', 'B-e'],
  marker: { size: 12 }
};
var trace4 = {
  x: X4,
  y: Y4,
  mode: 'markers',
  type: 'scatter',
  name: 'Right',
  //text: ['B-a', 'B-b', 'B-c', 'B-d', 'B-e'],
  marker: { size: 12 }
};

var trace5 = {
  x: X5,
  y: Y5,
  mode: 'markers',
  type: 'scatter',
  name: 'UpRight',
  //text: ['B-a', 'B-b', 'B-c', 'B-d', 'B-e'],
  marker: { size: 12 }
};

var trace6 = {
  x: X6,
  y: Y6,
  mode: 'markers',
  type: 'scatter',
  name: 'upLeft',
  //text: ['B-a', 'B-b', 'B-c', 'B-d', 'B-e'],
  marker: { size: 12 }
};

var trace7 = {
  x: X7,
  y: Y7,
  mode: 'markers',
  type: 'scatter',
  name: 'downleft',
  //text: ['B-a', 'B-b', 'B-c', 'B-d', 'B-e'],
  marker: { size: 12 }
};

var trace8 = {
  x: X8,
  y: Y8,
  mode: 'markers',
  type: 'scatter',
  name: 'downRight',
  //text: ['B-a', 'B-b', 'B-c', 'B-d', 'B-e'],
  marker: { size: 12 }
};


var data = [ trace1, trace2,trace3,trace4 ,trace5 ,trace6 ,trace7 ,trace8];

var layout = {
  xaxis: {
    range: [ -500, 500 ]
  },
  yaxis: {
    range: [-500, 500]
  },
  title:'Swipe Record'
};

Plotly.newPlot('myplot', data, layout);
}

num=num+1
	

});

		

function MaxAngle(X,Y){
	var MaxTheta=0.0
	for(i=0;i<X.length;i++){
			for(j=0;j<X.length;j++){
					var Theta=Math.acos((X[i]*X[j]+Y[i]*Y[j])/(Math.sqrt(X[i]*X[i]+Y[i]*Y[i])*Math.sqrt(X[j]*X[j]+Y[j]*Y[j])))*180/Math.acos(-1.0)
					if(Theta>=MaxTheta){MaxTheta=Theta}
			}


	}

		return MaxTheta
}







//console.log("1: X:"+X1 +"Y:" +Y1)



/*
function Plot() {
	var id = parseInt($('#caseNum').text());
	dis = parseInt($('#distance').val());
	var filename = "../log/TouchLog_tw_10_0512-1810.txt";
	console.log(filename);
	$.ajax({
  		url: filename,
  		dataType: "text",
	}).done(parseCSV);
	var XYContour = {
	  x: x,
	  y: y,

	  name: 'density',

	  ncontours: 20,

	  colorscale: 'Hot',

	  reversescale: true,

	  showscale: false,

	  type: 'histogram2dcontour'

	};

	var XDensity = {

	  x: x,

	  name: 'x density',

	  marker: {color: 'rgb(102,0,0)'},

	  yaxis: 'y2',

	  type: 'histogram'

	};

	var YDensity = {

	  y: y,

	  name: 'y density',

	  marker: {color: 'rgb(102,0,0)'},

	  xaxis: 'x2',

	  type: 'histogram'

	};

	var data = [XYContour, XDensity, YDensity];

	var layout = {
	  showlegend: false,
	  autosize: true,
	  width: 1200,
	  height: 600,
	  margin: {t: 50},
	  hovermode: 'closest',
	  bargap: 0,
	  xaxis: {
	    domain: [0, 0.85],
	    showgrid: false,
	    zeroline: true
	  },

	  yaxis: {
	    domain: [0, 0.85],
	    showgrid: false,
	    zeroline: true
	  },

	  xaxis2: {
	    domain: [0.85, 1],
	    showgrid: false,
	    zeroline: true
	  },
	  yaxis2: {
	    domain: [0.85, 1],
	    showgrid: false,
	    zeroline: true
	  },
	  colorbar: {},
	  images: [

	  {
	  	"source": "./face.png",
        "xref": "x",
        "yref": "y",
        "x": 0,
        "y": 1,
        "sizex": 25,
        "sizey": 25,
        "sizing": "strech",
        "xanchor": "center",
        "yanchor": "middle",
        "layer": "above",
        "opacity": 0.6
	  }
	  ]
	};
	Plotly.newPlot('plot', data, layout);
}



function parseCSV(data) {
	x = [];
	y = [];
	var rowData = data.split(/\r?\n|\r/);
	for(var i = 0;i < rowData.length;i++) {
		var columnData = rowData[i].split(',');
		var xx = dis * Math.tan(columnData[1] * Math.PI / 180) * Math.cos(columnData[2] * Math.PI / 180);
		var yy = dis * Math.tan(columnData[1] * Math.PI / 180) * Math.sin(columnData[2] * Math.PI / 180);
		if(Math.abs(xx) > 50 || Math.abs(yy) > 50) continue;
		x.push(xx);
		y.push(yy);
	}
	console.log(x.length);		
}
*/