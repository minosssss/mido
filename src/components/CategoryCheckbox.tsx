// src/components/CategoryCheckbox.tsx
import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import type { PlaceCategory } from '@/types';
import { MARKER_COLORS } from '@/lib/constants';

interface CategoryCheckboxProps {
  category: PlaceCategory;
  isChecked: boolean;
  onChange: () => void;
  className?: string;
}

const CategoryCheckbox: React.FC<CategoryCheckboxProps> = ({
  category,
  isChecked,
  onChange,
  className = '',
}) => {
  const color = MARKER_COLORS[category];
  
  return (
    <label
      className={`flex items-center space-x-2 cursor-pointer py-1 relative pl-2 ${className}`}
      style={{
        borderLeft: isChecked ? `4px solid ${color}` : '4px solid transparent',
        paddingLeft: '8px',
        transition: 'border-left-color 0.2s ease',
      }}
    >
      <Checkbox
        checked={isChecked}
        onCheckedChange={onChange}
        id={`category-${category}`}
      />
      <span className="text-sm">{category}</span>
    </label>
  );
};

export default CategoryCheckbox;
