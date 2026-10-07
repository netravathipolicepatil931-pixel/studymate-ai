const STOP = new Set(
  "about above after again also another because before being between could does doing during each from have having here into just more most other over same should some such than that their them then there these they this those through under until very were what when where which while will with would your about also also application using system process function value results values model level using into which within overall detailed".split(" ")
);

export function getSentences(text) {
  if (!text) return [];
  const clean = text.replace(/\s+/g, " ");
  return (clean.match(/[^.!?]+[.!?]+/g) || [])
    .map((s) => s.trim())
    .filter((s) => s.length > 25);
}

function wordFreq(text) {
  const freq = {};
  (text.toLowerCase().match(/[a-z]{4,}/g) || []).forEach((w) => {
    if (!STOP.has(w)) freq[w] = (freq[w] || 0) + 1;
  });
  return freq;
}

export function getKeywords(text, n = 12) {
  const freq = wordFreq(text);
  return Object.keys(freq)
    .sort((a, b) => freq[b] - freq[a])
    .slice(0, n);
}

export function getDefinitions(text, keywords) {
  const sentences = getSentences(text);
  const defs = {};
  
  keywords.forEach((kw) => {
    const re = new RegExp(`\\b${kw}\\b`, "i");
    const sentence = sentences.find((s) => re.test(s));
    if (sentence) {
      defs[kw] = sentence;
    } else {
      defs[kw] = `Key term extracted from the material related to ${kw}.`;
    }
  });
  
  return defs;
}

export function summarize(text, count = 5) {
  const sentences = getSentences(text);
  if (!sentences.length) return ["No sufficient text provided for summary."];
  const freq = wordFreq(text);
  const scored = sentences.map((s, index) => {
    const words = s.toLowerCase().match(/[a-z]{4,}/g) || [];
    const score = words.reduce((sum, w) => sum + (freq[w] || 0), 0) / Math.sqrt(words.length || 1);
    return { s, index, score };
  });
  
  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, Math.min(count, sentences.length))
    .sort((a, b) => a.index - b.index)
    .map((x) => x.s);
}

export function makeFlashcards(text, count = 8) {
  const sentences = getSentences(text);
  const keywords = getKeywords(text, 25);
  const cards = [];
  const usedSentences = new Set();

  for (const kw of keywords) {
    const re = new RegExp(`\\b${kw}\\b`, "i");
    const sentence = sentences.find((s) => re.test(s) && !usedSentences.has(s));
    if (sentence) {
      usedSentences.add(sentence);
      const questionText = sentence.replace(re, "【 _______ 】");
      cards.push({
        id: `card-${cards.length + 1}`,
        q: questionText,
        a: kw,
        fullContext: sentence,
        category: "Core Concept",
      });
    }
    if (cards.length >= count) break;
  }
  
  return cards;
}

const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

export function makeQuiz(text, count = 5) {
  const allKeywords = getKeywords(text, 30);
  const flashcards = makeFlashcards(text, count);
  
  return flashcards.map((card, idx) => {
    const distractors = shuffle(allKeywords.filter((k) => k.toLowerCase() !== card.a.toLowerCase())).slice(0, 3);
    const options = shuffle([card.a, ...distractors]);
    return {
      id: `q-${idx + 1}`,
      question: card.q,
      answer: card.a,
      options: options,
      explanation: `Context from study material: "${card.fullContext}"`,
    };
  });
}

export function generateSyllabusFromText(text) {
  const sentences = getSentences(text);
  const keywords = getKeywords(text, 10);
  
  if (!keywords.length) {
    return [
      { name: "Introduction to Core Concepts", done: false, priority: "High" },
      { name: "Key Terminology & Definitions", done: false, priority: "Medium" },
      { name: "Practical Applications & Synthesis", done: false, priority: "High" }
    ];
  }

  return keywords.map((kw, i) => ({
    id: `topic-${i + 1}`,
    name: `Mastery of ${kw.charAt(0).toUpperCase() + kw.slice(1)} & Related Principles`,
    done: false,
    priority: i % 3 === 0 ? "High" : i % 2 === 0 ? "Medium" : "Normal",
  }));
}

export function answerQuestion(question, contextText) {
  if (!question || !contextText) {
    return "Please provide both a question and study material context.";
  }

  const queryWords = question.toLowerCase().match(/[a-z]{3,}/g) || [];
  const sentences = getSentences(contextText);

  if (!sentences.length) {
    return "I couldn't analyze the study material. Please upload or paste valid study notes.";
  }

  const scored = sentences.map((s) => {
    const sentenceWords = s.toLowerCase().match(/[a-z]{3,}/g) || [];
    let matches = 0;
    queryWords.forEach((qw) => {
      if (sentenceWords.includes(qw)) matches++;
    });
    return { sentence: s, score: matches };
  });

  scored.sort((a, b) => b.score - a.score);

  if (scored[0].score > 0) {
    const topMatches = scored.slice(0, 2).map((x) => x.sentence).join(" ");
    return `Based on your uploaded material:\n\n"${topMatches}"`;
  }

  return `Here is a summary based on your notes:\n\n${summarize(contextText, 2).join("\n\n")}`;
}