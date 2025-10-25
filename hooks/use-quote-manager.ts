import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useRef, useState } from "react";
import { Animated } from "react-native";

export interface Quote {
  id: string;
  text: string;
  author: string;
  category: "focus" | "break";
  isFavorite?: boolean;
  source?: "api" | "local";
}

const QUOTES_CACHE_KEY = "@focusTimer:quotes";
const FAVORITES_KEY = "@focusTimer:favorites";
const LAST_UPDATE_KEY = "@focusTimer:lastQuoteUpdate";

// Fallback quotes for offline use
const fallbackQuotes: Quote[] = [
  // Focus quotes
  {
    id: "f1",
    text: "The key to success is to focus our conscious mind on things we desire not things we fear.",
    author: "Brian Tracy",
    category: "focus",
    source: "local",
  },
  {
    id: "f2",
    text: "Concentrate all your thoughts upon the work at hand. The sun's rays do not burn until brought to a focus.",
    author: "Alexander Graham Bell",
    category: "focus",
    source: "local",
  },
  {
    id: "f3",
    text: "The successful warrior is the average man with laser-like focus.",
    author: "Bruce Lee",
    category: "focus",
    source: "local",
  },
  {
    id: "f4",
    text: "Focus is a matter of deciding what things you're not going to do.",
    author: "John Carmack",
    category: "focus",
    source: "local",
  },
  {
    id: "f5",
    text: "The art of being wise is knowing what to overlook.",
    author: "William James",
    category: "focus",
    source: "local",
  },
  // Break quotes
  {
    id: "b1",
    text: "Rest when you're weary. Refresh and renew yourself, your body, your mind, your spirit.",
    author: "Ralph Marston",
    category: "break",
    source: "local",
  },
  {
    id: "b2",
    text: "Take time to make your soul happy.",
    author: "Unknown",
    category: "break",
    source: "local",
  },
  {
    id: "b3",
    text: "Sometimes the most productive thing you can do is relax.",
    author: "Mark Black",
    category: "break",
    source: "local",
  },
  {
    id: "b4",
    text: "A good laugh and a long sleep are the best cures in the doctor's book.",
    author: "Irish Proverb",
    category: "break",
    source: "local",
  },
  {
    id: "b5",
    text: "Smile, breathe, and go slowly.",
    author: "Thich Nhat Hanh",
    category: "break",
    source: "local",
  },
];

