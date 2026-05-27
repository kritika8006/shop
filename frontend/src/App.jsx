import { useState, useEffect } from 'react';

function App() {
  const [items, setItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // State for adding a new item
  const [newName, setNewName] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newUnit, setNewUnit] = useState('gm');

  // State to track which item is being edited and its temporary input value
  const [editingItemId, setEditingItemId] = useState(null);
  const [editPriceValue, setEditPriceValue] = useState('');

  // FIX: Localhost URL hata kar ise relative path banaya production deployment ke liye
  const API_URL = '/api/items';

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      setItems(data);
    } catch (error) {
      console.error("Error fetching items:", error);
    }
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!newName || !newPrice) return alert("Please fill out both item name and price.");

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName, price: Number(newPrice), unit: newUnit })
      });
      
      const data = await response.json();
      if (response.ok) {
        setItems([...items, data].sort((a, b) => a.name.localeCompare(b.name)));
        setNewName('');
        setNewPrice('');
      } else {
        alert(data.message || "Something went wrong.");
      }
    } catch (error) {
      console.error("Error adding item:", error);
    }
  };

  const handleUpdateClick = async (item) => {
    if (!editPriceValue || isNaN(editPriceValue)) {
      return alert("Please enter a valid number for the price.");
    }

    const confirmChange = window.confirm(
      `Are you sure you want to change the rate of "${item.name}" from ${item.price} Rs/${item.unit} to ${editPriceValue} Rs/${item.unit}?`
    );

    if (confirmChange) {
      try {
        const response = await fetch(`${API_URL}/${item._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ price: Number(editPriceValue) })
        });
        
        if (response.ok) {
          setItems(items.map(i => i._id === item._id ? { ...i, price: Number(editPriceValue) } : i));
          setEditingItemId(null);
          setEditPriceValue('');
        } else {
          const data = await response.json();
          alert(data.message || "Failed to update item.");
        }
      } catch (error) {
        console.error("Error updating item rate:", error);
      }
    }
  };

  const handleDeleteClick = async (item) => {
    const confirmDelete = window.confirm(`⚠️ Are you sure you want to permanently DELETE "${item.name}" from the list?`);
    
    if (confirmDelete) {
      try {
        const response = await fetch(`${API_URL}/${item._id}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          setItems(items.filter(i => i._id !== item._id));
        } else {
          const data = await response.json();
          alert(data.message || "Failed to delete item.");
        }
      } catch (error) {
        console.error("Error deleting item:", error);
      }
    }
  };

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ maxWidth: '750px', margin: '40px auto', padding: '0 20px' }}>
      
      {/* Updated Branding Header */}
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1 style={{ margin: '0 0 5px 0', color: '#2c3e50', fontSize: '2.4rem' }}>Pooja Provision Store</h1>
        <p style={{ margin: '0', color: '#64748b', fontSize: '1.1rem', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '1px' }}>Rate List</p>
      </div>

      {/* 1. Real-time Search Box */}
      <div style={{ marginBottom: '25px' }}>
        <input
          type="text"
          placeholder="🔍 Search items by name (e.g., chickpea, oil)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ width: '100%', padding: '12px', fontSize: '1.1rem', boxSizing: 'border-box' }}
        />
      </div>

      {/* 2. Form to Add New Rates */}
      <form onSubmit={handleAddItem} style={{ display: 'flex', gap: '10px', marginBottom: '30px', background: '#fff', padding: '15px', borderRadius: '6px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
        <input
          type="text"
          placeholder="Item Name"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          style={{ flex: 2 }}
        />
        <input
          type="number"
          placeholder="Rate (Rs)"
          value={newPrice}
          onChange={(e) => setNewPrice(e.target.value)}
          style={{ flex: 1 }}
        />
        <select value={newUnit} onChange={(e) => setNewUnit(e.target.value)} style={{ flex: 1 }}>
          <option value="gm">per gm</option>
          <option value="kg">per kg</option>
          <option value="ltr">per litre (ltr)</option>
          <option value="ml">per ml</option>
          <option value="pc">per piece</option>
        </select>
        <button type="submit">Add Item</button>
      </form>

      {/* 3. Rates Table List */}
      <div style={{ background: '#fff', borderRadius: '6px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: '#f1f3f5', borderBottom: '2px solid #dee2e6' }}>
              <th style={{ padding: '12px 15px' }}>Item Name</th>
              <th style={{ padding: '12px 15px' }}>Current Rate</th>
              <th style={{ padding: '12px 15px', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.length > 0 ? (
              filteredItems.map((item) => (
                <tr key={item._id} style={{ borderBottom: '1px solid #edf2f7' }}>
                  <td style={{ padding: '12px 15px', fontWeight: '500' }}>{item.name}</td>
                  <td style={{ padding: '12px 15px' }}>
                    {editingItemId === item._id ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <input
                          type="number"
                          value={editPriceValue}
                          onChange={(e) => setEditPriceValue(e.target.value)}
                          style={{ width: '80px', padding: '4px 8px' }}
                          autoFocus
                        />
                        <span>Rs / {item.unit}</span>
                      </div>
                    ) : (
                      <span>{item.price} Rs / {item.unit}</span>
                    )}
                  </td>
                  <td style={{ padding: '12px 15px', textAlign: 'right' }}>
                    {editingItemId === item._id ? (
                      <>
                        <button 
                          onClick={() => handleUpdateClick(item)} 
                          style={{ backgroundColor: '#28a745', marginRight: '5px', padding: '6px 12px' }}
                        >
                          Save
                        </button>
                        <button 
                          onClick={() => { setEditingItemId(null); setEditPriceValue(''); }} 
                          style={{ backgroundColor: '#6c757d', padding: '6px 12px' }}
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button 
                          onClick={() => { setEditingItemId(item._id); setEditPriceValue(item.price); }} 
                          style={{ backgroundColor: '#ffc107', color: '#212529', marginRight: '8px', padding: '6px 12px' }}
                        >
                          Edit Rate
                        </button>
                        <button 
                          onClick={() => handleDeleteClick(item)} 
                          style={{ backgroundColor: '#dc3545', color: 'white', padding: '6px 12px' }}
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" style={{ padding: '20px', textAlign: 'center', color: '#777' }}>
                  No matching items found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default App;