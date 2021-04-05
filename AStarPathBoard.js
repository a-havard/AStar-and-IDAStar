function PathBoard(grid) {
  this.startPosition;
  this.endPosition;

  this.grid = this.getGridFromStringArray(grid);

  if (typeof this.startPosition === "undefined") throw("No start position set");
  if (typeof this.endPosition === "undefined") throw("No end position set");

  this.openPathNodes = [];
  this.closedPathNodes = [];

  this.grid[this.startPosition.y][this.startPosition.x].setCost(0, 0,
                                                            {"x": 0, "y": 0});
  this.openPathNodes.push(this.startPosition);

  this.path = [];

  this.loopsRun = 0;
}

PathBoard.prototype.getGridFromStringArray = function(grid) {
  var retVal = [];
  for (var y=0; y<grid.length; y++) {
    retVal.push([]);
    for (var x=0; x<grid[y].length; x++) {
      switch (grid[y][x]) {
        case " ":
          retVal[y].push(new PathNode({"x": x, "y": y}, false));
          break;
        case "x":
          retVal[y].push(new PathNode({"x": x, "y": y}, true));
          break;
        case "s":
          this.startPosition = {"x": x, "y": y};
          retVal[y].push(new PathNode({"x": x, "y": y}, false));
          break;
        case "e":
          this.endPosition = {"x": x, "y": y};
          retVal[y].push(new PathNode({"x": x, "y": y}, false));
          break;
        default:
          console.warn("Don't know what to do with character: " + retVal[y][x]);
      }
    }
  }

  return retVal;
}

PathBoard.prototype.runTurn = function() {
  if (this.path.length > 0) return;

  this.loopsRun++;

  var topPathNode = this.grid[this.openPathNodes[0].y][this.openPathNodes[0].x];
  var minFCost = topPathNode.fCost;
  var minHCost = topPathNode.hCost;
  var bestNode = topPathNode;
  var bestIndex = 0;

  for (var i=1; i<this.openPathNodes.length; i++) {
    var currNode = this.grid[this.openPathNodes[i].y][this.openPathNodes[i].x];
    if (currNode.fCost < minFCost ||
        (currNode.fCost <= minFCost && currNode.hCost < minHCost)) {
      minFCost = currNode.fCost;
      minHCost = currNode.hCost;
      bestNode = currNode;
      bestIndex = i;
    }
  }

  if (bestNode.runScan(this, this.endPosition, bestIndex)) {
    // Found Route
    this.path.splice(0, 0, this.endPosition);
    
    var pos = bestNode.position;
    while (pos.x != this.startPosition.x || pos.y != this.startPosition.y) {
      this.path.splice(0, 0, pos);
      var move = this.grid[pos.y][pos.x].source;
      var temp = {"x": pos.x + move.x, "y": pos.y + move.y};
      pos = temp;
    }

    this.path.splice(0, 0, this.startPosition);

    return true;
  }

  return false;
}

PathBoard.prototype.findOpenNodeByPosition = function(position) {
  for (var i=0; i<this.openPathNodes.length; i++) {
    if (this.openPathNodes[i].x == position.x &&
        this.openPathNodes[i].y == position.y) return true;
  }
  return false;
}

PathBoard.prototype.findClosedNodeByPosition = function(position) {
  for (var i=0; i<this.closedPathNodes.length; i++) {
    if (this.closedPathNodes[i].x == position.x &&
        this.closedPathNodes[i].y == position.y) return true;
  }
  return false;
}
