<template>
  <div class="min-h-[60vh] flex items-center justify-center">
    <div class="text-center space-y-6">
      <h1 class="text-6xl font-bold text-gray-900 dark:text-white">404</h1>
      <h2 class="text-2xl font-semibold text-gray-700 dark:text-gray-300">
        Oops! Page Not Found
      </h2>
      <p class="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
        The page you're looking for doesn't exist or has been moved. Let's get you back on track!
      </p>
      <div class="mt-8">
        <router-link
          to="/"
          class="px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          Go Home
        </router-link>
      </div>
    </div>
  </div>
</template> 