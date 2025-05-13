import React from 'react';

export interface RankBadgeProps {
  score: number | null;
}

export function RankBadge({ score }: RankBadgeProps) {
  if (score == null) return <span>–</span>;
  return <span>{score}</span>;
}
