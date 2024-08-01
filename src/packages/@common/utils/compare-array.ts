class CompareArray {
  /**
   * Wrapper function lets fucntion to be executed only one in a time period
   * @param func :Function - the to be debounced
   * @param delay :number - the time period limit for debouncing
   */

  private deepCompareObjects = (obj1, obj2) => {
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);

    if (keys1.length !== keys2.length) return false;

    for (const key of keys1) {
      const val1 = obj1[key];
      const val2 = obj2[key];

      const areObjects = this.isObject(val1) && this.isObject(val2);
      if (
        (areObjects && !this.deepCompareObjects(val1, val2)) ||
        (!areObjects && val1 !== val2)
      ) {
        return false;
      }
    }
    return true;
  };

  private isObject = (object) => {
    return object != null && typeof object === "object";
  };
  public init = (arr1, arr2) => {
    if (arr1.length !== arr2.length) return false;

    for (let i = 0; i < arr1.length; i++) {
      if (!this.deepCompareObjects(arr1[i], arr2[i])) {
        return false;
      }
    }
    return true;
  };
}

export { CompareArray };
