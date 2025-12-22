/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '**',
            },
        ],
    },
    // Configuração para Vercel
    output: 'standalone',

    webpack: (config) => {
        // Configuração para react-pdf worker
        config.resolve.alias.canvas = false;
        config.resolve.alias.encoding = false;
        return config;
    },
};

module.exports = nextConfig;
