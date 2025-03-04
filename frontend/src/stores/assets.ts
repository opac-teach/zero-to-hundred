import { defineStore } from 'pinia';
import { ref } from 'vue';

interface Theme {
  backgroundColor: string;
  textColor: string;
}

interface Avatar {
  id: string;
  url: string;
  name: string;
}

interface Banner {
  id: string;
  url: string;
  name: string;
}

export const useAssetsStore = defineStore('assets', () => {
  // Predefined meme-themed avatars
  const avatars = ref<Avatar[]>([
    { id: 'doge', url: '/avatars/doge.png', name: 'Doge' },
    { id: 'pepe', url: '/avatars/pepe.png', name: 'Pepe' },
    { id: 'wojak', url: '/avatars/wojak.png', name: 'Wojak' },
    { id: 'stonks', url: '/avatars/stonks.png', name: 'Stonks' },
    { id: 'chad', url: '/avatars/chad.png', name: 'Chad' },
    { id: 'gigachad', url: '/avatars/gigachad.png', name: 'Gigachad' },
  ]);

  // Predefined crypto-themed banners
  const banners = ref<Banner[]>([
    { id: 'moon', url: '/banners/moon.png', name: 'To The Moon' },
    { id: 'hodl', url: '/banners/hodl.png', name: 'HODL' },
    { id: 'diamond', url: '/banners/diamond.png', name: 'Diamond Hands' },
    { id: 'rocket', url: '/banners/rocket.png', name: 'Rocket' },
    { id: 'lambo', url: '/banners/lambo.png', name: 'Lambo' },
  ]);

  // Predefined color themes
  const themes = ref<Theme[]>([
    { backgroundColor: '#1a1a1a', textColor: '#ffffff' }, // Dark
    { backgroundColor: '#ffffff', textColor: '#000000' }, // Light
    { backgroundColor: '#1e3a8a', textColor: '#ffffff' }, // Blue
    { backgroundColor: '#166534', textColor: '#ffffff' }, // Green
    { backgroundColor: '#7c2d12', textColor: '#ffffff' }, // Red
    { backgroundColor: '#4c1d95', textColor: '#ffffff' }, // Purple
  ]);

  // Username patterns
  const usernamePatterns = [
    'Crypto{animal}{number}',
    'Moon{object}{number}',
    'HODL{action}{number}',
    'Degen{adjective}{number}',
    'Chad{status}{number}',
  ];

  const animals = ['Doge', 'Pepe', 'Wojak', 'Chad', 'Giga', 'Ape', 'Whale'];
  const objects = ['Lambo', 'Rocket', 'Diamond', 'Moon', 'Mars', 'Saturn'];
  const actions = ['Trader', 'Holder', 'Flipper', 'Stacker', 'Farmer'];
  const adjectives = ['Chad', 'Giga', 'Mega', 'Ultra', 'Super'];
  const status = ['King', 'Lord', 'Master', 'Boss', 'Legend'];

  // Default meme coin logo
  const defaultMemecoinLogo = '/memecoins/default.svg';

  function generateRandomUsername(): string {
    const pattern = usernamePatterns[Math.floor(Math.random() * usernamePatterns.length)];
    const number = Math.floor(Math.random() * 1000);
    
    let username = pattern;
    
    if (pattern.includes('{animal}')) {
      username = username.replace('{animal}', animals[Math.floor(Math.random() * animals.length)]);
    }
    if (pattern.includes('{object}')) {
      username = username.replace('{object}', objects[Math.floor(Math.random() * objects.length)]);
    }
    if (pattern.includes('{action}')) {
      username = username.replace('{action}', actions[Math.floor(Math.random() * actions.length)]);
    }
    if (pattern.includes('{adjective}')) {
      username = username.replace('{adjective}', adjectives[Math.floor(Math.random() * adjectives.length)]);
    }
    if (pattern.includes('{status}')) {
      username = username.replace('{status}', status[Math.floor(Math.random() * status.length)]);
    }
    
    username = username.replace('{number}', number.toString());
    
    return username;
  }

  function getRandomAvatar(): Avatar {
    return avatars.value[Math.floor(Math.random() * avatars.value.length)];
  }

  function getRandomBanner(): Banner {
    return banners.value[Math.floor(Math.random() * banners.value.length)];
  }

  function getRandomTheme(): Theme {
    return themes.value[Math.floor(Math.random() * themes.value.length)];
  }

  return {
    avatars,
    banners,
    themes,
    usernamePatterns,
    animals,
    objects,
    actions,
    adjectives,
    status,
    defaultMemecoinLogo,
    generateRandomUsername,
    getRandomAvatar,
    getRandomBanner,
    getRandomTheme,
  };
}); 