# 10xCards

## Table of Contents
- [Project Description](#project-description)
- [Tech Stack](#tech-stack)
- [Testing](#testing)
- [Getting Started Locally](#getting-started-locally)
- [Available Scripts](#available-scripts)
- [Project Scope](#project-scope)
- [Project Status](#project-status)
- [License](#license)

## Project Description

10xCards is a cutting-edge web application that enables the automatic generation of high-quality flashcards using artificial intelligence. It transforms text input into engaging flashcards to facilitate efficient and effective learning.

## Tech Stack

The project is built using the following technologies:

- Astro 5
- TypeScript 5
- React 19
- Tailwind 4
- Shadcn/ui

## Testing

The project uses a comprehensive testing setup to ensure code quality and reliability:

### Unit Testing
- **Vitest** - Fast unit test framework for JavaScript/TypeScript
- **React Testing Library** - Testing utilities for React components
- **@astro/test-utils** - Official testing utilities for Astro components
- **MSW (Mock Service Worker)** - API mocking for reliable tests

### Code Quality & Performance
- **Lighthouse CLI** - Automated performance audits
- **Semgrep** - Static analysis security testing (SAST)
- **ESLint security plugins** - Security-focused linting rules

## Getting Started Locally

To set up the project on your local machine, please follow these steps:

1. **Clone the repository:**
   ```bash
   git clone https://github.com/kamilrogowsky/10x-cards.git
   ```
2. **Ensure you are using the correct Node version:** 
   This project uses the Node version specified in the `.nvmrc` file. Currently it's **22.14.0**
   ```sh
   nvm use
   ```
3. **Navigate to the project directory:**
   ```bash
   cd 10x-cards
   ```
4. **Install dependencies:**
   ```bash
   npm install
   ```
5. **Start the development server:**
   ```bash
   npm run dev
   ```

## Available Scripts

- `npm run dev`: Starts the development server.
- `npm run build`: Builds the project for production.
- `npm run preview`: Serves the production build locally for preview.
- `npm run astro` - Runs Astro CLI commands.
- `npm run lint` - Checks code quality using ESLint.
- `npm run lint:fix` - Fixes linting errors with ESLint.
- `npm run format` - Formats the code using Prettier.
- `npm run test` - Runs unit tests with Vitest.
- `npm run test:watch` - Runs unit tests in watch mode.
- `npm run test:coverage` - Runs tests with coverage report.

## Project Scope

This project aims to:::

- Automate the generation of flashcards using AI.
- Simplify and speed up the flashcard creation process from user-provided text.
- Supporting user account registration, login, and secure authentication using Supabase.
- Provide an intuitive and user-friendly interface to enhance the study experience.
- Continuously evolve with new features and improvements based on user feedback.

## Project Status

The project is currently under active development.

## License

This project is licensed under the MIT License.
