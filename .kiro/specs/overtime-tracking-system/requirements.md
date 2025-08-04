# Requirements Document - Simplified Overtime Tracking

## Introduction

This feature introduces a simplified overtime tracking system that allows employees to track additional work hours beyond their regular schedule. Users can set their weekly target hours and add overtime hours to their daily time entries. The system will calculate and display overtime statistics on the dashboard.

## Requirements

### Requirement 1

**User Story:** As an employee, I want to set my contracted weekly working hours in my settings, so that the system can accurately calculate my overtime hours.

#### Acceptance Criteria

1. WHEN I access the settings page THEN I SHALL see a "Weekly Target Hours" field where I can set my contracted hours (e.g., 40, 32, 37.5)
2. WHEN I set my weekly hours to 40 THEN the system SHALL calculate 100% target as 8 hours per day over 5 days
3. WHEN I set my weekly hours to 32 THEN the system SHALL calculate 80% target as 6.4 hours per day over 5 days
4. WHEN I save my weekly hours setting THEN it SHALL be stored in my user profile
5. WHEN the weekly hours are updated THEN all overtime calculations SHALL be recalculated automatically

### Requirement 2

**User Story:** As an employee, I want to add overtime hours to my daily time entry, so that I can track additional work beyond my regular schedule.

#### Acceptance Criteria

1. WHEN I view the time entry form THEN I SHALL see an "Additional Overtime Hours" field
2. WHEN I enter overtime hours THEN I can input decimal values (e.g., 2.25 for 2 hours 15 minutes)
3. WHEN I save a time entry with overtime THEN the total daily hours SHALL include both regular and overtime hours
4. WHEN I view my time entries THEN overtime hours SHALL be clearly displayed and highlighted
5. WHEN overtime hours are entered THEN they SHALL be validated for reasonable limits (0-12 hours per day)

### Requirement 3

**User Story:** As an employee, I want to see my overtime hours clearly displayed on the dashboard, so that I can track how much extra work I've done.

#### Acceptance Criteria

1. WHEN I view the dashboard THEN I SHALL see an "Overtime Hours" card showing weekly and monthly overtime
2. WHEN I have overtime hours THEN they SHALL be calculated by summing all daily overtime entries
3. WHEN I view overtime information THEN it SHALL display both current week and current month totals
4. WHEN overtime hours are displayed THEN they SHALL be color-coded (green for normal, orange for moderate overtime, red for excessive overtime)
5. WHEN I view the overtime card THEN it SHALL show my progress toward weekly targets

### Requirement 4

**User Story:** As an employee, I want to see a clear breakdown of my daily hours including regular and overtime portions, so that I understand how my time is categorized.

#### Acceptance Criteria

1. WHEN I view my recent time entries THEN each day SHALL show regular hours and overtime hours separately
2. WHEN a day has overtime THEN it SHALL be visually highlighted with an overtime indicator
3. WHEN I hover over daily totals THEN I SHALL see a tooltip showing the breakdown (e.g., "7.5h regular + 1.5h overtime")
4. WHEN I view weekly summaries THEN they SHALL show regular hours, overtime hours, and total hours separately
5. WHEN overtime is displayed THEN it SHALL use consistent formatting and color coding

### Requirement 5

**User Story:** As a system administrator, I want overtime data to be stored and tracked in the database, so that I can generate reports and monitor employee workload.

#### Acceptance Criteria

1. WHEN time entries are saved THEN overtime hours SHALL be stored in the database
2. WHEN weekly targets are changed THEN historical overtime data SHALL remain unchanged
3. WHEN overtime data is stored THEN it SHALL include date, regular hours, overtime hours, and total hours
4. WHEN querying overtime data THEN it SHALL be efficiently retrievable for reporting purposes
5. WHEN overtime calculations are performed THEN they SHALL be consistent across all system components

### Requirement 6

**User Story:** As an employee, I want my overtime hours to be clearly separated from regular hours in all displays, so that I can understand my work breakdown.

#### Acceptance Criteria

1. WHEN I view my time entries THEN regular hours and overtime hours SHALL be displayed separately
2. WHEN I view weekly summaries THEN they SHALL show regular hours, overtime hours, and total hours
3. WHEN overtime is displayed THEN it SHALL be visually highlighted with appropriate color coding
4. WHEN I view the dashboard THEN overtime SHALL be prominently featured in the statistics
5. WHEN overtime calculations are shown THEN they SHALL be based on my weekly target hours setting