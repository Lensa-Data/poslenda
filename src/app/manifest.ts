import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Sensory Artisan POS',
    short_name: 'POS',
    description: 'Boutique Digital Menu and Order System',
    start_url: '/',
    display: 'standalone',
    background_color: '#fcf9f4',
    theme_color: '#5a5f36',
    icons: [
      {
        src: '/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
