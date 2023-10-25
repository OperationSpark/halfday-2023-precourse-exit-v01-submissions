/**
 * Step 1 | Recursion
 *
 * - Find all keys of a provided name in an Object (and nested Objects)
 * - Rename the keys to the provided `newKey` while preserving the value
 *
 * ### Must use recursion in your solution
 */

/**
 * I: A object and two strings
 * O: The same object but with one of it keys name change and values keep the same
 * C: Must use recursion
 * E: None
 */
let replaceKeysInObj = (obj, targetKey, newKey, newObj = {}) => {
  // your code here
  //create a empty array called copy
  let copy = [];

  //check if obj is not an array
  if (!Array.isArray(obj)) {
    // set copy to be a copy of obj but as an array
    copy = Object.entries(obj);
  } else {
    copy = obj;
  }

  //check if loop length is zero
  if (copy.length === 0) {
    //return new obj
    return newObj;
  }

  //check key is equal to the targetKey


  if (copy[0][0] === targetKey) {
    //give newObj a key name from newKey and give it the value from the current value from the copy
    newObj[newKey] = copy[0][1];
    //run if the value is an object
  } else if (typeof copy[0][1] === 'object') {
    //give newObj a key name from the current key name and the value equal to the result of the function replaceKeysInObj with the given value: copy[0][0], targetKey, newKey, {}
    newObj[copy[0][0]] = replaceKeysInObj(copy[0][1], targetKey, newKey, {});
  } else {
    //give newObj a key name from the current value and the value to be equal to the current value
    newObj[copy[0][0]] = copy[0][1];
  }

  //remover the first value from copy
  copy.shift()

  //return the function with the copy, targetKey, newKey, and NewObj
  return replaceKeysInObj(copy, targetKey, newKey, newObj)
};

/**
 * Step 2
 *
 * Executing Higher Order Functions
 */

const antennaLocation = { lat: 29.9512317, lon: -90.0814391 };

const customers = [
  { lat: 52.793043, lon: 18.231232, tel: '243-334-3008', name: 'Kayes' },
  { lat: 14.5272379, lon: -87.2157947, tel: '154-700-5634', name: 'Timony' },
  { lat: 42.3369976, lon: 23.5527975, tel: '788-299-1863', name: 'Goodban' },
  { lat: 29.673196, lon: 110.73404, tel: '399-141-3895', name: 'Ralling' },
  { lat: 44.2136985, lon: 3.9996505, tel: '901-711-1889', name: 'Dabs' },
  { lat: 8.0693651, lon: 123.535497, tel: '184-179-9672', name: 'Brookwood' },
  { lat: 13.3304675, lon: -13.8694543, tel: '690-224-9625', name: 'Ommanney' },
  { lat: 55.0375016, lon: 43.2464427, tel: '695-307-7107', name: 'Skerm' },
  { lat: 32.6901244, lon: -96.937016, tel: '972-164-7806', name: 'Falls' },
  { lat: -30.2932904, lon: 28.7693554, tel: '965-920-0577', name: 'Bernette' }
];

// console.log(calcDist(29.9512317, -90.0814391))
/**
 * I: An array of object
 * O: An array of objs that are in a 55 km of the antennaLocation
 * C: Use map and Filter
 * E: None
 */

/**
 * Solve by chaining native methods of map and filter only
 */
const customersFilteredAndMapped = customers => {
  // Your code here
  //create a variable called result and set it to equal customers that been run through filter and map
  let result = customers.filter((obj) => {
    //create a value with the obj lat and lon keys
    const location = { lat: obj.lat, lon: obj.lon };
    //check if it with in 55 km of the antennaLocation
    if ((calcDist(antennaLocation, location)) <= 55) {
      //return true
      return true;
      //run if false
    } else {
      //return false
      return false
    }
  }).map((obj) => {
    //create a value with the obj lat and lon keys
    const location = { lat: obj.lat, lon: obj.lon };
    //create a variable called dist that the the value of calcDist
    let dist = calcDist(antennaLocation, location);
    //change dist value to be a string and add 'km'
    dist = dist.toString().slice(0, 2) + 'km';
    //return the obj with dist, name, and tel
    return { name: obj.name, tel: obj.tel, dist: dist }
  })

  //return result
  return result
};

/**
 * I: An array of object
 * O: An array of objs that are in a 55  km of the antennaLocation
 * C: Use map and Filter
 * E: None
 */

/**
 * Solve by using native method of reduce only
 */
const customersReduced = customers => {
  // Your code here
  //create a variable called result and set it to equal customers that been run through reduce
  const result = customers.reduce((acc, cur) => {
    //create a value with the cur lat and lon keys
    const location = { lat: cur.lat, lon: cur.lon };
    //create a variable that hold the distance
    let length = calcDist(antennaLocation, location)
    //check if it with in 55 km of the antennaLocation
    if (length <= 55) {

      //change length value to be a string and add 'km'
      length = length.toString().slice(0, 2) + 'km';

      //push an object in with a name, tel, and dis key in acc
      acc.push({ name: cur.name, tel: cur.tel, dist: length })
    }

    //return acc
    return acc
  }, []);

  //return result
  return result
};

/**
 * calcDist takes two location points and
 * returns the distance in kilometers between them.
 * Each point should an Object: { lat: <number>, log: <number> }
 */
function calcDist(point1, point2) {
  // DO NOT CHANGE THIS FUNCTION
  const toRadians = num => (num * Math.PI) / 180;

  const earthRadius = 6371e3; // meters
  const φ1 = toRadians(point1.lat);
  const φ2 = toRadians(point2.lat);
  const Δφ = toRadians(point2.lat - point1.lat);
  const Δλ = toRadians(point2.lon - point1.lon);

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const dist = earthRadius * c;
  return dist / 1000;
  // ^^^ DO NOT CHANGE THIS FUNCTION ^^^
}
