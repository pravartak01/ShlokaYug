/**
 * Certificate Screen
 * Displays course completion certificate with premium design
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Share,
  Dimensions,
  Alert,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import courseService from '../../services/courseService';
import { useAuth } from '../../context/AuthContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Theme colors
const COLORS = {
  gold: '#D4AF37',
  darkGold: '#B8963D',
  cream: '#FFF8E7',
  lightCream: '#FFFAF0',
  brown: '#4A2E1C',
  saffron: '#DD7A1F',
  copper: '#B87333',
};

export default function CertificateScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  const [certificate, setCertificate] = useState<any>(null);
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const certificateRef = useRef<View>(null);

  useEffect(() => {
    loadCertificateAndCourse();
  }, [id]);

  const loadCertificateAndCourse = async () => {
    try {
      setLoading(true);
      
      // Load certificate
      const certResponse = await courseService.getCertificate(id as string);
      const certData = certResponse.data?.certificate;
      setCertificate(certData);
      
      // Load course details
      const courseResponse = await courseService.getCourseById(id as string);
      const courseData = courseResponse.data?.course || courseResponse.course;
      setCourse(courseData);
      
    } catch (error) {
      console.error('Error loading certificate:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleShareCertificate = async () => {
    try {
      const message = `🎓 I just completed "${course?.title || 'a course'}" on ShlokaYug!\n\n` +
        `Instructor: ${course?.instructor?.name || 'N/A'}\n` +
        `Certificate ID: ${certificate?.certificateId || 'N/A'}\n\n` +
        `Join me in learning Sanskrit wisdom! 🕉️`;
      
      await Share.share({
        message,
        title: 'Course Completion Certificate',
      });
    } catch (error) {
      console.error('Error sharing certificate:', error);
    }
  };

  const handleShareSocialCard = async () => {
    try {
      const message = `✨ Achievement Unlocked! ✨\n\n` +
        `📚 Completed: ${course?.title || 'Course'}\n` +
        `👨‍🏫 Instructor: ${course?.instructor?.name || 'N/A'}\n` +
        `⭐ ${certificate?.totalLectures || 0} lectures mastered\n` +
        `🎯 100% completion\n\n` +
        `#ShlokaYug #SanskritLearning #Achievement`;
      
      await Share.share({
        message,
        title: 'Course Achievement',
      });
    } catch (error) {
      console.error('Error sharing social card:', error);
    }
  };

  const handleDownload = () => {
    Alert.alert(
      'Download Certificate',
      'Certificate download feature coming soon! You can share it for now.',
      [{ text: 'OK' }]
    );
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.cream }}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={COLORS.saffron} />
          <Text style={{ color: COLORS.brown, marginTop: 16, fontSize: 16 }}>
            Loading certificate...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!certificate && !course) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.cream }}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 }}>
          <Ionicons name="alert-circle" size={64} color={COLORS.copper} />
          <Text style={{ color: COLORS.brown, fontSize: 20, fontWeight: 'bold', marginTop: 16, textAlign: 'center' }}>
            Certificate Not Found
          </Text>
          <Text style={{ color: COLORS.copper, textAlign: 'center', marginTop: 8 }}>
            Complete the course to earn your certificate
          </Text>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ backgroundColor: COLORS.saffron, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12, marginTop: 24 }}
          >
            <Text style={{ color: 'white', fontWeight: '600' }}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient
        colors={['#1a1a2e', '#16213e', '#0f3460']}
        style={StyleSheet.absoluteFill}
      />

      {/* Header */}
      <SafeAreaView style={{ paddingHorizontal: 16, paddingVertical: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <TouchableOpacity onPress={() => router.back()} style={{ padding: 8 }}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold' }}>
            Your Certificate
          </Text>
          <View style={{ width: 40 }} />
        </View>
      </SafeAreaView>

      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Premium Certificate Card */}
        <View ref={certificateRef} collapsable={false} style={{ marginBottom: 20 }}>
          <LinearGradient
            colors={[COLORS.cream, COLORS.lightCream, COLORS.cream]}
            style={styles.certificate}
          >
            {/* Decorative Border */}
            <View style={styles.borderOuter}>
              <View style={styles.borderInner}>
                {/* Top Ornament */}
                <View style={styles.ornamentTop}>
                  <View style={styles.ornamentLine} />
                  <MaterialCommunityIcons name="star-four-points" size={24} color={COLORS.gold} />
                  <View style={styles.ornamentLine} />
                </View>

                {/* Logo */}
                <View style={styles.logoContainer}>
                  <LinearGradient
                    colors={[COLORS.gold, COLORS.darkGold]}
                    style={styles.logo}
                  >
                    <MaterialCommunityIcons name="om" size={40} color="white" />
                  </LinearGradient>
                </View>

                {/* Title */}
                <Text style={styles.certTitle}>CERTIFICATE</Text>
                <Text style={styles.certSubtitle}>of Completion</Text>

                {/* Divider */}
                <View style={styles.divider}>
                  <View style={styles.dividerLine} />
                  <MaterialCommunityIcons name="rhombus" size={12} color={COLORS.gold} />
                  <View style={styles.dividerLine} />
                </View>

                {/* Recipient */}
                <Text style={styles.recipientLabel}>This is to certify that</Text>
                <Text style={styles.recipientName}>
                  {user?.name || certificate?.studentName || 'Student Name'}
                </Text>

                {/* Achievement */}
                <Text style={styles.achievementText}>
                  has successfully completed the course
                </Text>
                <Text style={styles.challengeName}>
                  &ldquo;{course?.title || certificate?.courseName || 'Course Name'}&rdquo;
                </Text>

                {/* Instructor */}
                <View style={styles.instructorSection}>
                  <Text style={styles.instructorLabel}>Taught by</Text>
                  <Text style={styles.instructorName}>
                    {course?.instructor?.name || certificate?.instructorName || 'Instructor'}
                  </Text>
                </View>

                {/* Stats */}
                <View style={styles.statsSection}>
                  <View style={styles.statBox}>
                    <Text style={styles.statValue}>{certificate?.totalLectures || course?.structure?.units?.reduce((acc: number, unit: any) => 
                      acc + unit.lessons.reduce((sum: number, lesson: any) => sum + lesson.lectures.length, 0), 0) || 0}</Text>
                    <Text style={styles.statLabel}>Lectures</Text>
                  </View>
                  <View style={styles.statBox}>
                    <Text style={styles.statValue}>100%</Text>
                    <Text style={styles.statLabel}>Completion</Text>
                  </View>
                  <View style={styles.statBox}>
                    <Text style={styles.statValue}>
                      {course?.metadata?.duration?.split(' ')[0] || certificate?.courseDuration || 'N/A'}
                    </Text>
                    <Text style={styles.statLabel}>Hours</Text>
                  </View>
                </View>

                {/* Date */}
                <View style={styles.dateSection}>
                  <Text style={styles.dateLabel}>Awarded on</Text>
                  <Text style={styles.dateValue}>
                    {formatDate(certificate?.completedAt || new Date())}
                  </Text>
                </View>

                {/* Certificate Number */}
                <Text style={styles.certNumber}>
                  Certificate No: {certificate?.certificateId || 'SHYK-' + Date.now()}
                </Text>

                {/* Bottom Ornament */}
                <View style={styles.ornamentBottom}>
                  <View style={styles.ornamentLine} />
                  <MaterialCommunityIcons name="star-four-points" size={16} color={COLORS.gold} />
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

        {/* Social Share Card */}
        <LinearGradient
          colors={[COLORS.saffron, COLORS.copper]}
          style={styles.socialCard}
        >
          <View style={styles.socialCardHeader}>
            <MaterialCommunityIcons name="star-circle" size={32} color="white" />
            <Text style={styles.socialCardTitle}>Achievement Unlocked!</Text>
          </View>

          <View style={styles.socialCardBody}>
            <View style={styles.achievementRow}>
              <Ionicons name="trophy" size={20} color="white" />
              <Text style={styles.achievementText2}>Course Completed</Text>
            </View>
            <Text style={styles.socialCardCourse}>
              {course?.title || certificate?.courseName}
            </Text>
            <View style={styles.socialStatsRow}>
              <View style={styles.socialStat}>
                <Text style={styles.socialStatValue}>
                  {certificate?.totalLectures || 0}
                </Text>
                <Text style={styles.socialStatLabel}>Lectures</Text>
              </View>
              <View style={styles.socialStatDivider} />
              <View style={styles.socialStat}>
                <Text style={styles.socialStatValue}>100%</Text>
                <Text style={styles.socialStatLabel}>Progress</Text>
              </View>
              <View style={styles.socialStatDivider} />
              <View style={styles.socialStat}>
                <Text style={styles.socialStatValue}>
                  {course?.metadata?.duration?.split(' ')[0] || 'N/A'}
                </Text>
                <Text style={styles.socialStatLabel}>Hours</Text>
              </View>
            </View>
          </View>

          <View style={styles.socialCardFooter}>
            <MaterialCommunityIcons name="om" size={24} color="white" />
            <Text style={styles.socialCardBrand}>ShlokaYug</Text>
          </View>
        </LinearGradient>

        {/* Action Buttons */}
        <View style={{ marginTop: 20 }}>
          <TouchableOpacity onPress={handleDownload} style={{ marginBottom: 12 }}>
            <LinearGradient
              colors={['#4CAF50', '#2E7D32']}
              style={styles.actionButton}
            >
              <Ionicons name="download" size={22} color="white" />
              <Text style={styles.actionButtonText}>Download Certificate</Text>
            </LinearGradient>
          </TouchableOpacity>

          <Text style={styles.shareTitle}>Share Your Achievement</Text>

          <View style={styles.shareButtonsRow}>
            <TouchableOpacity
              style={[styles.socialButton, { backgroundColor: '#E1306C' }]}
              onPress={handleShareSocialCard}
            >
              <MaterialCommunityIcons name="instagram" size={26} color="white" />
              <Text style={styles.socialButtonText}>Instagram</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.socialButton, { backgroundColor: '#0077B5' }]}
              onPress={handleShareCertificate}
            >
              <MaterialCommunityIcons name="linkedin" size={26} color="white" />
              <Text style={styles.socialButtonText}>LinkedIn</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.socialButton, { backgroundColor: '#1DA1F2' }]}
              onPress={handleShareSocialCard}
            >
              <MaterialCommunityIcons name="twitter" size={26} color="white" />
              <Text style={styles.socialButtonText}>Twitter</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.moreShareButton}
            onPress={handleShareCertificate}
          >
            <MaterialCommunityIcons name="share-variant-outline" size={20} color="white" />
            <Text style={styles.moreShareText}>More Share Options</Text>
          </TouchableOpacity>
        </View>

        {/* Verify Badge */}
        <View style={styles.verifyBadge}>
          <MaterialCommunityIcons name="shield-check" size={24} color={COLORS.gold} />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.verifyTitle}>Verified Certificate</Text>
            <Text style={styles.verifyText}>
              This certificate can be verified using the Certificate ID
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

