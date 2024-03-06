import _ from "lodash";

/**
 * Function to change properties of an object and trigger a callback with the modified object.
 * @param {any} object - The original object.
 * @param {object} properties - The properties to change in the object.
 * @param {function} objectChange - The callback function to trigger with the modified object.
 */
const objectPropertyChange = (
  object: any,
  properties: any,
  objectChange: (object: any) => void
) => {
  // Create a deep copy of the original object
  let newObject = JSON.parse(JSON.stringify(object));
  // Iterate through the properties to be changed
  Object.keys(properties).forEach((key) => {
    // Utilize lodash's set method to set the property in the new object
    _.set(newObject, key, properties[key]);
  });
  // Trigger the callback with the modified object
  objectChange(newObject);
};

export default objectPropertyChange;
