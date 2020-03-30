class Team {
  constructor(net, players, name, colour, type) {
    this.net = net;
    this.players =players;
    this.name = name;
    this.colour = colour;
    this.type = type;

    if (type == "user"){
      this.activePlayer = this.players[0];
      this.activePlayer.activation(true, []);
    }
    else{
      this.activePlayer = null;
    }
  }

  updateActiveDirections(keys){
    if (this.type == "user"){
      if (this.activePlayer) this.activePlayer.activeDirections = keys; 
    }
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

  switchPlayer(puck, keys){
    if(this.type == "user"){
       // to closest to puck
      var minPlayer = this.closestPlayer(puck);

      this.activePlayer.activation(false, []);
      this.activePlayer = minPlayer;
      this.activePlayer.activation(true, keys); 
    }
  }

  pass(puck, keys){
    if(this.type == "user"){
      // to closest to p
      var minPlayer = this.closestPlayer(this.activePlayer);

      var vX = (minPlayer.x - this.activePlayer.x )/5;
      var vY = (minPlayer.y - this.activePlayer.y)/5;

      this.activePlayer.pass();
      this.activePlayer = minPlayer;
      this.activePlayer.activation(true, keys);

      puck.pass(vX,vY);
    } 
  }

  reset(){
    this.players.forEach(p => p.reset());
  }

}