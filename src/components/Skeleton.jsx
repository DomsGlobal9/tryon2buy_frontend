import React from 'react';

/** Grey shapes where content is about to appear, instead of a line of "Loading..." text. */
const Block = ({ className = '' }) => <div className={`bg-[#e7e1d7] animate-pulse ${className}`} />;

export function GridSkeleton({ count = 8 }) {
  return (
    <div role="status" aria-label="Loading" className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6 w-full max-w-[1040px]">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="bg-white border border-[rgba(26,20,16,0.08)] p-2 md:p-3 flex flex-col gap-3">
          <Block className="aspect-[3/4] w-full" />
          <Block className="h-3 w-2/3" />
          <Block className="h-9 w-full" />
        </div>
      ))}
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div role="status" aria-label="Loading" className="min-h-screen bg-[#faf7f2]">
      <div className="h-[60px] border-b border-[rgba(26,20,16,0.08)] flex items-center justify-center">
        <Block className="h-6 w-32" />
      </div>
      <div className="max-w-md mx-auto px-6 py-8 flex flex-col gap-4">
        <div className="flex gap-4 items-center">
          <Block className="w-20 h-28 shrink-0" />
          <div className="flex-1 flex flex-col gap-2"><Block className="h-3 w-1/2" /><Block className="h-4 w-3/4" /></div>
        </div>
        <Block className="h-40 w-full" />
        <Block className="h-12 w-full" />
      </div>
    </div>
  );
}
