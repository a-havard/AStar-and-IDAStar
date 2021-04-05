function PathNode(position, obstacle) {
  // G Cost is cost from start,
  // H Cost is cost to finish (heuristic)
  // Calculated: 14 * diagonal steps + 10 * straight steps
  this.gCost = Infinity;
  this.hCost = Infinity;
  this.fCost = Infinity;

  this.position = position;
  this.obstacle = obstacle;
}

PathNode.prototype.setCost = function(gCost, endPosition) {
  this.gCost = gCost;
  if (this.hCost === Infinity) {
    var diffX = Math.abs(this.position.x - endPosition.x);
    var diffY = Math.abs(this.position.y - endPosition.y);
    this.hCost = diffX > diffY ? 14 * diffY + 10 * (diffX - diffY) : 14 * diffX + 10 * (diffY - diffX);
  }
  this.fCost = this.gCost + this.hCost;
}

PathNode.prototype.genNodesToCheck = function(endPosition, grid) {
  let maxWidth = grid[0].length;
  let maxHeight = grid.length;
  let returnValue = [];

  for (var x=-1; x<=1; x++) {
    for (var y=-1; y<=1; y++) {
      if (x === 0 && y === 0) continue;
      let diffX = Math.abs(endPosition.x - (this.position.x + x));
      let diffY = Math.abs(endPosition.y - (this.position.y + y));
      let newPosition = {
        "x": this.position.x + x,
        "y": this.position.y + y,
        "fCost": (this.gCost + (x == 0 || y == 0 ? 10 : 14)) +
                  (diffX > diffY ? 14 * diffY + 10 * (diffX - diffY) : 14 * diffX + 10 * (diffY - diffX))
      };
      if (newPosition.x >= 0 && newPosition.x < maxWidth && newPosition.y >= 0 && newPosition.y < maxHeight && !grid[newPosition.y][newPosition.x].obstacle) {
        returnValue.push(newPosition);
      }
    }
  }

  return returnValue;
}
