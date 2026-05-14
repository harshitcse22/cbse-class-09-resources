// scripts/build-data.js
// Run: node scripts/build-data.js
//
// Input : data/prompts.json  (API response with { items: [...] })
// Output: public/data.json   (structured for the React app)
//
// JSON shape expected per item:
// {
//   promptText: string,
//   referenceObject: {
//     _id, title, slug, bookName, subjectName, examSeoTitle, topics, svgIcon
//   }
// }

import { readFileSync, writeFileSync, existsSync } from 'fs'
import { resolve } from 'path'

const IN  = resolve('data/prompts.json')
const OUT = resolve('public/data.json')

if (!existsSync(IN)) {
  console.error(`✗ Input file not found: ${IN}`)
  console.error('  Place your API JSON at data/prompts.json and re-run.')
  process.exit(1)
}

// ── helpers ───────────────────────────────────────────────────────────────────

function toSlug(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

// Group prompt items by subject → book → chapter
// Each chapter collects all its prompt items (one per promptTemplateIndex)
function groupItems(items) {
  // data[subjectSlug][bookSlug][chapterSlug] = { meta, prompts[] }
  const data = {}

  for (const item of items) {
    const ref = item.referenceObject
    if (!ref) continue

    const subjectSlug = toSlug(ref.subjectName  || 'unknown')
    const bookSlug    = toSlug(ref.bookName      || 'unknown')
    const chapterSlug = ref.slug || toSlug(ref.title || 'unknown')

    // init nesting
    if (!data[subjectSlug])                       data[subjectSlug] = {}
    if (!data[subjectSlug][bookSlug])             data[subjectSlug][bookSlug] = {}
    if (!data[subjectSlug][bookSlug][chapterSlug]) {
      data[subjectSlug][bookSlug][chapterSlug] = {
        meta: {
          id:            ref._id          || null,
          title:         ref.title        || null,
          slug:          chapterSlug,
          bookName:      ref.bookName     || null,
          subjectName:   ref.subjectName  || null,
          examSeoTitle:  ref.examSeoTitle || null,
          svgIcon:       ref.svgIcon      || null,
          bookSvgIcon:   item.bookSvgIcon    || null,
          subjectSvgIcon:item.subjectSvgIcon || null,
          startsOnPage:  item.startsOnPage   ?? null,
          endsOnPage:    item.endsOnPage     ?? null,
          topics:        ref.topics       || [],
          edzyColor:     item.edzyColor   || null,
        },
        prompts: [],
      }
    }

    // push this prompt into the chapter's prompts array
    if (item.promptText) {
      data[subjectSlug][bookSlug][chapterSlug].prompts.push({
        index:      item.promptTemplateIndex ?? null,
        heading:    categoryHeading(item.promptTemplateText, item.promptTemplateIndex),
        prompt:     item.promptText,
        template:   item.promptTemplateText || null,
        edzyColor:  item.edzyColor          || null,
      })
    }
  }

  // sort prompts within each chapter by index
  for (const subject of Object.values(data))
    for (const book of Object.values(subject))
      for (const chapter of Object.values(book))
        chapter.prompts.sort((a, b) => (a.index ?? 0) - (b.index ?? 0))

  return data
}

// ── Category matching by template text ───────────────────────────────────────
// Add your 5 prompt template strings here (or key phrases from them).
// The script checks if promptTemplateText contains any of these signatures
// and assigns the matching category name.
//
// You can paste the full template or just a unique phrase from each one.
const TEMPLATE_SIGNATURES = [
  {
    category: 'Quick Understanding',
    match: 'simple and quick way',
  },
  {
    category: 'Quick Review',
    match: 'quick revision guide',
  },
  {
    category: 'Find My Mistake',
    match: 'identify and correct their mistake',
  },
  {
    category: 'Exam Prep',
    match: 'exam preparation guide',
  },
  {
    category: 'Practice Questions',
    match: 'generate practice questions',
  },
]

function categoryHeading(promptTemplateText, promptTemplateIndex) {
  if (promptTemplateText) {
    const text = promptTemplateText.toLowerCase()
    for (const { category, match } of TEMPLATE_SIGNATURES) {
      // support both plain string and regex pattern
      const hit = match.includes('.*')
        ? new RegExp(match, 'i').test(text)
        : text.includes(match.toLowerCase())
      if (hit) return category
    }
  }
  // fallback: use index-based name if no template matched
  const byIndex = ['Quick Understanding', 'Practice Questions', 'Quick Review', 'Find My Mistake', 'Exam Prep']
  return byIndex[promptTemplateIndex] ?? `Prompt ${(promptTemplateIndex ?? 0) + 1}`
}

// ── run ───────────────────────────────────────────────────────────────────────

const raw   = readFileSync(IN, 'utf8')
const input = JSON.parse(raw)
const items = input.items || input  // support both { items: [] } and bare []

const data = groupItems(items)

writeFileSync(OUT, JSON.stringify(data, null, 2))

// stats
const subjects = Object.keys(data).length
const books    = Object.values(data).flatMap(s => Object.keys(s)).length
const chapters = Object.values(data).flatMap(s => Object.values(s)).flatMap(b => Object.keys(b)).length
const prompts  = Object.values(data).flatMap(s => Object.values(s)).flatMap(b => Object.values(b)).reduce((n, c) => n + c.prompts.length, 0)

console.log(`✓ data.json written → ${OUT}`)
console.log(`  subjects : ${subjects}`)
console.log(`  books    : ${books}`)
console.log(`  chapters : ${chapters}`)
console.log(`  prompts  : ${prompts}`)
