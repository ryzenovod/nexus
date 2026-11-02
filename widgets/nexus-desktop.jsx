// =========================================================
// NEXUS // Desktop Widget for Übersicht (macOS)
// Place this file in: ~/Library/Application Support/Übersicht/widgets/nexus-desktop.jsx
// =========================================================

export const command = '';

// Refresh every 60 seconds
export const refreshFrequency = 60000;

export const className = `
  top: 36px;
  left: 28px;
  right: 28px;
  bottom: 28px;
  z-index: 0;
  pointer-events: auto;
  user-select: none;
`;

export const render = () => {
  // Points to local dev server or deployed GitHub Pages with ?mode=widget
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
