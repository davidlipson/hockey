$(document).ready(function(){

	var ctx = $("#canvas")[0].getContext('2d');
    var height = $("#canvas").height();
    var width = $("#canvas").width();

    var activePlayer = new Player(100, 100, 25, width, height, ctx, "Bob", "red", true)
	var players = [activePlayer]
	var game = new Game(ctx, width, height, players, activePlayer);

	// start moving
	$(document).keydown(function(e) {
		// shot
		if (e.which == 32){
			if (game.puck.owner === game.activePlayer){
				game.puck.shoot();
			}
		}

		// movement
		var moveMap = {
			37: "left",
			38: "up",
			39: "right",
			40: "down"
		}

		if (e.which in moveMap && !(game.pressedKeys.includes(moveMap[e.which]))){
			game.pressedKeys.push(moveMap[e.which]);
			game.updateActiveDirections();
		}
	    
	    e.preventDefault(); // prevent the default action (scroll / move caret)
	});

	// stop moving
	// start moving
	$(document).keyup(function(e) {
		var moveMap = {
			37: "left",
			38: "up",
			39: "right",
			40: "down"
		}

		if (game.pressedKeys.includes(moveMap[e.which])){
			game.pressedKeys = game.pressedKeys.filter(function(value, index, arr){ return value != moveMap[e.which];});
			game.updateActiveDirections();
		}
	    
	    e.preventDefault(); // prevent the default action (scroll / move caret)
	});

    setInterval(function(){
    	game.clock();
    }, 75);
  
});