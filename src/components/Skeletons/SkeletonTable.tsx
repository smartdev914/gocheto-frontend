import React, { ReactNode } from 'react'

import Skeleton from './Skeleton';

interface ISkeletonTable {
  numOfColumns?: number;
  numOfRows?: number;
  loading: boolean;
  showHeader?: boolean;
  containerClassName?: string;
  className?: string;
  rowsClassName?: string; 
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

export default function SkeletonTable ({
  numOfColumns = 4,
  numOfRows = 5,
  loading,
  rowsClassName = '',
  className = '',
  skeletonConfig = { },
  children
}){
  if (!loading) return children
  return (
    <>
      {[...Array(numOfRows)].map((_, id) => (
        <tr key={id}>
          {[...Array(numOfColumns)].map((_, id) => (
            <td key={id} className={`px-4 py-5 ${rowsClassName}`}>
              <Skeleton height='26px' borderRadius='16px' {...skeletonConfig} />
            </td>
          ))}
        </tr>
      ))}
    </>
  )
}
