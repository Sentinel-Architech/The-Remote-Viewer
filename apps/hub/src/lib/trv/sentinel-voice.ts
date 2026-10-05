/**
 * Wake phrase for Sentinel.
 *
 * Speech audio is not sent anywhere from this module. A typed or already
 * transcribed phrase is matched locally. No fact source is connected, so the
 * answer stays empty.
 */

export type WakeFact =
  | {
      wake: false;
      source: null;
      answer: null;
      text: string;
    }
  | {
      wake: true;
      question: string;
      source: "unwired";
      answer: null;
      text: "No fact source is wired. This answer was not invented.";
    };

const WAKE = /hey sentinel[,.]?\s*(.*)/i;

export function answerWakePhrase(said: string): WakeFact {
  const match = WAKE.exec(said.trim());
  if (!match) {
    return {
      wake: false,
      source: null,
      answer: null,
      text: "The wake phrase was not heard.",
    };
  }
  const question = (match[1] ?? "").trim();
  if (question.length < 3) {
    return {
      wake: false,
      source: null,
      answer: null,
      text: "Say hey sentinel and then the question.",
    };
  }
  return {
    wake: true,
    question,
    source: "unwired",
    answer: null,
    text: "No fact source is wired. This answer was not invented.",
  };
}
