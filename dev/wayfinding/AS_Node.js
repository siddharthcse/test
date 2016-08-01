'use strict'
class AS_Node {
  constructor(id, x, y, z, decisionPoint, mapId, edges, neighbors) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.z = z;
    this.decisionPoint = decisionPoint;
    this.mapId = mapId;
    this.edges = edges;
    this.f = 0;
    this.g = 0;
    this.h = 0;
    this.visited = false;
    this.closed = false;
    this.parent = null;
    this.neighbors = neighbors;
    this.usedEdgeTypeId = null;
  }
}

module.exports = AS_Node;
