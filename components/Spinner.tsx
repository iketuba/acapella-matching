type SpinnerProps = {
  size?: "sm" | "md" | "lg";
  color?: "blue" | "gray" | "white" | "red";
};

export function Spinner({ size = "md", color = "blue" }: SpinnerProps) {
  const sizeClass =
    size === "sm"
      ? "h-3 w-3 border-2"
      : size === "lg"
      ? "h-6 w-6 border-4"
      : "h-4 w-4 border-2";

  const colorClass =
    color === "gray"
      ? "border-gray-400 border-t-transparent"
      : color === "white"
      ? "border-white border-t-transparent"
      : color === "red"
      ? "border-red-500 border-t-transparent"
      : "border-blue-500 border-t-transparent";

  return (
    <span
      className={`inline-block animate-spin rounded-full ${sizeClass} ${colorClass}`}
      aria-label="loading"
    />
  );
}
