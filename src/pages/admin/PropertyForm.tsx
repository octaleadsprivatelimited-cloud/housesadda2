import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Upload, X, Plus, Loader2, Image as ImageIcon, MapPin, Home, IndianRupee, FileText, Link2, Sparkles, ToggleLeft, Youtube } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { propertiesAPI, typesAPI, locationsAPI } from '@/lib/api';
import { compressImageInBrowser, compressContent } from '@/lib/image-compression';

const PropertyForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isEditMode = !!id;
  
  // Dynamic data from API
  const [propertyTypes, setPropertyTypes] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [areas, setAreas] = useState<string[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  
  const [formData, setFormData] = useState({
    title: '',
    type: 'Apartment',
    city: 'Hyderabad',
    area: '',
    price: '',
    priceUnit: 'onwards',
    bedrooms: '',
    bathrooms: '',
    sqft: '',
    description: '',
    brochureUrl: '',
    mapUrl: '',
    videoUrl: '',
    transactionType: 'Sale',
    isFeatured: false,
    isActive: true,
    amenities: [] as string[],
    highlights: [] as string[],
  });

  const [newAmenity, setNewAmenity] = useState('');
  const [newHighlight, setNewHighlight] = useState('');

  // Load property types, cities, and areas from API
  useEffect(() => {
    loadFormData();
  }, []);

  useEffect(() => {
    if (isEditMode) {
      loadProperty();
    }
  }, [id]);

  const loadFormData = async () => {
    try {
      setIsLoadingData(true);
      
      const typesData = await typesAPI.getAll();
      const typeNames = typesData.map((t: any) => t.name);
      setPropertyTypes(typeNames);
      
      const locationsData = await locationsAPI.getAll();
      const uniqueCities = [...new Set(locationsData.map((l: any) => l.city))] as string[];
      setCities(uniqueCities);
      
      const allAreas = locationsData.map((l: any) => l.name);
      setAreas(allAreas);
      
      if (typeNames.length > 0 && !formData.type) {
        setFormData(prev => ({ ...prev, type: typeNames[0] }));
      }
      if (uniqueCities.length > 0 && !formData.city) {
        setFormData(prev => ({ ...prev, city: uniqueCities[0] }));
      }
    } catch (error) {
      console.error('Error loading form data:', error);
      toast({
        title: "Warning",
        description: "Could not load property types and locations. Using defaults.",
        variant: "destructive",
      });
      setPropertyTypes(['Apartment', 'Villa', 'Plot', 'Commercial']);
      setCities(['Hyderabad']);
      setAreas(['Gachibowli', 'Hitech City', 'Kondapur', 'Jubilee Hills', 'Banjara Hills']);
    } finally {
      setIsLoadingData(false);
    }
  };

  const loadProperty = async () => {
    if (!id) return;
    
    try {
      setIsLoading(true);
      const property = await propertiesAPI.getById(id);
      
      setFormData({
        title: property.title || '',
        type: property.type || 'Apartment',
        city: property.city || 'Hyderabad',
        area: property.area || '',
        price: property.price?.toString() || '',
        priceUnit: 'onwards',
        bedrooms: property.bedrooms?.toString() || '',
        bathrooms: property.bathrooms?.toString() || '',
        sqft: property.sqft?.toString() || '',
        description: property.description || '',
        brochureUrl: property.brochureUrl || '',
        mapUrl: property.mapUrl || '',
        videoUrl: property.videoUrl || '',
        transactionType: property.transactionType || 'Sale',
        isFeatured: property.isFeatured || false,
        isActive: property.isActive !== undefined ? property.isActive : true,
        amenities: property.amenities || [],
        highlights: property.highlights || [],
      });
      
      // Load images - ensure we get all images
      if (property.images && Array.isArray(property.images) && property.images.length > 0) {
        // Filter out empty images
        const validImages = property.images.filter((img: string) => img && img.trim() !== '');
        setImages(validImages);
        console.log(`📸 Loaded ${validImages.length} images for property ${id}`);
      } else if (property.image && property.image.trim() !== '') {
        // Fallback to single image
        setImages([property.image]);
        console.log(`📸 Loaded 1 image (fallback) for property ${id}`);
      } else {
        setImages([]);
        console.log(`⚠️ No images found for property ${id}`);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load property",
        variant: "destructive",
      });
      navigate('/admin/properties');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const fileArray = Array.from(files);
    setIsUploadingImages(true);
    
    try {
      // Show loading toast
      toast({
        title: "Uploading images...",
        description: `Processing ${fileArray.length} image(s)`,
      });

      const compressedImages: string[] = [];

      // Compress each image sequentially
      for (let i = 0; i < fileArray.length; i++) {
        const file = fileArray[i];
        try {
          const compressed = await compressImageInBrowser(file, 11);
          if (compressed && compressed.trim() !== '') {
            compressedImages.push(compressed);
          }
        } catch (error) {
          console.error('Error compressing image:', error);
          // Fallback: use original file as base64
          try {
            const base64 = await new Promise<string>((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () => resolve(reader.result as string);
              reader.onerror = reject;
              reader.readAsDataURL(file);
            });
            if (base64 && base64.trim() !== '') {
              compressedImages.push(base64);
            }
          } catch (fallbackError) {
            console.error('Fallback conversion failed:', fallbackError);
          }
        }
      }

      if (compressedImages.length > 0) {
        setImages(prev => {
          const updated = [...prev, ...compressedImages];
          console.log(`✅ Added ${compressedImages.length} images. Total: ${updated.length}`);
          return updated;
        });
        
        toast({
          title: "Images uploaded!",
          description: `${compressedImages.length} image(s) added successfully`,
        });
      } else {
        toast({
          title: "Upload failed",
          description: "No images were successfully processed",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('Image upload error:', error);
      toast({
        title: "Upload error",
        description: error.message || "Failed to upload images",
        variant: "destructive",
      });
    } finally {
      setIsUploadingImages(false);
      // Reset file input to allow re-uploading the same file
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeImage = (index: number) => {
    if (index < 0 || index >= images.length) return;
    
    const imageToRemove = images[index];
    setImages(prev => {
      const updated = prev.filter((_, i) => i !== index);
      console.log(`🗑️ Removed image at index ${index}. Remaining: ${updated.length}`);
      return updated;
    });
    
    toast({
      title: "Image removed",
      description: "Image has been removed from the list",
    });
  };

  const addAmenity = () => {
    if (newAmenity.trim()) {
      setFormData(prev => ({ ...prev, amenities: [...prev.amenities, newAmenity.trim()] }));
      setNewAmenity('');
    }
  };

  const removeAmenity = (index: number) => {
    setFormData(prev => ({ ...prev, amenities: prev.amenities.filter((_, i) => i !== index) }));
  };

  const addHighlight = () => {
    if (newHighlight.trim()) {
      setFormData(prev => ({ ...prev, highlights: [...prev.highlights, newHighlight.trim()] }));
      setNewHighlight('');
    }
  };

  const removeHighlight = (index: number) => {
    setFormData(prev => ({ ...prev, highlights: prev.highlights.filter((_, i) => i !== index) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!formData.title || !formData.area || !formData.price) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    // Validate images
    if (images.length === 0) {
      const confirm = window.confirm('No images selected. Do you want to continue without images?');
      if (!confirm) {
        setIsSubmitting(false);
        return;
      }
    }

    try {
      // Compress description content
      const compressedDescription = compressContent(formData.description);

      const propertyData = {
        title: formData.title,
        type: formData.type,
        city: formData.city,
        area: formData.area,
        price: parseFloat(formData.price),
        bedrooms: formData.bedrooms ? parseInt(formData.bedrooms) : 0,
        bathrooms: formData.bathrooms ? parseInt(formData.bathrooms) : 0,
        sqft: formData.sqft ? parseInt(formData.sqft) : 0,
        description: compressedDescription,
        transactionType: formData.transactionType,
        images: images.filter(img => img && img.trim() !== ''), // Filter out empty images
        isFeatured: formData.isFeatured,
        isActive: formData.isActive,
        amenities: formData.amenities,
        highlights: formData.highlights,
        brochureUrl: formData.brochureUrl,
        mapUrl: formData.mapUrl,
        videoUrl: formData.videoUrl,
      };

      console.log(`📤 Submitting property with ${propertyData.images.length} images`);

      if (isEditMode && id) {
        await propertiesAPI.update(id, propertyData);
        toast({
          title: "Property Updated!",
          description: "Your property has been successfully updated with images.",
        });
      } else {
        await propertiesAPI.create(propertyData);
        toast({
          title: "Property Added!",
          description: "Your property has been successfully added with images.",
        });
      }

      navigate('/admin/properties');
    } catch (error: any) {
      console.error('Submit error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save property",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || isLoadingData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
          <p className="text-sm text-gray-500">Loading {isLoading ? 'property' : 'form data'}...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 px-4 py-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate(-1)} 
          className="p-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{isEditMode ? 'Edit Property' : 'Add New Property'}</h1>
          <p className="text-gray-500 text-sm">Fill in the details below</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-gray-50 to-white px-6 py-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Home className="h-5 w-5 text-blue-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-800">Basic Information</h2>
            </div>
          </div>
          
          <div className="p-6 space-y-5">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Property Title *</label>
              <input
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., Luxury 3 BHK Apartment in Gachibowli"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm"
                required
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Property Type *</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm"
                >
                  {propertyTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">City *</label>
                <select
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm"
                >
                  {cities.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Area/Location *</label>
                <select
                  name="area"
                  value={formData.area}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm"
                  required
                >
                  <option value="">Select Area</option>
                  {areas.filter(area => {
                    // Filter areas by selected city if city is selected
                    return true; // For now, show all areas
                  }).map(area => (
                    <option key={area} value={area}>{area}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Price (₹) *</label>
                <input
                  name="price"
                  type="number"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="e.g., 8500000"
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm"
                  required
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Bedrooms</label>
                <input
                  name="bedrooms"
                  type="number"
                  value={formData.bedrooms}
                  onChange={handleChange}
                  placeholder="e.g., 3"
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Bathrooms</label>
                <input
                  name="bathrooms"
                  type="number"
                  value={formData.bathrooms}
                  onChange={handleChange}
                  placeholder="e.g., 2"
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Area (sqft)</label>
                <input
                  name="sqft"
                  type="number"
                  value={formData.sqft}
                  onChange={handleChange}
                  placeholder="e.g., 1850"
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Transaction Type *</label>
              <select
                name="transactionType"
                value={formData.transactionType}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm"
              >
                <option value="Sale">Sale</option>
                <option value="Rent">Rent</option>
                <option value="Lease">Lease</option>
                <option value="PG">PG</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe the property..."
                rows={5}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm resize-none"
              />
            </div>
          </div>
        </div>

        {/* Images */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-gray-50 to-white px-6 py-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <ImageIcon className="h-5 w-5 text-purple-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-800">Property Images</h2>
              {images.length > 0 && (
                <span className="ml-auto text-sm text-gray-500">({images.length} image{images.length > 1 ? 's' : ''})</span>
              )}
            </div>
          </div>
          
          <div className="p-4 sm:p-6 space-y-4 sm:space-y-5">
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 sm:p-8 text-center hover:border-primary/50 hover:bg-gray-50 transition-colors">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
                id="image-upload"
                disabled={isUploadingImages}
              />
              <label htmlFor="image-upload" className={`cursor-pointer block ${isUploadingImages ? 'opacity-50 cursor-not-allowed' : ''}`}>
                <div className="p-2 sm:p-3 bg-gray-100 rounded-full w-fit mx-auto mb-2 sm:mb-3">
                  {isUploadingImages ? (
                    <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400 animate-spin" />
                  ) : (
                    <Upload className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400" />
                  )}
                </div>
                <p className="font-medium text-gray-700 text-sm sm:text-base">
                  {isUploadingImages ? 'Processing images...' : 'Click to upload images'}
                </p>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">Images will be auto-compressed to ~11KB each</p>
                <p className="text-xs text-gray-400 mt-1">You can upload multiple images at once</p>
              </label>
            </div>

            {images.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-3">
                  {images.length} image{images.length > 1 ? 's' : ''} ready to upload
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3">
                  {images.map((image, index) => (
                    <div key={`image-${index}`} className="relative aspect-video rounded-lg overflow-hidden group border-2 border-gray-200 bg-gray-50">
                      <img 
                        src={image} 
                        alt={`Property image ${index + 1}`} 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          console.error(`Failed to load image at index ${index}`);
                          const target = e.target as HTMLImageElement;
                          target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgZmlsbD0iI2U1ZTdlYiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiM5Y2EzYWYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5JbWFnZSBFcnJvcjwvdGV4dD48L3N2Zz4=';
                        }}
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          removeImage(index);
                        }}
                        className="absolute top-1 right-1 sm:top-2 sm:right-2 p-1.5 sm:p-2 bg-red-500 hover:bg-red-600 active:bg-red-700 text-white rounded-full opacity-100 shadow-lg z-10 transition-all"
                        aria-label={`Remove image ${index + 1}`}
                        title="Remove image"
                      >
                        <X className="h-3 w-3 sm:h-4 sm:w-4" />
                      </button>
                      {index === 0 && (
                        <span className="absolute bottom-1 left-1 sm:bottom-2 sm:left-2 text-xs bg-blue-500 text-white px-1.5 sm:px-2 py-0.5 rounded-full font-medium z-10">
                          Cover
                        </span>
                      )}
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  💡 First image will be used as the cover image. Click the X button to remove images.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Links */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-gray-50 to-white px-6 py-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Link2 className="h-5 w-5 text-orange-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-800">Links</h2>
            </div>
          </div>
          
          <div className="p-6 space-y-5">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Brochure URL (Google Drive)</label>
              <input
                name="brochureUrl"
                value={formData.brochureUrl}
                onChange={handleChange}
                placeholder="https://drive.google.com/file/d/..."
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">Paste your Google Drive brochure link</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Google Maps Location URL</label>
              <input
                name="mapUrl"
                value={formData.mapUrl}
                onChange={handleChange}
                placeholder="https://www.google.com/maps/embed?pb=... (for embedded preview)"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm"
              />
              <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-xs font-medium text-blue-800 mb-1">📍 For embedded map preview:</p>
                <ol className="text-xs text-blue-700 list-decimal list-inside space-y-0.5">
                  <li>Go to Google Maps and search your exact location</li>
                  <li>Click <strong>Share</strong> → <strong>Embed a map</strong></li>
                  <li>Click "COPY HTML" and paste the <strong>src="..."</strong> URL only</li>
                </ol>
                <p className="text-xs text-blue-600 mt-2">
                  💡 Or paste any Google Maps link - it will show as a clickable button
                </p>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Video URL (YouTube)</label>
              <input
                name="videoUrl"
                value={formData.videoUrl}
                onChange={handleChange}
                placeholder="https://www.youtube.com/watch?v=..."
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">Paste YouTube video URL</p>
            </div>
          </div>
        </div>

        {/* Amenities */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-gray-50 to-white px-6 py-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Sparkles className="h-5 w-5 text-green-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-800">Amenities</h2>
            </div>
          </div>
          
          <div className="p-6 space-y-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={newAmenity}
                onChange={(e) => setNewAmenity(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addAmenity();
                  }
                }}
                placeholder="Add amenity (e.g., Swimming Pool)"
                className="flex-1 px-4 py-2 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm"
              />
              <Button type="button" onClick={addAmenity} variant="outline">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            {formData.amenities.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.amenities.map((amenity, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                  >
                    {amenity}
                    <button
                      type="button"
                      onClick={() => removeAmenity(index)}
                      className="text-gray-500 hover:text-red-500"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Highlights */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-gray-50 to-white px-6 py-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Sparkles className="h-5 w-5 text-yellow-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-800">Key Highlights</h2>
            </div>
          </div>
          
          <div className="p-6 space-y-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={newHighlight}
                onChange={(e) => setNewHighlight(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addHighlight();
                  }
                }}
                placeholder="Add highlight (e.g., Near Metro)"
                className="flex-1 px-4 py-2 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm"
              />
              <Button type="button" onClick={addHighlight} variant="outline">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            {formData.highlights.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.highlights.map((highlight, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-50 text-yellow-700 rounded-full text-sm"
                  >
                    {highlight}
                    <button
                      type="button"
                      onClick={() => removeHighlight(index)}
                      className="text-yellow-600 hover:text-red-500"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Status Toggles */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-gray-50 to-white px-6 py-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <ToggleLeft className="h-5 w-5 text-indigo-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-800">Status</h2>
            </div>
          </div>
          
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">Featured Property</label>
                <p className="text-xs text-gray-500">Show this property in featured section</p>
              </div>
              <Switch
                checked={formData.isFeatured}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isFeatured: checked }))}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">Active</label>
                <p className="text-xs text-gray-500">Property will be visible on website</p>
              </div>
              <Switch
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(-1)}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || isUploadingImages}
            className="flex-1 bg-primary hover:bg-primary/90"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {isEditMode ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              isEditMode ? 'Update Property' : 'Create Property'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default PropertyForm;
