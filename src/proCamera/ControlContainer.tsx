import React, { useState } from 'react';
import { View, TouchableOpacity, Text, Animated, LayoutAnimation } from 'react-native';
import { styles } from './styles';

interface ControlContainerProps {
  title: string;
  icon?: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
  compact?: boolean;
}

export default function ControlContainer({ 
  title, 
  icon, 
  children, 
  defaultExpanded = false,
  compact = false 
}: ControlContainerProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const toggleExpanded = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsExpanded(!isExpanded);
  };

  return (
    <View style={[styles.controlContainer, compact && styles.controlContainerCompact]}>
      <TouchableOpacity 
        onPress={toggleExpanded} 
        style={[styles.controlHeader, isExpanded && styles.controlHeaderExpanded]}
        activeOpacity={0.8}
      >
        <View style={styles.controlHeaderContent}>
          {icon && <Text style={styles.controlIcon}>{icon}</Text>}
          <Text style={styles.controlTitle}>{title}</Text>
          <Text style={[styles.expandIcon, isExpanded && styles.expandIconRotated]}>
            ▼
          </Text>
        </View>
      </TouchableOpacity>
      
      {isExpanded && (
        <View style={styles.controlContent}>
          {children}
        </View>
      )}
    </View>
  );
}