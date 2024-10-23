export class OSDetector {
    public getOS = (): string => {
      const userAgent = window.navigator.userAgent;
      let os = "";
  
      if (userAgent.indexOf("Mac") !== -1) {
        os = "macos";
      } else if (userAgent.indexOf("Windows") !== -1) {
        os = "windows";
      } else {
        os = "";
      }
  
      return os;
    };
  }