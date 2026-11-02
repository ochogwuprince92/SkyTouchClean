export default function Logo({ className = "" }: { className?: string }) {
  return (
    <img
      src="/logo.jpg"
      alt="SkyTouchClean Logo"
      className={className}
      width="48"
      height="48"
    />
  );
}
