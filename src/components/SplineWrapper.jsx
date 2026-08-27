const orbitItems = [
  { label: 'AI', className: 'top-[12%] left-[18%] delay-0' },
  { label: 'CAD', className: 'top-[22%] right-[12%] delay-150' },
  { label: 'R&D', className: 'bottom-[20%] left-[12%] delay-300' },
  { label: 'QC', className: 'bottom-[14%] right-[20%] delay-500' },
];

export function SplineWrapper() {
  return (
    <div className="relative h-full w-full overflow-hidden rounded-xl border border-white/10 bg-surface/40">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,209,255,0.18),transparent_58%)]" />
      <div className="absolute inset-8 rounded-full border border-primary/10" />
      <div className="absolute inset-16 rounded-full border border-primary/20 animate-spin [animation-duration:18s]" />
      <div className="absolute inset-24 rounded-full border border-dashed border-primary/20 animate-spin [animation-duration:28s] [animation-direction:reverse]" />

      <div className="absolute left-1/2 top-1/2 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary/40 bg-background/80 shadow-[0_0_60px_rgba(0,209,255,0.18)]">
        <div className="absolute inset-6 rounded-full border border-white/10 bg-primary/5" />
        <div className="absolute inset-14 rounded-full bg-primary/20 blur-md" />
        <span className="material-symbols-outlined absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-7xl text-primary">
          precision_manufacturing
        </span>
      </div>

      {orbitItems.map((item) => (
        <div
          key={item.label}
          className={`absolute ${item.className} rounded-sm border border-primary/30 bg-surface/70 px-3 py-2 font-label-sm text-[10px] tracking-widest text-primary shadow-[0_0_24px_rgba(0,209,255,0.12)] animate-pulse`}
        >
          {item.label}
        </div>
      ))}

      <div className="absolute bottom-6 left-6 right-6">
        <div className="mb-2 flex items-center justify-between font-label-sm text-[10px] uppercase tracking-widest text-on-surface-variant">
          <span>Engineering Core</span>
          <span className="text-primary">Online</span>
        </div>
        <div className="h-1 overflow-hidden rounded-full bg-white/10">
          <div className="h-full w-4/5 bg-primary-container shadow-[0_0_16px_#00d1ff]" />
        </div>
      </div>
    </div>
  );
}
