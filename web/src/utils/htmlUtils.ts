/**
 * HTML 정리 유틸리티 함수들
 */

/**
 * 불필요한 인라인 스타일과 속성을 제거하여 HTML을 정리합니다.
 */
export function cleanHtml(html: string): string {
  // DOM 파서를 사용하여 HTML 파싱
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')
  
  // 모든 요소에서 불필요한 속성 제거
  const elements = doc.querySelectorAll('*')
  elements.forEach(element => {
    // Tailwind CSS 변수들 제거
    const style = element.getAttribute('style')
    if (style) {
      // --tw- 로 시작하는 CSS 변수들 제거
      const cleanedStyle = style
        .split(';')
        .filter(rule => !rule.trim().startsWith('--tw-'))
        .filter(rule => rule.trim() !== '')
        .join(';')
      
      if (cleanedStyle) {
        element.setAttribute('style', cleanedStyle)
      } else {
        element.removeAttribute('style')
      }
    }
    
    // 기타 불필요한 속성들 제거
    const attributesToRemove = ['data-slate-node', 'data-slate-leaf', 'class']
    attributesToRemove.forEach(attr => {
      if (element.hasAttribute(attr)) {
        element.removeAttribute(attr)
      }
    })
  })
  
  // body 내용만 반환
  return doc.body.innerHTML
}

/**
 * HTML 크기를 바이트 단위로 계산합니다.
 */
export function getHtmlSize(html: string): number {
  return new Blob([html]).size
}

/**
 * HTML이 너무 큰지 확인합니다.
 */
export function isHtmlTooLarge(html: string, maxSizeKB: number = 64): boolean {
  const sizeKB = getHtmlSize(html) / 1024
  return sizeKB > maxSizeKB
}
