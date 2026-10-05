'use client'

import { use, useMemo, useState } from 'react'
import { RotateCcw, SlidersHorizontal } from 'lucide-react'
import { ExperienceCard } from '@/components/marketplace/ExperienceCard'
import { SearchBar } from '@/components/marketplace/AppShell'
import { categories, experiences } from '@/lib/marketplace/catalog'

type SearchParams = { q?: string; category?: string }

const priceFilters = [
  { value: 'under-50', label: 'Under $50' },
  { value: '50-100', label: '$50–$100' },
  { value: '100-plus', label: '$100+' },
]

const ratingFilters = [
  { value: '4.5', label: '4.5 and up' },
  { value: '4.0', label: '4.0 and up' },
]

const bookingFilters = [
  { value: 'free-cancellation', label: 'Free cancellation' },
  { value: 'pay-later', label: 'Reserve now, pay later' },
  { value: 'pickup', label: 'Hotel pickup' },
]

export default function SearchPage({
  searchParams: paramsPromise,
}: {
  searchParams: Promise<SearchParams>
}) {
  const searchParams = use(paramsPromise)
  const query = searchParams.q || searchParams.category || 'Everywhere'
  const categoryOptions = categories.slice(0, 6)
  const initialCategory =
    searchParams.category && categoryOptions.includes(searchParams.category)
      ? [searchParams.category]
      : []
  const [selectedCategories, setSelectedCategories] =
    useState<string[]>(initialCategory)
  const [selectedPrices, setSelectedPrices] = useState<string[]>([])
  const [selectedRatings, setSelectedRatings] = useState<string[]>([])
  const [selectedBookings, setSelectedBookings] = useState<string[]>([])
  const [filtersOpen, setFiltersOpen] = useState(false)

  const toggleValue = (
    value: string,
    selected: string[],
    setSelected: (values: string[]) => void,
  ) => {
    setSelected(
      selected.includes(value)
        ? selected.filter((item) => item !== value)
        : [...selected, value],
    )
  }

  const results = useMemo(() => {
    return experiences
      .filter(
        (experience) =>
          !searchParams.q ||
          `${experience.title} ${experience.destination} ${experience.category}`
            .toLowerCase()
            .includes(searchParams.q.toLowerCase()),
      )
      .filter(
        (experience) =>
          !selectedCategories.length ||
          selectedCategories.includes(experience.category),
      )
      .filter(
        (experience) =>
          !selectedPrices.length ||
          selectedPrices.some((price) =>
            price === 'under-50'
              ? experience.price < 50
              : price === '50-100'
                ? experience.price >= 50 && experience.price <= 100
                : experience.price > 100,
          ),
      )
      .filter(
        (experience) =>
          !selectedRatings.length ||
          selectedRatings.some((rating) => experience.rating >= Number(rating)),
      )
      .filter(
        (experience) =>
          !selectedBookings.length ||
          selectedBookings.some((booking) =>
            booking === 'free-cancellation'
              ? experience.freeCancellation
              : booking === 'pay-later'
                ? experience.payLater
                : experience.pickup,
          ),
      )
  }, [
    searchParams.q,
    selectedBookings,
    selectedCategories,
    selectedPrices,
    selectedRatings,
  ])

  const clearFilters = () => {
    setSelectedCategories([])
    setSelectedPrices([])
    setSelectedRatings([])
    setSelectedBookings([])
  }

  return (
    <div className="search-page">
      <div className="search-header">
        <div className="search-header-inner">
          <div className="breadcrumb">Discover / Experiences</div>
          <h1>Find something in {query}</h1>
          <SearchBar compact />
        </div>
      </div>
      <div className="search-results-layout">
        <aside
          className={`filter-panel ${filtersOpen ? 'filter-panel-open' : ''}`}
        >
          <div className="filter-panel-head">
            <h3>Refine results</h3>
            <button
              type="button"
              className="clear-filters-button"
              onClick={clearFilters}
            >
              <RotateCcw size={12} /> Clear
            </button>
          </div>
          <div className="filter-group">
            <h4>Categories</h4>
            {categoryOptions.map((category) => (
              <label className="filter-option" key={category}>
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(category)}
                  onChange={() =>
                    toggleValue(
                      category,
                      selectedCategories,
                      setSelectedCategories,
                    )
                  }
                />
                {category}
              </label>
            ))}
          </div>
          <div className="filter-group">
            <h4>Price per adult</h4>
            {priceFilters.map((filter) => (
              <label className="filter-option" key={filter.value}>
                <input
                  type="checkbox"
                  checked={selectedPrices.includes(filter.value)}
                  onChange={() =>
                    toggleValue(filter.value, selectedPrices, setSelectedPrices)
                  }
                />
                {filter.label}
              </label>
            ))}
          </div>
          <div className="filter-group">
            <h4>Traveler rating</h4>
            {ratingFilters.map((filter) => (
              <label className="filter-option" key={filter.value}>
                <input
                  type="checkbox"
                  checked={selectedRatings.includes(filter.value)}
                  onChange={() =>
                    toggleValue(
                      filter.value,
                      selectedRatings,
                      setSelectedRatings,
                    )
                  }
                />
                {filter.label}
              </label>
            ))}
          </div>
          <div className="filter-group">
            <h4>Booking options</h4>
            {bookingFilters.map((filter) => (
              <label className="filter-option" key={filter.value}>
                <input
                  type="checkbox"
                  checked={selectedBookings.includes(filter.value)}
                  onChange={() =>
                    toggleValue(
                      filter.value,
                      selectedBookings,
                      setSelectedBookings,
                    )
                  }
                />
                {filter.label}
              </label>
            ))}
          </div>
        </aside>
        <section>
          <div className="results-toolbar">
            <strong>
              {results.length}{' '}
              {results.length === 1 ? 'experience' : 'experiences'}
            </strong>
            <div className="results-toolbar-actions">
              <select className="sort-select" defaultValue="recommended">
                <option value="recommended">Recommended</option>
                <option>Top rated</option>
                <option>Price: low to high</option>
                <option>Newest</option>
              </select>
              <button
                type="button"
                className="button button-secondary mobile-filter"
                onClick={() => setFiltersOpen(!filtersOpen)}
              >
                <SlidersHorizontal size={15} /> Filters
              </button>
            </div>
          </div>
          {results.length ? (
            <div className="results-grid">
              {results.map((experience) => (
                <ExperienceCard key={experience.id} experience={experience} />
              ))}
            </div>
          ) : (
            <div className="empty-results">
              <h3>No experiences match those filters.</h3>
              <p>Try clearing a filter or choosing a broader option.</p>
              <button
                type="button"
                className="clear-filters-button"
                onClick={clearFilters}
              >
                <RotateCcw size={12} /> Clear filters
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
