import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { CropLog, CropLogCreate, CropLogUpdate } from '../../types';
import { getCrops, createCrop, updateCrop, deleteCrop, generateNotifications } from '../../services/apiService';

export const CropPanel: React.FC = () => {
  const { t } = useLanguage();
  const [crops, setCrops] = useState<CropLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingCrop, setEditingCrop] = useState<CropLog | null>(null);
  const [generating, setGenerating] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState<CropLogCreate>({
    crop_name: '',
    location: '',
    latitude: null,
    longitude: null,
    date_planted: new Date().toISOString().split('T')[0],
    growth_stage: 'Seedling',
    notes: '',
  });

  useEffect(() => {
    loadCrops();
  }, []);

  const loadCrops = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getCrops();
      setCrops(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load crops');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);
      
      if (editingCrop) {
        await updateCrop(editingCrop.id, formData);
      } else {
        await createCrop(formData);
      }
      
      resetForm();
      await loadCrops();
    } catch (err: any) {
      setError(err.message || 'Failed to save crop');
    }
  };

  const handleDelete = async (cropId: number) => {
    if (!window.confirm('Are you sure you want to delete this crop?')) return;
    
    try {
      setError(null);
      await deleteCrop(cropId);
      await loadCrops();
    } catch (err: any) {
      setError(err.message || 'Failed to delete crop');
    }
  };

  const handleEdit = (crop: CropLog) => {
    setEditingCrop(crop);
    setFormData({
      crop_name: crop.crop_name,
      location: crop.location,
      latitude: crop.latitude,
      longitude: crop.longitude,
      date_planted: crop.date_planted,
      growth_stage: crop.growth_stage,
      notes: crop.notes || '',
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      crop_name: '',
      location: '',
      latitude: null,
      longitude: null,
      date_planted: new Date().toISOString().split('T')[0],
      growth_stage: 'Seedling',
      notes: '',
    });
    setEditingCrop(null);
    setShowForm(false);
  };

  const handleGenerateNotifications = async () => {
    try {
      setGenerating(true);
      setError(null);
      await generateNotifications();
      alert('Notifications generated successfully! Check the notifications widget.');
    } catch (err: any) {
      setError(err.message || 'Failed to generate notifications');
    } finally {
      setGenerating(false);
    }
  };

  const cropTypes = [
    'Paddy', 'Rice', 'Wheat', 'Corn', 'Maize',
    'Tomato', 'Potato', 'Onion', 'Cotton',
    'Soybean', 'Chickpea', 'Lentil', 'Sugarcane',
    'Barley', 'Millet', 'Sorghum', 'Other'
  ];

  const growthStages = [
    'Seedling', 'Vegetative', 'Flowering', 
    'Fruiting', 'Ripening', 'Harvest Ready'
  ];

  return (
    <div className="crop-panel" style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>My Crops</h2>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={handleGenerateNotifications}
            disabled={generating || crops.length === 0}
            style={{
              padding: '10px 20px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: crops.length === 0 || generating ? 'not-allowed' : 'pointer',
              opacity: crops.length === 0 || generating ? 0.6 : 1,
            }}
          >
            {generating ? '⏳ Generating...' : '🌦️ Get Weather Updates'}
          </button>
          <button
            onClick={() => setShowForm(!showForm)}
            style={{
              padding: '10px 20px',
              backgroundColor: '#2196F3',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
            }}
          >
            {showForm ? '✖ Cancel' : '+ Add Crop'}
          </button>
        </div>
      </div>

      {error && (
        <div style={{ 
          padding: '10px', 
          backgroundColor: '#f44336', 
          color: 'white', 
          borderRadius: '5px', 
          marginBottom: '20px' 
        }}>
          {error}
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} style={{ 
          backgroundColor: '#f5f5f5', 
          padding: '20px', 
          borderRadius: '8px', 
          marginBottom: '20px' 
        }}>
          <h3>{editingCrop ? 'Edit Crop' : 'Add New Crop'}</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Crop Type *
              </label>
              <select
                value={formData.crop_name}
                onChange={(e) => setFormData({ ...formData, crop_name: e.target.value })}
                required
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
              >
                <option value="">Select crop type</option>
                {cropTypes.map(crop => (
                  <option key={crop} value={crop}>{crop}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Growth Stage *
              </label>
              <select
                value={formData.growth_stage}
                onChange={(e) => setFormData({ ...formData, growth_stage: e.target.value })}
                required
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
              >
                {growthStages.map(stage => (
                  <option key={stage} value={stage}>{stage}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Location *
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g., Salem, Tamil Nadu"
                required
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Date Planted *
              </label>
              <input
                type="date"
                value={formData.date_planted}
                onChange={(e) => setFormData({ ...formData, date_planted: e.target.value })}
                required
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Latitude (Optional)
              </label>
              <input
                type="number"
                step="any"
                value={formData.latitude || ''}
                onChange={(e) => setFormData({ ...formData, latitude: e.target.value ? parseFloat(e.target.value) : null })}
                placeholder="e.g., 11.6643"
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Longitude (Optional)
              </label>
              <input
                type="number"
                step="any"
                value={formData.longitude || ''}
                onChange={(e) => setFormData({ ...formData, longitude: e.target.value ? parseFloat(e.target.value) : null })}
                placeholder="e.g., 78.1460"
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
              />
            </div>
          </div>

          <div style={{ marginTop: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Notes (Optional)
            </label>
            <textarea
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Add any additional notes about this crop..."
              rows={3}
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
            <button
              type="submit"
              style={{
                padding: '10px 30px',
                backgroundColor: '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
              }}
            >
              {editingCrop ? 'Update Crop' : 'Add Crop'}
            </button>
            <button
              type="button"
              onClick={resetForm}
              style={{
                padding: '10px 30px',
                backgroundColor: '#757575',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>Loading crops...</div>
      ) : crops.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
          <p>No crops added yet. Click "Add Crop" to get started!</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {crops.map((crop) => (
            <div
              key={crop.id}
              style={{
                backgroundColor: '#fff',
                border: '1px solid #ddd',
                borderRadius: '8px',
                padding: '20px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '10px' }}>
                <h3 style={{ margin: 0, color: '#4CAF50' }}>🌾 {crop.crop_name}</h3>
                <div style={{ display: 'flex', gap: '5px' }}>
                  <button
                    onClick={() => handleEdit(crop)}
                    style={{
                      padding: '5px 10px',
                      backgroundColor: '#2196F3',
                      color: 'white',
                      border: 'none',
                      borderRadius: '3px',
                      cursor: 'pointer',
                      fontSize: '12px',
                    }}
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => handleDelete(crop.id)}
                    style={{
                      padding: '5px 10px',
                      backgroundColor: '#f44336',
                      color: 'white',
                      border: 'none',
                      borderRadius: '3px',
                      cursor: 'pointer',
                      fontSize: '12px',
                    }}
                  >
                    🗑️
                  </button>
                </div>
              </div>
              
              <div style={{ fontSize: '14px', lineHeight: '1.6' }}>
                <p><strong>📍 Location:</strong> {crop.location}</p>
                <p><strong>🌱 Growth Stage:</strong> {crop.growth_stage}</p>
                <p><strong>📅 Date Planted:</strong> {new Date(crop.date_planted).toLocaleDateString()}</p>
                {crop.notes && <p><strong>📝 Notes:</strong> {crop.notes}</p>}
                <p style={{ color: '#888', fontSize: '12px', marginTop: '10px' }}>
                  Added: {new Date(crop.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
