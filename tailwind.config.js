/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        nexus: {
          bg: '#0b0d11',
          surface: 'rgba(15, 17, 21, 0.78)',
          card: 'rgba(21, 24, 30, 0.72)',
          border: 'rgba(255, 255, 255, 0.08)',
          'border-hover': 'rgba(255, 255, 255, 0.16)',
          accent: {
            red: '#ef4444',
            green: '#22c55e',
            yellow: '#eab308',
            amber: '#f59e0b',
            slate: '#64748b',
            cyan: '#06b6d4',
            purple: '#a855f7',
            blue: '#3b82f6',
          }
        }
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"SF Pro Display"',
          '"SF Pro Text"',
          '"Segoe UI"',
          'Roboto',
          'sans-serif'
        ],
        mono: [
          '"SF Mono"',
          'Menlo',
          'Monaco',
          'Consolas',
          'monospace'
        ]
      },
      boxShadow: {
        'glass': '0 4px 20px -2px rgba(0, 0, 0, 0.5), 0 0 1px 1px rgba(255, 255, 255, 0.05) inset',
        'today-glow': '0 0 24px rgba(245, 158, 11, 0.15), inset 0 0 12px rgba(245, 158, 11, 0.05)',
        'red-glow': '0 0 16px rgba(239, 68, 68, 0.25)',
        'green-glow': '0 0 16px rgba(34, 197, 94, 0.25)',
        'yellow-glow': '0 0 16px rgba(234, 179, 8, 0.25)',
      },
      backdropBlur: {
        '28': '28px',
      }
    },
  },
  plugins: [],
};