// Styles
const styles = StyleSheet.create({
  certificate: {
    borderRadius: 16,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  borderOuter: {
    borderWidth: 3,
    borderColor: COLORS.gold,
    borderRadius: 12,
    padding: 4,
  },
  borderInner: {
    borderWidth: 1,
    borderColor: COLORS.darkGold,
    borderRadius: 8,
    padding: 24,
  },
  ornamentTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  ornamentLine: {
    height: 1,
    width: 40,
    backgroundColor: COLORS.gold,
    marginHorizontal: 12,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  certTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.brown,
    textAlign: 'center',
    letterSpacing: 3,
  },
  certSubtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.copper,
    textAlign: 'center',
    marginTop: 4,
    letterSpacing: 1,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    height: 1,
    width: 60,
    backgroundColor: COLORS.gold,
    marginHorizontal: 8,
  },
  recipientLabel: {
    fontSize: 14,
    color: COLORS.copper,
    textAlign: 'center',
    marginBottom: 8,
  },
  recipientName: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.brown,
    textAlign: 'center',
    marginBottom: 16,
  },
  achievementText: {
    fontSize: 14,
    color: COLORS.copper,
    textAlign: 'center',
    marginBottom: 8,
  },
  challengeName: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.saffron,
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  instructorSection: {
    alignItems: 'center',
    marginBottom: 20,
    paddingVertical: 12,
    backgroundColor: `${COLORS.gold}15`,
    borderRadius: 12,
  },
  instructorLabel: {
    fontSize: 12,
    color: COLORS.copper,
    marginBottom: 4,
  },
  instructorName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.brown,
  },
  statsSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    paddingVertical: 16,
    backgroundColor: `${COLORS.copper}10`,
    borderRadius: 12,
  },
  statBox: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.saffron,
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.copper,
    marginTop: 2,
  },
  dateSection: {
    alignItems: 'center',
    marginBottom: 12,
  },
  dateLabel: {
    fontSize: 11,
    color: COLORS.copper,
    marginBottom: 4,
  },
  dateValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.brown,
  },
  certNumber: {
    fontSize: 10,
    color: COLORS.copper,
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: 'monospace',
  },
  ornamentBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  watermark: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -60 }, { translateY: -20 }, { rotate: '-45deg' }],
    opacity: 0.05,
  },
  watermarkText: {
    fontSize: 48,
    fontWeight: '900',
    color: COLORS.gold,
  },
  socialCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  socialCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  socialCardTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: 'white',
    marginLeft: 12,
  },
  socialCardBody: {
    marginBottom: 16,
  },
  achievementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  achievementText2: {
    fontSize: 14,
    color: 'white',
    marginLeft: 8,
    opacity: 0.9,
  },
  socialCardCourse: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    marginBottom: 16,
  },
  socialStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
  },
  socialStat: {
    alignItems: 'center',
    flex: 1,
  },
  socialStatValue: {
    fontSize: 20,
    fontWeight: '700',
    color: 'white',
  },
  socialStatLabel: {
    fontSize: 10,
    color: 'white',
    opacity: 0.8,
    marginTop: 2,
  },
  socialStatDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  socialCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.3)',
  },
  socialCardBrand: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginLeft: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
  shareTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginVertical: 16,
  },
  shareButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
    gap: 8,
  },
  socialButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  socialButtonText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
  },
  moreShareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  moreShareText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  verifyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(212,175,55,0.15)',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.gold,
    marginTop: 16,
  },
  verifyTitle: {
    color: COLORS.gold,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  verifyText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
  },
});
