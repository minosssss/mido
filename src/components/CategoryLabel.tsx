// src/components/CategoryLabel.tsx
import React from 'react';
import type { PlaceCategory } from '@/types';
import { MARKER_COLORS } from '@/lib/constants';

interface CategoryLabelProps {
  category: PlaceCategory;
  name?: string; // 업체명 추가 (선택적)
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const CategoryLabel = ({ category, name, size = 'md', className = '' }: CategoryLabelProps) => {
  const color = MARKER_COLORS[category];
  
  // 단일 라벨 표시 (카테고리만)
  if (!name) {
    // 크기에 따른 스타일 조정
    const sizeStyles = {
      sm: {
        fontSize: '10px',
        fontWeight: '600',
        padding: '2px 6px',
      },
      md: {
        fontSize: '12px',
        fontWeight: '600',
        padding: '2px 8px',
      },
      lg: {
        fontSize: '14px',
        fontWeight: '600',
        padding: '3px 10px',
      }
    };
    
    return (
      <div 
        className={`inline-flex items-center rounded-md ${className}`}
        style={{
          backgroundColor: color,
          color: 'white',
          ...sizeStyles[size]
        }}
      >
        {category}
      </div>
    );
  }
  
  // 카테고리와 이름을 함께 표시 (모던한 디자인)
  const sizeStyles = {
    sm: {
      container: 'py-1 px-2 rounded-md',
      category: 'text-[10px] py-0.5 px-1.5 rounded',
      name: 'text-xs',
    },
    md: {
      container: 'py-1.5 px-3 rounded-lg',
      category: 'text-[11px] py-0.5 px-2 rounded',
      name: 'text-sm',
    },
    lg: {
      container: 'py-2 px-4 rounded-lg',
      category: 'text-xs py-1 px-2 rounded',
      name: 'text-base',
    }
  };
  
  return (
    <div 
      className={`inline-flex items-center bg-white shadow-sm ${sizeStyles[size].container} ${className}`}
    >
      <span 
        className={`font-semibold mr-2 ${sizeStyles[size].category}`}
        style={{ backgroundColor: color, color: 'white' }}
      >
        {category}
      </span>
      <span className={`font-medium truncate ${sizeStyles[size].name}`}>
        {name}
      </span>
    </div>
  );
};

export default CategoryLabel;
