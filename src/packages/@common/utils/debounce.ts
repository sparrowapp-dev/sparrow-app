class Debounce {
  /**
   * Wrapper function lets fucntion to be executed only one in a time period
   * @param func :Function - the to be debounced
   * @param delay :number - the time period limit for debouncing
   */
  public debounce(func: () => any, delay: number) {
    let timerId: any;

    return function (...args) {
      /* eslint-disable @typescript-eslint/no-this-alias */
      const context = this;

      clearTimeout(timerId);
      timerId = setTimeout(() => {
        func.apply(context, args);
      }, delay);
    };
  }
}

export { Debounce };
