module.exports = function endAsLandMark(inst) {
  if(inst.useArrayOfFloorWaypoints == inst.wayfindArray[inst.wayfindArray.length - 1]) {
    // This is the last floor
    var lastDirection = inst.textDirectionsFloorArray[inst.textDirectionsFloorArray.length - 1];
    if(lastDirection && lastDirection.destination) {
      // Still looking
      var foundIt = false;
      var firstIndex = 0;
      for(var i = 0; i < inst.textDirectionsFloorArray.length; i++) {
        var nextDirection = inst.textDirectionsFloorArray[i];
        // Ignore first direction--it could be a mover
        if(nextDirection != inst.textDirectionsFloorArray[0]) {
          // Match?
          // Same Landmark
          if(nextDirection.landmarkDestination.id == lastDirection.destination.id) {
            // Got it
            foundIt = true;
            // Break
            break;
          }
        }
        // Inc firstIndex
        firstIndex++;
      }

      if(foundIt) {
        var loopTo = inst.textDirectionsFloorArray.length - 1;
        for(i = (loopTo - 1); i >= firstIndex; i--) {
          // Fold second last
          var foldDirection = inst.textDirectionsFloorArray[i];

          // Carry last direction behind you
          lastDirection.foldToBack(foldDirection);

          // Same, remove it
          inst.textDirectionsFloorArray.splice(i, 1);
        }
      }
    }
  }
};

/*

// Filter No.1 Take Out Directions Between Last And First
-(void)filterNo1TakeOutDirectionsBetweenLastAndFirst:(NSMutableArray **)textDirectionsFloorArray useArrayOfFloorWaypoints:(JMapPathPerFloor *)useArrayOfFloorWaypoints wayfindArray:(NSArray *)wayfindArray filterOn:(BOOL)filterOn addTDifEmptyMeters:(float)addTDifEmptyMeters UTurnInMeters:(float)UTurnInMeters enableDistanceFilters:(BOOL)enableDistanceFilters xScale:(float)xScale yScale:(float)yScale currentFloorTD:(JMapFloor *)currentFloorTD curCanvas:(JMapCanvas *)curCanvas
{
    if(useArrayOfFloorWaypoints == [wayfindArray lastObject])
    {
        // This is the last floor
        JMapTextDirectionInstruction *lastDirection = [*textDirectionsFloorArray lastObject];
        if(lastDirection)
        {
            //NSLog(@"last: %@", lastDirection.destination.name);
            // Still looking
            BOOL foundIt = NO;
            int firstIndex = 0;
            for(JMapTextDirectionInstruction *nextDirection in *textDirectionsFloorArray)
            {
                // Ignore first direction--it could be a mover
                if(nextDirection != [*textDirectionsFloorArray firstObject])
                {
                    // Match?
                    // Same Landmark
                    //NSLog(@"next: %@", nextDirection.landmarkDestination.name);
                    if(nextDirection.landmarkDestination.id.intValue == lastDirection.destination.id.intValue)
                    {
                        // Got it
                        foundIt = YES;
                        
                        // Break
                        break;
                    }
                }
                
                // Inc firstIndex
                firstIndex++;
            }
            if(foundIt)
            {
                NSInteger loopTo = [*textDirectionsFloorArray count] - 1;
                for(long i = (loopTo - 1); i >= firstIndex; i--)
                {
                    // Fold second last
                    JMapTextDirectionInstruction *foldDirection = [*textDirectionsFloorArray objectAtIndex:i];
                    
                    // Carry last direction behind you
                    [lastDirection foldToBack:foldDirection];
                    
                    // Same, remove it
                    [*textDirectionsFloorArray removeObjectAtIndex:i];
                }
            }
        }
    }
}
*/
