var __ = require('../helpers');

module.exports = function continuePast(inst) {

  if(inst.enableDistanceFilters) {
    // Fill in the gaps
    // Disable is not over zero
    if(inst.addTDifEmptyMeters > 0) {
      // Use xyScale
      var theDistance = __.convertMetersToPixels(inst.addTDifEmptyMeters, inst.xScale);
      // Language filters:
      var loopToContinuePast = inst.textDirectionsFloorArray.length - 1;
      for(var i = 0; i < loopToContinuePast; i++) {
        // Get direction
        var instruction1 = inst.textDirectionsFloorArray[i];

        // Get next
        var instruction2 = inst.textDirectionsFloorArray[i + 1];

        // Need two consecutive waypoints on straight line.
        // If instruction has folded points use the wolded point at its end of array
        // If no folded points, use wp of instruction
        var usedInstruction1;
        var usedInstruction2;

        // From point
        var waypoint1;
        usedInstruction1 = instruction1;
        waypoint1 = usedInstruction1.wp;
        var point1 = [waypoint1.x, waypoint1.y];

        // To point
        var waypoint2;
        usedInstruction2 = instruction2;
        waypoint2 = usedInstruction2.wp;
        var point2 = [waypoint2.x, waypoint2.y];

        // Get distance in pixels
        var distanceInPX = __.distanceBetween(point1, point2);

        // Over?
        var difference = -1;
        var evenDistance = -1;
        // How many points?
        var denominator = parseInt(distanceInPX / theDistance);
        if(denominator > 1) {
          // Get soft difference

          difference = (distanceInPX - (theDistance * denominator)) / denominator;
          evenDistance = theDistance + difference;
          // Generate all points that would fit the gap
          for(var j = 0; j < (denominator - 1); j++) {
            // Make new point
            var newPoint = __.pointOnLineUsingDistanceFromStart(point1, point2, evenDistance);

            // Correct the point so it's on the path
            newPoint = __.correctPointUsingWayfindPath(inst.useArrayOfFloorWaypoints, newPoint, 0);

            // Turn into text direction
            var nextInsertDir = {};

            // Populate fields
            nextInsertDir.floor = inst.currentFloorTD.id;
            nextInsertDir.floorName = inst.currentFloorTD.name;
            nextInsertDir.wp = {
              x: newPoint[0],
              y: newPoint[1],
              mapId: inst.currentFloorTD.id
            };
            nextInsertDir.direction = usedInstruction1.direction;

            // Get Angle to next
            var angleToNext = __.pointPairToBearingDegrees(point1, newPoint);
            nextInsertDir.angleToNext = angleToNext;
            // Get angle to previous
            var angleToNextOfPrevious = __.pointPairToBearingDegrees(newPoint, point2);
            nextInsertDir.angleToNextOfPreviousDirection = angleToNextOfPrevious;

            // Landmark
            // Get Landmark using line of sight
            // Used to describe point of reference eg.: "With *Landmark* on your Left, proceed Forward"

            // Get nearest destination using line of sight
            var returnClosestPoint = {
              value: null
            };
            //NSDate *startLOS = [NSDate date];
            var tempLandmark = this.lineOfSightFromClosestLandmarkToXY(
              newPoint,
              returnClosestPoint,
              nextInsertDir.direction,
              nextInsertDir.angleToNextOfPreviousDirection,
              inst.curCanvas);

            if(tempLandmark) {
              nextInsertDir.landmarkDestination = tempLandmark;
              // Find WP so we can accurately determine angle to destination's entrance
              var landmarkWP = this.model.getWaypointsByDestinationId(nextInsertDir.landmarkDestination.id);
              if(landmarkWP.length) {

                //NOTE: Xerxes this is an issue, choosing the first waypoint
                nextInsertDir.landmarkWP = landmarkWP[0];

                // Get angle comparing Direction angleToNext
                // Direction
                // Get Direction
                // Figure out the angle to next
                // Get angle

                var angle = __.pointPairToBearingDegrees(newPoint, returnClosestPoint.value);

                // Get angle to next
                nextInsertDir.angleToLandmark = angle;

                // What is the angle difference?
                var angleToLandmarkDifference = nextInsertDir.angleToNextOfPreviousDirection - nextInsertDir.angleToLandmark;
                while(angleToLandmarkDifference < -180) angleToLandmarkDifference += 360;
                while(angleToLandmarkDifference > 180) angleToLandmarkDifference -= 360;

                // Compute next direction
                nextInsertDir.directionToLandmark = __.directionFromAngle(angleToLandmarkDifference, null);
              }
            } else {
              // debugger;
              // No destination
              nextInsertDir.landmarkDestination = null;
              nextInsertDir.landmarkWP = null;
              nextInsertDir.angleToLandmark = -1;
            }

            // Set output
            if(nextInsertDir.landmarkDestination) {
              nextInsertDir.output = __.stringWithFormat('Continue Past %', nextInsertDir.landmarkDestination.name);
            } else {
              nextInsertDir.output = 'Continue Past';
            }

            nextInsertDir.type = 'continuepast';

            // Insert to array
            inst.textDirectionsFloorArray.splice(i + 1, 0, nextInsertDir);

            // Inc bounds
            loopToContinuePast++;
            // Inc for loop driver
            i++;

            // Recalculate distance using newly generated point
            point1 = newPoint;
          }
        }
      }
    }
  }

};

