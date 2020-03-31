class Team {
  constructor(net, name, colour, type) {
    this.net = net;
    this.name = name;
    this.colour = colour;
    this.type = type;
  }
  setOpponent(o){
    this.opponent = o;
  }

  setPlayers(players){
    this.players = players;

    if (this.type == "user"){
      this.activePlayer = this.players[0];
      this.activePlayer.activation(true, []);
    }
    else{
      this.activePlayer = null;
    }

    this.players.forEach(p => p.setPP());
  }

  notifyMove(movedPlayer){
    this.players.forEach(p => p.updatePotential(movedPlayer, "team"));
    this.opponent.players.forEach(p => p.updatePotential(movedPlayer, "opponent"));
  }

  update(){
    this.players.forEach(p => p.update());
  }

  updateActiveDirections(keys){
    if (this.type == "user"){
      if (this.activePlayer) this.activePlayer.activeDirections = keys; 
    }
  }

  randomPlayer(){
    var newIndex = Math.round(Math.random() * (this.players.length - 1));
    while (this.players[newIndex] === this.activePlayer){
      newIndex = Math.round(Math.random() * (this.players.length - 1));
    }
    return this.players[newIndex];
  }

  // switch to player closest to puck
  switchPlayer(puck){
    if(this.type == "user"){
      // cycling with probability so that each player gets chance
      var prob = Math.round(Math.random() * 10);
      var p;
      if (prob < 7){
        p = this.activePlayer.closestPlayer(puck);
      }
      else{
        p = this.randomPlayer();
      }
      
      this.changeActivePlayer(p);
    }
  }

  changeActivePlayer(p){
    var keys = this.activePlayer.activeDirections;

    this.activePlayer.activation(false, []);
    this.activePlayer = p;
    this.activePlayer.activation(true, keys); 
  }

  shoot(){
    if(this.type == "user"){
      this.activePlayer.shoot();
      this.activePlayer.puck.shoot();
    } 
  }

  reset(){
    if (this.type == "user"){
      this.activePlayer.activation(false, []);
      this.activePlayer = this.players[0];
      this.activePlayer.activation(true, []);
    }
    this.players.forEach(p => p.reset());
  }

}