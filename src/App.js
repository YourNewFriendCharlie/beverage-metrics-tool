import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  'https://crqticgwbfsxxbneuqhs.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNycXRpY2d3YmZzeHhibmV1cWhzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAyOTEwODEsImV4cCI6MjA2NTg2NzA4MX0.ZAoZ-1SaIwBMp_-LkEYuF_Phw0tvbhbYfM4b6eiOMfY'
);

// Martini Icon Component
function MartiniIcon({ size = 32 }) {
  return <span style={{ fontSize: `${size}px` }}>🍸</span>;
}

// Unit conversion system - Industry best practices, comprehensive units
const UNIT_CONVERSIONS = {
  // Volume conversions (base: ml)
  'ml': { toBase: 1, type: 'volume' },
  'cl': { toBase: 10, type: 'volume' },
  'l': { toBase: 1000, type: 'volume' },
  'oz': { toBase: 29.5735, type: 'volume' },
  'fl oz': { toBase: 29.5735, type: 'volume' },
  'cup': { toBase: 236.588, type: 'volume' },
  'pint': { toBase: 473.176, type: 'volume' },
  'quart': { toBase: 946.353, type: 'volume' },
  'gallon': { toBase: 3785.41, type: 'volume' },
  'bottle': { toBase: 750, type: 'volume' }, // Standard wine bottle
  'can': { toBase: 330, type: 'volume' }, // Standard beer can
  'shot': { toBase: 44.3603, type: 'volume' }, // Standard 1.5 oz shot
  'jigger': { toBase: 44.3603, type: 'volume' }, // Same as shot

  // Weight conversions (base: g) 
  'mg': { toBase: 0.001, type: 'weight' },
  'g': { toBase: 1, type: 'weight' },
  'kg': { toBase: 1000, type: 'weight' },
  'oz (weight)': { toBase: 28.3495, type: 'weight' },
  'lb': { toBase: 453.592, type: 'weight' },

  // Count conversions (base: unit)
  'unit': { toBase: 1, type: 'count' },
  'piece': { toBase: 1, type: 'count' },
  'each': { toBase: 1, type: 'count' },
  'dozen': { toBase: 12, type: 'count' }
};

// Convert between units of the same type
const convertUnits = (amount, fromUnit, toUnit) => {
  const from = UNIT_CONVERSIONS[fromUnit];
  const to = UNIT_CONVERSIONS[toUnit];

  // If units are the same, no conversion needed
  if (fromUnit === toUnit) return amount;

  // If units are different types, can't convert
  if (!from || !to || from.type !== to.type) {
    return amount; // Return original amount if conversion not possible
  }

  // Convert from source unit to base unit, then to target unit
  const baseAmount = amount * from.toBase;
  const convertedAmount = baseAmount / to.toBase;

  return convertedAmount;
};

// Get unit cost in any unit
const getUnitCostInTargetUnit = (ingredient, targetUnit) => {
  const baseCostPerUnit = ingredient.purchase_price / ingredient.purchase_unit_qty;
  const convertedQuantity = convertUnits(1, ingredient.purchase_unit_type, targetUnit);

  if (convertedQuantity === 1 && ingredient.purchase_unit_type !== targetUnit) {
    // Conversion not possible between these unit types
    return baseCostPerUnit;
  }

  return baseCostPerUnit / convertedQuantity;
};

// Industry pricing targets
const CATEGORY_TARGETS = {
  'Spirit': { pourCostMin: 0.18, pourCostMax: 0.22, markup: 4.5 },
  'Liqueur': { pourCostMin: 0.18, pourCostMax: 0.22, markup: 4.5 },
  'Classic Cocktails': { pourCostMin: 0.18, pourCostMax: 0.22, markup: 4.8 },
  'House Cocktails': { pourCostMin: 0.16, pourCostMax: 0.20, markup: 5.2 },
  'Wine': { pourCostMin: 0.20, pourCostMax: 0.25, markup: 3.5 },
  'Beer': { pourCostMin: 0.20, pourCostMax: 0.28, markup: 3.5 },
  'Non-Alc': { pourCostMin: 0.10, pourCostMax: 0.15, markup: 7 },
  'Coffee': { pourCostMin: 0.10, pourCostMax: 0.15, markup: 7 },
  'Tea': { pourCostMin: 0.10, pourCostMax: 0.15, markup: 7 },
  'Juice': { pourCostMin: 0.12, pourCostMax: 0.18, markup: 6 },
  'Mixer': { pourCostMin: 0.10, pourCostMax: 0.15, markup: 7 }
};

// Export to CSV function
const exportToCSV = (data, filename) => {
  const headers = Object.keys(data[0]).join(',');
  const rows = data.map(row => Object.values(row).map(val => `"${val}"`).join(','));
  const csvContent = [headers, ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(url);
};

// Styles object for consistent styling
const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #f8fafc 0%, #e0f2fe 50%, #f3e8ff 100%)',
    fontFamily: 'Arial, sans-serif'
  },
  header: {
    background: 'rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(20px)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
    padding: '24px',
    position: 'sticky',
    top: 0,
    zIndex: 50,
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
  },
  headerContent: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  },
  logo: {
    padding: '12px',
    background: 'linear-gradient(135deg, #f59e0b, #ea580c)',
    borderRadius: '16px',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: 'bold',
    background: 'linear-gradient(135deg, #2563eb, #9333ea, #ec4899)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    margin: 0
  },
  subtitle: {
    color: '#6b7280',
    marginTop: '4px',
    fontWeight: '500'
  },
  nav: {
    background: 'rgba(255, 255, 255, 0.7)',
    backdropFilter: 'blur(20px)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
    padding: '0 24px',
    position: 'sticky',
    top: '96px',
    zIndex: 40,
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
  },
  navContent: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'flex',
    gap: '8px'
  },
  navButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '16px 24px',
    borderBottom: '3px solid transparent',
    background: 'none',
    border: 'none',
    fontWeight: '500',
    cursor: 'pointer',
    borderRadius: '16px 16px 0 0',
    transition: 'all 0.3s ease'
  },
  navButtonActive: {
    background: 'linear-gradient(135deg, #3b82f6, #06b6d4)',
    color: 'white',
    borderTopLeftRadius: '16px',
    borderTopRightRadius: '16px',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    transform: 'scale(1.05)'
  },
  navButtonInactive: {
    color: '#6b7280'
  },
  main: {
    padding: '48px 24px'
  },
  card: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '32px',
    background: 'rgba(255, 255, 255, 0.8)',
    backdropFilter: 'blur(20px)',
    borderRadius: '24px',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    border: '1px solid rgba(255, 255, 255, 0.2)'
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    marginBottom: '32px'
  },
  cardTitle: {
    fontSize: '1.875rem',
    fontWeight: 'bold',
    background: 'linear-gradient(135deg, #2563eb, #9333ea)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    margin: 0
  },
  cardSubtitle: {
    color: '#6b7280',
    fontSize: '0.875rem',
    marginTop: '4px'
  },
  input: {
    width: '100%',
    padding: '16px 24px',
    border: 'none',
    background: 'rgba(249, 250, 251, 0.5)',
    backdropFilter: 'blur(8px)',
    borderRadius: '16px',
    fontSize: '16px',
    outline: 'none',
    transition: 'all 0.3s ease',
    boxShadow: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)'
  },
  button: {
    padding: '16px 32px',
    background: 'linear-gradient(135deg, #2563eb, #9333ea)',
    color: 'white',
    border: 'none',
    borderRadius: '16px',
    fontSize: '1.125rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    justifyContent: 'center'
  },
  buttonSecondary: {
    background: 'linear-gradient(135deg, #6b7280, #4b5563)',
    padding: '12px 24px'
  },
  buttonSmall: {
    padding: '8px 16px',
    fontSize: '0.875rem'
  },
  message: {
    padding: '16px',
    borderRadius: '16px',
    marginBottom: '24px',
    border: '1px solid'
  },
  messageSuccess: {
    background: 'rgba(16, 185, 129, 0.1)',
    color: '#047857',
    borderColor: 'rgba(16, 185, 129, 0.2)'
  },
  messageError: {
    background: 'rgba(239, 68, 68, 0.1)',
    color: '#dc2626',
    borderColor: 'rgba(239, 68, 68, 0.2)'
  },
  messageInfo: {
    background: 'rgba(59, 130, 246, 0.1)',
    color: '#1d4ed8',
    borderColor: 'rgba(59, 130, 246, 0.2)'
  },
  grid: {
    display: 'grid',
    gap: '24px'
  },
  gridCols2: {
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))'
  },
  gridCols3: {
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))'
  },
  ingredientCard: {
    background: 'rgba(255, 255, 255, 0.6)',
    backdropFilter: 'blur(8px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '16px',
    padding: '24px',
    transition: 'all 0.3s ease',
    cursor: 'pointer'
  },
  ingredientCardEditing: {
    border: '3px solid #9333ea',
    background: 'rgba(147, 51, 234, 0.1)'
  },
  badge: {
    padding: '4px 12px',
    borderRadius: '9999px',
    fontSize: '0.75rem',
    fontWeight: 'bold',
    color: 'white'
  },
  costDisplay: {
    background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(147, 51, 234, 0.1))',
    border: '1px solid rgba(59, 130, 246, 0.2)',
    borderRadius: '16px',
    padding: '24px',
    backdropFilter: 'blur(8px)'
  },
  modal: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '24px'
  },
  modalContent: {
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(20px)',
    borderRadius: '24px',
    padding: '32px',
    maxWidth: '800px',
    width: '100%',
    maxHeight: '80vh',
    overflow: 'auto',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
  },
  // NEW STYLES FOR ENHANCED INGREDIENT SELECTOR
  categoryTab: {
    padding: '12px 20px',
    border: 'none',
    background: 'rgba(255, 255, 255, 0.6)',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#6b7280'
  },
  categoryTabActive: {
    background: 'linear-gradient(135deg, #3b82f6, #06b6d4)',
    color: 'white',
    transform: 'scale(1.05)'
  },
  ingredientSelectorGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '12px',
    maxHeight: '300px',
    overflowY: 'auto',
    padding: '16px',
    background: 'rgba(249, 250, 251, 0.3)',
    borderRadius: '16px',
    border: '2px dashed rgba(59, 130, 246, 0.3)'
  },
  ingredientSelectorCard: {
    padding: '12px',
    background: 'rgba(255, 255, 255, 0.8)',
    borderRadius: '12px',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    textAlign: 'center'
  },
  ingredientSelectorCardHover: {
    background: 'rgba(59, 130, 246, 0.1)',
    borderColor: '#3b82f6',
    transform: 'translateY(-2px)'
  },
  ingredientSelectorButton: {
    cursor: 'pointer',
    textAlign: 'left',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  }
};

