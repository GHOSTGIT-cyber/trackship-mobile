import React from 'react';
import { Circle } from 'react-native-maps';

interface ZoneCircleProps {
  latitude: number;
  longitude: number;
  radius: number;
  color: string;
}

export const ZoneCircle: React.FC<ZoneCircleProps> = ({
  latitude,
  longitude,
  radius,
  color
}) => {
  // TODO: Implémenter le composant Circle
  return null;
};
