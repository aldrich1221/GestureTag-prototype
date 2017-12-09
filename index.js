// var socket = io.connect();

var eyeX, eyeY;

$(document).mousemove( function(e) {

	$('#eye_tracker').css({
		"left": e.pageX,
		"top": e.pageY 
	})

	for( var i=0; i<3; i++ ) 
		for( var j=0; j<4; j++) {
			var offset = $("#blk"+i+""+j+" button").offset();
			var btnX = offset.left + 100;
			var btnY = offset.top + 50;

			var dist = ( btnX - e.pageX )*( btnX - e.pageX ) + ( btnY - e.pageY )*( btnY - e.pageY );
			if ( dist <= 64000 ) $("#blk"+i+""+j+" button img").show();
			else $("#blk"+i+""+j+" button img").hide();
		}
});
// recieve eye-tracker position

// recieve swiping event