# @sparrow/library

## Purpose

The `@sparrow/library` package serves as a repository for global utilities that do not hold any application-specific data. This package includes generic functions that can be leveraged by other packages in the monorepo.


## Core Features

- **Utility Functions**: Provides a range of helper functions, such as debouncing and throttling, for better performance.
- **No Dependencies**: This package is self-contained and does not depend on other packages.

## Installation

To install the `@sparrow/library` package, use Yarn:

```bash
yarn add @sparrow/library
```

## Usage
After installation, you can import and start using the package within your desktop or web app setup:

```
import { initializeLibraryApp } from '@sparrow/library';

initializeLibraryApp({
  // Your app initialization configuration
});
```
## Dependencies Relationships

This package has no dependencies yet.