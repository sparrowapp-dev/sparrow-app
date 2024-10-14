export class SetDataStructure {
  /**
   * performs set operation on array of objects
   * @param arr  - input array on which set operation will be performed
   * @param key - the object key to remove duplicates
   * @returns
   */
  public pushArrayOfObjects = (arr: any[], key: string) => {
    const seen = new Set();
    return arr.filter((obj) => {
      if (!obj.hasOwnProperty(key)) {
        return false;
      }
      // const keyValue = obj[key]; // Case-sensitive
      const keyValue = String(obj[key]).toLowerCase(); // Case-insensitive
      return !seen.has(keyValue) && seen.add(keyValue);
    });
  };
}
