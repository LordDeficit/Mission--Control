#!/usr/bin/env node
/**
 * Morning Brief - Daily automated report
 * Sends weather, AI news, tasks, and recommendations
 */

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const BRAVE_API_KEY = process.env.BRAVE_API_KEY;

async function sendTelegramMessage(text) {
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: TELEGRAM_CHAT_ID,
      text: text,
      parse_mode: 'Markdown',
    }),
  });
  return response.json();
}

async function getWeather() {
  // Using Open-Meteo (free, no API key needed)
  // Default to NYC coordinates, can be customized
  const lat = 40.7128;
  const lon = -74.0060;
  
  try {
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&daily=temperature_2m_max,temperature_2m_min&timezone=America/New_York`
    );
    const data = await response.json();
    const current = data.current;
    const daily = data.daily;
    
    const weatherCodes = {
      0: 'Clear sky', 1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast',
      45: 'Foggy', 48: 'Depositing rime fog',
      51: 'Light drizzle', 53: 'Moderate drizzle', 55: 'Dense drizzle',
      61: 'Slight rain', 63: 'Moderate rain', 65: 'Heavy rain',
      71: 'Slight snow', 73: 'Moderate snow', 75: 'Heavy snow',
      95: 'Thunderstorm',
    };
    
    const condition = weatherCodes[current.weather_code] || 'Unknown';
    const temp = Math.round(current.temperature_2m);
    const high = Math.round(daily.temperature_2m_max[0]);
    const low = Math.round(daily.temperature_2m_min[0]);
    
    return `🌤️ *Weather*\n${condition}, ${temp}°F (H: ${high}° L: ${low}°)`;
  } catch (e) {
    return '🌤️ *Weather*\nUnable to fetch weather data';
  }
}

async function getAINews() {
  const topics = [
    'AI artificial intelligence',
    'vibe coding Claude Code',
    'LLM large language model',
    'book publishing writing',
    'social media growth Twitter',
  ];
  
  try {
    const allNews = [];
    
    for (const topic of topics.slice(0, 2)) { // Limit to avoid rate limits
      const response = await fetch(
        `https://api.search.brave.com/res/v1/news/search?q=${encodeURIComponent(topic)}&count=3`,
        {
          headers: {
            'X-Subscription-Token': BRAVE_API_KEY,
            'Accept': 'application/json',
          },
        }
      );
      const data = await response.json();
      if (data.results) {
        allNews.push(...data.results.slice(0, 2));
      }
    }
    
    if (allNews.length === 0) {
      return '📰 *News*\nNo news found';
    }
    
    // Remove duplicates and take top 5
    const unique = allNews.filter((n, i, arr) => 
      arr.findIndex(t => t.title === n.title) === i
    ).slice(0, 5);
    
    const headlines = unique
      .map(n => `• ${n.title}`)
      .join('\n');
    
    return `📰 *News*\n${headlines}`;
  } catch (e) {
    return '📰 *News*\nUnable to fetch news';
  }
}

async function getTasks() {
  // For now, placeholder - will integrate with Mission Control tasks
  return `✅ *Tasks*\n• Draft Substack newsletter\n• Review Canon app updates\n• Twitter thread on systems`;
}

async function getRecommendations() {
  const recommendations = [
    "Review yesterday's progress in Mission Control",
    "Check trending topics for content ideas",
    "Draft next newsletter section",
    "Review Hell's Codex chapter feedback",
  ];
  
  const today = new Date().getDay();
  const rec = recommendations[today % recommendations.length];
  
  return `💡 *Today's Focus*\n${rec}`;
}

async function generateBrief() {
  const date = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'long', 
    day: 'numeric' 
  });
  
  const [weather, news, tasks, recommendations] = await Promise.all([
    getWeather(),
    getAINews(),
    getTasks(),
    getRecommendations(),
  ]);
  
  const brief = `🌅 *Good morning, Profit.*

*${date}*

${weather}

${news}

${tasks}

${recommendations}

— Deficit`;

  return brief;
}

async function main() {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.error('Missing environment variables');
    process.exit(1);
  }
  
  try {
    const brief = await generateBrief();
    await sendTelegramMessage(brief);
    console.log('Morning brief sent successfully');
  } catch (error) {
    console.error('Error sending brief:', error);
    process.exit(1);
  }
}

main();
