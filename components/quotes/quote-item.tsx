import { BlurView } from "expo-blur";
import React, { memo } from "react";
import { Pressable, StyleSheet } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useColorScheme } from "@/hooks/use-color-scheme";
import type { Quote } from "@/hooks/use-quote-manager";

interface QuoteItemProps {
  quote: Quote;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  onShare: (quote: Quote) => void;
}

export const QuoteItem = memo<QuoteItemProps>(function QuoteItem({
  quote,
  isFavorite,
  onToggleFavorite,
  onShare,
}) {
  const colorScheme = useColorScheme();

  return (
    <ThemedView style={styles.container}>
      <BlurView
        intensity={15}
        tint={colorScheme ?? "default"}
        style={styles.blur}
      >
        <ThemedText style={styles.quoteText}>
          &ldquo;{quote.text}&rdquo;
        </ThemedText>
        <ThemedText style={styles.author}>— {quote.author}</ThemedText>

        <ThemedView style={styles.actions}>
          <Pressable
            onPress={() => onToggleFavorite(quote.id)}
            style={styles.actionButton}
            accessibilityRole="button"
            accessibilityLabel={
              isFavorite ? "Remove from favorites" : "Add to favorites"
            }
          >
            <ThemedText style={styles.actionIcon}>
              {isFavorite ? "❤️" : "🤍"}
            </ThemedText>
          </Pressable>

          <Pressable
            onPress={() => onShare(quote)}
            style={styles.actionButton}
            accessibilityRole="button"
            accessibilityLabel="Share quote"
          >
            <ThemedText style={styles.actionIcon}>📤</ThemedText>
          </Pressable>
        </ThemedView>
      </BlurView>
    </ThemedView>
  );
});

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: "hidden",
  },
  blur: {
    padding: 20,
  },
  quoteText: {
    fontSize: 16,
    lineHeight: 24,
    fontStyle: "italic",
    marginBottom: 12,
  },
  author: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 16,
  },
  actions: {
    flexDirection: "row",
    gap: 12,
  },
  actionButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  actionIcon: {
    fontSize: 18,
  },
});
