# Simple Salesforce Page Map for Property Asset Setup

Goal: keep the prototype and eventual build simple by using standard Salesforce navigation patterns instead of a custom app shell.

## 1. Entry Point

### A. Property Setup Report

Primary landing experience:

- Standard Salesforce List View or Report for Properties
- Default sort: In Progress -> Not Started -> Complete
- Filters:
  - Branch
  - Setup Status
  - Assigned Manager
  - Has Placeholders

What users do here:

- Open a Property Account record directly from the report
- Scan which properties need work
- Jump to blockers or placeholders via related reports

### B. Reports Tab

Secondary operational views:

- Setup blockers report
- Properties with placeholders report
- Audit report
- Completion status report

## 2. Property Account Page

The Property Account page is the main workspace.

Use standard Salesforce page components:

1. Highlights panel
   - Property name
   - Setup status
   - Branch
   - Assigned manager
2. Key setup fields section
   - Irrigation setup status
   - Has pump system
   - Has sensors
   - Placeholder zone count
3. Primary actions
   - Mark Setup Complete
   - Reopen Setup
4. Assets related list
   - Controllers
   - Zones
   - Backflows
   - Pumps
   - Sensors
5. Validation / blockers section
   - Show current blockers
   - Show placeholder warnings
6. Audit history section
   - Read-only action history

Keep this page compact and task-focused.

## 3. Asset Record Pages

Each asset type uses its standard record page.

### Controller

- Controller label
- Make / model
- Total zones
- Related zones list
- Retire action

### Zone

- Zone number
- Parent controller
- Placeholder flag
- Retire action

### Backflow

- Backflow type
- Serial number
- Retire action

### Pump / Sensor

- Basic identity fields
- Retire action

## 4. Navigation Flow

Simple model:

1. User opens Property Setup Report
2. User opens Property Account record from the report
3. User edits or adds assets from Property Account page
4. User opens a specific Asset record from the Account related list if needed
5. User validates and marks complete

No separate custom workspace is required for v1.

## 5. Minimal Action Set

Expose only these actions in the first version:

- Add Asset
- Edit Asset
- Retire Asset
- Validate
- Mark Setup Complete
- Reopen Setup

Do not add import, ownership automation, or notifications in v1.

## 6. UX Principle

If a user can reach a standard Salesforce record page for the task, use that instead of custom UI.

That means:

- Report/List for queueing
- Account page for setup context
- Asset page for detailed edits
- Reports for summaries and audit visibility

## 7. Recommended Build Order

1. Configure property list/report views.
2. Configure the Account record page.
3. Configure Asset record pages.
4. Add Flows for Validate, Mark Complete, Reopen.
5. Add audit object/report if needed.
6. Add custom UI only if a real gap remains.
