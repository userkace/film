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
    c50: "hsla(113, 31%, 64%, 1)",
    c100: "hsla(116, 22%, 51%, 1)",
    c200: "hsla(121, 23%, 40%, 1)",
    c300: "hsla(123, 27%, 32%, 1)",
    c400: "hsla(123, 28%, 25%, 1)",
    c500: "hsla(124, 30%, 20%, 1)",
    c600: "hsla(128, 32%, 15%, 1)",
    c700: "hsla(126, 32%, 12%, 1)",
    c800: "hsla(124, 32%, 9%, 1)",
    c900: "hsla(120, 33%, 6%, 1)"
  },
  purple: {
    c50: "hsla(116, 24%, 53%, 1)",
    c100: "hsla(115, 26%, 40%, 1)",
    c200: "hsla(119, 28%, 33%, 1)",
    c300: "hsla(119, 31%, 26%, 1)",
    c400: "hsla(120, 32%, 22%, 1)",
    c500: "hsla(122, 34%, 18%, 1)",
    c600: "hsla(118, 37%, 14%, 1)",
    c700: "hsla(120, 37%, 11%, 1)",
    c800: "hsla(120, 38%, 8%, 1)",
    c900: "hsla(120, 41%, 5%, 1)"
  },
  ash: {
    c50: "hsla(144, 11%, 47%, 1)",
    c100: "hsla(145, 12%, 38%, 1)",
    c200: "hsla(146, 13%, 31%, 1)",
    c300: "hsla(147, 15%, 24%, 1)",
    c400: "hsla(142, 16%, 20%, 1)",
    c500: "hsla(146, 18%, 15%, 1)",
    c600: "hsla(145, 20%, 12%, 1)",
    c700: "hsla(140, 19%, 9%, 1)",
    c800: "hsla(130, 18%, 7%, 1)",
    c900: "hsla(120, 18%, 4%, 1)"
  },
  shade: {
    c25: "hsla(120, 27%, 40%, 1)",
    c50: "hsla(120, 26%, 34%, 1)",
    c100: "hsla(120, 25%, 28%, 1)",
    c200: "hsla(120, 25%, 23%, 1)",
    c300: "hsla(120, 26%, 19%, 1)",
    c400: "hsla(120, 27%, 15%, 1)",
    c500: "hsla(120, 28%, 11%, 1)",
    c600: "hsla(120, 29%, 9%, 1)",
    c700: "hsla(120, 29%, 7%, 1)",
    c800: "hsla(120, 39%, 5%, 1)",
    c900: "hsla(120, 33%, 2%, 1)"
  },
}

export default createTheme({
  name: "forest",
  extend: {
    colors: {
      themePreview: {
        primary: tokens.blue.c200,
        secondary: tokens.shade.c50,
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
        light: tokens.blue.c800,
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
