import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Marker, Callout } from 'react-native-maps';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Ship } from '../types/ship';
import { calculateDistance, isMoving } from '../utils/distance';

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

  // Helper pour couleur selon distance (hex codes)
  const getColorByDistance = (dist: number): string => {
    if (dist < 1000) return '#EF4444';  // Rouge - Zone 1km
    if (dist < 2000) return '#F97316';  // Orange - Zone 2km
    if (dist < 3000) return '#10B981';  // Vert - Zone 3km
    return '#9CA3AF';  // Gris - Au-delà
  };

  const color = getColorByDistance(distance);
  const moving = ship.moving || isMoving(ship.speed);

  // Rendu de l'icône selon l'état
  const renderIcon = () => {
    if (moving && ship.course !== undefined) {
      // NAVIRE EN MOUVEMENT : Icône ferry orientée selon le cap
      return (
        <View
          style={[
            styles.shipContainer,
            { transform: [{ rotate: `${ship.course}deg` }] }
          ]}
        >
          <MaterialCommunityIcons
            name="ferry"
            size={30}
            color={color}
          />
        </View>
      );
    } else {
      // NAVIRE À L'ARRÊT : Carré bleu avec icône pause
      return (
        <View style={styles.stoppedContainer}>
          <MaterialCommunityIcons
            name="pause"
            size={18}
            color="white"
          />
        </View>
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
            <View style={[styles.zoneBadge, { backgroundColor: color }]}>
              <Text style={styles.zoneBadgeText}>
                {color === '#EF4444' ? 'ALERTE' : color === '#F97316' ? 'VIGILANCE' : 'APPROCHE'}
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
  stoppedContainer: {
    width: 26,
    height: 26,
    backgroundColor: '#3B82F6',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
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
