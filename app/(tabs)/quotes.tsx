import React, { useCallback, useMemo, useState } from "react";
import {
  Alert,
  RefreshControl,
  ScrollView,
  Share,
  StyleSheet,
} from "react-native";

import { CategoryFilter } from "@/components/quotes/category-filter";
import { QuoteItem } from "@/components/quotes/quote-item";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import type { Quote } from "@/hooks/use-quote-manager";
import { useQuoteManager } from "@/hooks/use-quote-manager";

type CategoryType = "all" | "focus" | "break" | "favorites";

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

  const [selectedCategory, setSelectedCategory] = useState<CategoryType>("all");

  const filteredQuotes = useMemo(() => {
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
  }, [selectedCategory, allQuotes, getQuotesByCategory, getFavoriteQuotes]);

  const handleShare = useCallback(
    async (quote: Quote) => {
      try {
        await Share.share({
          message: shareQuote(quote),
        });
      } catch {
        Alert.alert("Share Quote", shareQuote(quote));
      }
    },
    [shareQuote]
  );

  const handleFavorite = useCallback(
    (quoteId: string) => {
      toggleFavorite(quoteId);
    },
    [toggleFavorite]
  );

  const handleCategoryChange = useCallback((category: CategoryType) => {
    setSelectedCategory(category);
  }, []);

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title" style={styles.title}>
          Quotes
        </ThemedText>

        <CategoryFilter
          selectedCategory={selectedCategory}
          onCategoryChange={handleCategoryChange}
        />
      </ThemedView>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refreshQuotes} />
        }
      >
        {filteredQuotes.map((quote) => (
          <QuoteItem
            key={quote.id}
            quote={quote}
            isFavorite={isFavorite(quote.id)}
            onToggleFavorite={handleFavorite}
            onShare={handleShare}
          />
        ))}

        {filteredQuotes.length === 0 && (
          <ThemedView style={styles.emptyState}>
            <ThemedText style={styles.emptyStateText}>
              {selectedCategory === "favorites"
                ? "No favorite quotes yet"
                : "No quotes available"}
            </ThemedText>
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
