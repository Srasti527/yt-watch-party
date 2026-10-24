
# Test Plan — YouTube Watch Party

## 1. Project Overview

- **Project Name:** YouTube Watch Party — Manual Testing
- **Application Type:** Real-Time Web Application
- **Testing Type:** Manual Software Testing
- **Application URL:** [YouTube Watch Party](https://yt-watch-party.vercel.app)
- **Backend:** [YouTube Watch Party Backend](https://yt-watch-party-backend.onrender.com)

YouTube Watch Party is a web application that allows multiple users to join a shared room and watch YouTube videos together. The application includes synchronized playback, user roles, chat, emoji reactions, and participant management.

This QA project focuses on validating application functionality, identifying defects, verifying error handling, and documenting test results using manual testing techniques.

## 2. Testing Objectives

- Verify that core application features work according to their expected behavior.
- Validate room creation and room joining workflows.
- Test positive and negative scenarios using valid and invalid inputs.
- Verify role-based functionality for Hosts, Moderators, and Participants.
- Check synchronization of video playback between multiple users.
- Validate chat, emoji reactions, and participant management.
- Identify, document, and track defects with clear reproduction steps.
- Maintain organized test cases, execution results, and defect reports.

## 3. Scope of Testing

### 3.1 In Scope

#### Functional Testing

- Home page and navigation
- Room creation
- Joining an existing room
- Username and room ID validation
- Video playback controls
- Playback synchronization
- Chat functionality
- Emoji reactions
- Participant list and management
- User roles and permissions
- Host transfer and participant removal

#### Negative Testing

- Empty username
- Empty room ID
- Invalid or nonexistent room IDs
- Invalid video inputs
- Unexpected user actions
- Handling of disconnected users

#### Exploratory Testing

- Browser navigation
- Refreshing pages
- Multiple users joining the same room
- Host disconnection
- Basic responsive layout checks
- Error messages and unusual input values

### 3.2 Out of Scope

- Formal penetration testing
- Load and stress testing
- Source-code unit testing
- Automated test execution
- Infrastructure and server monitoring
- Formal performance benchmarking

These areas may be considered separately if the project scope is expanded.

## 4. Testing Approach

Testing will be performed manually through the application's user interface, using different input values and user roles.

The following approach will be used:

1. Understand the application's features and expected workflows.
2. Prepare test scenarios and detailed test cases.
3. Define preconditions, test data, execution steps, and expected results.
4. Execute selected test cases against the running application.
5. Record actual results and mark each executed case as Pass or Fail.
6. Document reproducible defects with steps, expected behavior, actual behavior, severity, and supporting evidence where available.
7. Retest fixes and update the execution status.

Test cases that have not been executed will remain marked **Not Run**. Potential issues identified during analysis will not be reported as confirmed defects until reproduced.

## 5. Test Environment

| Component | Details |
|---|---|
| Application | YouTube Watch Party |
| Frontend | Deployed web application |
| Backend | Deployed backend service |
| Browser | Google Chrome |
| Testing Method | Manual testing |
| Test Evidence | Screenshots and documented observations, where available |
| Test Management | Markdown files and CSV spreadsheets in GitHub |

Browser version, operating system, screen size, and execution date should be recorded when the relevant tests are performed.

## 6. Test Scenarios

The following areas will be covered by the test suite.

| ID | Test Area | Priority |
|---|---|---|
| TS-01 | Home page and navigation | Medium |
| TS-02 | Room creation | High |
| TS-03 | Room joining | High |
| TS-04 | Input validation | High |
| TS-05 | Video playback controls | High |
| TS-06 | Playback synchronization | High |
| TS-07 | Chat functionality | Medium |
| TS-08 | Emoji reactions | Low |
| TS-09 | User roles and permissions | High |
| TS-10 | Participant management | High |
| TS-11 | Disconnection and reconnection | Medium |
| TS-12 | Browser navigation and refresh | Medium |
| TS-13 | Responsive layout | Low |
| TS-14 | Error handling and unusual inputs | Medium |

Priorities indicate the planned importance of each area, not its current test status.

## 7. Test Data

Test data will include:

- Valid usernames
- Empty usernames
- Valid room IDs
- Empty room IDs
- Existing and nonexistent room IDs
- Valid YouTube video links or IDs
- Invalid video inputs
- Multiple browser sessions representing different participants
- Different user roles, where the application allows them to be assigned

Only test data appropriate for the application will be used. No real user credentials or sensitive personal data are required.

## 8. Entry Criteria

Testing can begin when:

- The application is accessible in the test environment.
- The required application features are available.
- Test scenarios and test cases have been prepared.
- Suitable test data is available.

If the application or backend is unavailable, affected test cases should be recorded as **Blocked** rather than **Failed**.

## 9. Exit Criteria

The testing cycle may be considered complete when:

- Planned test cases have been executed or their remaining status has been documented.
- Pass, Fail, Blocked, and Not Run statuses are recorded accurately.
- Reproducible defects have been documented.
- High-priority failures have been reviewed.
- A test summary has been prepared.

Completion of documentation alone does not mean that all application features have passed testing.

## 10. Defect Reporting

For every reproducible defect, the following information will be recorded:

- Defect ID
- Defect title
- Environment
- Preconditions
- Steps to reproduce
- Expected result
- Actual result
- Severity
- Priority, where applicable
- Screenshot or other evidence, where available
- Current status

Potential risks and observations will be kept separate from confirmed defects.

## 11. Test Status Definitions

| Status | Definition |
|---|---|
| Pass | Actual behavior matches the expected result. |
| Fail | Actual behavior differs from the expected result. |
| Blocked | Testing cannot proceed because of an external dependency or blocker. |
| Not Run | The test case has not yet been executed. |
| Retest Required | A previously failed test needs to be executed again after a change. |

## 12. Deliverables

The QA project will include:

- Test plan
- Test scenarios
- Detailed manual test cases
- Test execution results
- Defect report template
- Confirmed defect log
- Test summary report
- Screenshots or other supporting evidence, where available

## 13. Limitations and Notes

The application's observed behavior may depend on backend availability, network conditions, browser behavior, and the current application implementation.

Test results will reflect the environment and date of execution. Features that have only been reviewed in source code or identified as potential risks will not be represented as successfully tested.

This test plan is part of a self-initiated manual QA portfolio project built around the YouTube Watch Party application.
