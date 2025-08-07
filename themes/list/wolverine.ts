import { createTheme } from "../types";

const tokens = {
  black: "hsla(0, 0%, 0%, 1)", // General black color
  white: "hsla(0, 0%, 100%, 1)", // General white color
  semantic: {
    red: {
      c100: "hsla(0, 86%, 69%, 1)", // Error text
      c200: "hsla(0, 73%, 60%, 1)", // Video player scraping error
      c300: "hsla(0, 66%, 56%, 1)", // Danger button
      c400: "hsla(0, 55%, 45%, 1)", // Not currently used
    },
    green: {
      c100: "hsla(125, 60%, 60%, 1)", // Success text
      c200: "hsla(125, 49%, 48%, 1)", // Video player scraping success
      c300: "hsla(125, 54%, 42%, 1)", // Not currently used
      c400: "hsla(125, 54%, 31%, 1)", // Not currently used
    },
    silver: {
      c100: "hsla(0, 0%, 87%, 1)", // Primary button hover
      c200: "hsla(206, 33%, 78%, 1)", // Not currently used
      c300: "hsla(206, 19%, 62%, 1)", // Secondary button text
      c400: "hsla(206, 18%, 46%, 1)", // Main text in video player context
    },
    yellow: {
      c100: "hsla(56, 100%, 80%, 1)", // Best onboarding highlight
      c200: "hsla(56, 96%, 68%, 1)", // Dropdown highlight hover
      c300: "hsla(56, 55%, 56%, 1)", // Not currently used
      c400: "hsla(56, 38%, 48%, 1)", // Dropdown highlight
    },
    rose: {
      c100: "hsla(348, 68%, 55%, 1)", // Authentication error text
      c200: "hsla(348, 55%, 35%, 1)", // Danger button hover
      c300: "hsla(348, 57%, 32%, 1)", // Danger button
      c400: "hsla(348, 60%, 27%, 1)", // Not currently used
    },
  },
  blue: {
    c50: "hsla(220, 80%, 80%, 1)",
    c100: "hsla(220, 60%, 65%, 1)",
    c200: "hsla(220, 50%, 50%, 1)",
    c300: "hsla(220, 55%, 40%, 1)",
    c400: "hsla(220, 60%, 30%, 1)",
    c500: "hsla(220, 55%, 22%, 1)",
    c600: "hsla(220, 50%, 18%, 1)",
    c700: "hsla(220, 45%, 14%, 1)",
    c800: "hsla(220, 35%, 10%, 1)",
    c900: "hsla(220, 30%, 7%, 1)",
  },
  purple: {
    c50: "hsla(48, 100%, 75%, 1)",
    c100: "hsla(48, 95%, 65%, 1)",
    c200: "hsla(46, 90%, 55%, 1)",
    c300: "hsla(44, 85%, 45%, 1)",
    c400: "hsla(42, 80%, 35%, 1)",
    c500: "hsla(40, 75%, 28%, 1)",
    c600: "hsla(38, 70%, 22%, 1)",
    c700: "hsla(36, 60%, 18%, 1)",
    c800: "hsla(34, 50%, 14%, 1)",
    c900: "hsla(32, 40%, 10%, 1)",
  },
  ash: {
    c50: "hsla(210, 11%, 55%, 1)", // Authentication copy text hover, progress background, progress preloaded
    c100: "hsla(210, 15%, 42%, 1)", // Secondary text, badge text, video player scraping no result
    c200: "hsla(210, 17%, 33%, 1)", // Media card bar color, video player button background
    c300: "hsla(210, 29%, 24%, 1)", // Cancel button hover, utils divider
    c400: "hsla(210, 35%, 19%, 1)", // Card border and background, dropdown border, onboarding bar, edit badge hover, sidebar type
    c500: "hsla(210, 35%, 17%, 1)", // Toggle disabled, cancel button, modal background, search hover background, media card shadow, settings save bar, errors card, about circle, edit badge background, video player button focus, video player flag background, video player input background, video player button over input hover
    c600: "hsla(210, 32%, 14%, 1)", // Background secondary, dropdown alt background, dropdown border, onboarding card border
    c700: "hsla(210, 35%, 12%, 1)", // Secondary button, media card badge, onboarding card hover, video player context card border, video player context buttons list, video player close hover
    c800: "hsla(210, 33%, 9%, 1)", // Background main, settings sidebar badge, errors border
    c900: "hsla(210, 25%, 7%, 1)", // Media card hover shadow, settings sidebar active link, video player context background
  },
  shade: {
    c25: "hsla(240, 33%, 53%, 1)", // Media card hover accent
    c50: "hsla(240, 17%, 48%, 1)", // Theme secondary color, text, dimmed text
    c100: "hsla(240, 20%, 40%, 1)", // Search placeholder and icon, dropdown secondary text
    c200: "hsla(240, 20%, 31%, 1)", // Pill background hover, onboarding divider
    c300: "hsla(240, 22%, 25%, 1)", // Pill background, authentication border, onboarding card
    c400: "hsla(240, 25%, 21%, 1)", // Background secondary hover, dropdown border, onboarding bar, onboarding divider
    c500: "hsla(240, 26%, 16%, 1)", // Search background, search focus, dropdown hover background, dropdown content background, authentication input background hover, authentication word background
    c600: "hsla(240, 31%, 12%, 1)", // Modal background, dropdown background, onboarding card border
    c700: "hsla(240, 29%, 10%, 1)", // Dropdown alt background
    c800: "hsla(240, 30%, 8%, 1)", // Background main, settings save bar, onboarding card
    c900: "hsla(240, 29%, 5%, 1)", // Media card hover shadow
  },
}

