import React, { memo } from "react";
import { Pressable, StyleSheet } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";

type CategoryType = "all" | "focus" | "break" | "favorites";

interface CategoryFilterProps {
  selectedCategory: CategoryType;
  onCategoryChange: (category: CategoryType) => void;
}

export const CategoryFilter = memo<CategoryFilterProps>(
  function CategoryFilter({ selectedCategory, onCategoryChange }) {
    const categories: { key: CategoryType; label: string }[] = [
      { key: "all", label: "All" },
      { key: "focus", label: "🎯 Focus" },
      { key: "break", label: "☕ Break" },
      { key: "favorites", label: "❤️ Favorites" },
    ];

    return (
      <ThemedView style={styles.container}>
        {categories.map((category) => (
          <Pressable
            key={category.key}
            style={[
              styles.filterButton,
              selectedCategory === category.key && styles.activeFilter,
            ]}
            onPress={() => onCategoryChange(category.key)}
            accessibilityRole="button"
            accessibilityLabel={`Filter by ${category.label}`}
            accessibilityState={{ selected: selectedCategory === category.key }}
          >
            <ThemedText
              style={[
                styles.filterText,
                selectedCategory === category.key && styles.activeFilterText,
              ]}
            >
              {category.label}
            </ThemedText>
          </Pressable>
        ))}
      </ThemedView>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 20,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  activeFilter: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },
  filterText: {
    fontSize: 14,
    fontWeight: "500",
    opacity: 0.8,
  },
  activeFilterText: {
    color: "white",
    opacity: 1,
  },
});
