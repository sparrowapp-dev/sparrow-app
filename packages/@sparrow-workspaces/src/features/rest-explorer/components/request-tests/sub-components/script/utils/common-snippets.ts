export const predefinedTestSnippets = [
  {
    title: "Status Code is 200",
    function: `sp.test("Status code is 200", function () {
  sp.response.to.have.status(200);
});`,
  },
  {
    title: "Response time is less than 500ms",
    function: `sp.test("Response time is less than 500ms", function () {
  sp.expect(sp.response.responseTime).to.be.below(500);
});`,
  },
  {
    title: "Response body is not empty",
    function: `sp.test("Response body is not empty", function () {
  sp.expect(sp.response.body).to.not.be.empty;
});`,
  },
  {
    title: "Content-Type is application/json",
    function: `sp.test("Content-Type is application/json", function () {
  sp.response.to.have.header("Content-Type");
  sp.response.to.have.header("Content-Type", /application\\/json/);
});`,
  },
  {
    title: "Response has id field",
    function: `sp.test("Response has id field", function () {
  let jsonData = sp.response.json();
  sp.expect(jsonData).to.have.property("id");
});`,
  },
  {
    title: "Response has success = true",
    function: `sp.test("Response has success = true", function () {
  let jsonData = sp.response.json();
  sp.expect(jsonData.success).to.eql(true);
});`,
  },
  {
    title: "User object contains name and email",
    function: `sp.test("User object contains name and email", function () {
  let jsonData = sp.response.json();
  sp.expect(jsonData.user).to.have.property("name");
  sp.expect(jsonData.user).to.have.property("email");
});`,
  },
  {
    title: "Array response contains at least one item",
    function: `sp.test("Array response contains at least one item", function () {
  let jsonData = sp.response.json();
  sp.expect(jsonData.length).to.be.above(0);
});`,
  },
  {
    title: "Unauthorized request returns 401",
    function: `sp.test("Unauthorized request returns 401", function () {
  sp.response.to.have.status(401);
  let jsonData = sp.response.json();
  sp.expect(jsonData.message).to.eql("Unauthorized");
});`,
  },
  {
    title: "Response contains expected schema keys",
    function: `sp.test("Response contains expected schema keys", function () {
  let jsonData = sp.response.json();
  sp.expect(jsonData).to.include.keys(["id", "name", "email"]);
});`,
  },
];
