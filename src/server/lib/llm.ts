import { config } from '../../config/env.js';

export type SummarizeInput = {
  title: string;
  content: string;
  language?: 'zh' | 'en';
};

export type SummarizeResult = {
  summary: string;
  sentiment: 'positive' | 'neutral' | 'negative';
};

const FALLBACK_SUMMARY_LENGTH = 180;

const positiveKeywords = ['增长', '上涨', '创新', '成功', '利好', '胜利', '回升', '强劲', 'positive', 'gain', 'record'];
const negativeKeywords = ['下跌', '暴跌', '亏损', '失败', '利空', '风险', '危机', '损失', 'negative', 'decline', 'slump'];

function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }
  return `${text.slice(0, maxLength - 1)}…`;
}

function normaliseWhitespace(input: string): string {
  return input.replace(/\s+/g, ' ').trim();
}

function fallbackSummary(text: string): string {
  const cleaned = normaliseWhitespace(text);
  return truncate(cleaned, FALLBACK_SUMMARY_LENGTH);
}

function fallbackSentiment(text: string): 'positive' | 'neutral' | 'negative' {
  const lower = text.toLowerCase();
  let score = 0;
  for (const keyword of positiveKeywords) {
    if (lower.includes(keyword)) {
      score += 1;
    }
  }
  for (const keyword of negativeKeywords) {
    if (lower.includes(keyword)) {
      score -= 1;
    }
  }
  if (score > 0) return 'positive';
  if (score < 0) return 'negative';
  return 'neutral';
}

async function callLlm(prompt: string): Promise<SummarizeResult | null> {
  const { apiUrl, apiKey, model } = config.ai.llm;
  if (!apiUrl || !apiKey) {
    return null;
  }

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'system',
            content: 'You are a market news assistant. Respond with compact JSON: {"summary":"...","sentiment":"positive|neutral|negative"}. Use Chinese if possible.',
          },
          { role: 'user', content: prompt },
        ],
        max_tokens: 150,
        temperature: 0.2,
      }),
    });

    if (!response.ok) {
      console.warn('LLM API responded with non-200 status', response.status);
      return null;
    }

    const payload = await response.json();
    const content = payload?.choices?.[0]?.message?.content;
    if (typeof content !== 'string') {
      return null;
    }

    try {
      const parsed = JSON.parse(content);
      if (typeof parsed.summary === 'string' && typeof parsed.sentiment === 'string') {
        const sentiment = parsed.sentiment;
        if (sentiment === 'positive' || sentiment === 'neutral' || sentiment === 'negative') {
          return {
            summary: normaliseWhitespace(parsed.summary),
            sentiment,
          } satisfies SummarizeResult;
        }
      }
    } catch {
      // Fallback to simple parsing below
    }

    const summary = normaliseWhitespace(content);
    return {
      summary: truncate(summary, FALLBACK_SUMMARY_LENGTH),
      sentiment: fallbackSentiment(summary),
    } satisfies SummarizeResult;
  } catch (error) {
    console.warn('LLM API call failed', error instanceof Error ? error.message : String(error));
    return null;
  }
}

export async function summarizeContent(input: SummarizeInput): Promise<SummarizeResult> {
  const language = input.language ?? 'zh';
  const joined = normaliseWhitespace(`${input.title}\n${input.content}`);
  if (!joined) {
    return { summary: '', sentiment: 'neutral' };
  }

  const prompt = language === 'en'
    ? `Summarise and classify sentiment (positive/neutral/negative) for the following market-related text in English.\n${joined}`
    : `用一句话总结以下市场资讯，并判断情绪（positive/neutral/negative），输出 JSON。\n${joined}`;

  const result = await callLlm(prompt);
  if (result) {
    return result;
  }

  return {
    summary: fallbackSummary(joined),
    sentiment: fallbackSentiment(joined),
  } satisfies SummarizeResult;
}
