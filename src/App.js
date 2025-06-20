<div style={{
  ...styles.grid, gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '          <button onClick={saveRecipe} disabled={isSubmitting} style={{...styles.button, fontSize: '0.875rem', padding: '12px 20px'}}>
            💾 {editingRecipe ? 'Update Recipe' : 'Save Recipe'}
          </ button>
  <button onClick={exportRecipe} disabled={!calculations} style={{ ...styles.buttonSecondary, ...styles.button, fontSize: '0.875rem' }}>
    📥 Export
  </button>
</div>
      </div >

      <div style={{...styles.message, ...styles.messageInfo, marginBottom: '24px'}}>
        🔄 <strong>Auto Unit Conversion:</strong> Mix units freely! Use 30ml gin + 1oz vermouth + 2cl olive brine - the app handles all conversions automatically.
      </div>

      <div style={{...styles.grid, ...styles.gridCols2, marginBottom: '32px'}}>
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
        style={{...styles.input, marginBottom: '32px', resize: 'vertical'}}
      />

      <div style={{marginBottom: '32px'}}>
        <h3 style={{marginBottom: '16px', fontWeight: '600'}}>Recipe Ingredients</h3>
        {selectedItems.map((item, index) => {
          const ingredient = ingredients.find(i => i.id === item.ingredient_id);
          const showConversion = ingredient && item.unit && ingredient.purchase_unit_type !== item.unit;
          
          return (
            <div key={index} style={{marginBottom: '12px'}}>
              <div style={{display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: '12px', alignItems: 'center', padding: '16px', background: 'rgba(249, 250, 251, 0.5)', borderRadius: '12px'}}>
                <select
                  value={item.ingredient_id}
                  onChange={e => handleChange(index, 'ingredient_id', e.target.value)}
                  style={{...styles.input, margin: 0, padding: '12px'}}
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
                  style={{...styles.input, margin: 0, padding: '12px'}}
                />
                
                <select
                  value={item.unit}
                  onChange={e => handleChange(index, 'unit', e.target.value)}
                  style={{...styles.input, margin: 0, padding: '12px'}}
                >
                  <option value="ml">ml</option>
                  <option value="oz">oz</option>
                  <option value="l">l</option>
                  <option value="g">g</option>
                  <option value="kg">kg</option>
                  <option value="unit">unit</option>
                </select>
                
                {selectedItems.length > 1 && (
                  <button
                    onClick={() => removeIngredient(index)}
                    style={{padding: '8px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer'}}
                  >
                    🗑️
                  </button>
                )}
              </div>
              
              {showConversion && item.amount_used && (
                <div style={{marginTop: '8px', padding: '12px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '8px', fontSize: '0.875rem', color: '#1d4ed8'}}>
                  💡 Auto-converting: {ingredient.purchase_unit_type} → {item.unit} | Cost: ฿{getUnitCostInTargetUnit(ingredient, item.unit).toFixed(4)} per {item.unit}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div style={{display: 'flex', flexWrap: 'wrap', gap: '16px', marginBottom: '32px'}}>
        <button onClick={addIngredient} style={{...styles.buttonSecondary, ...styles.button, fontSize: '0.875rem'}}>
          ➕ Add Ingredient
        </button>
        
        <button onClick={calculateCost} style={{...styles.button, fontSize: '0.875rem'}}>
          🧮 Calculate Cost & Pricing
        </button>
        
        <button onClick={() => setShowBatchTool(!showBatchTool)} style={{...styles.button, background: 'linear-gradient(135deg, #9333ea, #ec4899)', fontSize: '0.875rem'}}>
          📊 Batch Tool
        </button>
      </div>

{
  showBatchTool && calculations && (
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
  )
}

{
  calculations && (
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
  )
}
    </div >
  );
}

function IngredientsList({ ingredients, onRefresh }) {
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
          <div key={ingredient.id}>
            {editingIngredient === ingredient.id ? (
              // Edit Mode
              <div style={{ ...styles.ingredientCard, border: '2px solid #9333ea', background: 'rgba(147, 51, 234, 0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ fontWeight: 'bold', color: '#9333ea', fontSize: '1.125rem', margin: 0 }}>
                    ✏️ Editing: {ingredient.name}
                  </h3>
                  <button onClick={handleCancelEdit} style={{ ...styles.buttonSecondary, ...styles.buttonSmall, padding: '4px 8px' }}>
                    ❌
                  </button>
                </div>

                <div style={{ ...styles.grid, gap: '16px' }}>
                  <input
                    value={editForm.name}
                    onChange={(e) => handleFormChange('name', e.target.value)}
                    placeholder="Ingredient Name"
                    style={{ ...styles.input, margin: 0, padding: '12px' }}
                  />

                  <div style={{ ...styles.grid, ...styles.gridCols3 }}>
                    <input
                      type="number"
                      step="0.01"
                      value={editForm.purchase_unit_qty}
                      onChange={(e) => handleFormChange('purchase_unit_qty', e.target.value)}
                      placeholder="Quantity"
                      style={{ ...styles.input, margin: 0, padding: '12px' }}
                    />

                    <select
                      value={editForm.purchase_unit_type}
                      onChange={(e) => handleFormChange('purchase_unit_type', e.target.value)}
                      style={{ ...styles.input, margin: 0, padding: '12px' }}
                    >
                      {['ml', 'oz', 'l', 'unit', 'bottle', 'can', 'kg', 'g', 'lb'].map(unit =>
                        <option key={unit} value={unit}>{unit}</option>
                      )}
                    </select>

                    <input
                      type="number"
                      step="0.01"
                      value={editForm.purchase_price}
                      onChange={(e) => handleFormChange('purchase_price', e.target.value)}
                      placeholder="Price ฿"
                      style={{ ...styles.input, margin: 0, padding: '12px' }}
                    />
                  </div>

                  <div style={{ ...styles.grid, ...styles.gridCols2 }}>
                    <select
                      value={editForm.category}
                      onChange={(e) => handleFormChange('category', e.target.value)}
                      style={{ ...styles.input, margin: 0, padding: '12px' }}
                    >
                      {Object.keys(CATEGORY_TARGETS).map(cat =>
                        <option key={cat} value={cat}>{cat}</option>
                      )}
                    </select>

                    <input
                      value={editForm.supplier}
                      onChange={(e) => handleFormChange('supplier', e.target.value)}
                      placeholder="Supplier name"
                      style={{ ...styles.input, margin: 0, padding: '12px' }}
                    />
                  </div>

                  <input
                    value={editForm.tags}
                    onChange={(e) => handleFormChange('tags', e.target.value)}
                    placeholder="Tags: premium, imported, organic"
                    style={{ ...styles.input, margin: 0, padding: '12px' }}
                  />

                  <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                    <button
                      onClick={handleSaveEdit}
                      disabled={isSubmitting}
                      style={{
                        ...styles.button,
                        fontSize: '0.875rem',
                        flex: 1,
                        ...(isSubmitting && { background: '#9ca3af', cursor: 'not-allowed' })
                      }}
                    >
                      {isSubmitting ? '🔄 Saving...' : '💾 Save Changes'}
                    </button>
                    <button
                      onClick={() => handleDeleteIngredient(ingredient)}
                      style={{
                        ...styles.button,
                        background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                        fontSize: '0.875rem',
                        padding: '12px 16px'
                      }}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              // View Mode
              <div
                style={{
                  ...styles.ingredientCard,
                  cursor: 'pointer',
                  border: '2px solid rgba(255, 255, 255, 0.2)',
                  transition: 'all 0.3s ease'
                }}
                onClick={() => handleEditClick(ingredient)}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'scale(1.02)';
                  e.target.style.border = '2px solid rgba(147, 51, 234, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'scale(1)';
                  e.target.style.border = '2px solid rgba(255, 255, 255, 0.2)';
                }}
              >
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
                    {ingredient.supplier && (
                      <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '4px' }}>
                        Supplier: {ingredient.supplier}
                      </div>
                    )}
                  </div>
                  <div style={{ fontWeight: 'bold', color: '#10b981', background: 'rgba(16, 185, 129, 0.1)', padding: '12px', borderRadius: '12px' }}>
                    ฿{(ingredient.purchase_price / ingredient.purchase_unit_qty).toFixed(4)} per {ingredient.purchase_unit_type}
                  </div>

                  <div style={{ marginTop: '12px', padding: '12px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '12px' }}>
                    <div style={{ fontWeight: '600', color: '#1d4ed8', marginBottom: '8px' }}>Smart Conversions:</div>
                    {/* Show industry-specific conversions based on category */}
                    {(ingredient.category === 'Spirit' || ingredient.category === 'Liqueur') && UNIT_CONVERSIONS[ingredient.purchase_unit_type]?.type === 'volume' && (
                      <div style={{ fontSize: '0.75rem', color: '#1d4ed8' }}>
                        ml: ฿{getUnitCostInTargetUnit(ingredient, 'ml').toFixed(4)} |
                        oz: ฿{getUnitCostInTargetUnit(ingredient, 'oz').toFixed(4)} |
                        L: ฿{getUnitCostInTargetUnit(ingredient, 'l').toFixed(2)}
                      </div>
                    )}
                    {ingredient.category === 'Wine' && UNIT_CONVERSIONS[ingredient.purchase_unit_type]?.type === 'volume' && (
                      <div style={{ fontSize: '0.75rem', color: '#1d4ed8' }}>
                        5oz: ฿{(getUnitCostInTargetUnit(ingredient, 'oz') * 5).toFixed(2)} |
                        8oz: ฿{(getUnitCostInTargetUnit(ingredient, 'oz') * 8).toFixed(2)} |
                        bottle: ฿{getUnitCostInTargetUnit(ingredient, 'bottle').toFixed(2)}
                      </div>
                    )}
                    {ingredient.category === 'Beer' && UNIT_CONVERSIONS[ingredient.purchase_unit_type]?.type === 'volume' && (
                      <div style={{ fontSize: '0.75rem', color: '#1d4ed8' }}>
                        12oz: ฿{(getUnitCostInTargetUnit(ingredient, 'oz') * 12).toFixed(2)} |
                        16oz: ฿{(getUnitCostInTargetUnit(ingredient, 'oz') * 16).toFixed(2)} |
                        bottle: ฿{getUnitCostInTargetUnit(ingredient, 'bottle').toFixed(2)}
                      </div>
                    )}
                    {(ingredient.category === 'Coffee' || ingredient.category === 'Tea') && UNIT_CONVERSIONS[ingredient.purchase_unit_type]?.type === 'weight' && (
                      <div style={{ fontSize: '0.75rem', color: '#1d4ed8' }}>
                        g: ฿{getUnitCostInTargetUnit(ingredient, 'g').toFixed(4)} |
                        oz: ฿{getUnitCostInTargetUnit(ingredient, 'oz').toFixed(4)} |
                        kg: ฿{getUnitCostInTargetUnit(ingredient, 'kg').toFixed(2)}
                      </div>
                    )}
                    {(ingredient.category === 'Juice' || ingredient.category === 'Mixer' || ingredient.category === 'Non-Alc') && UNIT_CONVERSIONS[ingredient.purchase_unit_type]?.type === 'volume' && (
                      <div style={{ fontSize: '0.75rem', color: '#1d4ed8' }}>
                        ml: ฿{getUnitCostInTargetUnit(ingredient, 'ml').toFixed(4)} |
                        oz: ฿{getUnitCostInTargetUnit(ingredient, 'oz').toFixed(4)} |
                        L: ฿{getUnitCostInTargetUnit(ingredient, 'l').toFixed(2)}
                      </div>
                    )}
                    {(ingredient.category === 'Classic Cocktails' || ingredient.category === 'House Cocktails') && UNIT_CONVERSIONS[ingredient.purchase_unit_type]?.type === 'volume' && (
                      <div style={{ fontSize: '0.75rem', color: '#1d4ed8' }}>
                        ml: ฿{getUnitCostInTargetUnit(ingredient, 'ml').toFixed(4)} |
                        oz: ฿{getUnitCostInTargetUnit(ingredient, 'oz').toFixed(4)} |
                        L: ฿{getUnitCostInTargetUnit(ingredient, 'l').toFixed(2)}
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

                  <div style={{ marginTop: '12px', padding: '8px 12px', background: 'rgba(147, 51, 234, 0.1)', borderRadius: '8px', fontSize: '0.75rem', color: '#7c3aed', fontWeight: '600', textAlign: 'center' }}>
                    Click to edit
                  </div>
                </div>
              </div>
            )}
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
  ); '0.75rem', color: '#1d4ed8'
}}>
  g: ฿{ getUnitCostInTargetUnit(ingredient, 'g').toFixed(4) } |
    oz: ฿{ getUnitCostInTargetUnit(ingredient, 'oz').toFixed(4) } |
      kg: ฿{ getUnitCostInTargetUnit(ingredient, 'kg').toFixed(2) }
                  </div >
                )}
{
  (ingredient.category === 'Juice' || ingredient.category === 'Mixer' || ingredient.category === 'Non-Alc') && UNIT_CONVERSIONS[ingredient.purchase_unit_type]?.type === 'volume' && (
    <div style={{ fontSize: '0.75rem', color: '#1d4ed8' }}>
      ml: ฿{getUnitCostInTargetUnit(ingredient, 'ml').toFixed(4)} |
      oz: ฿{getUnitCostInTargetUnit(ingredient, 'oz').toFixed(4)} |
      L: ฿{getUnitCostInTargetUnit(ingredient, 'l').toFixed(2)}
    </div>
  )
}
{
  (ingredient.category === 'Classic Cocktails' || ingredient.category === 'House Cocktails') && UNIT_CONVERSIONS[ingredient.purchase_unit_type]?.type === 'volume' && (
    <div style={{ fontSize: '0.75rem', color: '#1d4ed8' }}>
      ml: ฿{getUnitCostInTargetUnit(ingredient, 'ml').toFixed(4)} |
      oz: ฿{getUnitCostInTargetUnit(ingredient, 'oz').toFixed(4)} |
      L: ฿{getUnitCostInTargetUnit(ingredient, 'l').toFixed(2)}
    </div>
  )
}
              </div >

{
  ingredient.tags && ingredient.tags.length > 0 && (
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
  )
}
            </div >
          </div >
        ))}
      </div >

{
  filteredIngredients.length === 0 && (
    <div style={{ textAlign: 'center', padding: '64px 0', color: '#6b7280' }}>
      <MartiniIcon size={64} />
      <p style={{ fontSize: '1.25rem', fontWeight: '500', margin: '24px 0 8px' }}>No ingredients found matching your search.</p>
      <p style={{ fontSize: '0.875rem', margin: 0 }}>Try adjusting your search terms or category filter.</p>
    </div>
  )
}
    </div >
  );
}

function RecipeDetailModal({ recipe, ingredients, onClose, onEdit, onDelete }) {
  const [recipeIngredients, setRecipeIngredients] = useState([]);
  const [calculations, setCalculations] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchRecipeIngredients = async () => {
      if (!recipe) return;

      try {
        const { data, error } = await supabase
          .from('recipe_ingredients')
          .select('*')
          .eq('recipe_id', recipe.id);

        if (error) throw error;
        setRecipeIngredients(data || []);
      } catch (err) {
        console.error('Error fetching recipe ingredients:', err);
      }
    };

    fetchRecipeIngredients();
  }, [recipe]);

  useEffect(() => {
    if (recipeIngredients.length > 0 && ingredients.length > 0) {
      calculateRecipeCost();
    }
  }, [recipeIngredients, ingredients]);

  const calculateRecipeCost = () => {
    let totalCost = 0;
    let ingredientBreakdown = [];

    recipeIngredients.forEach(ri => {
      const ingredient = ingredients.find(i => i.id === ri.ingredient_id);
      if (!ingredient) return;

      const unitCostInRecipeUnit = getUnitCostInTargetUnit(ingredient, ri.unit_type);
      const itemCost = ri.amount_used * unitCostInRecipeUnit;
      totalCost += itemCost;

      ingredientBreakdown.push({
        name: ingredient.name,
        amount: ri.amount_used,
        unit: ri.unit_type,
        cost: itemCost.toFixed(2),
        unitCost: unitCostInRecipeUnit.toFixed(4)
      });
    });

    const targets = CATEGORY_TARGETS[recipe.category];
    const suggestedPrice = totalCost * targets.markup;
    const margin = ((suggestedPrice - totalCost) / suggestedPrice * 100);
    const pourCost = (totalCost / suggestedPrice * 100);

    setCalculations({
      totalCost: totalCost.toFixed(2),
      suggestedPrice: suggestedPrice.toFixed(2),
      margin: margin.toFixed(1),
      pourCost: pourCost.toFixed(1),
      ingredientBreakdown
    });
  };

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete "${recipe.name}"? This action cannot be undone.`)) {
      return;
    }

    setIsDeleting(true);
    try {
      await supabase
        .from('recipe_ingredients')
        .delete()
        .eq('recipe_id', recipe.id);

      const { error } = await supabase
        .from('recipes')
        .delete()
        .eq('id', recipe.id);

      if (error) throw error;

      alert('🗑️ Recipe deleted successfully!');
      onDelete();
      onClose();
    } catch (error) {
      alert(`❌ Error deleting recipe: ${error.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  if (!recipe) return null;

  return (
    <div style={styles.modal}>
      <div style={styles.modalContent}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
          <div style={{ flex: 1 }}>
            <h2 style={{ ...styles.cardTitle, fontSize: '2rem', marginBottom: '8px' }}>{recipe.name}</h2>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '16px' }}>
              <span style={{
                ...styles.badge,
                background: recipe.category === 'Spirit' ? 'linear-gradient(135deg, #ef4444, #dc2626)' :
                  recipe.category === 'Classic Cocktails' ? 'linear-gradient(135deg, #f59e0b, #ea580c)' :
                    recipe.category === 'House Cocktails' ? 'linear-gradient(135deg, #9333ea, #7c3aed)' :
                      'linear-gradient(135deg, #2563eb, #1d4ed8)'
              }}>
                {recipe.category}
              </span>
              <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                Created: {new Date(recipe.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
          <button onClick={onClose} style={{ ...styles.buttonSecondary, ...styles.buttonSmall, padding: '8px' }}>
            ❌
          </button>
        </div>

        {recipe.instructions && (
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontWeight: '600', marginBottom: '12px' }}>Instructions:</h3>
            <div style={{ background: 'rgba(249, 250, 251, 0.5)', padding: '16px', borderRadius: '12px', fontStyle: 'italic' }}>
              {recipe.instructions}
            </div>
          </div>
        )}

        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ fontWeight: '600', marginBottom: '12px' }}>Ingredients:</h3>
          {recipeIngredients.map((ri, index) => {
            const ingredient = ingredients.find(i => i.id === ri.ingredient_id);
            return (
              <div key={index} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: 'rgba(249, 250, 251, 0.5)', borderRadius: '8px', marginBottom: '8px' }}>
                <span>{ingredient?.name || 'Unknown ingredient'}</span>
                <span style={{ fontWeight: '600' }}>{ri.amount_used} {ri.unit_type}</span>
              </div>
            );
          })}
        </div>

        {calculations && (
          <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '20px', borderRadius: '16px', marginBottom: '24px' }}>
            <h3 style={{ fontWeight: '600', marginBottom: '16px', color: '#1d4ed8' }}>Cost Analysis:</h3>
            <div style={{ ...styles.grid, ...styles.gridCols2, gap: '16px' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ef4444' }}>฿{calculations.totalCost}</div>
                <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Total Cost</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#10b981' }}>฿{calculations.suggestedPrice}</div>
                <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Suggested Price</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#2563eb' }}>{calculations.margin}%</div>
                <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Margin</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#9333ea' }}>{calculations.pourCost}%</div>
                <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Pour Cost</div>
              </div>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            style={{
              ...styles.button,
              background: 'linear-gradient(135deg, #ef4444, #dc2626)',
              fontSize: '0.875rem',
              ...(isDeleting && { background: '#9ca3af', cursor: 'not-allowed' })
            }}
          >
            {isDeleting ? '🔄 Deleting...' : '🗑️ Delete Recipe'}
          </button>
          <button onClick={() => onEdit(recipe)} style={{ ...styles.button, fontSize: '0.875rem' }}>
            ✏️ Edit Recipe
          </button>
        </div>
      </div>
    </div>
  );
}

