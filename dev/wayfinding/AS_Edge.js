'use strict'
class AS_Edge {
  constructor(id, nodeIds, type, cost, acc, speed, direction) {
    this.id = id;
    this.nodes = nodeIds;
    this.type = type;
    this.cost = cost;
    this.acc = acc;
    this.speed = speed;
    this.direction = direction;
  }
}

module.exports = AS_Edge;
