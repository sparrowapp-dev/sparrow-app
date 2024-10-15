# @sparrow/workspaces

## Purpose

The @sparrow/workspaces package is a crucial component of the Sparrow application, dedicated to managing collections, environments, and test flows for REST API testing. This package allows users to create, organize, and execute API tests efficiently.

## Core Features

### 1. Collections Management
- **Create and Manage Groups of API Requests**: Organize API requests into collections for easier access and testing. Group related requests to streamline workflows and ensure organized testing.

### 2. Environment Configuration
- **Define and Manage Different Environments**: Create different environments (such as `GLobal` and `Local`) for testing APIs in various settings. Seamlessly switch between environments during testing to mimic real-world scenarios.

### 3. Test Flow Execution
- **Run Predefined Test Flows**: Execute pre-built test flows that validate API behavior across different environments. Automate testing for consistent API responses and ensure everything behaves as expected.

## Usage
After installation, you can import and start using the package within your desktop or web app setup:

```
import { initializeDesktopApp } from '@sparrow/workspaces';

initializeWorkspacesApp({
  // Your app initialization configuration
});
```
## Dependencies Relationships

- **[@sparrow/library](packages/library/README.md)**: Contains global utilities without app-specific data.
- **[@sparrow/common](packages/common/README.md)**: Provides shared logic and utilities across the application.
