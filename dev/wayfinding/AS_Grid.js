'use strict'
const AS_Node = require('./AS_Node.js');
const AS_Edge = require('./AS_Edge.js');

class AS_Grid {
  constructor(waypoints, paths, pathTypes, maps) {
    let settings = {
      verticalScale: 100
    };

    this.waypoints = waypoints;
    this.paths = paths;
    this.pathTypes = pathTypes;
    this.maps = maps;
    this.verticalScale = settings.verticalScale;
    this.moverTypes = [];
    this.nodes = [];
    this.edges = [];

    for(let i = 0; i < waypoints.length; i++) {
      let edges = this.generateEdges(waypoints[i].id);
      let neighbors = this.generateNeighbors(waypoints[i].id, edges);
      let node = new AS_Node(waypoints[i].id, waypoints[i].x, waypoints[i].y, this.getMapZValue(this.waypoints[i].mapId), this.waypoints[i].decisionPoint, this.waypoints[i].mapId, edges, neighbors);
      this.nodes.push(node);
    }

    for(let i = 0; i < this.pathTypes.length; i++) {
      if(this.pathTypes[i].pathTypeId != 1) {
        let pathTypeImg = '';
        if(this.pathTypes[i].pathtypeUri && this.pathTypes[i].pathtypeUri[0]) pathTypeImg = this.pathTypes[i].pathtypeUri[0].uri;
        let lObj = {
          moverId: this.pathTypes[i].pathTypeId,
          speed: this.pathTypes[i].speed,
          maxFloors: this.pathTypes[i].maxfloors,
          imagePath: pathTypeImg,
          accessiblity: this.pathTypes[i].accessibility,
          typeName: this.pathTypes[i].typeName
        };
        this.moverTypes.push(lObj);
      }
    }
  }

  getPathsWithWaypoint(wpid) {
    let pathsReturn = [];
    for(let i = 0; i < this.paths.length; i++) {
      for(let j = 0; j < this.paths[i].waypoints.length; j++) {
        if(this.paths[i].waypoints[j] == wpid) {
          pathsReturn.push(this.paths[i]);
        }
      }
    }
    return pathsReturn;
  }

  getPathTypeById(pathTypeId) {
    for(let i = 0; i < this.pathTypes.length; i++) {
      if(this.pathTypes[i].pathTypeId == pathTypeId) {
        return this.pathTypes[i];
      }
    }
    return null;
  }

  getWPById(wpid) {
    for(let i = 0; i < this.waypoints.length; i++) {
      if(this.waypoints[i].id == wpid) return this.waypoints[i];
    }
  }

  generateEdges(wpid) {
    let paths = this.getPathsWithWaypoint(wpid);
    let returnArray = [];
    for(let i = 0; i < paths.length; i++) {
      if(paths[i].status !== 0) {
        let pathType = this.getPathTypeById(paths[i].type);
        let edge = new AS_Edge(paths[i].id, paths[i].waypoints, paths[i].type, pathType.weight, pathType.accessibility, pathType.speed, paths[i].direction);
        returnArray.push(edge);
      }
    }
    return returnArray;
  }

  generateNeighbors(wpid, edges) {
    let neighbors = [];
    let srcWP = this.getWPById(wpid);
    let srcWPPos = {
      x: srcWP.x,
      y: srcWP.y,
      z: this.getMapZValue(srcWP.mapId)
    };
    for(let i = 0; i < edges.length; i++) {
      let currentEdge = edges[i];
      for(let j = 0; j < currentEdge.nodes.length; j++) {
        if(currentEdge.nodes[j] == wpid) continue;
        let currentWP = this.getWPById(currentEdge.nodes[j]);
        let wpStart = {
          x: currentWP.x,
          y: currentWP.y,
          z: this.getMapZValue(currentWP.mapId)
        };

        let distance = this.heuristic(wpStart, srcWPPos);

        let floorPref = 1;
        if(srcWPPos.z == wpStart.z) {
          floorPref = this.getFloorPreferenceMultiplier(currentWP.mapId);
        } else {

          if(currentEdge.direction !== 0) {
            if(currentEdge.direction == 1) {
              if(srcWPPos.z > wpStart.z) continue;
            } else if(currentEdge.direction == 2) {
              if(srcWPPos.z < wpStart.z) continue;
            }
          }
        }

        let totalCost = ((distance * currentEdge.cost) * floorPref) * ((Math.abs(wpStart.z - srcWPPos.z) / currentEdge.speed) + 1);

        let neighbor = {
          id: currentWP.id,
          cost: totalCost,
          acc: currentEdge.acc,
          edgeId: currentEdge.id,
          edgeTypeId: currentEdge.type,
          distance: distance,
          x: currentWP.x,
          y: currentWP.y,
          z: this.getMapZValue(currentWP.mapId)
        };
        neighbors.push(neighbor);
      }
    }
    return neighbors;
  }

  getFloorPreferenceMultiplier(mapId) {
    let currentMultiplier = 1;
    if(this.maps) {
      for(let i = 0; i < this.maps.length; i++) {
        if(this.maps[i].mapId == mapId) {
          if(!this.maps[i].preference) break;
          if(this.maps[i].preference === 0) {
            currentMultiplier = 1;
          } else if(this.maps[i].preference > 0) {
            currentMultiplier = currentMultiplier / (this.maps[i].preference + 1);
          } else if(this.maps[i].preference < 0) {
            currentMultiplier = currentMultiplier * (Math.abs(this.maps[i].preference) + 1);
          }
          break;
        }
      }
    }
    return currentMultiplier;
  }

  getMapZValue(mapId) {
    for(let i = 0; i < this.maps.length; i++) {
      if(this.maps[i].mapId == mapId) {
        return(this.maps[i].floorSequence * this.verticalScale);
      }
    }
    return null;
  }

  heuristic(start, end) {
    return Math.sqrt(Math.pow((start.x - end.x), 2) + Math.pow((start.y - end.y), 2) + Math.pow((start.z - end.z), 2));
  }
}

module.exports = AS_Grid;
