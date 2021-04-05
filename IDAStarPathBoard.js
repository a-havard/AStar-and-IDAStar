function PathBoard(grid) {
  this.startPosition;
  this.endPosition;

  this.grid = this.getGridFromStringArray(grid);

  if (typeof this.startPosition === "undefined") throw("No start position set");
  if (typeof this.endPosition === "undefined") throw("No end position set");

  this.grid[this.startPosition.y][this.startPosition.x].setCost(0, 0);

  this.bound = 0;
  this.min = Infinity;

  this.path = [];
  this.nodesToCheck = [];
  this.finished = false;

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
  if (this.finished) return true;

  this.loopsRun++;

  // Initialization
  if (this.bound === 0) {
    var diffX = Math.abs(this.startPosition.x - this.endPosition.x);
    var diffY = Math.abs(this.startPosition.y - this.endPosition.y);
    this.bound = diffX > diffY ? 14 * diffY + 10 * (diffX - diffY) : 14 * diffX + 10 * (diffY - diffX);

    this.initializePath();
    this.grid[this.startPosition.y][this.startPosition.x].hCost = Infinity;
  }

  if (this.nodesToCheck[this.nodesToCheck.length-1].length === 0) {
    // All paths at this position have been exhausted
    this.nodesToCheck.pop();
    this.path.pop();

    if (this.path.length === 0) {
      console.log(`No path found for bound of ${this.bound}!`);
      this.bound = this.min;
      this.min = Infinity;
      this.initializePath();
      if (this.bound === Infinity) {
        this.finished = true;
        console.log("Could not find a path!");
      }
    }
  } else {
    let newNode;
    do {
      let newNodePosition = this.nodesToCheck[this.path.length-1].pop(0);
      newNode = this.grid[newNodePosition.y][newNodePosition.x];
    } while (this.path.find(node => node.position.x === newNode.position.x && node.position.y === newNode.position.y) && this.nodesToCheck[this.path.length-1].length > 0);

    if (newNode) {
      var oldNode = this.path[this.path.length-1]
      newNode.setCost(oldNode.gCost + (oldNode.position.x !== newNode.position.x && oldNode.position.x !== newNode.position.y ? 14 : 10), this.endPosition);

      if (newNode.position.x === this.endPosition.x && newNode.position.y === this.endPosition.y) {
        // We found the optimal path
        console.log("Path found!");
        this.finished = true;
        return true;
      } else if (newNode.fCost > this.bound) {
        // New node is outside the previously set bound
        if (newNode.fCost < this.min) this.min = newNode.fCost;

        if (this.path.length === 0) {
          console.log(`No path found for bound of ${this.bound}!`);
          this.bound = this.min;
          this.min = Infinity;
          this.initializePath();
          if (this.bound === Infinity) {
            this.finished = true;
            console.log("Could not find a path!");
          }
        }
      } else {
        // New node is valid
        this.path.push(newNode);
        this.nodesToCheck.push(newNode.genNodesToCheck(this.endPosition, this.grid));
      }
    } else {
      // No new plaes to go at this position
      this.nodesToCheck.pop();
      this.path.pop();
    }
  }
}

PathBoard.prototype.initializePath = function() {
  this.path.push(this.grid[this.startPosition.y][this.startPosition.x]);
  this.nodesToCheck.push(this.grid[this.startPosition.y][this.startPosition.x].genNodesToCheck(this.endPosition, this.grid));
  this.grid[this.startPosition.y][this.startPosition.x].gCost = 0;
  this.grid[this.endPosition.y][this.endPosition.x].hCost = 0;
}
