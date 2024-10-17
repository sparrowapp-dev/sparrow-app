# @sparrow/common

## Purpose

The `@sparrow/common` package provides a collection of shared utilities and logic that are used across multiple packages within the Sparrow application. This package helps maintain code consistency and reduces redundancy.

## Core Features

- **Reusable Functions**: A collection of utility functions that can be used throughout the application for various purposes, such as data manipulation, formatting, and more.
- **Constants and Configurations**: Common constants and configuration settings that ensure uniformity and ease of maintenance across different parts of the application.

## Usage
After installation, you can import and start using the package within your desktop or web app setup:

```
import { initializeCommonApp } from '@sparrow/common';

initializeCommonApp({
  // Your app initialization configuration
});
```
## Dependencies Relationships

- **[@sparrow/library](packages/library/README.md)**: Contains global utilities without app-specific data.
