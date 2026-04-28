import type { ReactNode } from 'react';

export default function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-[100dvh] w-full flex items-stretch md:items-center justify-center bg-[#05050a] md:py-8">
      <div className="phone md:rounded-[44px] md:shadow-2xl md:my-auto md:min-h-[860px] md:max-h-[920px] md:overflow-hidden md:ring-1 md:ring-white/5">
        {children}
      </div>
    </div>
  );
}
