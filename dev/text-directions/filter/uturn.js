var __ = require('../helpers');

module.exports = function uTurn(inst) {

  // Filter No.3 U-Turn detection: eg.: Three lefts with combined angle of over 100 deg become Left U-Turn
  if(inst.enableDistanceFilters) {
    // Disable is not over zero
    if(inst.UTurnInMeters > 0) {
      // Skip UTurn if first floor
      if(inst.useArrayOfFloorWaypoints != inst.wayfindArray[0]) {
        // U-Turn detection
        var firstConsecutiveInstructionUTurn = inst.textDirectionsFloorArray[0];
        // Does this waypoint have only one connection?
        var firstNode = inst.useArrayOfFloorWaypoints.points[0];
        var arr = firstNode.edges.slice();
        // Count type 1
        var type1Counter = 0;
        // We have to have only one of type 1
        // Disregard the others
        arr.forEach(function(nextEdge) {
          // Look for Type one?
          if(nextEdge.type == 1) {
            // Found one more
            type1Counter++;
          }
        });

        // Only 1 type 1?
        if(type1Counter != 1) {
          // Waypoint has more than one connection
          // This cannot be a U-Turn
          return;
        }
        // else continue

        // More than 3 directions?
        if(inst.textDirectionsFloorArray.length < 4) {
          // This cannot be U-Turn. Not enough directions/waypoints
          return;
        }
        // else continue

        // Decide Direction of U-Turn
        var directionIsRight = true;
        // Can you get one more text direction?
        var secondConsecutiveInstructionUTurn = inst.textDirectionsFloorArray[1];
        // Get angle difference
        var angleToDifference1 = firstConsecutiveInstructionUTurn.angleToNext - secondConsecutiveInstructionUTurn.angleToNext;
        while(angleToDifference1 < -180) angleToDifference1 += 360;
        while(angleToDifference1 > 180) angleToDifference1 -= 360;

        // Minus for Right
        // Plus for Left

        if(angleToDifference1 >= 0) {
          // Right
          directionIsRight = true;
        } else {
          // Left
          directionIsRight = false;
        }

        //UTurnInMeters

        // Tresholds
        var angle1_t = 95;
        var angle2_t = 95;
        var distance1_t = 2;
        var distance2_t = 5;
        var distance3_t = 5;

        // Segment A
        // Test Angle
        if(angle1_t < Math.abs(angleToDifference1)) {
          // This cannot be U-Turn, first angle treshold broken
          return;
        }
        // Test Direction
        var segmentADirectionRight = true;
        if(angleToDifference1 >= 0) {
          // Right
          segmentADirectionRight = true;
        } else {
          // Left
          segmentADirectionRight = false;
        }
        if(directionIsRight != segmentADirectionRight) {
          // Not in the same direction
          // This cannot be UTurn
          return;
        }
        // Test Distance
        var point1xy = [firstConsecutiveInstructionUTurn.wp.x, firstConsecutiveInstructionUTurn.wp.y];
        var point2xy = [secondConsecutiveInstructionUTurn.wp.x, secondConsecutiveInstructionUTurn.wp.y];
        var distance1 = __.distanceBetween(point1xy, point2xy);
        var distance1Meters = __.convertPixelsToMeters(distance1, inst.xScale);
        if(distance1Meters <= distance1_t) {
          // This cannot be UTurn
          // Segment 1 is too long
          return;
        }

        // Segment B
        // Third point
        var thirdConsecutiveInstructionUTurn = inst.textDirectionsFloorArray[2];
        // Get angle difference
        var angleToDifference2 = secondConsecutiveInstructionUTurn.angleToNext - thirdConsecutiveInstructionUTurn.angleToNext;
        while(angleToDifference2 < -180) angleToDifference2 += 360;
        while(angleToDifference2 > 180) angleToDifference2 -= 360;
        // Test Angle
        if(angle2_t < Math.abs(angleToDifference2)) {
          // This cannot be U-Turn, first angle treshold broken
          return;
        }
        // Test Direction
        var segmentBDirectionRight = true;
        if(angleToDifference2 >= 0) {
          // Right
          segmentBDirectionRight = true;
        } else {
          // Left
          segmentBDirectionRight = false;
        }
        if(directionIsRight != segmentBDirectionRight) {
          // Not in the same direction
          // This cannot be UTurn
          return;
        }
        // Test Distance
        var point3xy = [thirdConsecutiveInstructionUTurn.wp.x, thirdConsecutiveInstructionUTurn.wp.y];
        var distance2 = __.distanceBetween(point2xy, point3xy);
        var distance2Meters = __.convertPixelsToMeters(distance2, inst.xScale);
        if(distance2Meters <= distance2_t) {
          // This cannot be UTurn
          // Segment 2 is too long
          return;
        }

        // Segment C
        // Fourth point
        var fourthConsecutiveInstructionUTurn = inst.textDirectionsFloorArray[3];
        // Test Distance ONLY.
        // It should be less than 3rd treshold
        var point4xy = [fourthConsecutiveInstructionUTurn.wp.x, fourthConsecutiveInstructionUTurn.wp.y];
        var distance3 = __.distanceBetween(point3xy, point4xy);
        var distance3Meters = __.convertPixelsToMeters(distance3, inst.xScale);
        // Note 3rd must be greater than treshold
        if(distance3_t >= distance3Meters) {
          // This cannot be UTurn
          // Segment 3 is too SHORT!
          return;
        }

        // This is a U-Turn
        // Direction
        if(directionIsRight) {
          // Left
          firstConsecutiveInstructionUTurn.direction = 'Right';
        } else {
          // Left
          firstConsecutiveInstructionUTurn.direction = 'Left';
        }
        // Add UTurn Direction
        firstConsecutiveInstructionUTurn.direction += ' UTurn';

        // First is going to be U-Turn on Left/Right side
        // Combine firstConsecutiveInstruction output

        var newOutput = __.stringWithFormat('With % on your %, make %.',
          firstConsecutiveInstructionUTurn.landmarkDestination.name,
          firstConsecutiveInstructionUTurn.directionToLandmark,
          firstConsecutiveInstructionUTurn.direction);

        // Update
        firstConsecutiveInstructionUTurn.type = 'uturn';
        firstConsecutiveInstructionUTurn.output = newOutput;

        // Fold 2
        // Add distance
        var combinedFirstDistance = firstConsecutiveInstructionUTurn.distanceToNextPixels;
        // 2nd to 3rd
        combinedFirstDistance += secondConsecutiveInstructionUTurn.distanceToNextPixels;
        // 3nd to 4th
        combinedFirstDistance += thirdConsecutiveInstructionUTurn.distanceToNextPixels;

        // Update First
        firstConsecutiveInstructionUTurn.distanceToNextPixels = combinedFirstDistance;
        firstConsecutiveInstructionUTurn.distanceToNextMeters = __.convertPixelsToMeters(combinedFirstDistance, inst.xScale);

        // Fold current into firstConsecutiveInstruction
        firstConsecutiveInstructionUTurn.foldInFront(secondConsecutiveInstructionUTurn);
        // Remove from textDirectionsFloorArray
        inst.textDirectionsFloorArray.splice(1, 1);

        // Fold 3 into firstConsecutiveInstruction
        firstConsecutiveInstructionUTurn.foldInFront(thirdConsecutiveInstructionUTurn);
        // Remove from textDirectionsFloorArray
        inst.textDirectionsFloorArray.splice(1, 1);
      }
    }
  }
};

