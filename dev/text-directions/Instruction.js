'use strict'
/** Class representing an Instruction. */
class Instruction {
  /**
   * Create an Instruction.
   * @param {object} model - The model object passed back from the /full payload
   */
  constructor() {}

  foldToBack(instruction) {
    // Fold it and its points accordingly
    // Make sure there if Front array
    if(!this.foldedPointsFront) {
      this.foldedPointsFront = [];
    }
    // Make sure there if Back array
    if(!this.foldedPointsBack) {
      this.foldedPointsBack = [];
    }

    // Add it
    // Add to front end
    this.foldedPointsBack.push(instruction);
  }

  foldInFront(instruction) {
    // Fold it and its points accordingly
    // Make sure there if Front array
    if(!this.foldedPointsFront) {
      this.foldedPointsFront = [];
    }
    // Make sure there if Back array
    if(!this.foldedPointsBack) {
      this.foldedPointsBack = [];
    }

    // Add it
    // Add to front end
    this.foldedPointsFront.push(instruction);
  }

  /**
   * @member {Number}   Instruction#entityId
   */
  /**
   * @member {Number}   Instruction#angleToLandmark
   */
  /**
   * @member {Number}   Instruction#angleToNext
   */
  /**
   * @member {Number}   Instruction#angleToNextOfPreviousDirection
   */
  /**
   * @member {String}   Instruction#direction
   */
  /**
   * @member {String}   Instruction#directionToLandmark
   */
  /**
   * @member {Number}   Instruction#distanceFromStartMeters
   */
  /**
   * @member {Number}   Instruction#distanceFromStartPixels
   */
  /**
   * @member {Number}   Instruction#distanceToNextMeters
   */
  /**
   * @member {Number}   Instruction#distanceToNextPixels
   */
  /**
   * @member {Number}   Instruction#floor
   */
  /**
   * @member {String}   Instruction#floorName
   */
  /**
   * @member {Array}   Instruction#foldedPointsBack
   */
  /**
   * @member {Array}   Instruction#foldedPointsFront
   */
  /**
   * @member {Destination}   Instruction#landmarkDestination
   */
  /**
   * @member {Waypoint}   Instruction#landmarkWP
   */
  /**
   * @member {String}   Instruction#output
   */
  /**
   * @member {Array}   Instruction#secondaryDirections
   */
  /**
   * @member {String}   Instruction#type
   */
  /**
   * @member {Waypoint}   Instruction#wp
   */
}

module.exports = Instruction
