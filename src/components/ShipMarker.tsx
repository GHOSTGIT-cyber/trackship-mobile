import React from 'react';
import { Marker } from 'react-native-maps';
import { Ship } from '../types/ship';

interface ShipMarkerProps {
  ship: Ship;
  distanceFromBase: number;
  onPress: (ship: Ship) => void;
}

export const ShipMarker: React.FC<ShipMarkerProps> = ({
  ship,
  distanceFromBase,
  onPress
}) => {
  // TODO: Implémenter le marqueur avec flèche/cercle selon mouvement
  return null;
};
