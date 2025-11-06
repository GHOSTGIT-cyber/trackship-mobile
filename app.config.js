const { withAndroidManifest } = require('@expo/config-plugins');
const appJson = require('./app.json');

const withGoogleMapsApiKey = (config, apiKey) => {
  return withAndroidManifest(config, (config) => {
    const androidManifest = config.modResults;
    const application = androidManifest.manifest.application[0];

    // Ajouter la méta-donnée com.google.android.geo.API_KEY
    if (!application['meta-data']) {
      application['meta-data'] = [];
    }

    // Supprimer toute clé existante
    application['meta-data'] = application['meta-data'].filter(
      (item) => item.$['android:name'] !== 'com.google.android.geo.API_KEY'
    );

    // Ajouter la nouvelle clé
    application['meta-data'].push({
      $: {
        'android:name': 'com.google.android.geo.API_KEY',
        'android:value': apiKey,
      },
    });

    return config;
  });
};

module.exports = ({ config }) => {
  // Fusionner avec app.json
  const baseConfig = {
    ...appJson.expo,
    ...config,
  };

  return withGoogleMapsApiKey(baseConfig, 'AIzaSyBkmZ3wGs6cEhe87QnFVX0ZfR3e4bH6cno');
};
