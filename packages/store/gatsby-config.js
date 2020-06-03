require('dotenv').config();

module.exports = {
  siteMetadata: {
    siteName: 'Woodlike Ocean Store',
    siteUrl: 'https://woodlikeocean.com',
  },
  plugins: [
    'gatsby-plugin-typescript',
    'gatsby-transformer-json',
    {
      resolve: 'gatsby-source-shopify',
      options: {
        accessToken: process.env.ACCESS_TOKEN,
        apiVersion: '2020-01',
        shopName: process.env.SHOP_NAME,
        verbose: true,
      },
    },
    {
      resolve: 'gatsby-source-filesystem',
      options: {
        path: './src/data/',
      },
    },
  ],
};
