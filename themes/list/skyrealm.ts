import { createTheme } from "../types";

const tokens = {
  petal: {
    c50: "#fff0f5",
    c100: "#ffdde9",
    c200: "#ffbbd1",
    c300: "#ff99bb",
    c400: "#ff77a5",
    c500: "#e65f8f",
    c600: "#cc4779",
    c700: "#b33263",
    c800: "#991e4d",
    c900: "#800f3a",
  },
  dawn: {
    c25: "#f0e9f5",
    c50: "#e6d9f0",
    c100: "#d7c2e8",
    c200: "#c2a6dd",
    c300: "#ad8ad2",
    c400: "#9970c7",
    c500: "#8558b5",
    c600: "#6b4599",
    c700: "#52337d",
    c800: "#3a2361",
    c900: "#261547",
  },
  silk: {
    c50: "#fdfdfd",
    c100: "#faf8f9",
    c200: "#f5f0f3",
    c300: "#ede5ec",
    c400: "#e6dae5",
    c500: "#dfd0de",
    c600: "#d0b8d0",
    c700: "#c29fc2",
    c800: "#b386b3",
    c900: "#a66ea6",
  },
  nectar: {
    c50: "#fff9e6",
    c100: "#fff3cc",
    c200: "#ffe899",
    c300: "#ffdd66",
    c400: "#ffd233",
    c500: "#e6b800",
    c600: "#cca000",
    c700: "#b38900",
    c800: "#997100",
    c900: "#805a00",
  },
};

export default createTheme({
  name: "skyRealm",
  extend: {
    colors: {
      themePreview: {
        primary: tokens.petal.c200,
        secondary: tokens.dawn.c50,
      },

      pill: {
        background: tokens.dawn.c300,
        backgroundHover: tokens.dawn.c200,
        highlight: tokens.petal.c200,
        activeBackground: tokens.dawn.c300,
      },

      global: {
        accentA: tokens.petal.c200,
        accentB: tokens.petal.c300,
      },

      lightBar: {
        light: tokens.petal.c400,
      },

      buttons: {
        toggle: tokens.nectar.c300,
        toggleDisabled: tokens.silk.c500,

        secondary: tokens.silk.c700,
        secondaryHover: tokens.silk.c600,
        purple: tokens.dawn.c500,
        purpleHover: tokens.dawn.c400,
        cancel: tokens.silk.c500,
        cancelHover: tokens.silk.c300,
      },

      background: {
        main: tokens.dawn.c900,
        secondary: tokens.dawn.c600,
        secondaryHover: tokens.dawn.c400,
        accentA: tokens.nectar.c500,
        accentB: tokens.petal.c500,
      },

      modal: {
        background: tokens.dawn.c800,
      },

      type: {
        logo: tokens.nectar.c100,
        text: tokens.silk.c50,
        dimmed: tokens.silk.c50,
        divider: tokens.silk.c500,
        secondary: tokens.silk.c100,
        link: tokens.petal.c100,
        linkHover: tokens.petal.c50,
      },

      search: {
        background: tokens.dawn.c500,
        hoverBackground: tokens.dawn.c600,
        focused: tokens.dawn.c400,
        placeholder: tokens.dawn.c100,
        icon: tokens.dawn.c100,
      },

      mediaCard: {
        hoverBackground: tokens.dawn.c600,
        hoverAccent: tokens.dawn.c25,
        hoverShadow: tokens.dawn.c900,
        shadow: tokens.dawn.c700,
        barColor: tokens.silk.c200,
        barFillColor: tokens.petal.c100,
        badge: tokens.dawn.c700,
        badgeText: tokens.silk.c100,
      },

      largeCard: {
        background: tokens.dawn.c600,
        icon: tokens.petal.c400,
      },

      dropdown: {
        background: tokens.dawn.c600,
        altBackground: tokens.dawn.c700,
        hoverBackground: tokens.dawn.c500,
        text: tokens.silk.c50,
        secondary: tokens.dawn.c100,
        border: tokens.dawn.c400,
        contentBackground: tokens.dawn.c500,
      },

      authentication: {
        border: tokens.dawn.c300,
        inputBg: tokens.dawn.c600,
        inputBgHover: tokens.dawn.c500,
        wordBackground: tokens.dawn.c500,
        copyText: tokens.dawn.c100,
        copyTextHover: tokens.silk.c50,
      },

      settings: {
        sidebar: {
          activeLink: tokens.dawn.c600,
          badge: tokens.dawn.c900,
          type: {
            secondary: tokens.dawn.c200,
            inactive: tokens.dawn.c50,
            icon: tokens.dawn.c50,
            iconActivated: tokens.petal.c200,
            activated: tokens.petal.c50,
          },
        },
        card: {
          border: tokens.dawn.c400,
          background: tokens.dawn.c400,
          altBackground: tokens.dawn.c400,
        },
        saveBar: {
          background: tokens.dawn.c800,
        },
      },

      utils: {
        divider: tokens.silk.c300,
      },

      errors: {
        card: tokens.dawn.c800,
        border: tokens.silk.c500,
        type: {
          secondary: tokens.silk.c100,
        },
      },

      about: {
        circle: tokens.silk.c500,
        circleText: tokens.silk.c50,
      },

      editBadge: {
        bg: tokens.silk.c500,
        bgHover: tokens.silk.c400,
        text: tokens.silk.c50,
      },

      progress: {
        background: tokens.silk.c50,
        preloaded: tokens.silk.c50,
        filled: tokens.petal.c200,
      },

      video: {
        buttonBackground: tokens.silk.c200,
        autoPlay: {
          background: tokens.silk.c700,
          hover: tokens.silk.c500,
        },
        scraping: {
          card: tokens.dawn.c700,
          loading: tokens.petal.c200,
          noresult: tokens.silk.c100,
        },
        audio: {
          set: tokens.petal.c200,
        },
        context: {
          background: tokens.silk.c900,
          light: tokens.dawn.c50,
          border: tokens.silk.c600,
          hoverColor: tokens.silk.c600,
          buttonFocus: tokens.silk.c500,
          flagBg: tokens.silk.c500,
          inputBg: tokens.silk.c600,
          buttonOverInputHover: tokens.silk.c500,
          inputPlaceholder: tokens.silk.c200,
          cardBorder: tokens.silk.c700,
          slider: tokens.silk.c50,
          sliderFilled: tokens.petal.c200,
          buttons: {
            list: tokens.silk.c700,
            active: tokens.silk.c900,
          },
          closeHover: tokens.silk.c800,
          type: {
            secondary: tokens.silk.c200,
            accent: tokens.petal.c200,
          },
        },
      },
    },
  },
});
