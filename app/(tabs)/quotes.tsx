import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { GlassButton, GlassCard } from "@/components/ui/glass-components";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Quote, useQuoteManager } from "@/hooks/use-quote-manager";
import { useState } from "react";
import {
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  Share,
  StyleSheet,
} from "react-native";

export default function QuotesScreen() {
  const {
    allQuotes,
    isLoading,
    toggleFavorite,
    isFavorite,
    shareQuote,
    refreshQuotes,
    getQuotesByCategory,
    getFavoriteQuotes,
  } = useQuoteManager();

  const [selectedCategory, setSelectedCategory] = useState<
    "all" | "focus" | "break" | "favorites"
  >("all");

  const getFilteredQuotes = () => {
    switch (selectedCategory) {
      case "focus":
        return getQuotesByCategory("focus");
      case "break":
        return getQuotesByCategory("break");
      case "favorites":
        return getFavoriteQuotes();
      default:
        return allQuotes;
    }
  };

  const handleShare = async (quote: Quote) => {
    try {
      await Share.share({
        message: shareQuote(quote),
      });
    } catch {
      Alert.alert("Share Quote", shareQuote(quote));
    }
  };

  const handleFavorite = (quoteId: string) => {
    toggleFavorite(quoteId);
  };

  const filteredQuotes = getFilteredQuotes();

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title" style={styles.title}>
          Quotes
        </ThemedText>

        {/* Category Filter Buttons */}
        <ThemedView style={styles.filterContainer}>
          <Pressable
            style={[
              styles.filterButton,
              selectedCategory === "all" && styles.activeFilter,
            ]}
            onPress={() => setSelectedCategory("all")}
          >
            <ThemedText
              style={[
                styles.filterText,
                selectedCategory === "all" && styles.activeFilterText,
              ]}
            >
              All
            </ThemedText>
          </Pressable>
          <Pressable
            style={[
              styles.filterButton,
              selectedCategory === "focus" && styles.activeFilter,
            ]}
            onPress={() => setSelectedCategory("focus")}
          >
            <ThemedText
              style={[
                styles.filterText,
                selectedCategory === "focus" && styles.activeFilterText,
              ]}
            >
              🎯 Focus
            </ThemedText>
          </Pressable>
          <Pressable
            style={[
              styles.filterButton,
              selectedCategory === "break" && styles.activeFilter,
            ]}
            onPress={() => setSelectedCategory("break")}
          >
            <ThemedText
              style={[
                styles.filterText,
                selectedCategory === "break" && styles.activeFilterText,
              ]}
            >
              ☕ Break
            </ThemedText>
          </Pressable>
          <Pressable
            style={[
              styles.filterButton,
              selectedCategory === "favorites" && styles.activeFilter,
            ]}
            onPress={() => setSelectedCategory("favorites")}
          >
            <ThemedText
              style={[
                styles.filterText,
                selectedCategory === "favorites" && styles.activeFilterText,
              ]}
            >
              ❤️ Favorites
            </ThemedText>
          </Pressable>
        </ThemedView>
      </ThemedView>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refreshQuotes} />
        }
      >
        {filteredQuotes.map((quote) => (
          <GlassCard key={quote.id} style={styles.quoteCard}>
            <ThemedView style={styles.quoteHeader}>
              <ThemedText style={styles.categoryBadge}>
                {quote.category === "focus" ? "🎯" : "☕"} {quote.category}
              </ThemedText>
              <Pressable onPress={() => handleFavorite(quote.id)}>
                <ThemedText style={styles.favoriteIcon}>
                  {isFavorite(quote.id) ? "❤️" : "🤍"}
                </ThemedText>
              </Pressable>
            </ThemedView>

            <ThemedText style={styles.quoteText}>
              &ldquo;{quote.text}&rdquo;
            </ThemedText>

            <ThemedView style={styles.quoteFooter}>
              <ThemedText style={styles.quoteAuthor}>
                - {quote.author}
              </ThemedText>
              <Pressable
                style={styles.shareButton}
                onPress={() => handleShare(quote)}
              >
                <IconSymbol
                  name="square.and.arrow.up"
                  size={20}
                  color="#007AFF"
                />
              </Pressable>
            </ThemedView>
          </GlassCard>
        ))}

        {filteredQuotes.length === 0 && (
          <ThemedView style={styles.emptyState}>
            <ThemedText style={styles.emptyStateText}>
              {selectedCategory === "favorites"
                ? "No favorite quotes yet"
                : "No quotes available"}
            </ThemedText>
            <GlassButton onPress={refreshQuotes} style={styles.refreshButton}>
              <ThemedText style={styles.refreshButtonText}>
                Refresh Quotes
              </ThemedText>
            </GlassButton>
          </ThemedView>
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  header: {
    alignItems: "center",
    marginBottom: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
  },
  scrollView: {
    flex: 1,
  },
  quoteCard: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  quoteHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  categoryBadge: {
    fontSize: 12,
    textTransform: "capitalize",
    opacity: 0.7,
  },
  favoriteIcon: {
    fontSize: 20,
  },
  quoteText: {
    fontSize: 16,
    lineHeight: 24,
    fontStyle: "italic",
    marginBottom: 12,
  },
  quoteFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  quoteAuthor: {
    fontSize: 14,
    opacity: 0.7,
  },
  shareButton: {
    padding: 4,
  },
  filterContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 20,
    gap: 10,
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  activeFilter: {
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderColor: "rgba(255, 255, 255, 0.5)",
  },
  filterText: {
    fontSize: 14,
    textAlign: "center",
    opacity: 0.7,
  },
  activeFilterText: {
    opacity: 1,
    fontWeight: "600",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  refreshButton: {
    marginTop: 16,
  },
  emptyStateText: {
    fontSize: 16,
    textAlign: "center",
    opacity: 0.6,
    marginBottom: 8,
  },
  refreshButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
