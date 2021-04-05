function PathNode(position, obstacle) {
  // G Cost is cost from start,
  // H Cost is cost to finish (heuristic)
  // Calculated: 14 * diagonal steps + 10 * straight steps
  this.gCost = Infinity;
  this.hCost = Infinity;
  this.fCost = Infinity;

  this.source = {"x": 0, "y": 0};

  this.position = position;
  this.obstacle = obstacle;
}

PathNode.prototype.setCost = function(gCost, hCost, source) {
  if (gCost + hCost < this.fCost) {
    this.gCost = gCost;
    this.hCost = hCost;
    this.fCost = gCost + hCost;

    this.source = source;
  }
}

PathNode.prototype.runScan = function (board, endPos, ownIndex) {
  // Optimization Code (Starts checking in the direction this cell was checked)
  var startX = this.source.x == 1 ? -1 : 1;
  var startY = this.source.y == 1 ? -1 : 1;

  var endX = -startX;
  var endY = -startY;

  // Really odd-looking for loops, but it works
  for (var y=startY; y*endY<=endY*endY; y -= startY) {
    for (var x=startX; x*endX<=endX*endX; x -= startX) {
      // Checking if on self
      if (x == 0 && y == 0) continue;

      // Checking if on board
      if (this.position.x + x < 0 || this.position.y + y < 0 ||
          this.position.y + y >= board.grid.length ||
          this.position.x + x >= board.grid[this.position.y+y].length) continue;

      // Checking if closed
      if (board.findClosedNodeByPosition({"x": this.position.x + x,
                                          "y": this.position.y + y})) continue;

      // Checking if obstacle
      if (board.grid[this.position.y+y][this.position.x+x].obstacle) continue;

      // If diagonal, making sure open on both sides
      if (x != 0 && y != 0) {
        if (board.grid[this.position.y+y][this.position.x].obstacle ||
            board.grid[this.position.y][this.position.x+x].obstacle) continue;
      }

      // Find Distance from Target
      var xDistFromTarget = Math.abs(endPos.x - (this.position.x + x));
      var yDistFromTarget = Math.abs(endPos.y - (this.position.y + y));

      // Calculate G and H Cost
      var newGCost = this.gCost + 10;
      if (x != 0 && y != 0) newGCost += 4;

      var newHCost = 0;

      if (xDistFromTarget >= yDistFromTarget) {
        newHCost = yDistFromTarget * 14;
        newHCost += (xDistFromTarget - yDistFromTarget) * 10;
      } else {
        newHCost = xDistFromTarget * 14;
        newHCost += (yDistFromTarget - xDistFromTarget) * 10;
      }

      // Rreturn true if at the target square.
      if (newHCost == 0) return true;
      else {
        // Update new node and add it to the open nodes list.
        board.grid[this.position.y+y][this.position.x+x].setCost(newGCost,
                                                  newHCost, {"x": -x, "y": -y});

        // Prevent duplicate nodes from appearing on open noes list.
        var position = {"x": this.position.x + x, "y": this.position.y + y};
        if (!board.findOpenNodeByPosition(position))
          board.openPathNodes.push(position);
      }
    }
  }

  // Move self from open nodes to closed
  board.openPathNodes.splice(ownIndex, 1);
  board.closedPathNodes.push({"x": this.position.x, "y": this.position.y});

  return false;
}
