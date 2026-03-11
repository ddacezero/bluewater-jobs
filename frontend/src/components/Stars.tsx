/**
 * Stars component — renders a 5-star rating display.
 * Filled stars are amber, empty stars are light gray.
 */

import type { FC } from "react";
import { StarIcon } from "./icons";

interface StarsProps {
  value: number;
}

const Stars: FC<StarsProps> = ({ value }) => (
  <span className="inline-flex gap-px">
    {[1, 2, 3, 4, 5].map((i) => (
      <StarIcon key={i} filled={i <= value} />
    ))}
  </span>
);

export default Stars;
