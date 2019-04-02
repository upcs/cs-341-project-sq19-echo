# Echo

[![codecov](https://codecov.io/gh/upcs/cs-341-project-sq19-echo/branch/master/graph/badge.svg)](https://codecov.io/gh/upcs/cs-341-project-sq19-echo) [![Build Status](https://travis-ci.com/upcs/cs-341-project-sq19-echo.svg?branch=master)](https://travis-ci.com/upcs/cs-341-project-sq19-echo)

## Sprint 3 Features

App can run on a Google Cloud server. Added data for projects that are a part of the transporation syystem plan for Portland. Changed structure of project to add better tests to increase code coverage and quality of tests.

## Sprint 2 Features

Login page functionality added. Able to sign up or log in. About page content added. Contact buttons added that automatically redirect to a new email to the selected person. Traffic volume data added to the map and colored based on traffic flow. Filters for data added.

## Sprint 1 Features

Home page, about page, and login page added. Created an Angular web app. Added an interactive map. Added a menu bar to navigated between pages. Added buttons to load data, map updates on button press.

## Running unit tests

Run `jest` to execute the unit tests via [Jest](https://jestjs.io/).

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
