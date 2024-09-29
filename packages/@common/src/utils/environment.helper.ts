export class EnvironmentHeper {
  constructor() {}
  public filterEnvironments = (
    mockData,
    urlText,
    trackParanthesis,
    trackCursor,
  ) => {
    const filterData = mockData.filter((element) => {
      if (
        element.key
          .toLowerCase()
          .includes(
            urlText
              ?.substring(trackParanthesis[1] + 1, trackCursor)
              .toLowerCase(),
          )
      ) {
        return true;
      }
    });
    return filterData;
  };

  public balanceParanthesis = (text: string) => {
    const stack = [];
    let response: unknown[] = [];
    for (let i = 0; i < text.length; i++) {
      if (text[i] === "{") {
        stack.push({
          index: i,
          character: "{",
        });
      } else if (text[i] === "}") {
        stack.pop();
      }
    }
    if (
      stack.length >= 1
      //  && stack[1].character === "{"
    ) {
      response = [stack[0].index, stack[stack.length - 1].index];
    }
    return response;
  };
}
