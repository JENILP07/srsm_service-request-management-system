/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    images: {
        domains: ['lovable.dev'], // Keeping this just in case, though likely unused now
    },
    // We use the app directory
    experimental: {

    },
};

export default nextConfig;
