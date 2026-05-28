// components/ui/animated-gradient.tsx
"use client";

export function AnimatedGradient() {
  return (
    <div 
      className="absolute inset-0 overflow-hidden pointer-events-none -z-10"
      style={{
        background: "linear-gradient(135deg, #f7e8ee 0%, #efe7f4 42%, #edf2f9 100%)"
      }}
    >
      <style>{`
        @keyframes float-orb-1 {
          0% { transform: translate3d(0px, 0px, 0) scale(1); }
          50% { transform: translate3d(4vw, -6vh, 0) scale(1.1); }
          100% { transform: translate3d(0px, 0px, 0) scale(1); }
        }
        @keyframes float-orb-2 {
          0% { transform: translate3d(0px, 0px, 0) scale(1); }
          50% { transform: translate3d(-5vw, 4vh, 0) scale(0.95); }
          100% { transform: translate3d(0px, 0px, 0) scale(1); }
        }
        @keyframes float-orb-3 {
          0% { transform: translate3d(0px, 0px, 0) scale(1.05); }
          50% { transform: translate3d(3vw, 5vh, 0) scale(0.9); }
          100% { transform: translate3d(0px, 0px, 0) scale(1.05); }
        }
        @keyframes float-orb-4 {
          0% { transform: translate3d(0px, 0px, 0) scale(0.9); }
          50% { transform: translate3d(-4vw, -4vh, 0) scale(1.15); }
          100% { transform: translate3d(0px, 0px, 0) scale(0.9); }
        }
        @keyframes float-orb-5 {
          0% { transform: translate3d(0px, 0px, 0) scale(1); }
          50% { transform: translate3d(4vw, 3vh, 0) scale(1.08); }
          100% { transform: translate3d(0px, 0px, 0) scale(1); }
        }
        @keyframes float-orb-6 {
          0% { transform: translate3d(0px, 0px, 0) scale(1.1); }
          50% { transform: translate3d(-3vw, -5vh, 0) scale(0.95); }
          100% { transform: translate3d(0px, 0px, 0) scale(1.1); }
        }

        .orb-blur-bg {
          filter: blur(80px);
        }
        @media (min-width: 1024px) {
          .orb-blur-bg {
            filter: blur(120px);
          }
        }
      `}</style>

      {/* Orb 1 */}
      <div 
        className="absolute rounded-full orb-blur-bg opacity-[0.55] will-change-transform"
        style={{
          backgroundColor: "rgb(244, 184, 212)",
          width: "35vw",
          height: "35vw",
          left: "5%",
          top: "25%",
          animation: "float-orb-1 25s ease-in-out infinite",
        }}
      />
      {/* Orb 2 */}
      <div 
        className="absolute rounded-full orb-blur-bg opacity-[0.48] will-change-transform"
        style={{
          backgroundColor: "rgb(196, 181, 253)",
          width: "30vw",
          height: "30vw",
          left: "65%",
          top: "10%",
          animation: "float-orb-2 30s ease-in-out infinite",
        }}
      />
      {/* Orb 3 */}
      <div 
        className="absolute rounded-full orb-blur-bg opacity-[0.40] will-change-transform"
        style={{
          backgroundColor: "rgb(186, 230, 253)",
          width: "28vw",
          height: "28vw",
          left: "55%",
          top: "60%",
          animation: "float-orb-3 28s ease-in-out infinite",
        }}
      />
      {/* Orb 4 */}
      <div 
        className="absolute rounded-full orb-blur-bg opacity-[0.35] will-change-transform"
        style={{
          backgroundColor: "rgb(221, 190, 253)",
          width: "22vw",
          height: "22vw",
          left: "35%",
          top: "40%",
          animation: "float-orb-4 22s ease-in-out infinite",
        }}
      />
      {/* Orb 5 */}
      <div 
        className="absolute rounded-full orb-blur-bg opacity-[0.42] will-change-transform"
        style={{
          backgroundColor: "rgb(253, 206, 228)",
          width: "25vw",
          height: "25vw",
          left: "20%",
          top: "55%",
          animation: "float-orb-5 32s ease-in-out infinite",
        }}
      />
      {/* Orb 6 */}
      <div 
        className="absolute rounded-full orb-blur-bg opacity-[0.38] will-change-transform"
        style={{
          backgroundColor: "rgb(167, 207, 249)",
          width: "22vw",
          height: "22vw",
          left: "75%",
          top: "50%",
          animation: "float-orb-6 26s ease-in-out infinite",
        }}
      />
    </div>
  );
}