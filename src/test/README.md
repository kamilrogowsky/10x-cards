# Testing Environment Guide

This directory contains the testing configuration for the 10xCards project.

## Overview

Our testing stack includes:
- **Vitest** - Fast unit test framework
- **React Testing Library** - Testing utilities for React components
- **@astro/test-utils** - Testing utilities for Astro components
- **MSW (Mock Service Worker)** - API mocking for tests
- **@testing-library/jest-dom** - Custom jest matchers

## Available Scripts

```bash
# Run tests once
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run tests with UI mode
npm run test:ui
```

## Project Structure

```
src/test/
├── README.md           # This file
├── setup.ts           # Global test setup
├── utils.tsx          # Custom render utilities
├── example.test.tsx   # Example test file (can be deleted)
└── mocks/
    ├── handlers.ts    # MSW request handlers
    ├── browser.ts     # MSW browser setup
    └── server.ts      # MSW server setup (for tests)
```

## Writing Tests

### Basic Test Structure

Follow the **Arrange-Act-Assert** pattern:

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../test/utils';
import { MyComponent } from './MyComponent';

describe('MyComponent', () => {
  it('should render correctly', () => {
    // Arrange
    const props = { title: 'Test Title' };
    
    // Act
    render(<MyComponent {...props} />);
    
    // Assert
    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });
});
```

### Testing React Components

Use the custom `render` function from `test/utils.tsx`:

```typescript
import { render, screen } from '../test/utils';

// Test component rendering
render(<Component />);
expect(screen.getByRole('button')).toBeInTheDocument();
```

### Testing User Interactions

```typescript
import { render, screen, fireEvent } from '../test/utils';
import userEvent from '@testing-library/user-event';

it('should handle user interactions', async () => {
  const user = userEvent.setup();
  render(<Button onClick={mockFn} />);
  
  await user.click(screen.getByRole('button'));
  expect(mockFn).toHaveBeenCalled();
});
```

### Mocking with Vitest

```typescript
import { vi } from 'vitest';

// Mock functions
const mockFn = vi.fn();
const mockFnWithReturn = vi.fn().mockReturnValue('value');

// Spy on existing functions
const spy = vi.spyOn(object, 'method');

// Mock modules
vi.mock('./module', () => ({
  exportedFunction: vi.fn()
}));
```

### Testing Async Components

```typescript
it('should handle async operations', async () => {
  render(<AsyncComponent />);
  
  // Wait for element to appear
  expect(await screen.findByText('Loaded')).toBeInTheDocument();
  
  // Wait for element to disappear
  await waitForElementToBeRemoved(screen.getByText('Loading'));
});
```

### API Mocking with MSW

Add handlers to `mocks/handlers.ts`:

```typescript
import { http, HttpResponse } from 'msw';

export const handlers = [
  http.get('/api/data', () => {
    return HttpResponse.json({ message: 'Mocked response' });
  }),
];
```

Override handlers in specific tests:

```typescript
import { server } from '../test/mocks/server';

it('should handle API errors', async () => {
  server.use(
    http.get('/api/data', () => {
      return new HttpResponse(null, { status: 500 });
    })
  );
  
  // Test error handling
});
```

## Best Practices

1. **Use descriptive test names** - Test names should describe what is being tested and expected outcome
2. **Follow AAA pattern** - Arrange, Act, Assert
3. **Test behavior, not implementation** - Focus on what the component does, not how it does it
4. **Use appropriate queries** - Prefer `getByRole`, `getByLabelText` over `getByTestId`
5. **Mock external dependencies** - Use MSW for API calls, vi.mock for modules
6. **Clean up after tests** - Use cleanup functions and proper mocking setup
7. **Test error states** - Don't forget to test error conditions and edge cases

## Coverage Thresholds

Current coverage thresholds are set to 80% for:
- Branches
- Functions  
- Lines
- Statements

These can be adjusted in `vitest.config.ts`.

## Troubleshooting

### Common Issues

1. **"Cannot find module" errors** - Run `npm install` to ensure all dependencies are installed
2. **DOM-related errors** - Make sure `environment: 'jsdom'` is set in vitest config
3. **React component errors** - Ensure you're using the custom render function from `test/utils.tsx`
4. **ESLint errors in tests** - The ESLint config includes testing-specific rules

### Debugging Tests

```bash
# Run a specific test file
npm run test -- MyComponent.test.tsx

# Run tests matching a pattern
npm run test -- --reporter=verbose

# Debug with UI mode
npm run test:ui
``` 