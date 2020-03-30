class Game {
  constructor(ctx, width, height, players, activePlayer) {
    this.ctx = ctx;
    this.cycle = 0;
    this.width = width;
    this.height = height;

    this.players = players;

    this.activePlayer = activePlayer;
    this.netL = new Net(50, this.height/2, 10, this.height/4, this.ctx, "LEFT")
    this.netR = new Net(this.width - 50, this.height/2, 10, this.height/4, this.ctx, "RIGHT")
    this.puck = new Puck(this.width, this.height, this.ctx);

    this.pressedKeys = [];
  }

  clock(){
    try{
      this.cycle++;
      this.update();
      this.redraw(); 
    }
    catch(e){
      if (e.type == "goal"){
        e.net.score();
        alert(e.message);
      }

      this.reset();
    }
    
  }

  reset(){
    this.cycle = 0;
    this.pressedKeys = [];
    this.puck.reset();
    this.players.forEach(p => p.reset());
  }

  closestPlayer(obj){
    var minDist = null;
    var minPlayer = null;
    for(var i = 0; i < this.players.length; i++){
      var p = this.players[i];
      var dist = Math.sqrt((p.x - obj.x)**2 + (p.y - obj.y)**2)

      if (p !== this.activePlayer && (minDist == null || dist < minDist)){
        minDist = dist;
        minPlayer = p;
      }
    }
    return minPlayer;
  }

  switchPlayer(){
    // to closest to puck
    var minPlayer = this.closestPlayer(this.puck);

    this.activePlayer.activation(false, []);
    this.activePlayer = minPlayer;
    this.activePlayer.activation(true, this.pressedKeys);
  }

  pass(){
    // to closest to p
    var minPlayer = this.closestPlayer(this.activePlayer);

    var vX = (minPlayer.x - this.activePlayer.x )/5;
    var vY = (minPlayer.y - this.activePlayer.y)/5;

    this.activePlayer.pass();
    this.activePlayer = minPlayer;
    this.activePlayer.activation(true, this.pressedKeys);


    this.puck.pass(vX,vY);
  }

  updateActiveDirections(){
    if (this.activePlayer) this.activePlayer.activeDirections = this.pressedKeys;
  }

  update(){
    this.players.forEach(p => p.update([this.netL, this.netR], this.puck));
    this.puck.update([this.netL, this.netR]);
  }

  redraw(){
    // background
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.ctx.strokeStyle = "white";
    this.ctx.beginPath();
    this.ctx.arc(this.width/2, this.height/2, this.height/6, 0, 2 * Math.PI);
    this.ctx.stroke();
    this.ctx.beginPath();
    this.ctx.moveTo(this.width/2, 0);
    this.ctx.lineTo(this.width/2, this.height);
    this.ctx.stroke();

    // players
    this.players.forEach(p => p.redraw());

    //  nets
    this.netL.redraw();
    this.netR.redraw();

    // puck
    this.puck.redraw();
  }
  
}