/*

// Filter No.3 U-Turn detection: eg.: Three lefts with combined angle of over 100 deg become Left U-Turn
// Filter No.3 U-Turn detection: eg.: Three lefts with combined angle of over 100 deg become Left U-Turn
-(void)filterNo3UTurnDetection:(NSMutableArray **)textDirectionsFloorArray useArrayOfFloorWaypoints:(JMapPathPerFloor *)useArrayOfFloorWaypoints wayfindArray:(NSArray *)wayfindArray filterOn:(BOOL)filterOn addTDifEmptyMeters:(float)addTDifEmptyMeters UTurnInMeters:(float)UTurnInMeters enableDistanceFilters:(BOOL)enableDistanceFilters xScale:(float)xScale yScale:(float)yScale currentFloorTD:(JMapFloor *)currentFloorTD curCanvas:(JMapCanvas *)curCanvas
{
    if(enableDistanceFilters)
    {
        // Disable is not over zero
        if(UTurnInMeters > 0.0)
        {
            // Skip UTurn if first floor
            if(useArrayOfFloorWaypoints != [wayfindArray firstObject])
            {
                // U-Turn detection
                JMapTextDirectionInstruction *firstConsecutiveInstructionUTurn = [*textDirectionsFloorArray objectAtIndex:0];
                
                // Does this waypoint have only one connection?
                JMapASNode *firstNode = [useArrayOfFloorWaypoints.points objectAtIndex:0];
                NSArray *arr = [firstNode.edges copy];
                // Count type 1
                int type1Counter = 0;
                // We have to have only one of type 1
                // Disregard the others
                for(JMapASEdge *nextEdge in arr)
                {
                    // Look for Type one?
                    if(nextEdge.type.intValue == 1)
                    {
                        // Found one more
                        type1Counter++;
                    }
                }

                // Only 1 type 1?
                if(type1Counter != 1)
                {
                    // Waypoint has more than one connection
                    // This cannot be a U-Turn
                    return;
                }
                // else continue
                
                // More than 3 directions?
                if([*textDirectionsFloorArray count] < 4)
                {
                    // This cannot be U-Turn. Not enough directions/waypoints
                    return;
                }
                // else continue

                // Decide Direction of U-Turn
                BOOL directionIsRight = YES;
                // Can you get one more text direction?
                JMapTextDirectionInstruction *secondConsecutiveInstructionUTurn = [*textDirectionsFloorArray objectAtIndex:1];
                // Get angle difference
                float angleToDifference1 = firstConsecutiveInstructionUTurn.angleToNext - secondConsecutiveInstructionUTurn.angleToNext;
                while (angleToDifference1 < -180) angleToDifference1 += 360;
                while (angleToDifference1 > 180) angleToDifference1 -= 360;
                
                // Minus for Right
                // Plus for Left
                
                if(angleToDifference1 >= 0)
                {
                    // Right
                    directionIsRight = YES;
                }
                else
                {
                    // Left
                    directionIsRight = NO;
                }

                //UTurnInMeters
                
                // Tresholds
                float angle1_t = 95.0;
                float angle2_t = 95.0;
                float distance1_t = 2.0;
                float distance2_t = 5.0;
                float distance3_t = 5.0;

                // Segment A
                // Test Angle
                if(angle1_t < fabs(angleToDifference1))
                {
                    // This cannot be U-Turn, first angle treshold broken
                    return;
                }
                // Test Direction
                BOOL segmentADirectionRight = YES;
                if(angleToDifference1 >= 0)
                {
                    // Right
                    segmentADirectionRight = YES;
                }
                else
                {
                    // Left
                    segmentADirectionRight = NO;
                }
                if(directionIsRight != segmentADirectionRight)
                {
                    // Not in the same direction
                    // This cannot be UTurn
                    return;
                }
                // Test Distance
                CGPoint point1xy = CGPointMake(firstConsecutiveInstructionUTurn.wp.x.floatValue, firstConsecutiveInstructionUTurn.wp.y.floatValue);
                CGPoint point2xy = CGPointMake(secondConsecutiveInstructionUTurn.wp.x.floatValue, secondConsecutiveInstructionUTurn.wp.y.floatValue);
                float distance1 = [UIKitHelper distanceBetween:point1xy and:point2xy];
                float distance1Meters = [UIKitHelper convertPixelsToMeters:distance1 usingXYScale:xScale];
                if(distance1Meters <= distance1_t)
                {
                    // This cannot be UTurn
                    // Segment 1 is too long
                    return;
                }
                
                // Segment B
                // Third point
                JMapTextDirectionInstruction *thirdConsecutiveInstructionUTurn = [*textDirectionsFloorArray objectAtIndex:2];
                // Get angle difference
                float angleToDifference2 = secondConsecutiveInstructionUTurn.angleToNext - thirdConsecutiveInstructionUTurn.angleToNext;
                while (angleToDifference2 < -180) angleToDifference2 += 360;
                while (angleToDifference2 > 180) angleToDifference2 -= 360;
                // Test Angle
                if(angle2_t < fabs(angleToDifference2))
                {
                    // This cannot be U-Turn, first angle treshold broken
                    return;
                }
                // Test Direction
                BOOL segmentBDirectionRight = YES;
                if(angleToDifference2 >= 0)
                {
                    // Right
                    segmentBDirectionRight = YES;
                }
                else
                {
                    // Left
                    segmentBDirectionRight = NO;
                }
                if(directionIsRight != segmentBDirectionRight)
                {
                    // Not in the same direction
                    // This cannot be UTurn
                    return;
                }
                // Test Distance
                CGPoint point3xy = CGPointMake(thirdConsecutiveInstructionUTurn.wp.x.floatValue, thirdConsecutiveInstructionUTurn.wp.y.floatValue);
                float distance2 = [UIKitHelper distanceBetween:point2xy and:point3xy];
                float distance2Meters = [UIKitHelper convertPixelsToMeters:distance2 usingXYScale:xScale];
                if(distance2Meters <= distance2_t)
                {
                    // This cannot be UTurn
                    // Segment 2 is too long
                    return;
                }

                // Segment C
                // Fourth point
                JMapTextDirectionInstruction *fourthConsecutiveInstructionUTurn = [*textDirectionsFloorArray objectAtIndex:3];
                // Test Distance ONLY.
                // It should be less than 3rd treshold
                CGPoint point4xy = CGPointMake(fourthConsecutiveInstructionUTurn.wp.x.floatValue, fourthConsecutiveInstructionUTurn.wp.y.floatValue);
                float distance3 = [UIKitHelper distanceBetween:point3xy and:point4xy];
                float distance3Meters = [UIKitHelper convertPixelsToMeters:distance3 usingXYScale:xScale];
                // Note 3rd must be greater than treshold
                if(distance3_t >= distance3Meters)
                {
                    // This cannot be UTurn
                    // Segment 3 is too SHORT!
                    return;
                }
                
                // This is a U-Turn
                // Direction
                if(directionIsRight)
                {
                    // Left
                    firstConsecutiveInstructionUTurn.direction = @"Right";
                }
                else
                {
                    // Left
                    firstConsecutiveInstructionUTurn.direction = @"Left";
                }
                // Add UTurn Direction
                firstConsecutiveInstructionUTurn.direction = [firstConsecutiveInstructionUTurn.direction stringByAppendingString:@" UTurn"];
                
                // First is going to be U-Turn on Left/Right side
                // Combine firstConsecutiveInstruction output
                NSString *newOutput = [NSString stringWithFormat:@"With %@ on your %@, make %@.", firstConsecutiveInstructionUTurn.landmarkDestination.name, firstConsecutiveInstructionUTurn.directionToLandmark, firstConsecutiveInstructionUTurn.direction];
                // Update
                firstConsecutiveInstructionUTurn.output = newOutput;

                NSLog(@"Detected UTurn");
                
                // Fold 2
                // Add distance
                float combinedFirstDistance = firstConsecutiveInstructionUTurn.distanceToNextPixels.floatValue;
                // 2nd to 3rd
                combinedFirstDistance += secondConsecutiveInstructionUTurn.distanceToNextPixels.floatValue;
                // 3nd to 4th
                combinedFirstDistance += thirdConsecutiveInstructionUTurn.distanceToNextPixels.floatValue;

                // Update First
                firstConsecutiveInstructionUTurn.distanceToNextPixels = [NSNumber numberWithFloat:combinedFirstDistance];
                firstConsecutiveInstructionUTurn.distanceToNextMeters = [NSNumber numberWithFloat:[UIKitHelper convertPixelsToMeters:combinedFirstDistance usingXYScale:xScale]];
                
                // Fold current into firstConsecutiveInstruction
                [firstConsecutiveInstructionUTurn foldInFront:secondConsecutiveInstructionUTurn];
                // Remove from textDirectionsFloorArray
                [*textDirectionsFloorArray removeObjectAtIndex:1];
                
                // Fold 3 into firstConsecutiveInstruction
                [firstConsecutiveInstructionUTurn foldInFront:thirdConsecutiveInstructionUTurn];
                // Remove from textDirectionsFloorArray
                [*textDirectionsFloorArray removeObjectAtIndex:1];
            }
        }
    }
}
*/
