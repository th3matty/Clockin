e<template>
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow">
        <!-- Header -->
        <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div class="flex items-center justify-between">
                <h2 class="text-lg font-medium text-gray-900 dark:text-gray-100">Recent Activity</h2>
                <button @click="refreshActivities" :disabled="loading"
                    class="inline-flex items-center px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 transition-colors">
                    <svg :class="['w-3 h-3 mr-1', loading ? 'animate-spin' : '']" fill="none" stroke="currentColor"
                        viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Refresh
                </button>
            </div>
        </div>

        <!-- Activity List -->
        <div class="max-h-96 overflow-y-auto">
            <div v-if="loading" class="p-6">
                <!-- Loading Skeletons -->
                <div v-for="i in 5" :key="i" class="animate-pulse mb-4 last:mb-0">
                    <div class="flex space-x-3">
                        <div class="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                        <div class="flex-1 space-y-2">
                            <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                            <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                        </div>
                    </div>
                </div>
            </div>

            <div v-else-if="activities.length === 0" class="p-6 text-center">
                <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No recent activity</h3>
                <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">Activity will appear here as team members
                    interact with the system.</p>
            </div>

            <div v-else class="divide-y divide-gray-200 dark:divide-gray-700">
                <div v-for="activity in activities" :key="activity.id"
                    class="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <div class="flex space-x-3">
                        <!-- Activity Type Icon -->
                        <div class="flex-shrink-0">
                            <div :class="[
                                'w-8 h-8 rounded-full flex items-center justify-center',
                                getActivityTypeClasses(activity.type)
                            ]">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path v-if="activity.type === 'holiday_request'" stroke-linecap="round"
                                        stroke-linejoin="round" stroke-width="2"
                                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    <path v-else-if="activity.type === 'time_entry'" stroke-linecap="round"
                                        stroke-linejoin="round" stroke-width="2"
                                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>

                        <!-- Activity Content -->
                        <div class="flex-1 min-w-0">
                            <!-- Activity Header -->
                            <div class="flex items-start justify-between">
                                <div class="flex-1">
                                    <p class="text-sm font-medium text-gray-900 dark:text-gray-100">
                                        {{ activity.user_name }}
                                    </p>
                                    <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
                                        {{ activity.message }}
                                    </p>

                                    <!-- Enhanced Details for Holiday Requests -->
                                    <div v-if="activity.type === 'holiday_request' && activity.metadata"
                                        class="mt-2 space-y-1">
                                        <div class="flex items-center text-xs text-gray-500 dark:text-gray-400">
                                            <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor"
                                                viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            <span class="font-medium">{{ formatDateRange(activity.metadata.start_date!,
                                                activity.metadata.end_date!) }}</span>
                                        </div>
                                        <div v-if="activity.metadata.reason"
                                            class="flex items-start text-xs text-gray-500 dark:text-gray-400">
                                            <svg class="w-3 h-3 mr-1 mt-0.5 flex-shrink-0" fill="none"
                                                stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                    d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                                            </svg>
                                            <span class="italic">"{{ activity.metadata.reason }}"</span>
                                        </div>
                                        <div class="flex items-center text-xs">
                                            <span :class="getStatusBadgeClasses(activity.metadata.status!)">
                                                {{ (activity.metadata?.status?.[0]?.toUpperCase() ?? '') +
                                                    (activity.metadata?.status?.slice(1) ?? '') }}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <time class="text-xs text-gray-500 dark:text-gray-400 ml-2">
                                    {{ formatRelativeTime(activity.timestamp) }}
                                </time>
                            </div>

                            <!-- Holiday Request Actions -->
                            <div v-if="activity.type === 'holiday_request' && activity.actionable"
                                class="mt-3 flex space-x-2">
                                <button @click="approveRequest(activity.holiday_request_id!)"
                                    :disabled="processingRequest === activity.holiday_request_id"
                                    class="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                                    <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M5 13l4 4L19 7" />
                                    </svg>
                                    {{ processingRequest === activity.holiday_request_id ? 'Approving...' : 'Approve' }}
                                </button>
                                <button @click="showDenyModal(activity)"
                                    :disabled="processingRequest === activity.holiday_request_id"
                                    class="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                                    <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                    Deny
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Deny Request Modal -->
        <div v-if="showDenyModalFlag"
            class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-4">
                <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100">Deny Holiday Request</h3>
                </div>
                <div class="px-6 py-4">
                    <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        Are you sure you want to deny this holiday request from <strong>{{ selectedActivity?.user_name
                            }}</strong>?
                    </p>
                    <div>
                        <label for="deny-reason"
                            class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Reason (optional)
                        </label>
                        <textarea id="deny-reason" v-model="denyReason" rows="3"
                            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                            placeholder="Provide a reason for denying this request..."></textarea>
                    </div>
                </div>
                <div class="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
                    <button @click="closeDenyModal"
                        class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors">
                        Cancel
                    </button>
                    <button @click="confirmDenyRequest" :disabled="processingRequest !== null"
                        class="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                        {{ processingRequest ? 'Denying...' : 'Deny Request' }}
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { formatDistanceToNow, format, parseISO, isSameDay } from 'date-fns'
import { useAdminDashboard } from '@/composables/useAdminDashboard'
import type { ActivityFeedItem } from '@/types'

