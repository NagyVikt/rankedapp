import React from "react";

export interface ModifiedDateProps {
  iso: string;
}

export function ModifiedDate({ iso }: ModifiedDateProps) {
  const d = new Date(iso);
  return <span>{d.toLocaleDateString()}</span>;
}
