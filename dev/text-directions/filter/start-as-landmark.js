var _ = require('../helpers');

module.exports = function startAsLandMark(inst) {

  if(inst.useArrayOfFloorWaypoints == inst.wayfindArray[0]) {
    // On first floor!
    // See if next text direction is using start-destination and if it does, fold it, taking its direction as first.

    // Take first
    var loopToFirst = inst.textDirectionsFloorArray.length - 1;
    var firstInstruction = inst.textDirectionsFloorArray[0];

    for(var i = 1; i < loopToFirst; i++) {
      // Take ONLY !next!
      var currentInstruction = inst.textDirectionsFloorArray[i];

      // If landmarkDestination same as Destination, fold next into first
      if(firstInstruction.destination) {
        if(currentInstruction.landmarkDestination.id == firstInstruction.destination.id) {
          // Copy direction
          // Apply its direction to first
          firstInstruction.direction = currentInstruction.direction;

          // Rebuild output
          firstInstruction.output = _.stringWithFormat('With % behind you, go %.', firstInstruction.destination.name, firstInstruction.direction);

          // Fold current into firstConsecutiveInstruction
          firstInstruction.foldInFront(currentInstruction);

          // Remove from textDirectionsFloorArray
          inst.textDirectionsFloorArray.splice(i, 1);

          // Break out
          break;

        }
      }
    }
  }

};

/*

// Filter No.2 Start Direction assumes directions of all next directions which use its Destination as their Landmarks.
-(void)filterNo2StartDirectionCleanUpAllWhichUseDestinationAsLandmarks:(NSMutableArray **)textDirectionsFloorArray useArrayOfFloorWaypoints:(JMapPathPerFloor *)useArrayOfFloorWaypoints wayfindArray:(NSArray *)wayfindArray filterOn:(BOOL)filterOn addTDifEmptyMeters:(float)addTDifEmptyMeters UTurnInMeters:(float)UTurnInMeters enableDistanceFilters:(BOOL)enableDistanceFilters xScale:(float)xScale yScale:(float)yScale currentFloorTD:(JMapFloor *)currentFloorTD curCanvas:(JMapCanvas *)curCanvas
{
    if(useArrayOfFloorWaypoints == [wayfindArray firstObject])
    {
        // On first floor!
        // See if next text direction is using start-destination and if it does, fold it, taking its direction as first.
        
        // Take first
        NSInteger loopToFirst = [*textDirectionsFloorArray count] - 1;
        JMapTextDirectionInstruction *firstInstruction = [*textDirectionsFloorArray objectAtIndex:0];
        for(int i = 1; i < loopToFirst; i++)
        {
            // Take ONLY !next!
            JMapTextDirectionInstruction *currentInstruction = [*textDirectionsFloorArray objectAtIndex:i];
            
            // If landmarkDestination same as Destination, fold next into first
            if(currentInstruction.landmarkDestination.id.intValue == firstInstruction.destination.id.intValue)
            {
                // Copy direction
                // Apply its direction to first
                firstInstruction.direction = currentInstruction.direction;
                
                // Rebuild output
                firstInstruction.output = [NSString stringWithFormat:@"With %@ behind you, go %@.", firstInstruction.destination.name, firstInstruction.direction];
                
                // Fold current into firstConsecutiveInstruction
                [firstInstruction foldInFront:currentInstruction];
                
                // Remove from textDirectionsFloorArray
                [*textDirectionsFloorArray removeObjectAtIndex:i];
                
                // Break out
                break;
          
            }
        }
    }
}

*/
