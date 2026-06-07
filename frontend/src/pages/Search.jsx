import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { Search as SearchIcon, SlidersHorizontal, RotateCcw, X } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Local filter states synchronizing with URL search parameters
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || 'All');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest');

  // Autocomplete state
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const autocompleteRef = useRef(null);

  // Close autocomplete on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (autocompleteRef.current && !autocompleteRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Sync state with URL parameter changes
  useEffect(() => {
    setSearchInput(searchParams.get('search') || '');
    setCategory(searchParams.get('category') || 'All');
    setMinPrice(searchParams.get('minPrice') || '');
    setMaxPrice(searchParams.get('maxPrice') || '');
    setSort(searchParams.get('sort') || 'newest');
  }, [searchParams]);

  // Fetch products when filters change
  useEffect(() => {
    const fetchFilteredProducts = async () => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams();
        if (category && category !== 'All') queryParams.append('category', category);
        if (minPrice) queryParams.append('minPrice', minPrice);
        if (maxPrice) queryParams.append('maxPrice', maxPrice);
        if (searchParams.get('search')) queryParams.append('search', searchParams.get('search'));
        if (sort) queryParams.append('sort', sort);

        const response = await fetch(`${API_URL}/products?${queryParams.toString()}`);
        if (response.ok) {
          const data = await response.json();
          setProducts(data);
        }
      } catch (err) {
        console.error('Error fetching filtered products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFilteredProducts();
  }, [category, minPrice, maxPrice, searchParams, sort]);

  // Handle autocomplete keystrokes
  useEffect(() => {
    const fetchAutocomplete = async () => {
      if (searchInput.trim().length < 2) {
        setSuggestions([]);
        return;
      }
      try {
        const response = await fetch(`${API_URL}/products/autocomplete?q=${encodeURIComponent(searchInput)}`);
        if (response.ok) {
          const data = await response.json();
          setSuggestions(data);
        }
      } catch (err) {
        console.error('Autocomplete fetch error:', err);
      }
    };

    const delayDebounce = setTimeout(() => {
      fetchAutocomplete();
    }, 200); // 200ms debounce

    return () => clearTimeout(delayDebounce);
  }, [searchInput]);

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    setShowSuggestions(false);
    
    const newParams = new URLSearchParams(searchParams);
    if (searchInput) {
      newParams.set('search', searchInput);
    } else {
      newParams.delete('search');
    }
    setSearchParams(newParams);
  };

  const handleSuggestionClick = (name) => {
    setSearchInput(name);
    setShowSuggestions(false);
    
    const newParams = new URLSearchParams(searchParams);
    newParams.set('search', name);
    setSearchParams(newParams);
  };

  const handleFilterChange = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams);
  };

  const handleClearFilters = () => {
    setSearchInput('');
    setCategory('All');
    setMinPrice('');
    setMaxPrice('');
    setSort('newest');
    setSearchParams(new URLSearchParams());
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }} className="animate-fade-in">
      {/* Top Search Autocomplete Header */}
      <section className="glass-panel" style={{ padding: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <form onSubmit={handleSearchSubmit} style={{ flex: 1 }} className="autocomplete-wrapper" ref={autocompleteRef}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <SearchIcon size={18} style={{ position: 'absolute', left: '1rem', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search products by name... (e.g. Laptop)"
              className="form-control"
              style={{ paddingLeft: '2.75rem', paddingRight: '2.5rem' }}
              value={searchInput}
              onChange={(e) => {
                setSearchInput(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
            />
            {searchInput && (
              <X 
                size={16} 
                style={{ position: 'absolute', right: '1rem', cursor: 'pointer', color: 'var(--text-muted)' }} 
                onClick={() => {
                  setSearchInput('');
                  handleFilterChange('search', '');
                }}
              />
            )}
          </div>

          {/* Autocomplete Dropdown list */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="autocomplete-dropdown">
              {suggestions.map((suggestion) => (
                <div
                  key={suggestion._id}
                  className="autocomplete-item"
                  onClick={() => handleSuggestionClick(suggestion.name)}
                >
                  <span style={{ fontWeight: 500 }}>{suggestion.name}</span>
                  <span className="category-tag">{suggestion.category}</span>
                </div>
              ))}
            </div>
          )}
        </form>
        <button className="btn btn-primary" onClick={() => handleSearchSubmit()}>
          Search
        </button>
      </section>

      {/* Main Grid + Sidebar Container */}
      <div 
        style={{ 
          display: 'grid', 
          gridTemplateColumns: '300px 1fr', 
          gap: '2rem', 
          alignItems: 'start' 
        }}
      >
        {/* Sidebar Filters */}
        <aside className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.75rem' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.15rem' }}>
              <SlidersHorizontal size={16} />
              Filter Controls
            </h3>
            <button 
              onClick={handleClearFilters}
              style={{ background: 'none', border: 'none', color: 'var(--color-danger)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.2rem', cursor: 'pointer' }}
            >
              <RotateCcw size={12} />
              Reset
            </button>
          </div>

          {/* Category Filter */}
          <div>
            <label className="form-label">Category</label>
            <select 
              className="form-control" 
              value={category} 
              onChange={(e) => handleFilterChange('category', e.target.value)}
              style={{ cursor: 'pointer' }}
            >
              <option value="All">All Categories</option>
              <option value="Electronics">Electronics</option>
              <option value="Audio">Audio</option>
              <option value="Accessories">Accessories</option>
              <option value="Wearables">Wearables</option>
              <option value="Furniture">Furniture</option>
            </select>
          </div>

          {/* Pricing Range Filters */}
          <div>
            <label className="form-label">Price Range ($)</label>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <input
                type="number"
                placeholder="Min"
                className="form-control"
                value={minPrice}
                onChange={(e) => handleFilterChange('minPrice', e.target.value)}
              />
              <span style={{ color: 'var(--text-muted)' }}>-</span>
              <input
                type="number"
                placeholder="Max"
                className="form-control"
                value={maxPrice}
                onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
              />
            </div>
          </div>

          {/* Sorting Filters */}
          <div>
            <label className="form-label">Sort By</label>
            <select 
              className="form-control" 
              value={sort} 
              onChange={(e) => handleFilterChange('sort', e.target.value)}
              style={{ cursor: 'pointer' }}
            >
              <option value="newest">Newest Arrivals</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating-desc">Customer Rating</option>
            </select>
          </div>
        </aside>

        {/* Products Grid */}
        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
              Showing {products.length} products
            </span>
          </div>

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '40vh', color: 'var(--text-muted)' }}>
              Syncing search results...
            </div>
          ) : products.length === 0 ? (
            <div 
              className="glass-panel" 
              style={{ 
                padding: '4rem 2rem', 
                textAlign: 'center', 
                color: 'var(--text-muted)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '1rem'
              }}
            >
              <SlidersHorizontal size={40} style={{ strokeWidth: 1.5, opacity: 0.5 }} />
              <h3 style={{ color: 'var(--text-main)' }}>No Matches Found</h3>
              <p style={{ maxWidth: '400px', fontSize: '0.9rem', lineHeight: 1.5 }}>
                We couldn't find any products fitting these criteria. Try adjusting your sliders, removing terms, or resetting filters.
              </p>
              <button className="btn btn-secondary btn-sm" onClick={handleClearFilters}>
                Reset Filter Settings
              </button>
            </div>
          ) : (
            <div className="product-grid" style={{ marginTop: 0 }}>
              {products.map(product => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};
export default Search;
