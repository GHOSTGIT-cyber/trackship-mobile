import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Marker, Callout } from 'react-native-maps';
import { Ship } from '../types/ship';
import { calculateDistance, getZoneColor, isMoving } from '../utils/distance';

interface ShipMarkerProps {
  ship: Ship;
  baseCoords: {
    latitude: number;
    longitude: number;
  };
}

const ShipMarkerComponent: React.FC<ShipMarkerProps> = ({
  ship,
  baseCoords
}) => {
  // Calcul de la distance du navire à la base
  const distance = calculateDistance(
    baseCoords.latitude,
    baseCoords.longitude,
    ship.latitude,
    ship.longitude
  );

  // Déterminer la couleur selon la zone
  const zoneColor = getZoneColor(distance);

  // Vérifier si le navire est en mouvement
  const moving = isMoving(ship.speed);

  // Rendu de l'icône selon l'état
  const renderIcon = () => {
    if (moving && ship.course !== undefined) {
      // Flèche orientée selon le cap (navire en mouvement)
      return (
        <View
          style={[
            styles.arrowContainer,
            { transform: [{ rotate: `${ship.course}deg` }] }
          ]}
        >
          <View
            style={[
              styles.arrow,
              { borderBottomColor: zoneColor }
            ]}
          />
        </View>
      );
    } else {
      // Cercle (navire à l'arrêt)
      return (
        <View
          style={[
            styles.circle,
            { backgroundColor: zoneColor }
          ]}
        />
      );
    }
  };

  return (
    <Marker
      coordinate={{
        latitude: ship.latitude,
        longitude: ship.longitude
      }}
      anchor={{ x: 0.5, y: 0.5 }}
    >
      {renderIcon()}

      <Callout>
        <View style={styles.calloutContainer}>
          <Text style={styles.calloutTitle}>{ship.name}</Text>
          <Text style={styles.calloutText}>Vitesse : {ship.speed.toFixed(1)} kn</Text>
          <Text style={styles.calloutText}>Distance : {Math.round(distance)} m</Text>
          <Text style={styles.calloutText}>Longueur : {ship.length} m</Text>
          <Text style={styles.calloutText}>
            Statut : {moving ? 'En mouvement' : 'À l\'arrêt'}
          </Text>
        </View>
      </Callout>
    </Marker>
  );
};

const styles = StyleSheet.create({
  arrowContainer: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderBottomWidth: 30,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  circle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    opacity: 0.7,
  },
  calloutContainer: {
    padding: 10,
    minWidth: 200,
  },
  calloutTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 8,
  },
  calloutText: {
    fontSize: 14,
    marginBottom: 4,
  },
});

// Export avec React.memo pour optimisation
export const ShipMarker = React.memo(ShipMarkerComponent);
