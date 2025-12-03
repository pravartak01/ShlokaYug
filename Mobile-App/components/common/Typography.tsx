import React from 'react';
import { Text as RNText, TextProps, StyleSheet } from 'react-native';

/**
 * Typography Components for ShlokaYug
 * 
 * Beautiful, consistent typography across the app using:
 * - Playfair Display: Elegant headings (display font)
 * - Poppins: Modern body text (sans font)
 * - Noto Sans Devanagari: Sanskrit text (sanskrit font)
 */

interface TypographyProps extends TextProps {
  children: React.ReactNode;
  weight?: 'light' | 'regular' | 'medium' | 'semibold' | 'bold';
}

// Display/Heading Text - Playfair Display
export const DisplayText: React.FC<TypographyProps> = ({ 
  children, 
  weight = 'regular',
  style, 
  ...props 
}) => {
  const fontFamily = {
    light: 'Playfair-Regular',
    regular: 'Playfair-Regular',
    medium: 'Playfair-Medium',
    semibold: 'Playfair-SemiBold',
    bold: 'Playfair-Bold',
  }[weight];

  return (
    <RNText style={[{ fontFamily }, style]} {...props}>
      {children}
    </RNText>
  );
};

// Body Text - Poppins
export const BodyText: React.FC<TypographyProps> = ({ 
  children, 
  weight = 'regular',
  style, 
  ...props 
}) => {
  const fontFamily = {
    light: 'Poppins-Light',
    regular: 'Poppins-Regular',
    medium: 'Poppins-Medium',
    semibold: 'Poppins-SemiBold',
    bold: 'Poppins-Bold',
  }[weight];

  return (
    <RNText style={[{ fontFamily }, style]} {...props}>
      {children}
    </RNText>
  );
};

// Sanskrit Text - Noto Sans Devanagari
export const SanskritText: React.FC<TypographyProps> = ({ 
  children, 
  weight = 'regular',
  style, 
  ...props 
}) => {
  const fontFamily = {
    light: 'NotoSansDevanagari-Regular',
    regular: 'NotoSansDevanagari-Regular',
    medium: 'NotoSansDevanagari-Medium',
    semibold: 'NotoSansDevanagari-SemiBold',
    bold: 'NotoSansDevanagari-Bold',
  }[weight];

  return (
    <RNText style={[{ fontFamily }, style]} {...props}>
      {children}
    </RNText>
  );
};

// Heading Components
export const H1: React.FC<TypographyProps> = ({ children, style, ...props }) => (
  <DisplayText 
    weight="bold" 
    style={[styles.h1, style]} 
    {...props}
  >
    {children}
  </DisplayText>
);

export const H2: React.FC<TypographyProps> = ({ children, style, ...props }) => (
  <DisplayText 
    weight="semibold" 
    style={[styles.h2, style]} 
    {...props}
  >
    {children}
  </DisplayText>
);

export const H3: React.FC<TypographyProps> = ({ children, style, ...props }) => (
  <DisplayText 
    weight="medium" 
    style={[styles.h3, style]} 
    {...props}
  >
    {children}
  </DisplayText>
);

// Body Text Components
export const Paragraph: React.FC<TypographyProps> = ({ children, style, ...props }) => (
  <BodyText 
    weight="regular" 
    style={[styles.paragraph, style]} 
    {...props}
  >
    {children}
  </BodyText>
);

export const Label: React.FC<TypographyProps> = ({ children, style, ...props }) => (
  <BodyText 
    weight="medium" 
    style={[styles.label, style]} 
    {...props}
  >
    {children}
  </BodyText>
);

export const Caption: React.FC<TypographyProps> = ({ children, style, ...props }) => (
  <BodyText 
    weight="regular" 
    style={[styles.caption, style]} 
    {...props}
  >
    {children}
  </BodyText>
);

// Sanskrit Shloka Text
export const ShlokaText: React.FC<TypographyProps> = ({ children, style, ...props }) => (
  <SanskritText 
    weight="medium" 
    style={[styles.shloka, style]} 
    {...props}
  >
    {children}
  </SanskritText>
);

const styles = StyleSheet.create({
  h1: {
    fontSize: 32,
    lineHeight: 40,
    color: '#1f2937',
    letterSpacing: -0.5,
  },
  h2: {
    fontSize: 24,
    lineHeight: 32,
    color: '#1f2937',
    letterSpacing: -0.3,
  },
  h3: {
    fontSize: 20,
    lineHeight: 28,
    color: '#374151',
    letterSpacing: -0.2,
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 24,
    color: '#4b5563',
  },
  label: {
    fontSize: 14,
    lineHeight: 20,
    color: '#374151',
  },
  caption: {
    fontSize: 12,
    lineHeight: 16,
    color: '#6b7280',
  },
  shloka: {
    fontSize: 18,
    lineHeight: 28,
    color: '#583b31',
    textAlign: 'center',
  },
});

export default {
  DisplayText,
  BodyText,
  SanskritText,
  H1,
  H2,
  H3,
  Paragraph,
  Label,
  Caption,
  ShlokaText,
};
