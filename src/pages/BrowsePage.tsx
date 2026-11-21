import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, RotateCcw } from 'lucide-react';
import { Content, Category } from '../api/types';
import { searchContent, getCategories, MOCK_ALL_CONTENT, MOCK_CATEGORIES } from '../api/client';
import { MovieCard } from '../components/common/MovieCard';

export const BrowsePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [contentList, setContentList] = useState<Content[]>(MOCK_ALL_CONTENT);
  const [categories, setCategories] = useState<Category[]>(MOCK_CATEGORIES);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 12;

  const query = searchParams.get('q') || '';
  const typeFilter = searchParams.get('type') || '';
  const categoryFilter = searchParams.get('category') || '';
  const sortOption = searchParams.get('sort') || 'rating';

  useEffect(() => {
    async function loadCategories() {
      try {
        const cats = await getCategories();
        setCategories(cats);
      } catch {
        // Fallback handled
      }
    }
    loadCategories();
  }, []);

  useEffect(() => {
    async function fetchResults() {
      setIsLoading(true);
      try {
        const res = await searchContent({
          q: query || undefined,
          type: typeFilter || undefined,
          category: categoryFilter || undefined,
          sort: sortOption,
          limit: PAGE_SIZE,
          offset: page * PAGE_SIZE
        });
        setContentList(res.content);
      } catch {
        // Fallback handled
      } finally {
        setIsLoading(false);
      }
    }
    fetchResults();
  }, [query, typeFilter, categoryFilter, sortOption, page]);

  const updateParam = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value) {
      next.set(key, value);
    } else {
      next.delete(key);
    }
    setPage(0);
    setSearchParams(next);
  };

  const handleResetFilters = () => {
    setSearchParams(new URLSearchParams());
    setPage(0);
  };

  return (
    <div className="browse-page-container">
      {/* Header & Filter Controls Bar */}
      <div className="browse-header-panel">
        <div>
          <h1 className="browse-main-title">Catalog Explorer</h1>
          <p className="browse-main-sub">
            Filter by media type, categories, tags, or sort by highest rating & release year
          </p>
        </div>

        {/* Live Filter Controls */}
        <div className="browse-filters-grid">
          {/* Search box */}
          <div className="filter-item-search">
            <Search size={16} className="filter-search-icon" />
            <input
              type="text"
              placeholder="Search title, cast, synopsis..."
              value={query}
              onChange={e => updateParam('q', e.target.value)}
              className="filter-search-input"
            />
          </div>

          {/* Media Type */}
          <div className="filter-select-wrap">
            <select
              value={typeFilter}
              onChange={e => updateParam('type', e.target.value)}
              className="filter-select"
            >
              <option value="">All Media Types</option>
              <option value="movie">Movies</option>
              <option value="series">TV Series</option>
              <option value="anime">Anime</option>
              <option value="drama">Drama</option>
            </select>
          </div>

          {/* Category */}
          <div className="filter-select-wrap">
            <select
              value={categoryFilter}
              onChange={e => updateParam('category', e.target.value)}
              className="filter-select"
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div className="filter-select-wrap">
            <select
              value={sortOption}
              onChange={e => updateParam('sort', e.target.value)}
              className="filter-select"
            >
              <option value="rating">Top Rated (Descending)</option>
              <option value="year">Newest Release (Year)</option>
              <option value="year_asc">Oldest Classic (Year)</option>
              <option value="title">Alphabetical (A-Z)</option>
            </select>
          </div>

          {/* Reset button */}
          {(query || typeFilter || categoryFilter || sortOption !== 'rating') && (
            <button onClick={handleResetFilters} className="btn-filter-reset">
              <RotateCcw size={14} /> Clear
            </button>
          )}
        </div>
      </div>

      {/* Results View */}
      {isLoading ? (
        <div className="catalog-loading-grid">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
            <div key={n} className="skeleton-card" />
          ))}
        </div>
      ) : contentList.length > 0 ? (
        <>
          <div className="cards-grid">
            {contentList.map(item => (
              <MovieCard key={item.id} content={item} />
            ))}
          </div>

          {/* Pagination */}
          <div className="browse-pagination-bar">
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              className="btn-pagination"
            >
              ← Previous Page
            </button>
            <span className="pagination-indicator">Page {page + 1}</span>
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={contentList.length < PAGE_SIZE}
              className="btn-pagination"
            >
              Next Page →
            </button>
          </div>
        </>
      ) : (
        <div className="no-results-panel">
          <SlidersHorizontal size={40} color="var(--text-muted)" />
          <h3>No matching catalog titles found</h3>
          <p>Try modifying your keyword search or resetting category filters.</p>
          <button onClick={handleResetFilters} className="btn-secondary" style={{ marginTop: '1rem' }}>
            Reset All Filters
          </button>
        </div>
      )}
    </div>
  );
};
