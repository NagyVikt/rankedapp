"use client"; // This is a Client Component

import React, { useState, useEffect } from 'react';

// --- Placeholder Components (replace with your actual imports) ---
const FramerWrapper = ({ children, className, y, x, ...props }) => (
  <div className={className} {...props} style={{ transform: `translate(${x || 0}px, ${y || 0}px)` }}>{children}</div>
);

const SocialLinks = () => <div className="text-sm text-gray-500">Social Links Placeholder</div>;

const HeroTexts = ({ inviterUsername, userName, selectedLanguage, currentPageTitle }) => {
  const greeting = selectedLanguage === 'hu' ? `Szia ${userName}!` : `Hello ${userName}!`;
  const welcomeMessage = selectedLanguage === 'hu'
    ? `Üdvözöllek! Meghívott: ${inviterUsername}.`
    : `Welcome! You were invited by ${inviterUsername}.`;

  return (
    <div className="space-y-4 text-gray-800">
      <h1 className="text-4xl md:text-5xl font-bold text-gray-900">{greeting}</h1>
      <p className="text-xl text-gray-700">{welcomeMessage}</p>
      <p className="text-gray-600">
        This is the main content area. Currently viewing: <span className="font-semibold">{currentPageTitle}</span>
      </p>
    </div>
  );
};

const HeroImage = () => (
  <div className="bg-gray-200 w-full max-w-md lg:max-w-none mx-auto h-64 sm:h-80 md:h-96 rounded-lg flex items-center justify-center text-gray-500">
    Hero Image Placeholder
  </div>
);

const Button = ({ children, onClick, className, variant, type, disabled, ...props }) => {
  const baseStyle = "px-6 py-3 rounded-lg font-semibold shadow-md focus:outline-none focus:ring-2 ring-offset-2 focus:ring-opacity-75 transition-all duration-150 ease-in-out text-base disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2";
  
  let specificStyle = "";
  switch (variant) {
    case "primary": 
      specificStyle = "bg-indigo-600 hover:bg-indigo-700 text-white focus:ring-indigo-500 ring-offset-white";
      break;
    case "language-select": 
      specificStyle = "bg-gray-900 hover:bg-gray-700 text-white focus:ring-gray-500 ring-offset-white text-lg py-4";
      break;
    case "secondary-light": 
      specificStyle = "bg-gray-700 hover:bg-gray-800 text-white focus:ring-gray-600 ring-offset-gray-100";
      break;
    case "outline-light": 
      specificStyle = "border border-gray-300 hover:bg-gray-100 text-gray-700 focus:ring-gray-400 shadow-sm ring-offset-white";
      break;
    default: 
      specificStyle = "bg-indigo-600 hover:bg-indigo-700 text-white focus:ring-indigo-500 ring-offset-white";
  }

  return (
    <button type={type || "button"} onClick={onClick} className={`${baseStyle} ${specificStyle} ${className}`} disabled={disabled} {...props}>
      {children}
    </button>
  );
};

const GithubBtn = () => (
  <Button variant="outline-light" className="absolute top-6 right-6 z-20 !p-2 sm:!p-3">
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-github"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>
    <span className="sr-only">GitHub</span>
  </Button>
);

const DownLoadResumeBtn = () => <Button variant="primary" className="w-full sm:w-auto">Download Resume</Button>;
// --- End of Placeholder Components ---

// Localization content
const translations = {
  en: {
    chooseLanguage: "Choose your language",
    invitedBy: "You were invited by:",
    english: "English",
    hungarian: "Hungarian",
    whatIsYourName: "What is your name?",
    submitName: "Continue",
    namePlaceholder: "Enter your name",
    previousStep: "Previous",
    nextStep: "Next",
    marketingQuote: "Don't let others blow the passion away from you.", 
  },
  hu: {
    chooseLanguage: "Válassz nyelvet",
    invitedBy: "Meghívott:",
    english: "Angol",
    hungarian: "Magyar",
    whatIsYourName: "Mi a neved?",
    submitName: "Tovább",
    namePlaceholder: "Add meg a neved",
    previousStep: "Előző",
    nextStep: "Következő",
    marketingQuote: "Ne hagyd, hogy mások elfújják belőled a szenvedélyt.", 
  },
};