export function useQuoteManager() {
  const [currentQuote, setCurrentQuote] = useState<Quote>(fallbackQuotes[0]);
  const [allQuotes, setAllQuotes] = useState<Quote[]>(fallbackQuotes);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<number>(0);

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const quoteChangeInterval = useRef<NodeJS.Timeout | null>(null);

  // Load cached data on mount
  useEffect(() => {
    const initializeQuotes = async () => {
      await loadCachedData();
      startQuoteRotation();
    };

    initializeQuotes();

    return () => {
      if (quoteChangeInterval.current) {
        clearInterval(quoteChangeInterval.current);
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const loadCachedData = async () => {
    try {
      const [cachedQuotes, cachedFavorites, cachedLastUpdate] =
        await Promise.all([
          AsyncStorage.getItem(QUOTES_CACHE_KEY),
          AsyncStorage.getItem(FAVORITES_KEY),
          AsyncStorage.getItem(LAST_UPDATE_KEY),
        ]);

      if (cachedQuotes) {
        const quotes = JSON.parse(cachedQuotes);
        setAllQuotes([...fallbackQuotes, ...quotes]);
      }

      if (cachedFavorites) {
        setFavorites(JSON.parse(cachedFavorites));
      }

      if (cachedLastUpdate) {
        setLastUpdate(parseInt(cachedLastUpdate));
      }

      // Check if we need to fetch new quotes (every 24 hours)
      const now = Date.now();
      const lastUpdateTime = cachedLastUpdate ? parseInt(cachedLastUpdate) : 0;
      if (now - lastUpdateTime > 24 * 60 * 60 * 1000) {
        fetchQuotesFromAPI();
      }
    } catch (error) {
      console.error("Failed to load cached quotes:", error);
    }
  };

  const fetchQuotesFromAPI = async () => {
    setIsLoading(true);
    try {
      // Fetch multiple quotes for variety
      const response = await fetch("https://zenquotes.io/api/quotes");
      const data = await response.json();

      if (data && Array.isArray(data)) {
        const processedQuotes: Quote[] = data
          .slice(0, 20)
          .map((quote: any, index: number) => ({
            id: `api_${Date.now()}_${index}`,
            text: quote.q,
            author: quote.a,
            category: Math.random() > 0.6 ? "focus" : "break", // 60% focus, 40% break
            source: "api" as const,
          }));

        const updatedQuotes = [...fallbackQuotes, ...processedQuotes];
        setAllQuotes(updatedQuotes);

        // Cache the API quotes (not fallback ones)
        await AsyncStorage.setItem(
          QUOTES_CACHE_KEY,
          JSON.stringify(processedQuotes)
        );
        await AsyncStorage.setItem(LAST_UPDATE_KEY, Date.now().toString());
        setLastUpdate(Date.now());
      }
    } catch (error) {
      console.error("Failed to fetch quotes from API:", error);
      // Fallback quotes are already loaded
    } finally {
      setIsLoading(false);
    }
  };

  const startQuoteRotation = () => {
    // Change quote every 5 minutes (300,000 ms)
    quoteChangeInterval.current = setInterval(() => {
      changeQuoteWithAnimation();
    }, 5 * 60 * 1000);
  };

  const changeQuoteWithAnimation = () => {
    // Fade out current quote
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 500,
      useNativeDriver: true,
    }).start(() => {
      // Change quote while faded out
      const availableQuotes = allQuotes.filter((q) => q.id !== currentQuote.id);
      if (availableQuotes.length > 0) {
        const randomQuote =
          availableQuotes[Math.floor(Math.random() * availableQuotes.length)];
        setCurrentQuote(randomQuote);
      }

      // Fade in new quote
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    });
  };

  const getQuotesByCategory = (category: "focus" | "break"): Quote[] => {
    return allQuotes.filter((quote) => quote.category === category);
  };

  const getCurrentQuoteBySession = (
    sessionType: "focus" | "break" | "longBreak"
  ): Quote => {
    const category = sessionType === "focus" ? "focus" : "break";
    const categoryQuotes = getQuotesByCategory(category);

    if (currentQuote.category === category) {
      return currentQuote;
    }

    // Return a random quote from the appropriate category
    return (
      categoryQuotes[Math.floor(Math.random() * categoryQuotes.length)] ||
      currentQuote
    );
  };

  const toggleFavorite = async (quoteId: string) => {
    const updatedFavorites = favorites.includes(quoteId)
      ? favorites.filter((id) => id !== quoteId)
      : [...favorites, quoteId];

    setFavorites(updatedFavorites);
    await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(updatedFavorites));
  };

  const getFavoriteQuotes = (): Quote[] => {
    return allQuotes.filter((quote) => favorites.includes(quote.id));
  };

  const shareQuote = (quote: Quote): string => {
    return `"${quote.text}" - ${quote.author}`;
  };

  const copyQuote = (quote: Quote): string => {
    return shareQuote(quote);
  };

  const manuallyChangeQuote = () => {
    changeQuoteWithAnimation();
  };

  const refreshQuotes = () => {
    fetchQuotesFromAPI();
  };

  return {
    // Current state
    currentQuote,
    allQuotes,
    favorites,
    isLoading,
    lastUpdate,
    fadeAnim,

    // Quote access
    getQuotesByCategory,
    getCurrentQuoteBySession,
    getFavoriteQuotes,

    // Actions
    toggleFavorite,
    shareQuote,
    copyQuote,
    manuallyChangeQuote,
    refreshQuotes,
    changeQuoteWithAnimation,

    // Utility
    isFavorite: (quoteId: string) => favorites.includes(quoteId),
    totalQuotes: allQuotes.length,
    focusQuotesCount: getQuotesByCategory("focus").length,
    breakQuotesCount: getQuotesByCategory("break").length,
  };
}
