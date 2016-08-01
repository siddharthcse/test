var __ = require('../helpers');

module.exports = function consecutiveForwards(inst) {

  if(inst.enableDistanceFilters) {
    // Fill in the gaps
    // Disable is not over zero
    if(inst.addTDifEmptyMeters > 0) {
      // Make array
      var numberOfReduced = 0;
      var distanceTotalPX = null;
      //consecutiveArrayDirection = [[NSMutableArray alloc] init];
      //JMapTextDirectionInstruction *firstConsecutiveInstruction = nil;
      //CGPoint firstPoint;
      // Use xyScale
      var theAbsorbingDistance = __.convertMetersToPixels(inst.addTDifEmptyMeters, inst.xScale);
      // Get previous
      var indexOfReferenceForward = 0;
      var lastStandingInstruction = inst.textDirectionsFloorArray[0];
      var previousPoint = [lastStandingInstruction.wp.x, lastStandingInstruction.wp.y];
      // Loop through all else
      var loopTo3 = inst.textDirectionsFloorArray.length - 1;
      for(var i = 1; i < loopTo3; i++) {
        // Get direction
        var nextInstruction = inst.textDirectionsFloorArray[i];
        var nextPoint = [nextInstruction.wp.x, nextInstruction.wp.y];

        // Forward?
        if(nextInstruction.direction.toLowerCase() === 'Forward'.toLowerCase()) {
          // Process

          // Calculate the distance between first and last
          // Distance in px
          distanceTotalPX = __.distanceBetween(previousPoint, nextPoint);

          // Within absorbing distance?
          if(distanceTotalPX < theAbsorbingDistance) {
            // PacMan it
            // Carry angleTo back and forth
            //...

            // Fold to back of next next
            lastStandingInstruction.foldInFront(nextInstruction);

            // Remove from textDirectionsFloorArray
            inst.textDirectionsFloorArray.splice(i, 1);

            numberOfReduced++;

            // Dec loopTo
            loopTo3--;
            // Go back one index
            i--;
          } else {
            // Outside of theAbsorbingDistance
            // Reset cycle
            previousPoint = [0, 0];

            // Pick up first in cycle
            if(true)
            //if([nextInstruction.direction.lowercaseString isEqualToString:@"Forward".lowercaseString])
            {
              lastStandingInstruction = nextInstruction;
              indexOfReferenceForward = i;
              previousPoint = [lastStandingInstruction.wp.x, lastStandingInstruction.wp.y];
            }
          }
        }
        // If lastStandingInstruction if Forward and next instruction is not forward and if lastStandingInstruction is within distance, elminate self
        //else if(NO)
        else if(lastStandingInstruction.direction.toLowerCase() === 'Forward'.toLowerCase()) {
          // lastStandingInstruction

          // Calculate the distance between first and last
          // Distance in px
          distanceTotalPX = __.distanceBetween(previousPoint, nextPoint);

          // Within absorbing distance?
          if(distanceTotalPX < theAbsorbingDistance) {
            // PacMan self
            // Carry angleTo back and forth
            //...

            // Not if first
            // Fold it to previous
            if(0 !== indexOfReferenceForward) {
              // Fold it in next behind
              nextInstruction.foldToBack(lastStandingInstruction);

              // Remove from textDirectionsFloorArray
              inst.textDirectionsFloorArray.splice(indexOfReferenceForward, 1);

              numberOfReduced++;

              // Dec loopTo
              loopTo3--;
              // Go back one index
              // Don't prev index, because we have to skip to next
              //i--;
            }
          }
          // Skip to next point?
          // Set new previous
          lastStandingInstruction = nextInstruction;
          indexOfReferenceForward = i;
          previousPoint = [lastStandingInstruction.wp.x, lastStandingInstruction.wp.y];
        } else {
          // Direction change
          // Pick up first in cycle
          if(true)
          //if([nextInstruction.direction.lowercaseString isEqualToString:@"Forward".lowercaseString])
          {
            lastStandingInstruction = nextInstruction;
            indexOfReferenceForward = i;
            previousPoint = [lastStandingInstruction.wp.x, lastStandingInstruction.wp.y];
          }
        }
      }
      //NSLog(@"numberOfReduced: %d", numberOfReduced);
    }
  }

};

