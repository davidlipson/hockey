class Game {
  constructor(ctx, width, height) {
    this.ctx = ctx;
    this.cycle = 0;
    this.width = width;
    this.height = height;

    this.playersL = [
      new Player(300, 200, 25, width, height, ctx, "Bob", "red"),
      new Player(200, 100, 25, width, height, ctx, "Kate", "red"),
      new Player(200, 300, 25, width, height, ctx, "Adam", "red")
    ];

    this.playersR = [
      new Player(400, 200, 25, width, height, ctx, "Rob", "green"),
      new Player(500, 100, 25, width, height, ctx, "Nate", "green"),
      new Player(500, 300, 25, width, height, ctx, "Odem", "green")
    ];

    this.netL = new Net(50, this.height/2, 10, this.height/4, this.ctx, "LEFT")
    this.netR = new Net(this.width - 50, this.height/2, 10, this.height/4, this.ctx, "RIGHT")

    this.teamL = new Team(this.netL, this.playersL, "Team A", "red", "user");
    this.teamR = new Team(this.netR, this.playersR, "Team B", "green", "cpu");

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
    this.teamL.players.forEach(p => p.update([this.netL, this.netR], this.puck));
    this.teamR.players.forEach(p => p.update([this.netL, this.netR], this.puck));
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
  }
  
}