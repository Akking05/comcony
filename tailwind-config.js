tailwind.config = {
    darkMode: "class",
    theme: {
      extend: {
        maxWidth: {
          "container-max": "1440px"
        },
        colors: {
          "secondary": "#adc6ff",
          "primary": "#a4e6ff",
          "on-surface-variant": "#bbc9cf",
          "surface-container-lowest": "#090f12",
          "on-background": "#dde3e7",
          "surface-container-high": "#242b2e",
          "primary-container": "#00d1ff",
          "on-primary": "#003543",
          "surface": "#0e1417",
          "background": "#0e1417",
          "outline-variant": "#3c494e",
          "on-surface": "#dde3e7",
          "on-primary-container": "#00566a",
          "outline": "#859399"
        },
        borderRadius: {
          DEFAULT: "0.125rem",
          lg: "0.25rem",
          xl: "0.5rem",
          full: "0.75rem"
        },
        spacing: {
          unit: "8px",
          "margin-desktop": "64px",
          "container-max": "1440px",
          "margin-mobile": "20px",
          "stack-xs": "4px",
          "stack-sm": "12px",
          gutter: "24px",
          "stack-md": "24px",
          "stack-xl": "80px",
          "stack-lg": "48px"
        },
        fontFamily: {
          "headline-md": ["Sora", "Plus Jakarta Sans", "sans-serif"],
          "body-lg": ["Inter", "Outfit", "sans-serif"],
          "headline-lg": ["Sora", "Plus Jakarta Sans", "sans-serif"],
          "display-lg": ["Sora", "Plus Jakarta Sans", "sans-serif"],
          "label-sm": ["Geist", "sans-serif"],
          "headline-lg-mobile": ["Sora", "Plus Jakarta Sans", "sans-serif"],
          "body-md": ["Inter", "Outfit", "sans-serif"],
          "label-md": ["Geist", "sans-serif"]
        },
        fontSize: {
          "headline-md": ["24px", { lineHeight: "1.3", fontWeight: "500" }],
          "body-lg": ["18px", { lineHeight: "1.6", fontWeight: "400" }],
          "headline-lg": ["40px", { lineHeight: "1.2", letterSpacing: "0.01em", fontWeight: "600" }],
          "display-lg": ["64px", { lineHeight: "1.1", letterSpacing: "0.02em", fontWeight: "600" }],
          "label-sm": ["12px", { lineHeight: "1.4", letterSpacing: "0.1em", fontWeight: "500" }],
          "headline-lg-mobile": ["32px", { lineHeight: "1.2", fontWeight: "600" }],
          "body-md": ["16px", { lineHeight: "1.6", fontWeight: "400" }],
          "label-md": ["14px", { lineHeight: "1.4", letterSpacing: "0.08em", fontWeight: "500" }]
        }
      }
    }
};
