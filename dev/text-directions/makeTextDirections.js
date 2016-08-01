var __ = require('./helpers');
var filterNo1TakeOutDirectionsBetweenLastAndFirst = require('./filter/end-as-landmark');
var filterNo2StartDirectionCleanUpAllWhichUseDestinationAsLandmarks = require('./filter/start-as-landmark');
var filterNo3UTurnDetection = require('./filter/uturn');
var filterNo4RemoveConsecutiveForwards = require('./filter/consecutive-forwards');
var filterNo5RedundantInstructionsInMiddleInstructionsComboDirections = require('./filter/combo-directions');
var filterNo6ContinuePastFiller = require('./filter/continue-past');

const Instruction = require('./Instruction')

module.exports = function(processor) {

  processor.makeTextDirections = function(options) {
    console.time('makeTextDirections');
    var wayfindArray = options.pointArray;
    var filterOn = options.filter;
    var UTurnInMeters = options.UTurnInMeters;
    var addTDifEmptyMeters = options.addTDifEmptyMeters;

    // Protect code
    if(wayfindArray.length === 0) {
      // Do not proceed
      throw '!'
      return null;
    }

    // Array of text directions
    var textDirectionsForAllFloorsArray = [];
    // Text directions of One floor
    // First node
    var firstNode = null;
    // Direction to next point will always be from 0 to 360
    // Negative means start
    // This angle will be carried to next direction to figure out turning direction
    var previousAngle = -1;

    // NOTE: Once we figure out which floor mover will take us to, skip all other floors in sequence
    var moverTakesUsToFloor = null;

    for(var i = 0; i < wayfindArray.length; i++) {
      var useArrayOfFloorWaypoints = wayfindArray[i];
      var textDirectionsFloorArray = [];

      // Loop throught all
      // Continue if this is not the next floor
      if(moverTakesUsToFloor) {
        // Skip if not expected floor
        if(moverTakesUsToFloor != useArrayOfFloorWaypoints) {
          continue;
        }
      }
      // Reset moverTakesUsToFloor
      moverTakesUsToFloor = null;

      firstNode = useArrayOfFloorWaypoints.points[0];

      if(firstNode) {
        // Make next text instruction
        // Get arrayOfFloorWaypoints for input floor
        var currentFloorTextDirection = this.model.getFloorById(firstNode.mapId);
        var curCanvas = this.shapes[firstNode.mapId].lboxes;

        if(currentFloorTextDirection.mapId == firstNode.mapId) {
          // Got it

          // Make new set of text directions for this floor
          var nextNode = null;
          if(useArrayOfFloorWaypoints.points.length > 1) {
            nextNode = useArrayOfFloorWaypoints.points[1];
          }

          // Populate basic info
          var nextDir = this.makeTextDirectionInstruction(
            wayfindArray,
            useArrayOfFloorWaypoints,
            currentFloorTextDirection,
            firstNode,
            nextNode, -1);

          // Carry angle to next for next step and call it previousAngle
          previousAngle = nextDir.angleToNext;

          // Coming from ...?
          // 'Arrive at *'
          var startingFrom = '';
          var usingLandmark = false;

          // Absolute start?
          //Get Edge type ID
          // if (firstNode.usedEdgeTypeId == -1) {
          if(i === 0) {
            // console.log('Absolute start');

            // This will always be the case if this is the absolute start
            // Make sure we have nearest destination
            if(nextDir.destination) {
              startingFrom = nextDir.destination.name;
            } else {
              // Find nearest Destination
              //...
              if(nextDir.landmarkDestination) {
                startingFrom = nextDir.landmarkDestination.name;
                usingLandmark = true;
              } else {
                startingFrom = 'Nearest Destination';
              }
            }
          } else if(firstNode.usedEdgeTypeId == 1) {
            // Not sure this will ever be the case
            startingFrom = nextDir.destination.name;
          }
          // Mover?
          // //if(firstNode.usedEdgeTypeId == 3)
          else {
            // console.log('Mover');

            startingFrom = 'Mover';
            // Go to parent node floor and pick up mover info
            // var parentWaypoint = this.model.getWaypointInformation(firstNode.id); //firstNode.parent.nodeId
            var parentWaypoint = this.model.getWaypointInformation(firstNode.parent.id); //firstNode.parent.nodeId
            // Find floor info
            // Get arrayOfFloorWaypoints for input floor
            for(var k = 0; k < wayfindArray.length; k++) {
              var arrayOfFloorWaypoints = wayfindArray[k];
              // From Direction
              // Get current
              var tempNode = arrayOfFloorWaypoints.points[0];
              if(tempNode) {
                // Same floor as parent?
                if(parentWaypoint.mapId == tempNode.mapId) {
                  // Got it
                  startingFrom = arrayOfFloorWaypoints.mover ? arrayOfFloorWaypoints.mover.typeName : 'Mover';

                  // Break
                  break;
                }
              }
            }
          }

          // Output
          if(usingLandmark) {
            nextDir.output = __.stringWithFormat('With % on your %, go %.', startingFrom, nextDir.directionToLandmark, nextDir.direction);
          } else {
            nextDir.output = __.stringWithFormat('With % behind you, go %.', startingFrom, nextDir.direction);
          }

          //Set type
          nextDir.type = 'orientation';

          // Add to array
          textDirectionsFloorArray.push(nextDir);

          // Decision points
          // Get previous, current and next
          for(var l = 1; l < (useArrayOfFloorWaypoints.points.length - 1); l++) {
            // Get current
            var curentNode = useArrayOfFloorWaypoints.points[l];
            // Get next
            nextNode = useArrayOfFloorWaypoints.points[l + 1];
            // Make next text instruction
            nextDir = this.makeTextDirectionInstruction(
              wayfindArray,
              useArrayOfFloorWaypoints,
              currentFloorTextDirection,
              curentNode,
              nextNode,
              previousAngle);
            // Carry angle to next for next step and call it previousAngle
            previousAngle = nextDir.angleToNext;
            // Output
            if(nextDir.landmarkDestination) {

              nextDir.output = __.stringWithFormat(
                'With % on your %, go %.',
                nextDir.landmarkDestination.name,
                nextDir.directionToLandmark,
                nextDir.direction
              );

              //Set type
              nextDir.type = 'orientation';

              // Add to array
              textDirectionsFloorArray.push(nextDir);
            }

          }

          // Last?
          // Get current
          var lastNode = useArrayOfFloorWaypoints.points[useArrayOfFloorWaypoints.points.length - 1];
          if(lastNode) {
            // Add last
            // Make last text instruction
            nextDir = this.makeTextDirectionInstruction(
              wayfindArray,
              useArrayOfFloorWaypoints,
              currentFloorTextDirection,
              lastNode,
              null,
              previousAngle);

            // 'Arrive at... ?
            var lastDirection = '';

            if(!useArrayOfFloorWaypoints.mover || useArrayOfFloorWaypoints.mover.pathTypeId == 1) {
              void 0;
              // Final destination
              var de = nextDir.destination;
              nextDir.type = 'end';
              lastDirection = __.stringWithFormat('Arrive at %.', de ? de.name : 'destination');
            }
            // Mover?
            else {
              // Mover Name
              var moverName = useArrayOfFloorWaypoints.mover.typeName;

              // Mover Direction
              var floorAfter = wayfindArray[i + 1];
              var moverGoesToLevel = '';
              var nextSeq = null;
              if(floorAfter) {
                nextSeq = floorAfter.seq;
              }
              if(nextSeq > useArrayOfFloorWaypoints.seq) {
                // Up
                nextDir.direction = 'Up';
              } else if(nextSeq < useArrayOfFloorWaypoints.seq) {
                // Down
                nextDir.direction = 'Down';
              } else {
                // Unknown
                nextDir.direction = 'Unknown Mover Direction';
              }

              // Let's try to figure out how far we can go
              // var moverId = useArrayOfFloorWaypoints.mover;
              // Get next floor by going one array up/down using wayfind array
              // Get next array using floorIndex
              // pathTypeId:
              // 2 == Elevator
              // 4 == Stairs
              // 3 == Escalator
              // Get index of current floor
              var flIndex = wayfindArray.indexOf(useArrayOfFloorWaypoints);
              var previousFloorNodeId = lastNode.id;
              var highestFloorSeq = useArrayOfFloorWaypoints.seq;
              var keepLooking = true;
              while(keepLooking) {
                // Get next floor index
                flIndex++;
                // Can it be?
                if((wayfindArray.length > flIndex) && (flIndex >= 0)) {
                  // Get next floor
                  var nextArrayOfFloorWaypoints = wayfindArray[flIndex];

                  // Logic: Is the first node same as previous (parent node) AND
                  // Is first node same as last node AND
                  // Is first next node same as last next node
                  var pts = nextArrayOfFloorWaypoints.points;
                  var firstNodeNext = pts[0];
                  var lastNodeNext = pts[pts.length - 1];

                  // Is the first node same as previous (parent node)
                  if(previousFloorNodeId == firstNodeNext.parent.id) {
                    // Yes
                    // This is new highest floor
                    highestFloorSeq = nextArrayOfFloorWaypoints.seq;

                    // Remember it so we don't generate text directions for skipped floors
                    moverTakesUsToFloor = nextArrayOfFloorWaypoints;

                    // First node same as next node
                    if(firstNodeNext.id == lastNodeNext.id) {
                      // There is a possibility we can go higher
                      previousFloorNodeId = lastNodeNext.id;
                    } else {
                      // Cannot continue
                      keepLooking = false;
                    }
                  } else {
                    // No match
                    // This would be odd
                    keepLooking = false;
                  }
                } else {
                  // No more floors, out of the loop
                  keepLooking = false;
                }
              }
              // Get next floor
              var finalNextFloor = this.model.getFloorBySequence(highestFloorSeq);
              moverGoesToLevel = finalNextFloor.name;

              // Translate Mover information
              nextDir.type = 'mover';
              nextDir.moverType = moverName;
              lastDirection = __.stringWithFormat('Take % %, to %', moverName, nextDir.direction, moverGoesToLevel);
            }

            // Output
            nextDir.output = lastDirection;

            // Angle to next
            nextDir.angleToNext = -1;

            // Add to array
            textDirectionsFloorArray.push(nextDir);
          }
        } else {
          return null;
        }

        // Filter?
        //filterOn = false;
        if(filterOn) {
          // console.log('Instructions to start with:', textDirectionsFloorArray.length);

          // Get scale
          // this is a float of how many milimeters are prepresented by one pixel on the map
          var currentFloor = this.model.getFloorById(useArrayOfFloorWaypoints.mapId);
          var xScale = currentFloor.xScale;
          var yScale = currentFloor.yScale;
          var enableDistanceFilters = ((xScale > 0) && (yScale > 0));

          var instruction = {
            textDirectionsFloorArray: textDirectionsFloorArray,
            useArrayOfFloorWaypoints: useArrayOfFloorWaypoints,
            wayfindArray: wayfindArray,
            filterOn: filterOn,
            addTDifEmptyMeters: addTDifEmptyMeters,
            UTurnInMeters: UTurnInMeters,
            enableDistanceFilters: enableDistanceFilters,
            xScale: xScale,
            yScale: yScale,
            currentFloorTD: currentFloor,
            curCanvas: curCanvas
          };

          // Filter array
          // 1. Take out text directions between last one and the first one that has final Destination as its landmark.
          if(true) {
            // console.log('f1 before textDirectionsFloorArray count:', textDirectionsFloorArray.length);

            filterNo1TakeOutDirectionsBetweenLastAndFirst.call(this, instruction);

            // console.log('f1 after  textDirectionsFloorArray count:', textDirectionsFloorArray.length);
          }

          // 2. Start Direction assumes directions of all next directions which use its Destination as their Landmarks.
          // Start with: 1) With Store behind you, go Forward. 2) With Store on your Right, go Right. 3) next...
          // Correct to: 1) With Store behind you, go Right. 2) next...
          // On first floor!
          // See if next text direction is using start-destination and if it does, fold it, taking its direction as first.
          if(true) {
            // console.log('f2 before textDirectionsFloorArray count:', textDirectionsFloorArray.length);

            filterNo2StartDirectionCleanUpAllWhichUseDestinationAsLandmarks.call(this, instruction);

            // console.log('f2 after  textDirectionsFloorArray count:', textDirectionsFloorArray.length);
          }

          // 3. U-Turn detection: eg.: Three lefts with combined angle of over 100 deg become Left U-Turn
          if(true) {
            // console.log('f3 before textDirectionsFloorArray count:', textDirectionsFloorArray.length);

            filterNo3UTurnDetection.call(this, instruction);

            // console.log('f3 after  textDirectionsFloorArray count:', textDirectionsFloorArray.length);
          }

          // 4. Remove consecutive Forwards
          if(true) {
            // console.log('f4 before textDirectionsFloorArray count:', textDirectionsFloorArray.length);

            filterNo4RemoveConsecutiveForwards.call(this, instruction);

            // console.log('f4 after  textDirectionsFloorArray count:', textDirectionsFloorArray.length);
          }

          // 5. Redundant instructions in the Middle of Instructions (combo-directions)
          // Left at Macys, Right at Macys... into: "Turn Left then Right at Macys"
          // NOTE: Avoid Forward directions unless they are at the very end of combo-instruction.
          // Don't have Right, Forward, Left, Forward
          // Instead have: Right, Left, Forward
          // Keep looping while
          if(true) {
            // console.log('f5 before textDirectionsFloorArray count:', textDirectionsFloorArray.length);

            filterNo5RedundantInstructionsInMiddleInstructionsComboDirections.call(this, instruction);

            // console.log('f5 after  textDirectionsFloorArray count:', textDirectionsFloorArray.length);
          }

          // Filter No.6 Continue Past, FiLLer!
          if(true) {
            // console.log('f6 before textDirectionsFloorArray count:', textDirectionsFloorArray.length);

            filterNo6ContinuePastFiller.call(this, instruction);

            // console.log('f6 after  textDirectionsFloorArray count:', textDirectionsFloorArray.length);
          }

        }

        // Language filters:
        var loopTo5 = textDirectionsFloorArray.length - 1;
        for(var s = 1; s < loopTo5; s++) {

          // Get direction
          var _currentInstruction = textDirectionsFloorArray[s];
          // Filter its output
          _currentInstruction.output = this.languageFilters(_currentInstruction.output);
        }

        // Add to array
        textDirectionsForAllFloorsArray.push(textDirectionsFloorArray);

      }

    }

    //Add distance to every text direction
    for(var floorIndex = 0; floorIndex < textDirectionsForAllFloorsArray.length; floorIndex++) {
      // Get next floor
      var _nextFloor = textDirectionsForAllFloorsArray[floorIndex];

      // Get to way find array
      var _useArrayOfFloorWaypoints = wayfindArray[floorIndex];
      var currentFloor_ = this.model.getFloorById(_useArrayOfFloorWaypoints.mapId);
      var xScale_ = currentFloor_.xScale;
      var yScale_ = currentFloor_.yScale;
      var enableDistanceFilters_ = ((xScale_ > 0) && (yScale_ > 0));

      // Counters
      var currentDistancePixels = 0;

      // Go through text directions
      for(var __nextDirection = 1; __nextDirection < _nextFloor.length; __nextDirection++) {
        var nextInstruction__ = _nextFloor[__nextDirection];

        var previousInstruction__ = _nextFloor[(__nextDirection - 1)];

        // Get CGPoint
        var nextPoint__ = [nextInstruction__.wp.x, nextInstruction__.wp.y];
        var previousPoint__ = [previousInstruction__.wp.x, previousInstruction__.wp.y];

        // Get distance from to
        var distance = __.distanceBetween(previousPoint__, nextPoint__);

        // currentDistancePixels
        currentDistancePixels += distance;

        // Add to total distance
        nextInstruction__.distanceFromStartPixels = currentDistancePixels;

        // Add to previousInstruction__
        previousInstruction__.distanceToNextPixels = distance;

        // Meters
        if(enableDistanceFilters_) {
          // Add to total distance in meters
          nextInstruction__.distanceFromStartMeters = __.convertPixelsToMeters(nextInstruction__.distanceFromStartPixels, xScale_);

          // Add to previousInstruction__
          previousInstruction__.distanceToNextMeters = __.convertPixelsToMeters(previousInstruction__.distanceToNextPixels, xScale_);

        }

        // Carry point
        previousPoint__ = nextPoint__;
      }
    }

    // Ret
    console.timeEnd('makeTextDirections');
    return textDirectionsForAllFloorsArray;
  };

  // Make single Text Direction
  processor.makeTextDirectionInstruction = function(wayfindArray, floorWaypoints, floor, currentNode, nextNode, previousToAngle) {

    // Make next text instruction
    //Initial properties are at bottom of file.
    //This should probably become a class
    // var nextDir = {
    //   foldToBack: foldToBack,
    //   foldInFront: foldInFront
    // };
    var nextDir = new Instruction()

    // Text direction floor information
    // Get first WP
    nextDir.floor = floor.mapId;
    nextDir.floorName = floor.description;

    // Current Waypoint, Destination and Direction

    // Waypoint
    nextDir.wp = this.model.getWaypointInformation(currentNode.id);
    if(nextDir.wp === null) {
      // console.log('No WAYPOINT???');
      // I don't think we can continue
      return null;
    }

    // Get destination
    var destinationsArray = this.model.getDestinationByWaypointId(currentNode.id);
    if(destinationsArray.length === 0) {
      void 0;
      // console.log('No Destination at waypoint.');
    } else {
      nextDir.destination = destinationsArray[0];
    }

    // Direction
    // Get Direction
    // Figure out the angle to next

    // Current point
    var currentPoint = [currentNode.x, currentNode.y];

    // Next point
    var nextPoint;
    if(nextNode === null) {
      nextPoint = currentPoint;
    } else {
      nextPoint = [nextNode.x, nextNode.y];
    }

    // Get angle
    var angle = __.pointPairToBearingDegrees(currentPoint, nextPoint);
    // Get angle to next
    nextDir.angleToNext = angle;
    // previousAngle
    // If we are starting on new floor, previousToAngle should be -1
    if(previousToAngle == -1) {
      // Repeat angle
      nextDir.angleToNextOfPreviousDirection = angle;
    } else {
      // This Text Direction is not the first one on this floor so use previousToAngle
      nextDir.angleToNextOfPreviousDirection = previousToAngle;
    }
    // What is the angle difference?
    var angleDifference = nextDir.angleToNextOfPreviousDirection - nextDir.angleToNext;
    while(angleDifference < -180) angleDifference += 360;
    while(angleDifference > 180) angleDifference -= 360;

    // Compute next direction
    nextDir.direction = __.directionFromAngle(angleDifference, null);

    // Use angleToNext to create blockers
    // If you don't find any destinations, go in sequence:
    // Step 1 - Left Down
    // Step 2 - Up Left
    // Step 3 - Right Down
    // Step 4 - Right Up

    // falseTE: Using true angles (pointPairToBearingDegrees) produces angle with 0 degree which is on x axis on left side
    //        90
    //        |
    //        y
    //        |
    // 180--x-+--- 0 degrees
    //        |
    //        |
    //        270
    //        |
    // ************************
    // Create blockers
    // These will be rectangles covering the portion of map with possible Landmarks which are less desirable

    // Get link to helper method class
    // var curCanvas = this.shapes[floor.id].lboxes;
    // Produce Landmark using Blockers sequence
    // var nextStep = 0;
    var tempLandmark = null;

    // Next angle
    // var nextAngle = -1;

    // Landmark
    // Get Landmark using line of sight
    // Used to describe point of reference eg.: 'With *Landmark* on your Left, proceed Forward'
    // Get nearest destination using line of sight
    var returnClosestPoint = {
      value: null
    };
    var theCanvas = this.shapes[floor.mapId].lboxes;

    tempLandmark = this.lineOfSightFromClosestLandmarkToXY(
      currentPoint,
      returnClosestPoint,
      nextDir.direction,
      nextDir.angleToNextOfPreviousDirection,
      theCanvas
    );

    if(tempLandmark) {
      nextDir.landmarkDestination = tempLandmark;
      // Find WP so we can accurately determine angle to destination's entrance
      var landmarkWP = this.model.getWaypointsByDestinationId(nextDir.landmarkDestination.id)[0];
      if(landmarkWP) {
        nextDir.landmarkWP = landmarkWP;

        // Get angle comparing Direction angleToNext
        // Direction
        //property NSString *direction;
        // Get Direction
        // Figure out the angle to next
        // Get angle
        angle = __.pointPairToBearingDegrees(currentPoint, returnClosestPoint.value);
        // Get angle to next
        nextDir.angleToLandmark = angle;

        // What is the angle difference?
        var angleToLandmarkDifference = nextDir.angleToNextOfPreviousDirection - nextDir.angleToLandmark;
        while(angleToLandmarkDifference < -180) angleToLandmarkDifference += 360;
        while(angleToLandmarkDifference > 180) angleToLandmarkDifference -= 360;
        // Compute next direction
        nextDir.directionToLandmark = __.directionFromAngle(angleToLandmarkDifference, null);
      }
    } else {
      // No destination
      nextDir.landmarkDestination = null;
      nextDir.landmarkWP = null;
      nextDir.angleToLandmark = -1;
      console.log('No Landmark Destination.');
    }

    // Ret
    return nextDir;
  };

  processor.languageFilters = function(thisOutput) {
    // Bad:  On your Forward
    // Good: in front
    if(__.stringContainsString(thisOutput, 'on your Forward')) {
      thisOutput = thisOutput.split('on your Forward').join('in front');
    }

    // Bad:  On your Back
    // Good: in front
    if(__.stringContainsString(thisOutput, 'on your Back')) {
      thisOutput = thisOutput.split('on your Back').join('behind you');
    }

    // Bad:  go Right
    // Good: turn Right
    if(__.stringContainsString(thisOutput, 'go Right')) {
      thisOutput = thisOutput.split('go Right').join('turn Right');
    }

    // Bad:  go Left
    // Good: turn Left
    if(__.stringContainsString(thisOutput, 'go Left')) {
      thisOutput = thisOutput.split('go Left').join('turn Left');
    }

    // Ret
    return thisOutput;
  };

};
