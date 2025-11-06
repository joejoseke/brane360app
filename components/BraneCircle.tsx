import React from 'react';

interface BraneCircleProps {
  title: string;
  onClick: () => void;
}

const BraneCircle: React.FC<BraneCircleProps> = ({ title, onClick }) => {
  // This component now represents the "inner ring nodes" from the WEF map.
  return (
    <button
      onClick={onClick}
      className={`
        w-32 h-32 md:w-36 md:h-36
        rounded-full flex flex-col items-center justify-center p-2
        text-center text-slate-800 font-sans shadow-md
        transition-all duration-300 ease-in-out
        transform hover:scale-105 hover:shadow-lg
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-white
        bg-slate-200 hover:bg-slate-100
      `}
    >
        <h3 className={`font-semibold text-sm md:text-base`}>{title}</h3>
    </button>
  );
};

export default BraneCircle;