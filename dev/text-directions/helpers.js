var __ = {

  stringWithFormat: function() {
    var output = [];
    var string = arguments[0].split('%');
    for(var i = 1; i < arguments.length; i++) {
      output.push(string[i - 1]);
      output.push(arguments[i]);
    }
    return output.join('');
  },

  landmarkDirectionFromDeltaAngle: function() {},

  directionFromAngle: function(angle, customTresholds) {
    // if (isNaN(angle)) debugger;

    // Direction threshholds
    var forwardFrom = -25;
    var forwardTo = 25;

    // Right
    var rightSlightFrom = 25;
    var rightSlightTo = 45;
    var rightFrom = 45;
    var rightTo = 135;
    var rightBackFrom = 135;
    var rightBackTo = 180;

    // Left
    var leftSlightFrom = -45;
    var leftSlightTo = -25;
    var leftFrom = -135;
    var leftTo = -45;
    var leftBackFrom = -180;
    var leftBackTo = -135;

    // Custom tresholds?
    if(customTresholds) {
      // Apply them
      //...
      void 0;
    }

    // Return dir
    var returnDirection = '';

    // Forward
    if((forwardFrom <= angle) && (angle <= forwardTo)) {
      // Forward

      // Direction
      returnDirection = 'Forward';
    }
    // Slight Right
    else if((rightSlightFrom <= angle) && (angle <= rightSlightTo)) {
      // Right

      // Direction
      returnDirection = 'Slight Right';
    }
    // Right
    else if((rightFrom <= angle) && (angle <= rightTo)) {
      // Right

      // Direction
      returnDirection = 'Right';
    }
    // Slight Left
    else if((leftSlightFrom <= angle) && (angle <= leftSlightTo)) {
      // Left

      // Direction
      returnDirection = 'Slight Left';
    }
    // Left
    else if((leftFrom <= angle) && (angle <= leftTo)) {
      // Left

      // Direction
      returnDirection = 'Left';
    }
    // Back
    else if(((leftBackFrom <= angle) && (angle <= leftBackTo)) ||
      ((rightBackFrom <= angle) && (angle <= rightBackTo))) {
      // Left

      // Direction
      returnDirection = 'Back';
    } else {
      console.log('-directionFromAngle-\n', 'No coverage for angle difference:', angle);
    }

    // Ret
    return returnDirection;
  },

  returnDirectionToPoint: function(currentPoint, toPoint, previousAngle) {
    // Get angle comparing Direction angleToNext
    // Direction
    // Get Direction
    // Figure out the angle to next
    // Get angle
    var angle = __.pointPairToBearingDegrees(currentPoint, toPoint);

    // What is the angle difference?
    var angleToLandmarkDifference = previousAngle - angle;
    while(angleToLandmarkDifference < -180) angleToLandmarkDifference += 360;
    while(angleToLandmarkDifference > 180) angleToLandmarkDifference -= 360;

    // Compute next direction
    var returnString = __.directionFromAngle(angleToLandmarkDifference, null);

    // Ret
    return returnString;
  },

  isPointInsideRotatedRect: function(p, a, b, c, d) {
    if((__.triangleArea(a, b, p) > 0) ||
      (__.triangleArea(b, c, p) > 0) ||
      (__.triangleArea(c, d, p) > 0) ||
      (__.triangleArea(d, a, p) > 0)) {
      return false;
    }
    return true;
  },

  triangleArea: function(a, b, c) {
    return((c[0] * b[1]) - (b[0] * c[1])) - ((c[0] * a[1]) - (a[0] * c[1])) + ((b[0] * a[1]) - (a[0] * b[1]));
  },

  doLineSegmentsIntersect: function(l11, l12, l21, l22) {
    var d = (l12[0] - l11[0]) * (l22[1] - l21[1]) - (l12[1] - l11[1]) * (l22[0] - l21[0]);
    if(d === 0) {
      // Slope is same--lines are parallel
      return false;
    }
    var u = ((l21[0] - l11[0]) * (l22[1] - l21[1]) - (l21[1] - l11[1]) * (l22[0] - l21[0])) / d;
    var v = ((l21[0] - l11[0]) * (l12[1] - l11[1]) - (l21[1] - l11[1]) * (l12[0] - l11[0])) / d;
    if(u < 0.0 || u > 1.0) {
      // Line1 passes by Line2 on the left
      return false;
    }
    if(v < 0.0 || v > 1.0) {
      // Line1 passes by Line2 on the right
      return false;
    }
    // They do intersect
    return true;
  },

  arrayOfRotatedPoints: function(rect) {
    // Angle
    var theta = 0;
    // Get transform matrix, if any
    // This rotates rect
    if(rect.transform && rect.transform.length > 0) {
      if(rect.transform.indexOf('matrix(') > -1) {
        //'matrix(0.7071 0.7071 -0.7071 0.7071 1067.124 -522.2766)'
        var newMatrix = rect.transform.split('matrix(').join('').split(')').join('');
        var components = newMatrix.split(' ');
        if(components.length > 5) {
          var a = parseFloat(components[0]),
            b = parseFloat(components[1]);

          theta = Math.atan2(b, a);
        }
      }
    }

    // Get center of rect
    var c = __.returnCenterOfRect(rect);

    // Make array of points, make sure they are connected to each other (don't make diagonal points in sequence)
    var points = [];

    // 1
    var p1 = [rect.x, rect.y];
    points[0] = __.rotatePoint(p1, c, theta);
    // 2
    var p2 = [rect.x + rect.width, rect.y];
    points[1] = __.rotatePoint(p2, c, theta);
    // 3
    var p3 = [rect.x + rect.width, rect.y + rect.height];
    points[2] = __.rotatePoint(p3, c, theta);
    // 4
    var p4 = [rect.x, rect.y + rect.height];
    points[3] = __.rotatePoint(p4, c, theta);

    return points;
  },

  returnCenterOfRect: function(rect) {
    var centerX = rect.x + (rect.width / 2.0);
    var centerY = rect.y + (rect.height / 2.0);
    return [centerX, centerY];
  },

  rotatePoint: function(point, center, angle) {
    // cx, cy - center of square coordinates
    // x, y - coordinates of a corner point of the square
    // theta is the angle of rotation

    // translate point to origin
    var tempX = point[0] - center[0];
    var tempY = point[1] - center[1];

    // now apply rotation
    var rotatedX = tempX * Math.cos(angle) - tempY * Math.sin(angle);
    var rotatedY = tempX * Math.sin(angle) + tempY * Math.cos(angle);

    // translate back
    var x = rotatedX + center[0];
    var y = rotatedY + center[1];

    return [x, y];
  },

  distanceToLine: function(xy, p1, p2, instersect) {
    return Math.sqrt(__.distToSegmentSquared(xy, p1, p2, instersect));
  },

  distToSegmentSquared: function(xy, p1, p2, pointOfIntersect) {
    var l2 = __.dist2(p1, p2);

    if(l2 === 0) {
      pointOfIntersect.value = p2;
      return __.dist2(xy, p2);
    }

    var t = ((xy[0] - p1[0]) * (p2[0] - p1[0]) + (xy[1] - p1[1]) * (p2[1] - p1[1])) / l2;

    if(t < 0) {
      pointOfIntersect.value = p1;
      return __.dist2(xy, p1);
    }
    if(t > 1) {
      pointOfIntersect.value = p2;
      return __.dist2(xy, p2);
    }

    // Point of intersect
    pointOfIntersect.value = [
      p1[0] + t * (p2[0] - p1[0]),
      p1[1] + t * (p2[1] - p1[1])
    ];

    return __.dist2(xy, pointOfIntersect.value);
  },

  dist2: function(p1, p2) {
    return(__.sqr(p1[0] - p2[0]) + __.sqr(p1[1] - p2[1]));
  },

  sqr: function(x) {
    return x * x;
  },

  pointPairToBearingDegrees: function(startingPoint, endingPoint) {
    // NOTE: 0 degree is on y axis on top side
    //        0
    //        |
    //  q=2   y     q=1
    //        |
    // 180--x-+--- 0 degrees
    //        |
    //  q=3   270   q=4
    //        |
    //        |
    var vector = [endingPoint[0] - startingPoint[0], endingPoint[1] - startingPoint[1]];
    var angleCalc;
    if(vector[1] < 0) {
      // upper Half
      angleCalc = Math.atan2(-vector[1], vector[0]);
    } else {
      angleCalc = Math.atan2(vector[1], -vector[0]) + Math.PI;
    }

    return angleCalc * (180 / Math.PI);
  },

  pointOnLineUsingDistanceFromStart: function(lp1, lp2, distanceFromP1) {
    var radians = Math.atan2(lp2[1] - lp1[1], lp2[0] - lp1[0]);

    var derivedPointX = lp1[0] + distanceFromP1 * Math.cos(radians);
    var derivedPointY = lp1[1] + distanceFromP1 * Math.sin(radians);

    return [derivedPointX, derivedPointY];
  },

  distanceBetween: function(fromXY, andXY) {
    var xSegment = andXY[0] - fromXY[0];
    var ySegment = andXY[1] - fromXY[1];
    return Math.sqrt((xSegment * xSegment) + (ySegment * ySegment));
  },

  stringContainsString: function(str, cont) {
    return str.indexOf(cont) > -1;
  },

  convertMetersToPixels: function(meters, xyScale) {
    // xyScale is milimeters per pixel
    if(xyScale === 0) {
      // 11th commandment--"Thou shall not divide by zero!"
      return -1.0;
    }
    return(meters * 1000) / xyScale;
  },

  convertPixelsToMeters: function(pixels, xyScale) {
    // xyScale is milimeters per pixel
    if(xyScale === 0) {
      // 11th commandment--"Thou shall not divide by zero!"
      return -1.0;
    }
    // xyScale is milimeters per pixel
    return(pixels * xyScale) / 1000;
  },

  correctPointUsingWayfindPath: function(setOfPoints, point, noFurtherThan) {
    var returnPoint = [0, 0];
    var closestDistanceFromPath = -1;

    // Loop through points and make lines
    for(var i = 0; i < setOfPoints.points.length - 1; i++) {
      // Get next two points
      var first = setOfPoints.points[i];
      var lineP1 = [first.x, first.y];

      var second = setOfPoints.points[i + 1];
      var lineP2 = [second.x, second.y];

      // Get the distance
      var tempPointOfIntercept = {
        value: [0, 0]
      };

      var nextDistance = __.distanceToLine(point, lineP1, lineP2, tempPointOfIntercept);
      if((closestDistanceFromPath == -1) || (nextDistance < closestDistanceFromPath)) {
        // New point
        closestDistanceFromPath = nextDistance;

        // Get new point
        returnPoint = tempPointOfIntercept.value;
      }
    }

    // noFurtherThan?
    if(0 < noFurtherThan) {
      var xDist = (returnPoint.x - point.x);
      var yDist = (returnPoint.y - point.y);
      var distanceFromIntended = Math.sqrt(__.sqr(xDist) + __.sqr(yDist));
      if(noFurtherThan < distanceFromIntended) {
        // Point too far from intended, return original point
        returnPoint = point;
      }
    }

    return returnPoint;
  }

};

module.exports = __;
