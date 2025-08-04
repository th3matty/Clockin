# Design Document - Simplified Overtime Tracking

## Overview

The simplified overtime tracking system extends the existing time entry functionality with an additional "overtime hours" field and automatic overtime calculation based on user-defined weekly hour targets. This approach maintains simplicity while providing powerful overtime tracking capabilities.

## Architecture

### Database Schema Changes

#### Users Table Extension
```sql
ALTER TABLE users ADD COLUMN weekly_target_hours DECIMAL(4,2) DEFAULT 40.00;
```

#### Time Entries Table Extension
```sql
ALTER TABLE time_entries ADD COLUMN overtime_hours DECIMAL(4,2) DEFAULT 0.00;
```

### Data Flow Architecture

```
User Settings → Weekly Target Hours → Database
     ↓
Time Entry Form → Regular Hours + Overtime Hours → time_entries table
     ↓
Overtime Calculator → Weekly/Monthly Summaries → Dashboard Components
```

## Components and Interfaces

### 1. Enhanced User Settings
**File:** `src/views/SettingsView.vue`
- Add "Weekly Target Hours" input field
- Validation for reasonable hour ranges (20-60 hours)
- Preview showing daily target calculation

### 2. Enhanced Time Entry Form
**File:** `src/components/employee/TimeEntryForm.vue`
- Add "Additional Overtime Hours" input field
- Validation for overtime hours (0-12 hours)
- Display total hours (regular + overtime)
- Visual separation of regular and overtime hours

### 3. Overtime Calculator Service
**File:** `src/composables/useOvertimeCalculations.ts`
```typescript
interface OvertimeStats {
  weeklyRegularHours: number
  weeklyOvertimeHours: number
  weeklyTotalHours: number
  monthlyRegularHours: number
  monthlyOvertimeHours: number
  monthlyTotalHours: number
  weeklyTarget: number
  overtimeStatus: 'normal' | 'moderate' | 'excessive'
}

export function useOvertimeCalculations() {
  const calculateOvertimeStats = (entries: TimeEntry[], weeklyTarget: number): OvertimeStats
  const getOvertimeStatus = (overtimeHours: number): 'normal' | 'moderate' | 'excessive'
  const formatOvertimeDisplay = (regularHours: number, overtimeHours: number): string
}
```

### 4. Enhanced Dashboard Components
**File:** `src/components/employee/OvertimeStats.vue` (new)
- Weekly overtime summary card
- Monthly overtime summary card
- Overtime status indicators with color coding
- Progress toward weekly targets

## Data Models

### Enhanced TimeEntry Interface
```typescript
interface TimeEntry {
  id: string
  user_id: string
  date: string
  start_time: string
  end_time: string
  lunch_break_minutes: number
  total_hours: number        // Calculated from start/end times
  overtime_hours: number     // NEW: User-entered additional hours
  created_at: string
  updated_at: string
}
```

### Enhanced User Interface
```typescript
interface User {
  // ... existing fields
  weekly_target_hours: number  // NEW: default 40.00
}
```

### New OvertimeStats Interface
```typescript
interface OvertimeStats {
  weeklyRegularHours: number
  weeklyOvertimeHours: number
  weeklyTotalHours: number
  monthlyRegularHours: number
  monthlyOvertimeHours: number
  monthlyTotalHours: number
  weeklyTarget: number
  overtimeStatus: 'normal' | 'moderate' | 'excessive'
}
```

## Overtime Calculation Logic

### Total Hours Calculation
```typescript
function calculateTotalDailyHours(entry: TimeEntry): number {
  const regularHours = entry.total_hours // From start/end time calculation
  const overtimeHours = entry.overtime_hours || 0
  return regularHours + overtimeHours
}
```

### Weekly Overtime Summary
```typescript
function calculateWeeklyOvertime(entries: TimeEntry[]): OvertimeStats {
  const weeklyRegularHours = entries.reduce((sum, entry) => sum + entry.total_hours, 0)
  const weeklyOvertimeHours = entries.reduce((sum, entry) => sum + (entry.overtime_hours || 0), 0)
  const weeklyTotalHours = weeklyRegularHours + weeklyOvertimeHours
  
  return {
    weeklyRegularHours: Math.round(weeklyRegularHours * 100) / 100,
    weeklyOvertimeHours: Math.round(weeklyOvertimeHours * 100) / 100,
    weeklyTotalHours: Math.round(weeklyTotalHours * 100) / 100,
    // ... monthly calculations similar
  }
}
```

