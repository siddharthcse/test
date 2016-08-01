'use strict'
const makeTextDirections = require('./makeTextDirections')
const lineOfSight = require('./lineOfSight')

/** Class representing an InstructionCompiler object used to generate text directions from an array of #WayfindData*/
class InstructionCompiler {
  /**
   * Create a new InstructionCompiler object
   * @param {JMap} jmap - constructed jmap object
   */
  constructor(jmap) {
    //Build shapes object
    let self = this;
    this.shapes = {}
    jmap.MapCollection.getAll().forEach((map) => {
      self.shapes[map.mapId] = {
        lboxes: map.lboxes
      }
    })

    this.model = {
      getWaypointInformation(x) {
        return jmap.MapCollection.getWaypointByWaypointId(x)
      },
      getFloorBySequence(x) {
        return jmap.MapCollection.getByFloorSequence(x)
      },
      getFloorById(x) {
        return jmap.MapCollection.getByMapId(x)
      },
      getDestinationByWaypointId(x) {
        return jmap.DestinationCollection.getByWaypointId(x)
      },
      getWaypointsByDestinationId(x) {
        return jmap.MapCollection.getWaypointsByDestinationId(x)
      },
      destinations: jmap.DestinationCollection.getAll()
    }

    //Init methods
    makeTextDirections(this)
    lineOfSight(this)
  }

}

/** Wrapper Class representing a TextDirections object used to generate text directions from an array of #WayfindData*/
class TextDirections {
  /**
   * Create a new TextDirections object
   * @param {JMap} jmap - constructed jmap object
   */
  constructor(jmap) {
    /**
     * @member {Object}   TextDirections#directionData
     */
    this.directionData = {
      filter: true,
      UTurnInMeters: 30,
      addTDifEmptyMeters: 50
    }

    /**
     * @member {InstructionCompiler}   TextDirections#compiler
     */
    this.compiler = new InstructionCompiler(jmap)
  }

  /**
   * Get Array of Instructions from an array of WayfindData
   * @param {Array/WayfindData} pointArray - Number representing each Maps floorSequence
   * @param {Boolean} filter - Filter instructions or not, based on Jibestream standard algorithm
   * @param {Number} UTurnInMeters - Amount of meters used in order to justify a Utrn has occured (set to 0 to disable uturns)
   * @param {Number} addTDifEmptyMeters - Amount of meters to justify a 'Continue past' instruction
   * @return {Array/Instructions}
   */
  compile(pointArray, filter, UTurnInMeters, addTDifEmptyMeters) {
    if(!pointArray || pointArray.length === 0) {
      throw new TypeError('TextDirections :: pointArray must have length greater than zero.')
    }

    return this.compiler.makeTextDirections({
      pointArray,
      filter: filter || this.directionData.filter,
      UTurnInMeters: UTurnInMeters || this.directionData.UTurnInMeters,
      addTDifEmptyMeters: addTDifEmptyMeters || this.directionData.addTDifEmptyMeters
    })
  }
}

module.exports = TextDirections
