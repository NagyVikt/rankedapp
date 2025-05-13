<div
  style={{
    position: 'relative',
    display: 'flex',
    flexDirection: 'column', // Align items vertically
    alignItems: 'center', // Center items horizontally
    width: '500px',
    height: '900px', // Keep height
    overflow: 'hidden',
    // Softer gradient, adjusted angle
    background: 'linear-gradient(160deg, #5a0808 0%, #a31f1f 80%)',
    color: '#fff',
    // Using a cleaner sans-serif font
    fontFamily: '"Inter", sans-serif', // Added fallback
    borderRadius: '15px', // Added subtle rounding
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)', // Added a subtle shadow for depth
  }}
>
  {/* Top bar: social icons + logo */}
  <div
    style={{
      position: 'absolute',
      top: '25px',
      left: '25px',
      display: 'flex',
      gap: '15px', // Increased gap
      zIndex: 4, // Ensure it's above everything
      filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.4))', // Add shadow to icons
    }}
  >
    {/* Slightly larger icons */}
    <span style={{ fontSize: '20px' }}>📸</span>
    <span style={{ fontSize: '20px' }}>👍</span>
    <span style={{ fontSize: '20px' }}>🐦</span>
    <span style={{ fontSize: '20px' }}>💬</span>
  </div>
  <div
    style={{
      position: 'absolute',
      top: '25px',
      right: '25px',
      fontSize: '20px', // Slightly larger
      fontWeight: 800, // Bolder
      letterSpacing: '1px', // Added letter spacing
      zIndex: 4, // Ensure it's above everything
      textShadow: '0 2px 3px rgba(0,0,0,0.4)', // Add shadow to logo text
    }}
  >
    LOGO HERE
  </div>

  {/* Headline */}
  <div
    style={{
      // Removed absolute positioning, let flexbox handle it
      marginTop: '80px', // Pushed down from the top
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      textAlign: 'center',
      zIndex: 3,
      lineHeight: 1.1, // Keep line height tight
      textShadow: '0 3px 5px rgba(0,0,0,0.5)', // Add shadow to headline
    }}
  >
    <div
      style={{
        fontSize: '38px',
        letterSpacing: '3px',
        opacity: 0.95,
        fontWeight: 600,
      }}
    >
      SUPER DELICIOUS
    </div>
    <div
      style={{
        fontSize: '110px', // Slightly larger
        fontWeight: 900,
        // Enhanced gradient
        backgroundImage: 'linear-gradient(90deg, #fff700, #ffc84d)',
        backgroundClip: 'text',
        WebkitBackgroundClip: 'text', // Keep for compatibility
        color: 'transparent',
        marginTop: '-10px', // Pull up slightly
      }}
    >
      BURGER
    </div>
  </div>

  {/* Center hero burger image */}
  <img
    src="image_dbb571.jpg" // Using the latest uploaded image
    alt="Delicious Burger"
    width={550} // Adjusted size slightly
    height={550} // Adjusted size slightly
    style={{
      position: 'absolute',
      left: '50%',
      // Adjusted bottom positioning to interact better with button/footer
      bottom: '100px',
      transform: 'translateX(-50%)',
      objectFit: 'contain',
      zIndex: 2, // Below text/buttons but above background
      // Added a subtle drop shadow to the image
      filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.4))',
    }}
  />

  {/* 50% badge - Redesigned */}
  <div
    style={{
      position: 'absolute',
      left: '30px', // Adjusted position
      bottom: '200px', // Adjusted position
      zIndex: 3,
      backgroundColor: '#ffcc00', // Match button color
      color: '#a30000', // Dark red text for contrast
      borderRadius: '50%', // Make it circular
      width: '100px',
      height: '100px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      textAlign: 'center',
      boxShadow: '0 5px 10px rgba(0, 0, 0, 0.3)',
      transform: 'rotate(-15deg)', // Tilted slightly
    }}
  >
    <div
      style={{
        fontSize: '40px', // Adjusted size
        fontWeight: 900, // Bolder
        lineHeight: 1,
      }}
    >
      50%
    </div>
    <div
      style={{ fontSize: '16px', fontWeight: 600, textTransform: 'uppercase' }}
    >
      OFF
    </div>
  </div>

  {/* Call-to-action button */}
  <button
    style={{
      position: 'absolute',
      left: '50%',
      bottom: '60px', // Adjusted position
      transform: 'translateX(-50%)',
      padding: '18px 55px', // Slightly larger padding
      fontSize: '26px', // Slightly larger text
      fontWeight: 800, // Bolder
      backgroundColor: '#ffcc00',
      color: '#8c1c1c', // Darker text for better contrast
      border: 'none',
      borderRadius: '50px', // More rounded
      cursor: 'pointer',
      zIndex: 3,
      boxShadow: '0 6px 12px rgba(0, 0, 0, 0.3)', // Enhanced shadow
      transition: 'transform 0.2s ease, background-color 0.2s ease', // Basic transition (won't work directly in Satori's static SVG/PNG)
    }}
    // Basic hover effect simulation (won't work in static images)
    onMouseOver={(e) => {
      e.currentTarget.style.backgroundColor = '#ffd633';
      e.currentTarget.style.transform = 'translateX(-50%) scale(1.05)';
    }}
    onMouseOut={(e) => {
      e.currentTarget.style.backgroundColor = '#ffcc00';
      e.currentTarget.style.transform = 'translateX(-50%) scale(1)';
    }}
  >
    ORDER NOW
  </button>

  {/* Footer contact & location */}
  <div
    style={{
      position: 'absolute',
      bottom: '20px',
      left: '25px',
      display: 'flex',
      alignItems: 'center',
      fontSize: '16px', // Slightly smaller for footer
      gap: '8px',
      zIndex: 3,
      opacity: 0.8, // Slightly faded
      textShadow: '0 1px 2px rgba(0,0,0,0.4)',
    }}
  >
    <span>📞</span>
    <span>0001-2345-6789</span>
  </div>
  <div
    style={{
      position: 'absolute',
      bottom: '20px',
      right: '25px',
      display: 'flex',
      alignItems: 'center',
      fontSize: '16px', // Slightly smaller for footer
      gap: '8px',
      zIndex: 3,
      opacity: 0.8, // Slightly faded
      textAlign: 'right',
      textShadow: '0 1px 2px rgba(0,0,0,0.4)',
    }}
  >
    <span>Your Address, ZIP</span>
    <span>📍</span> {/* Icon after text */}
  </div>
</div>;
