class Player {
  constructor(x, y, r, w, h, ctx, colour, active) {
    this.x = x;
    this.y = y;
    this.r = r;
    this.vX = 0;
    this.vY = 0;
    this.vMax = 10;
    this.width = w;
    this.height = h;
    this.ctx = ctx;
    this.colour = colour;
    this.active = active;
    this.activeDirections = [];
  }
  
  update(){
    this.skate();
    this.move();
  }

  redraw(){
    this.ctx.fillStyle = this.colour; // change to team.color
    this.ctx.fillRect(this.x - this.r/2, this.y - this.r/2, this.r, this.r)
  }

  skate(){
      if (this.activeDirections.length == 0){
        this.vY += this.vY > 0 ? -0.5 : (this.vY < 0 ? 0.5 : 0);
        this.vX += this.vX > 0 ? -0.5 : (this.vX < 0 ? 0.5 : 0); 
      }
      for (var i = 0; i < this.activeDirections.length; i++) {
        var key = this.activeDirections[i];
        console.log(key)
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


  move(){
    this.y += this.vY;
    if(this.y - this.r/2 < 0){
      this.y = this.r/2; 
      this.vY = 0;
    }
    if(this.y + this.r/2 >= this.height){
      this.y = this.height - this.r/2;
      this.vY = 0;
    }      

    this.x += this.vX;
    if(this.x - this.r/2 < 0){
      this.x = this.r/2;
      this.vX = 0;
    }
    if(this.x + this.r/2 >= this.width){
      this.x = this.width - this.r/2;
      this.vX = 0;
    }
  }

}