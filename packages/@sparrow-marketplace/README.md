# @sparrow/marketplace

## Purpose

The `@sparrow/marketplace` package facilitates public workspace and marketplace for all public workspaces within the Sparrow application. It enables users to check all public workspaces in the sparrow.

## Core Features

### 1. **Public Workspaces**

- Users can see all the public workspaces in the marketplace.

## Usage

After installation, you can import and start using the package within your desktop or web app setup:

```
import { initializeMarketplaceApp } from '@sparrow/marketplace';

initializeMarketplaceApp({
  // Your app initialization configuration
});
```

## Dependencies Relationships

- **[@sparrow/library](packages/library/README.md)**: Contains global utilities without app-specific data.
- **[@sparrow/common](packages/common/README.md)**: Provides shared logic and utilities across the application.
