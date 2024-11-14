/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
      remotePatterns: [
        {
          protocol: 'https',
          hostname: 'cluxpxiwehwgkivkoktm.supabase.co',
          port: '',
          pathname: '/storage/v1/object/public/**',
        },
        {
          protocol: 'https',
          hostname: 'cluxpxiwehwgkivkoktm.supabase.co',
          port: '',
          pathname: '/storage/v1/object/public/announcements_images/**',
        },
        {
          protocol: 'https',
          hostname: 'cluxpxiwehwgkivkoktm.supabase.co',
          port: '',
          pathname: '/storage/v1/object/public/events_images/**',
        },
      ],
    },
  };
  
  export default nextConfig;