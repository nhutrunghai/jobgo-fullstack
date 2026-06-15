import {
  SEARCH_LEXICAL_MIN_THRESHOLD,
  SEARCH_SCORE_THRESHOLD,
  SEARCH_SEMANTIC_RESCUE_LIMIT,
  SEARCH_SEMANTIC_RESCUE_THRESHOLD,
  SearchCandidate,
  SearchHit
} from './job-search.type'

class HybridJobSearchService {
  mergeSearchCandidates(lexicalHits: SearchHit[], semanticHits: SearchHit[]): SearchCandidate[] {
    const candidatesMap = new Map<string, SearchCandidate>()

    for (const hit of lexicalHits) {
      candidatesMap.set(hit.job_id, {
        job_id: hit.job_id,
        lexical_score: hit.score,
        semantic_score: 0,
        final_score: 0
      })
    }

    for (const hit of semanticHits) {
      const existing = candidatesMap.get(hit.job_id)

      if (existing) {
        existing.semantic_score = hit.score
        continue
      }

      candidatesMap.set(hit.job_id, {
        job_id: hit.job_id,
        lexical_score: 0,
        semantic_score: hit.score,
        final_score: 0
      })
    }

    const candidates = Array.from(candidatesMap.values())
    const lexicalMax = Math.max(0, ...candidates.map((item) => item.lexical_score))
    const semanticMax = Math.max(0, ...candidates.map((item) => item.semantic_score))

    for (const item of candidates) {
      item.lexical_score = lexicalMax > 0 ? item.lexical_score / lexicalMax : 0
      item.semantic_score = semanticMax > 0 ? item.semantic_score / semanticMax : 0
      item.final_score = semanticMax > 0 ? 0.2 * item.lexical_score + 0.8 * item.semantic_score : item.lexical_score
    }

    return candidates
  }

  applySearchThresholdAndSort(candidates: SearchCandidate[]) {
    const sorted = candidates
      .filter((item) => item.final_score >= SEARCH_SCORE_THRESHOLD)
      .sort((a, b) => b.final_score - a.final_score)

    const hybridQualified = sorted.filter((item) => item.lexical_score >= SEARCH_LEXICAL_MIN_THRESHOLD)

    const semanticRescue = sorted
      .filter(
        (item) =>
          item.lexical_score < SEARCH_LEXICAL_MIN_THRESHOLD &&
          item.semantic_score >= SEARCH_SEMANTIC_RESCUE_THRESHOLD
      )
      .slice(0, SEARCH_SEMANTIC_RESCUE_LIMIT)

    const merged = [...hybridQualified]
    for (const item of semanticRescue) {
      if (!merged.some((existing) => existing.job_id === item.job_id)) {
        merged.push(item)
      }
    }

    merged.sort((a, b) => b.final_score - a.final_score)

    return {
      items: merged,
      semanticRescueCount: semanticRescue.length
    }
  }
}

const hybridJobSearchService = new HybridJobSearchService()
export default hybridJobSearchService