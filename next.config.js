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

    webpack: (config, { isServer }) => {
        // Configuração para react-pdf worker
        config.resolve.alias.canvas = false;
        config.resolve.alias.encoding = false;

        // Corrigir problema com fs no client side
        if (!isServer) {
            config.resolve.fallback = {
                ...config.resolve.fallback,
                fs: false,
            };
        }

        return config;
    },
};

module.exports = nextConfig;