/*

// Filter No.6 Continue Past, Filler!
-(void)filterNo6ContinuePastFiller:(NSMutableArray **)textDirectionsFloorArray useArrayOfFloorWaypoints:(JMapPathPerFloor *)useArrayOfFloorWaypoints wayfindArray:(NSArray *)wayfindArray filterOn:(BOOL)filterOn addTDifEmptyMeters:(float)addTDifEmptyMeters UTurnInMeters:(float)UTurnInMeters enableDistanceFilters:(BOOL)enableDistanceFilters xScale:(float)xScale yScale:(float)yScale currentFloorTD:(JMapFloor *)currentFloorTD curCanvas:(JMapCanvas *)curCanvas
{
    //addTDifEmptyMeters = 9;
    if(enableDistanceFilters)
    {
        // Fill in the gaps
        // Disable is not over zero
        if(addTDifEmptyMeters > 0.0)
        {
            // Use xyScale
            float theDistance = [UIKitHelper convertMetersToPixels:addTDifEmptyMeters usingXYScale:xScale];
            // Language filters:
            //NSLog(@"count: %lu", (unsigned long)textDirectionsFloorArray.count);
            NSInteger loopToContinuePast = [*textDirectionsFloorArray count] - 1;
            for(int i = 0; i < loopToContinuePast; i++)
            {
                // Get direction
                JMapTextDirectionInstruction *instruction1 = [*textDirectionsFloorArray objectAtIndex:i];
                
                //NSLog(@"%d: %@", i, instruction1.landmarkDestination.name);
                
                // Get next
                JMapTextDirectionInstruction *instruction2 = [*textDirectionsFloorArray objectAtIndex:(i + 1)];
                
                //NSLog(@"%d: %@", i + 1, instruction2.landmarkDestination.name);
                
                // Need two consecutive waypoints on straight line.
                // If instruction has folded points use the wolded point at its end of array
                // If no folded points, use wp of instruction
                JMapTextDirectionInstruction *usedInstruction1;
                JMapTextDirectionInstruction *usedInstruction2;
                
                // From point
                JMapWaypoint *waypoint1;
                //  if((instruction1.foldedPointsFront.count > 0) && (i == 0))
                //  {
                //  usedInstruction1 = [instruction1.foldedPointsFront lastObject];
                //  }
                //  else
                //  {
                //  usedInstruction1 = instruction1;
                //  }
                usedInstruction1 = instruction1;
                waypoint1 = usedInstruction1.wp;
                CGPoint point1 = CGPointMake(waypoint1.x.floatValue, waypoint1.y.floatValue);
                
                // To point
                JMapWaypoint *waypoint2;
                //  if((instruction2.foldedPointsBack.count > 0) && ((i + 1) == loopToContinuePast))
                //  {
                //  usedInstruction2 = [instruction2.foldedPointsBack lastObject];
                //  }
                //  else
                //  {
                //  usedInstruction2 = instruction2;
                //  }
                usedInstruction2 = instruction2;
                waypoint2 = usedInstruction2.wp;
                CGPoint point2 = CGPointMake(waypoint2.x.floatValue, waypoint2.y.floatValue);
                
                
                // Visualize unit tests
                //  dispatch_async(dispatch_get_main_queue(), ^{
                //
                //  UIColor *rndCol = [UIKitHelper randomColor];
                //
                //  UIView *addedTextDir1 = [[UIView alloc] initWithFrame:CGRectMake(point1.x - 20, point1.y - 20, 40, 40)];
                //  [addedTextDir1 setBackgroundColor:rndCol];
                //  [[self getCurrentFloorView] addSubview:addedTextDir1];
                //
                //  UIView *addedTextDir2 = [[UIView alloc] initWithFrame:CGRectMake(point2.x - 20, point2.y - 20, 40, 40)];
                //  [addedTextDir2 setBackgroundColor:rndCol];
                //  [[self getCurrentFloorView] addSubview:addedTextDir2];
                //  });
                
                
                // Get distance in pixels
                float distanceInPX = [UIKitHelper distanceBetween:point1 and:point2];
                
                // Over?
                float difference = -1;
                float evenDistance = -1;
                // How many points?
                int denominator = distanceInPX / theDistance;
                if(denominator > 1)
                {
                    // Get soft difference
                    
                    
                    
                    UIColor *randomColor = [UIKitHelper randomColor];
                    
                    
                    
                    
                    
                    difference = (distanceInPX - (theDistance * denominator)) / denominator;
                    evenDistance = theDistance + difference;
                    // Generate all points that would fit the gap
                    for(int j = 0; j < (denominator - 1); j++)
                    {
                        // Make new point
                        CGPoint newPoint = [UIKitHelper pointOnLineUsingDistanceFromStart:point1 lp2:point2 distanceFromP1:evenDistance];
                        
                        // Correct the point so it's on the path
                        newPoint = [self correctPointUsingWayfindPath:useArrayOfFloorWaypoints point:newPoint noFurtherThan:0];
                        
                        // Turn into text direction
                        JMapTextDirectionInstruction *nextInsertDir = [[JMapTextDirectionInstruction alloc] init];
                        
                        // Populate fields
                        nextInsertDir.floor = currentFloorTD.mapId.intValue;
                        nextInsertDir.floorName = currentFloorTD.name;
                        nextInsertDir.wp = [[JMapWaypoint alloc] initWithCGPoint:[NSValue valueWithCGPoint:newPoint]];
                        nextInsertDir.direction = usedInstruction1.direction;
                        
                        // Get Angle to next
                        float angleToNext = [UIKitHelper pointPairToBearingDegrees:point1 endingPoint:newPoint];
                        nextInsertDir.angleToNext = angleToNext;
                        // Get angle to previous
                        float angleToNextOfPrevious = [UIKitHelper pointPairToBearingDegrees:newPoint endingPoint:point2];
                        nextInsertDir.angleToNextOfPreviousDirection = angleToNextOfPrevious;
                        
                        // Visualize it
                        //  if(NO)
                        //  {
                        //  dispatch_async(dispatch_get_main_queue(), ^{
                        //  // For now just draw on map
                        //
                        //  // Mark it
                        //  UILabel *fromView = [[UILabel alloc] initWithFrame:CGRectMake(newPoint.x - 10, newPoint.y - 10, 20, 20)];
                        //  fromView.backgroundColor = randomColor;
                        //  fromView.text = [NSString stringWithFormat:@"%d", j];
                        //  [[self getCurrentFloorView] addSubview:fromView];
                        //  });
                        //  }
                        
                        // Landmark
                        // Get Landmark using line of sight
                        // Used to describe point of reference eg.: "With *Landmark* on your Left, proceed Forward"
                        //@property JMapWaypoint *landmarkWP;
                        //@property JMapDestination *landmarkDestination;
                        //@property float angleToLandmark;
                        //@property NSString *directionToLandmark;
                        
                        // Get nearest destination using line of sight
                        CGPoint returnClosestPoint;
                        //NSDate *startLOS = [NSDate date];
                        JMapDestination *tempLandmark = [self lineOfSightFromClosestLandmarkToXY:newPoint pointOfIntercept:&returnClosestPoint direction:nextInsertDir.direction previousAngle:nextInsertDir.angleToNextOfPreviousDirection forCanvas:curCanvas];
                        //NSTimeInterval timeIntervalLOS = fabs([startLOS timeIntervalSinceNow]);
                        //NSLog(@"lineOfSightFromClosestLandmarkToXY took: %f", timeIntervalLOS);
                        if(tempLandmark)
                        {
                            nextInsertDir.landmarkDestination = tempLandmark;
                            // Find WP so we can accurately determine angle to destination's entrance
                            JMapWaypoint *landmarkWP = [self getWayPointByDestinationId:nextInsertDir.landmarkDestination.id];
                            if(landmarkWP)
                            {
                                nextInsertDir.landmarkWP = landmarkWP;
                                
                                // Get angle comparing Direction angleToNext
                                // Direction
                                //@property NSString *direction;
                                // Get Direction
                                // Figure out the angle to next
                                // Get angle
                                float angle = [UIKitHelper pointPairToBearingDegrees:newPoint endingPoint:returnClosestPoint];
                                // Get angle to next
                                nextInsertDir.angleToLandmark = angle;
                                
                                // What is the angle difference?
                                //NSLog(@"next: %d landmark: %d name:%@", (int)nextDir.angleToNext, (int)nextDir.angleToLandmark, nextDir.landmarkDestination.name);
                                float angleToLandmarkDifference = nextInsertDir.angleToNextOfPreviousDirection - nextInsertDir.angleToLandmark;
                                while (angleToLandmarkDifference < -180) angleToLandmarkDifference += 360;
                                while (angleToLandmarkDifference > 180) angleToLandmarkDifference -= 360;
                                //NSLog(@"angleDifference %@: %f", nextDir.landmarkDestination.name, angleToLandmarkDifference);
                                // Compute next direction
                                nextInsertDir.directionToLandmark = [UIKitHelper directionFromAngle:angleToLandmarkDifference customTresholds:nil];
                                //NSLog(@"directionToLandmark: %@", nextDir.directionToLandmark);
                                //NSLog(@"next");
                            }
                        }
                        else
                        {
                            // No destination
                            nextInsertDir.landmarkDestination = nil;
                            nextInsertDir.landmarkWP = nil;
                            nextInsertDir.angleToLandmark = -1;
                            NSLog(@"No destination");
                        }
                        
                        // Set output
                        nextInsertDir.output = [NSString stringWithFormat:@"Continue Past %@", nextInsertDir.landmarkDestination.name];
                        
                        // Insert to array
                        //[textDirectionsFloorArray addObject:nextInsertDir];
                        [*textDirectionsFloorArray insertObject:nextInsertDir atIndex:(i + 1)];
                        
                        //NSLog(@"ins: %d", insertAt);
                        
                        // Inc bounds
                        loopToContinuePast++;
                        // Inc for loop driver
                        i++;
                        
                        //NSLog(@"ins count: %lu", (unsigned long)textDirectionsFloorArray.count);
                        
                        // Plot it on screen for now
                        //  // On main thread
                        //  dispatch_async(dispatch_get_main_queue(), ^{
                        //  UIView *addedTextDir = [[UIView alloc] initWithFrame:CGRectMake(newPoint.x - 10, newPoint.y - 10, 20, 20)];
                        //  [addedTextDir setBackgroundColor:[UIColor whiteColor]];
                        //  [[self getCurrentFloorView] addSubview:addedTextDir];
                        //  });
                        
                        // Recalculate distance using newly generated point
                        point1 = newPoint;
                        //distanceInPX = [UIKitHelper distanceBetween:point1 and:point2];
                    }
                }
            }
        }
    }
}



-(CGPoint)correctPointUsingWayfindPath:(JMapPathPerFloor *)setOfPoints point:(CGPoint)point noFurtherThan:(float)noFurtherThan
{
    CGPoint returnPoint = CGPointZero;
    float closestDistanceFromPath = -1;
    
    // Loop through points and make lines
    for(int i = 0; i < (setOfPoints.points.count - 1); i++)
    {
        // Get next two points
        JMapASNode *first = [setOfPoints.points objectAtIndex:i];
        CGPoint lineP1 = CGPointMake(first.x.floatValue, first.y.floatValue);
        
        JMapASNode *second = [setOfPoints.points objectAtIndex:(i + 1)];
        CGPoint lineP2 = CGPointMake(second.x.floatValue, second.y.floatValue);
        
        // Get the distance
        CGPoint tempPointOfIntercept = CGPointZero;
        float nextDistance = [UIKitHelper distanceToLine:point lineP1:lineP1 lineP2:lineP2 intersectPoint:&tempPointOfIntercept];
        if((closestDistanceFromPath == -1) || (nextDistance < closestDistanceFromPath))
        {
            // New point
            closestDistanceFromPath = nextDistance;
            
            // Get new point
            returnPoint = tempPointOfIntercept;
        }
    }
    
    // noFurtherThan?
    if(0 < noFurtherThan)
    {
        CGFloat xDist = (returnPoint.x - point.x);
        CGFloat yDist = (returnPoint.y - point.y);
        float distanceFromIntended = sqrt((xDist * xDist) + (yDist * yDist));
        if(noFurtherThan < distanceFromIntended)
        {
            // Point too far from intended, return original point
            returnPoint = point;
        }
    }
    
    return returnPoint;
}

*/
