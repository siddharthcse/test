'use strict'
/** Class representing utility functions */
class Utility {

  /**
   * Create a Utility method set
   */
  constructor() {

  }

  /**
   * This method can only be used in the browser, used to decode any HTML entities found in strings
   * @throws {Error} - Utility :: Cannot Decode HTML entites outside of browser
   * @param str - string to decode
   * @returns {String} - String with HTML entity decoded
   */
  decodeEntities(str) {
    try {
      // this prevents any overhead from creating the object each time
      if(!this.elementDecoder) this.elementDecoder = document.createElement('div');

      if(str && typeof str === 'string') {
        // strip script/html tags
        let element = this.elementDecoder;
        str = str.replace(/<script[^>]*>([\S\s]*?)<\/script>/gmi, '');
        str = str.replace(/<\/?\w(?:[^"'>]|"[^"]*"|'[^']*')*>/gmi, '');
        element.innerHTML = str;
        str = element.textContent;
        element.textContent = '';
        return str;
      }
      return str;
    } catch(e) {
      throw new Error('Utility :: Cannot Decode HTML entites outside of browser')
    }
  }

  /**
   * @param matrix - Css transform matrix value: matrix(a,b,c,d,e,f)
   * @returns number
   */
  getScaleFromMatrix(mx) {
    if(!mx || mx.constructor !== String) return 1;
    let values, a;
    values = mx.split('(')[1].split(')')[0].split(' ');
    a = parseFloat(values[0]);
    return a;
  }

  /**
   * @param matrix - Css transform matrix value: matrix(a,b,c,d,e,f)
   * @returns number
   */
  getRotationFromMatrix(mx) {
    if(!mx || mx.constructor !== String) return 0;
    let values, a, b;
    values = mx.split('(')[1].split(')')[0].split(' ');
    a = parseFloat(values[0]);
    b = parseFloat(values[1]);
    return Math.round(Math.atan2(b, a) * (180 / Math.PI));
  }

  /**
   * Return distance between two points
   * @param {Object} point1 - Frist point
   * @param {Number} point1.x - X coordinate of first point
   * @param {Number} point1.y - Y coordinate of first point
   * @param {Object} point2 - Second point
   * @param {Object} point2.x - X coordinate of second point
   * @param {Object} point2.y - Y coordinate of second point
   * @return {Number} Distance between two points
   */
  getDistanceBetweenTwoPoints(point1, point2) {
    return Math.sqrt(Math.pow((point2.x - point1.x), 2) + Math.pow((point2.y - point1.y), 2));
  }

  /**
   * return array of associations associated with an entityId
   * @param {Array} array - The array of objects you wish to search. This method will scan all properties with the type of string.
   * @param {String} string - The query to return results by.
   * @param {Array} highRankProperties - This will add more points to an object containing a match inside this property.
   * @param {Number} results - The amount of results to be returned.
   * @example
   *
   * //String to search by
   * let query = 'my query';
   *
   * //Search all destinations
   * let toQuery = jmap.DestinationCollection.getAll()
   *
   * //Amount of search results
   * var amount = 5;
   *
   * //If object contains a match inside this property,
   * //it will score higher as a result.
   * var highRankProperties = ['name', 'keywords'];
   * var results = JMap.util.getObjectsInArrayByString(toQuery, query, highRankProperties, amount);
   *
   * console.log(results) //-> Array of destinations matching 'my query'
   *
   * @return {Array} Filtered Array of passed in objects
   */
  getObjectsInArrayByString(array, query, highRankProperties, maxResults) {
    query = query.trim();
    if(query === '') return [];
    let results = [];
    let doesMatch = [];
    if(!highRankProperties) highRankProperties = [];
    if(!maxResults) maxResults = 5;

    function getPropertyScore(_item, _prop, _query) {
      let score = 0;

      let queryPattern = new RegExp(_query.toLowerCase());

      //Position of query inside property value
      let queryIndex = _item[_prop].toLowerCase().search(queryPattern);

      //If property contains query, add one point.
      if(queryIndex < 0) return 0;
      else score++;

      //If query is at the start of the string, add 5 points
      if(queryIndex === 0) score++;

      //Gets the percentage of the index compared to the property.length and subtracts that by 1 and adds that value to score
      let indexPercentage = 1 - (queryIndex / _item[_prop].length);
      score += indexPercentage;

      //Gets the percentage of the query.length compared to the property.length and adds that to the score.
      let lengthPercentage = _query.length / _item[_prop].length;
      score += lengthPercentage;

      //If property is inside a high ranking property, add more points.
      highRankProperties.forEach((prop) => {
        if(_prop.toLowerCase() === prop.toLowerCase()) score++;
        if(queryIndex === 0) score++; //Repeated.
      });

      //If property is a destination and has a sponsoredRating add percentage to score;
      if(_prop === 'sponsoredRating') score += (_item[_prop] / 100);

      return score;
    }

    //Loop through all objects in array
    array.forEach((item) => {
      let score = 0;
      for(let prop in item) {
        if(!item.hasOwnProperty(prop)) continue;
        if(typeof item[prop] != 'string') continue;

        //Get Score for entire query
        score += getPropertyScore(item, prop, query);

        //If query is multiple words, get score for each word.
        let splitQuery = query.split(' ');
        if(splitQuery.length > 1) {
          for(let i = 0; i < splitQuery.length; i++) score += getPropertyScore(item, prop, splitQuery[i]);
        }
      }
      if(score > 0) {
        doesMatch.push({
          score: score,
          item: item
        });
      }
    });

    //Sort matching objects by score.
    doesMatch.sort((a, b) => {
      if(a.score > b.score) {
        return -1;
      }
      if(a.score < b.score) {
        return 1;
      }
      return 0;
    });

    //Add items until maxResults achieved.
    for(let m = 0; m < doesMatch.length; m++) {
      if(m === maxResults) break;
      results.push(doesMatch[m].item);
    }

    return results;
  }

}

module.exports = Utility
