import { Type } from "@google/genai";

export interface SurahSection {
  title: string;
  startAyah: number;
  endAyah: number;
  summary: string;
  keyConcepts: string[];
  colorHex: string;
}

export interface SurahStructureData {
  surahName: string;
  mainTheme: string;
  centralIdea: string;
  sections: SurahSection[];
  mermaidDiagram: string;
}

export async function analyzeSurahStructure(surahName: string, ayahsCount: number): Promise<SurahStructureData> {
  const prompt = `أنت عالم متخصص في مقاصد السور وتفسير القرآن الكريم.
المستخدم يريد فهم هيكلية سورة "${surahName}" وترابط مقاطعها ببعضها البعض، مع تقسيمها لفترات أو موضوعات لإنشاء خريطة بصرية عالية الجودة.

قم بتحليل سورة "${surahName}" (عدد آياتها ${ayahsCount}) واستخرج:
1. المقصد الأساسي للسورة والفكرة المركزية.
2. قسم السورة إلى مقاطع موضوعية (أجزاء متصلة). لكل مقطع حدد: عنوان جذاب، ورقم آية البداية والنهاية، وملخص عميق بأسلوب مبسط، ومفاهيم محورية.
3. اقترح رمز لوني (Hex Code) هادئ جداً وفاتح وأنيق لكل مقطع.
4. كود Mermaid.js (flowchart TD) لرسم خريطة ذهنية تفصيلية توضح تسلسل المقاطع وترابطها الهيكلي بشكل شجري أو متسلسل.

هام جداً: التزم بالدقة العلمية والتحليل الرصين لمقاصد السور، ولا تذكر أسماء مفسرين أو كتب بعينها في النتائج.`;

  const schema = {
    type: Type.OBJECT,
    properties: {
      surahName: { type: Type.STRING },
      mainTheme: { type: Type.STRING, description: "المقصد الأساسي للسورة" },
      centralIdea: { type: Type.STRING, description: "الفكرة المركزية بأسلوب جذاب" },
      sections: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: "عنوان المقطع" },
            startAyah: { type: Type.INTEGER, description: "رقم آية البداية" },
            endAyah: { type: Type.INTEGER, description: "رقم آية النهاية" },
            summary: { type: Type.STRING, description: "خلاصة المقطع وأهم أفكاره" },
            keyConcepts: { type: Type.ARRAY, items: { type: Type.STRING }, description: "المفاهيم المحورية للمقطع" },
            colorHex: { type: Type.STRING, description: "لون هادئ وأنيق جدا مثل #F4EAE6" },
          }
        }
      },
      mermaidDiagram: { type: Type.STRING, description: "كود Mermaid.js (flowchart TD) يوضح الهيكل." }
    },
    required: ["surahName", "mainTheme", "centralIdea", "sections", "mermaidDiagram"]
  };

  const response = await fetch("/api/analyze-surah", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, schema }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to analyze surah structure");
  }

  const data = await response.json();
  const text = data.text;
  
  if (!text) {
    throw new Error("Empty response from AI");
  }
  const parsed = JSON.parse(text) as SurahStructureData;
  if (parsed.mermaidDiagram) {
    parsed.mermaidDiagram = parsed.mermaidDiagram.replace(/^```(mermaid)?\n?/, '').replace(/\n?```$/, '').trim();
  }
  return parsed;
}

export interface TafsirData {
  simplifiedTafsir: string;
  detailedTafsir: string;
  modernApplication: string;
  contextAndConnection: string;
  rhetoric: string;
  vocabularyAndRoots: Array<{ word: string; root: string; meaning: string; simplifiedExplanation: string }>;
  grammar: string;
  revelationReasons: string;
  surahOverview: string;
  mermaidDiagram: string;
  shadeOfAyah: string;
  artisticImagery: string;
  mutashabihat: string;
  emotionalImpact: string; // New: Impact on the soul
  practicalSteps: string; // New: Practical steps for application
}

export async function explainAyah(surahName: string, ayahNumber: number, ayahText: string): Promise<TafsirData> {
  const prompt = `أنت خبير متمكن في علوم التفسير وأسرار النظم القرآني والمتشابهات اللفظية.
المستخدم يريد فهم آيات القرآن بعمق يجمع بين الدقة اللغوية والبلاغية، والظلال الوجدانية، مع لمسات عن المتشابهات اللفظية.

سورة: ${surahName}
الآية رقم: ${ayahNumber}
النص: ${ayahText}

يجب أن تقوم بتفكيك التفسير إلى المحاور التالية:
1. التفسير المبسط للآية (Simplified Tafsir).
2. التفسير المفصل والدقيق للآية (Detailed Tafsir).
3. ظلال الآية (Shade of Ayah).
4. المشهد والتصوير الفني (Artistic Imagery).
5. المتشابهات اللفظية وحكمة اللفظ (Mutashabihat).
6. الإسقاط على الواقع والفهم المعاصر (Modern Application).
7. أثر الآية في الوجدان (Emotional Impact).
8. خطوات عملية للتطبيق (Practical Steps).
9. التناسب والترابط (Context and Connection).
10. البلاغة والبيان (Rhetoric).
11. معاني المفردات والجذور (Vocabulary and Roots).
12. الإعراب واللغة (Grammar).
13. أسباب النزول (Revelation Reasons).
14. رسم توضيحي Mermaid.js (flowchart TD).

هام جداً: لا تذكر أسماء مفسرين أو أسماء كتب بعينها في النتائج النهائية.`;

  const schema = {
    type: Type.OBJECT,
    properties: {
      simplifiedTafsir: { type: Type.STRING },
      detailedTafsir: { type: Type.STRING },
      shadeOfAyah: { type: Type.STRING },
      artisticImagery: { type: Type.STRING },
      mutashabihat: { type: Type.STRING },
      modernApplication: { type: Type.STRING },
      emotionalImpact: { type: Type.STRING, description: "أثر الآية الإيماني والوجداني" },
      practicalSteps: { type: Type.STRING, description: "خطوات عملية محددة لتطبيق الآية" },
      contextAndConnection: { type: Type.STRING },
      rhetoric: { type: Type.STRING },
      vocabularyAndRoots: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            word: { type: Type.STRING },
            root: { type: Type.STRING },
            meaning: { type: Type.STRING },
            simplifiedExplanation: { type: Type.STRING },
          },
        },
      },
      grammar: { type: Type.STRING },
      revelationReasons: { type: Type.STRING },
      surahOverview: { type: Type.STRING },
      mermaidDiagram: { type: Type.STRING },
    },
    required: [
      "simplifiedTafsir", "detailedTafsir", "shadeOfAyah", "artisticImagery", 
      "mutashabihat", "modernApplication", "emotionalImpact", "practicalSteps",
      "contextAndConnection", "rhetoric", "vocabularyAndRoots", "grammar", 
      "revelationReasons", "surahOverview", "mermaidDiagram"
    ],
  };

  const response = await fetch("/api/explain-ayah", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, schema }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to explain ayah");
  }

  const data = await response.json();
  const text = data.text;

  if (!text) {
    throw new Error("Empty response from AI");
  }
  const parsed = JSON.parse(text) as TafsirData;
  if (parsed.mermaidDiagram) {
    parsed.mermaidDiagram = parsed.mermaidDiagram.replace(/^```(mermaid)?\n?/, '').replace(/\n?```$/, '').trim();
  }
  return parsed;
}
