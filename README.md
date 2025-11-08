# AngularProject

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 19.2.18.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.

## Project features (short)

- Employee Management: add, edit, delete employees using a Material dialog UI and a responsive table.
- Dashboard: summary cards (employees, applicants, departments, roles) and an "Employees by Department" bar chart.
- Job Applicants: card-style list with status actions and server-backed data.
- Confirmation & feedback: Delete confirmation dialog and colored, prominent toast messages (snackbars) with Undo support.
- API-first data layer: services that call a local json-server (fallback to localStorage when the API isn't available).
- Theming & styles: SCSS per-component styles and Angular Material components for a consistent, modern UI.

## Local API (json-server)

This project includes a simple local REST API powered by `json-server` for development. A `db.json` file at the project root contains sample `employees` and `applicants` data.

To run the fake API server (from the project root):

```bash
npm run json-server
```

By default the API listens on `http://localhost:3000` (see `src/app/api.config.ts`). The application components use services under `src/app/services/` to call the API endpoints (`/employees`, `/applicants`).

## Start the application

Install dependencies and run the dev server:

```bash
npm install
npm start
```

Open http://localhost:4200 in your browser. If you want API-backed data in the UI, start the json-server first.