// Placeholder for page order
const pageOrder = [
  { id: "welcome", title: "Welcome Home" },
  { id: "about", title: "About Us" },
  { id: "services", title: "Our Services" },
  { id: "contact", title: "Contact Information" },
];

// Candle Animation Component
const CandleAnimation = ({ playFullAnimation }) => {
  // The `playFullAnimation` prop determines if animations run once or infinitely.
  // For the one-time effect, we'll use CSS to make them run once and hold.
  // If we wanted them to loop *after* the initial one-time animation, this prop would be more crucial for JS-driven animation control.
  const animationIterationCount = playFullAnimation ? 1 : 'infinite'; // This is a conceptual prop, actual control is in CSS below

  return (
    <>
      <style jsx global>{`
        .candle-wrapper {
          position: relative; 
          left: 50%;
          top: 50%; 
          transform: translate(-50%, -50%) scale(0.65, 0.65); /* Adjusted scale */
          width: 250px; 
          height: 170px; /* Adjusted height */
        }

        .floor {
          position: absolute; left: 50%; top: 95%; 
          width: 140%; height: 5px; background: #673C63;
          transform: translate(-50%, -50%); box-shadow: 0px 2px 5px #111; z-index: 2;
        }

        .candles {
          position: absolute; left: 50%; top: 50%; 
          width: 250px; height: 150px;
          transform: translate(-50%, -65%); z-index: 1;
        }

        .candle1 {
          position: absolute; left: 50%; top: 50%;
          width: 35px; height: 100px; background: #fff;
          border: 3px solid #673C63; border-bottom: 0px; border-radius: 3px;
          transform-origin: center right; transform: translate(60%, -25%);
          box-shadow: -2px 0px 0px #95c6f2 inset;
          animation: expand-body 3s 1 linear forwards; /* Run once, hold last frame */
        }
      
        .candle1__stick, .candle2__stick {
          position: absolute; left: 50%; top: 0%;
          width: 3px; height: 15px; background: #673C63;
          border-radius: 8px; transform: translate(-50%, -100%);
        }

        .candle2__stick {
          height: 12px; transform-origin: bottom center;
          animation: stick-animation 3s 1 linear forwards; /* Run once */
        }

        .candle1__eyes, .candle2__eyes {
          position: absolute; left: 50%; top: 0%;
          width: 100%; height: 30px; transform: translate(-50%, 0%);
        }

        .candle1__eyes-one {
          position: absolute; left: 30%; top: 20%;
          width: 5px; height: 5px; border-radius: 100%; background: #673C63;
          transform: translate(-50%, 0%); 
          animation: blink-eyes 3s 1 linear forwards; /* Run once */
        }

        .candle1__eyes-two {
          position: absolute; left: 70%; top: 20%;
          width: 5px; height: 5px; border-radius: 100%; background: #673C63;
          transform: translate(-50%, 0%); 
          animation: blink-eyes 3s 1 linear forwards; /* Run once */
        }

        .candle1__mouth {
          position: absolute; left: 50%; top: 55%; 
          width: 0px; height: 0px; border-radius: 20px; background: #673C63;
          transform: translate(-50%, -50%);
          animation: uff 3s 1 linear forwards; /* Run once */
        }

        .candle__smoke-one {
          position: absolute; left: 30%; top: 50%;
          width: 30px; height: 3px; background: grey;
          transform: translate(-50%, -50%);
          animation: move-left 3s 1 linear forwards; /* Run once */
        }

        .candle__smoke-two {
          position: absolute; left: 30%; top: 40%;
          width: 10px; height: 10px; border-radius: 10px; background: grey;
          transform: translate(-50%, -50%);
          animation: move-top 3s 1 linear forwards; /* Run once */
        }

        .candle2 {
          position: absolute; left: 20%; top: 65%;
          width: 42px; height: 60px; background: #fff;
          border: 3px solid #673C63; border-bottom: 0px; border-radius: 3px;
          transform: translate(60%, -15%); transform-origin: center right;
          box-shadow: -2px 0px 0px #95c6f2 inset;
          animation: shake-left 3s 1 linear forwards; /* Run once */
        }
        
        .candle2__eyes { width:100%; }

        .candle2__eyes-one {
          position: absolute; left: 30%; top: 50%;
          width: 5px; height: 5px; border: 0px solid #673C63; border-radius: 100%;
          background: #673C63; transform: translate(-50%, -50%);
          animation: changeto-lower 3s 1 linear forwards; /* Run once */
        }

        .candle2__eyes-two {
          position: absolute; left: 70%; top: 50%;
          width: 5px; height: 5px; border: 0px solid #673C63; border-radius: 100%;
          background: #673C63; transform: translate(-50%, -50%);
          animation: changeto-greater 3s 1 linear forwards; /* Run once */
        }

        .light__wave {
          position: absolute; top: 35%; left: 35%;
          width: 75px; height: 75px; border-radius: 100%; z-index: 0;
          transform: translate(-25%, -50%) scale(2.5, 2.5);
          border: 2px solid rgba(255, 255, 255, 0.2);
          animation: expand-light 3s 1 linear forwards; /* Run once */
        }

        .candle2__fire {
          position: absolute; top: 50%; left: 40%; display: block;
          width: 16px; height: 20px; background-color: red;
          border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%;
          background: #FF9800; transform: translate(-50%, -50%);
          animation: dance-fire-once 3s 1 linear forwards; /* Use new one-time animation */
        }

        /* Keyframes for Animations - All set to run once and hold last frame */
        @keyframes blink-eyes {
          0%,35% { opacity: 1; transform: translate(-50%, 0%);}
          36%,39% { opacity: 0; transform: translate(-50%, 0%);}
          40%, 49% { opacity: 1; transform: translate(-50%, 0%);}
          50%,65% { opacity: 1; transform: translate(-50%, 0%) translateX(-10px); } 
          66%, 100% { opacity: 1; transform: translate(-50%, 0%); } /* Eyes stay open */
        }
        @keyframes expand-body {
          0%,40% { transform: scale(1, 1) translate(60%, -25%); }
          45%,55% { transform: scale(1.1, 1.1) translate(60%, -28%); }
          60% { transform: scale(0.89, 0.89) translate(60%, -25%); }
          65%, 100% { transform: scale(1, 1) translate(60%, -25%); } /* Ends at normal scale */
        }
        @keyframes uff { 
          0%,40% { width: 0px; height: 0px; }
          50%,54% { width: 15px; height: 15px; background: #673C63; }
          59% { width: 5px; height: 5px; }
          62% { width: 2px; height: 2px; }
          67%, 100% { width: 0px; height: 0px; } /* Mouth closed */
        }
        @keyframes move-left { 
          0%,59% { width: 0px; left: 40%; opacity: 0; }
          60%, 67% { width: 30px; left: 30%; opacity: 1; }
          68%, 100% { width: 0px; left: 20%; opacity: 0; } /* Smoke disappears */
        }
        @keyframes move-top { 
          0%,64% { width: 0px; height: 0px; top: 0%; opacity: 0; }
          65%, 79% { width: 10px; height: 10px; top: 40%; left: 40%; opacity: 1; }
          80%, 100% { width: 0px; height: 0px; top: 20%; opacity: 0; } /* Smoke disappears */
        }
        @keyframes shake-left { 
          0%,40% { left: 20%; transform: translate(60%, -15%); }
          50%,54% { left: 20%; transform: translate(60%, -15%); }
          59% { left: 20%; transform: translate(60%, -15%); }
          62% { left: 18%; transform: translate(60%, -15%); }
          65% { left: 21%; transform: translate(60%, -15%); }
          67%, 74% { left: 20%; transform: translate(60%, -15%); }
          75% { left: 20%; transform: scale(1.15, 0.85) translate(60%, -15%); background: #fff; border-color: #673C63; }
          91% { left: 20%; transform: scale(1.18, 0.82) translate(60%, -10%); background: #F44336; border-color: #F44336; box-shadow: -2px 0px 0px #F44336 inset; }
          92% { left: 20%; transform: scale(0.85, 1.15) translate(60%, -15%); }
          95% { left: 20%; transform: scale(1.05, 0.95) translate(60%, -15%); }
          97%, 100% { left: 20%; transform: scale(1, 1) translate(60%, -15%); background: #fff; border-color: #673C63; box-shadow: -2px 0px 0px #95c6f2 inset;} /* Ends in normal state */
        }
        @keyframes stick-animation { 
          0%,40% { transform: translate(-50%, -100%); }
          50%,54% { transform: translate(-50%, -100%); }
          59% { transform: translate(-50%, -100%); }
          62% { transform: rotateZ(-15deg) translate(-50%, -100%); }
          65% { transform: rotateZ(15deg) translate(-50%, -100%); }
          70% { transform: rotateZ(-5deg) translate(-50%, -100%); }
          72% { transform: rotateZ(5deg) translate(-50%, -100%); }
          74%,84% { transform: rotateZ(0deg) translate(-50%, -100%); }
          85% { transform: rotateZ(180deg) translate(0%, 120%); } 
          92%, 100% { transform: translate(-50%, -100%); } /* Stick back in place */
        }
        @keyframes expand-light { 
          10%,29%,59%,89% { transform: translate(-25%, -50%) scale(0, 0); border: 2px solid rgba(255, 255, 255, 0); }
          90%,20%,50% { transform: translate(-25%, -50%) scale(1, 1); }
          95%,96%,26%,27%,56%,57% { transform: translate(-25%, -50%) scale(2, 2); border: 2px solid rgba(255, 255, 255, 0.5); }
          0%,28%,58%,100% { transform: translate(-25%, -50%) scale(2.5, 2.5); border: 2px solid rgba(255, 255, 255, 0.2); opacity: 0; } /* Ends faded out */
        }
        @keyframes dance-fire-once { /* Candle 2 fire animation - one cycle, relights and stays */
          0%, 6% { left: 40.8%; width: 16px; height: 20px; background: #FFC107; opacity: 1; } /* Start lit */
          7%, 10% { left: 41.2%; width: 16px; height: 20px; background: #FF9800; opacity: 1; }
          /* ... (original flickering can be condensed here if desired for one cycle) ... */
          58% { opacity: 1; background: #FF9800; width: 16px; height: 20px; left: 40%;} /* Last moment before blow out */
          59%, 89% { left: 40%; width: 0px; height: 0px; opacity: 0; } /* Fire out */
          90%, 100% { /* Relit and stays */
            left: 40.8%; width: 16px; height: 20px; background: #FFC107; opacity: 1;
          }
        }
        @keyframes changeto-lower { 
          0%,70% { padding: 0px; border-radius: 100%; background: #673C63; border-width: 0; transform: translate(-50%, -50%); }
          71%,89% { background: none; border: solid #673C63; border-radius: 0px; border-width: 0 2px 2px 0; display: inline-block; padding: 1px; transform-origin: bottom left; transform: rotate(-45deg) translate(-50%, -65%); }
          90%, 100% { padding: 0px; border-radius: 100%; background: #673C63; border-width: 0; transform: translate(-50%, -50%); } /* Ends as normal eye */
        }
        @keyframes changeto-greater { 
          0%,70% { top: 50%; padding: 0px; border-radius: 100%; background: #673C63; border-width: 0; transform: translate(-50%, -50%); }
          71%,89% { top: 30%; background: none; border: solid #673C63; border-radius: 0px; border-width: 0 2px 2px 0; display: inline-block; padding: 1px; transform-origin: bottom left; transform: rotate(135deg) translate(-80%, 20%); }
          90%, 100% { top: 50%; padding: 0px; border-radius: 100%; background: #673C63; border-width: 0; transform: translate(-50%, -50%); } /* Ends as normal eye */
        }
      `}</style>
      <div className="candle-wrapper">
        <div className="candles">
          <div className="light__wave"></div>
          <div className="candle1">
            <div className="candle1__body">
              <div className="candle1__eyes">
                <span className="candle1__eyes-one"></span>
                <span className="candle1__eyes-two"></span>
              </div>
              <div className="candle1__mouth"></div>
            </div>
            <div className="candle1__stick"></div>
          </div>
          
          <div className="candle2">
            <div className="candle2__body">
              <div className="candle2__eyes">
                <div className="candle2__eyes-one"></div>
                <div className="candle2__eyes-two"></div>
              </div>
            </div>
            <div className="candle2__stick"></div>
          </div>
          <div className="candle2__fire"></div>
          <div className="sparkles-one"></div>
          <div className="sparkles-two"></div>
          <div className="candle__smoke-one"></div>
          <div className="candle__smoke-two"></div>
        </div>
        <div className="floor"></div>
      </div>
    </>
  );
};

