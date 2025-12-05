// CertificateView - Generate and display downloadable certificates
import React, { useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Certificate, UserStats, Challenge } from '../../../types/challenges';

// Note: Install these packages for full functionality:
// npx expo install react-native-view-shot expo-media-library expo-file-system expo-sharing

Dimensions.get('window');

interface CertificateViewProps {
  certificate: Certificate;
  challenge: Challenge;
  userStats: UserStats;
  onClose: () => void;
  onShare: (platform: 'instagram' | 'linkedin' | 'twitter' | 'general') => void;
}

export const CertificateView: React.FC<CertificateViewProps> = ({
  certificate,
  challenge,
  userStats,
  onClose,
  onShare,
}) => {
  const certificateRef = useRef<View>(null);

  const handleDownload = useCallback(async () => {
    try {
      // For full functionality, install: npx expo install react-native-view-shot expo-media-library
      Alert.alert(
        'Download Certificate',
        'To enable certificate downloads, please install:\nnpx expo install react-native-view-shot expo-media-library expo-file-system',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Download error:', error);
      Alert.alert('Error', 'Failed to save certificate. Please try again.');
    }
  }, []);

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0A0A0A', '#1A1A1A', '#2A2A2A']}
        style={StyleSheet.absoluteFill}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Your Certificate</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Certificate Card */}
        <View ref={certificateRef} collapsable={false} style={styles.certificateWrapper}>
          <LinearGradient
            colors={['#FFF8E7', '#FFF5DB', '#FFFAF0']}
            style={styles.certificate}
          >
            {/* Decorative Border */}
            <View style={styles.borderOuter}>
              <View style={styles.borderInner}>
                {/* Header Ornament */}
                <View style={styles.ornamentTop}>
                  <View style={styles.ornamentLine} />
                  <MaterialCommunityIcons name="star-four-points" size={24} color="#D4AF37" />
                  <View style={styles.ornamentLine} />
                </View>

                {/* Logo/Icon */}
                <View style={styles.logoContainer}>
                  <LinearGradient
                    colors={['#D4AF37', '#C4A030', '#B8963D']}
                    style={styles.logo}
                  >
                    <MaterialCommunityIcons name="om" size={40} color="white" />
                  </LinearGradient>
                </View>

                {/* Title */}
                <Text style={styles.certTitle}>CERTIFICATE</Text>
                <Text style={styles.certSubtitle}>of Achievement</Text>

                {/* Decorative Line */}
                <View style={styles.divider}>
                  <View style={styles.dividerLine} />
                  <MaterialCommunityIcons name="rhombus" size={12} color="#D4AF37" />
                  <View style={styles.dividerLine} />
                </View>

                {/* Recipient */}
                <Text style={styles.recipientLabel}>This is to certify that</Text>
                <Text style={styles.recipientName}>{certificate.username}</Text>

                {/* Achievement */}
                <Text style={styles.achievementText}>
                  has successfully completed the challenge
                </Text>
                <Text style={styles.challengeName}>&ldquo;{certificate.challengeTitle}&rdquo;</Text>

                {/* Score */}
                <View style={styles.scoreSection}>
                  <View style={styles.scoreBox}>
                    <Text style={styles.scoreValue}>{certificate.percentage}%</Text>
                    <Text style={styles.scoreLabel}>Score</Text>
                  </View>
                  <View style={styles.scoreBox}>
                    <Text style={styles.scoreValue}>{certificate.score}</Text>
                    <Text style={styles.scoreLabel}>Points</Text>
                  </View>
                </View>

                {/* Badge if earned */}
                {certificate.badge && (
                  <View style={styles.badgeSection}>
                    <View style={[styles.badgeIcon, { backgroundColor: certificate.badge.color }]}>
                      <MaterialCommunityIcons
                        name={certificate.badge.icon as any}
                        size={20}
                        color="white"
                      />
                    </View>
                    <Text style={styles.badgeText}>{certificate.badge.name}</Text>
                  </View>
                )}

                {/* Date */}
                <View style={styles.dateSection}>
                  <Text style={styles.dateLabel}>Awarded on</Text>
                  <Text style={styles.dateValue}>{formatDate(certificate.completedAt)}</Text>
                </View>

                {/* Certificate Number */}
                <Text style={styles.certNumber}>
                  Certificate No: {certificate.certificateNumber}
                </Text>

                {/* Footer Ornament */}
                <View style={styles.ornamentBottom}>
                  <View style={styles.ornamentLine} />
                  <MaterialCommunityIcons name="star-four-points" size={16} color="#D4AF37" />
                  <View style={styles.ornamentLine} />
                </View>

                {/* Watermark */}
                <View style={styles.watermark}>
                  <Text style={styles.watermarkText}>ShlokaYug</Text>
                </View>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.downloadButton} onPress={handleDownload}>
            <LinearGradient
              colors={['#4CAF50', '#2E7D32']}
              style={styles.actionButtonGradient}
            >
              <MaterialCommunityIcons name="download" size={24} color="white" />
              <Text style={styles.downloadButtonText}>Download Certificate</Text>
            </LinearGradient>
          </TouchableOpacity>

          <Text style={styles.shareTitle}>Share on Social Media</Text>

          <View style={styles.shareButtonsRow}>
            <TouchableOpacity
              style={[styles.socialButton, { backgroundColor: '#E1306C' }]}
              onPress={() => onShare('instagram')}
            >
              <MaterialCommunityIcons name="instagram" size={28} color="white" />
              <Text style={styles.socialButtonText}>Instagram</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.socialButton, { backgroundColor: '#0077B5' }]}
              onPress={() => onShare('linkedin')}
            >
              <MaterialCommunityIcons name="linkedin" size={28} color="white" />
              <Text style={styles.socialButtonText}>LinkedIn</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.socialButton, { backgroundColor: '#1DA1F2' }]}
              onPress={() => onShare('twitter')}
            >
              <MaterialCommunityIcons name="twitter" size={28} color="white" />
              <Text style={styles.socialButtonText}>Twitter</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.moreShareButton}
            onPress={() => onShare('general')}
          >
            <MaterialCommunityIcons name="share-variant-outline" size={20} color="white" />
            <Text style={styles.moreShareText}>More Share Options</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: 'white',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  certificateWrapper: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
  },
  certificate: {
    padding: 8,
  },
  borderOuter: {
    borderWidth: 3,
    borderColor: '#D4AF37',
    borderRadius: 8,
    padding: 4,
  },
  borderInner: {
    borderWidth: 1,
    borderColor: '#D4AF37',
    borderRadius: 6,
    padding: 20,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  ornamentTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  ornamentLine: {
    width: 60,
    height: 1,
    backgroundColor: '#D4AF37',
  },
  logoContainer: {
    marginBottom: 15,
  },
  logo: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  certTitle: {
    fontSize: 32,
    fontWeight: '300',
    color: '#1a1a2e',
    letterSpacing: 8,
  },
  certSubtitle: {
    fontSize: 16,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 4,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 15,
  },
  dividerLine: {
    width: 80,
    height: 1,
    backgroundColor: '#D4AF37',
  },
  recipientLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  recipientName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a1a2e',
    fontFamily: 'serif',
    marginBottom: 15,
  },
  achievementText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  challengeName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#9333EA',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 15,
  },
  scoreSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 30,
    marginBottom: 15,
  },
  scoreBox: {
    alignItems: 'center',
    backgroundColor: 'rgba(147,51,234,0.1)',
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 12,
  },
  scoreValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#9333EA',
  },
  scoreLabel: {
    fontSize: 10,
    color: '#666',
    marginTop: 2,
  },
  badgeSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,215,0,0.2)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginBottom: 15,
    gap: 8,
  },
  badgeIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a2e',
  },
  dateSection: {
    alignItems: 'center',
    marginBottom: 15,
  },
  dateLabel: {
    fontSize: 10,
    color: '#666',
  },
  dateValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a2e',
    marginTop: 4,
  },
  certNumber: {
    fontSize: 8,
    color: '#999',
    marginBottom: 10,
  },
  ornamentBottom: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  watermark: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    opacity: 0.1,
  },
  watermarkText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1a1a2e',
    transform: [{ rotate: '-15deg' }],
  },
  actionsContainer: {
    marginTop: 30,
    alignItems: 'center',
  },
  downloadButton: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 30,
  },
  actionButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 10,
  },
  downloadButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
  },
  shareTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginBottom: 16,
  },
  shareButtonsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  socialButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    gap: 6,
  },
  socialButtonText: {
    fontSize: 11,
    fontWeight: '600',
    color: 'white',
  },
  moreShareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 20,
    gap: 8,
  },
  moreShareText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
});

export default CertificateView;