/*

// Filter No.4 Remove consecutive Forwards
-(void)filterNo4RemoveConsecutiveForwards:(NSMutableArray **)textDirectionsFloorArray useArrayOfFloorWaypoints:(JMapPathPerFloor *)useArrayOfFloorWaypoints wayfindArray:(NSArray *)wayfindArray filterOn:(BOOL)filterOn addTDifEmptyMeters:(float)addTDifEmptyMeters UTurnInMeters:(float)UTurnInMeters enableDistanceFilters:(BOOL)enableDistanceFilters xScale:(float)xScale yScale:(float)yScale currentFloorTD:(JMapFloor *)currentFloorTD curCanvas:(JMapCanvas *)curCanvas
{
    if(enableDistanceFilters)
    {
        // Fill in the gaps
        // Disable is not over zero
        if(addTDifEmptyMeters > 0.0)
        {
            // Make array
            int numberOfReduced = 0;
            //consecutiveArrayDirection = [[NSMutableArray alloc] init];
            //JMapTextDirectionInstruction *firstConsecutiveInstruction = nil;
            //CGPoint firstPoint;
            // Use xyScale
            float theAbsorbingDistance = [UIKitHelper convertMetersToPixels:addTDifEmptyMeters usingXYScale:xScale];
            // Get previous
            NSInteger indexOfReferenceForward = 0;
            JMapTextDirectionInstruction *lastStandingInstruction = [*textDirectionsFloorArray objectAtIndex:0];
            CGPoint previousPoint = CGPointMake(lastStandingInstruction.wp.x.floatValue, lastStandingInstruction.wp.y.floatValue);
            // Loop through all else
            NSInteger loopTo3 = [*textDirectionsFloorArray count] - 1;
            for(int i = 1; i < loopTo3; i++)
            {
                // Get direction
                JMapTextDirectionInstruction *nextInstruction = [*textDirectionsFloorArray objectAtIndex:i];
                CGPoint nextPoint = CGPointMake(nextInstruction.wp.x.floatValue, nextInstruction.wp.y.floatValue);

                // Forward?
                if([nextInstruction.direction.lowercaseString isEqualToString:@"Forward".lowercaseString])
                {
                    // Process
                    
                    // Calculate the distance between first and last
                    // Distance in px
                    float distanceTotalPX = [UIKitHelper distanceBetween:previousPoint and:nextPoint];
                    
                    // Within absorbing distance?
                    if(distanceTotalPX < theAbsorbingDistance)
                    {
                        // PacMan it
                        // Carry angleTo back and forth
                        //...
                      
                        // Fold it to back of next
                        // NSInteger nextNextIndex = i + 1;
                        // if(nextNextIndex < [*textDirectionsFloorArray count])
                        // {
                        //     // Can do
                        //     JMapTextDirectionInstruction *nextNextInstruction = [*textDirectionsFloorArray objectAtIndex:nextNextIndex];
                      
                        
                            // Fold to back of next next
                            [lastStandingInstruction foldInFront:nextInstruction];
                            
                            // Remove from textDirectionsFloorArray
                            [*textDirectionsFloorArray removeObjectAtIndex:i];
                            
                            numberOfReduced++;
                            
                            // Dec loopTo
                            loopTo3--;
                            // Go back one index
                            i--;
                        //}
                    }
                    else
                    {
                        // Outside of theAbsorbingDistance
                        // Reset cycle
                        previousPoint = CGPointZero;
                        
                        // Pick up first in cycle
                        if(YES)
                        //if([nextInstruction.direction.lowercaseString isEqualToString:@"Forward".lowercaseString])
                        {
                            lastStandingInstruction = nextInstruction;
                            indexOfReferenceForward = i;
                            previousPoint = CGPointMake(lastStandingInstruction.wp.x.floatValue, lastStandingInstruction.wp.y.floatValue);
                        }
                    }
                }
                // If lastStandingInstruction if Forward and next instruction is not forward and if lastStandingInstruction is within distance, elminate self
                //else if(NO)
                else if([lastStandingInstruction.direction.lowercaseString isEqualToString:@"Forward".lowercaseString])
                {
                    // lastStandingInstruction
                    
                    // Calculate the distance between first and last
                    // Distance in px
                    float distanceTotalPX = [UIKitHelper distanceBetween:previousPoint and:nextPoint];
                    
                    // Within absorbing distance?
                    if(distanceTotalPX < theAbsorbingDistance)
                    {
                        // PacMan self
                        // Carry angleTo back and forth
                        //...
                        
                        // Not if first
                        // Fold it to previous
                        if(0 != indexOfReferenceForward)
                        {
                            // Fold it in next behind
                            [nextInstruction foldToBack:lastStandingInstruction];
                            
                            // Remove from textDirectionsFloorArray
                            [*textDirectionsFloorArray removeObjectAtIndex:indexOfReferenceForward];
                            
                            numberOfReduced++;
                            
                            // Dec loopTo
                            loopTo3--;
                            // Go back one index
                            // Don't prev index, because we have to skip to next
                            //i--;
                        }
                    }
                    // Skip to next point?
                    // Set new previous
                    lastStandingInstruction = nextInstruction;
                    indexOfReferenceForward = i;
                    previousPoint = CGPointMake(lastStandingInstruction.wp.x.floatValue, lastStandingInstruction.wp.y.floatValue);
                }
                else
                {
                    // Direction change
                    // Pick up first in cycle
                    if(YES)
                        //if([nextInstruction.direction.lowercaseString isEqualToString:@"Forward".lowercaseString])
                    {
                        lastStandingInstruction = nextInstruction;
                        indexOfReferenceForward = i;
                        previousPoint = CGPointMake(lastStandingInstruction.wp.x.floatValue, lastStandingInstruction.wp.y.floatValue);
                    }
                }
            }
            //NSLog(@"numberOfReduced: %d", numberOfReduced);
        }
    }
}

*/
