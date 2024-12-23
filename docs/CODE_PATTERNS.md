## Naming Conventions

- Variables and Functions: Use camelCase for all variable and function names.
- Class Names: Use PascalCase for all class names.
- Constants: Use UPPER_CASE for constants that remain unchanged throughout the program.

  ```
    // ✅ Preferred
    let userName = '';
    class UserProfileManager {}
    const API_BASE_URL = 'https://api.example.com';
    
    // ❌ Avoid
    let user_name = '';
    class userProfileManager {}
    const ApiBaseUrl = 'https://api.example.com';
  ```

## Variable Declarations

- Use descriptive and specific names for variables, functions, and classes. For example, isCreateWorkspaceModalOpen is preferred over isModalOpen, as it clearly conveys the variable's purpose and context.

  ```
    // ✅ Preferred
    let isCreateWorkspaceModalOpen = true;
    const fetchUserData = () => {};
    class UserProfileManager {}
    
    // ❌ Avoid
    let isModalOpen = true;
    const fetchData = () => {};
    class Manager {}
  ```
- Use let and const exclusively for variable declarations. Avoid using var to ensure block-scoping and prevent hoisting issues.
- Use const by default, and only use let if the variable’s value will change.

## Function Declarations

- Use arrow functions for all functions to maintain consistency and modern JavaScript standards.
- Every function parameter should start with an underscore (_).

  ```
    // ✅ Preferred
    const add = (_a, _b) => _a + _b;
    
    // ❌ Avoid
    function add(_a, _b) {
      return _a + _b;
    }
  ```

## Strict Equality (===)
- Always use === instead of == for comparisons.

  ```
    // ✅ Preferred
    if (a === b) {
      // do something
    }
    
    // ❌ Avoid
    if (a == b) {
      // do something
    }
  ```

## Single Responsibility

- Each function or module should focus on a single task.
- Avoid functions that handle multiple concerns. Example:

  ```
    // ✅ Preferred
    const fetchUser = () => { /* fetch user data */ };
    const renderUser = (user) => { /* render user data */ };
    
    // ❌ Avoid
    const handleUser = () => {
      /* fetch and render user data */
    };
  ```

## Avoid Magic Numbers and Strings

- Use constants instead of hard-coded numbers or strings.
 
  ```
    // ✅ Preferred
    const MAX_RETRIES = 5;
    if (attempts > MAX_RETRIES) {}
    
    // ❌ Avoid
    if (attempts > 5) {}
  ```

## TypeScript Types

- Use TypeScript for defining parameter and return types directly within the function signature.
  TypeScript Example:
  
  ```
    const calculateSum = (_a: number, _b: number): number => {
        const result = _a + _b;
        return result;
    };
  ```

## Documentation

- Use JSDoc Comments to document each function’s purpose, parameter purpose, and return value purpose. Do not include types in the JSDoc, as TypeScript types are already specified.
  JSDoc Example:
  
  ```
    /**
     * Calculates the sum of two numbers.
     * 
     * @param _a - The first number to add.
     * @param _b - The second number to add.
     * @returns The sum of `_a` and `_b`.
     */
    const calculateSum = (_a: number, _b: number): number => {
        return _a + _b;
    };
  ```
