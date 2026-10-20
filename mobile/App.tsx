import React, { useState, useEffect, Component, ErrorInfo, ReactNode } from 'react';
import { View, StyleSheet, StatusBar, Text, TouchableOpacity } from 'react-native';
import { registerRootComponent } from 'expo';
import { HomeScreen, AppScreenType } from './src/screens/HomeScreen';
import { WhoAreYaScreen } from './src/screens/WhoAreYaScreen';
import { CareerPathScreen } from './src/screens/CareerPathScreen';
import { ClubLogoScreen } from './src/screens/ClubLogoScreen';
import { ContextinhoScreen } from './src/screens/ContextinhoScreen';
import { LevelMapScreen } from './src/screens/LevelMapScreen';
import { GameModeType } from './src/api/dailyApi';
import { searchEngine } from './src/services/searchEngine';
import { Colors } from './src/theme/colors';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, errorMessage: error.message };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('App ErrorBoundary caught:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, errorMessage: '' });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorEmoji}>⚠️</Text>
          <Text style={styles.errorTitle}>Beklenmeyen Bir Hata Oluştu</Text>
          <Text style={styles.errorDetails}>{this.state.errorMessage}</Text>
          <TouchableOpacity style={styles.resetBtn} onPress={this.handleReset}>
            <Text style={styles.resetBtnText}>Yeniden Dene</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return this.props.children;
  }
}

function App() {
  const [currentScreen, setCurrentScreen] = useState<AppScreenType>('home');
  const [isDailySelected, setIsDailySelected] = useState<boolean>(false);
  const [activeGameMode, setActiveGameMode] = useState<GameModeType>('whoAreYa');
  const [selectedLevel, setSelectedLevel] = useState<number | undefined>(undefined);
  const [isReplayMode, setIsReplayMode] = useState<boolean>(false);

  useEffect(() => {
    try {
      searchEngine.initialize();
    } catch (e) {
      console.warn('Search engine init warning:', e);
    }
  }, []);

  const handleNavigate = (
    screen: AppScreenType,
    isDaily = false,
    gameMode?: GameModeType
  ) => {
    setIsDailySelected(isDaily);
    if (gameMode) {
      setActiveGameMode(gameMode);
    }
    if (
      screen === 'whoAreYa' ||
      screen === 'careerPath' ||
      screen === 'clubLogo' ||
      screen === 'contextinho'
    ) {
      setSelectedLevel(undefined);
      setIsReplayMode(false);
    }
    setCurrentScreen(screen);
  };

  const handleSelectLevelFromMap = (levelNumber: number, isReplay: boolean) => {
    setSelectedLevel(levelNumber);
    setIsReplayMode(isReplay);
    setIsDailySelected(false);
    setCurrentScreen(activeGameMode);
  };

  const handleOpenMapFromGame = () => {
    setCurrentScreen('levelMap');
  };

  const handleBackFromGame = () => {
    if (isDailySelected) {
      setCurrentScreen('home');
    } else {
      setCurrentScreen('levelMap');
    }
  };

  const handleBackToHome = () => {
    setCurrentScreen('home');
  };

  return (
    <ErrorBoundary>
      <View style={styles.outerWrapper}>
        <View style={styles.container}>
          <StatusBar barStyle="light-content" backgroundColor={Colors.background} />
          {currentScreen === 'home' && <HomeScreen onNavigate={handleNavigate} />}
          {currentScreen === 'levelMap' && (
            <LevelMapScreen
              gameMode={activeGameMode}
              onSelectLevel={handleSelectLevelFromMap}
              onBack={handleBackToHome}
            />
          )}
          {currentScreen === 'whoAreYa' && (
            <WhoAreYaScreen
              isDaily={isDailySelected}
              initialLevel={selectedLevel}
              isReplay={isReplayMode}
              onBack={handleBackFromGame}
              onOpenMap={handleOpenMapFromGame}
            />
          )}
          {currentScreen === 'careerPath' && (
            <CareerPathScreen
              isDaily={isDailySelected}
              initialLevel={selectedLevel}
              isReplay={isReplayMode}
              onBack={handleBackFromGame}
              onOpenMap={handleOpenMapFromGame}
            />
          )}
          {currentScreen === 'clubLogo' && (
            <ClubLogoScreen
              isDaily={isDailySelected}
              initialLevel={selectedLevel}
              isReplay={isReplayMode}
              onBack={handleBackFromGame}
              onOpenMap={handleOpenMapFromGame}
            />
          )}
          {currentScreen === 'contextinho' && (
            <ContextinhoScreen
              isDaily={isDailySelected}
              initialLevel={selectedLevel}
              isReplay={isReplayMode}
              onBack={handleBackFromGame}
              onOpenMap={handleOpenMapFromGame}
            />
          )}
        </View>
      </View>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  outerWrapper: {
    flex: 1,
    backgroundColor: '#050811',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    width: '100%',
    maxWidth: 480,
    backgroundColor: Colors.background,
  },
  errorContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  errorEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  errorDetails: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  resetBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  resetBtnText: {
    color: '#0F172A',
    fontWeight: '700',
    fontSize: 15,
  },
});

export default App;
registerRootComponent(App);
