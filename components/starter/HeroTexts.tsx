import TextRotator from "./TextRotator";
import { portfolioConfig } from "@/./config/portfolio.config";
import { cn } from "@/lib/utils"; // Assuming you have cn utility for conditional classes

// Define props for HeroTexts, including an optional inviterUsername
interface HeroTextsProps {
  inviterUsername?: string; // Optional prop to display the inviter's username
}

// Updated HeroTexts component to accept inviterUsername prop
const HeroTexts = ({ inviterUsername }: HeroTextsProps) => {
  // Get the name parts from portfolioConfig
  const nameParts = portfolioConfig.name.split(" ");
  const firstName = nameParts[0];
  const middleName = nameParts.length > 2 ? nameParts[1] : "";
  const lastName = nameParts.length > 2 ? nameParts[2] : nameParts[1];

  return (
    <>
      {/* Display "YOU WERE INVITED BY:" if inviterUsername is provided */}
      {inviterUsername && (
        <div className="flex items-center text-lg font-poppins text-gray-700 dark:text-gray-300">
          <span className="mr-2 font-semibold">YOU WERE INVITED BY:</span>
          {/* Display the inviter's username with some styling */}
          <span className="text-primary-sky font-bold">{inviterUsername}</span>
        </div>
      )}

      {/* Redesigned "Our goal is" section */}
      <div className="flex flex-col gap-2"> {/* Added a container for goal text */}
        <h3 className="font-poppins text-2xl max-sm:text-xl text-gray-800 dark:text-gray-200"> {/* Adjusted color */}
          Our goal is
        </h3>
        {/* Main marketing goal text */}
        <h1 className="font-rubik text-6xl font-extrabold text-blue-600 dark:text-blue-400 leading-tight max-sm:text-4xl"> {/* Adjusted size, weight, color, and leading */}
          FROM IDEA <br className="sm:hidden"/> TO IMPACT <br className="sm:hidden"/>IN ONE CLICK.{/* Added line breaks for small screens */}
        </h1>
      </div>

      {/* Text Rotator remains below the main goal */}
      <TextRotator />

       {/* Original Name section - Commented out or removed based on your desired layout */}
       {/*
       <h1 className="font-rubik text-8xl name_underline text-primary max-sm:text-6xl ">
         {firstName} {middleName} <br /> {lastName} .
       </h1>
       */}
    </>
  );
};

export default HeroTexts;
