class Player {
  constructor(x, y, r, w, h, ctx, name, colour) {
    this.x = x;
    this.y = y;
    this.oX = x;
    this.oY = y
    this.r = r;
    this.vX = 0;
    this.vY = 0;
    this.vMax = 10;
    this.width = w;
    this.height = h;
    this.ctx = ctx;
    this.name = name;
    this.colour = colour;
    this.active = false;
    this.activeDirections = [];
    this.releasedPuck = false;
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
  }
  
  update(obstacles, puck){
    this.skate();
    this.move(obstacles);
    this.checkPuck(puck)
  }

  redraw(){
    this.ctx.fillStyle = this.colour; // change to team.color
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
        this.vX += this.vX > 0 ? -0.5 : (this.vX < 0 ? 0.5 : 0); 
      }
      if (!this.activeDirections.includes("up") && !this.activeDirections.includes("down")){
        this.vY += this.vY > 0 ? -0.5 : (this.vY < 0 ? 0.5 : 0);
      }

      for (var i = 0; i < this.activeDirections.length; i++) {
        var key = this.activeDirections[i];
        switch(key) {
          case "left": // left
            this.vX -= this.vX > -this.vMax ? 1 : 0;
            break;

          case "up": // up
            this.vY -= this.vY > -this.vMax ? 1 : 0;
            break;

          case "right": // right
            this.vX += this.vX < this.vMax ? 1 : 0;
            break;

          case "down": // down
            this.vY += this.vY < this.vMax ? 1 : 0;
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

  checkPuck(puck){
    if (this.x - this.r/2 <= puck.x + puck.r/2 && this.x + this.r/2 >= puck.x - puck.r/2 &&
        this.y - this.r/2 <= puck.y + puck.r/2 && this.y + this.r/2 >= puck.y - puck.r/2) {
      if(!this.releasedPuck){
        puck.owner = this;
        puck.lastOwner = this;
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
  }

}