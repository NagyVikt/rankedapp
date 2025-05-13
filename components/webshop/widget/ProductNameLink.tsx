import React from 'react';

export interface ProductNameLinkProps {
  id: number;
  children: React.ReactNode;
  adminOrigin: string;
}

export function ProductNameLink({
  id,
  children,
  adminOrigin,
}: ProductNameLinkProps) {
  const href = `${adminOrigin}/wp-admin/post.php?post=${id}&action=edit`;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-blue-600 hover:underline"
    >
      {children}
    </a>
  );
}
