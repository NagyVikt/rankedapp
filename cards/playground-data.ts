export type Tabs = {
  [x: string]: string
}

const playgroundTabs: Tabs = {
  helloworld: `

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
    <div style={{ fontSize: '38px', letterSpacing: '3px', opacity: 0.95, fontWeight: 600 }}>
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
    src="burger.png"
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
    <div style={{ fontSize: '16px', fontWeight: 600, textTransform: 'uppercase' }}>
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
    onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#ffd633'; e.currentTarget.style.transform = 'translateX(-50%) scale(1.05)'; }}
    onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#ffcc00'; e.currentTarget.style.transform = 'translateX(-50%) scale(1)'; }}
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
</div>

`,
  Vercel: `<div
  style={{
    height: '100%',
    width: '100%',
    display: 'flex',
    textAlign: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    flexWrap: 'nowrap',
    backgroundColor: 'white',
    backgroundImage: 'radial-gradient(circle at 25px 25px, lightgray 2%, transparent 0%), radial-gradient(circle at 75px 75px, lightgray 2%, transparent 0%)',
    backgroundSize: '100px 100px',
  }}
>
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    <svg
      height={80}
      viewBox="0 0 75 65"
      fill="black"
      style={{ margin: '0 75px' }}
    >
      <path d="M37.59.25l36.95 64H.64l36.95-64z"></path>
    </svg>
  </div>
  <div
    style={{
      display: 'flex',
      fontSize: 40,
      fontStyle: 'normal',
      color: 'black',
      marginTop: 30,
      lineHeight: 1.8,
      whiteSpace: 'pre-wrap',
    }}
  >
    <b>Vercel Edge Network</b>
  </div>
</div>
`,
  rauchg: `<div
  style={{
    display: 'flex',
    height: '100%',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    letterSpacing: '-.02em',
    fontWeight: 700,
    background: 'white',
  }}
>
  <div
    style={{
      left: 42,
      top: 42,
      position: 'absolute',
      display: 'flex',
      alignItems: 'center',
    }}
  >
    <span
      style={{
        width: 24,
        height: 24,
        background: 'black',
      }}
    />
    <span
      style={{
        marginLeft: 8,
        fontSize: 20,
      }}
    >
      rauchg.com
    </span>
  </div>
  <div
    style={{
      display: 'flex',
      flexWrap: 'wrap',
      justifyContent: 'center',
      padding: '20px 50px',
      margin: '0 42px',
      fontSize: 40,
      width: 'auto',
      maxWidth: 550,
      textAlign: 'center',
      backgroundColor: 'black',
      color: 'white',
      lineHeight: 1.4,
    }}
  >
    Making the Web. Faster.
  </div>
</div>
`,
  'Tailwind (experimental)': `// Modified based on https://tailwindui.com/components/marketing/sections/cta-sections

<div tw="flex flex-col w-full h-full items-center justify-center bg-white">
  <div tw="bg-gray-50 flex w-full">
    <div tw="flex flex-col md:flex-row w-full py-12 px-4 md:items-center justify-between p-8">
      <h2 tw="flex flex-col text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 text-left">
        <span>Ready to dive in?</span>
        <span tw="text-indigo-600">Start your free trial today.</span>
      </h2>
      <div tw="mt-8 flex md:mt-0">
        <div tw="flex rounded-md shadow">
          <a tw="flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-5 py-3 text-base font-medium text-white">Get started</a>
        </div>
        <div tw="ml-3 flex rounded-md shadow">
          <a tw="flex items-center justify-center rounded-md border border-transparent bg-white px-5 py-3 text-base font-medium text-indigo-600">Learn more</a>
        </div>
      </div>
    </div>
  </div>
</div>`,
  Gradients: `<div
  style={{
    display: 'flex',
    height: '100%',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    backgroundImage: 'linear-gradient(to bottom, #dbf4ff, #fff1f1)',
    fontSize: 60,
    letterSpacing: -2,
    fontWeight: 700,
    textAlign: 'center',
  }}
  >
  <div
    style={{
      backgroundImage: 'linear-gradient(90deg, rgb(0, 124, 240), rgb(0, 223, 216))',
      backgroundClip: 'text',
      '-webkit-background-clip': 'text',
      color: 'transparent',
    }}
  >
    Develop
  </div>
  <div
    style={{
      backgroundImage: 'linear-gradient(90deg, rgb(121, 40, 202), rgb(255, 0, 128))',
      backgroundClip: 'text',
      '-webkit-background-clip': 'text',
      color: 'transparent',
    }}
  >
    Preview
  </div>
  <div
    style={{
      backgroundImage: 'linear-gradient(90deg, rgb(255, 77, 77), rgb(249, 203, 40))',
      backgroundClip: 'text',
      '-webkit-background-clip': 'text',
      color: 'transparent',
    }}
  >
    Ship
  </div>
</div>
`,
  'Color Models': `<div
  style={{
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    fontSize: 24,
    fontWeight: 600,
    textAlign: 'left',
    padding: 70,
    color: 'red',
    backgroundImage: 'linear-gradient(to right, #334d50, #cbcaa5)',
    height: '100%',
    width: '100%'
  }}
>

  <div style={{ display: 'flex', flexDirection: 'column' }}>
    <div style={{ display: 'flex', flexDirection: 'column', marginBottom: '15px', color: '#fff' }}>
      #fff
      <div style={{ fontWeight: 100 }}>hexadecimal</div>
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', marginBottom: '15px', color: '#ffffff70' }}>
      #ffffff70
      <div style={{ fontWeight: 100 }}>hexadecimal + transparency</div>
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', marginBottom: '15px', color: 'rgb(45, 45, 45)' }}>
      rgb(45, 45, 45)
      <div style={{ fontWeight: 100 }}>rgb</div>
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', marginBottom: '15px', color: 'rgb(45, 45, 45, 0.3)' }}>
      rgb(45, 45, 45, 0.3)
      <div style={{ fontWeight: 100 }}>rgba</div>
    </div>
  </div>

  <div style={{ display: 'flex', flexDirection: 'column' }}>
    <div style={{ display: 'flex', flexDirection: 'column', marginBottom: '15px', color: 'hsl(186, 22%, 26%)' }}>
      hsl(186, 22%, 26%)
      <div style={{ fontWeight: 100 }}>hsl</div>
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', marginBottom: '15px', color: 'hsla(186, 22%, 26%, 40%)' }}>
      hsla(186, 22%, 26%, 40%)
      <div style={{ fontWeight: 100 }}>hsla</div>
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', marginBottom: '15px', color: 'white' }}>
      "white"
      <div style={{ fontWeight: 100 }}>predefined color names</div>
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', marginBottom: '15px', color: 'currentcolor' }}>
      should be red
      <div style={{ fontWeight: 100 }}>"currentcolor"</div>
    </div>
  </div>
</div>`,
  Advanced: `// Fallback fonts and Emoji are dynamically loaded
// from Google Fonts and CDNs in this demo.

// You can also return a function component in the playground.
() => {
  function Label({ children }) {
    return <label style={{
      fontSize: 15,
      fontWeight: 600,
      textTransform: 'uppercase',
      letterSpacing: 1,
      margin: '25px 0 10px',
      color: 'gray',
    }}>
      {children}
    </label>
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        width: '100%',
        padding: '10px 20px',
        justifyContent: 'center',
        fontFamily: 'Inter, "Material Icons"',
        fontSize: 28,
        backgroundColor: 'white',
      }}
      >
      <Label>Language & Font subsets</Label>
      <div>
        Hello! 你好! 안녕! こんにちは! Χαίρετε! Hallå!
      </div>
      <Label>Emoji</Label>
      <div>
        👋 😄 🎉 🎄 🦋
      </div>
      <Label>Icon font</Label>
      <div>
          &#xe766; &#xeb9b; &#xf089;
      </div>
      <Label>Lang attribute</Label>
      <div style={{ display: 'flex' }}>
        <span lang="ja-JP">
          骨茶
        </span>/
        <span lang="zh-CN">
          骨茶
        </span>/
        <span lang="zh-TW">
          骨茶
        </span>/
        <span lang="zh-HK">
          骨茶
        </span>
      </div>
    </div>
  )
}  
`,
}

export default playgroundTabs