### Overtime Status Classification
```typescript
function getOvertimeStatus(weeklyOvertimeHours: number): 'normal' | 'moderate' | 'excessive' {
  if (weeklyOvertimeHours === 0) return 'normal'
  if (weeklyOvertimeHours <= 5) return 'moderate'  // Up to 5 hours overtime per week
  return 'excessive'  // More than 5 hours overtime per week
}
```

## UI/UX Design

### Time Entry Form Enhancement
```vue
<!-- Existing fields: start_time, lunch_break_minutes, end_time -->

<!-- NEW: Overtime Hours Field -->
<div>
  <label for="overtime_hours" class="block text-sm font-medium text-gray-700 mb-2">
    Additional Overtime Hours (Optional)
  </label>
  <input
    id="overtime_hours"
    v-model.number="formData.overtime_hours"
    type="number"
    min="0"
    max="12"
    step="0.25"
    class="w-full px-4 py-3 border rounded-lg"
    placeholder="0.00"
  />
  <p class="text-xs text-gray-500 mt-1">Enter additional hours worked beyond regular schedule</p>
</div>

<!-- Enhanced Total Hours Display -->
<div class="bg-gray-50 rounded-lg p-4">
  <div class="flex items-center justify-between">
    <span class="text-sm font-medium text-gray-700">Total Working Hours:</span>
    <div class="text-right">
      <span class="text-2xl font-bold text-primary-600">
        {{ (calculatedHours + (formData.overtime_hours || 0)).toFixed(2) }}h
      </span>
      <div class="text-xs text-gray-500">
        {{ calculatedHours.toFixed(2) }}h regular
        <span v-if="formData.overtime_hours" class="text-orange-600">
          + {{ formData.overtime_hours.toFixed(2) }}h overtime
        </span>
      </div>
    </div>
  </div>
</div>
```

### Dashboard Overtime Card
```vue
<div class="bg-white rounded-lg shadow p-6">
  <div class="flex items-center">
    <div class="flex-shrink-0">
      <div class="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
        <ClockIcon class="w-6 h-6 text-orange-600" />
      </div>
    </div>
    <div class="ml-4 flex-1">
      <h3 class="text-sm font-medium text-gray-900">Overtime Hours</h3>
      <div class="flex items-baseline">
        <p class="text-2xl font-semibold text-gray-900">{{ weeklyOvertimeHours.toFixed(2) }}h</p>
        <p class="ml-2 text-sm text-gray-500">this week</p>
      </div>
      <div class="mt-2">
        <div class="flex items-center">
          <span :class="overtimeStatusColor" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium">
            {{ overtimeStatusText }}
          </span>
          <span class="ml-2 text-sm text-gray-500">{{ monthlyOvertimeHours.toFixed(2) }}h this month</span>
        </div>
      </div>
    </div>
  </div>
</div>
```

## Error Handling

### Validation Rules
1. Weekly target hours: 20-60 hours range
2. Overtime hours: 0-12 hours per day
3. Total daily hours: Maximum 24 hours (regular + overtime)
4. Decimal precision: Up to 2 decimal places

### Error Recovery
1. Graceful handling of missing weekly targets (default to 40 hours)
2. Automatic recalculation when targets change
3. Data consistency validation for overtime calculations

## Testing Strategy

### Unit Tests
- Overtime calculation functions
- Form validation logic
- Data formatting and display

### Integration Tests
- End-to-end time entry with overtime
- Settings update affecting overtime calculations
- Dashboard display accuracy

## Migration Strategy

### Phase 1: Database Schema
1. Add weekly_target_hours column to users table
2. Add overtime_hours column to time_entries table
3. Set default values for existing data

### Phase 2: Backend Logic
1. Update time entry CRUD operations
2. Implement overtime calculation service
3. Update data validation

### Phase 3: Frontend Updates
1. Enhance settings page with weekly target hours
2. Update time entry form with overtime field
3. Add overtime dashboard components

### Phase 4: Data Population
1. Set default weekly targets for existing users
2. Initialize overtime hours to 0 for existing entries
3. Validate calculation accuracy