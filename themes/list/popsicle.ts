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
    c50: "hsla(200, 100%, 85%, 1)",     // soft cyan
    c100: "hsla(200, 80%, 70%, 1)",     // brighter cyan
    c200: "hsla(200, 70%, 60%, 1)",     // theme primary: cyan-blue
    c300: "hsla(200, 60%, 45%, 1)",     // accent B: darker cyan-blue
    c400: "hsla(200, 50%, 35%, 1)",     // light bar
    c500: "hsla(200, 45%, 25%, 1)",     // accent B background
    c600: "hsla(200, 42%, 20%, 1)",
    c700: "hsla(200, 40%, 16%, 1)",
    c800: "hsla(200, 35%, 10%, 1)",
    c900: "hsla(200, 30%, 7%, 1)",
  },
  purple: {
    c50: "hsla(280, 100%, 85%, 1)",     // lavender for link hover
    c100: "hsla(300, 100%, 75%, 1)",    // pink-violet logo/link
    c200: "hsla(300, 80%, 65%, 1)",     // pinkish progress/loader
    c300: "hsla(310, 65%, 55%, 1)",     // toggle/onboarding bar
    c400: "hsla(320, 60%, 47%, 1)",     // card icon
    c500: "hsla(325, 50%, 36%, 1)",     // accent A background
    c600: "hsla(325, 50%, 28%, 1)",
    c700: "hsla(325, 50%, 20%, 1)",
    c800: "hsla(325, 45%, 14%, 1)",
    c900: "hsla(325, 40%, 9%, 1)",
  },
  ash: {
    c50: "hsla(60, 8%, 60%, 1)",        // neutral gold-tinted gray
    c100: "hsla(60, 10%, 45%, 1)",      // warm muted gray
    c200: "hsla(60, 11%, 35%, 1)",      // sidebar border
    c300: "hsla(60, 12%, 28%, 1)",      // card divider
    c400: "hsla(60, 14%, 22%, 1)",      // bg + hover accents
    c500: "hsla(200, 45%, 25%, 1)",     // accent B background
    c600: "hsla(200, 42%, 20%, 1)",
    c700: "hsla(200, 40%, 16%, 1)",
    c800: "hsla(200, 35%, 10%, 1)",
    c900: "hsla(200, 30%, 7%, 1)",        // deepest shade, shadows
  },
  shade: {
    c25: "hsla(0, 80%, 70%, 1)",        // red hover accent
    c50: "hsla(30, 100%, 72%, 1)",      // orange for main text
    c100: "hsla(30, 80%, 60%, 1)",      // placeholder/icon
    c200: "hsla(200, 60%, 45%, 1)",     // hover bg
    c300: "hsla(30, 60%, 35%, 1)",      // pill background, auth border
    c400: "hsla(200, 50%, 35%, 1)",     // light bar
    c500: "hsla(30, 50%, 21%, 1)",      // dropdown background
    c600: "hsla(30, 45%, 16%, 1)",      // modal/dropdown background
    c700: "hsla(30, 40%, 12%, 1)",      // alt bg
    c800: "hsla(30, 38%, 9%, 1)",       // main bg
    c900: "hsla(30, 35%, 6%, 1)",       // hover shadow
  },
}

export default createTheme({
  name: "popsicle",
  extend: {
    colors: {
      themePreview: {
        primary: tokens.blue.c200,
        secondary: tokens.shade.c50,
        ghost: tokens.purple.c400,
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
        hoverBackground: tokens.purple.c900,
        hoverAccent: tokens.blue.c100,
        hoverShadow: tokens.shade.c900,
        shadow: tokens.purple.c700,
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
