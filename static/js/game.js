class Game {
  constructor(ctx, width, height) {
    this.ctx = ctx;
    this.cycle = 0;
    this.width = width;
    this.height = height;

    this.netL = new Net(50, this.height/2, 10, this.height/4, this.ctx, "LEFT")
    this.netR = new Net(this.width - 50, this.height/2, 10, this.height/4, this.ctx, "RIGHT")

    this.puck = new Puck(this.width, this.height, this.ctx);

    this.teamL = new Team(this.netL, "Team A", "red", "user");
    this.teamR = new Team(this.netR, "Team B", "green", "cpu");

    this.playersL = [
      new Player(300, 200, 25, width, height, ctx, "Bob", this.teamL, this.puck),
      new Player(200, 100, 25, width, height, ctx, "Kate", this.teamL, this.puck),
      new Player(200, 300, 25, width, height, ctx, "Adam", this.teamL, this.puck)
    ];

    this.playersR = [
      new Player(400, 200, 25, width, height, ctx, "Rob", this.teamR, this.puck),
      new Player(500, 100, 25, width, height, ctx, "Nate", this.teamR, this.puck),
      new Player(500, 300, 25, width, height, ctx, "Odem", this.teamR, this.puck)
    ];

    this.teamL.setOpponent(this.teamR);
    this.teamR.setOpponent(this.teamL);
    this.teamL.setPlayers(this.playersL);
    this.teamR.setPlayers(this.playersR);

    this.pressedKeys = [];
  }

  clock(){
    try{
      this.cycle++;
      this.update();
      this.redraw(); 
    }
    catch(e){
      console.log(e);
      if (e.type == "goal"){
        e.net.score();
      }

      this.reset();
    }
    
  }

  reset(){
    this.cycle = 0;
    this.pressedKeys = [];
    this.puck.reset();
    this.teamL.reset();
    this.teamR.reset();
  }


  switchPlayer(){
    this.teamL.switchPlayer(this.puck, this.pressedKeys);
    this.teamR.switchPlayer(this.puck, this.pressedKeys);
  }

  pass(){
    this.teamL.pass(this.puck, this.pressedKeys);
    this.teamR.pass(this.puck, this.pressedKeys);
  }

  updateActiveDirections(){
    this.teamL.updateActiveDirections(this.pressedKeys);
    this.teamR.updateActiveDirections(this.pressedKeys);
  }

  update(){
    this.teamL.update([this.netL, this.netR]);
    this.teamR.update([this.netL, this.netR])
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
    this.teamL.players.forEach(p => p.redraw());
    this.teamR.players.forEach(p => p.redraw());

    //  nets
    this.netL.redraw();
    this.netR.redraw();

    // puck
    this.puck.redraw();

    // scores
    this.ctx.font = "30px Verdana";
    this.ctx.fillText(`${this.netL.goals}`, 3*this.width/4, this.height-20);
    this.ctx.fillText(`${this.netR.goals}`, this.width/4, this.height-20);
  }
  
}