// Enhanced Ingredient Selector Component
function IngredientSelector({ ingredients, selectedIngredientId, onIngredientSelect, onClose }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [hoveredIngredient, setHoveredIngredient] = useState(null);

  // Get unique categories
  const categories = ['All', ...new Set(ingredients.map(ing => ing.category))];

  // Filter ingredients
  const filteredIngredients = ingredients.filter(ingredient => {
    const matchesSearch = ingredient.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || ingredient.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Group ingredients by category for display
  const groupedIngredients = selectedCategory === 'All'
    ? categories.slice(1).reduce((acc, category) => {
      acc[category] = filteredIngredients.filter(ing => ing.category === category);
      return acc;
    }, {})
    : { [selectedCategory]: filteredIngredients };

  const handleIngredientClick = (ingredient) => {
    onIngredientSelect(ingredient.id);
    onClose();
  };

  return (
    <div style={styles.modal} onClick={onClose}>
      <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold', color: '#374151' }}>
            🧪 Select Ingredient
          </h3>
          <button
            onClick={onClose}
            style={{
              background: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 12px',
              cursor: 'pointer'
            }}
          >
            ✕ Close
          </button>
        </div>

        {/* Search Bar */}
        <div style={{ position: 'relative', marginBottom: '24px' }}>
          <span style={{
            position: 'absolute',
            left: '16px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#9ca3af',
            fontSize: '1.2rem'
          }}>
            🔍
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search ingredients... (e.g., vodka, lime, syrup)"
            style={{
              ...styles.input,
              paddingLeft: '48px',
              margin: 0,
              fontSize: '1rem'
            }}
          />
        </div>

        {/* Category Tabs */}
        <div style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '24px',
          flexWrap: 'wrap',
          overflowX: 'auto',
          paddingBottom: '8px'
        }}>
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              style={{
                ...styles.categoryTab,
                ...(selectedCategory === category ? styles.categoryTabActive : {})
              }}
            >
              {category} {category !== 'All' && `(${ingredients.filter(ing => ing.category === category).length})`}
            </button>
          ))}
        </div>

        {/* Results Count */}
        <div style={{
          fontSize: '0.875rem',
          color: '#6b7280',
          marginBottom: '16px',
          padding: '12px',
          background: 'rgba(59, 130, 246, 0.1)',
          borderRadius: '12px',
          textAlign: 'center'
        }}>
          📊 Showing {filteredIngredients.length} ingredients
          {searchTerm && ` matching "${searchTerm}"`}
          {selectedCategory !== 'All' && ` in ${selectedCategory} category`}
        </div>

        {/* Ingredients Grid by Category */}
        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
          {Object.entries(groupedIngredients).map(([category, categoryIngredients]) => {
            if (categoryIngredients.length === 0) return null;

            return (
              <div key={category} style={{ marginBottom: '24px' }}>
                {selectedCategory === 'All' && (
                  <h4 style={{
                    fontSize: '1.125rem',
                    fontWeight: 'bold',
                    color: '#374151',
                    marginBottom: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    📂 {category} ({categoryIngredients.length})
                  </h4>
                )}

                <div style={styles.ingredientSelectorGrid}>
                  {categoryIngredients.map(ingredient => {
                    const costPerUnit = (ingredient.purchase_price / ingredient.purchase_unit_qty).toFixed(4);
                    const isSelected = selectedIngredientId === ingredient.id;

                    return (
                      <div
                        key={ingredient.id}
                        onClick={() => handleIngredientClick(ingredient)}
                        onMouseEnter={() => setHoveredIngredient(ingredient.id)}
                        onMouseLeave={() => setHoveredIngredient(null)}
                        style={{
                          ...styles.ingredientSelectorCard,
                          ...(hoveredIngredient === ingredient.id ? styles.ingredientSelectorCardHover : {}),
                          ...(isSelected ? {
                            background: 'rgba(16, 185, 129, 0.1)',
                            borderColor: '#10b981',
                            transform: 'scale(1.05)'
                          } : {})
                        }}
                      >
                        <div style={{
                          fontSize: '0.875rem',
                          fontWeight: 'bold',
                          color: '#374151',
                          marginBottom: '8px',
                          lineHeight: '1.2'
                        }}>
                          {ingredient.name}
                        </div>

                        <div style={{
                          ...styles.badge,
                          background: isSelected ? '#10b981' : '#3b82f6',
                          marginBottom: '8px'
                        }}>
                          {ingredient.category}
                        </div>

                        <div style={{
                          fontSize: '0.75rem',
                          color: '#6b7280',
                          lineHeight: '1.3'
                        }}>
                          <div>฿{costPerUnit}/{ingredient.purchase_unit_type}</div>
                          <div>{ingredient.purchase_unit_qty}{ingredient.purchase_unit_type} @ ฿{ingredient.purchase_price}</div>
                        </div>

                        {isSelected && (
                          <div style={{
                            marginTop: '8px',
                            fontSize: '0.75rem',
                            color: '#10b981',
                            fontWeight: 'bold'
                          }}>
                            ✓ Selected
                          </div>
                        )}

                        {hoveredIngredient === ingredient.id && !isSelected && (
                          <div style={{
                            marginTop: '8px',
                            fontSize: '0.75rem',
                            color: '#3b82f6',
                            fontWeight: 'bold'
                          }}>
                            Click to select
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {filteredIngredients.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '48px',
            color: '#6b7280'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🔍</div>
            <h3>No ingredients found</h3>
            <p>Try adjusting your search term or category filter</p>
          </div>
        )}
      </div>
    </div>
  );
}

function AddIngredientForm({ onIngredientAdded }) {
  const [formData, setFormData] = useState({
    name: '',
    purchase_unit_qty: '',
    purchase_unit_type: 'ml',
    purchase_price: '',
    category: 'Spirit',
    supplier: '',
    tags: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const unitTypes = ['ml', 'cl', 'oz', 'fl oz', 'cup', 'pint', 'quart', 'gallon', 'l', 'shot', 'jigger', 'bottle', 'can', 'mg', 'g', 'oz (weight)', 'kg', 'lb', 'unit', 'piece', 'each', 'dozen'];
  const categories = Object.keys(CATEGORY_TARGETS);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setMessage({ type: '', text: '' });

    try {
      if (!formData.name.trim() || !formData.purchase_unit_qty || !formData.purchase_price) {
        throw new Error('Please fill all required fields');
      }

      const tagsArray = formData.tags.split(',').map(t => t.trim()).filter(t => t);
      const ingredientData = {
        name: formData.name.trim(),
        purchase_unit_qty: parseFloat(formData.purchase_unit_qty),
        purchase_unit_type: formData.purchase_unit_type,
        purchase_price: parseFloat(formData.purchase_price),
        category: formData.category,
        supplier: formData.supplier.trim(),
        tags: tagsArray,
        date_updated: new Date().toISOString()
      };

      const { error } = await supabase.from('ingredients').insert([ingredientData]).select();
      if (error) throw error;

      setFormData({
        name: '',
        purchase_unit_qty: '',
        purchase_unit_type: 'ml',
        purchase_price: '',
        category: 'Spirit',
        supplier: '',
        tags: ''
      });
      setMessage({
        type: 'success',
        text: `🍸 "${ingredientData.name}" saved to database with smart unit conversion enabled!`
      });
      if (onIngredientAdded) onIngredientAdded();
    } catch (err) {
      setMessage({ type: 'error', text: `❌ Error: ${err.message}` });
    } finally {
      setIsSubmitting(false);
    }
  };

  const costPerUnit = formData.purchase_price && formData.purchase_unit_qty
    ? (parseFloat(formData.purchase_price) / parseFloat(formData.purchase_unit_qty)).toFixed(4) : 0;

  return (
    <div style={styles.card}>
      <div style={styles.cardHeader}>
        <div style={styles.logo}>
          <MartiniIcon size={28} />
        </div>
        <div>
          <h2 style={styles.cardTitle}>Add New Ingredient</h2>
          <p style={styles.cardSubtitle}>Expand your beverage inventory • MargaritaHotSauceLLC</p>
        </div>
      </div>

      {message.text && (
        <div style={{
          ...styles.message,
          ...(message.type === 'success' ? styles.messageSuccess :
            message.type === 'info' ? styles.messageInfo : styles.messageError)
        }}>
          {message.text}
        </div>
      )}

      <div style={{ ...styles.message, ...styles.messageInfo, marginBottom: '24px' }}>
        💡 <strong>Smart Unit Conversion:</strong> Buy ingredients in any unit (liters, bottles, kg) and use them in recipes with different units (ml, oz, g). The app automatically handles all conversions!
      </div>

      <div style={{ ...styles.grid, gap: '24px' }}>
        <input
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          placeholder="Ingredient Name (e.g., Vodka Premium, Simple Syrup)"
          style={styles.input}
        />

        <div style={{ ...styles.grid, ...styles.gridCols3 }}>
          <input
            name="purchase_unit_qty"
            type="number"
            step="0.01"
            value={formData.purchase_unit_qty}
            onChange={handleInputChange}
            placeholder="Quantity (750)"
            style={styles.input}
          />

          <select
            name="purchase_unit_type"
            value={formData.purchase_unit_type}
            onChange={handleInputChange}
            style={styles.input}
          >
            {unitTypes.map(unit => <option key={unit} value={unit}>{unit}</option>)}
          </select>

          <input
            name="purchase_price"
            type="number"
            step="0.01"
            value={formData.purchase_price}
            onChange={handleInputChange}
            placeholder="Price THB (850)"
            style={styles.input}
          />
        </div>

        <div style={{ ...styles.grid, ...styles.gridCols2 }}>
          <select
            name="category"
            value={formData.category}
            onChange={handleInputChange}
            style={styles.input}
          >
            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>

          <input
            name="supplier"
            value={formData.supplier}
            onChange={handleInputChange}
            placeholder="Supplier name"
            style={styles.input}
          />
        </div>

        <input
          name="tags"
          value={formData.tags}
          onChange={handleInputChange}
          placeholder="Tags: premium, imported, organic"
          style={styles.input}
        />

        {costPerUnit > 0 && (
          <div style={styles.costDisplay}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <MartiniIcon size={20} />
              <p style={{ margin: 0, fontSize: '1.125rem', fontWeight: '600', color: '#1e40af' }}>
                Cost per unit: ฿{costPerUnit} per {formData.purchase_unit_type}
              </p>
            </div>
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          style={{
            ...styles.button,
            ...(isSubmitting && { background: '#9ca3af', cursor: 'not-allowed' })
          }}
        >
          {isSubmitting ? (
            <>🔄 Adding Ingredient...</>
          ) : (
            <><MartiniIcon size={20} /> Add Ingredient</>
          )}
        </button>
      </div>
    </div>
  );
}

function RecipeBuilder({ ingredients, onRecipeSaved, editingRecipe, onCancelEdit }) {
  const [recipeName, setRecipeName] = useState('');
  const [recipeCategory, setRecipeCategory] = useState('Classic Cocktails');
  const [instructions, setInstructions] = useState('');
  const [selectedItems, setSelectedItems] = useState([{ ingredient_id: '', amount_used: '', unit: 'ml' }]);
  const [calculations, setCalculations] = useState(null);
  const [showBatchTool, setShowBatchTool] = useState(false);
  const [batchSize, setBatchSize] = useState(10);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actualPrice, setActualPrice] = useState('');

  // NEW STATE FOR ENHANCED INGREDIENT SELECTOR
  const [showIngredientSelector, setShowIngredientSelector] = useState(false);
  const [selectingForIndex, setSelectingForIndex] = useState(null);

  // Load recipe data when editing
  useEffect(() => {
    if (editingRecipe) {
      setRecipeName(editingRecipe.name);
      setRecipeCategory(editingRecipe.category);
      setInstructions(editingRecipe.instructions || '');
      setActualPrice(''); // Clear actual price when editing

      // Load recipe ingredients with proper data structure
      if (editingRecipe.recipe_ingredients && editingRecipe.recipe_ingredients.length > 0) {
        setSelectedItems(editingRecipe.recipe_ingredients.map(ri => ({
          ingredient_id: ri.ingredient_id,
          amount_used: ri.amount_used.toString(), // Convert to string for form input
          unit: ri.unit_type
        })));
      } else {
        // If no ingredients, start with one empty row
        setSelectedItems([{ ingredient_id: '', amount_used: '', unit: 'ml' }]);
      }

      // Clear calculations when starting to edit
      setCalculations(null);
    } else {
      // Clear form for new recipe
      setRecipeName('');
      setRecipeCategory('Classic Cocktails');
      setInstructions('');
      setSelectedItems([{ ingredient_id: '', amount_used: '', unit: 'ml' }]);
      setCalculations(null);
      setActualPrice('');
    }
  }, [editingRecipe]);

  const addIngredient = () => {
    setSelectedItems([...selectedItems, { ingredient_id: '', amount_used: '', unit: 'ml' }]);
  };

  const removeIngredient = (index) => {
    setSelectedItems(selectedItems.filter((_, i) => i !== index));
  };

  const handleChange = (index, field, value) => {
    const copy = [...selectedItems];
    copy[index][field] = value;
    setSelectedItems(copy);
  };

  // NEW FUNCTIONS FOR ENHANCED INGREDIENT SELECTOR
  const handleIngredientSelect = (index) => {
    setSelectingForIndex(index);
    setShowIngredientSelector(true);
  };

  const handleIngredientSelected = (ingredientId) => {
    if (selectingForIndex !== null) {
      handleChange(selectingForIndex, 'ingredient_id', ingredientId);
      setSelectingForIndex(null);
    }
  };

  const calculateCost = () => {
    let totalCost = 0;
    let validItems = 0;
    let ingredientBreakdown = [];

    selectedItems.forEach(item => {
      const ingredient = ingredients.find(i => i.id === item.ingredient_id);
      if (!ingredient || !item.amount_used) return;

      // Use smart unit conversion to get cost in the recipe's unit
      const unitCostInRecipeUnit = getUnitCostInTargetUnit(ingredient, item.unit);
      const itemCost = parseFloat(item.amount_used) * unitCostInRecipeUnit;

      totalCost += itemCost;
      validItems++;

      // Show conversion info if units are different
      const conversionInfo = ingredient.purchase_unit_type !== item.unit ?
        ` (converted from ${ingredient.purchase_unit_type})` : '';

      ingredientBreakdown.push({
        name: ingredient.name,
        amount: item.amount_used,
        unit: item.unit + conversionInfo,
        cost: itemCost.toFixed(2),
        percentage: 0,
        unitCost: unitCostInRecipeUnit.toFixed(4)
      });
    });

    if (validItems === 0) {
      setCalculations(null);
      return;
    }

    ingredientBreakdown = ingredientBreakdown.map(item => ({
      ...item,
      percentage: ((parseFloat(item.cost) / totalCost) * 100).toFixed(1)
    }));

    const targets = CATEGORY_TARGETS[recipeCategory];
    const minPrice = totalCost / targets.pourCostMax;
    const maxPrice = totalCost / targets.pourCostMin;
    const suggestedPrice = totalCost * targets.markup;

    const minPourCost = (totalCost / maxPrice) * 100;

    setCalculations({
      totalCost: totalCost.toFixed(2),
      minPrice: minPrice.toFixed(2),
      maxPrice: maxPrice.toFixed(2),
      suggestedPrice: suggestedPrice.toFixed(2),
      minPourCost: minPourCost.toFixed(1),
      margin: ((suggestedPrice - totalCost) / suggestedPrice * 100).toFixed(1),
      ingredientBreakdown
    });
  };

  const saveRecipe = async () => {
    if (!recipeName.trim()) {
      alert('Please enter a recipe name');
      return;
    }

    setIsSubmitting(true);
    try {
      const recipeData = {
        name: recipeName,
        category: recipeCategory,
        instructions: instructions,
        tags: [],
        updated_at: new Date().toISOString()
      };

      let recipe;
      if (editingRecipe) {
        // Update existing recipe
        const { data: updatedRecipe, error: recipeError } = await supabase
          .from('recipes')
          .update(recipeData)
          .eq('id', editingRecipe.id)
          .select();

        if (recipeError) throw recipeError;
        recipe = updatedRecipe;

        // Delete existing ingredients
        await supabase
          .from('recipe_ingredients')
          .delete()
          .eq('recipe_id', editingRecipe.id);
      } else {
        // Create new recipe
        recipeData.created_at = new Date().toISOString();
        const { data: newRecipe, error: recipeError } = await supabase
          .from('recipes')
          .insert([recipeData])
          .select();

        if (recipeError) throw recipeError;
        recipe = newRecipe;
      }

      // Insert recipe ingredients
      const recipeIngredients = selectedItems
        .filter(item => item.ingredient_id && item.amount_used)
        .map(item => ({
          recipe_id: recipe[0].id,
          ingredient_id: item.ingredient_id,
          amount_used: parseFloat(item.amount_used),
          unit_type: item.unit
        }));

      if (recipeIngredients.length > 0) {
        const { error: ingredientsError } = await supabase
          .from('recipe_ingredients')
          .insert(recipeIngredients);

        if (ingredientsError) throw ingredientsError;
      }

      alert(`🍸 Recipe "${recipeName}" ${editingRecipe ? 'updated' : 'saved'} successfully!`);
      if (onRecipeSaved) onRecipeSaved();
      if (onCancelEdit) onCancelEdit();

      // Clear form if not editing
      if (!editingRecipe) {
        setRecipeName('');
        setInstructions('');
        setSelectedItems([{ ingredient_id: '', amount_used: '', unit: 'ml' }]);
        setCalculations(null);
      }
    } catch (error) {
      alert(`❌ Error ${editingRecipe ? 'updating' : 'saving'} recipe: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const exportRecipe = () => {
    if (!calculations) return;
    const exportData = [{
      name: recipeName || 'Unnamed Recipe',
      category: recipeCategory,
      totalCost: calculations.totalCost,
      suggestedPrice: calculations.suggestedPrice,
      margin: calculations.margin,
      pourCost: calculations.minPourCost
    }];
    exportToCSV(exportData, `${recipeName || 'recipe'}_costing.csv`);
  };

  return (
    <div style={{ ...styles.card, maxWidth: '1000px' }}>
      <div style={styles.cardHeader}>
        <div style={{
          ...styles.logo,
          background: editingRecipe ?
            'linear-gradient(135deg, #f59e0b, #ea580c)' :
            'linear-gradient(135deg, #10b981, #2563eb)'
        }}>
          <MartiniIcon size={28} />
        </div>
        <div style={{ flex: 1 }}>
          <h2 style={{
            ...styles.cardTitle,
            background: editingRecipe ?
              'linear-gradient(135deg, #f59e0b, #ea580c)' :
              'linear-gradient(135deg, #10b981, #2563eb)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            {editingRecipe ? `✏️ Editing: ${editingRecipe.name}` : 'Recipe Builder & Cost Calculator'}
          </h2>
          <p style={styles.cardSubtitle}>
            {editingRecipe ? 'Edit ingredients, amounts, instructions - all aspects are editable' : 'Create and analyze beverage recipes with enhanced ingredient search'} • MargaritaHotSauceLLC
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          {editingRecipe && (
            <button onClick={onCancelEdit} style={{ ...styles.buttonSecondary, ...styles.button, fontSize: '0.875rem', padding: '12px 20px' }}>
              ❌ Cancel Edit
            </button>
          )}
          <button onClick={saveRecipe} disabled={isSubmitting} style={{ ...styles.button, fontSize: '0.875rem', padding: '12px 20px' }}>
            💾 {editingRecipe ? 'Update Recipe' : 'Save Recipe'}
          </button>
          <button onClick={exportRecipe} disabled={!calculations} style={{ ...styles.buttonSecondary, ...styles.button, fontSize: '0.875rem' }}>
            📥 Export
          </button>
        </div>
      </div>

      <div style={{ ...styles.message, ...styles.messageInfo, marginBottom: '24px' }}>
        🔍 <strong>Enhanced Ingredient Selection:</strong> Click ingredient buttons to search by name, browse by category, and see real-time cost information. Auto Unit Conversion: Mix units freely! Use 30ml gin + 1oz vermouth + 2cl olive brine - the app handles all conversions automatically.
      </div>

      <div style={{ ...styles.grid, ...styles.gridCols2, marginBottom: '32px' }}>
        <input
          value={recipeName}
          onChange={(e) => setRecipeName(e.target.value)}
          placeholder="Recipe Name (e.g., Classic Martini, House Margarita)"
          style={styles.input}
        />

        <select
          value={recipeCategory}
          onChange={(e) => setRecipeCategory(e.target.value)}
          style={styles.input}
        >
          {Object.keys(CATEGORY_TARGETS).map(cat => <option key={cat} value={cat}>{cat}</option>)}
        </select>
      </div>

      <textarea
        value={instructions}
        onChange={(e) => setInstructions(e.target.value)}
        placeholder="Step-by-step preparation instructions..."
        rows={3}
        style={{ ...styles.input, marginBottom: '32px', resize: 'vertical' }}
      />

      <div style={{ marginBottom: '32px' }}>
        <h3 style={{ marginBottom: '16px', fontWeight: '600' }}>Recipe Ingredients</h3>
        {selectedItems.map((item, index) => {
          const ingredient = ingredients.find(i => i.id === item.ingredient_id);
          const showConversion = ingredient && item.unit && ingredient.purchase_unit_type !== item.unit;

          return (
            <div key={index} style={{ marginBottom: '12px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: '12px', alignItems: 'center', padding: '16px', background: 'rgba(249, 250, 251, 0.5)', borderRadius: '12px' }}>

                {/* ENHANCED INGREDIENT SELECTOR BUTTON */}
                <button
                  onClick={() => handleIngredientSelect(index)}
                  style={{
                    ...styles.input,
                    ...styles.ingredientSelectorButton,
                    margin: 0,
                    padding: '12px',
                    background: ingredient ? 'rgba(16, 185, 129, 0.1)' : 'rgba(249, 250, 251, 0.8)',
                    border: ingredient ? '2px solid #10b981' : '2px dashed #d1d5db'
                  }}
                >
                  <span style={{ color: ingredient ? '#047857' : '#6b7280' }}>
                    {ingredient ? (
                      <>
                        <strong>{ingredient.name}</strong>
                        <span style={{ fontSize: '0.875rem', marginLeft: '8px' }}>
                          ({ingredient.category}) - ฿{(ingredient.purchase_price / ingredient.purchase_unit_qty).toFixed(4)}/{ingredient.purchase_unit_type}
                        </span>
                      </>
                    ) : (
                      '🔍 Click to search & select ingredient...'
                    )}
                  </span>
                  <span style={{ fontSize: '1.2rem' }}>{ingredient ? '✓' : '🔍'}</span>
                </button>

                <input
                  type="number"
                  step="0.1"
                  value={item.amount_used}
                  onChange={e => handleChange(index, 'amount_used', e.target.value)}
                  placeholder="Amount"
                  style={{ ...styles.input, margin: 0, padding: '12px' }}
                />

                <select
                  value={item.unit}
                  onChange={e => handleChange(index, 'unit', e.target.value)}
                  style={{ ...styles.input, margin: 0, padding: '12px' }}
                >
                  <option value="ml">ml</option>
                  <option value="cl">cl</option>
                  <option value="oz">oz</option>
                  <option value="fl oz">fl oz</option>
                  <option value="cup">cup</option>
                  <option value="pint">pint</option>
                  <option value="quart">quart</option>
                  <option value="gallon">gallon</option>
                  <option value="l">l</option>
                  <option value="shot">shot</option>
                  <option value="jigger">jigger</option>
                  <option value="bottle">bottle</option>
                  <option value="can">can</option>
                  <option value="mg">mg</option>
                  <option value="g">g</option>
                  <option value="oz (weight)">oz (weight)</option>
                  <option value="kg">kg</option>
                  <option value="lb">lb</option>
                  <option value="unit">unit</option>
                  <option value="piece">piece</option>
                  <option value="each">each</option>
                  <option value="dozen">dozen</option>
                </select>

                {selectedItems.length > 1 && (
                  <button
                    onClick={() => removeIngredient(index)}
                    style={{ padding: '8px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                  >
                    🗑️
                  </button>
                )}
              </div>

              {showConversion && item.amount_used && (
                <div style={{ marginTop: '8px', padding: '12px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '8px', fontSize: '0.875rem', color: '#1d4ed8' }}>
                  💡 Auto-converting: {ingredient.purchase_unit_type} → {item.unit} | Cost: ฿{getUnitCostInTargetUnit(ingredient, item.unit).toFixed(4)} per {item.unit}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginBottom: '32px' }}>
        <button onClick={addIngredient} style={{ ...styles.buttonSecondary, ...styles.button, fontSize: '0.875rem' }}>
          ➕ Add Ingredient
        </button>

        <button onClick={calculateCost} style={{ ...styles.button, fontSize: '0.875rem' }}>
          🧮 Calculate Cost & Pricing
        </button>

        <button onClick={() => setShowBatchTool(!showBatchTool)} style={{ ...styles.button, background: 'linear-gradient(135deg, #9333ea, #ec4899)', fontSize: '0.875rem' }}>
          📊 Batch Tool
        </button>
      </div>

      {showBatchTool && calculations && (
        <div style={{ background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.1), rgba(236, 72, 153, 0.1))', border: '1px solid rgba(147, 51, 234, 0.2)', borderRadius: '16px', padding: '24px', marginBottom: '32px' }}>
          <h3 style={{ marginTop: 0, marginBottom: '16px', color: '#7c3aed', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
            📊 Batch Scaling Tool
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: '600', color: '#7c3aed' }}>Batch Size:</label>
            <input
              type="number"
              value={batchSize}
              onChange={(e) => setBatchSize(parseInt(e.target.value) || 1)}
              style={{ ...styles.input, width: '80px', margin: 0, padding: '8px 12px' }}
              min="1"
            />
            <span style={{ fontSize: '0.875rem', color: '#7c3aed', fontWeight: '500' }}>servings</span>
          </div>
          <div style={{ ...styles.grid, ...styles.gridCols3 }}>
            <div style={{ background: 'rgba(255, 255, 255, 0.6)', padding: '16px', borderRadius: '12px' }}>
              <div style={{ fontWeight: 'bold', color: '#7c3aed', fontSize: '0.875rem' }}>Batch Total Cost</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#374151' }}>฿{(parseFloat(calculations.totalCost) * batchSize).toFixed(2)}</div>
            </div>
            <div style={{ background: 'rgba(255, 255, 255, 0.6)', padding: '16px', borderRadius: '12px' }}>
              <div style={{ fontWeight: 'bold', color: '#7c3aed', fontSize: '0.875rem' }}>Revenue Potential</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#10b981' }}>฿{(parseFloat(calculations.suggestedPrice) * batchSize).toFixed(2)}</div>
            </div>
            <div style={{ background: 'rgba(255, 255, 255, 0.6)', padding: '16px', borderRadius: '12px' }}>
              <div style={{ fontWeight: 'bold', color: '#7c3aed', fontSize: '0.875rem' }}>Batch Profit</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#2563eb' }}>฿{((parseFloat(calculations.suggestedPrice) - parseFloat(calculations.totalCost)) * batchSize).toFixed(2)}</div>
            </div>
          </div>
        </div>
      )}

      {calculations && (
        <div style={{ background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(16, 185, 129, 0.1))', border: '1px solid rgba(59, 130, 246, 0.2)', borderRadius: '24px', padding: '32px', backdropFilter: 'blur(8px)' }}>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', background: 'linear-gradient(135deg, #2563eb, #9333ea)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <MartiniIcon size={28} />
            Cost Analysis & Pricing Suggestions
          </h3>

          <div style={{ ...styles.grid, gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px', marginBottom: '32px' }}>
            <div style={{ background: 'rgba(255, 255, 255, 0.7)', padding: '24px', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.2)', textAlign: 'center', transition: 'transform 0.3s ease' }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ef4444', marginBottom: '8px' }}>฿{calculations.totalCost}</div>
              <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#6b7280' }}>Total Cost</div>
            </div>

            <div style={{ background: 'rgba(255, 255, 255, 0.7)', padding: '24px', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.2)', textAlign: 'center', transition: 'transform 0.3s ease' }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981', marginBottom: '8px' }}>฿{calculations.suggestedPrice}</div>
              <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#6b7280' }}>Suggested Price</div>
            </div>

            <div style={{ background: 'rgba(255, 255, 255, 0.7)', padding: '24px', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.2)', textAlign: 'center', transition: 'transform 0.3s ease' }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#2563eb', marginBottom: '8px' }}>{calculations.margin}%</div>
              <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#6b7280' }}>Gross Margin</div>
            </div>

            <div style={{ background: 'rgba(255, 255, 255, 0.7)', padding: '24px', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.2)', textAlign: 'center', transition: 'transform 0.3s ease' }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#9333ea', marginBottom: '8px' }}>{calculations.minPourCost}%</div>
              <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#6b7280' }}>Pour Cost @Target</div>
            </div>
          </div>

          {/* Actual Price Analysis Row */}
          <div style={{ background: 'rgba(236, 72, 153, 0.1)', border: '1px solid rgba(236, 72, 153, 0.2)', borderRadius: '16px', padding: '24px', marginBottom: '32px' }}>
            <h4 style={{ fontWeight: 'bold', marginBottom: '16px', fontSize: '1.125rem', color: '#be185d', display: 'flex', alignItems: 'center', gap: '8px' }}>
              💰 Actual Price Analysis
            </h4>
            <div style={{ ...styles.grid, gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px' }}>
              {/* Input Actual Price */}
              <div style={{ background: 'rgba(255, 255, 255, 0.8)', padding: '24px', borderRadius: '16px', border: '2px solid rgba(236, 72, 153, 0.3)', textAlign: 'center' }}>
                <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#be185d', marginBottom: '8px' }}>Your Menu Price</div>
                <input
                  type="number"
                  step="0.01"
                  value={actualPrice}
                  onChange={(e) => setActualPrice(e.target.value)}
                  placeholder="Enter price ฿"
                  style={{
                    ...styles.input,
                    textAlign: 'center',
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                    color: '#be185d',
                    background: 'rgba(255, 255, 255, 0.9)',
                    border: '2px solid rgba(236, 72, 153, 0.3)',
                    margin: 0,
                    padding: '12px'
                  }}
                />
              </div>

              {/* Actual Gross Margin */}
              {actualPrice && parseFloat(actualPrice) > 0 && (
                <>
                  <div style={{ background: 'rgba(255, 255, 255, 0.7)', padding: '24px', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.2)', textAlign: 'center', transition: 'transform 0.3s ease' }}>
                    <div style={{
                      fontSize: '2rem',
                      fontWeight: 'bold',
                      color: ((parseFloat(actualPrice) - parseFloat(calculations.totalCost)) / parseFloat(actualPrice) * 100) >= parseFloat(calculations.margin) ? '#10b981' : '#ef4444',
                      marginBottom: '8px'
                    }}>
                      {((parseFloat(actualPrice) - parseFloat(calculations.totalCost)) / parseFloat(actualPrice) * 100).toFixed(1)}%
                    </div>
                    <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#6b7280' }}>Actual Margin</div>
                    <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '4px' }}>
                      Target: {calculations.margin}%
                    </div>
                  </div>

                  {/* Actual Pour Cost */}
                  <div style={{ background: 'rgba(255, 255, 255, 0.7)', padding: '24px', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.2)', textAlign: 'center', transition: 'transform 0.3s ease' }}>
                    <div style={{
                      fontSize: '2rem',
                      fontWeight: 'bold',
                      color: (parseFloat(calculations.totalCost) / parseFloat(actualPrice) * 100) <= parseFloat(calculations.minPourCost) ? '#10b981' : '#ef4444',
                      marginBottom: '8px'
                    }}>
                      {(parseFloat(calculations.totalCost) / parseFloat(actualPrice) * 100).toFixed(1)}%
                    </div>
                    <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#6b7280' }}>Actual Pour Cost</div>
                    <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '4px' }}>
                      Target: {calculations.minPourCost}%
                    </div>
                  </div>

                  {/* Profit per Item */}
                  <div style={{ background: 'rgba(255, 255, 255, 0.7)', padding: '24px', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.2)', textAlign: 'center', transition: 'transform 0.3s ease' }}>
                    <div style={{
                      fontSize: '2rem',
                      fontWeight: 'bold',
                      color: (parseFloat(actualPrice) - parseFloat(calculations.totalCost)) > 0 ? '#10b981' : '#ef4444',
                      marginBottom: '8px'
                    }}>
                      ฿{(parseFloat(actualPrice) - parseFloat(calculations.totalCost)).toFixed(2)}
                    </div>
                    <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#6b7280' }}>Profit per Item</div>
                    <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '4px' }}>
                      Suggested: ฿{(parseFloat(calculations.suggestedPrice) - parseFloat(calculations.totalCost)).toFixed(2)}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Performance Indicators */}
            {actualPrice && parseFloat(actualPrice) > 0 && (
              <div style={{ marginTop: '16px', padding: '16px', background: 'rgba(255, 255, 255, 0.6)', borderRadius: '12px', display: 'flex', gap: '16px', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap' }}>
                <div style={{
                  padding: '8px 16px',
                  borderRadius: '20px',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  background: ((parseFloat(actualPrice) - parseFloat(calculations.totalCost)) / parseFloat(actualPrice) * 100) >= parseFloat(calculations.margin) ?
                    'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #ef4444, #dc2626)',
                  color: 'white'
                }}>
                  {((parseFloat(actualPrice) - parseFloat(calculations.totalCost)) / parseFloat(actualPrice) * 100) >= parseFloat(calculations.margin) ?
                    '✅ Margin Target Met' : '⚠️ Below Margin Target'}
                </div>

                <div style={{
                  padding: '8px 16px',
                  borderRadius: '20px',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  background: (parseFloat(calculations.totalCost) / parseFloat(actualPrice) * 100) <= parseFloat(calculations.minPourCost) ?
                    'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #ef4444, #dc2626)',
                  color: 'white'
                }}>
                  {(parseFloat(calculations.totalCost) / parseFloat(actualPrice) * 100) <= parseFloat(calculations.minPourCost) ?
                    '✅ Pour Cost Good' : '⚠️ Pour Cost High'}
                </div>

                <div style={{
                  padding: '8px 16px',
                  borderRadius: '20px',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  background: parseFloat(actualPrice) >= parseFloat(calculations.suggestedPrice) ?
                    'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #f59e0b, #ea580c)',
                  color: 'white'
                }}>
                  {parseFloat(actualPrice) >= parseFloat(calculations.suggestedPrice) ?
                    '💰 Above Suggested' : '💡 Could Increase'}
                </div>
              </div>
            )}
          </div>

          {/* Ingredient Breakdown */}
          <div style={{ background: 'rgba(255, 255, 255, 0.7)', padding: '24px', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.2)', marginBottom: '24px' }}>
            <h4 style={{ fontWeight: 'bold', marginBottom: '16px', fontSize: '1.125rem', color: '#374151', display: 'flex', alignItems: 'center', gap: '8px' }}>
              🧾 Ingredient Cost Breakdown
            </h4>
            {calculations.ingredientBreakdown.map((item, index) => (
              <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'rgba(249, 250, 251, 0.5)', borderRadius: '8px', marginBottom: '8px' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '600', color: '#374151' }}>{item.name}</div>
                  <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>{item.amount} {item.unit} @ ฿{item.unitCost}/{item.unit.split(' ')[0]}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 'bold', color: '#10b981' }}>฿{item.cost}</div>
                  <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>{item.percentage}%</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ background: 'rgba(255, 255, 255, 0.7)', padding: '24px', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.2)' }}>
            <h4 style={{ fontWeight: 'bold', marginBottom: '16px', fontSize: '1.125rem', color: '#374151', display: 'flex', alignItems: 'center', gap: '8px' }}>
              📊 Pricing Range Analysis ({recipeCategory})
            </h4>
            <div style={{ fontSize: '0.875rem', color: '#4b5563', lineHeight: '1.6' }}>
              <div style={{ marginBottom: '8px' }}><strong>Industry Target Pour Cost:</strong> {(CATEGORY_TARGETS[recipeCategory].pourCostMin * 100).toFixed(0)}% - {(CATEGORY_TARGETS[recipeCategory].pourCostMax * 100).toFixed(0)}%</div>
              <div style={{ marginBottom: '8px' }}><strong>Price Range:</strong> ฿{calculations.minPrice} - ฿{calculations.maxPrice}</div>
              <div><strong>Recommended:</strong> ฿{calculations.suggestedPrice} (Pour cost: {calculations.minPourCost}%)</div>
            </div>
          </div>
        </div>
      )}

      {/* ENHANCED INGREDIENT SELECTOR MODAL */}
      {showIngredientSelector && (
        <IngredientSelector
          ingredients={ingredients}
          selectedIngredientId={selectedItems[selectingForIndex]?.ingredient_id}
          onIngredientSelect={handleIngredientSelected}
          onClose={() => {
            setShowIngredientSelector(false);
            setSelectingForIndex(null);
          }}
        />
      )}
    </div>
  );
}

// Price Impact Analysis Component
function PriceImpactModal({
  isOpen,
  onClose,
  oldIngredient,
  newIngredient,
  affectedRecipes,
  ingredients,
  onUpdatePrices
}) {
  if (!isOpen) return null;

  const oldCostPerUnit = oldIngredient.purchase_price / oldIngredient.purchase_unit_qty;
  const newCostPerUnit = newIngredient.purchase_price / newIngredient.purchase_unit_qty;
  const costChange = ((newCostPerUnit - oldCostPerUnit) / oldCostPerUnit * 100);
  const isIncrease = costChange > 0;

  // Calculate impact for each affected recipe
  const recipeImpacts = affectedRecipes.map(recipe => {
    const recipeIngredient = recipe.recipe_ingredients.find(ri => ri.ingredient_id === oldIngredient.id);
    if (!recipeIngredient) return null;

    // Calculate old and new costs for this recipe
    const oldUnitCost = getUnitCostInTargetUnit(oldIngredient, recipeIngredient.unit_type);
    const newUnitCost = getUnitCostInTargetUnit(newIngredient, recipeIngredient.unit_type);
    const oldItemCost = recipeIngredient.amount_used * oldUnitCost;
    const newItemCost = recipeIngredient.amount_used * newUnitCost;
    const itemCostChange = newItemCost - oldItemCost;

    // Calculate total recipe costs (old and new)
    let oldTotalCost = 0;
    let newTotalCost = 0;

    recipe.recipe_ingredients.forEach(ri => {
      const ingredient = ingredients.find(i => i.id === ri.ingredient_id);
      if (ingredient) {
        const unitCost = ri.ingredient_id === oldIngredient.id
          ? getUnitCostInTargetUnit(ri.ingredient_id === oldIngredient.id ? oldIngredient : ingredient, ri.unit_type)
          : getUnitCostInTargetUnit(ingredient, ri.unit_type);
        const newUnitCostCalc = ri.ingredient_id === oldIngredient.id
          ? getUnitCostInTargetUnit(newIngredient, ri.unit_type)
          : getUnitCostInTargetUnit(ingredient, ri.unit_type);

        oldTotalCost += ri.amount_used * unitCost;
        newTotalCost += ri.amount_used * newUnitCostCalc;
      }
    });

    const totalCostChange = newTotalCost - oldTotalCost;
    const totalCostChangePercent = (totalCostChange / oldTotalCost * 100);

    // Calculate suggested pricing
    const targets = CATEGORY_TARGETS[recipe.category] || CATEGORY_TARGETS['Classic Cocktails'];
    const oldSuggestedPrice = oldTotalCost * targets.markup;
    const newSuggestedPrice = newTotalCost * targets.markup;
    const priceAdjustment = newSuggestedPrice - oldSuggestedPrice;

    // Calculate pour cost impact
    const oldPourCost = (oldTotalCost / oldSuggestedPrice * 100);
    const newPourCost = (newTotalCost / newSuggestedPrice * 100);

    return {
      recipe,
      oldItemCost: oldItemCost.toFixed(2),
      newItemCost: newItemCost.toFixed(2),
      itemCostChange: itemCostChange.toFixed(2),
      oldTotalCost: oldTotalCost.toFixed(2),
      newTotalCost: newTotalCost.toFixed(2),
      totalCostChange: totalCostChange.toFixed(2),
      totalCostChangePercent: totalCostChangePercent.toFixed(1),
      oldSuggestedPrice: oldSuggestedPrice.toFixed(2),
      newSuggestedPrice: newSuggestedPrice.toFixed(2),
      priceAdjustment: priceAdjustment.toFixed(2),
      oldPourCost: oldPourCost.toFixed(1),
      newPourCost: newPourCost.toFixed(1),
      amount: recipeIngredient.amount_used,
      unit: recipeIngredient.unit_type
    };
  }).filter(impact => impact !== null);

  // Sort by impact severity (highest cost change first)
  recipeImpacts.sort((a, b) => Math.abs(parseFloat(b.totalCostChange)) - Math.abs(parseFloat(a.totalCostChange)));

  const exportImpactReport = () => {
    const exportData = recipeImpacts.map(impact => ({
      recipeName: impact.recipe.name,
      category: impact.recipe.category,
      ingredientAmount: `${impact.amount} ${impact.unit}`,
      oldItemCost: impact.oldItemCost,
      newItemCost: impact.newItemCost,
      itemCostChange: impact.itemCostChange,
      oldTotalRecipeCost: impact.oldTotalCost,
      newTotalRecipeCost: impact.newTotalCost,
      totalCostChange: impact.totalCostChange,
      costChangePercent: impact.totalCostChangePercent,
      oldSuggestedPrice: impact.oldSuggestedPrice,
      newSuggestedPrice: impact.newSuggestedPrice,
      priceAdjustment: impact.priceAdjustment,
      oldPourCost: impact.oldPourCost,
      newPourCost: impact.newPourCost
    }));

    exportToCSV(exportData, `price_impact_${newIngredient.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`);
  };

  return (
    <div style={styles.modal} onClick={onClose}>
      <div style={{
        ...styles.modalContent,
        maxWidth: '1000px',
        maxHeight: '90vh',
        overflow: 'auto'
      }} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold', color: isIncrease ? '#dc2626' : '#059669' }}>
              {isIncrease ? '⚠️' : '📉'} Price Impact Analysis
            </h2>
            <p style={{ margin: '4px 0 0 0', color: '#6b7280', fontSize: '0.875rem' }}>
              Impact of changing "{oldIngredient.name}" price
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={exportImpactReport}
              style={{
                ...styles.button,
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                fontSize: '0.875rem',
                padding: '8px 16px'
              }}
            >
              📊 Export Report
            </button>
            <button
              onClick={onClose}
              style={{ background: '#6b7280', color: 'white', border: 'none', borderRadius: '8px', padding: '8px 12px', cursor: 'pointer' }}
            >
              ✕ Close
            </button>
          </div>
        </div>

        {/* Price Change Summary */}
        <div style={{
          background: isIncrease ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
          border: `1px solid ${isIncrease ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)'}`,
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '32px'
        }}>
          <h3 style={{
            fontSize: '1.125rem',
            fontWeight: 'bold',
            marginBottom: '16px',
            color: isIncrease ? '#dc2626' : '#059669'
          }}>
            💰 Price Change Summary
          </h3>

          <div style={{ ...styles.grid, ...styles.gridCols3, gap: '16px' }}>
            <div style={{ background: 'rgba(255, 255, 255, 0.8)', padding: '16px', borderRadius: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '4px' }}>Old Cost per {oldIngredient.purchase_unit_type}</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#374151' }}>฿{oldCostPerUnit.toFixed(4)}</div>
            </div>

            <div style={{ background: 'rgba(255, 255, 255, 0.8)', padding: '16px', borderRadius: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '4px' }}>New Cost per {newIngredient.purchase_unit_type}</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: isIncrease ? '#dc2626' : '#059669' }}>
                ฿{newCostPerUnit.toFixed(4)}
              </div>
            </div>

            <div style={{ background: 'rgba(255, 255, 255, 0.8)', padding: '16px', borderRadius: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '4px' }}>Change</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: isIncrease ? '#dc2626' : '#059669' }}>
                {isIncrease ? '+' : ''}{costChange.toFixed(1)}%
              </div>
            </div>
          </div>
        </div>

        {/* Affected Recipes */}
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '16px', color: '#374151' }}>
            🍸 Affected Recipes ({recipeImpacts.length})
          </h3>

          {recipeImpacts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px', color: '#6b7280' }}>
              <div style={{ fontSize: '2rem', marginBottom: '8px' }}>✅</div>
              <p>No recipes use this ingredient</p>
            </div>
          ) : (
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {recipeImpacts.map((impact, index) => (
                <div key={impact.recipe.id} style={{
                  background: 'rgba(255, 255, 255, 0.8)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '12px',
                  padding: '20px',
                  marginBottom: '16px'
                }}>

                  {/* Recipe Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 'bold', color: '#374151' }}>
                        {impact.recipe.name}
                      </h4>
                      <p style={{ margin: '4px 0 0 0', fontSize: '0.875rem', color: '#6b7280' }}>
                        {impact.recipe.category} • Uses {impact.amount} {impact.unit}
                      </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{
                        fontSize: '1.125rem',
                        fontWeight: 'bold',
                        color: parseFloat(impact.totalCostChange) > 0 ? '#dc2626' : '#059669'
                      }}>
                        {parseFloat(impact.totalCostChange) > 0 ? '+' : ''}฿{impact.totalCostChange}
                      </div>
                      <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                        ({parseFloat(impact.totalCostChangePercent) > 0 ? '+' : ''}{impact.totalCostChangePercent}%)
                      </div>
                    </div>
                  </div>

                  {/* Impact Details Grid */}
                  <div style={{ ...styles.grid, gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', marginBottom: '16px' }}>

                    <div style={{ background: 'rgba(249, 250, 251, 0.8)', padding: '12px', borderRadius: '8px', textAlign: 'center' }}>
                      <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '2px' }}>Old Recipe Cost</div>
                      <div style={{ fontSize: '1rem', fontWeight: 'bold', color: '#374151' }}>฿{impact.oldTotalCost}</div>
                    </div>

                    <div style={{ background: 'rgba(249, 250, 251, 0.8)', padding: '12px', borderRadius: '8px', textAlign: 'center' }}>
                      <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '2px' }}>New Recipe Cost</div>
                      <div style={{ fontSize: '1rem', fontWeight: 'bold', color: parseFloat(impact.totalCostChange) > 0 ? '#dc2626' : '#059669' }}>
                        ฿{impact.newTotalCost}
                      </div>
                    </div>

                    <div style={{ background: 'rgba(249, 250, 251, 0.8)', padding: '12px', borderRadius: '8px', textAlign: 'center' }}>
                      <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '2px' }}>Old Suggested Price</div>
                      <div style={{ fontSize: '1rem', fontWeight: 'bold', color: '#374151' }}>฿{impact.oldSuggestedPrice}</div>
                    </div>

                    <div style={{ background: 'rgba(249, 250, 251, 0.8)', padding: '12px', borderRadius: '8px', textAlign: 'center' }}>
                      <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '2px' }}>New Suggested Price</div>
                      <div style={{ fontSize: '1rem', fontWeight: 'bold', color: parseFloat(impact.priceAdjustment) > 0 ? '#dc2626' : '#059669' }}>
                        ฿{impact.newSuggestedPrice}
                      </div>
                    </div>

                    <div style={{ background: 'rgba(249, 250, 251, 0.8)', padding: '12px', borderRadius: '8px', textAlign: 'center' }}>
                      <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '2px' }}>Pour Cost Change</div>
                      <div style={{ fontSize: '1rem', fontWeight: 'bold', color: '#374151' }}>
                        {impact.oldPourCost}% → {impact.newPourCost}%
                      </div>
                    </div>
                  </div>

                  {/* Recommendations */}
                  <div style={{
                    background: parseFloat(impact.priceAdjustment) > 0 ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                    border: `1px solid ${parseFloat(impact.priceAdjustment) > 0 ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)'}`,
                    borderRadius: '8px',
                    padding: '12px'
                  }}>
                    <div style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '4px', color: '#374151' }}>
                      💡 Recommendation:
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#4b5563' }}>
                      {parseFloat(impact.priceAdjustment) > 0
                        ? `Consider increasing menu price by ฿${impact.priceAdjustment} to maintain target margins.`
                        : parseFloat(impact.priceAdjustment) < 0
                          ? `You could reduce menu price by ฿${Math.abs(parseFloat(impact.priceAdjustment))} or maintain current pricing for higher margins.`
                          : 'No price adjustment needed - margins remain stable.'
                      }
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', paddingTop: '16px', borderTop: '1px solid rgba(229, 231, 235, 0.5)' }}>
          <button
            onClick={onClose}
            style={{
              ...styles.button,
              background: 'linear-gradient(135deg, #6b7280, #4b5563)',
              fontSize: '0.875rem',
              padding: '12px 24px'
            }}
          >
            📋 Review Later
          </button>
          <button
            onClick={() => {
              onUpdatePrices();
              onClose();
            }}
            style={{
              ...styles.button,
              fontSize: '0.875rem',
              padding: '12px 24px'
            }}
          >
            ✅ Update Ingredient Price
          </button>
        </div>
      </div>
    </div>
  );
}
const [filter, setFilter] = useState('');
const [categoryFilter, setCategoryFilter] = useState('All');
const [editingIngredient, setEditingIngredient] = useState(null);
const [editForm, setEditForm] = useState({});
const [isSubmitting, setIsSubmitting] = useState(false);
const [message, setMessage] = useState({ type: '', text: '' });

