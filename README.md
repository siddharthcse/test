# jmap2.js

Fundamental re-design of the JMap Web SDK. Using modern Javascript concepts and patterns, built without a core rendering engine for client compatibility.

## Initialization

```html
<script src="/path/to/JMap.js"></script>
```

```javascript
const building = new JMap({
  server: 'https://maps.westfield.io',
  locationId: 263,
  onReady: function(err){
    if(err) throw err
    
    //JMap kung-fu  
    //..
    //..
  
  }
})
```


> Note: The following guide will assume the the constructed JMap object is called `building` & is globally accessible

## Getting closest destination

A helper method is is provided inside the constructed JMap object to help you find the closest destination of a filtered condition.

```javascript
//Get Starting location
let myKiosk = building.DeviceCollection.getById(1234)

//Access level
let usingElevators = false

//Filter to define an anchor
let anchorFilter = destination => destination.sponsoredRating >= 50

//Get closest anchor to kiosk
let closestAnchor = building.getClosestDestinationToWaypoint(myKiosk.waypoints[0], anchorFilter, usingElevators)

//Log anchor name and waypoint id
console.log('Closest anchor to me is ' + closestAnchor.destination.name) // Closest anchor to me is Bloomingdale's
```

Alternate filters you can use:

```javascript
//Name is 'Starbucks'
let starbucksFilter = destination => destination.name.toLowerCase() === 'starbucks'

//Is a Fashion related destination
let fashionFilter = destination => destination.category.indexOf('Fashion') > -1

```

## Wayfinding

Wayfinding is a lot more "low level" in JMap 2.

```javascript
//Get Starting location
let myKiosk = building.DeviceCollection.getById(1234)

//Access level
let usingElevators = false

//Restroom filter
let isRestroom = amenity => amenity.description.toLowerCase() === 'restroom'

//Get closest restroom
let closestRestroom = building.getClosestAmenityToWaypoint(myKiosk.waypoints[0], isRestroom, usingElevators)

//Get path
let path = building.Wayfinder.search(myKiosk.waypoints[0], closestRestroom.waypoint)

console.log(path) // [WayfinderData, WayfinderData]
```


## Text Directions

Generating a set of Text Direction Instructions is easy. Just pass in the return value from Wayfinder.search() to parse.

```javascript
//Get start/end
let start = building.MapCollection.getWaypointByWaypointId(54321)
let endDestination = building.DestinationCollection.getById(98765)

//Access level
let usingElevators = false

//Destinations can have multiple waypoints, find the closest one.
let end = building.getClosestWaypointInArrayToWaypoint(endDestination.waypoints, start, usingElevators)

//Find path
let path = building.Wayfinder.search(start, end, usingElevators)

let instructions = building.TextDirections.compile(path)

//Initially separated by map
let flatInstructions = instructions.reduce((arr, inst) => { return arr.concat(inst) }, [])

flatInstructions.forEach((inst) => {
  console.log(inst.output) // With X on your Y turn Z
})
```