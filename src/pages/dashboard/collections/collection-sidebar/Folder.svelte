<script lang="ts">
     import angleRight from "$lib/assets/angleRight.svg";
    import FileExplorer from "./FileExplorer.svelte";
    let visibility = false;
     export let title:string;
     export let collectionId:string;
     if(collectionId != "rebrfbgr") visibility = true;
     let explorer = {
name: "Collection 500",
items: [
  {
    name: "/user",
    description: "This can only be done by the logged in user.",
    type: 0,
    items: [
  {
    name: "/user",
    description: "This can only be done by the logged in user.",
    type: 1,
    request: {
      name: "/user",
      method: "post",
      operationId: "createUser",
      url: "/user",
      body: [
        {
          type: "application/json",
          schema: {
            schema: {
              type: "object",
              properties: {
                id: {
                  type: "integer",
                  format: "int64",
                  example: 10,
                },
                username: {
                  type: "string",
                  example: "theUser",
                },
                firstName: {
                  type: "string",
                  example: "John",
                },
                lastName: {
                  type: "string",
                  example: "James",
                },
                email: {
                  type: "string",
                  example: "john@email.com",
                },
                password: {
                  type: "string",
                  example: "12345",
                },
                phone: {
                  type: "string",
                  example: "12345",
                },
                userStatus: {
                  type: "integer",
                  description: "User Status",
                  format: "int32",
                  example: 1,
                },
              },
              xml: {
                name: "user",
              },
            },
          },
        },
        {
          type: "application/xml",
          schema: {
            schema: {
              type: "object",
              properties: {
                id: {
                  type: "integer",
                  format: "int64",
                  example: 10,
                },
                username: {
                  type: "string",
                  example: "theUser",
                },
                firstName: {
                  type: "string",
                  example: "John",
                },
                lastName: {
                  type: "string",
                  example: "James",
                },
                email: {
                  type: "string",
                  example: "john@email.com",
                },
                password: {
                  type: "string",
                  example: "12345",
                },
                phone: {
                  type: "string",
                  example: "12345",
                },
                userStatus: {
                  type: "integer",
                  description: "User Status",
                  format: "int32",
                  example: 1,
                },
              },
              xml: {
                name: "user",
              },
            },
          },
        },
        {
          type: "application/x-www-form-urlencoded",
          schema: {
            schema: {
              type: "object",
              properties: {
                id: {
                  type: "integer",
                  format: "int64",
                  example: 10,
                },
                username: {
                  type: "string",
                  example: "theUser",
                },
                firstName: {
                  type: "string",
                  example: "John",
                },
                lastName: {
                  type: "string",
                  example: "James",
                },
                email: {
                  type: "string",
                  example: "john@email.com",
                },
                password: {
                  type: "string",
                  example: "12345",
                },
                phone: {
                  type: "string",
                  example: "12345",
                },
                userStatus: {
                  type: "integer",
                  description: "User Status",
                  format: "int32",
                  example: 1,
                },
              },
              xml: {
                name: "user",
              },
            },
          },
        },
      ],
    },
  },
  {
    name: "/user/createWithList",
    description: "Creates list of users with given input array",
    type: 1,
    request: {
      name: "/user/createWithList",
      method: "post",
      operationId: "createUsersWithListInput",
      url: "/user/createWithList",
      body: [
        {
          type: "application/json",
          schema: {
            schema: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: {
                    type: "integer",
                    format: "int64",
                    example: 10,
                  },
                  username: {
                    type: "string",
                    example: "theUser",
                  },
                  firstName: {
                    type: "string",
                    example: "John",
                  },
                  lastName: {
                    type: "string",
                    example: "James",
                  },
                  email: {
                    type: "string",
                    example: "john@email.com",
                  },
                  password: {
                    type: "string",
                    example: "12345",
                  },
                  phone: {
                    type: "string",
                    example: "12345",
                  },
                  userStatus: {
                    type: "integer",
                    description: "User Status",
                    format: "int32",
                    example: 1,
                  },
                },
                xml: {
                  name: "user",
                },
              },
            },
          },
        },
      ],
    },
  },
  {
    name: "/user/login",
    description: "",
    type: 1,
    request: {
      name: "/user/login",
      method: "get",
      operationId: "loginUser",
      url: "/user/login",
      queryParams: [
        {
          name: "username",
          in: "query",
          description: "The user name for login",
          required: false,
          schema: {
            type: "string",
          },
        },
        {
          name: "password",
          in: "query",
          description: "The password for login in clear text",
          required: false,
          schema: {
            type: "string",
          },
        },
      ],
      pathParams: [
      ],
      headers: [
      ],
    },
  },
  {
    name: "/user/logout",
    description: "",
    type: 1,
    request: {
      name: "/user/logout",
      method: "get",
      operationId: "logoutUser",
      url: "/user/logout",
    },
  },
  {
    name: "/user/{username}",
    description: "",
    type: 1,
    request: {
      name: "/user/{username}",
      method: "get",
      operationId: "getUserByName",
      url: "/user/{username}",
      queryParams: [
      ],
      pathParams: [
        {
          name: "username",
          in: "path",
          description: "The name that needs to be fetched. Use user1 for testing. ",
          required: true,
          schema: {
            type: "string",
          },
        },
      ],
      headers: [
      ],
    },
  },
  {
    name: "/user/{username}",
    description: "This can only be done by the logged in user.",
    type: 1,
    request: {
      name: "/user/{username}",
      method: "put",
      operationId: "updateUser",
      url: "/user/{username}",
      queryParams: [
      ],
      pathParams: [
        {
          name: "username",
          in: "path",
          description: "name that need to be deleted",
          required: true,
          schema: {
            type: "string",
          },
        },
      ],
      headers: [
      ],
      body: [
        {
          type: "application/json",
          schema: {
            schema: {
              type: "object",
              properties: {
                id: {
                  type: "integer",
                  format: "int64",
                  example: 10,
                },
                username: {
                  type: "string",
                  example: "theUser",
                },
                firstName: {
                  type: "string",
                  example: "John",
                },
                lastName: {
                  type: "string",
                  example: "James",
                },
                email: {
                  type: "string",
                  example: "john@email.com",
                },
                password: {
                  type: "string",
                  example: "12345",
                },
                phone: {
                  type: "string",
                  example: "12345",
                },
                userStatus: {
                  type: "integer",
                  description: "User Status",
                  format: "int32",
                  example: 1,
                },
              },
              xml: {
                name: "user",
              },
            },
          },
        },
        {
          type: "application/xml",
          schema: {
            schema: {
              type: "object",
              properties: {
                id: {
                  type: "integer",
                  format: "int64",
                  example: 10,
                },
                username: {
                  type: "string",
                  example: "theUser",
                },
                firstName: {
                  type: "string",
                  example: "John",
                },
                lastName: {
                  type: "string",
                  example: "James",
                },
                email: {
                  type: "string",
                  example: "john@email.com",
                },
                password: {
                  type: "string",
                  example: "12345",
                },
                phone: {
                  type: "string",
                  example: "12345",
                },
                userStatus: {
                  type: "integer",
                  description: "User Status",
                  format: "int32",
                  example: 1,
                },
              },
              xml: {
                name: "user",
              },
            },
          },
        },
        {
          type: "application/x-www-form-urlencoded",
          schema: {
            schema: {
              type: "object",
              properties: {
                id: {
                  type: "integer",
                  format: "int64",
                  example: 10,
                },
                username: {
                  type: "string",
                  example: "theUser",
                },
                firstName: {
                  type: "string",
                  example: "John",
                },
                lastName: {
                  type: "string",
                  example: "James",
                },
                email: {
                  type: "string",
                  example: "john@email.com",
                },
                password: {
                  type: "string",
                  example: "12345",
                },
                phone: {
                  type: "string",
                  example: "12345",
                },
                userStatus: {
                  type: "integer",
                  description: "User Status",
                  format: "int32",
                  example: 1,
                },
              },
              xml: {
                name: "user",
              },
            },
          },
        },
      ],
    },
  },
  {
    name: "/user/{username}",
    description: "This can only be done by the logged in user.",
    type: 1,
    request: {
      name: "/user/{username}",
      method: "delete",
      operationId: "deleteUser",
      url: "/user/{username}",
      queryParams: [
      ],
      pathParams: [
        {
          name: "username",
          in: "path",
          description: "The name that needs to be deleted",
          required: true,
          schema: {
            type: "string",
          },
        },
      ],
      headers: [
      ],
    },
  },
],
    request: {
      name: "/user",
      method: "post",
      operationId: "createUser",
      url: "/user",
      body: [
        {
          type: "application/json",
          schema: {
            schema: {
              type: "object",
              properties: {
                id: {
                  type: "integer",
                  format: "int64",
                  example: 10,
                },
                username: {
                  type: "string",
                  example: "theUser",
                },
                firstName: {
                  type: "string",
                  example: "John",
                },
                lastName: {
                  type: "string",
                  example: "James",
                },
                email: {
                  type: "string",
                  example: "john@email.com",
                },
                password: {
                  type: "string",
                  example: "12345",
                },
                phone: {
                  type: "string",
                  example: "12345",
                },
                userStatus: {
                  type: "integer",
                  description: "User Status",
                  format: "int32",
                  example: 1,
                },
              },
              xml: {
                name: "user",
              },
            },
          },
        },
        {
          type: "application/xml",
          schema: {
            schema: {
              type: "object",
              properties: {
                id: {
                  type: "integer",
                  format: "int64",
                  example: 10,
                },
                username: {
                  type: "string",
                  example: "theUser",
                },
                firstName: {
                  type: "string",
                  example: "John",
                },
                lastName: {
                  type: "string",
                  example: "James",
                },
                email: {
                  type: "string",
                  example: "john@email.com",
                },
                password: {
                  type: "string",
                  example: "12345",
                },
                phone: {
                  type: "string",
                  example: "12345",
                },
                userStatus: {
                  type: "integer",
                  description: "User Status",
                  format: "int32",
                  example: 1,
                },
              },
              xml: {
                name: "user",
              },
            },
          },
        },
        {
          type: "application/x-www-form-urlencoded",
          schema: {
            schema: {
              type: "object",
              properties: {
                id: {
                  type: "integer",
                  format: "int64",
                  example: 10,
                },
                username: {
                  type: "string",
                  example: "theUser",
                },
                firstName: {
                  type: "string",
                  example: "John",
                },
                lastName: {
                  type: "string",
                  example: "James",
                },
                email: {
                  type: "string",
                  example: "john@email.com",
                },
                password: {
                  type: "string",
                  example: "12345",
                },
                phone: {
                  type: "string",
                  example: "12345",
                },
                userStatus: {
                  type: "integer",
                  description: "User Status",
                  format: "int32",
                  example: 1,
                },
              },
              xml: {
                name: "user",
              },
            },
          },
        },
      ],
    },
  },
  {
    name: "/user/createWithList",
    description: "Creates list of users with given input array",
    type: 1,
    request: {
      name: "/user/createWithList",
      method: "post",
      operationId: "createUsersWithListInput",
      url: "/user/createWithList",
      body: [
        {
          type: "application/json",
          schema: {
            schema: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: {
                    type: "integer",
                    format: "int64",
                    example: 10,
                  },
                  username: {
                    type: "string",
                    example: "theUser",
                  },
                  firstName: {
                    type: "string",
                    example: "John",
                  },
                  lastName: {
                    type: "string",
                    example: "James",
                  },
                  email: {
                    type: "string",
                    example: "john@email.com",
                  },
                  password: {
                    type: "string",
                    example: "12345",
                  },
                  phone: {
                    type: "string",
                    example: "12345",
                  },
                  userStatus: {
                    type: "integer",
                    description: "User Status",
                    format: "int32",
                    example: 1,
                  },
                },
                xml: {
                  name: "user",
                },
              },
            },
          },
        },
      ],
    },
  },
  {
    name: "/user/login",
    description: "",
    type: 1,
    request: {
      name: "/user/login",
      method: "get",
      operationId: "loginUser",
      url: "/user/login",
      queryParams: [
        {
          name: "username",
          in: "query",
          description: "The user name for login",
          required: false,
          schema: {
            type: "string",
          },
        },
        {
          name: "password",
          in: "query",
          description: "The password for login in clear text",
          required: false,
          schema: {
            type: "string",
          },
        },
      ],
      pathParams: [
      ],
      headers: [
      ],
    },
  },
  {
    name: "/user/logout",
    description: "",
    type: 1,
    request: {
      name: "/user/logout",
      method: "get",
      operationId: "logoutUser",
      url: "/user/logout",
    },
  },
  {
    name: "/user/{username}",
    description: "",
    type: 1,
    request: {
      name: "/user/{username}",
      method: "get",
      operationId: "getUserByName",
      url: "/user/{username}",
      queryParams: [
      ],
      pathParams: [
        {
          name: "username",
          in: "path",
          description: "The name that needs to be fetched. Use user1 for testing. ",
          required: true,
          schema: {
            type: "string",
          },
        },
      ],
      headers: [
      ],
    },
  },
  {
    name: "/user/{username}",
    description: "This can only be done by the logged in user.",
    type: 1,
    request: {
      name: "/user/{username}",
      method: "put",
      operationId: "updateUser",
      url: "/user/{username}",
      queryParams: [
      ],
      pathParams: [
        {
          name: "username",
          in: "path",
          description: "name that need to be deleted",
          required: true,
          schema: {
            type: "string",
          },
        },
      ],
      headers: [
      ],
      body: [
        {
          type: "application/json",
          schema: {
            schema: {
              type: "object",
              properties: {
                id: {
                  type: "integer",
                  format: "int64",
                  example: 10,
                },
                username: {
                  type: "string",
                  example: "theUser",
                },
                firstName: {
                  type: "string",
                  example: "John",
                },
                lastName: {
                  type: "string",
                  example: "James",
                },
                email: {
                  type: "string",
                  example: "john@email.com",
                },
                password: {
                  type: "string",
                  example: "12345",
                },
                phone: {
                  type: "string",
                  example: "12345",
                },
                userStatus: {
                  type: "integer",
                  description: "User Status",
                  format: "int32",
                  example: 1,
                },
              },
              xml: {
                name: "user",
              },
            },
          },
        },
        {
          type: "application/xml",
          schema: {
            schema: {
              type: "object",
              properties: {
                id: {
                  type: "integer",
                  format: "int64",
                  example: 10,
                },
                username: {
                  type: "string",
                  example: "theUser",
                },
                firstName: {
                  type: "string",
                  example: "John",
                },
                lastName: {
                  type: "string",
                  example: "James",
                },
                email: {
                  type: "string",
                  example: "john@email.com",
                },
                password: {
                  type: "string",
                  example: "12345",
                },
                phone: {
                  type: "string",
                  example: "12345",
                },
                userStatus: {
                  type: "integer",
                  description: "User Status",
                  format: "int32",
                  example: 1,
                },
              },
              xml: {
                name: "user",
              },
            },
          },
        },
        {
          type: "application/x-www-form-urlencoded",
          schema: {
            schema: {
              type: "object",
              properties: {
                id: {
                  type: "integer",
                  format: "int64",
                  example: 10,
                },
                username: {
                  type: "string",
                  example: "theUser",
                },
                firstName: {
                  type: "string",
                  example: "John",
                },
                lastName: {
                  type: "string",
                  example: "James",
                },
                email: {
                  type: "string",
                  example: "john@email.com",
                },
                password: {
                  type: "string",
                  example: "12345",
                },
                phone: {
                  type: "string",
                  example: "12345",
                },
                userStatus: {
                  type: "integer",
                  description: "User Status",
                  format: "int32",
                  example: 1,
                },
              },
              xml: {
                name: "user",
              },
            },
          },
        },
      ],
    },
  },
  {
    name: "/user/{username}",
    description: "This can only be done by the logged in user.",
    type: 1,
    request: {
      name: "/user/{username}",
      method: "delete",
      operationId: "deleteUser",
      url: "/user/{username}",
      queryParams: [
      ],
      pathParams: [
        {
          name: "username",
          in: "path",
          description: "The name that needs to be deleted",
          required: true,
          schema: {
            type: "string",
          },
        },
      ],
      headers: [
      ],
    },
  },
]}
</script>

<button on:click={()=>{visibility = !visibility}} style="height:36px;" class="btn btn-primary d-flex w-100 align-items-center justify-content-start border-0 py-1 ps-4">
    <img src={angleRight} style="height:14px; width:14px; margin-right:8px; {visibility ? 'transform:rotate(90deg);' :'transform:rotate(0deg);'}" alt="angleRight" />
    <p class="mb-0" style="font-size: 14px;">{title}</p>
</button>
<div style="padding-left: 40px; cursor:pointer; display: {visibility ? 'block' : 'none'};">
    <!-- <button>+ Folder</button> <button>+ API REQUEST</button> -->
    {#each explorer.items as exp}
    <FileExplorer explorer={exp} />
    {/each}
</div>

<style>
    .btn-primary {
    background-color: #1e1e1e;
    color: #fff;
  }

  .btn-primary:hover {
    background-color: #232527;
    color: #fff;
    padding: 20px;
  }
</style>