// Composables
const { activities, loading, fetchActivities, approveHolidayRequest, denyHolidayRequest } = useAdminDashboard()

// State
const processingRequest = ref<string | null>(null)
const showDenyModalFlag = ref(false)
const selectedActivity = ref<ActivityFeedItem | null>(null)
const denyReason = ref('')

// Emits
const emit = defineEmits<{
    'activities-updated': []
}>()

// Methods
async function refreshActivities() {
    await fetchActivities()
    emit('activities-updated')
}

async function approveRequest(requestId: string) {
    processingRequest.value = requestId
    try {
        await approveHolidayRequest(requestId)
        emit('activities-updated')
    } catch (error) {
        console.error('Failed to approve request:', error)
    } finally {
        processingRequest.value = null
    }
}

function showDenyModal(activity: ActivityFeedItem) {
    selectedActivity.value = activity
    showDenyModalFlag.value = true
    denyReason.value = ''
}

function closeDenyModal() {
    showDenyModalFlag.value = false
    selectedActivity.value = null
    denyReason.value = ''
}

async function confirmDenyRequest() {
    if (!selectedActivity.value?.holiday_request_id) return

    processingRequest.value = selectedActivity.value.holiday_request_id
    try {
        await denyHolidayRequest(selectedActivity.value.holiday_request_id, denyReason.value)
        closeDenyModal()
        emit('activities-updated')
    } catch (error) {
        console.error('Failed to deny request:', error)
    } finally {
        processingRequest.value = null
    }
}

// Helper functions
function getActivityTypeClasses(type: string): string {
    switch (type) {
        case 'holiday_request':
            return 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
        case 'time_entry':
            return 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
        default:
            return 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
    }
}

function formatRelativeTime(date: string): string {
    return formatDistanceToNow(new Date(date), { addSuffix: true })
}

function formatDateRange(startDate: string, endDate: string): string {
    const start = parseISO(startDate)
    const end = parseISO(endDate)

    if (isSameDay(start, end)) {
        return format(start, 'dd.MM.yyyy')
    } else {
        return `${format(start, 'dd.MM')} - ${format(end, 'dd.MM.yyyy')}`
    }
}

function getStatusBadgeClasses(status: string): string {
    switch (status) {
        case 'approved':
            return 'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
        case 'denied':
            return 'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'
        case 'pending':
            return 'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200'
        default:
            return 'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
    }
}

// Lifecycle
onMounted(async () => {
    await fetchActivities()
})
</script>