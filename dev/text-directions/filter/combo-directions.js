var __ = require('../helpers');

module.exports = function comboDirections(inst) {

  var loopTo = inst.textDirectionsFloorArray.length - 1;
  var consecutiveArrayDirection = [];
  var consecutiveArrayTimes = [];
  var firstConsecutiveInstruction = null;
  for(var i = 1; i < loopTo; i++) {
    // Fold second last
    var currentInstruction = inst.textDirectionsFloorArray[i];

    // Different landmark?
    if(!firstConsecutiveInstruction || firstConsecutiveInstruction.landmarkDestination.id != currentInstruction.landmarkDestination.id) {
      // Process array if more than 1
      if(consecutiveArrayDirection.length > 1) {
        // combinedDirections
        var combinedDirections = '';
        var nextDirection = '';
        var consecutive = [];
        for(var j = 0; j < consecutiveArrayDirection.length; j++) {
          nextDirection = consecutiveArrayDirection[j];
          var nextDirectionTimes = consecutiveArrayTimes[j];

          // Avoid "Forward" unless this is the last textDirection
          var canPass = true;
          if((nextDirection.toLowerCase() === 'Forward'.toLowerCase()) &&
            (j < (consecutiveArrayDirection.length - 1)))
          // -1 is to allow for last consecutive direction to be Forward
          {
            // Do not process
            canPass = false;
            //NSLog(@"Forward blocked");
          }
          if(canPass) {
            // Make string
            var nextCombinedDirection = '';
            // Singular or plural
            if(nextDirectionTimes == 1) {
              // Singular
              nextCombinedDirection = __.stringWithFormat('%', nextDirection);
            } else {
              // Plural
              nextCombinedDirection = __.stringWithFormat('% % times', nextDirection, nextDirectionTimes);
            }

            consecutive.push({
              direction: nextDirection,
              amount: nextDirectionTimes
            });

            // Last?
            if(j != (consecutiveArrayDirection.length - 1)) {
              // Not Last
              nextCombinedDirection += ', then ';
            }

            // combinedDirections
            combinedDirections += nextCombinedDirection;
          }
        }

        // Combine firstConsecutiveInstruction output
        var newOutput = __.stringWithFormat('With % on your %, go %.',
          firstConsecutiveInstruction.landmarkDestination.name,
          firstConsecutiveInstruction.directionToLandmark,
          combinedDirections);

        //Remove first item in consecutive array, belongs to initial instruction
        consecutive.shift();

        // Update
        firstConsecutiveInstruction.type = 'combo';
        firstConsecutiveInstruction.secondaryDirections = consecutive;
        firstConsecutiveInstruction.output = newOutput;
      }
      // Reset array
      consecutiveArrayDirection = [];
      consecutiveArrayTimes = [];

      // Next consecutive
      firstConsecutiveInstruction = currentInstruction;

      // Add first direction
      consecutiveArrayDirection.push(firstConsecutiveInstruction.direction);
      consecutiveArrayTimes.push(1);
    } else {
      // Add direction to array
      // Unless the last direction is same as this one, then add another step to it
      var lastObject = consecutiveArrayDirection[consecutiveArrayDirection.length - 1];
      if(lastObject.toLowerCase() === currentInstruction.direction.toLowerCase()) {
        // NOTE: Do not count up in case of Forward.
        // Bad:  With X on your Left, go Forward 3 times.
        // Good: With X on your Left, go Forward
        if(currentInstruction.direction.toLowerCase() !== 'Forward'.toLowerCase()) {
          // Inc one more
          var currentCounter = consecutiveArrayTimes[consecutiveArrayTimes.length - 1];
          currentCounter++;
          // Delete last object
          consecutiveArrayTimes.pop();
          // Add new
          consecutiveArrayTimes.push(currentCounter);
        }
      } else {
        // Add first different direction
        consecutiveArrayDirection.push(currentInstruction.direction);
        consecutiveArrayTimes.push(1);
      }

      // Fold current into firstConsecutiveInstruction
      firstConsecutiveInstruction.foldInFront(currentInstruction);

      // Remove from textDirectionsFloorArray
      inst.textDirectionsFloorArray.splice(i, 1);

      // Dec loopTo
      loopTo--;
      // Go back one index
      i--;
    }
  }

};

