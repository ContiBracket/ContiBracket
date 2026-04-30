{
  "brand": {
    "product_name": "ContiBracket",
    "design_personality": [
      "office tournament night",
      "dark + glowy (ContiBingo-adjacent)",
      "flashy but readable",
      "friendly + low-friction",
      "high-contrast, high-satisfaction micro-interactions"
    ],
    "north_star": "In 10 seconds: join, pick, vote. Everything else is spectacle + clarity.",
    "do_not": [
      "Do not use purple-heavy gradients on large surfaces (allowed as small accent only).",
      "Do not use transparent page backgrounds (platform rule).",
      "Do not block voting with long animations (>400ms).",
      "Do not center-align all text globally."
    ]
  },

  "inspiration_refs": {
    "search_notes": [
      "Look at Dribbble 'bingo' shots for card/grid vibe and neon edge treatments.",
      "Look at Dribbble 'tournament bracket mobile' for matchup flow + progress UI.",
      "Use neon bracket line references (video templates) as a mental model for connector glow, but implement with CSS/SVG."
    ],
    "urls": [
      {
        "title": "Dribbble tag: Bingo (grid/card vibe)",
        "url": "https://dribbble.com/tags/bingo"
      },
      {
        "title": "Dribbble search: tournament bracket mobile",
        "url": "https://dribbble.com/search/tournament-bracket-mobile"
      },
      {
        "title": "Figma community: Example App — Tournament Brackets",
        "url": "https://www.figma.com/community/file/1565048634745156091/example-app-tournament-brackets"
      },
      {
        "title": "Neon bracket animation reference (visual only)",
        "url": "https://stock.adobe.com/video/team-tournament-bracket-templates-animation-of-neon-glowing-team-tournament-bracket-templates-isolated-on-black-background-4k/1770898884"
      },
      {
        "title": "react-canvas-confetti (winner confetti)",
        "url": "https://github.com/ulitcos/react-canvas-confetti"
      }
    ]
  },

  "typography": {
    "google_fonts": {
      "display": {
        "family": "Space Grotesk",
        "weights": [500, 600, 700],
        "usage": "Hero titles, round headers, champion reveal, big numbers"
      },
      "body": {
        "family": "Inter",
        "weights": [400, 500, 600],
        "usage": "Body copy, labels, admin tables, helper text"
      }
    },
    "tailwind_font_setup": {
      "instructions": [
        "Add Google Fonts <link> in index.html OR import in index.css.",
        "Set Tailwind fontFamily tokens: font-display and font-sans.",
        "Use font-display for headings only; keep body in Inter for readability on dark backgrounds."
      ],
      "recommended_classes": {
        "h1": "font-display tracking-tight text-4xl sm:text-5xl lg:text-6xl",
        "h2": "font-display tracking-tight text-base md:text-lg",
        "body": "font-sans text-sm md:text-base leading-relaxed",
        "small": "text-xs text-muted-foreground"
      }
    },
    "type_scale": {
      "h1": "text-4xl sm:text-5xl lg:text-6xl",
      "h2": "text-base md:text-lg",
      "body": "text-sm md:text-base",
      "caption": "text-xs",
      "badge": "text-xs font-medium"
    }
  },

  "color_system": {
    "notes": [
      "Default is DARK with neon accents. Keep reading surfaces solid (no gradients).",
      "Gradients are decorative only and must stay under 20% viewport.",
      "Provide admin theme editor mapping to these tokens (background/card/accent/glow/etc.)."
    ],

    "presets": {
      "contibingo_style_default": {
        "name": "ContiBingo Style (Default)",
        "mode": "dark",
        "tokens_hex": {
          "bg": "#070A12",
          "bg_2": "#0B1020",
          "surface": "#0E1630",
          "card": "#0B1226",
          "card_2": "#0A0F1F",
          "text": "#EAF0FF",
          "muted_text": "#A9B4D0",
          "border": "#1B2A52",
          "ring": "#7AA7FF",

          "accent_pink": "#FF4FD8",
          "accent_magenta": "#FF2E88",
          "accent_blue": "#4DA3FF",
          "accent_green": "#2EF2B3",
          "accent_orange": "#FFB020",
          "accent_purple_small": "#A78BFA",

          "success": "#2EF2B3",
          "warning": "#FFB020",
          "danger": "#FF4D6D",

          "winner": "#2EF2B3",
          "loser_faded": "#6B7696",
          "bracket_line": "#2A3B6B",
          "your_pick": "#FF4FD8"
        },
        "tokens_hsl": {
          "bg": "226 45% 5%",
          "card": "224 46% 10%",
          "text": "220 100% 96%",
          "muted_text": "223 25% 74%",
          "accent_pink": "312 100% 65%",
          "accent_blue": "210 100% 65%",
          "accent_green": "162 88% 56%",
          "accent_orange": "38 100% 56%"
        },
        "allowed_decorative_gradient": {
          "usage": "Hero background overlay only (<=20% viewport)",
          "css": "radial-gradient(900px circle at 20% 10%, rgba(77,163,255,0.18), transparent 55%), radial-gradient(700px circle at 80% 0%, rgba(255,79,216,0.14), transparent 55%), radial-gradient(700px circle at 70% 90%, rgba(46,242,179,0.10), transparent 60%)"
        }
      },

      "tournament_night_pink": {
        "name": "Tournament Night Pink",
        "mode": "dark",
        "tokens_hex": {
          "bg": "#090611",
          "bg_2": "#120A22",
          "card": "#120B24",
          "text": "#FFF1FB",
          "muted_text": "#D7B7CC",
          "border": "#2B1A3D",
          "ring": "#FF4FD8",

          "accent_primary": "#FF4FD8",
          "accent_secondary": "#4DA3FF",
          "accent_tertiary": "#FFB020",

          "winner": "#FFB020",
          "loser_faded": "#7E6A86",
          "bracket_line": "#3A2A55",
          "your_pick": "#4DA3FF"
        },
        "allowed_decorative_gradient": {
          "usage": "Hero overlay only",
          "css": "radial-gradient(900px circle at 15% 15%, rgba(255,79,216,0.16), transparent 55%), radial-gradient(800px circle at 85% 10%, rgba(77,163,255,0.12), transparent 55%), radial-gradient(700px circle at 70% 90%, rgba(255,176,32,0.10), transparent 60%)"
        }
      },

      "cool_blue_court": {
        "name": "Cool Blue Court",
        "mode": "dark",
        "tokens_hex": {
          "bg": "#050B12",
          "bg_2": "#071427",
          "card": "#081A2F",
          "text": "#EAF6FF",
          "muted_text": "#A7C0D6",
          "border": "#12314F",
          "ring": "#4DA3FF",

          "accent_primary": "#4DA3FF",
          "accent_secondary": "#2EF2B3",
          "accent_tertiary": "#FFB020",

          "winner": "#4DA3FF",
          "loser_faded": "#6E8AA3",
          "bracket_line": "#1B3E63",
          "your_pick": "#2EF2B3"
        },
        "allowed_decorative_gradient": {
          "usage": "Hero overlay only",
          "css": "radial-gradient(900px circle at 20% 10%, rgba(77,163,255,0.18), transparent 55%), radial-gradient(700px circle at 80% 0%, rgba(46,242,179,0.10), transparent 55%), radial-gradient(700px circle at 70% 90%, rgba(255,176,32,0.08), transparent 60%)"
        }
      }
    },

    "css_custom_properties": {
      "implementation_note": "Map these to shadcn tokens in index.css. Keep .dark as default on <html>.",
      "tokens": {
        "--cb-bg": "#070A12",
        "--cb-bg-2": "#0B1020",
        "--cb-card": "#0B1226",
        "--cb-card-2": "#0A0F1F",
        "--cb-text": "#EAF0FF",
        "--cb-muted": "#A9B4D0",
        "--cb-border": "#1B2A52",
        "--cb-ring": "#7AA7FF",

        "--cb-accent": "#FF4FD8",
        "--cb-accent-2": "#4DA3FF",
        "--cb-accent-3": "#2EF2B3",
        "--cb-warning": "#FFB020",
        "--cb-danger": "#FF4D6D",

        "--cb-winner": "#2EF2B3",
        "--cb-loser": "#6B7696",
        "--cb-bracket-line": "#2A3B6B",

        "--cb-glow-strength": "0.55",
        "--cb-glow-blur": "22px",
        "--cb-radius-card": "18px",
        "--cb-radius-btn": "16px"
      }
    }
  },

  "layout_and_grid": {
    "global": {
      "container": "mx-auto w-full max-w-[980px] px-4 sm:px-6",
      "card_max_width": "max-w-[560px]",
      "spacing": {
        "section_y": "py-8 sm:py-10",
        "stack_gap": "gap-4 sm:gap-6",
        "dense_gap": "gap-2"
      },
      "corner_radii": {
        "card": "rounded-[18px]",
        "item": "rounded-[16px]",
        "button": "rounded-[16px]",
        "pill_badge": "rounded-full"
      }
    },

    "player_flow": {
      "pattern": "single-column, mobile-first, max-width centered card stack",
      "page_shell": "min-h-dvh bg-[color:var(--cb-bg)] text-[color:var(--cb-text)]",
      "hero_area": "pt-10 pb-6",
      "content_stack": "flex flex-col gap-4",
      "sticky_cta_mobile": "Use a bottom sticky action bar only on vote screens: sticky bottom-0 bg-[color:var(--cb-bg)]/95 backdrop-blur supports-[backdrop-filter]:bg-[color:var(--cb-bg)]/80"
    },

    "admin_layout": {
      "desktop": "grid grid-cols-[260px_1fr] gap-6",
      "mobile": "flex flex-col gap-4",
      "sidebar_card": "rounded-[18px] bg-[color:var(--cb-card)] border border-[color:var(--cb-border)]",
      "main_card": "rounded-[18px] bg-[color:var(--cb-card)] border border-[color:var(--cb-border)]"
    },

    "tv_display": {
      "goal": "16:9 fullscreen bracket, minimal chrome, high legibility from distance",
      "shell": "min-h-dvh w-full bg-[color:var(--cb-bg)] text-[color:var(--cb-text)]",
      "safe_margins": "px-10 py-8",
      "scale": "Use CSS clamp() for item sizes; avoid tiny text. Prefer text-base to text-lg minimum.",
      "motion": "Slow ambient glow + subtle connector pulse; no distracting loops."
    }
  },

  "components": {
    "component_path": {
      "shadcn_primary": "/app/frontend/src/components/ui",
      "use": [
        "button.jsx",
        "card.jsx",
        "tabs.jsx",
        "dialog.jsx",
        "alert-dialog.jsx",
        "input.jsx",
        "label.jsx",
        "progress.jsx",
        "badge.jsx",
        "separator.jsx",
        "sheet.jsx",
        "table.jsx",
        "scroll-area.jsx",
        "skeleton.jsx",
        "sonner.jsx"
      ]
    },

    "glow_card": {
      "description": "Centered rounded card with subtle gradient border + outer halo glow. No transparent background; card is solid.",
      "base": {
        "wrapper_classes": "relative rounded-[18px] bg-[color:var(--cb-card)] border border-[color:var(--cb-border)] shadow-[0_18px_60px_rgba(0,0,0,0.55)]",
        "halo_pseudo": "before:absolute before:inset-[-1px] before:rounded-[20px] before:bg-[radial-gradient(1200px_circle_at_20%_0%,rgba(77,163,255,0.22),transparent_55%),radial-gradient(900px_circle_at_90%_10%,rgba(255,79,216,0.18),transparent_55%),radial-gradient(900px_circle_at_70%_90%,rgba(46,242,179,0.12),transparent_60%)] before:opacity-[var(--cb-glow-strength)] before:blur-[var(--cb-glow-blur)] before:-z-10",
        "inner_border": "after:absolute after:inset-0 after:rounded-[18px] after:pointer-events-none after:ring-1 after:ring-inset after:ring-white/5"
      },
      "hover": {
        "classes": "transition-[box-shadow,border-color] duration-200 hover:border-[color:color-mix(in_oklab,var(--cb-border),white_18%)] hover:shadow-[0_22px_80px_rgba(0,0,0,0.6)]"
      },
      "testid": "data-testid=\"glow-card\""
    },

    "primary_button": {
      "description": "Big rounded CTA with glow edge; press scale; readable label.",
      "use_shadcn": "button.jsx",
      "variants": {
        "primary": "rounded-[16px] px-5 py-3 text-sm font-semibold bg-[color:var(--cb-accent)] text-black shadow-[0_10px_30px_rgba(255,79,216,0.22)] transition-[background-color,box-shadow,filter] duration-200 hover:shadow-[0_14px_44px_rgba(255,79,216,0.30)] hover:brightness-105 active:scale-[0.98]",
        "secondary": "rounded-[16px] px-5 py-3 text-sm font-semibold bg-[color:var(--cb-card-2)] text-[color:var(--cb-text)] border border-[color:var(--cb-border)] transition-[background-color,border-color,box-shadow] duration-200 hover:bg-[color:color-mix(in_oklab,var(--cb-card-2),white_6%)] hover:shadow-[0_12px_40px_rgba(77,163,255,0.12)] active:scale-[0.98]",
        "ghost": "rounded-[16px] px-4 py-2 text-sm font-medium text-[color:var(--cb-muted)] hover:text-[color:var(--cb-text)] hover:bg-white/5 transition-[background-color,color] duration-200 active:scale-[0.98]"
      },
      "focus": "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--cb-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--cb-bg)]",
      "testid_examples": [
        "data-testid=\"landing-join-cta-button\"",
        "data-testid=\"vote-submit-button\"",
        "data-testid=\"admin-create-game-button\""
      ]
    },

    "bracket_item_card": {
      "description": "Large rounded item box with optional image + name. States: default/hover/selected/winner/loser.",
      "structure": {
        "container": "group relative w-full rounded-[16px] bg-[color:var(--cb-card-2)] border border-[color:var(--cb-border)] p-3 sm:p-4",
        "image": "h-12 w-12 rounded-[12px] bg-black/20 object-cover",
        "title": "font-display text-sm sm:text-base tracking-tight",
        "meta": "text-xs text-[color:var(--cb-muted)]",
        "right_slot": "ml-auto flex items-center gap-2"
      },
      "hover": {
        "classes": "transition-[border-color,box-shadow,background-color] duration-200 hover:border-[color:color-mix(in_oklab,var(--cb-border),white_18%)] hover:shadow-[0_14px_44px_rgba(77,163,255,0.10)]"
      },
      "states": {
        "selected": "ring-2 ring-[color:var(--cb-accent)] shadow-[0_0_0_1px_rgba(255,79,216,0.25),0_18px_60px_rgba(255,79,216,0.10)]",
        "winner": "border-[color:color-mix(in_oklab,var(--cb-winner),white_10%)] ring-2 ring-[color:var(--cb-winner)] shadow-[0_18px_70px_rgba(46,242,179,0.14)]",
        "loser": "opacity-60 grayscale-[0.15]",
        "disabled": "opacity-50 pointer-events-none"
      },
      "badges": {
        "your_pick": "inline-flex items-center rounded-full bg-[color:var(--cb-accent)]/15 text-[color:var(--cb-accent)] px-2 py-0.5 text-xs font-medium",
        "upset": "inline-flex items-center rounded-full bg-[color:var(--cb-warning)]/15 text-[color:var(--cb-warning)] px-2 py-0.5 text-xs font-medium"
      },
      "testid_examples": [
        "data-testid=\"bracket-item-card\"",
        "data-testid=\"matchup-choice-a-button\"",
        "data-testid=\"matchup-choice-b-button\""
      ]
    },

    "matchup_pair_container": {
      "description": "Two big item cards with a VS divider. On mobile: stacked; on desktop: side-by-side.",
      "layout": {
        "container": "grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] gap-3 sm:gap-4 items-stretch",
        "vs": "flex items-center justify-center",
        "vs_pill": "rounded-full border border-[color:var(--cb-border)] bg-[color:var(--cb-card)] px-3 py-1 text-xs font-semibold text-[color:var(--cb-muted)] shadow-[0_10px_30px_rgba(0,0,0,0.35)]"
      },
      "micro_interaction": "When user hovers either side, slightly dim the other side (opacity-80) to guide attention."
    },

    "round_column_header": {
      "description": "Round header chip for bracket columns.",
      "classes": "sticky top-0 z-10 mb-3 inline-flex items-center gap-2 rounded-full bg-[color:var(--cb-card)] border border-[color:var(--cb-border)] px-3 py-1 text-xs font-semibold text-[color:var(--cb-text)] shadow-[0_10px_30px_rgba(0,0,0,0.35)]",
      "testid": "data-testid=\"round-column-header\""
    },

    "progress_indicator": {
      "description": "Matchup progress: 'Matchup 3 of 8' + shadcn Progress bar.",
      "classes": {
        "row": "flex items-center justify-between gap-3",
        "label": "text-xs text-[color:var(--cb-muted)]",
        "value": "text-xs font-semibold text-[color:var(--cb-text)]"
      },
      "progress_component": "progress.jsx",
      "testid_examples": [
        "data-testid=\"matchup-progress-label\"",
        "data-testid=\"matchup-progress-bar\""
      ]
    },

    "toast_and_feedback": {
      "use": "sonner.jsx",
      "patterns": [
        "On vote submit: toast.success('Vote locked')",
        "On admin actions: toast.message('Round opened')",
        "On errors: toast.error('Could not submit vote. Try again.')"
      ]
    }
  },

  "bracket_visualization_spec": {
    "render_model": {
      "rounds_as_columns": "Render rounds horizontally as columns inside a horizontal ScrollArea. Each column contains vertically stacked matchups.",
      "matchup_stack": "Each matchup is a vertical stack of 2 item cards (or 1 + BYE).",
      "bye_handling": "If BYE: show a compact BYE pill in place of missing opponent; auto-advance winner visually with a 'BYE' badge.",
      "responsive": {
        "mobile": "Default to scrollable horizontal bracket with snap points per round column.",
        "desktop": "Show multiple columns at once; increase connector thickness and spacing."
      }
    },

    "layout_classes": {
      "scroll_shell": "w-full",
      "scroll_area": "w-full",
      "rounds_row": "flex gap-6 pr-6",
      "round_col": "min-w-[260px] sm:min-w-[320px]",
      "matchup_block": "relative flex flex-col gap-2 py-3",
      "connector_layer": "pointer-events-none absolute inset-0"
    },

    "connector_lines": {
      "preferred_technique": "SVG overlay per round pair (recommended for scaling + crispness).",
      "fallback_css": "Use pseudo-elements on matchup blocks to draw horizontal + vertical lines.",
      "svg_spec": {
        "stroke": "var(--cb-bracket-line)",
        "strokeWidth": 2,
        "glow": "filter: drop-shadow(0 0 10px rgba(77,163,255,0.18))",
        "path": "Use cubic Bezier from winner midpoint to next-round slot midpoint."
      },
      "css_fallback_classes": {
        "line": "bg-[color:var(--cb-bracket-line)]",
        "glow": "shadow-[0_0_18px_rgba(77,163,255,0.14)]"
      }
    },

    "states_and_badges": {
      "winner_highlight": "Winner item gets ring + glow (var(--cb-winner)).",
      "loser_fade": "Loser item gets opacity-60 + slight grayscale.",
      "your_pick_badge": "Place top-right inside item card; never cover title; use small pill.",
      "upset_indicator": "If lower seed beats higher seed: show 'UPSET' pill near badge cluster.",
      "vote_percentages": {
        "when_allowed": "Show a thin vote bar under each item (height 6px) + percentage label.",
        "bar_classes": "h-1.5 rounded-full bg-white/10 overflow-hidden",
        "fill_classes": "h-full rounded-full bg-[color:var(--cb-accent-2)]"
      }
    },

    "tv_mode_rules": {
      "no_controls": "Hide admin controls and participant actions.",
      "bigger_type": "Round headers text-sm->text-base; item titles text-base->text-lg.",
      "ambient_motion": "Slow pulsing glow on current round header only (2.5s)."
    }
  },

  "motion": {
    "library": "Framer Motion (already installed)",
    "principles": [
      "Fast transitions (<400ms) for navigation and voting.",
      "Use spring for selection pop; use tween for screen transitions.",
      "Respect prefers-reduced-motion: reduce durations and disable looping glows."
    ],

    "variants_js": {
      "cardEntranceStagger": {
        "container": {
          "hidden": { "opacity": 0 },
          "show": {
            "opacity": 1,
            "transition": { "staggerChildren": 0.06, "delayChildren": 0.04 }
          }
        },
        "item": {
          "hidden": { "opacity": 0, "y": 10, "filter": "blur(6px)" },
          "show": {
            "opacity": 1,
            "y": 0,
            "filter": "blur(0px)",
            "transition": { "duration": 0.28, "ease": [0.2, 0.8, 0.2, 1] }
          }
        }
      },

      "selectPopGlow": {
        "rest": { "scale": 1, "boxShadow": "0 0 0 rgba(0,0,0,0)" },
        "selected": {
          "scale": 1.02,
          "boxShadow": "0 0 0 1px rgba(255,79,216,0.25), 0 18px 60px rgba(255,79,216,0.12)",
          "transition": { "type": "spring", "stiffness": 420, "damping": 26 }
        },
        "tap": { "scale": 0.985 }
      },

      "matchupSlideIn": {
        "hidden": { "opacity": 0, "x": 18 },
        "show": {
          "opacity": 1,
          "x": 0,
          "transition": { "duration": 0.26, "ease": [0.2, 0.8, 0.2, 1] }
        },
        "exit": {
          "opacity": 0,
          "x": -18,
          "transition": { "duration": 0.18, "ease": [0.4, 0, 1, 1] }
        }
      },

      "roundTransition": {
        "hidden": { "opacity": 0, "y": 14, "filter": "blur(8px)" },
        "show": {
          "opacity": 1,
          "y": 0,
          "filter": "blur(0px)",
          "transition": { "duration": 0.32, "ease": [0.2, 0.8, 0.2, 1] }
        },
        "exit": {
          "opacity": 0,
          "y": -10,
          "filter": "blur(8px)",
          "transition": { "duration": 0.2 }
        }
      },

      "winnerReveal": {
        "hidden": { "opacity": 0, "scale": 0.96, "y": 10 },
        "show": {
          "opacity": 1,
          "scale": 1,
          "y": 0,
          "transition": { "type": "spring", "stiffness": 260, "damping": 18 }
        }
      }
    },

    "office_drama_mode": {
      "admin_toggle": "Office Drama Mode",
      "behavior": [
        "Reveal results one matchup at a time with a 650–900ms suspense delay.",
        "Use a subtle 'spotlight' overlay on the winning card (radial gradient mask).",
        "Play a short 'tick' micro-sound ONLY if product allows; otherwise use haptic-like animation (scale + glow)."
      ],
      "timing": {
        "reveal_delay_ms": 750,
        "per_matchup_ms": 900
      }
    }
  },

  "confetti_champion_reveal": {
    "library": "react-canvas-confetti",
    "install": {
      "command": "npm i react-canvas-confetti",
      "note": "Use preset Fireworks or manual instance for a single burst."
    },
    "usage_js": {
      "pattern": "On champion reveal screen mount: trigger 2 bursts (left + right) then stop.",
      "snippet": "import ReactCanvasConfetti from 'react-canvas-confetti';\n\n// keep ref to instance\nconst refAnimationInstance = useRef(null);\nconst getInstance = useCallback((instance) => { refAnimationInstance.current = instance; }, []);\n\nconst fire = useCallback(() => {\n  const makeShot = (particleRatio, opts) => {\n    refAnimationInstance.current?.({\n      ...opts,\n      origin: { y: 0.7 },\n      particleCount: Math.floor(220 * particleRatio),\n    });\n  };\n  makeShot(0.25, { spread: 26, startVelocity: 55 });\n  makeShot(0.2, { spread: 60 });\n  makeShot(0.35, { spread: 100, decay: 0.91, scalar: 0.9 });\n  makeShot(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });\n}, []);\n\nuseEffect(() => { fire(); const t = setTimeout(fire, 420); return () => clearTimeout(t); }, [fire]);\n\nreturn (\n  <ReactCanvasConfetti\n    onInit={getInstance}\n    style={{ position: 'fixed', pointerEvents: 'none', width: '100%', height: '100%', top: 0, left: 0 }}\n  />\n);"
    },
    "testid": "data-testid=\"champion-confetti-layer\""
  },

  "states": {
    "loading": {
      "pattern": "Skeleton + friendly copy. Never show blank screens.",
      "use": "skeleton.jsx",
      "copy_examples": [
        "Loading bracket…",
        "Warming up the tournament lights…"
      ],
      "testid": "data-testid=\"loading-state\""
    },
    "empty": {
      "pattern": "Explain what to do next + single CTA.",
      "examples": [
        "No items yet — add bracket items to launch.",
        "No votes yet — open the round to start voting."
      ],
      "testid": "data-testid=\"empty-state\""
    },
    "error": {
      "pattern": "Short error + retry button + support hint.",
      "component": "alert.jsx",
      "testid": "data-testid=\"error-state\""
    },
    "waiting": {
      "pattern": "Round complete waiting screen with subtle pulse + status chip.",
      "ui": {
        "chip": "inline-flex items-center rounded-full bg-white/5 border border-[color:var(--cb-border)] px-3 py-1 text-xs text-[color:var(--cb-muted)]",
        "pulse": "animate-[pulse_2.2s_ease-in-out_infinite]"
      },
      "copy_examples": [
        "Round complete — waiting for the next round to open.",
        "You’re locked in. Check back soon."
      ],
      "testid": "data-testid=\"waiting-state\""
    }
  },

  "accessibility": {
    "floor": [
      "All focusable elements must have visible focus ring (ring-2 + ring-offset).",
      "Maintain WCAG AA contrast: muted text still readable on dark cards.",
      "Keyboard navigation: matchup choices must be reachable and selectable via Enter/Space.",
      "Reduced motion: if prefers-reduced-motion, disable blur transitions and reduce spring bounciness."
    ],
    "focus_ring_classes": "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--cb-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--cb-bg)]",
    "reduced_motion": {
      "css": "@media (prefers-reduced-motion: reduce) { .cb-anim { transition-duration: 1ms !important; animation-duration: 1ms !important; } }",
      "framer": "Use useReducedMotion() to swap variants to opacity-only."
    }
  },

  "theme_editor_mapping": {
    "admin_controls": [
      "Background color",
      "Background decorative gradient (toggle + intensity)",
      "Card color",
      "Text + muted text",
      "Accent (primary/secondary/tertiary)",
      "Button color",
      "Bracket line color",
      "Winner highlight color",
      "Loser faded color",
      "Glow intensity (0.2–0.8)",
      "Animation intensity (0.6–1.2 multiplier)",
      "Office Drama Mode toggle"
    ],
    "implementation": "Store theme as JSON per game; apply by setting CSS variables on a wrapping div (style={{...}}) so TV mode and player mode share tokens.",
    "testid": "data-testid=\"admin-style-editor\""
  },

  "image_urls": {
    "note": "Bracket items are user-uploaded (base64). Use no stock images by default. Optional decorative background textures should be CSS noise.",
    "decorative": [
      {
        "category": "background_texture",
        "description": "CSS noise overlay (no external image) to avoid flat dark surfaces.",
        "css": "background-image: radial-gradient(circle at 20% 10%, rgba(77,163,255,0.10), transparent 55%), radial-gradient(circle at 80% 0%, rgba(255,79,216,0.08), transparent 55%);"
      }
    ]
  },

  "instructions_to_main_agent": {
    "global_setup": [
      "Make <html> default to className='dark' and map shadcn tokens to ContiBracket tokens in index.css.",
      "Remove/ignore default CRA App.css centering patterns; do not use .App-header layout.",
      "Create utility classes/components: GlowCard, BigCTAButton, BracketItemCard, MatchupPair.",
      "Every interactive element must include data-testid in kebab-case describing role.",
      "Use ScrollArea for horizontal bracket; use Tabs for admin manager sections.",
      "Use Sonner for toasts; do not use native alert()."
    ],
    "page_specific": {
      "landing": [
        "Hero GlowCard with short explanation + join hint + admin link.",
        "One primary CTA (Join via your link) should be disabled (informational) since join happens via slug route."
      ],
      "player_game": [
        "Stepper-like top status chip (Join → Predict → Vote → Bracket → Waiting → Winner).",
        "Voting screen: one matchup at a time with progress indicator and two big choices.",
        "Bracket screen: show 'Your pick' badges and winner/loser states; show vote % only when allowed."
      ],
      "admin": [
        "PIN entry as a GlowCard with Input + Button.",
        "Dashboard: cards for Active/Draft/Complete; Create Game CTA.",
        "Game manager: Tabs (Overview, Items, Participants, Votes, Style, Settings, Danger Zone)."
      ],
      "display": [
        "Fullscreen bracket only; large type; minimal labels; subtle ambient glow."
      ]
    },
    "libraries": [
      {
        "name": "react-canvas-confetti",
        "why": "Winner confetti",
        "install": "npm i react-canvas-confetti"
      }
    ]
  },

  "general_ui_ux_design_guidelines_appendix": "<General UI UX Design Guidelines>\n    - You must **not** apply universal transition. Eg: `transition: all`. This results in breaking transforms. Always add transitions for specific interactive elements like button, input excluding transforms\n    - You must **not** center align the app container, ie do not add `.App { text-align: center; }` in the css file. This disrupts the human natural reading flow of text\n   - NEVER: use AI assistant Emoji characters like`🤖🧠💭💡🔮🎯📚🎭🎬🎪🎉🎊🎁🎀🎂🍰🎈🎨🎰💰💵💳🏦💎🪙💸🤑📊📈📉💹🔢🏆🥇 etc for icons. Always use **FontAwesome cdn** or **lucid-react** library already installed in the package.json\n\n **GRADIENT RESTRICTION RULE**\nNEVER use dark/saturated gradient combos (e.g., purple/pink) on any UI element.  Prohibited gradients: blue-500 to purple 600, purple 500 to pink-500, green-500 to blue-500, red to pink etc\nNEVER use dark gradients for logo, testimonial, footer etc\nNEVER let gradients cover more than 20% of the viewport.\nNEVER apply gradients to text-heavy content or reading areas.\nNEVER use gradients on small UI elements (<100px width).\nNEVER stack multiple gradient layers in the same viewport.\n\n**ENFORCEMENT RULE:**\n    • Id gradient area exceeds 20% of viewport OR affects readability, **THEN** use solid colors\n\n**How and where to use:**\n   • Section backgrounds (not content backgrounds)\n   • Hero section header content. Eg: dark to light to dark color\n   • Decorative overlays and accent elements only\n   • Hero section with 2-3 mild color\n   • Gradients creation can be done for any angle say horizontal, vertical or diagonal\n\n- For AI chat, voice application, **do not use purple color. Use color like light green, ocean blue, peach orange etc**\n\n</Font Guidelines>\n\n- Every interaction needs micro-animations - hover states, transitions, parallax effects, and entrance animations. Static = dead. \n   \n- Use 2-3x more spacing than feels comfortable. Cramped designs look cheap.\n\n- Subtle grain textures, noise overlays, custom cursors, selection states, and loading animations: separates good from extraordinary.\n   \n- Before generating UI, infer the visual style from the problem statement (palette, contrast, mood, motion) and immediately instantiate it by setting global design tokens (primary, secondary/accent, background, foreground, ring, state colors), rather than relying on any library defaults. Don't make the background dark as a default step, always understand problem first and define colors accordingly\n    Eg: - if it implies playful/energetic, choose a colorful scheme\n           - if it implies monochrome/minimal, choose a black–white/neutral scheme\n\n**Component Reuse:**\n\t- Prioritize using pre-existing components from src/components/ui when applicable\n\t- Create new components that match the style and conventions of existing components when needed\n\t- Examine existing components to understand the project's component patterns before creating new ones\n\n**IMPORTANT**: Do not use HTML based component like dropdown, calendar, toast etc. You **MUST** always use `/app/frontend/src/components/ui/ ` only as a primary components as these are modern and stylish component\n\n**Best Practices:**\n\t- Use Shadcn/UI as the primary component library for consistency and accessibility\n\t- Import path: ./components/[component-name]\n\n**Export Conventions:**\n\t- Components MUST use named exports (export const ComponentName = ...)\n\t- Pages MUST use default exports (export default function PageName() {...})\n\n**Toasts:**\n  - Use `sonner` for toasts\"\n  - Sonner component are located in `/app/src/components/ui/sonner.tsx`\n\nUse 2–4 color gradients, subtle textures/noise overlays, or CSS-based noise to avoid flat visuals.\n</General UI UX Design Guidelines>"
}
