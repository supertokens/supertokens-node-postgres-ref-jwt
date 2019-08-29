/**
 * Copyright (c) 2017-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

// See https://docusaurus.io/docs/site-config for all the possible
// site configuration options.

// List of projects/orgs using your project for the users page.
// const users = [
//   {
//     caption: 'User1',
//     // You will need to prepend the image path with your baseUrl
//     // if it is not '/', like: '/test-site/img/image.jpg'.
//     image: '/img/undraw_open_source.svg',
//     infoLink: 'https://www.facebook.com',
//     pinned: true,
//   },
// ];

const siteConfig = {
  headerIcon: "img/superTokens.png",
  title: 'SuperTokens', // Title for your website.
  tagline: 'Best session management',
  url: 'https://supertokens.github.io/supertokens-node-postgres-ref-jwt/', // Your website URL
  baseUrl: '/supertokens-node-postgres-ref-jwt/', // Base URL for your project */
  // For github.io type URLs, you would set the url and baseUrl like:
  //   url: 'https://facebook.github.io',
  //   baseUrl: '/test-site/',
  // Used for publishing and more
  projectName: 'supertokens-node-postgres-ref-jwt',
  organizationName: 'supertokens',
  // For top-level user or org sites, the organization is still the same.
  // e.g., for the https://JoelMarcey.github.io site, it would be set like...
  //   organizationName: 'JoelMarcey'

  // For no header links in the top nav bar -> headerLinks: [],
  headerLinks: [
    { doc: "introduction/what-and-why", label: "Docs" },
    { href: "https://supertokens.io/discord", label: "Discord" },
    { href: "https://supertokens.io/blog/the-best-way-to-securely-manage-user-sessions", label: "Blog" }
  ],
  disableHeaderTitle: false,
  docsSideNavCollapsible: true,

  // If you have users set above, you add it here:
  //   users,

  /* path to images for header/footer */
  // headerIcon: 'img/favicon.ico',
  //   footerIcon: 'img/favicon.ico',
  favicon: 'img/favicon.ico',

  /* Colors for website */
  colors: {
    primaryColor: '#222222',
    secondaryColor: '#333333',
  },

  /* Custom fonts for website */
  /*
  fonts: {
    myFont: [
      "Times New Roman",
      "Serif"
    ],
    myOtherFont: [
      "-apple-system",
      "system-ui"
    ]
  },
  */

  // This copyright info is used in /core/Footer.js and blog RSS/Atom feeds.
  //   copyright: `Copyright © ${new Date().getFullYear()} Your Name or Your Company Name`,

  // Add custom scripts here that would be placed in <script> tags.
  scripts: ['https://buttons.github.io/buttons.js', "https://www.googletagmanager.com/gtag/js?id=UA-143540696-1", "/supertokens-node-postgres-ref-jwt/scripts/homeButtonListener.js", "/supertokens-node-postgres-ref-jwt/scripts/utils.js"],

  // On page navigation for the current documentation page.
  //   onPageNav: 'separate',
  // No .html extensions for paths.
  cleanUrl: true,
  scrollToTop: true,
  scrollToTopOptions: {
    backgroundColor: "#999999",
    textColor: "#222222"
  }

  // Open Graph and Twitter card images.
  //   ogImage: 'img/undraw_online.svg',
  //   twitterImage: 'img/undraw_tweetstorm.svg',

  // Show documentation's last contributor's name.
  // enableUpdateBy: true,

  // Show documentation's last update time.
  // enableUpdateTime: true,

  // You may provide arbitrary config keys to be used as needed by your
  // template. For example, if you need your repo's URL...
  //   repoUrl: 'https://github.com/facebook/test-site',
};

module.exports = siteConfig;
