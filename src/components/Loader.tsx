type PulseDotsProps = {
  size?: number;
  color?: string;
};

export default function Loader({
  size = 16,
  color = "#2b2b2b",
}: PulseDotsProps) {
  return (
    <>
      <style>{`
        @keyframes pulse-dot {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.35; }
          40% { transform: scale(1); opacity: 1; }
        }
      `}</style>

      <div
        role="status"
        aria-label="Loading"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          gap: size * 0.6,
        }}
      >
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            style={{
              width: size,
              height: size,
              borderRadius: "50%",
              backgroundColor: color,
              animation: "pulse-dot 1.2s ease-in-out infinite",
              animationDelay: `${i * 0.16}s`,
            }}
          />
        ))}
      </div>
    </>
  );
}
