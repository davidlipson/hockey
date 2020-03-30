class Player {
  constructor(x, y, r, w, h, ctx, name, team, puck) {
    this.x = x;
    this.y = y;
    this.oX = x;
    this.oY = y
    this.r = r;
    this.vX = 0;
    this.vY = 0;
    this.vMax = 5;
    this.width = w;
    this.height = h;
    this.ctx = ctx;
    this.name = name;
    this.team = team;
    this.puck = puck;
    this.active = false;
    this.activeDirections = [];
    this.releasedPuck = false;
    this.friction = 0.25;
    this.acceleration = 0.25;
    this.shootingPotential;
    this.passingPotentials;
    this.closestOpponent = null;
  }

  setPP(){
    this.passingPotentials = new Array(this.team.players.length).fill(0)
  }

  distanceTo(o){
    return Math.sqrt((this.x - o.x)**2 + (this.y - o.y)**2);
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


  updatePotential(movedPlayer, t){
    // update openness
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
    this.activeDirections = keys
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
  
  update(obstacles){
    // evaluate current status


      // evaluate best action

      // act
    if (this.active){
      this.skate();
      this.move(obstacles);
      this.checkPuck()
    }
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
      if (up[0] - this.r/2 <= o.x + o.width/2 && up[0] + this.r/2 >= o.x - o.width/2 &&
        up[1] - this.r/2 <= o.y + o.height/2 && up[1] + this.r/2 >= o.y - o.height/2) {
        return true;
      }
    }
    return false;
  }

  checkPuck(){
    if (this.x - this.r/2 <= this.puck.x + this.puck.r/2 && this.x + this.r/2 >= this.puck.x - this.puck.r/2 &&
        this.y - this.r/2 <= this.puck.y + this.puck.r/2 && this.y + this.r/2 >= this.puck.y - this.puck.r/2) {
      if(!this.releasedPuck){
        this.puck.take(this);
        this.releasedPuck = true;
      }      
    }
    else{
      this.releasedPuck = false;
    }
  }

  updatedPosition(d){
    return [d == "x" ? (this.x + this.vX - this.r/2 < 0 ? this.r/2 : (this.x + this.vX + this.r/2 >= this.width ? this.width - this.r/2 : this.x + this.vX)) : this.x, //x
            d == "y" ? (this.y + this.vY - this.r/2 < 0 ? this.r/2 : (this.y + this.vY + this.r/2 >= this.height ? this.height - this.r/2 : this.y + this.vY)) : this.y, //y
            d == "x" ? (this.x + this.vX - this.r/2 < 0 ? 0 : (this.x + this.vX + this.r/2 >= this.width ? 0 : this.vX)) : this.vX,
            d == "y" ? (this.y + this.vY - this.r/2 < 0 ? 0 : (this.y + this.vY + this.r/2 >= this.height ? 0 : this.vY)) : this.vY];
  }

  // add obstacles!!!
  move(obstacles){
    var xOld = this.x;
    var yOld = this.y;
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