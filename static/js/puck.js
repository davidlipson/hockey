class Puck {
  constructor(w, h, ctx) {
    this.x = w/2 - 200;
    this.y = h/2;
    this.width = w;
    this.height = h;
    this.vX = 0;
    this.vY = 0;
    this.shootMax = .1;
    this.passMax = .1;
    this.r = 10;
    this.ctx = ctx;
    this.owner = null;
    this.lastOwner = null;
    this.absorb = 0.5;
  }

  take(p){
    this.owner = p;
  }
  
  redraw(){
    this.ctx.fillStyle = "black";
    this.ctx.beginPath();
    this.ctx.arc(this.x, this.y, this.r, 0, 2 * Math.PI);
    this.ctx.fill();
  }

  update(obstacles){
    if (this.owner != null){
      this.x = this.owner.x;
      this.y = this.owner.y;
    }
    // else moving on its own
    else{
      this.slide()
      this.move(obstacles)
    }
  }

  shoot(){
    // set initial vX and vY of shot
    // change this to aim at the owner/player's oppononents net
    if(this.owner != null){
      this.vX = this.owner.accuracy*this.shootMax*(this.owner.team.opponent.net.x - this.owner.x);
      this.vY = this.owner.accuracy*this.shootMax*(this.owner.team.opponent.net.y - this.owner.y);
      this.lastOwner = this.owner;
      this.owner = null; 
    }
    
  }

  pass(target){
    if(this.owner != null){
      this.vX = this.owner.accuracy*this.passMax*(target.x - this.owner.x);
      this.vY = this.owner.accuracy*this.passMax*(target.y - this.owner.y);
      this.lastOwner = this.owner;
      this.owner = null;  
    }
  }

  // update this to check entire path for really fast shots (may go through net completely)
  checkCollisions(obstacles, d){
    var up = this.updatedPosition(d);
    for (var i = 0; i < obstacles.length; i++) {
      var o = obstacles[i];
      if (up[0] - this.r/2 <= o.x + o.width/2 && up[0] + this.r/2 >= o.x - o.width/2 &&
        up[1] - this.r/2 <= o.y + o.height/2 && up[1] + this.r/2 >= o.y - o.height/2) {
        if (o instanceof Net){
          throw {
            type: "goal",
            net: o,
            message: `Goal scored by ${this.lastOwner.name} on ${o.side}!`
          };
        }
        return true;
      }
    }
    return false;
  }

  // deflection
  updatedPosition(d){
    return [d == "x" ? (this.x + this.vX - this.r/2 < 0 ? this.r/2 : (this.x + this.vX + this.r/2 >= this.width ? this.width - this.r/2 : this.x + this.vX)) : this.x, //x
            d == "y" ? (this.y + this.vY - this.r/2 < 0 ? this.r/2 : (this.y + this.vY + this.r/2 >= this.height ? this.height - this.r/2 : this.y + this.vY)) : this.y, //y
            d == "x" ? (this.x + this.vX - this.r/2 < 0 ? -this.absorb*this.vX : (this.x + this.vX + this.r/2 >= this.width ? -this.absorb*this.vX : this.vX)) : this.vX,
            d == "y" ? (this.y + this.vY - this.r/2 < 0 ? -this.absorb*this.vY : (this.y + this.vY + this.r/2 >= this.height ? -this.absorb*this.vY : this.vY)) : this.vY];
  }

  slide(){
      this.vX += this.vX > 0 ? -0.5 : (this.vX < 0 ? 0.5 : 0); 
      this.vY += this.vY > 0 ? -0.5 : (this.vY < 0 ? 0.5 : 0);
  }

  // add obstacles!!!
  move(obstacles){
    var upY = this.updatedPosition("y");
    if (!this.checkCollisions(obstacles, "y")){
      this.y = upY[1];
      this.vY = upY[3];
    }
    else{
      this.y = this.y - this.absorb*this.vY;
      this.vY = -this.absorb*this.vY;

    }
         
    var upX = this.updatedPosition("x");
    if (!this.checkCollisions(obstacles, "x")){
      this.x = upX[0];
      this.vX = upX[2];
    }
    else{
      this.x = this.x - this.absorb*this.vX;
      this.vX = -this.absorb*this.vX;
    }
  }

  reset(){
    this.x = this.width/2 - 200;
    this.y = this.height/2;
    this.vX = 0;
    this.vY = 0;
    this.owner = null;
    this.lastOwner = null;
  }

}