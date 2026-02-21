import React from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ThemedText } from "../../components/ThemedText";
import { getQuoteById } from "@/data/quotes";
import { getBook } from "@/data/books";
import { getCategoryColor, colors } from "@/lib/theme";

export default function AskProfitScreen() {
  const router = useRouter();
  const { quoteId } = useLocalSearchParams();
  const [activeTab, setActiveTab] = React.useState("applyIt");

  const quote = getQuoteById(quoteId as string);
  const book = quote ? getBook(quote.bookId) : null;

  if (!quote) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.muted} />
          </Pressable>
          <ThemedText style={styles.headerTitle}>ASK PROFIT</ThemedText>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.centerContent}>
          <ThemedText style={styles.errorText}>Quote not found</ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  const askProfit = quote.askProfit || {
    applyIt: "This is where I'd break down exactly how to use this quote in your situation. The streets taught me that knowledge without application is just noise.",
    whyItHits: "Here's why this quote lands different. It's not just words — it's a whole philosophy encoded into a sentence.",
    deepCut: "The real talk: this quote goes deeper than most people realize. Let me show you what's underneath.",
  };

  const tabs = [
    { id: "applyIt", label: "Apply It", icon: "flash-outline" },
    { id: "whyItHits", label: "Why It Hits", icon: "heart-outline" },
    { id: "deepCut", label: "Deep Cut", icon: "diamond-outline" },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.muted} />
        </Pressable>
        <ThemedText style={styles.headerTitle}>ASK PROFIT</ThemedText>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Original Quote */}
        <View style={styles.quoteSection}>
          <View style={styles.categoryRow}>
            {quote.category.map((cat) => (
              <View
                key={cat}
                style={[
                  styles.categoryBadge,
                  { backgroundColor: getCategoryColor(cat) + "25" },
                ]}
              >
                <ThemedText
                  style={[styles.categoryText, { color: getCategoryColor(cat) }]}
                >
                  {cat}
                </ThemedText>
              </View>
            ))}
          </View>

          <ThemedText style={styles.quoteText}">{quote.text}"</ThemedText>

          {book && (
            <View style={styles.sourceRow}>
              <View style={styles.sourceLine} />
              <ThemedText style={styles.sourceText}>{book.author}</ThemedText>
              <ThemedText style={styles.sourceBook}>{book.title}</ThemedText>
            </View>
          )}
        </View>

        <View style={styles.divider} />

        {/* Tabs */}
        <View style={styles.tabContainer}>
          {tabs.map((tab) => (
            <Pressable
              key={tab.id}
              onPress={() => setActiveTab(tab.id)}
              style={[
                styles.tab,
                activeTab === tab.id && styles.activeTab,
              ]}
            >
              <Ionicons
                name={tab.icon as any}
                size={16}
                color={activeTab === tab.id ? colors.accent : colors.muted}
              />
              <ThemedText
                style={[
                  styles.tabText,
                  activeTab === tab.id && styles.activeTabText,
                ]}
              >
                {tab.label}
              </ThemedText>
            </Pressable>
          ))}
        </View>

        {/* Response Content */}
        <View style={styles.responseSection}>
          <View style={styles.profitHeader}>
            <View style={styles.avatar}>
              <ThemedText style={styles.avatarText}>P</ThemedText>
            </View>
            <View>
              <ThemedText style={styles.profitName}>Profit</ThemedText>
              <ThemedText style={styles.profitHandle}>@profitscanon</ThemedText>
            </View>
          </View>

          <ThemedText style={styles.responseText}>
            {askProfit[activeTab as keyof typeof askProfit]}
          </ThemedText>

          <View style={styles.signature}>
            <ThemedText style={styles.signatureText}>— Remember: the world forgets, I don't.</ThemedText>
          </View>
        </View>

        <View style={{ height: 48 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 3,
    opacity: 0.4,
  },
  centerContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  errorText: {
    fontSize: 16,
    opacity: 0.5,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
  },
  quoteSection: {
    paddingTop: 24,
    paddingBottom: 20,
  },
  categoryRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 20,
  },
  categoryBadge: {
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  quoteText: {
    fontSize: 22,
    fontWeight: "600",
    lineHeight: 34,
    fontStyle: "italic",
    letterSpacing: 0.3,
    marginBottom: 20,
  },
  sourceRow: {
    marginBottom: 4,
  },
  sourceLine: {
    width: 32,
    height: 2,
    backgroundColor: colors.accent,
    marginBottom: 12,
    opacity: 0.6,
  },
  sourceText: {
    fontSize: 15,
    fontWeight: "600",
    opacity: 0.7,
    marginBottom: 2,
  },
  sourceBook: {
    fontSize: 13,
    opacity: 0.4,
    fontStyle: "italic",
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginBottom: 20,
  },
  tabContainer: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 24,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  activeTab: {
    borderColor: colors.accent,
    backgroundColor: colors.accent + "15",
  },
  tabText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.muted,
  },
  activeTabText: {
    color: colors.accent,
  },
  responseSection: {
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 20,
  },
  profitHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
  },
  profitName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
  },
  profitHandle: {
    fontSize: 13,
    opacity: 0.5,
  },
  responseText: {
    fontSize: 16,
    lineHeight: 28,
    opacity: 0.9,
  },
  signature: {
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  signatureText: {
    fontSize: 14,
    fontStyle: "italic",
    opacity: 0.6,
    color: colors.accent,
  },
});
