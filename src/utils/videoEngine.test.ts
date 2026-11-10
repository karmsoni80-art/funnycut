import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateViralScore,
  clampClipTime,
  detectAndResolveOverlaps,
  generateWordTimestamps,
  calculateFramingTransform,
  formatTimecode,
  parseTimecode,
} from './videoEngine';
import { DetectedMoment } from '../types';

test('calculateViralScore computes weighted score within [0, 100]', () => {
  // Test perfect scores
  const perfect = calculateViralScore(100, 100, 100, 100, 100);
  assert.equal(perfect, 100);

  // Test zero scores
  const zero = calculateViralScore(0, 0, 0, 0, 0);
  assert.equal(zero, 0);

  // Test weighted formula: 90*0.30 + 80*0.25 + 70*0.15 + 85*0.15 + 60*0.15
  // = 27 + 20 + 10.5 + 12.75 + 9 = 79.25 => rounded to 79
  const custom = calculateViralScore(90, 80, 70, 85, 60);
  assert.equal(custom, 79);

  // Test clamping outliers
  const clamped = calculateViralScore(150, -20, 100, 50, 50);
  assert.ok(clamped >= 0 && clamped <= 100);
});

test('clampClipTime enforces duration limits and boundary constraints', () => {
  const result = clampClipTime(10, 35, 120, 5, 60);
  assert.equal(result.start, 10);
  assert.equal(result.end, 35);
  assert.equal(result.duration, 25);

  // Exceeds max length (60)
  const tooLong = clampClipTime(10, 100, 120, 5, 45);
  assert.equal(tooLong.start, 10);
  assert.equal(tooLong.end, 55);
  assert.equal(tooLong.duration, 45);

  // Under min length (5)
  const tooShort = clampClipTime(10, 12, 120, 5, 30);
  assert.equal(tooShort.start, 10);
  assert.equal(tooShort.end, 15);
  assert.equal(tooShort.duration, 5);

  // Near end of video
  const nearEnd = clampClipTime(115, 125, 120, 5, 30);
  assert.ok(nearEnd.end <= 120);
});

test('detectAndResolveOverlaps keeps highest scoring non-redundant moments', () => {
  const moments: DetectedMoment[] = [
    {
      id: 'm1',
      title: 'Moment 1',
      startTime: 10,
      endTime: 30,
      duration: 20,
      transcript: 'Joke A',
      category: 'Funny Dialogue',
      aiScore: 95,
      reason: 'Great punchline',
      activeSpeaker: 'Host',
      laughterDetected: true,
      selected: true,
      thumbnail: '',
      keywords: ['joke'],
    },
    {
      id: 'm2',
      title: 'Moment 2 (Overlapping)',
      startTime: 12,
      endTime: 28,
      duration: 16,
      transcript: 'Joke A duplicate',
      category: 'Funny Dialogue',
      aiScore: 70, // lower score, should be dropped
      reason: 'Duplicate',
      activeSpeaker: 'Host',
      laughterDetected: true,
      selected: true,
      thumbnail: '',
      keywords: ['joke'],
    },
    {
      id: 'm3',
      title: 'Moment 3 (Distinct)',
      startTime: 60,
      endTime: 85,
      duration: 25,
      transcript: 'Separate reaction',
      category: 'Unexpected Reaction',
      aiScore: 88,
      reason: 'Hilarious spill',
      activeSpeaker: 'Guest',
      laughterDetected: true,
      selected: true,
      thumbnail: '',
      keywords: ['reaction'],
    },
  ];

  const resolved = detectAndResolveOverlaps(moments, 2);
  assert.equal(resolved.length, 2);
  assert.equal(resolved[0].id, 'm1');
  assert.equal(resolved[1].id, 'm3');
});

test('generateWordTimestamps creates word timings with highlighted punchlines', () => {
  const text = 'Why did the chicken cross the road? To tell a funny joke!';
  const chunks = generateWordTimestamps(text, 10, 20, ['funny', 'joke']);

  assert.ok(chunks.length > 0);
  assert.equal(chunks[0].startTime, 10);

  const allWords = chunks.flatMap((c) => c.words);
  const jokeWord = allWords.find((w) => w.word.toLowerCase().includes('joke'));
  assert.ok(jokeWord);
  assert.equal(jokeWord?.highlighted, true);
});

test('calculateFramingTransform computes correct 9:16 vertical crop from 16:9', () => {
  const transform = calculateFramingTransform(1920, 1080, '9:16', 50, 50);

  // 1080 * 9/16 = 607.5 => 608px crop width
  assert.equal(transform.cropHeight, 1080);
  assert.equal(transform.cropWidth, 608);
  // Centered offset: (1920 - 608) / 2 = 656
  assert.equal(transform.offsetX, 656);
  assert.equal(transform.offsetY, 0);
});

test('formatTimecode and parseTimecode roundtrip accurately', () => {
  assert.equal(formatTimecode(75), '01:15');
  assert.equal(formatTimecode(3665), '01:01:05');
  assert.equal(parseTimecode('01:15'), 75);
  assert.equal(parseTimecode('01:01:05'), 3665);
});
