import { ref } from 'vue'
import { useUserSettings } from './useUserSettings'

export interface GeneratedAvatar {
    id: string
    config: BeanHeadConfig
}

export interface BeanHeadConfig {
    mask?: boolean
    skin?: 'light' | 'yellow' | 'brown' | 'dark' | 'red' | 'black'
    body?: 'chest' | 'breasts'
    eye?: 'content-eyes' | 'dizzy-eyes' | 'happy-eyes' | 'heart-eyes' | 'left-twitch-eyes' | 'normal-eyes' | 'simple-eyes' | 'squint-eyes' | 'wink'
    withLashes?: boolean
    eyebrows?: 'none' | 'normal' | 'serious' | 'left-lowered' | 'angry' | 'concerned'
    mouth?: 'grin' | 'lips' | 'sad' | 'serious' | 'open' | 'tongue'
    lipColor?: 'red' | 'purple' | 'pink' | 'turquoise' | 'green'
    facialHair?: 'none' | 'stubble' | 'medium-beard'
    hair?: 'none' | 'afro' | 'balding' | 'bob' | 'bun' | 'buzz' | 'long' | 'pixie' | 'short'
    hairColor?: 'blonde' | 'orange' | 'black' | 'white' | 'brown' | 'blue' | 'pink'
    clothing?: 'none' | 'naked' | 'dress' | 'dress-shirt' | 'shirt' | 'tank-top' | 'v-neck'
    clothingColor?: 'white' | 'blue' | 'black' | 'green' | 'red'
    clothingGraphic?: 'none' | 'vue' | 'nuxt' | 'redwood' | 'react' | 'gatsby' | 'graphql'
    hat?: 'none' | 'beanie' | 'turban'
    hatColor?: 'white' | 'blue' | 'black' | 'green' | 'red'
    accessory?: 'none' | 'round-glasses' | 'tiny-glasses' | 'shades'
    faceMask?: boolean
    faceMaskColor?: 'white' | 'blue' | 'black' | 'green' | 'red'
}

export function useAvatarGenerator() {
    const { updateSettings } = useUserSettings()

    const loading = ref(false)
    const error = ref<string | null>(null)

    // Configuration options for random generation
    const configOptions: Record<keyof BeanHeadConfig, any[]> = {
        mask: [true, false],
        skin: ['light', 'yellow', 'brown', 'dark', 'red', 'black'],
        body: ['chest', 'breasts'],
        eye: ['content-eyes', 'dizzy-eyes', 'happy-eyes', 'heart-eyes', 'left-twitch-eyes', 'normal-eyes', 'simple-eyes', 'squint-eyes', 'wink'],
        withLashes: [true, false],
        eyebrows: ['none', 'normal', 'serious', 'left-lowered', 'angry', 'concerned'],
        mouth: ['grin', 'lips', 'sad', 'serious', 'open', 'tongue'],
        lipColor: ['red', 'purple', 'pink', 'turquoise', 'green'],
        facialHair: ['none', 'stubble', 'medium-beard'],
        hair: ['none', 'afro', 'balding', 'bob', 'bun', 'buzz', 'long', 'pixie', 'short'],
        hairColor: ['blonde', 'orange', 'black', 'white', 'brown', 'blue', 'pink'],
        clothing: ['none', 'naked', 'dress', 'dress-shirt', 'shirt', 'tank-top', 'v-neck'],
        clothingColor: ['white', 'blue', 'black', 'green', 'red'],
        clothingGraphic: ['none', 'vue', 'nuxt', 'redwood', 'react', 'gatsby', 'graphql'],
        hat: ['none', 'beanie', 'turban'],
        hatColor: ['white', 'blue', 'black', 'green', 'red'],
        accessory: ['none', 'round-glasses', 'tiny-glasses', 'shades'],
        faceMask: [false, true],
        faceMaskColor: ['white', 'blue', 'black', 'green', 'red']
    }

    /**
     * Generate a random configuration for a Beanhead avatar
     */
    function generateRandomConfig(): BeanHeadConfig {
        const config: BeanHeadConfig = {}

        // Generate random values for each property
        Object.keys(configOptions).forEach(key => {
            const options = configOptions[key as keyof BeanHeadConfig]
            const randomIndex = Math.floor(Math.random() * options.length)
            config[key as keyof BeanHeadConfig] = options[randomIndex]
        })

        return config
    }

    /**
     * Generate a single avatar with random configuration
     */
    function generateSingleAvatar(): GeneratedAvatar {
        const config = generateRandomConfig()
        const id = `avatar-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`

        return {
            id,
            config
        }
    }

    /**
     * Generate multiple avatars
     */
    async function generateAvatars(count: number = 12): Promise<GeneratedAvatar[]> {
        loading.value = true
        error.value = null

        try {
            const avatars: GeneratedAvatar[] = []

            for (let i = 0; i < count; i++) {
                avatars.push(generateSingleAvatar())
            }

            return avatars
        } catch (err) {
            error.value = err instanceof Error ? err.message : 'Failed to generate avatars'
            return []
        } finally {
            loading.value = false
        }
    }

    /**
     * Save a generated avatar as the user's avatar
     */
    async function saveGeneratedAvatar(avatar: GeneratedAvatar): Promise<void> {
        loading.value = true
        error.value = null

        try {
            // Save the avatar configuration as JSON
            const avatarData = JSON.stringify(avatar.config)

            // Update user settings with the new avatar configuration
            const result = await updateSettings({
                avatar_url: avatarData
            })

            if (!result.success) {
                throw new Error(result.error?.message || 'Failed to save avatar')
            }
        } catch (err) {
            error.value = err instanceof Error ? err.message : 'Failed to save avatar'
            throw err
        } finally {
            loading.value = false
        }
    }

    return {
        loading,
        error,
        generateAvatars,
        generateSingleAvatar,
        saveGeneratedAvatar,
        generateRandomConfig
    }
}