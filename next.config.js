/** @type {import('next').NextConfig} */
module.exports = {
  experimental: { serverComponentsExternalPackages: ["pdf-parse"] },
  async redirects() {
    return [
      { source: "/decks", destination: "/library", permanent: false },
      { source: "/decks/:id", destination: "/library/:id", permanent: false },
      { source: "/decks/:id/study", destination: "/study/:id", permanent: false },
    ];
  },
};
