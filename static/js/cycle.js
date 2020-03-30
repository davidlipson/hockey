$(document).ready(function(){

	var ctx = $("#canvas")[0].getContext('2d');
    var height = $("#canvas").height();
    var width = $("#canvas").width();

    var activePlayer = new Player(100, 100, 25, width, height, ctx, "red", true)
	var players = [activePlayer]
	var game = new Game(ctx, width, height, players, activePlayer);


	var pressedKeys = [];

	// start moving
	$(document).keydown(function(e) {
		console.log(pressedKeys);
		var moveMap = {
			37: "left",
			38: "up",
			39: "right",
			40: "down"
		}

		if (e.which in moveMap && !(pressedKeys.includes(moveMap[e.which]))){
			pressedKeys.push(moveMap[e.which]);
			game.updateActiveDirections(pressedKeys);
		}
	    
	    e.preventDefault(); // prevent the default action (scroll / move caret)
	});

	// stop moving
	// start moving
	$(document).keyup(function(e) {
		console.log(pressedKeys);
		var moveMap = {
			37: "left",
			38: "up",
			39: "right",
			40: "down"
		}

		if (pressedKeys.includes(moveMap[e.which])){
			pressedKeys = pressedKeys.filter(function(value, index, arr){ return value != moveMap[e.which];});
			game.updateActiveDirections(pressedKeys);
		}
	    
	    e.preventDefault(); // prevent the default action (scroll / move caret)
	});

    setInterval(function(){
    	game.clock();
    }, 75);
  
});