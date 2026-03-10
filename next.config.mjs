/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    transpilePackages: ["three", "@react-three/fiber", "@react-three/drei"],
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'lovable.dev',
            }
        ],
    },
    // We use the app directory
    experimental: {

    },
};

export default nextConfig;
