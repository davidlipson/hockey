class Net {
  constructor(x, y, w, h, ctx) {
    this.x = x;
    this.y = y;
    this.h = h;
    this.w = w;
    this.ctx = ctx;
    this.goals = 0;
  }
  
  redraw(){
    this.ctx.fillStyle = "black"; // change to team.color
    this.ctx.fillRect(this.x - this.w/2, this.y - this.h/2, this.w, this.h)
  }

}