const filteredIngredients = ingredients.filter(ingredient => {
  const matchesName = ingredient.name.toLowerCase().includes(filter.toLowerCase());
  const matchesCategory = categoryFilter === 'All' || ingredient.category === categoryFilter;
  return matchesName && matchesCategory;
});

const categories = ['All', ...Object.keys(CATEGORY_TARGETS)];

const exportIngredients = () => {
  const exportData = filteredIngredients.map(ing => ({
    name: ing.name,
    category: ing.category,
    quantity: ing.purchase_unit_qty,
    unit: ing.purchase_unit_type,
    price: ing.purchase_price,
    supplier: ing.supplier || '',
    costPerUnit: (ing.purchase_price / ing.purchase_unit_qty).toFixed(4),
    tags: ing.tags ? ing.tags.join(', ') : ''
  }));

  exportToCSV(exportData, 'ingredients_inventory.csv');
};

const handleEditClick = (ingredient) => {
  setEditingIngredient(ingredient.id);
  setEditForm({
    name: ingredient.name,
    purchase_unit_qty: ingredient.purchase_unit_qty,
    purchase_unit_type: ingredient.purchase_unit_type,
    purchase_price: ingredient.purchase_price,
    category: ingredient.category,
    supplier: ingredient.supplier || '',
    tags: ingredient.tags ? ingredient.tags.join(', ') : ''
  });
  setMessage({ type: '', text: '' });
};

