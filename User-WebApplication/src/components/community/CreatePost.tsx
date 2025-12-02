/**
 * Create Post Component - Reusable post creation form
 */

import React, { useState } from 'react';

interface CreatePostProps {
  onSubmit: (text: string, images: File[]) => Promise<void>;
  placeholder?: string;
}

const CreatePost: React.FC<CreatePostProps> = ({ 
  onSubmit, 
  placeholder = "Share your Sanskrit journey..." 
}) => {
  const [postText, setPostText] = useState('');
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [posting, setPosting] = useState(false);

  const handleSubmit = async () => {
    if (!postText.trim() && selectedImages.length === 0) return;

    try {
      setPosting(true);
      await onSubmit(postText, selectedImages);
      setPostText('');
      setSelectedImages([]);
    } catch (error) {
      console.error('Error creating post:', error);
    } finally {
      setPosting(false);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files).slice(0, 4);
      setSelectedImages(files);
    }
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="bg-[#FFFEF7] rounded-xl shadow-md border border-[#D4C5A9] p-6">
      <div className="flex space-x-4">
        {/* User Avatar */}
        <div className="w-12 h-12 rounded-full bg-[#644A07] flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
          U
        </div>

        {/* Post Form */}
        <div className="flex-1">
          <textarea
            value={postText}
            onChange={(e) => setPostText(e.target.value)}
            placeholder={placeholder}
            className="w-full p-4 border-2 border-[#D4C5A9] rounded-lg focus:border-[#644A07] focus:ring-2 focus:ring-[#F5F1E8] transition-all resize-none bg-white text-[#2C2416] placeholder-[#6B5D4F]"
            rows={3}
            maxLength={500}
          />

          {/* Image Previews */}
          {selectedImages.length > 0 && (
            <div className="mt-3 grid grid-cols-2 gap-2">
              {selectedImages.map((file, index) => (
                <div key={index} className="relative group">
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg border border-[#D4C5A9]"
                  />
                  <button
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 w-6 h-6 bg-[#2C2416] text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Character Count */}
          <div className="flex justify-between items-center mt-3">
            <div className="flex items-center space-x-2">
              {/* Image Upload Button */}
              <label className="p-2 hover:bg-[#F5F1E8] rounded-lg transition-colors cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageSelect}
                  className="hidden"
                  disabled={posting}
                />
                <svg className="w-5 h-5 text-[#644A07]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </label>

              {/* Video Upload Button */}
              <button 
                className="p-2 hover:bg-[#F5F1E8] rounded-lg transition-colors"
                title="Add Video"
              >
                <svg className="w-5 h-5 text-[#644A07]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>

              {/* Emoji Button */}
              <button 
                className="p-2 hover:bg-[#F5F1E8] rounded-lg transition-colors"
                title="Add Emoji"
              >
                <svg className="w-5 h-5 text-[#644A07]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>

              {/* Character Counter */}
              <span className={`text-sm font-medium ml-2 ${
                postText.length > 450 ? 'text-red-600' : 'text-[#6B5D4F]'
              }`}>
                {postText.length}/500
              </span>
            </div>

            {/* Post Button */}
            <button
              onClick={handleSubmit}
              disabled={(!postText.trim() && selectedImages.length === 0) || posting}
              className="px-6 py-2 bg-[#644A07] text-white rounded-lg font-semibold hover:bg-[#2C2416] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
            >
              {posting ? 'Posting...' : 'Post'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePost;
