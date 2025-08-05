import React from "react";
import {
  getBadgeInfo,
  getTrustScoreDescription,
} from "@/utils/trustScoreCalculator";

interface TrustScoreBadgeProps {
  trustScore: number;
  trustBadge: string;
  showScore?: boolean;
  showDescription?: boolean;
  size?: "sm" | "md" | "lg";
}

export default function TrustScoreBadge({
  trustScore,
  trustBadge,
  showScore = true,
  showDescription = false,
  size = "md",
}: TrustScoreBadgeProps) {
  const badgeInfo = getBadgeInfo(trustBadge);
  const description = getTrustScoreDescription(trustBadge);

  const sizeClasses = {
    sm: "text-xs px-2 py-1",
    md: "text-sm px-3 py-1.5",
    lg: "text-base px-4 py-2",
  };

  return (
    <div className="flex flex-col items-start gap-1">
      <div className="flex items-center gap-2">
        <div
          className={`inline-flex items-center gap-1.5 rounded-full ${badgeInfo.bgColor} ${badgeInfo.textColor} font-medium ${sizeClasses[size]}`}
        >
          <span className="text-lg">{badgeInfo.icon}</span>
          <span>{badgeInfo.label}</span>
        </div>

        {showScore && (
          <div className="flex items-center gap-1">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Trust Score:
            </span>
            <span className="text-sm font-bold text-gray-900 dark:text-white">
              {trustScore}%
            </span>
          </div>
        )}
      </div>

      {showDescription && (
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {description}
        </p>
      )}
    </div>
  );
}
