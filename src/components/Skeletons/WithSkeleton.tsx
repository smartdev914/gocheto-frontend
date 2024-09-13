import React, { ReactNode } from 'react';
import Skeleton from './Skeleton';

interface WithSkeletonProps {
  loading: boolean;
  skeletonConfig?: {
    width?: string;
    height?: string;
    count?: number;
    borderRadius?: string;
    margin?: string;
    className?: string;
  };
  children: ReactNode;
}

const WithSkeleton = ({ loading, skeletonConfig = {}, children }: WithSkeletonProps) => {
  if (loading) {
    const { width = '100%', height = '16px', count = 1, borderRadius = '4px', className = '', margin = '' } = skeletonConfig;

    return (
      <>
        {[...Array(count)].map((_, idx) => (
          <Skeleton key={idx} width={width} height={height} className={className} margin={margin} borderRadius={borderRadius} />
        ))}
      </>
    );
  }

  return <>{children}</>;
};

export default WithSkeleton;
