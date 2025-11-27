const cloudinary = require('cloudinary').v2;

const initializeCloudinary = () => {
  try {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true,
    });

    console.log('Cloudinary configured successfully');
    return cloudinary;
  } catch (error) {
    console.error('Cloudinary configuration failed:', error.message);
    throw error;
  }
};

// Upload helpers for different media types
const uploadHelpers = {
  // Upload audio file
  async uploadAudio(filePath, options = {}) {
    try {
      const defaultOptions = {
        resource_type: 'video', // Cloudinary treats audio as video
        folder: 'shlokayug/audio',
        format: 'mp3',
        quality: 'auto',
        ...options,
      };

      const result = await cloudinary.uploader.upload(filePath, defaultOptions);
      return {
        success: true,
        url: result.secure_url,
        public_id: result.public_id,
        duration: result.duration,
        format: result.format,
        bytes: result.bytes,
      };
    } catch (error) {
      console.error('Audio upload error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  },

  // Upload image file
  async uploadImage(filePath, options = {}) {
    try {
      const defaultOptions = {
        resource_type: 'image',
        folder: 'shlokayug/images',
        quality: 'auto',
        fetch_format: 'auto',
        ...options,
      };

      const result = await cloudinary.uploader.upload(filePath, defaultOptions);
      return {
        success: true,
        url: result.secure_url,
        public_id: result.public_id,
        width: result.width,
        height: result.height,
        format: result.format,
        bytes: result.bytes,
      };
    } catch (error) {
      console.error('Image upload error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  },

  // Upload video file
  async uploadVideo(filePath, options = {}) {
    try {
      const defaultOptions = {
        resource_type: 'video',
        folder: 'shlokayug/videos',
        quality: 'auto',
        ...options,
      };

      const result = await cloudinary.uploader.upload(filePath, defaultOptions);
      return {
        success: true,
        url: result.secure_url,
        public_id: result.public_id,
        duration: result.duration,
        width: result.width,
        height: result.height,
        format: result.format,
        bytes: result.bytes,
      };
    } catch (error) {
      console.error('Video upload error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  },

  // Delete file by public_id
  async deleteFile(publicId, resourceType = 'image') {
    try {
      const result = await cloudinary.uploader.destroy(publicId, {
        resource_type: resourceType,
      });

      return {
        success: result.result === 'ok',
        result: result.result,
      };
    } catch (error) {
      console.error('File deletion error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  },

  // Generate signed upload URL for client-side uploads
  generateSignedUploadUrl(options = {}) {
    try {
      const timestamp = Math.round(new Date().getTime() / 1000);
      const defaultOptions = {
        timestamp,
        folder: 'shlokayug/temp',
        ...options,
      };

      const signature = cloudinary.utils.api_sign_request(
        defaultOptions,
        process.env.CLOUDINARY_API_SECRET
      );

      return {
        success: true,
        uploadUrl: `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/upload`,
        signature,
        timestamp,
        apiKey: process.env.CLOUDINARY_API_KEY,
        ...defaultOptions,
      };
    } catch (error) {
      console.error('Signed URL generation error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  },

  // Transform image URL for different sizes
  getTransformedImageUrl(publicId, transformations = {}) {
    try {
      const defaultTransformations = {
        quality: 'auto',
        fetch_format: 'auto',
        ...transformations,
      };

      const url = cloudinary.url(publicId, {
        ...defaultTransformations,
        secure: true,
      });

      return url;
    } catch (error) {
      console.error('Image transformation error:', error);
      return null;
    }
  },

  // Get optimized audio URL
  getOptimizedAudioUrl(publicId, options = {}) {
    try {
      const defaultOptions = {
        resource_type: 'video',
        quality: 'auto',
        ...options,
      };

      const url = cloudinary.url(publicId, {
        ...defaultOptions,
        secure: true,
      });

      return url;
    } catch (error) {
      console.error('Audio optimization error:', error);
      return null;
    }
  },
};

// Preset configurations for different use cases
const presets = {
  // Avatar image presets
  avatar: {
    small: { width: 50, height: 50, crop: 'fill', gravity: 'face' },
    medium: { width: 150, height: 150, crop: 'fill', gravity: 'face' },
    large: { width: 300, height: 300, crop: 'fill', gravity: 'face' },
  },

  // Audio quality presets
  audio: {
    low: { bit_rate: '64k', audio_codec: 'mp3' },
    medium: { bit_rate: '128k', audio_codec: 'mp3' },
    high: { bit_rate: '320k', audio_codec: 'mp3' },
  },

  // Video quality presets
  video: {
    mobile: { width: 480, quality: '60', video_codec: 'h264' },
    web: { width: 720, quality: '80', video_codec: 'h264' },
    hd: { width: 1080, quality: '90', video_codec: 'h264' },
  },
};

module.exports = {
  initializeCloudinary,
  cloudinary,
  uploadHelpers,
  presets,
};
