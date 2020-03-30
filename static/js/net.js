class Net {
  constructor(x, y, w, h, ctx, side) {
    this.x = x;
    this.y = y;
    this.height = h;
    this.width = w;
    this.ctx = ctx;
    this.goals = 0;
    this.side = side;
  }

  score(){
    this.goals++
  }
  
  redraw(){
    this.ctx.fillStyle = "black"; // change to team.color
    this.ctx.fillRect(this.x - this.width/2, this.y - this.height/2, this.width, this.height)
  }

}