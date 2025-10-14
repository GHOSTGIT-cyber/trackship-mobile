import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity, Switch } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface NotificationPanelProps {
  visible: boolean;
  onClose: () => void;
  notificationsEnabled: boolean;
  onToggleNotifications: (enabled: boolean) => void;
}

const NotificationPanel: React.FC<NotificationPanelProps> = ({
  visible,
  onClose,
  notificationsEnabled,
  onToggleNotifications,
}) => {
  // Animation pour le slide depuis la droite
  const slideAnim = useRef(new Animated.Value(300)).current; // Commence hors écran (300px à droite)

  useEffect(() => {
    if (visible) {
      // Slide in : de droite vers gauche
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 10,
      }).start();
    } else {
      // Slide out : de gauche vers droite
      Animated.timing(slideAnim, {
        toValue: 300,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <>
      {/* Overlay semi-transparent pour fermer le panneau */}
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      />

      {/* Panneau glissant */}
      <Animated.View
        style={[
          styles.panel,
          {
            transform: [{ translateX: slideAnim }],
          },
        ]}
      >
        {/* Header avec bouton fermer */}
        <View style={styles.header}>
          <Text style={styles.title}>Notifications</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <MaterialCommunityIcons name="close" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        {/* Contenu : toggle notifications */}
        <View style={styles.content}>
          <View style={styles.row}>
            <View style={styles.iconTextContainer}>
              <MaterialCommunityIcons name="bell" size={24} color="#007AFF" />
              <View style={styles.textContainer}>
                <Text style={styles.label}>Alertes de zone rouge</Text>
                <Text style={styles.description}>
                  Recevoir une notification quand un navire entre en zone rouge (1 km)
                </Text>
              </View>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={onToggleNotifications}
              trackColor={{ false: '#D1D5DB', true: '#93C5FD' }}
              thumbColor={notificationsEnabled ? '#007AFF' : '#F3F4F6'}
              ios_backgroundColor="#D1D5DB"
            />
          </View>

          {/* Info supplémentaire */}
          <View style={styles.infoBox}>
            <MaterialCommunityIcons name="information" size={20} color="#6B7280" />
            <Text style={styles.infoText}>
              Les notifications sont enregistrées localement sur cet appareil.
            </Text>
          </View>
        </View>
      </Animated.View>
    </>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    zIndex: 999,
  },
  panel: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    width: 320,
    backgroundColor: 'white',
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: {
      width: -2,
      height: 0,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingTop: 60, // Pour éviter la notch iOS
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    padding: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  iconTextContainer: {
    flexDirection: 'row',
    flex: 1,
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
    marginLeft: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  description: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 8,
    lineHeight: 16,
  },
});

export default NotificationPanel;
