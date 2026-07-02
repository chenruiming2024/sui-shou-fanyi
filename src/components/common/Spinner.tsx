export function Spinner({ size = 20 }: { size?: number }) {
  return (
    <div style={{ width: size, height: size }}
      className="border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
  );
}