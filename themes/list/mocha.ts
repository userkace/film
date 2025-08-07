import { createTheme } from "../types";

const tokens = {
  purple: {
    c50: "#E2AB68FF",
    c100: "#B27C39FF",
    c200: "#B1853FFF",
    c300: "#88581DFF",
    c400: "#8B5C27FF",
    c500: "#905C22FF",
    c600: "#784E1CFF",
    c700: "#432A04FF",
    c800: "#412604FF",
    c900: "#2A1D03FF"
  },
  shade: {
    c25: "#B38F5DFF",
    c50: "#907D67FF",
    c100: "#7A6A52FF",
    c200: "#60523FFF",
    c300: "#4F4432FF",
    c400: "#413727FF",
    c500: "#322C1EFF",
    c600: "#281E17FF",
    c700: "#221D13FF",
    c800: "#1B160FFF",
    c900: "#120F0AFF"
  },
  ash: {
    c50: "#9B877FFF",
    c100: "#7B665BFF",
    c200: "#645044FF",
    c300: "#4E3C2BFF",
    c400: "#423420FF",
    c500: "#3C2F1CFF",
    c600: "#322517FF",
    c700: "#292113FF",
    c800: "#201910FF",
    c900: "#16100CFF"
  },
  blue: {
    c50: "#F5DBADFF",
    c100: "#CCB279FF",
    c200: "#987A4EFF",
    c300: "#775936FF",
    c400: "#785D34FF",
    c500: "#534024FF",
    c600: "#41321BFFFF",
    c700: "#362C17FF",
    c800: "#201810FF",
    c900: "#13100BFF"
  }
};

export default createTheme({
  name: "mocha",
  extend: {
    colors: {
      themePreview: {
        primary: tokens.blue.c200,
        secondary: tokens.shade.c50
      },

      pill: {
        background: tokens.shade.c300,
        backgroundHover: tokens.shade.c200,
        highlight: tokens.blue.c200,

        activeBackground: tokens.shade.c300,
      },

      global: {
        accentA: tokens.blue.c200,
        accentB: tokens.blue.c300
      },

      lightBar: {
        light: tokens.blue.c400
      },

      buttons: {
        toggle: tokens.purple.c300,
        toggleDisabled: tokens.ash.c500,

        secondary: tokens.ash.c700,
        secondaryHover: tokens.ash.c700,
        purple: tokens.purple.c500,
        purpleHover: tokens.purple.c400,
        cancel: tokens.ash.c500,
        cancelHover: tokens.ash.c300
      },

      background: {
        main: tokens.shade.c900,
        secondary: tokens.shade.c600,
        secondaryHover: tokens.shade.c400,
        accentA: tokens.purple.c500,
        accentB: tokens.blue.c500
      },

      modal: {
        background: tokens.shade.c800,
      },

      type: {
        logo: tokens.purple.c100,
        text: tokens.shade.c50,
        dimmed: tokens.shade.c50,
        divider: tokens.ash.c500,
        secondary: tokens.ash.c100,
        link: tokens.purple.c100,
        linkHover: tokens.purple.c50
      },

      search: {
        background: tokens.shade.c500,
        hoverBackground: tokens.shade.c600,
        focused: tokens.shade.c400,
        placeholder: tokens.shade.c100,
        icon: tokens.shade.c100
      },

      mediaCard: {
        hoverBackground: tokens.shade.c600,
        hoverAccent: tokens.shade.c25,
        hoverShadow: tokens.shade.c900,
        shadow: tokens.shade.c700,
        barColor: tokens.ash.c200,
        barFillColor: tokens.purple.c100,
        badge: tokens.shade.c700,
        badgeText: tokens.ash.c100
      },

      largeCard: {
        background: tokens.shade.c600,
        icon: tokens.purple.c400
      },

      dropdown: {
        background: tokens.shade.c600,
        altBackground: tokens.shade.c700,
        hoverBackground: tokens.shade.c500,
        text: tokens.shade.c50,
        secondary: tokens.shade.c100,
        border: tokens.shade.c400,
        contentBackground: tokens.shade.c500
      },

      authentication: {
        border: tokens.shade.c300,
        inputBg: tokens.shade.c600,
        inputBgHover: tokens.shade.c500,
        wordBackground: tokens.shade.c500,
        copyText: tokens.shade.c100,
        copyTextHover: tokens.ash.c50
      },

      settings: {
        sidebar: {
          activeLink: tokens.shade.c600,
          badge: tokens.shade.c900,

          type: {
            secondary: tokens.shade.c200,
            inactive: tokens.shade.c50,
            icon: tokens.shade.c50,
            iconActivated: tokens.purple.c200,
            activated: tokens.purple.c50
          }
        },

        card: {
          border: tokens.shade.c400,
          background: tokens.shade.c400,
          altBackground: tokens.shade.c400
        },

        saveBar: {
          background: tokens.shade.c800
        }
      },

      utils: {
        divider: tokens.ash.c300
      },

      errors: {
        card: tokens.shade.c800,
        border: tokens.ash.c500,

        type: {
          secondary: tokens.ash.c100
        }
      },

      about: {
        circle: tokens.ash.c500,
        circleText: tokens.ash.c50
      },

      editBadge: {
        bg: tokens.ash.c500,
        bgHover: tokens.ash.c400,
        text: tokens.ash.c50
      },

      progress: {
        background: tokens.ash.c50,
        preloaded: tokens.ash.c50,
        filled: tokens.purple.c200
      },

      video: {
        buttonBackground: tokens.ash.c200,

        autoPlay: {
          background: tokens.ash.c700,
          hover: tokens.ash.c500
        },

        scraping: {
          card: tokens.shade.c700,
          loading: tokens.purple.c200,
          noresult: tokens.ash.c100
        },

        audio: {
          set: tokens.purple.c200
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

          buttons: {
            list: tokens.ash.c700,
            active: tokens.ash.c900
          },

          closeHover: tokens.ash.c800,

          type: {
            secondary: tokens.ash.c200,
            accent: tokens.purple.c200
          }
        }
      }
    }
  }
});
