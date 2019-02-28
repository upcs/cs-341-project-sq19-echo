# Echo

[![codecov](https://codecov.io/gh/upcs/cs-341-project-sq19-echo/branch/master/graph/badge.svg)](https://codecov.io/gh/upcs/cs-341-project-sq19-echo) [![Build Status](https://travis-ci.com/upcs/cs-341-project-sq19-echo.svg?branch=master)](https://travis-ci.com/upcs/cs-341-project-sq19-echo)

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 7.3.1.

## Sprint 1 Features

Home page, about page, and login page added. Created an Angular web app. Added an interactive map. Added a menu bar to navigated between pages. Added buttons to load data, map updates on button press.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

## Running unit tests

Run `ng test` to execute the unit tests via [Jest](https://jestjs.io/).

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).

## Story Acceptance Test

2.21.2019

As a consumer, I can see the traffic around my current location so that I can try to take the most efficient routes to my desired destination.

Acceptance Test:
1. Verify the user gives a location.
2. Verify the users current location is valid.
3. Verify that the map is set to the users current location.
4. Verify the traffic data of current location in database.
5. Verify the map accurately reflects the traffic data.

What are the variations to test?
Updates every 15 seconds.
Can you automate it?
Would be difficult to automate tests.
