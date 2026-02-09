import React, { useState, useRef } from 'react';
import { apiClient } from '../config/api';
import './AddCategoryForm.css';

interface CategoryFormData {
  NameKa: string;
  NameEn: string;
  DescriptionKa: string;
  DescriptionEn: string;
  DisplayOrder: number;
  ImageFile: File | null;
}

interface AddCategoryFormProps {
  onSuccess?: () => void;
  onClose?: () => void;
}

const AddCategoryForm: React.FC<AddCategoryFormProps> = ({ onSuccess, onClose }) => {
  const [formData, setFormData] = useState<CategoryFormData>({
    NameKa: '',
    NameEn: '',
    DescriptionKa: '',
    DescriptionEn: '',
    DisplayOrder: 0,
    ImageFile: null,
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);


  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;

    if (type === 'number') {
      setFormData(prev => ({ ...prev, [name]: parseInt(value) || 0 }));
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
    submitData.append('DisplayOrder', formData.DisplayOrder.toString());

    if (formData.ImageFile) {
      submitData.append('ImageFile', formData.ImageFile);
    }

    try {
      const response = await apiClient.post('/DishCategory', submitData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.status === 201 || response.status === 200) {
        alert('კატეგორია წარმატებით დაემატა!');
        setFormData({
          NameKa: '',
          NameEn: '',
          DescriptionKa: '',
          DescriptionEn: '',
          DisplayOrder: 0,
          ImageFile: null,
        });
        setImagePreview(null);
        onSuccess?.();
      } else {
        alert('შეცდომა კატეგორიის დამატებისას');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('შეცდომა კატეგორიის დამატებისას. გთხოვთ შეამოწმოთ ავტორიზაცია.');
    }

    setIsSubmitting(false);
  };

  return (
    <div className="add-category-form-container">
      <div className="add-category-form-wrapper">
        <div className="add-category-form-header">
          <h2>კატეგორიის დამატება</h2>
          {onClose && (
            <button onClick={onClose} className="add-category-close-btn">
              ✕
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="add-category-form">
          {/* Names */}
          <div className="add-category-row">
            <div className="add-category-field">
              <label>სახელი (ქართ.)</label>
              <input
                type="text"
                name="NameKa"
                value={formData.NameKa}
                onChange={handleChange}
                required
              />
            </div>
            <div className="add-category-field">
              <label>სახელი (ინგლ.)</label>
              <input
                type="text"
                name="NameEn"
                value={formData.NameEn}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Descriptions */}
          <div className="add-category-field">
            <label>აღწერა (ქართ.)</label>
            <textarea
              name="DescriptionKa"
              value={formData.DescriptionKa}
              onChange={handleChange}
              rows={3}
            />
          </div>

          <div className="add-category-field">
            <label>აღწერა (ინგლ.)</label>
            <textarea
              name="DescriptionEn"
              value={formData.DescriptionEn}
              onChange={handleChange}
              rows={3}
            />
          </div>

          {/* Display Order */}
          <div className="add-category-field">
            <label>თანმიმდევრობა</label>
            <input
              type="number"
              name="DisplayOrder"
              value={formData.DisplayOrder}
              onChange={handleChange}
              min="0"
            />
          </div>

          {/* Image Upload */}
          <div className="add-category-field">
            <label>სურათი</label>
            <div className="add-category-image-upload">
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
                className="add-category-upload-btn"
              >
                📷 სურათის ატვირთვა
              </button>
              {imagePreview && (
                <img src={imagePreview} alt="Preview" className="add-category-preview" />
              )}
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="add-category-submit-btn"
          >
            {isSubmitting ? 'იტვირთება...' : '✓ კატეგორიის დამატება'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddCategoryForm;
