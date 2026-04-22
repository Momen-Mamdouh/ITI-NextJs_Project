interface LogoProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export function Logo({ className, ...props }: LogoProps) {
  return (
    <div
      className={`font-bold text-xl tracking-tight ${className || ""}`}
      {...props}
    >
      ShopHub
    </div>
  );
}
