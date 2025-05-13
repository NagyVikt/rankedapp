'use client';

import React, { forwardRef } from 'react';
import { CardBody as RawCardBody, CardProps } from '@heroui/react';

/**
 * Wrap RawCardBody so it properly accepts and forwards a `ref`
 * to its internal <div> (or whatever DOM element it renders).
 */
export const CardBody = forwardRef<HTMLDivElement, CardProps>(
  function CardBodyWithRef(props, ref) {
    // RawCardBody must itself forward that ref to its root DOM node
    return <RawCardBody {...props} ref={ref} />;
  }
);

CardBody.displayName = 'CardBody';
