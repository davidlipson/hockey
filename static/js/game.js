class Game {
  constructor(ctx, width, height, players, activePlayer) {
    this.cycle = 0;
    this.ctx = ctx;
    this.width = width;
    this.height = height;
    this.players = players;
    this.activePlayer = activePlayer;
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
    this.players.forEach(p => p.update());
  }

  redraw(){
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.players.forEach(p => p.redraw());
  }
  
}