import React from 'react';
import './WithSkeleton.css';
import { CSSProperties } from '@material-ui/core/styles/withStyles';

interface SkeletonProps {
    width?: string;
    height?: string;
    borderRadius?: string;
    margin?: string;
    className?: string;
    style?: CSSProperties;
}

const Skeleton = ({
    width = '100%',
    height = '16px',
    borderRadius = '4px',
    margin = '0',
    className = '',
    style = {},
}: SkeletonProps) => {
    return (
        <div
            className={`skeleton ${className}`}
            style={{
                width,
                height,
                borderRadius,
                margin,
                ...style
            }}
        ></div>
    );
};

export default Skeleton;