const handleCancelEdit = () => {
  setEditingIngredient(null);
  setEditForm({});
  setMessage({ type: '', text: '' });
};

const handleFormChange = (field, value) => {
  setEditForm(prev => ({ ...prev, [field]: value }));
};

const handleSaveEdit = async () => {
  setIsSubmitting(true);
  setMessage({ type: '', text: '' });

  try {
    if (!editForm.name.trim() || !editForm.purchase_unit_qty || !editForm.purchase_price) {
      throw new Error('Please fill all required fields');
    }

    const tagsArray = editForm.tags.split(',').map(t => t.trim()).filter(t => t);
    const updateData = {
      name: editForm.name.trim(),
      purchase_unit_qty: parseFloat(editForm.purchase_unit_qty),
      purchase_unit_type: editForm.purchase_unit_type,
      purchase_price: parseFloat(editForm.purchase_price),
      category: editForm.category,
      supplier: editForm.supplier.trim(),
      tags: tagsArray,
      date_updated: new Date().toISOString()
    };

    const { error } = await supabase
      .from('ingredients')
      .update(updateData)
      .eq('id', editingIngredient);

    if (error) throw error;

    setMessage({ type: 'success', text: `✅ "${editForm.name}" updated successfully!` });
    setEditingIngredient(null);
    setEditForm({});
    if (onRefresh) onRefresh();
  } catch (err) {
    setMessage({ type: 'error', text: `❌ Error: ${err.message}` });
  } finally {
    setIsSubmitting(false);
  }
};

