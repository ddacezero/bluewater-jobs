/**
 * Avatar component — circular avatar with gradient background and initials.
 * Supports size variants and a pool-specific purple gradient.
 */

import type { FC } from "react";

type AvatarSize = "sm" | "md" | "lg";
type AvatarVariant = "default" | "pool";

interface AvatarProps {
  initials: string;
  size?: AvatarSize;
  variant?: AvatarVariant;
  className?: string;
}

const SIZE_MAP: Record<AvatarSize, { container: string; text: string }> = {
  sm: { container: "h-7 w-7", text: "text-[10px]" },
  md: { container: "h-9 w-9", text: "text-[13px]" },
  lg: { container: "h-14 w-14", text: "text-xl" },
};

const Avatar: FC<AvatarProps> = ({
  initials,
  size = "md",
  variant = "default",
  className = "",
}) => {
  const sizeClasses = SIZE_MAP[size];
  const gradientClass =
    variant === "pool"
      ? "bg-gradient-to-br from-[#D4B6EB] to-[#8E24AA]"
      : "bg-gradient-to-br from-[#B6D6EB] to-[#1F75B9]";

  return (
    <div
      className={`${sizeClasses.container} rounded-full ${gradientClass} flex items-center justify-center text-white font-bold ${sizeClasses.text} shrink-0 ${className}`}
    >
      {initials}
    </div>
  );
};

export default Avatar;