function SavedRecipes({ recipes, ingredients, onRecipeUpdated }) {
  const [filter, setFilter] = useState('');
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [editingRecipe, setEditingRecipe] = useState(null);

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

  const handleRecipeClick = async (recipe) => {
    try {
      const { data: recipeIngredients, error } = await supabase
        .from('recipe_ingredients')
        .select('*')
        .eq('recipe_id', recipe.id);

      if (error) throw error;

      setSelectedRecipe({
        ...recipe,
        recipe_ingredients: recipeIngredients || []
      });
    } catch (err) {
      console.error('Error fetching recipe details:', err);
      alert('Error loading recipe details');
    }
  };

  const handleEdit = (recipe) => {
    setSelectedRecipe(null);
    setEditingRecipe({
      ...recipe,
      recipe_ingredients: recipe.recipe_ingredients || []
    });
  };

  const handleCancelEdit = () => {
    setEditingRecipe(null);
  };

  const handleRecipeUpdated = () => {
    setEditingRecipe(null);
    setSelectedRecipe(null);
    if (onRecipeUpdated) onRecipeUpdated();
  };

  const handleRecipeDeleted = () => {
    setSelectedRecipe(null);
    if (onRecipeUpdated) onRecipeUpdated();
  };

  if (editingRecipe) {
    return (
      <RecipeBuilder
        ingredients={ingredients}
        onRecipeSaved={handleRecipeUpdated}
        editingRecipe={editingRecipe}
        onCancelEdit={handleCancelEdit}
      />
    );
  }

  return (
    <>
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

        <div style={{ ...styles.message, ...styles.messageInfo, marginBottom: '32px' }}>
          👆 <strong>Click any recipe</strong> to view details, cost analysis, and editing options. Smart unit conversions included!
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
            <div
              key={recipe.id}
              style={{
                ...styles.ingredientCard,
                cursor: 'pointer',
                border: '2px solid rgba(255, 255, 255, 0.2)',
                transition: 'all 0.3s ease'
              }}
              onClick={() => handleRecipeClick(recipe)}
              onMouseEnter={(e) => {
                e.target.style.transform = 'scale(1.02)';
                e.target.style.border = '2px solid rgba(59, 130, 246, 0.4)';
                e.target.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'scale(1)';
                e.target.style.border = '2px solid rgba(255, 255, 255, 0.2)';
                e.target.style.boxShadow = 'none';
              }}
            >
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
                    "{recipe.instructions.length > 100 ? recipe.instructions.substring(0, 100) + '...' : recipe.instructions}"
                  </p>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <div style={{ fontSize: '0.75rem', color: '#9ca3af', fontWeight: '500' }}>
                    Created: {new Date(recipe.created_at).toLocaleDateString()}
                  </div>
                  <div style={{ padding: '4px 8px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '6px', fontSize: '0.75rem', color: '#1d4ed8', fontWeight: '600' }}>
                    Click to view
                  </div>
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

      {selectedRecipe && (
        <RecipeDetailModal
          recipe={selectedRecipe}
          ingredients={ingredients}
          onClose={() => setSelectedRecipe(null)}
          onEdit={handleEdit}
          onDelete={handleRecipeDeleted}
        />
      )}
    </>
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
        {activeTab === 'saved' && <SavedRecipes recipes={recipes} ingredients={ingredients} onRecipeUpdated={fetchRecipes} />}
      </main>
    </div>
  );
}

export default App; import React, { useState, useEffect } from 'react';
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

// Unit conversion system - Industry best practices, no cl (too small)
const UNIT_CONVERSIONS = {
  // Volume conversions (base: ml)
  'ml': { toBase: 1, type: 'volume' },
  'l': { toBase: 1000, type: 'volume' },
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
  }
};

function AddIngredientForm({ onIngredientAdded }) {
  const [formData, setFormData] = useState({
    name: '', purchase_unit_qty: '', purchase_unit_type: 'ml',
    purchase_price: '', category: 'Spirit', tags: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const unitTypes = ['ml', 'oz', 'l', 'unit', 'bottle', 'can', 'kg', 'g', 'lb'];
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
  const [actualPrice, setActualPrice] = useState(''); // New state for actual price analysis

  // Load recipe data when editing
  useEffect(() => {
    if (editingRecipe) {
      setRecipeName(editingRecipe.name);
      setRecipeCategory(editingRecipe.category);
      setInstructions(editingRecipe.instructions || '');

      // Load recipe ingredients
      if (editingRecipe.recipe_ingredients && editingRecipe.recipe_ingredients.length > 0) {
        setSelectedItems(editingRecipe.recipe_ingredients.map(ri => ({
          ingredient_id: ri.ingredient_id,
          amount_used: ri.amount_used,
          unit: ri.unit_type
        })));
      }
    } else {
      // Clear form for new recipe
      setRecipeName('');
      setRecipeCategory('Classic Cocktails');
      setInstructions('');
      setSelectedItems([{ ingredient_id: '', amount_used: '', unit: 'ml' }]);
      setCalculations(null);
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
        <div style={{ ...styles.logo, background: editingRecipe ? 'linear-gradient(135deg, #f59e0b, #ea580c)' : 'linear-gradient(135deg, #10b981, #2563eb)' }}>
          <MartiniIcon size={28} />
        </div>
        <div style={{ flex: 1 }}>
          <h2 style={{ ...styles.cardTitle, background: editingRecipe ? 'linear-gradient(135deg, #f59e0b, #ea580c)' : 'linear-gradient(135deg, #10b981, #2563eb)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            {editingRecipe ? `Edit Recipe: ${editingRecipe.name}` : 'Recipe Builder & Cost Calculator'}
          </h2>
          <p style={styles.cardSubtitle}>
            {editingRecipe ? 'Modify your saved recipe' : 'Create and analyze beverage recipes'} • MargaritaHotSauceLLC
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          {editingRecipe && (
            <button onClick={onCancelEdit} style={{ ...styles.buttonSecondary, ...styles.button, fontSize: '0.875rem', padding: '12px 20px' }}>
              ❌ Cancel Edit
            </button>
          )}
          <button onClick={saveRecipe} disabled={isSubmitting} style={{ ...