const handleDeleteIngredient = async (ingredient) => {
  if (!window.confirm(`Are you sure you want to delete "${ingredient.name}"? This action cannot be undone.`)) {
    return;
  }

  try {
    const { error } = await supabase
      .from('ingredients')
      .delete()
      .eq('id', ingredient.id);

    if (error) throw error;

    alert(`🗑️ "${ingredient.name}" deleted successfully!`);
    if (onRefresh) onRefresh();
  } catch (err) {
    alert(`❌ Error deleting ingredient: ${err.message}`);
  }
};

return (
  <div style={{ ...styles.card, maxWidth: '1200px' }}>
    <div style={styles.cardHeader}>
      <div style={{ ...styles.logo, background: 'linear-gradient(135deg, #9333ea, #ec4899)' }}>
        <MartiniIcon size={28} />
      </div>
      <div style={{ flex: 1 }}>
        <h2 style={{ ...styles.cardTitle, background: 'linear-gradient(135deg, #9333ea, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Ingredient Inventory
        </h2>
        <p style={styles.cardSubtitle}>Manage your beverage ingredients • MargaritaHotSauceLLC</p>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#6b7280', background: '#f3f4f6', padding: '8px 16px', borderRadius: '9999px' }}>
          {filteredIngredients.length} ingredients
        </span>
        <button onClick={exportIngredients} style={{ ...styles.button, background: 'linear-gradient(135deg, #10b981, #059669)', fontSize: '0.875rem', padding: '12px 20px' }}>
          📥 Export CSV
        </button>
      </div>
    </div>

    {message.text && (
      <div style={{
        ...styles.message,
        ...(message.type === 'success' ? styles.messageSuccess : styles.messageError)
      }}>
        {message.text}
      </div>
    )}

    <div style={{ ...styles.message, ...styles.messageInfo, marginBottom: '32px' }}>
      ✏️ <strong>Click any ingredient</strong> to edit prices, supplier info, or details. Perfect for updating costs from new invoices!
    </div>

    <div style={{ display: 'flex', gap: '24px', marginBottom: '32px' }}>
      <div style={{ position: 'relative', flex: 1 }}>
        <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }}>🔍</span>
        <input
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Search ingredients..."
          style={{ ...styles.input, paddingLeft: '48px', margin: 0 }}
        />
      </div>

      <select
        value={categoryFilter}
        onChange={(e) => setCategoryFilter(e.target.value)}
        style={{ ...styles.input, width: '200px', margin: 0 }}
      >
        {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
      </select>
    </div>

    <div style={{ ...styles.grid, ...styles.gridCols2 }}>
      {filteredIngredients.map(ingredient => {
        const isEditing = editingIngredient === ingredient.id;
        const costPerUnit = (ingredient.purchase_price / ingredient.purchase_unit_qty).toFixed(4);

        return (
          <div
            key={ingredient.id}
            style={{
              ...styles.ingredientCard,
              ...(isEditing ? styles.ingredientCardEditing : {}),
              ':hover': !isEditing ? { borderColor: '#3b82f6', transform: 'translateY(-2px)' } : {}
            }}
            onClick={() => !isEditing && handleEditClick(ingredient)}
          >
            {isEditing ? (
              <div>
                <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ margin: 0, color: '#9333ea', fontWeight: 'bold' }}>✏️ Editing Ingredient</h3>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleCancelEdit(); }}
                    style={{ background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', padding: '8px 12px', cursor: 'pointer' }}
                  >
                    ❌ Cancel
                  </button>
                </div>

                <div style={{ ...styles.grid, gap: '12px' }}>
                  <input
                    value={editForm.name}
                    onChange={(e) => handleFormChange('name', e.target.value)}
                    placeholder="Ingredient name"
                    style={{ ...styles.input, margin: 0, padding: '12px' }}
                  />

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                    <input
                      type="number"
                      step="0.01"
                      value={editForm.purchase_unit_qty}
                      onChange={(e) => handleFormChange('purchase_unit_qty', e.target.value)}
                      placeholder="Qty"
                      style={{ ...styles.input, margin: 0, padding: '8px' }}
                    />
                    <select
                      value={editForm.purchase_unit_type}
                      onChange={(e) => handleFormChange('purchase_unit_type', e.target.value)}
                      style={{ ...styles.input, margin: 0, padding: '8px' }}
                    >
                      {['ml', 'cl', 'oz', 'fl oz', 'cup', 'pint', 'quart', 'gallon', 'l', 'shot', 'jigger', 'bottle', 'can', 'mg', 'g', 'oz (weight)', 'kg', 'lb', 'unit', 'piece', 'each', 'dozen'].map(unit =>
                        <option key={unit} value={unit}>{unit}</option>
                      )}
                    </select>
                    <input
                      type="number"
                      step="0.01"
                      value={editForm.purchase_price}
                      onChange={(e) => handleFormChange('purchase_price', e.target.value)}
                      placeholder="Price"
                      style={{ ...styles.input, margin: 0, padding: '8px' }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <select
                      value={editForm.category}
                      onChange={(e) => handleFormChange('category', e.target.value)}
                      style={{ ...styles.input, margin: 0, padding: '8px' }}
                    >
                      {Object.keys(CATEGORY_TARGETS).map(cat =>
                        <option key={cat} value={cat}>{cat}</option>
                      )}
                    </select>
                    <input
                      value={editForm.supplier}
                      onChange={(e) => handleFormChange('supplier', e.target.value)}
                      placeholder="Supplier"
                      style={{ ...styles.input, margin: 0, padding: '8px' }}
                    />
                  </div>

                  <input
                    value={editForm.tags}
                    onChange={(e) => handleFormChange('tags', e.target.value)}
                    placeholder="Tags (comma separated)"
                    style={{ ...styles.input, margin: 0, padding: '8px' }}
                  />

                  <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleSaveEdit(); }}
                      disabled={isSubmitting}
                      style={{ ...styles.button, fontSize: '0.875rem', padding: '8px 16px', flex: 1 }}
                    >
                      💾 {isSubmitting ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDeleteIngredient(ingredient); }}
                      style={{ ...styles.button, background: 'linear-gradient(135deg, #ef4444, #dc2626)', fontSize: '0.875rem', padding: '8px 16px' }}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 'bold', color: '#374151' }}>{ingredient.name}</h3>
                  <span style={{ ...styles.badge, background: '#3b82f6' }}>{ingredient.category}</span>
                </div>

                <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '12px' }}>
                  <div><strong>Package:</strong> {ingredient.purchase_unit_qty} {ingredient.purchase_unit_type} @ ฿{ingredient.purchase_price}</div>
                  <div><strong>Cost per unit:</strong> ฿{costPerUnit} per {ingredient.purchase_unit_type}</div>
                  {ingredient.supplier && <div><strong>Supplier:</strong> {ingredient.supplier}</div>}
                </div>

                {ingredient.tags && ingredient.tags.length > 0 && (
                  <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '8px' }}>
                    {ingredient.tags.map((tag, i) => (
                      <span key={i} style={{ ...styles.badge, background: '#10b981', fontSize: '0.75rem' }}>{tag}</span>
                    ))}
                  </div>
                )}

                <div style={{ marginTop: '12px', padding: '8px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '8px', fontSize: '0.75rem', color: '#1d4ed8', textAlign: 'center' }}>
                  💡 Click to edit price, supplier, or details
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  </div>
);
}

