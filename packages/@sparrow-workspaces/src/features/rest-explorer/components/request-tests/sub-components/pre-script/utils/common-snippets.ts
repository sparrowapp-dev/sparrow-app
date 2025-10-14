export const predefinedTestSnippets = [
  {
    title: "Get Environment Variables",
    function: `sp.test("Status code is 200", function () {
  sp.expect(sp.response.statusCode).to.equal(200);
});`,
  },
  {
    title: "Set Environment Variables",
    function: `sp.test("Response time is less than 500ms", function () {
  sp.expect(sp.response.time).to.be.lessThan(500);
});`,
  },
  {
    title: "Get Local Variables",
    function: `sp.test("Response body is not empty", function () {
  sp.expect(sp.response.body.text()).to.be.notEmpty();
});`,
  },
  {
    title: "Set Local Variables",
    function: `sp.test("Content-Type is application/json", function () {
  sp.expect(sp.response.headers["Content-Type"]).to.contain("application/json");
});`,
  },
  {
    title: "Set Timestamp Variables",
    function: `sp.test("Response has id field", function () {
  let jsonData = sp.response.body.json();
  sp.expect(jsonData).to.have.all.keys("id", "userId", "title", "completed");
});`,
  },
];
