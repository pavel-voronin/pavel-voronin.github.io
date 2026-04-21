import { buildDerivedContent, emptyDerivedContent, type DerivedContent } from '~/utils/derivedContent'

export const useDerivedContent = async () => {
  const state = useState<DerivedContent>('derived-content', () => emptyDerivedContent)

  if (state.value.blogPosts.length > 0 || state.value.topicRegistry.length > 0) {
    return state.value
  }

  const items = await queryCollection('content').all()
  state.value = buildDerivedContent(items)

  return state.value
}
