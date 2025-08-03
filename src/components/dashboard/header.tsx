import type { FC } from 'react';

export const CryptoWaffleLogo: FC = () => (
  <div className="flex items-center gap-3">
    <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-primary">
      <svg
        className="absolute w-full h-full text-primary-foreground/20"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 8h16M4 16h16M8 4v16M16 4v16" />
      </svg>
      <span className="relative z-10 text-lg font-black text-primary-foreground">B</span>
    </div>
    <h1 className="text-xl font-semibold tracking-tight text-foreground">CryptoWaffle HQ</h1>
  </div>
);
