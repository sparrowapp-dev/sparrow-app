# @sparrow/web

## Purpose

The `@sparrow/web` package is responsible for delivering the web version of the Sparrow app. It builds upon core Sparrow packages, importing functionality from `@sparrow/workspace`, `@sparrow/teams`, `@sparrow/common`, `@sparrow/library`, `@sparrow/support`, and others to create a comprehensive web-based application experience.

## Core Features

- **Web-specific Optimizations**: Tailored for performance and UI enhancements on web platforms, ensuring a smooth browser experience.
- **Responsive Design**: Fully responsive interface, making the app accessible across different screen sizes, from desktops to mobile devices.
- **Real-time Synchronization**: Leverages online connectivity to sync collections, environments, and team data in real-time.

## Design Considerations

- **Cross-platform Experience**: Delivers a consistent user experience across different browsers and devices, while maintaining compatibility with the desktop app.
- **Cloud-first Approach**: Optimized for online use, taking advantage of real-time data synchronization and cloud storage for seamless user experience.

## Installation

To install the `@sparrow/web` package, use Yarn:

```bash
yarn add @sparrow/web
```

## Usage
After installation, you can import and start using the package within your Tauri or desktop app setup:

```
import { initializeDesktopApp } from '@sparrow/web';

initializeDesktopApp({
  // Your app initialization configuration
});
```
## Dependencies Relationships

- **[@sparrow/library](packages/library/README.md)**: Contains global utilities without app-specific data.
- **[@sparrow/common](packages/common/README.md)**: Provides shared logic and utilities across the application.
- **[@sparrow/workspace](packages/workspace/README.md)**: Manages collections, environments, and test flows for the REST API tool.
- **[@sparrow/teams](packages/teams/README.md)**: Facilitates team collaboration and user management.
- **[@sparrow/support](packages/support/README.md)**: Handles user feedback and support requests.

