import Anthropic from '@anthropic-ai/sdk';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { config } from '../config.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const promptsDir = join(__dirname, '..', 'prompts');

const client = new Anthropic({ apiKey: config.anthropicApiKey });

function loadPrompt(filename) {
  return readFileSync(join(promptsDir, filename), 'utf-8');
}

/**
 * Generate a long-form blog post from transcript
 */
export async function generateBlogPost(transcript, metadata) {
  const systemPrompt = loadPrompt('blog-post.txt');
  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    system: systemPrompt,
    messages: [
      {
        role: 'user',
        content: `Episode: "${metadata.title}"${metadata.guestName ? ` with ${metadata.guestName}` : ''}\n\nTranscript:\n${transcript}`,
      },
    ],
  });
  return response.content[0].text;
}

/**
 * Generate a Twitter/X thread from transcript
 * Returns a JSON array of tweet strings
 */
export async function generateTwitterThread(transcript, metadata) {
  const systemPrompt = loadPrompt('twitter-thread.txt');
  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2048,
    system: systemPrompt,
    messages: [
      {
        role: 'user',
        content: `Episode: "${metadata.title}"${metadata.guestName ? ` with ${metadata.guestName}` : ''}\n\nTranscript:\n${transcript}`,
      },
    ],
  });
  // Parse the JSON array from the response
  const text = response.content[0].text;
  try {
    // Try to extract JSON array from the response
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    // Fallback: split by numbered lines
    return text
      .split(/\n\d+[\.\)]\s*/)
      .map((t) => t.trim())
      .filter((t) => t.length > 0 && t.length <= 280);
  } catch {
    return [text.slice(0, 280)];
  }
}

/**
 * Generate a LinkedIn post from transcript
 */
export async function generateLinkedInPost(transcript, metadata) {
  const systemPrompt = loadPrompt('linkedin-post.txt');
  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    system: systemPrompt,
    messages: [
      {
        role: 'user',
        content: `Episode: "${metadata.title}"${metadata.guestName ? ` with ${metadata.guestName}` : ''}\n\nTranscript:\n${transcript}`,
      },
    ],
  });
  return response.content[0].text;
}

/**
 * Generate YouTube title options and thumbnail text options from transcript
 * Returns a JSON object with titles[] and thumbnails[]
 */
export async function generateYouTubeOptions(transcript, metadata) {
  const systemPrompt = loadPrompt('youtube-options.txt');
  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2048,
    system: systemPrompt,
    messages: [
      {
        role: 'user',
        content: `Episode: "${metadata.title}"${metadata.guestName ? ` with ${metadata.guestName}` : ''}\n\nTranscript:\n${transcript}`,
      },
    ],
  });
  const text = response.content[0].text;
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return { titles: [], thumbnails: [] };
  } catch {
    return { titles: [], thumbnails: [], raw: text };
  }
}

/**
 * Generate all content in parallel
 */
export async function generateAllContent(transcript, metadata) {
  const [blogPost, twitterThread, linkedinPost, youtubeOptions] = await Promise.all([
    generateBlogPost(transcript, metadata),
    generateTwitterThread(transcript, metadata),
    generateLinkedInPost(transcript, metadata),
    generateYouTubeOptions(transcript, metadata),
  ]);

  // Derive Substack draft from blog post with newsletter formatting
  const substackDraft = `# ${metadata.title}\n\n${blogPost}\n\n---\n\n*Listen to the full episode for the complete conversation.*`;

  return {
    blogPost,
    twitterThread,
    linkedinPost,
    substackDraft,
    youtubeOptions,
  };
}
