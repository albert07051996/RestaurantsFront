import React, { useState, useRef, useEffect } from 'react';
import './AddDishForm.css';

interface DishFormData {
  NameKa: string;
  NameEn: string;
  DescriptionKa: string;
  DescriptionEn: string;
  Ingredients: string;
  IngredientsEn: string;
  SpicyLevel: number;
  Calories: number;
  Price: number;
  Volume: string;
  PreparationTimeMinutes: number;
  AlcoholContent: string;
  IsVeganDish: boolean;
  DishCategoryId: string;
  VideoUrl: string;
  Comment: string;
  ImageFile: File | null;
}

interface DishCategory {
  id: string;
  nameKa: string;
  nameEn: string;
}

interface AddDishFormProps {
  onSuccess?: () => void;
  onClose?: () => void;
}

const AddDishForm: React.FC<AddDishFormProps> = ({ onSuccess, onClose }) => {
  const [formData, setFormData] = useState<DishFormData>({
    NameKa: '',
    NameEn: '',
    DescriptionKa: '',
    DescriptionEn: '',
    Ingredients: '',
    IngredientsEn: '',
    SpicyLevel: 0,
    Calories: 0,
    Price: 0,
    Volume: '',
    PreparationTimeMinutes: 0,
    AlcoholContent: '',
    IsVeganDish: false,
    DishCategoryId: '',
    VideoUrl: '',
    Comment: '',
    ImageFile: null,
  });

  const [categories, setCategories] = useState<DishCategory[]>([]);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const API_BASE = 'https://localhost:61015/api';

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${API_BASE}/DishCategory`);
        if (response.ok) {
          const data = await response.json();
          setCategories(data);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (type === 'number') {
      setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, ImageFile: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const submitData = new FormData();
    submitData.append('NameKa', formData.NameKa);
    submitData.append('NameEn', formData.NameEn);
    submitData.append('DescriptionKa', formData.DescriptionKa);
    submitData.append('DescriptionEn', formData.DescriptionEn);
    submitData.append('Ingredients', formData.Ingredients);
    submitData.append('IngredientsEn', formData.IngredientsEn);
    submitData.append('SpicyLevel', formData.SpicyLevel.toString());
    submitData.append('Calories', formData.Calories.toString());
    submitData.append('Price', formData.Price.toString());
    submitData.append('Volume', formData.Volume);
    submitData.append('PreparationTimeMinutes', formData.PreparationTimeMinutes.toString());
    submitData.append('AlcoholContent', formData.AlcoholContent);
    submitData.append('IsVeganDish', formData.IsVeganDish.toString());
    submitData.append('DishCategoryId', formData.DishCategoryId);
    submitData.append('VideoUrl', formData.VideoUrl);
    submitData.append('Comment', formData.Comment);

    if (formData.ImageFile) {
      submitData.append('ImageFile', formData.ImageFile);
    }

    try {
      const response = await fetch(`${API_BASE}/Dish`, {
        method: 'POST',
        body: submitData,
      });

      if (response.ok) {
        alert('კერძი წარმატებით დაემატა!');
        setFormData({
          NameKa: '',
          NameEn: '',
          DescriptionKa: '',
          DescriptionEn: '',
          Ingredients: '',
          IngredientsEn: '',
          SpicyLevel: 0,
          Calories: 0,
          Price: 0,
          Volume: '',
          PreparationTimeMinutes: 0,
          AlcoholContent: '',
          IsVeganDish: false,
          DishCategoryId: '',
          VideoUrl: '',
          Comment: '',
          ImageFile: null,
        });
        setImagePreview(null);
        onSuccess?.();
      } else {
        alert('შეცდომა კერძის დამატებისას');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('შეცდომა სერვერთან კავშირისას');
    }

    setIsSubmitting(false);
  };

  return (
    <div className="add-dish-form-container">
      <div className="add-dish-form-wrapper">
        <div className="add-dish-form-header">
          <h2>კერძის დამატება</h2>
          {onClose && (
            <button onClick={onClose} className="add-dish-close-btn">
              ✕
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="add-dish-form">
          {/* Names */}
          <div className="add-dish-section">
            <h3>სახელი</h3>
            <div className="add-dish-row">
              <div className="add-dish-field">
                <label>სახელი (ქართ.) *</label>
                <input
                  type="text"
                  name="NameKa"
                  value={formData.NameKa}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="add-dish-field">
                <label>სახელი (ინგლ.) *</label>
                <input
                  type="text"
                  name="NameEn"
                  value={formData.NameEn}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>

          {/* Descriptions */}
          <div className="add-dish-section">
            <h3>აღწერა</h3>
            <div className="add-dish-field">
              <label>აღწერა (ქართ.)</label>
              <textarea
                name="DescriptionKa"
                value={formData.DescriptionKa}
                onChange={handleChange}
                rows={3}
              />
            </div>
            <div className="add-dish-field">
              <label>აღწერა (ინგლ.)</label>
              <textarea
                name="DescriptionEn"
                value={formData.DescriptionEn}
                onChange={handleChange}
                rows={3}
              />
            </div>
          </div>

          {/* Ingredients */}
          <div className="add-dish-section">
            <h3>ინგრედიენტები</h3>
            <div className="add-dish-row">
              <div className="add-dish-field">
                <label>ინგრედიენტები (ქართ.)</label>
                <input
                  type="text"
                  name="Ingredients"
                  value={formData.Ingredients}
                  onChange={handleChange}
                  placeholder="მაგ: ხორცი, ხახვი, ნიორი"
                />
              </div>
              <div className="add-dish-field">
                <label>ინგრედიენტები (ინგლ.)</label>
                <input
                  type="text"
                  name="IngredientsEn"
                  value={formData.IngredientsEn}
                  onChange={handleChange}
                  placeholder="e.g: meat, onion, garlic"
                />
              </div>
            </div>
          </div>

          {/* Category */}
          <div className="add-dish-section">
            <h3>კატეგორია</h3>
            <div className="add-dish-field">
              <label>კატეგორია *</label>
              <select
                name="DishCategoryId"
                value={formData.DishCategoryId}
                onChange={handleChange}
                required
              >
                <option value="">აირჩიეთ კატეგორია</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.nameKa} • {cat.nameEn}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Numeric Values */}
          <div className="add-dish-section">
            <h3>მახასიათებლები</h3>
            <div className="add-dish-grid">
              <div className="add-dish-field">
                <label>ფასი (₾) *</label>
                <input
                  type="number"
                  name="Price"
                  value={formData.Price}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  required
                />
              </div>
              <div className="add-dish-field">
                <label>კალორია</label>
                <input
                  type="number"
                  name="Calories"
                  value={formData.Calories}
                  onChange={handleChange}
                  min="0"
                />
              </div>
              <div className="add-dish-field">
                <label>მომზადების დრო (წუთი)</label>
                <input
                  type="number"
                  name="PreparationTimeMinutes"
                  value={formData.PreparationTimeMinutes}
                  onChange={handleChange}
                  min="0"
                />
              </div>
              <div className="add-dish-field">
                <label>ცხარე დონე (0-5)</label>
                <input
                  type="number"
                  name="SpicyLevel"
                  value={formData.SpicyLevel}
                  onChange={handleChange}
                  min="0"
                  max="5"
                />
              </div>
              <div className="add-dish-field">
                <label>მოცულობა</label>
                <input
                  type="text"
                  name="Volume"
                  value={formData.Volume}
                  onChange={handleChange}
                  placeholder="მაგ: 250მლ"
                />
              </div>
              <div className="add-dish-field">
                <label>ალკოჰოლის შემცველობა</label>
                <input
                  type="text"
                  name="AlcoholContent"
                  value={formData.AlcoholContent}
                  onChange={handleChange}
                  placeholder="მაგ: 12%"
                />
              </div>
            </div>
          </div>

          {/* Checkboxes */}
          <div className="add-dish-section">
            <h3>დამატებითი</h3>
            <div className="add-dish-checkbox-row">
              <label className="add-dish-checkbox-label">
                <input
                  type="checkbox"
                  name="IsVeganDish"
                  checked={formData.IsVeganDish}
                  onChange={handleChange}
                />
                ვეგანური კერძი
              </label>
            </div>
          </div>

          {/* Video URL */}
          <div className="add-dish-section">
            <h3>მედია</h3>
            <div className="add-dish-field">
              <label>ვიდეო URL</label>
              <input
                type="text"
                name="VideoUrl"
                value={formData.VideoUrl}
                onChange={handleChange}
                placeholder="https://..."
              />
            </div>

            {/* Image Upload */}
            <div className="add-dish-field">
              <label>სურათი</label>
              <div className="add-dish-image-upload">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  style={{ display: 'none' }}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="add-dish-upload-btn"
                >
                  📷 სურათის ატვირთვა
                </button>
                {imagePreview && (
                  <img src={imagePreview} alt="Preview" className="add-dish-preview" />
                )}
              </div>
            </div>
          </div>

          {/* Comment */}
          <div className="add-dish-section">
            <h3>კომენტარი</h3>
            <div className="add-dish-field">
              <textarea
                name="Comment"
                value={formData.Comment}
                onChange={handleChange}
                rows={2}
                placeholder="დამატებითი შენიშვნა..."
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="add-dish-submit-btn"
          >
            {isSubmitting ? 'იტვირთება...' : '✓ კერძის დამატება'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddDishForm;