export default createTheme({
  name: "wolverine",
  extend: {
    colors: {
      themePreview: {
        primary: tokens.blue.c200,
        secondary: tokens.purple.c300,
        ghost: tokens.white,
      },

      // Branding
      pill: {
        background: tokens.shade.c300,
        backgroundHover: tokens.shade.c200,
        highlight: tokens.blue.c200,

        activeBackground: tokens.shade.c300,
      },

      // meta data for the theme itself
      global: {
        accentA: tokens.blue.c200,
        accentB: tokens.blue.c300,
      },

      // light bar
      lightBar: {
        light: tokens.blue.c400,
      },

      // Buttons
      buttons: {
        toggle: tokens.purple.c300,
        toggleDisabled: tokens.ash.c500,
        danger: tokens.semantic.rose.c300,
        dangerHover: tokens.semantic.rose.c200,

        secondary: tokens.ash.c700,
        secondaryText: tokens.semantic.silver.c300,
        secondaryHover: tokens.ash.c700,
        primary: tokens.white,
        primaryText: tokens.black,
        primaryHover: tokens.semantic.silver.c100,
        purple: tokens.purple.c500,
        purpleHover: tokens.purple.c400,
        cancel: tokens.ash.c500,
        cancelHover: tokens.ash.c300,
      },

      // only used for body colors/textures
      background: {
        main: tokens.shade.c900,
        secondary: tokens.shade.c600,
        secondaryHover: tokens.shade.c400,
        accentA: tokens.purple.c500,
        accentB: tokens.blue.c500,
      },

      // Modals
      modal: {
        background: tokens.shade.c800,
      },

      // typography
      type: {
        logo: tokens.purple.c100,
        emphasis: tokens.white,
        text: tokens.shade.c50,
        dimmed: tokens.shade.c50,
        divider: tokens.ash.c500,
        secondary: tokens.ash.c100,
        danger: tokens.semantic.red.c100,
        success: tokens.semantic.green.c100,
        link: tokens.purple.c100,
        linkHover: tokens.purple.c50,
      },

      // search bar
      search: {
        background: tokens.shade.c500,
        hoverBackground: tokens.shade.c600,
        focused: tokens.shade.c400,
        placeholder: tokens.shade.c100,
        icon: tokens.shade.c100,
        text: tokens.white,
      },

      // media cards
      mediaCard: {
        hoverBackground: tokens.shade.c600,
        hoverAccent: tokens.shade.c25,
        hoverShadow: tokens.shade.c900,
        shadow: tokens.shade.c700,
        barColor: tokens.ash.c200,
        barFillColor: tokens.purple.c100,
        badge: tokens.shade.c700,
        badgeText: tokens.ash.c100,
      },

      // Large card
      largeCard: {
        background: tokens.shade.c600,
        icon: tokens.purple.c400,
      },

      // Dropdown
      dropdown: {
        background: tokens.shade.c600,
        altBackground: tokens.shade.c700,
        hoverBackground: tokens.shade.c500,
        highlight: tokens.semantic.yellow.c400,
        highlightHover: tokens.semantic.yellow.c200,
        text: tokens.shade.c50,
        secondary: tokens.shade.c100,
        border: tokens.shade.c400,
        contentBackground: tokens.shade.c500,
      },

      // Passphrase
      authentication: {
        border: tokens.shade.c300,
        inputBg: tokens.shade.c600,
        inputBgHover: tokens.shade.c500,
        wordBackground: tokens.shade.c500,
        copyText: tokens.shade.c100,
        copyTextHover: tokens.ash.c50,
        errorText: tokens.semantic.rose.c100,
      },

      // Settings page
      settings: {
        sidebar: {
          activeLink: tokens.shade.c600,
          badge: tokens.shade.c900,

          type: {
            secondary: tokens.shade.c200,
            inactive: tokens.shade.c50,
            icon: tokens.shade.c50,
            iconActivated: tokens.purple.c200,
            activated: tokens.purple.c50,
          },
        },

        card: {
          border: tokens.shade.c400,
          background: tokens.shade.c400,
          altBackground: tokens.shade.c400,
        },

        saveBar: {
          background: tokens.shade.c800,
        },
      },

      // Utilities
      utils: {
        divider: tokens.ash.c300,
      },

      // Onboarding
      onboarding: {
        bar: tokens.shade.c400,
        barFilled: tokens.purple.c300,
        divider: tokens.shade.c200,
        card: tokens.shade.c800,
        cardHover: tokens.shade.c700,
        border: tokens.shade.c600,
        good: tokens.purple.c100,
        best: tokens.semantic.yellow.c100,
        link: tokens.purple.c100,
      },

      // Error page
      errors: {
        card: tokens.shade.c800,
        border: tokens.ash.c500,

        type: {
          secondary: tokens.ash.c100,
        },
      },

      // About page
      about: {
        circle: tokens.ash.c500,
        circleText: tokens.ash.c50,
      },

      // About page
      editBadge: {
        bg: tokens.ash.c500,
        bgHover: tokens.ash.c400,
        text: tokens.ash.c50,
      },

      progress: {
        background: tokens.ash.c50,
        preloaded: tokens.ash.c50,
        filled: tokens.purple.c200,
      },

      // video player
      video: {
        buttonBackground: tokens.ash.c200,

        autoPlay: {
          background: tokens.ash.c700,
          hover: tokens.ash.c500,
        },

        scraping: {
          card: tokens.shade.c700,
          error: tokens.semantic.red.c200,
          success: tokens.semantic.green.c200,
          loading: tokens.purple.c200,
          noresult: tokens.ash.c100,
        },

        audio: {
          set: tokens.purple.c200,
        },

        context: {
          background: tokens.ash.c900,
          light: tokens.shade.c50,
          border: tokens.ash.c600,
          hoverColor: tokens.ash.c600,
          buttonFocus: tokens.ash.c500,
          flagBg: tokens.ash.c500,
          inputBg: tokens.ash.c600,
          buttonOverInputHover: tokens.ash.c500,
          inputPlaceholder: tokens.ash.c200,
          cardBorder: tokens.ash.c700,
          slider: tokens.ash.c50,
          sliderFilled: tokens.purple.c200,
          error: tokens.semantic.red.c200,

          buttons: {
            list: tokens.ash.c700,
            active: tokens.ash.c900,
          },

          closeHover: tokens.ash.c800,

          type: {
            main: tokens.semantic.silver.c400,
            secondary: tokens.ash.c200,
            accent: tokens.purple.c200,
          },
        },
      },
    },
  },
})