export default function Home() {
  const [step, setStep] = useState('loading'); 
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [userName, setUserName] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [setupComplete, setSetupComplete] = useState(false);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  
  const [initialAnimationTriggered, setInitialAnimationTriggered] = useState(false);
  const [isDarkPhaseActive, setIsDarkPhaseActive] = useState(false);
  const [showQuote, setShowQuote] = useState(false);

  const inviterUsername = "DEADPOOL";
  const logoSrc = "./logo.png"; 

  useEffect(() => {
    const storedLanguage = localStorage.getItem('selectedLanguage');
    const storedUserName = localStorage.getItem('userName');
    const storedSetupComplete = localStorage.getItem('setupComplete');

    if (storedSetupComplete === 'true' && storedUserName && storedLanguage) {
      setSelectedLanguage(storedLanguage);
      setUserName(storedUserName);
      setSetupComplete(true);
      setInitialAnimationTriggered(true); // Skip animation if already setup
      setStep('welcome');
    } else {
      setStep('language');
    }
  }, []);

  useEffect(() => {
    if (setupComplete) {
      localStorage.setItem('selectedLanguage', selectedLanguage);
      localStorage.setItem('userName', userName);
      localStorage.setItem('setupComplete', 'true');
    }
  }, [selectedLanguage, userName, setupComplete]);

   useEffect(() => {
    if (logoSrc && logoSrc !== './logo.png') { 
        const img = new Image();
        img.src = logoSrc;
    }
  }, [logoSrc]);

  // One-time animation sequence trigger
  useEffect(() => {
    if (!setupComplete && (step === 'language' || step === 'nameInput') && !initialAnimationTriggered) {
      setIsDarkPhaseActive(false); // Start with light
      setShowQuote(false);

      // Start dark phase after a short delay (e.g., to sync with candle blowing out)
      // 60% of 3s animation = 1.8s
      const darkPhaseTimeout = setTimeout(() => {
        setIsDarkPhaseActive(true);
        setShowQuote(true);
      }, 1770); // 59% of 3000ms

      // End dark phase and quote visibility
      // 97% of 3s animation = 2.91s
      const endDarkPhaseTimeout = setTimeout(() => {
        setIsDarkPhaseActive(false);
        setShowQuote(false);
        setInitialAnimationTriggered(true); // Mark that the full one-time animation has occurred
      }, 2910); // 97% of 3000ms

      return () => {
        clearTimeout(darkPhaseTimeout);
        clearTimeout(endDarkPhaseTimeout);
      };
    }
  }, [step, setupComplete, initialAnimationTriggered]);


  const t = translations[selectedLanguage] || translations.en;
  const currentMarketingQuote = selectedLanguage === 'hu' ? translations.hu.marketingQuote : translations.en.marketingQuote;


  const handleLanguageSelect = (lang) => {
    setSelectedLanguage(lang);
    setStep('nameInput');
  };

  const handleNameSubmit = (e) => {
    e.preventDefault();
    if (inputValue.trim()) {
      setUserName(inputValue.trim());
      setSetupComplete(true);
      setInitialAnimationTriggered(true); // Ensure animation doesn't replay if user goes back somehow (though prevented)
      setStep('welcome');
    }
  };

  const handleNextPage = () => {
    setCurrentPageIndex((prevIndex) => Math.min(prevIndex + 1, pageOrder.length - 1));
  };

  const handlePreviousPage = () => {
    setCurrentPageIndex((prevIndex) => Math.max(prevIndex - 1, 0));
  };
  
  if (step === 'loading') {
      return (
        <div className="min-h-screen w-full flex items-center justify-center bg-white">
            <p className="text-gray-700 text-xl">Loading...</p>
        </div>
      );
  }
  
  // Determine classes based on animation phase for initial steps
  const showOneTimeAnimation = !initialAnimationTriggered && !setupComplete && (step === 'language' || step === 'nameInput');
  
  const authContainerClasses = `min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden transition-colors duration-300 ease-linear
    ${showOneTimeAnimation && isDarkPhaseActive ? 'bg-black' : 'bg-white'}`;

  const widgetClasses = `w-full max-w-md p-8 sm:p-12 rounded-xl shadow-2xl text-center z-10 relative border transition-colors duration-300 ease-linear
    ${showOneTimeAnimation && isDarkPhaseActive ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}`;
  
  const quoteTextClasses = `text-xl md:text-2xl font-serif mb-1 transition-opacity duration-300 ease-linear
    ${showOneTimeAnimation && showQuote ? 'opacity-100 text-gray-300' : 'opacity-0'}`;

  const widgetTextPrimaryClasses = showOneTimeAnimation && isDarkPhaseActive ? 'text-gray-100' : 'text-gray-800';
  const widgetTextSecondaryClasses = showOneTimeAnimation && isDarkPhaseActive ? 'text-gray-300' : 'text-gray-600';
  const widgetLogoBorderClasses = showOneTimeAnimation && isDarkPhaseActive ? 'border-gray-700' : 'border-gray-100';
  const widgetInputClasses = `w-full p-4 rounded-lg border outline-none text-lg transition-colors duration-300 ease-linear
    ${showOneTimeAnimation && isDarkPhaseActive ? 
      'bg-gray-800 border-gray-600 text-gray-100 placeholder-gray-400 focus:ring-indigo-400 focus:border-indigo-400' : 
      'bg-white border-gray-300 text-gray-700 placeholder-gray-400 focus:ring-indigo-500 focus:border-indigo-500'}`;


  // Screens for language and name input
  const AuthScreenLayout = ({ children }) => (
    <div className={authContainerClasses}>
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 px-6 text-center z-20 flex flex-col items-center w-full max-w-lg">
            { (showOneTimeAnimation && showQuote) && (
                 <p className={quoteTextClasses}>
                    "{currentMarketingQuote}"
                 </p>
            )}
            <CandleAnimation playFullAnimation={showOneTimeAnimation} />
        </div>
        <div className={widgetClasses}>
            {children}
        </div>
    </div>
  );

  if (step === 'language') {
    return (
      <AuthScreenLayout>
        <img
          src={logoSrc}
          alt="Company Logo"
          className={`w-24 h-24 mx-auto mb-8 rounded-full object-cover shadow-lg border-4 transition-colors duration-300 ${widgetLogoBorderClasses}`}
          onError={(e) => {
            e.target.onerror = null;
            e.target.outerHTML = `<div class="w-24 h-24 mx-auto mb-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-xs border-4 ${widgetLogoBorderClasses} shadow-lg">Logo</div>`;
          }}
        />
        <div className="mb-6">
          <p className={`text-lg transition-colors duration-300 ${widgetTextSecondaryClasses}`}>
            {t.invitedBy}{" "}
            <span className={`font-semibold transition-colors duration-300 ${showOneTimeAnimation && isDarkPhaseActive ? 'text-indigo-400' : 'text-indigo-600'}`}>{inviterUsername}</span>
          </p>
        </div>
        <h2 className={`text-3xl sm:text-4xl font-bold mb-10 transition-colors duration-300 ${widgetTextPrimaryClasses}`}>
          {t.chooseLanguage}
        </h2>
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center">
          <Button
            onClick={() => handleLanguageSelect('en')}
            variant="language-select" 
            className="w-full"
          >
            <span role="img" aria-label="UK Flag" className="text-2xl">🇬🇧</span> {translations.en.english}
          </Button>
          <Button
            onClick={() => handleLanguageSelect('hu')}
            variant="language-select" 
            className="w-full" 
          >
            <span role="img" aria-label="Hungary Flag" className="text-2xl">🇭🇺</span> {translations.hu.hungarian}
          </Button>
        </div>
      </AuthScreenLayout>
    );
  }

  if (step === 'nameInput') {
    return (
      <AuthScreenLayout>
        <img
          src={logoSrc}
          alt="Company Logo"
          className={`w-20 h-20 mx-auto mb-8 rounded-full object-cover shadow-lg border-4 transition-colors duration-300 ${widgetLogoBorderClasses}`}
          onError={(e) => {
            e.target.onerror = null;
            e.target.outerHTML = `<div class="w-20 h-20 mx-auto mb-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-xs border-4 ${widgetLogoBorderClasses} shadow-lg">Logo</div>`;
          }}
        />
        <h2 className={`text-2xl sm:text-3xl font-semibold mb-8 transition-colors duration-300 ${widgetTextPrimaryClasses}`}>{t.whatIsYourName}</h2>
        <form onSubmit={handleNameSubmit} className="space-y-6">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={t.namePlaceholder}
            className={widgetInputClasses}
            required
          />
          <Button type="submit" variant="primary" className="w-full text-lg py-4">
            {t.submitName}
          </Button>
        </form>
      </AuthScreenLayout>
    );
  }

  // Screen 3: Welcome Page Content (Light Theme)
  if (step === 'welcome') {
    const currentPage = pageOrder[currentPageIndex] || pageOrder[0];

    return (
      <div className="min-h-screen flex flex-col bg-white text-gray-800"> 
        <GithubBtn />
        <div className="flex-grow flex flex-col lg:flex-row items-stretch">
          <FramerWrapper
            className="w-full lg:w-[55%] xl:w-1/2 h-auto flex flex-col justify-center items-center lg:items-start gap-6 p-8 sm:p-12 md:p-16 order-2 lg:order-1"
            y={0} 
            x={-100}
          >
            <HeroTexts
                inviterUsername={inviterUsername}
                userName={userName}
                selectedLanguage={selectedLanguage}
                currentPageTitle={currentPage.title}
            />
            <div className="h-fit w-full flex flex-col sm:flex-row items-center lg:items-start gap-4 mt-6">
              <SocialLinks />
            </div>
            <div className="mt-8 w-full flex justify-center lg:justify-start">
              <DownLoadResumeBtn />
            </div>
          </FramerWrapper>

          <FramerWrapper
            className="w-full lg:w-[45%] xl:w-1/2 relative flex items-center justify-center p-8 bg-gray-50 order-1 lg:order-2 min-h-[300px] lg:min-h-screen"
             y={0} 
             x={100}
          >
            <HeroImage />
          </FramerWrapper>
        </div>

        <div className="w-full p-4 sm:p-6 bg-gray-100 border-t border-gray-200">
          <div className="max-w-3xl mx-auto flex justify-between items-center">
            <Button
              onClick={handlePreviousPage}
              disabled={currentPageIndex === 0}
              variant="secondary-light"
              className="px-8"
            >
              {t.previousStep}
            </Button>
            <p className="text-sm text-gray-600">
              Step {currentPageIndex + 1} of {pageOrder.length}
            </p>
            <Button
              onClick={handleNextPage}
              disabled={currentPageIndex === pageOrder.length - 1}
              variant="secondary-light"
              className="px-8"
            >
              {t.nextStep}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
