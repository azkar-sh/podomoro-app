import { BlurView } from "expo-blur";
import React, { memo } from "react";
import { Animated, Pressable, StyleSheet } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useColorScheme } from "@/hooks/use-color-scheme";
import type { Quote } from "@/hooks/use-quote-manager";

interface QuoteCardProps {
  quote: Quote;
  fadeAnim: Animated.Value;
  onRefresh: () => void;
  onToggleFavorite: (id: string) => void;
  onShare: (quote: Quote) => void;
  isFavorite: boolean;
}

export const QuoteCard = memo<QuoteCardProps>(function QuoteCard({
  quote,
  fadeAnim,
  onRefresh,
  onToggleFavorite,
  onShare,
  isFavorite,
}) {
  const colorScheme = useColorScheme();

  return (
    <ThemedView style={styles.container}>
      <BlurView
        intensity={15}
        tint={colorScheme ?? "default"}
        style={styles.blur}
      >
        <Animated.View style={{ opacity: fadeAnim }}>
          <ThemedText style={styles.quoteText}>
            &ldquo;{quote.text}&rdquo;
          </ThemedText>
          <ThemedText style={styles.quoteAuthor}>— {quote.author}</ThemedText>
        </Animated.View>

        <ThemedView style={styles.controls}>
          <Pressable
            style={styles.controlButton}
            onPress={onRefresh}
            accessibilityLabel="Refresh quote"
            accessibilityRole="button"
          >
            <ThemedText style={styles.controlIcon}>🔄</ThemedText>
          </Pressable>

          <Pressable
            style={styles.controlButton}
            onPress={() => onToggleFavorite(quote.id)}
            accessibilityLabel={
              isFavorite ? "Remove from favorites" : "Add to favorites"
            }
            accessibilityRole="button"
          >
            <ThemedText style={styles.controlIcon}>
              {isFavorite ? "❤️" : "🤍"}
            </ThemedText>
          </Pressable>

          <Pressable
            style={styles.controlButton}
            onPress={() => onShare(quote)}
            accessibilityLabel="Share quote"
            accessibilityRole="button"
          >
            <ThemedText style={styles.controlIcon}>📤</ThemedText>
          </Pressable>
        </ThemedView>
      </BlurView>
    </ThemedView>
  );
});

const styles = StyleSheet.create({
  container: {
    marginBottom: 30,
    marginHorizontal: 20,
    borderRadius: 16,
    overflow: "hidden",
  },
  blur: {
    padding: 20,
  },
  quoteText: {
    fontSize: 16,
    fontStyle: "italic",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 8,
  },
  quoteAuthor: {
    fontSize: 14,
    textAlign: "center",
    opacity: 0.7,
    marginBottom: 16,
  },
  controls: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
  },
  controlButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  controlIcon: {
    fontSize: 18,
  },
});