function SavedRecipes({ recipes, ingredients, onRecipeEdit }) {
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [searchFilter, setSearchFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [ingredientFilter, setIngredientFilter] = useState('All');

  const handleRecipeClick = (recipe) => {
    setSelectedRecipe(recipe);
  };

  const closeModal = () => {
    setSelectedRecipe(null);
  };

  const calculateRecipeCost = (recipe) => {
    if (!recipe.recipe_ingredients || !ingredients) return null;

    let totalCost = 0;
    recipe.recipe_ingredients.forEach(ri => {
      const ingredient = ingredients.find(i => i.id === ri.ingredient_id);
      if (ingredient) {
        const unitCost = getUnitCostInTargetUnit(ingredient, ri.unit_type);
        totalCost += ri.amount_used * unitCost;
      }
    });

    const targets = CATEGORY_TARGETS[recipe.category] || CATEGORY_TARGETS['Classic Cocktails'];
    const suggestedPrice = totalCost * targets.markup;

    return {
      totalCost: totalCost.toFixed(2),
      suggestedPrice: suggestedPrice.toFixed(2),
      margin: ((suggestedPrice - totalCost) / suggestedPrice * 100).toFixed(1)
    };
  };

  // ENHANCED FILTERING LOGIC
  const filteredRecipes = recipes.filter(recipe => {
    // Search by recipe name
    const matchesSearch = recipe.name.toLowerCase().includes(searchFilter.toLowerCase());

    // Filter by recipe category
    const matchesCategory = categoryFilter === 'All' || recipe.category === categoryFilter;

    // Filter by ingredient - check if recipe contains the selected ingredient
    let matchesIngredient = true;
    if (ingredientFilter !== 'All') {
      const hasIngredient = recipe.recipe_ingredients?.some(ri => {
        const ingredient = ingredients.find(i => i.id === ri.ingredient_id);
        return ingredient && ingredient.name.toLowerCase().includes(ingredientFilter.toLowerCase());
      });
      matchesIngredient = hasIngredient;
    }

    // Also search within ingredient names (for text search like "vodka")
    let matchesIngredientSearch = true;
    if (searchFilter.trim()) {
      const searchInIngredients = recipe.recipe_ingredients?.some(ri => {
        const ingredient = ingredients.find(i => i.id === ri.ingredient_id);
        return ingredient && ingredient.name.toLowerCase().includes(searchFilter.toLowerCase());
      });
      matchesIngredientSearch = matchesSearch || searchInIngredients;
    }

    return matchesIngredientSearch && matchesCategory && matchesIngredient;
  });

  // Get unique recipe categories
  const recipeCategories = ['All', ...new Set(recipes.map(recipe => recipe.category))];

  // Get unique ingredients from all recipes for the ingredient filter
  const allRecipeIngredients = ['All'];
  recipes.forEach(recipe => {
    if (recipe.recipe_ingredients) {
      recipe.recipe_ingredients.forEach(ri => {
        const ingredient = ingredients.find(i => i.id === ri.ingredient_id);
        if (ingredient && !allRecipeIngredients.includes(ingredient.name)) {
          allRecipeIngredients.push(ingredient.name);
        }
      });
    }
  });
  allRecipeIngredients.sort();

  // Clear filters function
  const clearFilters = () => {
    setSearchFilter('');
    setCategoryFilter('All');
    setIngredientFilter('All');
  };

  // Export filtered recipes
  const exportFilteredRecipes = () => {
    const exportData = filteredRecipes.map(recipe => {
      const cost = calculateRecipeCost(recipe);
      const ingredientsList = recipe.recipe_ingredients?.map(ri => {
        const ingredient = ingredients.find(i => i.id === ri.ingredient_id);
        return ingredient ? `${ri.amount_used}${ri.unit_type} ${ingredient.name}` : '';
      }).join(', ') || '';

      return {
        name: recipe.name,
        category: recipe.category,
        ingredients: ingredientsList,
        totalCost: cost?.totalCost || 'N/A',
        suggestedPrice: cost?.suggestedPrice || 'N/A',
        margin: cost?.margin || 'N/A',
        updated: new Date(recipe.updated_at).toLocaleDateString()
      };
    });

    exportToCSV(exportData, `filtered_recipes_${new Date().toISOString().split('T')[0]}.csv`);
  };

  return (
    <div style={{ ...styles.card, maxWidth: '1200px' }}>
      <div style={styles.cardHeader}>
        <div style={{ ...styles.logo, background: 'linear-gradient(135deg, #ec4899, #be185d)' }}>
          <MartiniIcon size={28} />
        </div>
        <div style={{ flex: 1 }}>
          <h2 style={{ ...styles.cardTitle, background: 'linear-gradient(135deg, #ec4899, #be185d)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Recipe Collection & Search
          </h2>
          <p style={styles.cardSubtitle}>Search by name, ingredient, or category • MargaritaHotSauceLLC</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#6b7280', background: '#f3f4f6', padding: '8px 16px', borderRadius: '9999px' }}>
            {filteredRecipes.length} of {recipes.length} recipes
          </span>
          {filteredRecipes.length > 0 && (
            <button onClick={exportFilteredRecipes} style={{ ...styles.button, background: 'linear-gradient(135deg, #10b981, #059669)', fontSize: '0.875rem', padding: '12px 20px' }}>
              📥 Export Results
            </button>
          )}
        </div>
      </div>

      {/* ENHANCED SEARCH AND FILTER SECTION */}
      <div style={{ ...styles.message, ...styles.messageInfo, marginBottom: '24px' }}>
        🔍 <strong>Smart Recipe Search:</strong> Search by recipe name OR ingredient (try "vodka", "gin", "lime"). Filter by category or specific ingredients. Click any recipe to view full details and cost analysis.
      </div>

      {/* Search Bar */}
      <div style={{ position: 'relative', marginBottom: '24px' }}>
        <span style={{
          position: 'absolute',
          left: '16px',
          top: '50%',
          transform: 'translateY(-50%)',
          color: '#9ca3af',
          fontSize: '1.2rem'
        }}>
          🔍
        </span>
        <input
          type="text"
          value={searchFilter}
          onChange={(e) => setSearchFilter(e.target.value)}
          placeholder="Search recipes or ingredients... (e.g., 'vodka', 'martini', 'gin')"
          style={{
            ...styles.input,
            paddingLeft: '48px',
            margin: 0,
            fontSize: '1rem'
          }}
        />
      </div>

      {/* Filter Controls */}
      <div style={{ ...styles.grid, ...styles.gridCols3, marginBottom: '24px' }}>
        <div>
          <label style={{ fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '8px', display: 'block' }}>
            Recipe Category
          </label>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            style={{ ...styles.input, margin: 0 }}
          >
            {recipeCategories.map(cat => (
              <option key={cat} value={cat}>
                {cat} {cat !== 'All' && `(${recipes.filter(r => r.category === cat).length})`}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '8px', display: 'block' }}>
            Contains Ingredient
          </label>
          <select
            value={ingredientFilter}
            onChange={(e) => setIngredientFilter(e.target.value)}
            style={{ ...styles.input, margin: 0 }}
          >
            {allRecipeIngredients.map(ingredient => (
              <option key={ingredient} value={ingredient}>
                {ingredient}
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'end', gap: '8px' }}>
          <button
            onClick={clearFilters}
            style={{
              ...styles.buttonSecondary,
              ...styles.button,
              fontSize: '0.875rem',
              padding: '12px 20px'
            }}
          >
            🗑️ Clear Filters
          </button>
        </div>
      </div>

      {/* Active Filters Display */}
      {(searchFilter || categoryFilter !== 'All' || ingredientFilter !== 'All') && (
        <div style={{
          background: 'rgba(59, 130, 246, 0.1)',
          border: '1px solid rgba(59, 130, 246, 0.2)',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '24px'
        }}>
          <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#1d4ed8', marginBottom: '8px' }}>
            Active Filters:
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {searchFilter && (
              <span style={{ ...styles.badge, background: '#3b82f6' }}>
                Search: "{searchFilter}"
              </span>
            )}
            {categoryFilter !== 'All' && (
              <span style={{ ...styles.badge, background: '#8b5cf6' }}>
                Category: {categoryFilter}
              </span>
            )}
            {ingredientFilter !== 'All' && (
              <span style={{ ...styles.badge, background: '#10b981' }}>
                Ingredient: {ingredientFilter}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Results Section */}
      {filteredRecipes.length === 0 && recipes.length > 0 ? (
        <div style={{ textAlign: 'center', padding: '48px', color: '#6b7280' }}>
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🔍</div>
          <h3>No recipes found</h3>
          <p>Try adjusting your search terms or filters</p>
          <button
            onClick={clearFilters}
            style={{
              ...styles.button,
              fontSize: '0.875rem',
              padding: '12px 20px',
              marginTop: '16px'
            }}
          >
            Clear All Filters
          </button>
        </div>
      ) : filteredRecipes.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px', color: '#6b7280' }}>
          <MartiniIcon size={48} />
          <h3 style={{ marginTop: '16px', marginBottom: '8px' }}>No recipes saved yet</h3>
          <p>Create your first recipe using the Recipe Builder!</p>
        </div>
      ) : (
        <div style={{ ...styles.grid, ...styles.gridCols2 }}>
          {filteredRecipes.map(recipe => {
            const cost = calculateRecipeCost(recipe);
            const recipeIngredients = recipe.recipe_ingredients?.map(ri => {
              const ingredient = ingredients.find(i => i.id === ri.ingredient_id);
              return ingredient ? ingredient.name : '';
            }).filter(name => name).join(', ') || 'No ingredients';

            return (
              <div
                key={recipe.id}
                style={{
                  ...styles.ingredientCard,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  ':hover': { borderColor: '#3b82f6', transform: 'translateY(-2px)' }
                }}
                onClick={() => handleRecipeClick(recipe)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 'bold', color: '#374151' }}>{recipe.name}</h3>
                  <span style={{ ...styles.badge, background: '#ec4899' }}>{recipe.category}</span>
                </div>

                {/* Recipe Ingredients Preview */}
                <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '12px', background: 'rgba(249, 250, 251, 0.5)', padding: '8px', borderRadius: '8px' }}>
                  <div style={{ fontWeight: '600', marginBottom: '4px' }}>Ingredients:</div>
                  <div style={{ fontSize: '0.75rem', lineHeight: '1.4' }}>{recipeIngredients}</div>
                </div>

                {cost && (
                  <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '12px' }}>
                    <div><strong>Cost:</strong> ฿{cost.totalCost} | <strong>Suggested:</strong> ฿{cost.suggestedPrice}</div>
                    <div><strong>Margin:</strong> {cost.margin}%</div>
                  </div>
                )}

                <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '12px' }}>
                  <div><strong>Ingredients:</strong> {recipe.recipe_ingredients ? recipe.recipe_ingredients.length : 0}</div>
                  <div><strong>Updated:</strong> {new Date(recipe.updated_at).toLocaleDateString()}</div>
                </div>

                <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                  <button
                    onClick={(e) => { e.stopPropagation(); onRecipeEdit(recipe); }}
                    style={{ ...styles.button, fontSize: '0.75rem', padding: '6px 12px', flex: 1 }}
                  >
                    ✏️ Edit Recipe
                  </button>
                </div>

                <div style={{ marginTop: '8px', padding: '8px', background: 'rgba(236, 72, 153, 0.1)', borderRadius: '8px', fontSize: '0.75rem', color: '#be185d', textAlign: 'center' }}>
                  💡 Click to view full details
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Recipe Detail Modal */}
      {selectedRecipe && (
        <div style={styles.modal} onClick={closeModal}>
          <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold', color: '#374151' }}>{selectedRecipe.name}</h2>
              <button
                onClick={closeModal}
                style={{ background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', padding: '8px 12px', cursor: 'pointer' }}
              >
                ✕ Close
              </button>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <span style={{ ...styles.badge, background: '#ec4899', marginRight: '8px' }}>{selectedRecipe.category}</span>
              <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                Updated: {new Date(selectedRecipe.updated_at).toLocaleDateString()}
              </span>
            </div>

            {selectedRecipe.instructions && (
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '8px', color: '#374151' }}>Instructions</h3>
                <p style={{ fontSize: '0.875rem', color: '#6b7280', lineHeight: '1.6' }}>{selectedRecipe.instructions}</p>
              </div>
            )}

            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '12px', color: '#374151' }}>Ingredients</h3>
              {selectedRecipe.recipe_ingredients && selectedRecipe.recipe_ingredients.map((ri, index) => {
                const ingredient = ingredients.find(i => i.id === ri.ingredient_id);
                if (!ingredient) return null;

                const unitCost = getUnitCostInTargetUnit(ingredient, ri.unit_type);
                const itemCost = ri.amount_used * unitCost;
                const showConversion = ingredient.purchase_unit_type !== ri.unit_type;

                return (
                  <div key={index} style={{ padding: '12px', background: 'rgba(249, 250, 251, 0.5)', borderRadius: '8px', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: '600', color: '#374151' }}>{ingredient.name}</div>
                        <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                          {ri.amount_used} {ri.unit_type}
                          {showConversion && (
                            <span style={{ color: '#3b82f6' }}> (converted from {ingredient.purchase_unit_type})</span>
                          )}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 'bold', color: '#10b981' }}>฿{itemCost.toFixed(2)}</div>
                        <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>@฿{unitCost.toFixed(4)}/{ri.unit_type}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {(() => {
              const cost = calculateRecipeCost(selectedRecipe);
              if (!cost) return null;

              return (
                <div style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)', borderRadius: '16px', padding: '24px' }}>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '16px', color: '#1d4ed8' }}>Cost Analysis</h3>
                  <div style={{ ...styles.grid, ...styles.gridCols3 }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ef4444' }}>฿{cost.totalCost}</div>
                      <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Total Cost</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#10b981' }}>฿{cost.suggestedPrice}</div>
                      <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Suggested Price</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#2563eb' }}>{cost.margin}%</div>
                      <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Gross Margin</div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [activeTab, setActiveTab] = useState('add');
  const [ingredients, setIngredients] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [editingRecipe, setEditingRecipe] = useState(null);

  const tabs = [
    { id: 'add', label: 'Add Ingredients', icon: '🧪' },
    { id: 'recipes', label: 'Recipe Builder', icon: '🍸' },
    { id: 'inventory', label: 'Inventory', icon: '📦' },
    { id: 'saved', label: 'Saved Recipes', icon: '📋' }
  ];

  const fetchIngredients = async () => {
    try {
      const { data, error } = await supabase.from('ingredients').select('*').order('name');
      if (error) throw error;
      setIngredients(data || []);
    } catch (error) {
      console.error('Error fetching ingredients:', error);
    }
  };

  const fetchRecipes = async () => {
    try {
      const { data, error } = await supabase
        .from('recipes')
        .select(`
          *,
          recipe_ingredients (
            ingredient_id,
            amount_used,
            unit_type
          )
        `)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setRecipes(data || []);
    } catch (error) {
      console.error('Error fetching recipes:', error);
    }
  };

  const handleRecipeEdit = (recipe) => {
    setEditingRecipe(recipe);
    setActiveTab('recipes');
  };

  const handleCancelEdit = () => {
    setEditingRecipe(null);
  };

  useEffect(() => {
    fetchIngredients();
    fetchRecipes();
  }, []);

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <div style={styles.logo}>
            <MartiniIcon size={32} />
          </div>
          <div>
            <h1 style={styles.title}>Beverage Metrics Tool</h1>
            <p style={styles.subtitle}>by MargaritaHotSauceLLC • Professional recipe costing and pricing calculator</p>
          </div>
        </div>
      </header>

      <nav style={styles.nav}>
        <div style={styles.navContent}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                ...styles.navButton,
                ...(activeTab === tab.id ? styles.navButtonActive : styles.navButtonInactive)
              }}
            >
              <span style={{ fontSize: '1.25rem' }}>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </nav>

      <main style={styles.main}>
        {activeTab === 'add' && <AddIngredientForm onIngredientAdded={fetchIngredients} />}
        {activeTab === 'recipes' && <RecipeBuilder ingredients={ingredients} onRecipeSaved={fetchRecipes} editingRecipe={editingRecipe} onCancelEdit={handleCancelEdit} />}
        {activeTab === 'inventory' && <IngredientsList ingredients={ingredients} onRefresh={fetchIngredients} />}
        {activeTab === 'saved' && <SavedRecipes recipes={recipes} ingredients={ingredients} onRecipeEdit={handleRecipeEdit} />}
      </main>
    </div>
  );
}