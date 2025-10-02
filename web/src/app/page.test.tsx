import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from 'react-query'

// Mock the useDepartments hook to avoid API calls
jest.mock('../hooks/useDepartments', () => ({
  useDepartments: () => ({
    data: [{ id: '1', name: '지능IoT학과' }],
    isLoading: false,
    error: null,
  }),
}))

import Home from './page'

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

const renderWithQueryClient = (component: React.ReactElement) => {
  const testQueryClient = createTestQueryClient()
  return render(
    <QueryClientProvider client={testQueryClient}>
      {component}
    </QueryClientProvider>
  )
}

describe('Home', () => {
  it('renders welcome heading', () => {
    renderWithQueryClient(<Home />)

    const heading = screen.getByRole('heading', {
      name: /지능IoT학과에 오신 것을 환영합니다/i,
    })
    expect(heading).toBeInTheDocument()
  })

  it('renders department info section', () => {
    renderWithQueryClient(<Home />)

    const sectionHeading = screen.getByRole('heading', { name: /학과 정보/i })
    expect(sectionHeading).toBeInTheDocument()
  })
})
