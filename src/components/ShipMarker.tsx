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
      // Bateau speedboat avec flèche directionnelle (navire en mouvement)
      return (
        <View
          style={[
            styles.shipContainer,
            { transform: [{ rotate: `${ship.course}deg` }] }
          ]}
        >
          {/* Corps du bateau (speedboat shape) */}
          <View style={styles.shipBody}>
            {/* Pointe avant */}
            <View
              style={[
                styles.shipNose,
                { borderBottomColor: zoneColor }
              ]}
            />
            {/* Corps principal */}
            <View
              style={[
                styles.shipMain,
                { backgroundColor: zoneColor }
              ]}
            />
            {/* Flèche directionnelle */}
            <View
              style={[
                styles.directionArrow,
                { borderBottomColor: zoneColor }
              ]}
            />
          </View>
        </View>
      );
    } else {
      // Cercle simple (navire à l'arrêt)
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
          <View style={styles.calloutHeader}>
            <Text style={styles.calloutTitle}>{ship.name}</Text>
            <View style={[styles.zoneBadge, { backgroundColor: zoneColor }]}>
              <Text style={styles.zoneBadgeText}>
                {zoneColor === 'red' ? 'ALERTE' : zoneColor === 'orange' ? 'VIGILANCE' : 'APPROCHE'}
              </Text>
            </View>
          </View>
          <View style={styles.calloutRow}>
            <Text style={styles.calloutIcon}>{moving ? '🔄' : '⏸️'}</Text>
            <Text style={styles.calloutText}>
              {moving ? 'En mouvement' : 'À l\'arrêt'}
            </Text>
          </View>
          <Text style={styles.calloutText}>Vitesse : {ship.speed.toFixed(1)} kn</Text>
          <Text style={styles.calloutText}>Distance : {Math.round(distance)} m</Text>
          <Text style={styles.calloutText}>Longueur : {ship.length} m</Text>
        </View>
      </Callout>
    </Marker>
  );
};

const styles = StyleSheet.create({
  shipContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shipBody: {
    alignItems: 'center',
  },
  shipNose: {
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderBottomWidth: 12,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    marginBottom: -2,
  },
  shipMain: {
    width: 16,
    height: 20,
    borderRadius: 3,
  },
  directionArrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderBottomWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    marginTop: 2,
    opacity: 0.8,
  },
  circle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    opacity: 0.7,
  },
  calloutContainer: {
    padding: 12,
    minWidth: 220,
  },
  calloutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  calloutTitle: {
    fontWeight: 'bold',
    fontSize: 17,
    flex: 1,
  },
  zoneBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    marginLeft: 8,
  },
  zoneBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  calloutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  calloutIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  calloutText: {
    fontSize: 14,
    marginBottom: 4,
    color: '#333',
  },
});

// Export avec React.memo pour optimisation
export const ShipMarker = React.memo(ShipMarkerComponent);
