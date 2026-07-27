import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View, ScrollView } from "react-native";
import { LOCKED_DOCS, SCAFFOLD_NON_GOALS } from "../shared/src";

/**
 * Mobile client entry — SCAFFOLD ONLY.
 * No identity, no credentials, no Vault, no security claims.
 */
export default function App() {
  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>The Remote Viewer</Text>
        <Text style={styles.badge}>Mobile — Scaffold Only</Text>

        <View style={styles.notice}>
          <Text style={styles.noticeTitle}>Not production. Not secure yet.</Text>
          <Text style={styles.body}>
            This app is a structural foundation only. It does not implement
            DIDs, Verifiable Credentials, selective disclosure, key management,
            or Destroy = Restart.
          </Text>
          <Text style={styles.body}>
            Security requirements live in docs/locked/. Follow the roadmap
            before any security claim is made.
          </Text>
        </View>

        <Text style={styles.heading}>Scaffold non-goals</Text>
        {SCAFFOLD_NON_GOALS.map((item) => (
          <Text key={item} style={styles.item}>
            • {item}
          </Text>
        ))}

        <Text style={styles.heading}>Locked design references</Text>
        {Object.values(LOCKED_DOCS).map((path) => (
          <Text key={path} style={styles.code}>
            {path}
          </Text>
        ))}

        <Text style={styles.motto}>YOU CHOOSE TO BURN FOR YOUR PROTECTION</Text>
        <Text style={styles.sub}>Destroy = Restart from Square One</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#0a0a0a",
  },
  content: {
    padding: 24,
    paddingTop: 72,
    paddingBottom: 56,
  },
  title: {
    color: "#e8e8e8",
    fontSize: 26,
    fontWeight: "650",
    marginBottom: 10,
    letterSpacing: -0.3,
  },
  badge: {
    alignSelf: "flex-start",
    color: "#ff6b35",
    borderColor: "#ff6b35",
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 5,
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 1.1,
    borderRadius: 4,
    marginBottom: 28,
  },
  notice: {
    borderColor: "#ff6b35",
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    backgroundColor: "#1a120e",
    marginBottom: 28,
  },
  noticeTitle: {
    color: "#ff6b35",
    fontSize: 16,
    fontWeight: "650",
    marginBottom: 10,
  },
  body: {
    color: "#d0d0d0",
    fontSize: 14.5,
    lineHeight: 21,
    marginBottom: 8,
  },
  heading: {
    color: "#e8e8e8",
    fontSize: 16,
    fontWeight: "600",
    marginTop: 12,
    marginBottom: 10,
  },
  item: {
    color: "#c0c0c0",
    fontSize: 14.5,
    marginBottom: 5,
    lineHeight: 20,
  },
  code: {
    color: "#39ff14",
    fontSize: 12.5,
    fontFamily: "monospace",
    marginBottom: 5,
  },
  motto: {
    marginTop: 40,
    textAlign: "center",
    color: "#e8e8e8",
    fontSize: 12.5,
    letterSpacing: 1.1,
    fontWeight: "500",
  },
  sub: {
    textAlign: "center",
    color: "#9a9a9a",
    fontSize: 11.5,
    marginTop: 6,
  },
});