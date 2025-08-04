# Implementation Plan - Simplified Overtime Tracking

## Overview
This implementation plan focuses on the simplified overtime tracking approach with a single "overtime hours" field and weekly target hours setting.

- [x] 1. Database Schema Updates and Migration



  - Add weekly_target_hours column to users table with default value of 40.00
  - Add overtime_hours column to time_entries table with default value of 0.00
  - Create database migration scripts for existing data
  - Update TypeScript interfaces to include new fields
  - _Requirements: 1.4, 2.3, 5.1, 5.2_

- [x] 2. Enhanced User Settings for Weekly Target Hours



  - Add "Weekly Target Hours" input field to SettingsView.vue
  - Add preview calculation showing daily target hours
  - Update useUserSettings composable to handle weekly_target_hours
  - Update AuthUser interface to include weekly_target_hours field
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [ ] 3. Overtime Calculation Service


  - Create useOvertimeCalculations composable with core calculation logic
  - Implement calculateOvertimeStats function for weekly/monthly summaries
  - Add getOvertimeStatus function for color-coding (normal/moderate/excessive)
  - Add utility functions for overtime data formatting
  - Add comprehensive unit tests for calculation accuracy
  - _Requirements: 3.2, 4.5, 5.5, 6.5_

- [ ] 4. Enhanced Time Entry Form with Overtime Field
  - Add "Additional Overtime Hours" input field to TimeEntryForm.vue
  - Implement validation for overtime hours (0-12 hours per day)
  - Update total hours display to show regular + overtime breakdown
  - Add visual indicators for overtime hours
  - Update form submission to include overtime_hours
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [ ] 5. Enhanced Time Entries Data Management
  - Update useTimeEntries composable to handle overtime_hours field
  - Modify createTimeEntry and updateTimeEntry functions
  - Update time entry calculations to include overtime
  - Add overtime data to time entry display components
  - Update TypeScript interfaces for enhanced TimeEntry model
  - _Requirements: 2.3, 5.1, 5.4, 6.1_

- [ ] 6. Overtime Dashboard Components
  - Create OvertimeStats.vue component for overtime display
  - Add weekly overtime summary card
  - Add monthly overtime summary card
  - Implement color-coded overtime status indicators
  - Integrate OvertimeStats into main dashboard layout
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 6.4_

- [ ] 7. Enhanced Time Entry Display with Overtime
  - Update recent time entries to show regular/overtime breakdown
  - Add visual indicators for days with overtime hours
  - Implement hover tooltips showing detailed hour breakdowns
  - Add overtime highlighting and color coding
  - Update QuickStats to include overtime in calculations
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 6.1, 6.2_

- [ ] 8. Data Migration and Validation
  - Create migration script to add default values for existing users
  - Set weekly_target_hours to 40.00 for all existing users
  - Set overtime_hours to 0.00 for all existing time entries
  - Add data validation and consistency checks
  - Test migration with sample data
  - _Requirements: 5.2, 5.3_

- [ ] 9. Testing and Quality Assurance
  - Create unit tests for overtime calculation functions
  - Add integration tests for overtime time entry workflow
  - Test settings update affecting overtime calculations
  - Validate overtime display accuracy on dashboard
  - Test edge cases and error handling
  - _Requirements: All requirements validation_

- [ ] 10. Documentation and Finalization
  - Update user documentation for overtime tracking features
  - Document database schema changes
  - Update CHANGELOG.md with overtime tracking feature details
  - Create user guide for overtime functionality
  - Final testing and bug fixes
  - _Requirements: Documentation_

## Implementation Notes

### Task Dependencies
- Task 1 must complete before any other tasks (database foundation)
- Tasks 2 and 3 can run in parallel after Task 1
- Tasks 4-7 depend on Tasks 1-3
- Tasks 8-10 are final integration and testing phases

### Key Focus Areas
- **Simplicity**: Single overtime field, no complex multi-entry system
- **User Experience**: Clear visual separation of regular vs overtime hours
- **Data Integrity**: Proper validation and migration of existing data
- **Performance**: Efficient calculations without complex database queries