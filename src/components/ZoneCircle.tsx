import React from 'react';
import { Circle } from 'react-native-maps';

interface ZoneCircleProps {
  center: {
    latitude: number;
    longitude: number;
  };
  radius: number;
  color: string;
  strokeWidth?: number;
  fillOpacity?: number;
}

const ZoneCircleComponent: React.FC<ZoneCircleProps> = ({
  center,
  radius,
  color,
  strokeWidth = 2,
  fillOpacity = 0.15
}) => {
  return (
    <Circle
      center={center}
      radius={radius}
      fillColor={`${color}${Math.round(fillOpacity * 255).toString(16).padStart(2, '0')}`}
      strokeColor={color}
      strokeWidth={strokeWidth}
    />
  );
};

// Export avec React.memo pour optimisation
export const ZoneCircle = React.memo(ZoneCircleComponent);
