import { onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { setPageTitle } from '@/utils/title'

/**
 * Composable for managing dynamic page titles within components
 * @param dynamicTitle - Function that returns the dynamic title or a static title string
 */
export function usePageTitle(dynamicTitle: string | (() => string)) {
  const route = useRoute()
  let originalTitle: string | null = null
  
  // Function to update the title
  const updateTitle = () => {
    // Save original title from route meta if it exists
    if (!originalTitle && route.meta.title) {
      originalTitle = route.meta.title as string
    }
    
    // Set the dynamic title
    const title = typeof dynamicTitle === 'function' ? dynamicTitle() : dynamicTitle
    setPageTitle(title)
  }
  
  // Set title when component mounts
  onMounted(() => {
    updateTitle()
  })
  
  // Restore original title when component unmounts
  onUnmounted(() => {
    if (originalTitle) {
      setPageTitle(originalTitle)
    }
  })
  
  return {
    updateTitle
  }
} 