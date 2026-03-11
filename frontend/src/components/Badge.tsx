/**
 * Badge component — displays a colored stage indicator with dot + label.
 * Uses stage-specific colors from STAGE_COLORS constant.
 */

import type { FC } from "react";
import { STAGE_COLORS } from "../data/constants";

interface BadgeProps {
  stage: string;
}

const Badge: FC<BadgeProps> = ({ stage }) => {
  const colors = STAGE_COLORS[stage] || STAGE_COLORS["Applied"];

  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap"
      style={{ background: colors.bg, color: colors.text }}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ background: colors.dot }}
      />
      {stage}
    </span>
  );
};

export default Badge;
