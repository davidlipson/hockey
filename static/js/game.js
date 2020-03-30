class Game {
  constructor(ctx, width, height, players, activePlayer) {
    this.cycle = 0;
    this.ctx = ctx;
    this.width = width;
    this.height = height;
    this.players = players;
    this.activePlayer = activePlayer;
    this.netL = new Net(50, this.height/2, 10, this.height/4, this.ctx)
    this.netR = new Net(this.width - 50, this.height/2, 10, this.height/4, this.ctx)
  }

  clock(){
    this.cycle++;
    this.update();
    this.redraw();
  }

  updateActiveDirections(keys){
    if (this.activePlayer) this.activePlayer.activeDirections = keys;
  }

  update(){
    this.players.forEach(p => p.update([this.netL, this.netR]));
  }

  redraw(){
    this.ctx.clearRect(0, 0, this.width, this.height);

    this.players.forEach(p => p.redraw());

    this.netL.redraw();
    this.netR.redraw();
  }
  
}