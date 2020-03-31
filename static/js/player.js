class Player {
  constructor(x, y, r, w, h, ctx, name, team, puck, position) {
    this.x = x;
    this.y = y;
    this.oX = x;
    this.oY = y
    this.r = r;
    this.vX = 0;
    this.vY = 0;
    this.vMax = 5;
    this.width = r;
    this.height = r;
    this.maxWidth = w;
    this.maxHeight = h;
    this.ctx = ctx;
    this.name = name;
    this.team = team;
    this.puck = puck;
    this.position = position;

    this.active = false;
    this.activeDirections = [];
    this.releasedPuck = false;

    this.friction = 0.25;
    this.acceleration = 0.25;

    this.blockingNetPath = null;
    this.passingBlockers = null;

    this.shootingProbability = 0;
    this.passingProbabilities = null;
    this.movingPotential = 0;
    this.closestOpponent = null;

    this.accuracy = 0.8;
  }

  setPP(){
    this.passingBlockers = new Array(this.team.players.length).fill(null);
    this.passingProbabilities = new Array(this.team.players.length).fill(0);
  }

  distanceTo(o){
    return Math.sqrt((this.x - o.x)**2 + (this.y - o.y)**2);
  }

  dist2(a, b){
    return (a.x - b.x)**2 + (a.y - b.y)**2;
  }

  dotDistance(point, line){
    var d = this.dist2(line[0], line[1]);
    if (d == 0) return this.dist2(point, line[0]);

    var t = ((point.x - line[0].x) * (line[1].x - 
              line[0].x) + (point.y - line[0].y) * (line[1].y - line[0].y)) / d;
    t = Math.max(0, Math.min(1, t));
    return Math.sqrt(this.dist2(point, {x: line[0].x + t*(line[1].x - line[0].x), 
                                        y: line[0].y + t*(line[1].y - line[0].y)}))
  }


  directionTo(o){
    var xDistance = o.x - this.x;
    var xDirection = xDistance > 0 ? 39 : 37;

    var yDistance = o.y - this.y;
    var yDirection = yDistance > 0 ? 40 : 38;

    return Math.abs(xDistance) > Math.abs(yDistance) ? xDirection : yDirection;
  }

  // seek farthest player on team from obj not including current player
  farthestPlayer(obj){
    var maxDist = null;
    var maxPlayer = null;
    for(var i = 0; i < this.team.players.length; i++){
      var p = this.team.players[i];
      var dist = p.distanceTo(obj);

      if (p !== this && (maxDist == null || dist > maxDist)){
        maxDist = dist;
        maxPlayer = p;
      }
    }
    return [maxDist, maxPlayer];
  }

  // seek closest player on team from obj not including current player
  closestPlayer(obj){
    var minDist = null;
    var minPlayer = null;
    for(var i = 0; i < this.team.players.length; i++){
      var p = this.team.players[i];
      var dist = p.distanceTo(obj)

      if (p !== this && (minDist == null || dist < minDist)){
        minDist = dist;
        minPlayer = p;
      }
    }
    return minPlayer;
  }

  // seek player farthest from the opponent
  mostOpenPlayer(){
    var maxPlayer = null;
    for(var i = 0; i < this.team.players.length; i++){
      var p = this.team.players[i];
      if (p !== this && (maxPlayer == null || p.distanceTo(p.closestOpponent) > maxPlayer.distanceTo(maxPlayer))){
        maxPlayer = p;
      }
    }
    return maxPlayer;
  }

  updateShootingProbability(){
    if(this.blockingNetPath != null){
      var currentRiskDist = this.dotDistance(this.blockingNetPath, [this, this.team.opponent.net])
      var distToNet = this.distanceTo(this.team.opponent.net)
      this.shootingProbability = distToNet == 0 ? 1 : Math.min(1, currentRiskDist/(2 * distToNet)); 
    }
  }

  updatePassingProbabilities(){
    if(this.passingBlockers != null){
      for(var i = 0; i < this.passingBlockers.length; i++){
        if(this.passingBlockers[i] != null){
          var currentRiskDist = this.dotDistance(this.passingBlockers[i], [this, this.team.players[i]])
          var distToPlayer = this.distanceTo(this.team.players[i])
          this.passingProbabilities[i] = distToPlayer == 0 ? 1 : Math.min(1, (currentRiskDist/(2 * distToPlayer)));
        }
        else{
          this.passingProbabilities[i] = 0;
        }
      }
    }
  }


  updatePotential(movedPlayer, t){
    // update openness AKA closestOpponent
    // either changes if an opponent moved or you moved
    if(movedPlayer === this){
      for (var i = 0; i < this.team.opponent.players.length; i++) {
        var o = this.team.opponent.players[i];
        if (this.closestOpponent == null || this.distanceTo(o) <= this.distanceTo(this.closestOpponent)){
          this.closestOpponent = o;
        }
      }
    }
    else if (t == "opponent"){
      if (this.closestOpponent == null || this.distanceTo(movedPlayer) <= this.distanceTo(this.closestOpponent)) this.closestOpponent = movedPlayer;
    }

    // update blockingNetPath (shooting)
    if(movedPlayer === this){
      for (var i = 0; i < this.team.opponent.players.length; i++) {
        var o = this.team.opponent.players[i];
        var curDD = this.dotDistance(o, [this, this.team.opponent.net]);
        if (this.blockingNetPath == null || curDD <= this.dotDistance(this.blockingNetPath, [this, this.team.opponent.net])){
          this.blockingNetPath = o;
        }
      }
      this.updateShootingProbability();
    }
    else if (t == "opponent"){
      var curDD = this.dotDistance(movedPlayer, [this, this.team.opponent.net])
      if (this.blockingNetPath == null || curDD <= this.dotDistance(this.blockingNetPath, [this, this.team.opponent.net])) this.blockingNetPath = o;
      this.updateShootingProbability();
    }

    // update clearness to other players (passing) if you move or opponent moves
    if (movedPlayer === this || t == "opponent"){
      for (var i = 0; i < this.team.players.length; i++) {
        var p = this.team.players[i];
        for (var x = 0; x < this.team.opponent.players.length; x++) {
          var o = this.team.opponent.players[x];
          var curDD = this.dotDistance(o, [this, p])
          if (this.passingBlockers[i] == null || curDD <= this.dotDistance(this.passingBlockers[i], [this, p])){
            this.passingBlockers[i] = o;
          }
        }
      }
      this.updatePassingProbabilities();
    }
    // update path to player if one of them moves
    else{
      for (var i = 0; i < this.team.players.length; i++) {
        var p = this.team.players[i];
        if (p === movedPlayer){
          for (var x = 0; x < this.team.opponent.players.length; x++) {
            var o = this.team.opponent.players[x];
            var curDD = this.dotDistance(o, [this, p])
            if (this.passingBlockers[i] == null || curDD <= this.dotDistance(this.passingBlockers[i], [this, p])){
              this.passingBlockers[i] = o;
            }
          }
        }
      }
      this.updatePassingProbabilities();
    }

    /*
    var currentDist = 1;
    console.log(this.opponent);
    this.opponent.players.forEach(function(o){
      currentDist *= Math.sqrt((this.x - o.x)**2 + (this.y - o.y)**2)
    });
    this.openness = currentDist;*/
  }


  activation(isActive, keys){
    this.active = isActive;
    this.releasedPuck = false;
    this.activeDirections = keys;
  }

  reset(){
    this.x = this.oX;
    this.y = this.oY;
    this.vX = 0;
    this.vY = 0;
    this.activeDirections = [];
    this.releasedPuck = false;
    this.team.notifyMove(this);
  }

  bestPass(){
    var bestPass = null;
    var bestPassScore = 0;
    var pp = this.passingProbabilities;
    for (var i = 0; i < this.team.players.length; i++){
      var p = this.team.players[i];
      if(p !== this){
        if (bestPass == null || pp[i] * p.shootingProbability > bestPassScore){
          bestPass = p;
          bestPassScore = pp[i] * p.shootingProbability;
        }
      }
    }
    return [bestPass, bestPassScore];
    // fix 
  }

  determineAction(){
    // neutral
    if (this.puck.owner == null){
      this.triggerKey(this.directionTo(this.puck));
    }

    // offense
    else if (this.puck.owner.team === this.team) {
      // currently has puck
      if (this.puck.owner === this){
        // determine to pass, shoot or move
        
        var [bestPass, bestPassScore] = this.bestPass();

        if (bestPassScore > this.shootingProbability){
          console.log("pass")
          this.triggerKey(67)//pass
        }
        else{
          console.log("shoot")
          this.triggerKey(88)//score
        }
      }
      else{
        this.triggerKey(this.directionTo(this.team.opponent.net));
      }
    }

    // defense
    else{
      if (this.position == "F"){
        this.triggerKey(this.directionTo(this.puck));
      }
      else{
       this.triggerKey(this.directionTo(this.team.net)); 
      }
      
    }
  }

  triggerKey(key){
    // shoot
    if (key == 88){
      if (this.puck.owner === this){
        this.shoot()
        this.puck.shoot();
      }
    }

    // switch player
    if (key == 67){
      if(this.puck.owner == this){
        this.pass();
      }
    }

    // movement
    var moveMap = {
      37: "left",
      38: "up",
      39: "right",
      40: "down"
    }

    if (key in moveMap && !(this.activeDirections.includes(moveMap[key]))){
      //this.activeDirections.push(moveMap[key]);
      this.activeDirections = [moveMap[key]];
    }
  }

  releaseKey(key){
    return;
  }
  
  update(){    
    //potentials updated in updatePotential

    // act
    if (!this.active){
      this.determineAction();
    }

    this.skate();
    this.move();
    this.checkPuck();
  }

  redraw(){
    this.ctx.fillStyle = this.team.colour; // change to team.color
    this.ctx.fillRect(this.x - this.r/2, this.y - this.r/2, this.r, this.r)

    if(this.active){
      this.ctx.strokeStyle = "blue";
      this.ctx.lineWidth = 3; 
      this.ctx.strokeRect(this.x - this.r/2 - 5/2, this.y - this.r/2 - 5/2, this.r + 5, this.r + 5)
    }
  }

  pass(){
    var [to, toScore] = this.bestPass();
    if(this.type == "user"){
      // to closest to the active player
      this.active = false;
      this.team.activePlayer = to;
      to.activation(true, this.activeDirections);
      this.activeDirections = [];
    }   

    this.releasedPuck = true;
    console.log(to);
    this.puck.pass(this, to);
    
    // fix bad passes?    
  }

  shoot(){
    this.releasedPuck = true;
    this.active = false;
    this.activeDirections = [];
  }

  skate(){
      if (!this.activeDirections.includes("left") && !this.activeDirections.includes("right")){
        this.vX += this.vX > 0 ? -this.friction : (this.vX < 0 ? this.friction : 0); 
      }
      if (!this.activeDirections.includes("up") && !this.activeDirections.includes("down")){
        this.vY += this.vY > 0 ? -this.friction : (this.vY < 0 ? this.friction : 0);
      }

      for (var i = 0; i < this.activeDirections.length; i++) {
        var key = this.activeDirections[i];
        switch(key) {
          case "left": // left
            this.vX -= this.vX > -this.vMax ? this.acceleration : 0;
            break;

          case "up": // up
            this.vY -= this.vY > -this.vMax ? this.acceleration : 0;
            break;

          case "right": // right
            this.vX += this.vX < this.vMax ? this.acceleration : 0;
            break;

          case "down": // down
            this.vY += this.vY < this.vMax ? this.acceleration : 0;
            break;

          default:
            return;
        }
      }
  }

  checkCollisions(obstacles, d){
    var up = this.updatedPosition(d);
    for (var i = 0; i < obstacles.length; i++) {
      var o = obstacles[i];
      if(o !== this){
       if (up[0] - this.r/2 <= o.x + o.width/2 && up[0] + this.r/2 >= o.x - o.width/2 &&
          up[1] - this.r/2 <= o.y + o.height/2 && up[1] + this.r/2 >= o.y - o.height/2) {
          return true;
        } 
      }
    }
    return false;
  }

  checkPuck(){
    if (this.x - this.r/2 <= this.puck.x + this.puck.r/2 && this.x + this.r/2 >= this.puck.x - this.puck.r/2 &&
        this.y - this.r/2 <= this.puck.y + this.puck.r/2 && this.y + this.r/2 >= this.puck.y - this.puck.r/2) {
      if(!this.releasedPuck && (this.puck.owner == null || this.puck.owner.team !== this.team)){
        
        // something sill wrong here?? active player ignoring input and going towards net
          if(this.puck.owner != null) this.puck.owner.releasedPuck = true;
          this.puck.take(this);
          this.releasedPuck = true;
          if(this.team.type == "user"){
            this.team.changeActivePlayer(this);
          }
      }      
    }
    else{
      this.releasedPuck = false;
    }
  }

  updatedPosition(d){
    return [d == "x" ? (this.x + this.vX - this.r/2 < 0 ? this.r/2 : (this.x + this.vX + this.r/2 >= this.maxWidth ? this.maxWidth - this.r/2 : this.x + this.vX)) : this.x, //x
            d == "y" ? (this.y + this.vY - this.r/2 < 0 ? this.r/2 : (this.y + this.vY + this.r/2 >= this.maxHeight ? this.maxHeight - this.r/2 : this.y + this.vY)) : this.y, //y
            d == "x" ? (this.x + this.vX - this.r/2 < 0 ? 0 : (this.x + this.vX + this.r/2 >= this.maxWidth ? 0 : this.vX)) : this.vX,
            d == "y" ? (this.y + this.vY - this.r/2 < 0 ? 0 : (this.y + this.vY + this.r/2 >= this.maxHeight ? 0 : this.vY)) : this.vY];
  }

  // add obstacles!!!
  move(){
    var xOld = this.x;
    var yOld = this.y;
    var obstacles = [this.team.net, this.team.opponent.net].concat(this.team.players);
    if (!this.checkCollisions(obstacles, "y")){
      var upY = this.updatedPosition("y");
      this.y = upY[1];
      this.vY = upY[3];
    }
    else{
      this.vY = 0;
    }
         

    if (!this.checkCollisions(obstacles, "x")){
      var upX = this.updatedPosition("x");
      this.x = upX[0];
      this.vX = upX[2];
    }
    else{
      this.vX = 0;
    }

    if(xOld != this.x || yOld != this.y){
      this.team.notifyMove(this);
    }
  }

}