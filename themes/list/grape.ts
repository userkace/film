import { createTheme } from "../types";

const tokens = {
  black: "#000000", // General black color
  white: "#FFFFFF", // General white color
  semantic: {
    red: {
      c100: "#F46E6E", // Error text
      c200: "#E44F4F", // Video player scraping error
      c300: "#D74747", // Danger button
      c400: "#B43434", // Not currently used
    },
    green: {
      c100: "#60D26A", // Success text
      c200: "#40B44B", // Video player scraping success
      c300: "#31A33C", // Not currently used
      c400: "#237A2B", // Not currently used
    },
    silver: {
      c100: "#DEDEDE", // Primary button hover
      c200: "#B6CAD7", // Not currently used
      c300: "#8EA3B0", // Secondary button text
      c400: "#617A8A", // Main text in video player context
    },
    yellow: {
      c100: "#FFF599", // Best onboarding highlight
      c200: "#FCEC61", // Dropdown highlight hover
      c300: "#D8C947", // Not currently used
      c400: "#AFA349", // Dropdown highlight
    },
    rose: {
      c100: "#DB3D61", // Authentication error text
      c200: "#8A293B", // Danger button hover
      c300: "#812435", // Danger button
      c400: "#701B2B", // Not currently used
    },
  },
  blue: {
    c50: "#c2a6ff",
    c100: "#a182ff",
    c200: "#825eff",
    c300: "#6541e6",
    c400: "#4c31cc",
    c500: "#3a24a3",
    c600: "#2f1c80",
    c700: "#241561",
    c800: "#180e42",
    c900: "#100a2c",
  },
  purple: {
    c50: "#f0b3ff",
    c100: "#e080ff",
    c200: "#cc4dff",
    c300: "#b320f0",
    c400: "#9917cc",
    c500: "#701199",
    c600: "#530c73",
    c700: "#3b0852",
    c800: "#280638",
    c900: "#180425",
  },
  ash: {
    c50: "#9b8fb1",
    c100: "#7e7195",
    c200: "#62577a",
    c300: "#4a4061",
    c400: "#3b334e",
    c500: "#30293f",
    c600: "#251f31",
    c700: "#1c1726",
    c800: "#15101b",
    c900: "#0f0a12",
  },
  shade: {
    c25: "#8a4de0",
    c50: "#7555a8",
    c100: "#604585",
    c200: "#4b3666",
    c300: "#3d2b50",
    c400: "#312240",
    c500: "#251931",
    c600: "#1c1325",
    c700: "#160f1d",
    c800: "#110b16",
    c900: "#0c0610",
  }
}

export default createTheme({
  name: "grape",
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