/*

// Filter No.5 Redundant instructions in the Middle of Instructions (combo-directions)
-(void)filterNo5RedundantInstructionsInMiddleInstructionsComboDirections:(NSMutableArray **)textDirectionsFloorArray useArrayOfFloorWaypoints:(JMapPathPerFloor *)useArrayOfFloorWaypoints wayfindArray:(NSArray *)wayfindArray filterOn:(BOOL)filterOn addTDifEmptyMeters:(float)addTDifEmptyMeters UTurnInMeters:(float)UTurnInMeters enableDistanceFilters:(BOOL)enableDistanceFilters xScale:(float)xScale yScale:(float)yScale currentFloorTD:(JMapFloor *)currentFloorTD curCanvas:(JMapCanvas *)curCanvas
{
    NSInteger loopTo = [*textDirectionsFloorArray count] - 1;
    NSMutableArray *consecutiveArrayDirection = [[NSMutableArray alloc] init];
    NSMutableArray *consecutiveArrayTimes = [[NSMutableArray alloc] init];
    JMapTextDirectionInstruction *firstConsecutiveInstruction = nil;
    for(int i = 1; i < loopTo; i++)
    {
        // Fold second last
        JMapTextDirectionInstruction *currentInstruction = [*textDirectionsFloorArray objectAtIndex:i];

        // Different landmark?
        if(firstConsecutiveInstruction.landmarkDestination.id.intValue != currentInstruction.landmarkDestination.id.intValue)
        {
            // Process array if more than 1
            if(consecutiveArrayDirection.count > 1)
            {
                // combinedDirections
                NSString *combinedDirections = @"";
                for(int j = 0; j < consecutiveArrayDirection.count; j++)
                {
                    NSString *nextDirection = [consecutiveArrayDirection objectAtIndex:j];
                    NSNumber *nextDirectionTimes = [consecutiveArrayTimes objectAtIndex:j];
                    
                    // Avoid "Forward" unless this is the last textDirection
                    BOOL canPass = YES;
                    if(([nextDirection.lowercaseString isEqualToString:@"Forward".lowercaseString]) &&
                       (j < (consecutiveArrayDirection.count - 1)))
                        // -1 is to allow for last consecutive direction to be Forward
                    {
                        // Do not process
                        canPass = NO;
                        //NSLog(@"Forward blocked");
                    }
                    if(canPass)
                    {
                        // Make string
                        NSString *nextCombinedDirection = @"";
                        // Singular or plural
                        if(nextDirectionTimes.intValue == 1)
                        {
                            // Singular
                            nextCombinedDirection = [NSString stringWithFormat:@"%@", nextDirection];
                        }
                        else
                        {
                            // Plural
                            nextCombinedDirection = [NSString stringWithFormat:@"%@ %@ times", nextDirection, nextDirectionTimes];
                        }
                        // Last?
                        if(j != (consecutiveArrayDirection.count - 1))
                        {
                            // Not Last
                            nextCombinedDirection = [nextCombinedDirection stringByAppendingString:@", then "];
                        }
                        
                        // combinedDirections
                        combinedDirections = [combinedDirections stringByAppendingString:nextCombinedDirection];
                    }
                }
                
                // Combine firstConsecutiveInstruction output
                NSString *newOutput = [NSString stringWithFormat:@"With %@ on your %@, go %@.", firstConsecutiveInstruction.landmarkDestination.name, firstConsecutiveInstruction.directionToLandmark, combinedDirections];
                
                // Update
                firstConsecutiveInstruction.output = newOutput;
            }
            // Reset array
            [consecutiveArrayDirection removeAllObjects];
            [consecutiveArrayTimes removeAllObjects];
            
            // Next consecutive
            firstConsecutiveInstruction = currentInstruction;
            
            // Add first direction
            [consecutiveArrayDirection addObject:firstConsecutiveInstruction.direction];
            [consecutiveArrayTimes addObject:[NSNumber numberWithInt:1]];
        }
        else
        {
            // Add direction to array
            // Unless the last direction is same as this one, then add another step to it
            if([((NSString *)[consecutiveArrayDirection lastObject]).lowercaseString isEqualToString:currentInstruction.direction.lowercaseString])
            {
                // NOTE: Do not count up in case of Forward.
                // Bad:  With X on your Left, go Forward 3 times.
                // Good: With X on your Left, go Forward
                if(![currentInstruction.direction.lowercaseString isEqualToString:@"Forward".lowercaseString])
                {
                    // Inc one more
                    int currentCounter = [[consecutiveArrayTimes lastObject] intValue];
                    currentCounter++;
                    // Delete last object
                    [consecutiveArrayTimes removeLastObject];
                    // Add new
                    [consecutiveArrayTimes addObject:[NSNumber numberWithInt:currentCounter]];
                }
            }
            else
            {
                // Add first different direction
                [consecutiveArrayDirection addObject:currentInstruction.direction];
                [consecutiveArrayTimes addObject:[NSNumber numberWithInt:1]];
            }
            
            // Fold current into firstConsecutiveInstruction
            [firstConsecutiveInstruction foldInFront:currentInstruction];
            
            // Remove from textDirectionsFloorArray
            [*textDirectionsFloorArray removeObjectAtIndex:i];
            
            // Dec loopTo
            loopTo--;
            // Go back one index
            i--;
        }
    }
}

*/
