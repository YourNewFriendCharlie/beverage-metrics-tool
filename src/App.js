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

// Unit conversion system
const UNIT_CONVERSIONS = {
  // Volume conversions (base: ml)
  'ml': { toBase: 1, type: 'volume' },
  'l': { toBase: 1000, type: 'volume' },
  'cl': { toBase: 10, type: 'volume' },
  'oz': { toBase: 29.5735, type: 'volume' },
  'bottle': { toBase: 750, type: 'volume' }, // Standard wine bottle
  'can': { toBase: 330, type: 'volume' }, // Standard beer can

  // Weight conversions (base: g)
  'g': { toBase: 1, type: 'weight' },
  'kg': { toBase: 1000, type: 'weight' },
  'lb': { toBase: 453.592, type: 'weight' },

  // Count conversions (base: unit)
  'unit': { toBase: 1, type: 'count' }
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
    transition: 'all 0.3s ease'
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
  }
};

function AddIngredientForm({ onIngredientAdded }) {
  const [formData, setFormData] = useState({
    name: '', purchase_unit_qty: '', purchase_unit_type: 'ml',
    purchase_price: '', category: 'Spirit', tags: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const unitTypes = ['ml', 'oz', 'l', 'cl', 'unit', 'bottle', 'can', 'kg', 'g', 'lb'];
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
        tags: tagsArray,
        date_updated: new Date().toISOString()
      };

      const { error } = await supabase.from('ingredients').insert([ingredientData]).select();
      if (error) throw error;

      setFormData({ name: '', purchase_unit_qty: '', purchase_unit_type: 'ml', purchase_price: '', category: 'Spirit', tags: '' });
      setMessage({ type: 'success', text: `🍸 "${ingredientData.name}" saved to database with smart unit conversion enabled!` });
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
            name="tags"
            value={formData.tags}
            onChange={handleInputChange}
            placeholder="Tags: premium, imported, organic"
            style={styles.input}
          />
        </div>

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

function RecipeBuilder({ ingredients, onRecipeSaved }) {
  const [recipeName, setRecipeName] = useState('');
  const [recipeCategory, setRecipeCategory] = useState('Classic Cocktails');
  const [instructions, setInstructions] = useState('');
  const [selectedItems, setSelectedItems] = useState([{ ingredient_id: '', amount_used: '', unit: 'ml' }]);
  const [calculations, setCalculations] = useState(null);
  const [showBatchTool, setShowBatchTool] = useState(false);
  const [batchSize, setBatchSize] = useState(10);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    const maxPourCost = (totalCost / minPrice) * 100;

    setCalculations({
      totalCost: totalCost.toFixed(2),
      minPrice: minPrice.toFixed(2),
      maxPrice: maxPrice.toFixed(2),
      suggestedPrice: suggestedPrice.toFixed(2),
      minPourCost: minPourCost.toFixed(1),
      maxPourCost: maxPourCost.toFixed(1),
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
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data: recipe, error: recipeError } = await supabase
        .from('recipes')
        .insert([recipeData])
        .select();

      if (recipeError) throw recipeError;

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

      alert(`🍸 Recipe "${recipeName}" saved to database with smart unit conversions!`);
      if (onRecipeSaved) onRecipeSaved();

      setRecipeName('');
      setInstructions('');
      setSelectedItems([{ ingredient_id: '', amount_used: '', unit: 'ml' }]);
      setCalculations(null);
    } catch (error) {
      alert(`❌ Error saving recipe: ${error.message}`);
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
        <div style={{ ...styles.logo, background: 'linear-gradient(135deg, #10b981, #2563eb)' }}>
          <MartiniIcon size={28} />
        </div>
        <div style={{ flex: 1 }}>
          <h2 style={{ ...styles.cardTitle, background: 'linear-gradient(135deg, #10b981, #2563eb)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Recipe Builder & Cost Calculator
          </h2>
          <p style={styles.cardSubtitle}>Create and analyze beverage recipes • MargaritaHotSauceLLC</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={saveRecipe} disabled={isSubmitting} style={{ ...styles.button, fontSize: '0.875rem', padding: '12px 20px' }}>
            💾 Save Recipe
          </button>
          <button onClick={exportRecipe} disabled={!calculations} style={{ ...styles.buttonSecondary, ...styles.button, fontSize: '0.875rem' }}>
            📥 Export
          </button>
        </div>
      </div>

      <div style={{ ...styles.message, ...styles.messageInfo, marginBottom: '24px' }}>
        🔄 <strong>Auto Unit Conversion:</strong> Mix units freely! Use 30ml gin + 1oz vermouth + 2cl olive brine - the app handles all conversions automatically.
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
                <select
                  value={item.ingredient_id}
                  onChange={e => handleChange(index, 'ingredient_id', e.target.value)}
                  style={{ ...styles.input, margin: 0, padding: '12px' }}
                >
                  <option value="">Select Ingredient</option>
                  {ingredients.map(ing => (
                    <option key={ing.id} value={ing.id}>{ing.name} ({ing.category}) - {ing.purchase_unit_type}</option>
                  ))}
                </select>

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
                  <option value="oz">oz</option>
                  <option value="l">l</option>
                  <option value="cl">cl</option>
                  <option value="g">g</option>
                  <option value="kg">kg</option>
                  <option value="unit">unit</option>
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
    </div>
  );
}

function IngredientsList({ ingredients, onRefresh }) {
  const [filter, setFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

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
      costPerUnit: (ing.purchase_price / ing.purchase_unit_qty).toFixed(4),
      tags: ing.tags ? ing.tags.join(', ') : ''
    }));

    exportToCSV(exportData, 'ingredients_inventory.csv');
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

      <div style={{ display: 'flex', gap: '24px', marginBottom: '32px' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }}>🔍</span>
          <input
            type="text"
            placeholder="Search ingredients..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={{ ...styles.input, paddingLeft: '48px' }}
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          style={{ ...styles.input, minWidth: '192px' }}
        >
          {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
        </select>
      </div>

      <div style={{ ...styles.grid, gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
        {filteredIngredients.map(ingredient => (
          <div key={ingredient.id} style={{ ...styles.ingredientCard, cursor: 'pointer' }} onMouseEnter={(e) => e.target.style.transform = 'scale(1.02)'} onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <h3 style={{ fontWeight: 'bold', color: '#374151', fontSize: '1.125rem', margin: 0, flex: 1 }}>{ingredient.name}</h3>
              <span style={{
                ...styles.badge,
                background: ingredient.category === 'Spirit' ? 'linear-gradient(135deg, #ef4444, #dc2626)' :
                  ingredient.category === 'Classic Cocktails' ? 'linear-gradient(135deg, #f59e0b, #ea580c)' :
                    ingredient.category === 'House Cocktails' ? 'linear-gradient(135deg, #9333ea, #7c3aed)' :
                      ingredient.category === 'Wine' ? 'linear-gradient(135deg, #9333ea, #ec4899)' :
                        ingredient.category === 'Beer' ? 'linear-gradient(135deg, #f59e0b, #d97706)' :
                          ingredient.category === 'Coffee' ? 'linear-gradient(135deg, #d97706, #92400e)' :
                            'linear-gradient(135deg, #2563eb, #1d4ed8)'
              }}>
                {ingredient.category}
              </span>
            </div>

            <div style={{ fontSize: '0.875rem', color: '#6b7280', lineHeight: '1.5' }}>
              <div style={{ background: 'rgba(249, 250, 251, 0.5)', padding: '12px', borderRadius: '12px', marginBottom: '12px' }}>
                <div style={{ fontWeight: '500' }}>฿{ingredient.purchase_price} per {ingredient.purchase_unit_qty}{ingredient.purchase_unit_type}</div>
              </div>
              <div style={{ fontWeight: 'bold', color: '#10b981', background: 'rgba(16, 185, 129, 0.1)', padding: '12px', borderRadius: '12px' }}>
                ฿{(ingredient.purchase_price / ingredient.purchase_unit_qty).toFixed(4)} per {ingredient.purchase_unit_type}
              </div>

              {/* Show common unit conversions */}
              <div style={{ marginTop: '12px', padding: '12px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '12px' }}>
                <div style={{ fontWeight: '600', color: '#1d4ed8', marginBottom: '8px' }}>Smart Conversions:</div>
                {UNIT_CONVERSIONS[ingredient.purchase_unit_type]?.type === 'volume' && (
                  <div style={{ fontSize: '0.75rem', color: '#1d4ed8' }}>
                    ml: ฿{getUnitCostInTargetUnit(ingredient, 'ml').toFixed(4)} |
                    oz: ฿{getUnitCostInTargetUnit(ingredient, 'oz').toFixed(4)} |
                    cl: ฿{getUnitCostInTargetUnit(ingredient, 'cl').toFixed(4)}
                  </div>
                )}
              </div>

              {ingredient.tags && ingredient.tags.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '12px' }}>
                  {ingredient.tags.map((tag, index) => (
                    <span key={index} style={{
                      background: 'linear-gradient(135deg, #e5e7eb, #d1d5db)',
                      color: '#374151',
                      padding: '4px 12px',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      fontWeight: '500'
                    }}>
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredIngredients.length === 0 && (
        <div style={{ textAlign: 'center', padding: '64px 0', color: '#6b7280' }}>
          <MartiniIcon size={64} />
          <p style={{ fontSize: '1.25rem', fontWeight: '500', margin: '24px 0 8px' }}>No ingredients found matching your search.</p>
          <p style={{ fontSize: '0.875rem', margin: 0 }}>Try adjusting your search terms or category filter.</p>
        </div>
      )}
    </div>
  );
}

function SavedRecipes({ recipes }) {
  const [filter, setFilter] = useState('');

  const filteredRecipes = recipes.filter(recipe =>
    recipe.name.toLowerCase().includes(filter.toLowerCase())
  );

  const exportRecipes = () => {
    const exportData = filteredRecipes.map(recipe => ({
      name: recipe.name,
      category: recipe.category,
      instructions: recipe.instructions || '',
      tags: recipe.tags ? recipe.tags.join(', ') : '',
      created: new Date(recipe.created_at).toLocaleDateString()
    }));

    exportToCSV(exportData, 'saved_recipes.csv');
  };

  return (
    <div style={{ ...styles.card, maxWidth: '1200px' }}>
      <div style={styles.cardHeader}>
        <div style={{ ...styles.logo, background: 'linear-gradient(135deg, #ea580c, #dc2626)' }}>
          <MartiniIcon size={28} />
        </div>
        <div style={{ flex: 1 }}>
          <h2 style={{ ...styles.cardTitle, background: 'linear-gradient(135deg, #ea580c, #dc2626)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Saved Recipes
          </h2>
          <p style={styles.cardSubtitle}>Your beverage recipe collection • MargaritaHotSauceLLC</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#6b7280', background: '#f3f4f6', padding: '8px 16px', borderRadius: '9999px' }}>
            {filteredRecipes.length} recipes
          </span>
          <button onClick={exportRecipes} style={{ ...styles.button, background: 'linear-gradient(135deg, #ea580c, #dc2626)', fontSize: '0.875rem', padding: '12px 20px' }}>
            📥 Export CSV
          </button>
        </div>
      </div>

      <div style={{ marginBottom: '32px' }}>
        <div style={{ position: 'relative' }}>
          <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }}>🔍</span>
          <input
            type="text"
            placeholder="Search recipes..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={{ ...styles.input, paddingLeft: '48px' }}
          />
        </div>
      </div>

      <div style={{ ...styles.grid, gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px' }}>
        {filteredRecipes.map(recipe => (
          <div key={recipe.id} style={{ ...styles.ingredientCard, cursor: 'pointer' }} onMouseEnter={(e) => e.target.style.transform = 'scale(1.02)'} onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <h3 style={{ fontWeight: 'bold', color: '#374151', fontSize: '1.125rem', margin: 0, flex: 1 }}>{recipe.name}</h3>
              <span style={{
                ...styles.badge,
                background: recipe.category === 'Spirit' ? 'linear-gradient(135deg, #ef4444, #dc2626)' :
                  recipe.category === 'Classic Cocktails' ? 'linear-gradient(135deg, #f59e0b, #ea580c)' :
                    recipe.category === 'House Cocktails' ? 'linear-gradient(135deg, #9333ea, #7c3aed)' :
                      recipe.category === 'Wine' ? 'linear-gradient(135deg, #9333ea, #ec4899)' :
                        recipe.category === 'Coffee' ? 'linear-gradient(135deg, #d97706, #92400e)' :
                          'linear-gradient(135deg, #2563eb, #1d4ed8)'
              }}>
                {recipe.category}
              </span>
            </div>

            <div style={{ fontSize: '0.875rem', color: '#6b7280', lineHeight: '1.5' }}>
              {recipe.instructions && (
                <p style={{ fontStyle: 'italic', background: 'rgba(249, 250, 251, 0.5)', padding: '12px', borderRadius: '12px', margin: '0 0 12px 0' }}>
                  "{recipe.instructions}"
                </p>
              )}
              <div style={{ fontSize: '0.75rem', color: '#9ca3af', fontWeight: '500' }}>
                Created: {new Date(recipe.created_at).toLocaleDateString()}
              </div>
              {recipe.tags && recipe.tags.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '12px' }}>
                  {recipe.tags.map((tag, index) => (
                    <span key={index} style={{
                      background: 'linear-gradient(135deg, #e5e7eb, #d1d5db)',
                      color: '#374151',
                      padding: '4px 12px',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      fontWeight: '500'
                    }}>
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredRecipes.length === 0 && (
        <div style={{ textAlign: 'center', padding: '64px 0', color: '#6b7280' }}>
          <MartiniIcon size={64} />
          <p style={{ fontSize: '1.25rem', fontWeight: '500', margin: '24px 0 8px' }}>No recipes found.</p>
          <p style={{ fontSize: '0.875rem', margin: 0 }}>Create your first recipe in the Recipe Builder!</p>
        </div>
      )}
    </div>
  );
}

function App() {
  const [ingredients, setIngredients] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [activeTab, setActiveTab] = useState('add');

  const fetchIngredients = async () => {
    try {
      const { data, error } = await supabase.from('ingredients').select('*').order('date_updated', { ascending: false });
      if (error) throw error;
      setIngredients(data || []);
    } catch (err) {
      console.error('Error fetching ingredients:', err);
    }
  };

  const fetchRecipes = async () => {
    try {
      const { data, error } = await supabase.from('recipes').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setRecipes(data || []);
    } catch (err) {
      console.error('Error fetching recipes:', err);
    }
  };

  useEffect(() => {
    fetchIngredients();
    fetchRecipes();
  }, []);

  const tabs = [
    { id: 'add', label: 'Add Ingredients', icon: '➕' },
    { id: 'recipes', label: 'Recipe Builder', icon: '🧮' },
    { id: 'inventory', label: 'Inventory', icon: '📦' },
    { id: 'saved', label: 'Saved Recipes', icon: '☕' }
  ];

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
        {activeTab === 'recipes' && <RecipeBuilder ingredients={ingredients} onRecipeSaved={fetchRecipes} />}
        {activeTab === 'inventory' && <IngredientsList ingredients={ingredients} onRefresh={fetchIngredients} />}
        {activeTab === 'saved' && <SavedRecipes recipes={recipes} />}
      </main>
    </div>
  );
}

export default App;