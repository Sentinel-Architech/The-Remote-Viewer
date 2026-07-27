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
    paddingTop: 64,
    paddingBottom: 48,
  },
  title: {
    color: "#e8e8e8",
    fontSize: 24,
    fontWeight: "600",
    marginBottom: 8,
  },
  badge: {
    alignSelf: "flex-start",
    color: "#ff6b35",
    borderColor: "#ff6b35",
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 24,
  },
  notice: {
    borderColor: "#ff6b35",
    borderWidth: 1,
    borderRadius: 6,
    padding: 14,
    backgroundColor: "#1a120e",
    marginBottom: 24,
  },
  noticeTitle: {
    color: "#ff6b35",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  body: {
    color: "#e8e8e8",
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  heading: {
    color: "#e8e8e8",
    fontSize: 16,
    fontWeight: "600",
    marginTop: 8,
    marginBottom: 8,
  },
  item: {
    color: "#c0c0c0",
    fontSize: 14,
    marginBottom: 4,
  },
  code: {
    color: "#39ff14",
    fontSize: 12,
    fontFamily: "monospace",
    marginBottom: 4,
  },
  motto: {
    marginTop: 32,
    textAlign: "center",
    color: "#e8e8e8",
    fontSize: 12,
    letterSpacing: 1,
  },
  sub: {
    textAlign: "center",
    color: "#9a9a9a",
    fontSize: 11,
    marginTop: 4,
  },
});    textAlign: "center",
    color: "#e8e8e8",
    fontSize: 12,
    letterSpacing: 1,
  },
  sub: {
    textAlign: "center",
    color: "#9a9a9a",
    fontSize: 11,
    marginTop: 4,
  },
});
