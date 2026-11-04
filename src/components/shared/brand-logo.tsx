import logo from "@/assets/sloth-logo.png.asset.json";
import { cn } from "@/lib/utils";

/** Official hello atzlan sloth logo. Never restyle the artwork. */
export function BrandIcon({ size = 36, className }: { size?: number; className?: string }) {
  return (
    <img
      src={logo.url}
      alt="hello atzlan"
      width={size}
      height={size}
      className={cn("shrink-0 object-contain select-none", className)}
      style={{ width: size, height: size }}
      draggable={false}
    />
  );
}

export function BrandLogo({ collapsed, size = 34 }: { collapsed?: boolean; size?: number }) {
  return (
    <div className="flex items-center gap-2.5">
      <BrandIcon size={size} />
      {!collapsed && (
        <span className="text-[17px] font-bold tracking-tight text-foreground">hello atzlan</span>
      )}
    </div>
  );
}
