  /* jshint -W083 */
  var __ = require('./helpers');

  module.exports = function(processor) {

    // lineOfSightFromClosestLandmarkToXY version based on rankings
    // It will find 4 landmarks going in four major directions.
    // It will return the closest landmark which is in same direction as the direction of next step.
    processor.lineOfSightFromClosestLandmarkToXY = function(thisXY, pointOfIntercept, direction, previousAngle, forCanvas) {
      var returnDest = null;
      // var intersectPoint = [0, 0];
      var finalUnitId = null;

      // Let's find all four landmarks
      // Forward
      var tempIntersectPointForward = [0, 0];
      var closestDestinationPixelsForward = -1;
      var closestUnitIdForward = null;
      //Slight left
      var tempIntersectPointLeftSlight = [0, 0];
      var closestDestinationPixelsLeftSlight = -1;
      var closestUnitIdLeftSlight = null;
      // Left
      var tempIntersectPointLeft = [0, 0];
      var closestDestinationPixelsLeft = -1;
      var closestUnitIdLeft = null;
      // Slight Right
      var tempIntersectPointRightSlight = [0, 0];
      var closestDestinationPixelsRightSlight = -1;
      var closestUnitIdRightSlight = null;
      // Right
      var tempIntersectPointRight = [0, 0];
      var closestDestinationPixelsRight = -1;
      var closestUnitIdRight = null;
      // Back
      var tempIntersectPointBack = [0, 0];
      var closestDestinationPixelsBack = -1;
      var closestUnitIdBack = null;

      // Get access to shapes
      var canvasShapes = forCanvas;

      // Go through all LBoxes
      for(var i = 0; i < canvasShapes.length; i++) {
        var lbox = canvasShapes[i];
        // Bryan: Got the needed data to highlight Units
        if(lbox) {
          var unitId, lBoxFrame, rotatedPoints;

          if(lbox.parsed) {
            unitId = lbox.parsed.unitId;
            lBoxFrame = lbox.parsed.lBoxFrame;
            rotatedPoints = lbox.parsed.rotatedPoints;
          } else {
            // Get Unit Id
            // Bryan: possible flawed design. I am using first id in array of (possibly) multiple ids
            var dataLbox = lbox.getAttribute('data-lbox');
            if(dataLbox) unitId = parseInt(dataLbox);

            // The CGPath frame is bounding frame (rotated) of LBox
            lBoxFrame = {
              x: parseFloat(lbox.getAttribute('x')),
              y: parseFloat(lbox.getAttribute('y')),
              width: parseFloat(lbox.getAttribute('width')),
              height: parseFloat(lbox.getAttribute('height')),
              transform: lbox.getAttribute('transform')
            };

            // Get rotated points
            rotatedPoints = __.arrayOfRotatedPoints(lBoxFrame);

            lbox.parsed = {
              unitId: unitId,
              lBoxFrame: lBoxFrame,
              rotatedPoints: rotatedPoints,
              dataLbox: dataLbox ? dataLbox.split(',') : []
            };
          }

          // Skip if nil
          if(!unitId) continue;

          // Now get pairs of points and get closest intersection from ThisXY
          var tempIntersectPoint = {
            value: [0, 0]
          };
          // New record will be used to check for line of sight
          var newRecordForward = false;
          var newRecordLeftSlight = false;
          var newRecordLeft = false;
          var newRecordRightSlight = false;
          var newRecordRight = false;
          var newRecordBack = false;
          // Of 4 lines, which one is the closest?
          var currentProposedDestinationPixelsForward = -1;
          var currentProposedDestinationPixelsLeftSlight = -1;
          var currentProposedDestinationPixelsLeft = -1;
          var currentProposedDestinationPixelsRightSlight = -1;
          var currentProposedDestinationPixelsRight = -1;
          var currentProposedDestinationPixelsBack = -1;

          // Top line
          var p1 = rotatedPoints[0];
          var p2 = rotatedPoints[1];
          var p3 = rotatedPoints[2];
          var p4 = rotatedPoints[3];

          // Get distance of nearest intercept
          var distance = __.distanceToLine(thisXY, p1, p2, tempIntersectPoint);
          // Find which way this is pointing to
          var proposedDirection = __.returnDirectionToPoint(thisXY, tempIntersectPoint.value, previousAngle);
          // Update the one needed

          switch(proposedDirection.toLowerCase()) {
            case 'forward':
              // Forward
              if((distance < closestDestinationPixelsForward) || (closestDestinationPixelsForward == -1)) {
                // Of current 4, which one is the closest?
                if((currentProposedDestinationPixelsForward == -1) || (distance < currentProposedDestinationPixelsForward)) {
                  // This is the closest one
                  currentProposedDestinationPixelsForward = distance;
                  // newRecord
                  newRecordForward = true;
                  // tempIntersectPointForward
                  tempIntersectPointForward = tempIntersectPoint.value;
                }
              }
              break;
            case 'left':
              // Left
              if((distance < closestDestinationPixelsLeft) || (closestDestinationPixelsLeft == -1)) {
                // Of current 4, which one is the closest?
                if((currentProposedDestinationPixelsLeft == -1) || (distance < currentProposedDestinationPixelsLeft)) {
                  // This is the closest one
                  currentProposedDestinationPixelsLeft = distance;
                  // newRecord
                  newRecordLeft = true;
                  // tempIntersectPointLeft
                  tempIntersectPointLeft = tempIntersectPoint.value;
                }
              }
              break;
            case 'right':
              // Right
              if((distance < closestDestinationPixelsRight) || (closestDestinationPixelsRight == -1)) {
                // Of current 4, which one is the closest?
                if((currentProposedDestinationPixelsRight == -1) || (distance < currentProposedDestinationPixelsRight)) {
                  // This is the closest one
                  currentProposedDestinationPixelsRight = distance;
                  // newRecord
                  newRecordRight = true;
                  // tempIntersectPointRight
                  tempIntersectPointRight = tempIntersectPoint.value;
                }
              }
              break;
            case 'back':
              // Back
              if((distance < closestDestinationPixelsBack) || (closestDestinationPixelsBack == -1)) {
                // Of current 4, which one is the closest?
                if((currentProposedDestinationPixelsBack == -1) || (distance < currentProposedDestinationPixelsBack)) {
                  // This is the closest one
                  currentProposedDestinationPixelsBack = distance;
                  // newRecord
                  newRecordBack = true;
                  // tempIntersectPointBack
                  tempIntersectPointBack = tempIntersectPoint.value;
                }
              }
              break;
            case 'slight right':
              // Right
              if((distance < closestDestinationPixelsRightSlight) || (closestDestinationPixelsRightSlight == -1)) {
                // Of current 4, which one is the closest?
                if((currentProposedDestinationPixelsRightSlight == -1) || (distance < currentProposedDestinationPixelsRightSlight)) {
                  // This is the closest one
                  currentProposedDestinationPixelsRightSlight = distance;
                  // newRecord
                  newRecordRightSlight = true;
                  // tempIntersectPointRight
                  tempIntersectPointRightSlight = tempIntersectPoint.value;
                }
              }
              break;
            case 'slight left':
              // Left Slight
              if((distance < closestDestinationPixelsLeftSlight) || (closestDestinationPixelsLeftSlight == -1)) {
                // Of current 4, which one is the closest?
                if((currentProposedDestinationPixelsLeftSlight == -1) || (distance < currentProposedDestinationPixelsLeftSlight)) {
                  // This is the closest one
                  currentProposedDestinationPixelsLeftSlight = distance;
                  // newRecord
                  newRecordLeftSlight = true;
                  // tempIntersectPointLeft
                  tempIntersectPointLeftSlight = tempIntersectPoint.value;
                }
              }
              break;
          }

          // Right line
          // Get distance of nearest intercept
          distance = __.distanceToLine(thisXY, p2, p3, tempIntersectPoint);

          // Find which way this is pointing to
          proposedDirection = __.returnDirectionToPoint(thisXY, tempIntersectPoint.value, previousAngle);

          // Update the one needed
          switch(proposedDirection.toLowerCase()) {
            case 'forward':
              // Forward
              if((distance < closestDestinationPixelsForward) || (closestDestinationPixelsForward == -1)) {
                // Of current 4, which one is the closest?
                if((currentProposedDestinationPixelsForward == -1) || (distance < currentProposedDestinationPixelsForward)) {
                  // This is the closest one
                  currentProposedDestinationPixelsForward = distance;
                  // newRecord
                  newRecordForward = true;
                  // tempIntersectPointForward
                  tempIntersectPointForward = tempIntersectPoint.value;
                }
              }
              break;
            case 'left':
              // Left
              if((distance < closestDestinationPixelsLeft) || (closestDestinationPixelsLeft == -1)) {
                // Of current 4, which one is the closest?
                if((currentProposedDestinationPixelsLeft == -1) || (distance < currentProposedDestinationPixelsLeft)) {
                  // This is the closest one
                  currentProposedDestinationPixelsLeft = distance;
                  // newRecord
                  newRecordLeft = true;
                  // tempIntersectPointLeft
                  tempIntersectPointLeft = tempIntersectPoint.value;
                }
              }
              break;
            case 'right':
              // Right
              if((distance < closestDestinationPixelsRight) || (closestDestinationPixelsRight == -1)) {
                // Of current 4, which one is the closest?
                if((currentProposedDestinationPixelsRight == -1) || (distance < currentProposedDestinationPixelsRight)) {
                  // This is the closest one
                  currentProposedDestinationPixelsRight = distance;
                  // newRecord
                  newRecordRight = true;
                  // tempIntersectPointRight
                  tempIntersectPointRight = tempIntersectPoint.value;
                }
              }
              break;
            case 'back':
              // Back
              if((distance < closestDestinationPixelsBack) || (closestDestinationPixelsBack == -1)) {
                // Of current 4, which one is the closest?
                if((currentProposedDestinationPixelsBack == -1) || (distance < currentProposedDestinationPixelsBack)) {
                  // This is the closest one
                  currentProposedDestinationPixelsBack = distance;
                  // newRecord
                  newRecordBack = true;
                  // tempIntersectPointBack
                  tempIntersectPointBack = tempIntersectPoint.value;
                }
              }
              break;
            case 'slight right':
              // Right
              if((distance < closestDestinationPixelsRightSlight) || (closestDestinationPixelsRightSlight == -1)) {
                // Of current 4, which one is the closest?
                if((currentProposedDestinationPixelsRightSlight == -1) || (distance < currentProposedDestinationPixelsRightSlight)) {
                  // This is the closest one
                  currentProposedDestinationPixelsRightSlight = distance;
                  // newRecord
                  newRecordRightSlight = true;
                  // tempIntersectPointRight
                  tempIntersectPointRightSlight = tempIntersectPoint.value;
                }
              }
              break;
            case 'slight left':
              // Left Slight
              if((distance < closestDestinationPixelsLeftSlight) || (closestDestinationPixelsLeftSlight == -1)) {
                // Of current 4, which one is the closest?
                if((currentProposedDestinationPixelsLeftSlight == -1) || (distance < currentProposedDestinationPixelsLeftSlight)) {
                  // This is the closest one
                  currentProposedDestinationPixelsLeftSlight = distance;
                  // newRecord
                  newRecordLeftSlight = true;
                  // tempIntersectPointLeft
                  tempIntersectPointLeftSlight = tempIntersectPoint.value;
                }
              }
              break;
          }

          // Bottom line
          // Get distance of nearest intercept
          distance = __.distanceToLine(thisXY, p3, p4, tempIntersectPoint);
          // Find which way this is pointing to
          proposedDirection = __.returnDirectionToPoint(thisXY, tempIntersectPoint.value, previousAngle);

          switch(proposedDirection.toLowerCase()) {
            case 'forward':
              // Forward
              if((distance < closestDestinationPixelsForward) || (closestDestinationPixelsForward == -1)) {
                // Of current 4, which one is the closest?
                if((currentProposedDestinationPixelsForward == -1) || (distance < currentProposedDestinationPixelsForward)) {
                  // This is the closest one
                  currentProposedDestinationPixelsForward = distance;
                  // newRecord
                  newRecordForward = true;
                  // tempIntersectPointForward
                  tempIntersectPointForward = tempIntersectPoint.value;
                }
              }
              break;
            case 'left':
              // Left
              if((distance < closestDestinationPixelsLeft) || (closestDestinationPixelsLeft == -1)) {
                // Of current 4, which one is the closest?
                if((currentProposedDestinationPixelsLeft == -1) || (distance < currentProposedDestinationPixelsLeft)) {
                  // This is the closest one
                  currentProposedDestinationPixelsLeft = distance;
                  // newRecord
                  newRecordLeft = true;
                  // tempIntersectPointLeft
                  tempIntersectPointLeft = tempIntersectPoint.value;
                }
              }
              break;
            case 'right':
              // Right
              if((distance < closestDestinationPixelsRight) || (closestDestinationPixelsRight == -1)) {
                // Of current 4, which one is the closest?
                if((currentProposedDestinationPixelsRight == -1) || (distance < currentProposedDestinationPixelsRight)) {
                  // This is the closest one
                  currentProposedDestinationPixelsRight = distance;
                  // newRecord
                  newRecordRight = true;
                  // tempIntersectPointRight
                  tempIntersectPointRight = tempIntersectPoint.value;
                }
              }
              break;
            case 'back':
              // Back
              if((distance < closestDestinationPixelsBack) || (closestDestinationPixelsBack == -1)) {
                // Of current 4, which one is the closest?
                if((currentProposedDestinationPixelsBack == -1) || (distance < currentProposedDestinationPixelsBack)) {
                  // This is the closest one
                  currentProposedDestinationPixelsBack = distance;
                  // newRecord
                  newRecordBack = true;
                  // tempIntersectPointBack
                  tempIntersectPointBack = tempIntersectPoint.value;
                }
              }
              break;
            case 'slight right':
              // Right
              if((distance < closestDestinationPixelsRightSlight) || (closestDestinationPixelsRightSlight == -1)) {
                // Of current 4, which one is the closest?
                if((currentProposedDestinationPixelsRightSlight == -1) || (distance < currentProposedDestinationPixelsRightSlight)) {
                  // This is the closest one
                  currentProposedDestinationPixelsRightSlight = distance;
                  // newRecord
                  newRecordRightSlight = true;
                  // tempIntersectPointRight
                  tempIntersectPointRightSlight = tempIntersectPoint.value;
                }
              }
              break;
            case 'slight left':
              // Left Slight
              if((distance < closestDestinationPixelsLeftSlight) || (closestDestinationPixelsLeftSlight == -1)) {
                // Of current 4, which one is the closest?
                if((currentProposedDestinationPixelsLeftSlight == -1) || (distance < currentProposedDestinationPixelsLeftSlight)) {
                  // This is the closest one
                  currentProposedDestinationPixelsLeftSlight = distance;
                  // newRecord
                  newRecordLeftSlight = true;
                  // tempIntersectPointLeft
                  tempIntersectPointLeftSlight = tempIntersectPoint.value;
                }
              }
              break;
          }

          // Left
          // Left line
          // Get distance of nearest intercept
          distance = __.distanceToLine(thisXY, p1, p4, tempIntersectPoint);
          // Find which way this is pointing to
          proposedDirection = __.returnDirectionToPoint(thisXY, tempIntersectPoint.value, previousAngle);
          // Update the one needed
          switch(proposedDirection.toLowerCase()) {
            case 'forward':
              // Forward
              if((distance < closestDestinationPixelsForward) || (closestDestinationPixelsForward == -1)) {
                // Of current 4, which one is the closest?
                if((currentProposedDestinationPixelsForward == -1) || (distance < currentProposedDestinationPixelsForward)) {
                  // This is the closest one
                  currentProposedDestinationPixelsForward = distance;
                  // newRecord
                  newRecordForward = true;
                  // tempIntersectPointForward
                  tempIntersectPointForward = tempIntersectPoint.value;
                }
              }
              break;
            case 'slight left':
              // Left Slight
              if((distance < closestDestinationPixelsLeftSlight) || (closestDestinationPixelsLeftSlight == -1)) {
                // Of current 4, which one is the closest?
                if((currentProposedDestinationPixelsLeftSlight == -1) || (distance < currentProposedDestinationPixelsLeftSlight)) {
                  // This is the closest one
                  currentProposedDestinationPixelsLeftSlight = distance;
                  // newRecord
                  newRecordLeftSlight = true;
                  // tempIntersectPointLeft
                  tempIntersectPointLeftSlight = tempIntersectPoint.value;
                }
              }
              break;
            case 'left':
              // Left
              if((distance < closestDestinationPixelsLeft) || (closestDestinationPixelsLeft == -1)) {
                // Of current 4, which one is the closest?
                if((currentProposedDestinationPixelsLeft == -1) || (distance < currentProposedDestinationPixelsLeft)) {
                  // This is the closest one
                  currentProposedDestinationPixelsLeft = distance;
                  // newRecord
                  newRecordLeft = true;
                  // tempIntersectPointLeft
                  tempIntersectPointLeft = tempIntersectPoint.value;
                }
              }
              break;
            case 'slight right':
              // Right
              if((distance < closestDestinationPixelsRightSlight) || (closestDestinationPixelsRightSlight == -1)) {
                // Of current 4, which one is the closest?
                if((currentProposedDestinationPixelsRightSlight == -1) || (distance < currentProposedDestinationPixelsRightSlight)) {
                  // This is the closest one
                  currentProposedDestinationPixelsRightSlight = distance;
                  // newRecord
                  newRecordRightSlight = true;
                  // tempIntersectPointRight
                  tempIntersectPointRightSlight = tempIntersectPoint.value;
                }
              }
              break;
            case 'right':
              // Right
              if((distance < closestDestinationPixelsRight) || (closestDestinationPixelsRight == -1)) {
                // Of current 4, which one is the closest?
                if((currentProposedDestinationPixelsRight == -1) || (distance < currentProposedDestinationPixelsRight)) {
                  // This is the closest one
                  currentProposedDestinationPixelsRight = distance;
                  // newRecord
                  newRecordRight = true;
                  // tempIntersectPointRight
                  tempIntersectPointRight = tempIntersectPoint.value;
                }
              }
              break;
            case 'back':
              // Back
              if((distance < closestDestinationPixelsBack) || (closestDestinationPixelsBack == -1)) {
                // Of current 4, which one is the closest?
                if((currentProposedDestinationPixelsBack == -1) || (distance < currentProposedDestinationPixelsBack)) {
                  // This is the closest one
                  currentProposedDestinationPixelsBack = distance;
                  // newRecord
                  newRecordBack = true;
                  // tempIntersectPointBack
                  tempIntersectPointBack = tempIntersectPoint.value;
                }
              }
              break;
          }

          // New record(s)?
          var weHaveLineOfSight = false;
          if(newRecordForward || newRecordLeft || newRecordLeftSlight || newRecordRight || newRecordRightSlight || newRecordBack) {
            weHaveLineOfSight = this.lineOfSight(unitId, thisXY, unitId, tempIntersectPoint.value, forCanvas);
          }
          if(newRecordForward) {
            // Line of sight?
            if(weHaveLineOfSight) {
              // Set new record
              closestDestinationPixelsForward = currentProposedDestinationPixelsForward;
              // closestUnitId
              closestUnitIdForward = unitId;
            }
          }
          if(newRecordLeft) {
            // Line of sight?
            if(weHaveLineOfSight) {
              // Set new record
              closestDestinationPixelsLeft = currentProposedDestinationPixelsLeft;
              // closestUnitId
              closestUnitIdLeft = unitId;
            }
          }
          if(newRecordLeftSlight) {
            // Line of sight?
            if(weHaveLineOfSight) {
              // Set new record
              closestDestinationPixelsLeftSlight = currentProposedDestinationPixelsLeftSlight;
              // closestUnitId
              closestUnitIdLeftSlight = unitId;
            }
          }
          if(newRecordRight) {
            // Line of sight?
            if(weHaveLineOfSight) {
              // Set new record
              closestDestinationPixelsRight = currentProposedDestinationPixelsRight;
              // closestUnitId
              closestUnitIdRight = unitId;
            }
          }
          if(newRecordRightSlight) {
            // Line of sight?
            if(weHaveLineOfSight) {
              // Set new record
              closestDestinationPixelsRightSlight = currentProposedDestinationPixelsRightSlight;
              // closestUnitId
              closestUnitIdRightSlight = unitId;
            }
          }
          if(newRecordBack) {
            // Line of sight?
            if(weHaveLineOfSight) {
              // Set new record
              closestDestinationPixelsBack = currentProposedDestinationPixelsBack;
              // closestUnitId
              closestUnitIdBack = unitId;
            }
          }
        }
      }

      // Ranking system
      switch(direction.toLowerCase()) {
        case 'forward':
          // Forward
          if(closestUnitIdForward) {
            finalUnitId = closestUnitIdForward;
            pointOfIntercept.value = tempIntersectPointForward;
          } else if(closestUnitIdLeftSlight) {
            finalUnitId = closestUnitIdLeftSlight;
            pointOfIntercept.value = tempIntersectPointLeftSlight;
          } else if(closestUnitIdRightSlight) {
            finalUnitId = closestUnitIdRightSlight;
            pointOfIntercept.value = tempIntersectPointRightSlight;
          } else if(closestUnitIdLeft) {
            finalUnitId = closestUnitIdLeft;
            pointOfIntercept.value = tempIntersectPointLeft;
          } else if(closestUnitIdRight) {
            finalUnitId = closestUnitIdRight;
            pointOfIntercept.value = tempIntersectPointRight;
          } else if(closestUnitIdBack) {
            finalUnitId = closestUnitIdBack;
            pointOfIntercept.value = tempIntersectPointBack;
          } else {
            void 0;
            console.log('Failed to find unit id for Forward');
          }

          // If right/slight or left/slight closer than forward or back, use it
          // See if left/s or right/s beat it
          if((closestDestinationPixelsForward > closestDestinationPixelsLeftSlight) && (closestUnitIdLeftSlight)) {
            // Left Slight
            finalUnitId = closestUnitIdLeftSlight;
            pointOfIntercept.value = tempIntersectPointLeftSlight;
            // This prevents Right from overwriting but allows it to compete
            closestDestinationPixelsForward = closestDestinationPixelsLeftSlight;
          }
          // See if left/s or right/s beat it
          if((closestDestinationPixelsForward > closestDestinationPixelsRightSlight) && (closestUnitIdRightSlight)) {
            // Left Slight
            finalUnitId = closestUnitIdRightSlight;
            pointOfIntercept.value = tempIntersectPointRightSlight;
            // This prevents Right from overwriting but allows it to compete
            closestDestinationPixelsForward = closestDestinationPixelsRightSlight;
          }
          // See if left or right beat it
          if((closestDestinationPixelsForward > closestDestinationPixelsLeft) && (closestUnitIdLeft)) {
            // Left
            finalUnitId = closestUnitIdLeft;
            pointOfIntercept.value = tempIntersectPointLeft;
            // This prevents Right from overwriting but allows it to compete
            closestDestinationPixelsForward = closestDestinationPixelsLeft;
          }
          // Right
          if((closestDestinationPixelsForward > closestDestinationPixelsRight) && (closestUnitIdRight)) {
            // Right
            finalUnitId = closestUnitIdRight;
            pointOfIntercept.value = tempIntersectPointRight;
          }
          break;
        case 'left':
          // Left
          if(closestUnitIdLeft) {
            finalUnitId = closestUnitIdLeft;
            pointOfIntercept.value = tempIntersectPointLeft;
          } else if(closestUnitIdLeftSlight) {
            finalUnitId = closestUnitIdLeftSlight;
            pointOfIntercept.value = tempIntersectPointLeftSlight;
          } else if(closestUnitIdForward) {
            finalUnitId = closestUnitIdForward;
            pointOfIntercept.value = tempIntersectPointForward;
          } else if(closestUnitIdBack) {
            finalUnitId = closestUnitIdBack;
            pointOfIntercept.value = tempIntersectPointBack;
          } else if(closestUnitIdRight) {
            finalUnitId = closestUnitIdRight;
            pointOfIntercept.value = tempIntersectPointRight;
          } else if(closestUnitIdRightSlight) {
            finalUnitId = closestUnitIdRightSlight;
            pointOfIntercept.value = tempIntersectPointRightSlight;
          } else {
            void 0;
            console.log('Failed to find unit id for Left');
          }

          // Left:
          // Forward, Slight Left can beat it
          if((closestDestinationPixelsLeft > closestDestinationPixelsForward) && (closestUnitIdForward)) {
            // Left Slight
            finalUnitId = closestUnitIdForward;
            pointOfIntercept.value = tempIntersectPointForward;
            closestDestinationPixelsLeft = closestDestinationPixelsForward;
          }
          // See if left or right beat it
          if((closestDestinationPixelsLeft > closestDestinationPixelsLeftSlight) && (closestUnitIdLeftSlight)) {
            // Left Slight
            finalUnitId = closestUnitIdLeftSlight;
            pointOfIntercept.value = tempIntersectPointLeftSlight;
            closestDestinationPixelsLeft = closestDestinationPixelsLeftSlight;
          }
          break;
        case 'right':
          // Right
          if(closestUnitIdRight) {
            finalUnitId = closestUnitIdRight;
            pointOfIntercept.value = tempIntersectPointRight;
          } else if(closestUnitIdRightSlight) {
            finalUnitId = closestUnitIdRightSlight;
            pointOfIntercept.value = tempIntersectPointRightSlight;
          } else if(closestUnitIdForward) {
            finalUnitId = closestUnitIdForward;
            pointOfIntercept.value = tempIntersectPointForward;
          } else if(closestUnitIdBack) {
            finalUnitId = closestUnitIdBack;
            pointOfIntercept.value = tempIntersectPointBack;
          } else if(closestUnitIdLeft) {
            finalUnitId = closestUnitIdLeft;
            pointOfIntercept.value = tempIntersectPointLeft;
          } else if(closestUnitIdLeftSlight) {
            finalUnitId = closestUnitIdLeftSlight;
            pointOfIntercept.value = tempIntersectPointLeftSlight;
          } else {
            void 0;
            console.log('Failed to find unit id for Right');
          }

          // Right:
          // Forward, Slight Right can beat it
          if((closestDestinationPixelsRight > closestDestinationPixelsForward) && (closestUnitIdForward)) {
            // Left Slight
            finalUnitId = closestUnitIdForward;
            pointOfIntercept.value = tempIntersectPointForward;
            closestDestinationPixelsRight = closestDestinationPixelsForward;
          }
          // See if left or right beat it
          if((closestDestinationPixelsRight > closestDestinationPixelsRightSlight) && (closestUnitIdRightSlight)) {
            // Right
            finalUnitId = closestUnitIdRightSlight;
            pointOfIntercept.value = tempIntersectPointRightSlight;
            closestDestinationPixelsRight = closestDestinationPixelsRightSlight;
          }
          break;
        case 'back':

          // If right or left closer than forward or back, use it
          // Back
          if(closestUnitIdBack) {
            finalUnitId = closestUnitIdBack;
            pointOfIntercept.value = tempIntersectPointBack;
          }
          if(closestUnitIdRight) {
            finalUnitId = closestUnitIdRight;
            pointOfIntercept.value = tempIntersectPointRight;
          } else if(closestUnitIdRightSlight) {
            finalUnitId = closestUnitIdRightSlight;
            pointOfIntercept.value = tempIntersectPointRightSlight;
          } else if(closestUnitIdLeft) {
            finalUnitId = closestUnitIdLeft;
            pointOfIntercept.value = tempIntersectPointLeft;
          } else if(closestUnitIdLeftSlight) {
            finalUnitId = closestUnitIdLeftSlight;
            pointOfIntercept.value = tempIntersectPointLeftSlight;
          } else if(closestUnitIdForward) {
            finalUnitId = closestUnitIdForward;
            pointOfIntercept.value = tempIntersectPointForward;
          } else {
            void 0;
            console.log('Failed to find unit id for Back');
          }

          // Back
          // If right/slight or left/slight closer than forward or back, use it
          // See if left/s or right/s beat it
          if((closestDestinationPixelsForward > closestDestinationPixelsLeftSlight) && (closestUnitIdLeftSlight)) {
            // Left Slight
            finalUnitId = closestUnitIdLeftSlight;
            pointOfIntercept.value = tempIntersectPointLeftSlight;
            // This prevents Right from overwriting but allows it to compete
            closestDestinationPixelsForward = closestDestinationPixelsLeftSlight;
          }
          // See if left/s or right/s beat it
          if((closestDestinationPixelsForward > closestDestinationPixelsRightSlight) && (closestUnitIdRightSlight)) {
            // Left Slight
            finalUnitId = closestUnitIdRightSlight;
            pointOfIntercept.value = tempIntersectPointRightSlight;
            // This prevents Right from overwriting but allows it to compete
            closestDestinationPixelsForward = closestDestinationPixelsRightSlight;
          }
          // See if left or right beat it
          if((closestDestinationPixelsBack > closestDestinationPixelsLeft) && (closestUnitIdLeft)) {
            // Left
            finalUnitId = closestUnitIdLeft;
            pointOfIntercept.value = tempIntersectPointLeft;
            // This prevents Right from overwriting but allows it to compete
            closestDestinationPixelsForward = closestDestinationPixelsLeft;
          }
          // Right
          if((closestDestinationPixelsBack > closestDestinationPixelsRight) && (closestUnitIdRight)) {
            // Right
            finalUnitId = closestUnitIdRight;
            pointOfIntercept.value = tempIntersectPointRight;
          }

          break;

        case 'slight right':
          // Slight Right
          if(closestUnitIdRightSlight) {
            finalUnitId = closestUnitIdRightSlight;
            pointOfIntercept.value = tempIntersectPointRightSlight;
          } else if(closestUnitIdRight) {
            finalUnitId = closestUnitIdRight;
            pointOfIntercept.value = tempIntersectPointRight;
          } else if(closestUnitIdForward) {
            finalUnitId = closestUnitIdForward;
            pointOfIntercept.value = tempIntersectPointForward;
          } else if(closestUnitIdBack) {
            finalUnitId = closestUnitIdBack;
            pointOfIntercept.value = tempIntersectPointBack;
          } else if(closestUnitIdLeft) {
            finalUnitId = closestUnitIdLeft;
            pointOfIntercept.value = tempIntersectPointLeft;
          } else if(closestUnitIdLeftSlight) {
            finalUnitId = closestUnitIdLeftSlight;
            pointOfIntercept.value = tempIntersectPointLeftSlight;
          } else {
            void 0;
            console.log('Failed to find unit id for Slight Right');
          }

          // Slight Right:
          // Forward, Right can beat it
          if((closestDestinationPixelsRightSlight > closestDestinationPixelsForward) && (closestUnitIdForward)) {
            // Left Slight
            finalUnitId = closestUnitIdForward;
            pointOfIntercept.value = tempIntersectPointForward;
            closestDestinationPixelsRightSlight = closestDestinationPixelsForward;
          }
          // See if left or right beat it
          if((closestDestinationPixelsRightSlight > closestDestinationPixelsRight) && (closestUnitIdRight)) {
            // Right
            finalUnitId = closestUnitIdRight;
            pointOfIntercept.value = tempIntersectPointRight;
            closestDestinationPixelsRightSlight = closestDestinationPixelsRight;
          }
          break;
        case 'slight left':
          // Slight Left
          if(closestUnitIdLeftSlight) {
            finalUnitId = closestUnitIdLeftSlight;
            pointOfIntercept.value = tempIntersectPointLeftSlight;
          } else if(closestUnitIdLeft) {
            finalUnitId = closestUnitIdLeft;
            pointOfIntercept.value = tempIntersectPointLeft;
          } else if(closestUnitIdForward) {
            finalUnitId = closestUnitIdForward;
            pointOfIntercept.value = tempIntersectPointForward;
          } else if(closestUnitIdBack) {
            finalUnitId = closestUnitIdBack;
            pointOfIntercept.value = tempIntersectPointBack;
          } else if(closestUnitIdRight) {
            finalUnitId = closestUnitIdRight;
            pointOfIntercept.value = tempIntersectPointRight;
          } else if(closestUnitIdRightSlight) {
            finalUnitId = closestUnitIdRightSlight;
            pointOfIntercept.value = tempIntersectPointRightSlight;
          } else {
            void 0;
            console.log('Failed to find unit id for Slight Left');
          }

          // Slight Left:
          // Forward, Left can beat it
          if((closestDestinationPixelsLeftSlight > closestDestinationPixelsForward) && (closestUnitIdForward)) {
            // Left Slight
            finalUnitId = closestUnitIdForward;
            pointOfIntercept.value = tempIntersectPointForward;
            closestDestinationPixelsLeftSlight = closestDestinationPixelsForward;
          }
          // See if left or right beat it
          if((closestDestinationPixelsLeftSlight > closestDestinationPixelsLeft) && (closestUnitIdLeft)) {
            // Left
            finalUnitId = closestUnitIdLeft;
            pointOfIntercept.value = tempIntersectPointLeft;
            // This prevents Right from overwriting but allows it to compete
            closestDestinationPixelsLeftSlight = closestDestinationPixelsLeft;
          }
          break;
      }

      // Found solution?
      if(finalUnitId) {
        // Get the unit
        for(var j = 0; j < this.model.destinations.length; j++) {
          if(this.model.destinations[j].id == finalUnitId) {
            returnDest = this.model.destinations[j];
            break;
          }
        }
      } else {
        console.log('No final Unit Id');
      }
      return returnDest;
    };

    // Line of Sight worker method
    processor.lineOfSight = function(unitId, fromXY, toUnitId, toXY, forCanvas) {
      // We have the new closest distance, but do we have line of sight?
      // NOTE: algorithm assumes from point is not obstructed by Blockers
      // Flag that fails if Unit's shape gets in the line of sight

      var weHaveLineOfSight = true;
      // Get access to shapes
      var canvasShapes = forCanvas;
      for(var i = 0; i < canvasShapes.length; i++) {
        var nextInWayElement = canvasShapes[i];

        // LBox
        if(nextInWayElement) {
          var lbox = nextInWayElement;
          // Use every LBox
          var lBoxFrame, rotatedPoints, dataLbox, lBoxUnit;
          // Are all 4 points of this LBox inside blockers?
          // The CGPath frame is bounding frame (rotated) of LBox
          if(lbox.parsed) {
            lBoxFrame = lbox.parsed.lBoxFrame;
            rotatedPoints = lbox.parsed.rotatedPoints;
            dataLbox = lbox.parsed.dataLbox;
          } else {
            lBoxFrame = {
              x: parseFloat(lbox.getAttribute('x')),
              y: parseFloat(lbox.getAttribute('y')),
              width: parseFloat(lbox.getAttribute('width')),
              height: parseFloat(lbox.getAttribute('height')),
              transform: lbox.getAttribute('transform')
            };
            // Get rotated points
            rotatedPoints = __.arrayOfRotatedPoints(lBoxFrame);
            lBoxUnit = lbox.getAttribute('data-lbox');
            dataLbox = lBoxUnit ? lBoxUnit.split(',') : [];
            lbox.parsed = {
              unitId: lBoxUnit ? parseInt(lBoxUnit) : null,
              lBoxFrame: lBoxFrame,
              rotatedPoints: rotatedPoints,
              dataLbox: dataLbox
            };
          }

          // Find LBoxes only
          if(lbox) {
            // Use every LBox
            // Are all 4 points of this LBox inside blockers?
            // The CGPath frame is bounding frame (rotated) of LBox
            // Get rotated points
            if(rotatedPoints.length === 0) {
              rotatedPoints = __.arrayOfRotatedPoints(lBoxFrame);
            }
            // Points
            var p1 = rotatedPoints[0];
            var p2 = rotatedPoints[1];
            var p3 = rotatedPoints[2];
            var p4 = rotatedPoints[3];

            // Make sure the Shape doesn't belong to currently tested LBox
            var differentUnit = true;

            dataLbox.forEach(function(nextUnitId) {
              if(nextUnitId == unitId) differentUnit = false;
            });

            if(differentUnit) {
              // Identify if fromXY is inside empty LBox and avoid using it for lineOfSight
              if(dataLbox.length === 0) {
                // If fromXY is inside?
                // If inside, don't use the rect, continue
                // If not inside, use the rect
                if(__.isPointInsideRotatedRect(fromXY, p1, p2, p3, p4)) {
                  continue;
                }
              }

              // intersect?
              // Dont do all if you don't have to
              var b1 = __.doLineSegmentsIntersect(fromXY, toXY, p1, p2);
              if(b1 === false) {
                var b2 = __.doLineSegmentsIntersect(fromXY, toXY, p2, p3);
                if(b2 === false) {
                  var b3 = __.doLineSegmentsIntersect(fromXY, toXY, p3, p4);
                  if(b3 === false) {
                    var b4 = __.doLineSegmentsIntersect(fromXY, toXY, p4, p1);
                    if(b4 === false) {
                      // Good
                      void 0;
                    } else {
                      // This rect is in the way
                      return false;
                    }
                  } else {
                    // This rect is in the way
                    return false;
                  }
                } else {
                  // This rect is in the way
                  return false;
                }
              } else {
                // This rect is in the way
                return false;
              }

            }
          }
        }
      }
      return weHaveLineOfSight;
    };

  };

  /*
  


*/
