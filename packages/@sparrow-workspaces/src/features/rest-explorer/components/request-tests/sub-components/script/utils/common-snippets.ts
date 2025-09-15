export const predefinedTestSnippets = [
  {
    title: "Status Code is 200",
    function: `sp.test("Status code is 200", function () {
  sp.expect(sp.response.statusCode).to.equal(200);
});`,
  },
  {
    title: "Response time is less than 500ms",
    function: `sp.test("Response time is less than 500ms", function () {
  sp.expect(sp.response.time).to.be.lessThan(500);
});`,
  },
  {
    title: "Response body is not empty",
    function: `sp.test("Response body is not empty", function () {
  sp.expect(sp.response.body.text()).to.be.notEmpty();
});`,
  },
  {
    title: "Content-Type is application/json",
    function: `sp.test("Content-Type is application/json", function () {
  sp.expect(sp.response.headers["Content-Type"]).to.contain("application/json");
});`,
  },
  {
    title: "Response has id field",
    function: `sp.test("Response has id field", function () {
  let jsonData = sp.response.body.json();
  sp.expect(jsonData).to.have.all.keys("id", "userId", "title", "completed");
});`,
  },
  {
    title: "Response has success = true",
    function: `sp.test("Response has success = true", function () {
  let jsonData = sp.response.body.json();
  sp.expect(jsonData.success).to.equal(true);
});`,
  },
  {
    title: "User object contains name and email",
    function: `sp.test("User object contains name and email", function () {
  let jsonData = sp.response.body.json();
  sp.expect(jsonData.user).to.have.all.keys("name", "email");
});`,
  },
  {
    title: "Array response contains at least one item",
    function: `sp.test("Array response contains at least one item", function () {
  let jsonData = sp.response.body.json();
  sp.expect(jsonData.length).to.be.greaterThan(0);
});`,
  },
  {
    title: "Unauthorized request returns 401",
    function: `sp.test("Unauthorized request returns 401", function () {
  sp.expect(sp.response.statusCode).to.equal(401);
  let jsonData = sp.response.body.json();
  sp.expect(jsonData.message).to.equal("Unauthorized");
});`,
  },
  {
    title: "Response contains expected schema keys",
    function: `sp.test("Response contains expected schema keys", function () {
  let jsonData = sp.response.body.json();
  sp.expect(jsonData).to.have.all.keys("id", "name", "email");
});`,
  },
  {
    title: "Response contains token field",
    function: `sp.test("Response contains token field", function () {
  let jsonData = sp.response.body.json();
  sp.expect(jsonData).to.have.property("token");
});`,
  },
  {
    title: "Token is a non-empty string",
    function: `sp.test("Token is a non-empty string", function () {
  let jsonData = sp.response.body.json();
  sp.expect(jsonData.token).to.be.a("string").that.is.not.empty;
});`,
  },
  {
    title: "Created resource returns 201",
    function: `sp.test("Created resource returns 201", function () {
  sp.expect(sp.response.statusCode).to.equal(201);
});`,
  },
  {
    title: "Response array contains specific field in objects",
    function: `sp.test("Response array contains specific field in objects", function () {
  let jsonData = sp.response.body.json();
  jsonData.forEach(item => {
    sp.expect(item).to.have.property("id");
  });
});`,
  },
  {
    title: "Response has error field when status 400",
    function: `sp.test("Response has error field when status 400", function () {
  if (sp.response.statusCode === 400) {
    let jsonData = sp.response.body.json();
    sp.expect(jsonData).to.have.property("error");
  }
});`,
  },
  {
    title: "Response contains pagination fields",
    function: `sp.test("Response contains pagination fields", function () {
  let jsonData = sp.response.body.json();
  sp.expect(jsonData).to.include.keys("page", "limit", "total");
});`,
  },
  {
    title: "Date field is valid ISO string",
    function: `sp.test("Date field is valid ISO string", function () {
  let jsonData = sp.response.body.json();
  let date = new Date(jsonData.createdAt);
  sp.expect(isNaN(date.getTime())).to.equal(false);
});`,
  },
  {
    title: "Response includes expected message text",
    function: `sp.test("Response includes expected message text", function () {
  let jsonData = sp.response.body.json();
  sp.expect(jsonData.message).to.contain("success");
});`,
  },
  {
    title: "Response has Content-Length header",
    function: `sp.test("Response has Content-Length header", function () {
  sp.expect(sp.response.headers).to.have.property("Content-Length");
});`,
  },
  {
    title: "Response cookie contains session id",
    function: `sp.test("Response cookie contains session id", function () {
  sp.expect(sp.response.cookies).to.have.property("sessionId");
});`,
  },
];
