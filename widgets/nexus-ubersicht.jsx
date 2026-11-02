// =========================================================
// NEXUS // Desktop Widget for Übersicht (macOS MacBook Air M4)
// Place this file in: ~/Library/Application Support/Übersicht/widgets/nexus-ubersicht.jsx
// =========================================================

export const command = '';

// Refresh frequency: 60 seconds
export const refreshFrequency = 60000;

export const className = `
  top: 32px;
  left: 24px;
  right: 24px;
  bottom: 24px;
  z-index: 0;
  pointer-events: auto;
  user-select: none;
`;

export const render = () => {
  // Uses local dev server or deployed GitHub Pages with ?mode=widget for 100% desktop glass transparency
  const widgetUrl = 'http://localhost:5173/?mode=widget';

  return (
    <div style={{
      width: '100%',
      height: '100%',
      position: 'relative',
      borderRadius: '24px',
      overflow: 'hidden',
      background: 'transparent',
    }}>
      <iframe
        src={widgetUrl}
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
          background: 'transparent',
        }}
        title="NEXUS Couple Life OS Desktop Widget"
      />
    </div>
  );
};
