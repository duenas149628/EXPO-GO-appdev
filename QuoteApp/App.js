import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  ImageBackground,
} from 'react-native';

import { useAudioPlayer } from 'expo-audio';

export default function App() {
  const [quote, setQuote] = useState({ text: '', author: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMuted, setIsMuted] = useState(false);

  // Audio player
  const player = useAudioPlayer(
    require('./assets/BG-music1.mp3')
  );

  // Start background music
  useEffect(() => {
    console.log('Audio player created');
    console.log('Audio status:', player);

    player.loop = true;
    player.volume = 1.0;
    player.play();

    return () => {
      player.pause();
    };
  }, []);

  // Mute / unmute
  const toggleMute = () => {
    if (isMuted) {
      player.volume = 1.0;
      setIsMuted(false);
    } else {
      player.volume = 0.0;
      setIsMuted(true);
    }
  };

  // Fetch random quote
  const fetchQuote = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        'https://dummyjson.com/quotes/random'
      );

      if (!response.ok) {
        throw new Error(
          'Failed to fetch quote. Please try again.'
        );
      }

      const data = await response.json();

      // Check for empty or invalid API data
      if (!data.quote || !data.author) {
        setQuote({ text: '', author: '' });
        setError('No quote available. Please try again.');
        return;
      }

      setQuote({
        text: data.quote,
        author: data.author,
      });

    } catch (err) {
      setError(
        err.message || 'An unexpected error occurred.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Get the first quote when the app starts
  useEffect(() => {
    fetchQuote();
  }, []);

  return (
    <ImageBackground
      source={require('./assets/bg.jpg')}
      style={styles.background}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.container}>

        <View style={styles.cardContainer}>

          <ImageBackground
            source={require('./assets/card.jpg')}
            style={styles.card}
            imageStyle={styles.cardBackground}
            resizeMode="cover"
          >

            <View style={styles.overlay}>

              {/* Top Bar */}
              <View style={styles.topBar}>

                <Text style={styles.header}>
                  Daily Quotes
                </Text>

                <TouchableOpacity
                  style={styles.muteButton}
                  onPress={toggleMute}
                >
                  <Text style={styles.muteButtonText}>
                    {isMuted ? '🔇' : '🔊'}
                  </Text>
                </TouchableOpacity>

              </View>

              {/* Loading State */}
              {loading && (
                <View style={styles.centerContainer}>
                  <ActivityIndicator
                    size="large"
                    color="#FFFFFF"
                  />

                  <Text style={styles.loadingText}>
                    Loading quote...
                  </Text>
                </View>
              )}

              {/* Error State */}
              {error && !loading && (
                <View style={styles.centerContainer}>
                  <Text style={styles.errorText}>
                    {error}
                  </Text>
                </View>
              )}

              {/* Empty State */}
              {!loading &&
                !error &&
                !quote.text && (
                  <View style={styles.centerContainer}>
                    <Text style={styles.emptyText}>
                      No quote available.
                    </Text>
                  </View>
                )}

              {/* Quote */}
              {!loading &&
                !error &&
                quote.text && (
                  <ScrollView
                    style={styles.quoteScrollContainer}
                    contentContainerStyle={
                      styles.quoteScrollContent
                    }
                  >

                    <Text style={styles.quoteText}>
                      "{quote.text}"
                    </Text>

                    <Text style={styles.authorText}>
                      — {quote.author}
                    </Text>

                  </ScrollView>
                )}

              {/* New Quote Button */}
              <TouchableOpacity
                style={[
                  styles.button,
                  loading && styles.buttonDisabled,
                ]}
                onPress={fetchQuote}
                disabled={loading}
              >
                <Text style={styles.buttonText}>
                  New Quote
                </Text>
              </TouchableOpacity>

            </View>

          </ImageBackground>

        </View>

      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },

  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.20)',
  },

  cardContainer: {
    width: '90%',
    maxWidth: 500,
    height: 400,
    backgroundColor: 'transparent',
    borderRadius: 16,
    overflow: 'hidden',
  },

  card: {
    width: '100%',
    height: '100%',
    backgroundColor: 'transparent',
  },

  cardBackground: {
    borderRadius: 16,
  },

  overlay: {
    flex: 1,
    padding: 15,
  },

  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: 10,
    position: 'relative',
  },

  header: {
    fontStyle: 'italic',
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
  },

  muteButton: {
    position: 'absolute',
    right: 5,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    borderWidth: 1.5,
    borderColor: 'rgba(254, 254, 254, 0.13)',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },

  muteButtonText: {
    fontSize: 16,
  },

  centerContainer: {
  height: 230,
  justifyContent: 'center',
  alignItems: 'center',
  paddingVertical: 20,
},

quoteScrollContainer: {
  height: 230,
  marginVertical: 5,
},

  loadingText: {
    color: '#FFFFFF',
    fontSize: 14,
    marginTop: 10,
    textAlign: 'center',
  },

  emptyText: {
    color: '#FFFFFF',
    fontSize: 16,
    textAlign: 'center',
  },

  quoteScrollContainer: {
    marginVertical: 5,
    maxHeight: 220,
  },

  quoteScrollContent: {
  flexGrow: 1,
  justifyContent: 'center',
  paddingVertical: 10,
},
  quoteText: {
    fontFamily: 'monospace',
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 28,
  },

  authorText: {
    fontStyle: 'italic',
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },

  errorText: {
    color: '#b89494',
    fontSize: 16,
    textAlign: 'center',
  },

  button: {
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    borderWidth: 1.5,
    borderColor: 'rgba(254, 254, 254, 0.13)',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 100,
    alignItems: 'center',
    alignSelf: 'center',
    width: '50%',
    marginTop: 10,
  },

  buttonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },

  buttonDisabled: {
    backgroundColor: '#60331448',
  },
});