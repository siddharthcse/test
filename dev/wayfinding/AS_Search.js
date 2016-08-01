'use strict'
const BinaryHeap = require('./BinaryHeap')
const AS_Grid = require('./AS_Grid')
const WayfinderData = require('./WayfinderData')

class AS_Search {

  constructor(waypoints, paths, pathTypes, maps) {
    this.grid = new AS_Grid(waypoints, paths, pathTypes, maps)
  }

  search(from, to, accessLevel) {
    this.cleanGrid()
    let start = this.getNodeById(from)
    let end = this.getNodeById(to)
    let openStartHeap = this.getHeap()

    start.h = 0
    openStartHeap.push(start)

    while(openStartHeap.size() > 0) {
      let currentNode = openStartHeap.pop()

      if(currentNode === end) {
        return this.pathTo(currentNode, start)
      }

      currentNode.closed = true

      let neighbors = this.getNeighbors(currentNode)

      for(let i = 0, il = neighbors.length; i < il; ++i) {
        let neighbor = neighbors[i]
        let neighborNode = this.getNeighborNodeObject(neighbor.id)

        if(neighbor.acc > accessLevel) {
          continue
        }

        let heur = 0

        if(neighborNode.closed) {
          continue
        }

        let gScore = currentNode.g + this.getNeighborCost(neighbor)
        let beenVisited = neighborNode.visited

        if(!beenVisited || ((gScore + heur) < neighborNode.f)) {
          neighborNode.visited = true
          neighborNode.parent = currentNode
          neighborNode.h = heur
          neighborNode.g = gScore
          neighborNode.f = neighborNode.g + heur
          neighborNode.usedEdgeTypeId = neighbor.edgeTypeId

          if(!beenVisited) {
            openStartHeap.push(neighborNode)
          } else {
            openStartHeap.rescoreElement(neighborNode)
          }

        }

      }
    }

    return []

  }

  cleanNode(node) {
    node.f = 0
    node.g = 0
    node.h = 0
    node.visited = false
    node.closed = false
    node.parent = null
    node.usedEdgeTypeId = null
  }

  cleanGrid() {
    for(let i = 0; i < this.grid.nodes.length; i++) {
      this.cleanNode(this.grid.nodes[i])
    }
  }

  getNodeById(id) {
    for(let i = 0; i < this.grid.nodes.length; i++) {
      if(id == this.grid.nodes[i].id) return this.grid.nodes[i]
    }
  }

  getHeap() {
    return new BinaryHeap(function(node) {
      return node.f
    });
  }

  pathTo(node, start) {
    let curr = node,
      path = [];
    while(curr.parent) {
      path.push(curr)
      curr = curr.parent
    }
    path.push(start)
    path = path.reverse()

    let floorArray = []
    let currentFloor = []
    let currentFloorId = -1
    for(let i = 0; i < path.length; i++) {

      if(i === 0) {
        currentFloorId = path[i].mapId
      }

      if(path[i].mapId != currentFloorId) {
        let pointSet = new WayfinderData({
          seq: (path[i - 1].z / this.grid.verticalScale),
          mapId: currentFloorId,
          mover: this.getPathTypeById(path[i].usedEdgeTypeId),
          points: currentFloor.slice(0),
          cost: path[i].f
        })

        floorArray.push(pointSet)
        currentFloor = []
        currentFloorId = path[i].mapId
      }

      //NOTE: Using entire path object, it is needed for Textdirections.
      currentFloor.push(path[i])

      if(i == path.length - 1) {

        let pointSet = new WayfinderData({
          seq: (path[i].z / this.grid.verticalScale),
          mapId: currentFloorId,
          mover: this.getPathTypeById(path[i].usedEdgeTypeId),
          points: currentFloor,
          cost: path[i].f
        })

        floorArray.push(pointSet)
      }
    }
    return floorArray
  }

  getNeighbors(node) {
    return node.neighbors
  }

  getNeighborNodeObject(id) {
    for(let i = 0; i < this.grid.nodes.length; i++) {
      if(id == this.grid.nodes[i].id) return this.grid.nodes[i]
    }
  }

  getNeighborCost(neighbor) {
    return neighbor.cost
  }

  getPathTypeById(typeId) {
    for(let i = 0; i < this.grid.moverTypes.length; i++) {
      if(this.grid.moverTypes[i].moverId == typeId) return this.grid.moverTypes[i]
    }
    return null

  }

  heuristic(start, end) {
    return Math.abs(start.x - end.x) + Math.abs(start.y - end.y) + Math.abs(start.z - end.z)
  }

}

module.exports = AS_Search
