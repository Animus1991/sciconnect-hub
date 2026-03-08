const GridBackground = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden grid-bg">
      {/* Subtle dot grid */}
      <div className="absolute inset-0 grid-dots opacity-[0.03]" />
      {/* Floating orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-primary/5 blur-[120px] animate-float-slow" />
      <div className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full bg-accent/5 blur-[100px] animate-float-slower" />
    </div>
  );
};

export default GridBackground;
