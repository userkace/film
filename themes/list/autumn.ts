import { createTheme } from "../types";

const tokens = {
  black: "hsla(0, 0%, 0%, 1)", // General black color
  white: "hsla(0, 0%, 100%, 1)", // General white color
  semantic: {
    red: {
      c100: "hsla(15, 40%, 65%, 1)", // Error text - washed out autumn red
      c200: "hsla(15, 35%, 55%, 1)", // Video player scraping error - muted red-orange
      c300: "hsla(15, 30%, 45%, 1)", // Danger button - deeper autumn red
      c400: "hsla(15, 25%, 35%, 1)", // Not currently used - dark autumn red
    },
    green: {
      c100: "hsla(60, 30%, 55%, 1)", // Success text - washed out autumn green
      c200: "hsla(60, 25%, 45%, 1)", // Video player scraping success - muted yellow-green
      c300: "hsla(60, 20%, 35%, 1)", // Not currently used - deeper autumn green
      c400: "hsla(60, 15%, 25%, 1)", // Not currently used - dark autumn green
    },
    silver: {
      c100: "hsla(45, 20%, 85%, 1)", // Primary button hover - washed out yellow
      c200: "hsla(45, 15%, 75%, 1)", // Not currently used - muted yellow
      c300: "hsla(45, 10%, 60%, 1)", // Secondary button text - subtle yellow tint
      c400: "hsla(45, 8%, 45%, 1)", // Main text in video player context - warm gray
    },
    yellow: {
      c100: "hsla(45, 60%, 75%, 1)", // Best onboarding highlight - washed out golden
      c200: "hsla(45, 50%, 65%, 1)", // Dropdown highlight hover - muted golden
      c300: "hsla(45, 40%, 55%, 1)", // Not currently used - deeper golden
      c400: "hsla(45, 30%, 45%, 1)", // Dropdown highlight - dark golden
    },
    rose: {
      c100: "hsla(20, 35%, 60%, 1)", // Authentication error text - washed out autumn rose
      c200: "hsla(20, 30%, 50%, 1)", // Danger button hover - muted orange-red
      c300: "hsla(20, 25%, 40%, 1)", // Danger button - deeper autumn rose
      c400: "hsla(20, 20%, 30%, 1)", // Not currently used - dark autumn rose
    },
  },
  blue: {
    c50: "hsla(25, 100%, 85%, 1)",     // soft orange
    c100: "hsla(25, 80%, 70%, 1)",     // brighter orange
    c200: "hsla(25, 70%, 60%, 1)",     // theme primary: warm orange
    c300: "hsla(25, 60%, 45%, 1)",     // accent B: darker orange
    c400: "hsla(25, 50%, 35%, 1)",     // light bar
    c500: "hsla(25, 45%, 25%, 1)",     // accent B background
    c600: "hsla(25, 42%, 20%, 1)",
    c700: "hsla(25, 40%, 16%, 1)",
    c800: "hsla(25, 35%, 10%, 1)",
    c900: "hsla(25, 30%, 7%, 1)",
  },
  purple: {
    c50: "hsla(15, 100%, 75%, 1)",     // soft red-orange for link hover - darker
    c100: "hsla(15, 100%, 60%, 1)",    // bright red-orange logo/link - much darker
    c200: "hsla(15, 90%, 50%, 1)",     // red-orange progress/loader - more saturated
    c300: "hsla(15, 80%, 45%, 1)",    // toggle/onboarding bar - more saturated
    c400: "hsla(15, 75%, 40%, 1)",     // card icon - more saturated
    c500: "hsla(15, 70%, 32%, 1)",     // accent A background - more saturated
    c600: "hsla(15, 65%, 25%, 1)",
    c700: "hsla(15, 60%, 18%, 1)",
    c800: "hsla(15, 55%, 12%, 1)",
    c900: "hsla(15, 50%, 8%, 1)",
  },
  ash: {
    c50: "hsla(45, 39%, 60%, 1)",        // subtle yellow-tinted gray
    c100: "hsla(45, 24%, 55%, 1)",      // warm yellow-gray
    c200: "hsla(45, 10%, 35%, 1)",      // sidebar border - yellow tint
    c300: "hsla(45, 8%, 28%, 1)",       // card divider - yellow tint
    c400: "hsla(45, 6%, 22%, 1)",       // bg + hover accents - yellow tint
    c500: "hsla(25, 45%, 25%, 1)",      // accent B background
    c600: "hsla(25, 42%, 20%, 1)",
    c700: "hsla(25, 40%, 16%, 1)",
    c800: "hsla(25, 35%, 10%, 1)",
    c900: "hsla(25, 30%, 7%, 1)",       // deepest shade, shadows
  },
  shade: {
    c25: "hsla(24, 80%, 70%, 1)",        // red hover accent
    c50: "hsla(25, 100%, 72%, 1)",      // rich pumpkin for main text
    c100: "hsla(25, 80%, 60%, 1)",      // placeholder/icon
    c200: "hsla(25, 60%, 45%, 1)",      // hover bg
    c300: "hsla(25, 60%, 35%, 1)",      // pill background, auth border
    c400: "hsla(25, 50%, 21%, 1)",      // light bar
    c500: "hsla(35, 25%, 22%, 1)",      // dropdown background - subtle yellow tint
    c600: "hsla(45, 20%, 16%, 1)",      // modal/dropdown background - washed out yellow
    c700: "hsla(60, 15%, 12%, 1)",      // alt bg - subtle green tint
    c800: "hsla(25, 38%, 8%, 1)",       // main bg - lighter
    c900: "hsla(25, 35%, 5%, 1)",       // hover shadow - lighter
  },
}

export default createTheme({
  name: "autumn",
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
