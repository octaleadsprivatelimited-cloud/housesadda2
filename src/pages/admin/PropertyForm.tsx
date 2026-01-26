import { useState, useEffect } from 'react';
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
      
      if (property.images && property.images.length > 0) {
        setImages(property.images);
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
    if (files) {
      const fileArray = Array.from(files);
      const compressedImages: string[] = [];
      
      // Show loading toast
      toast({
        title: "Compressing images...",
        description: `Processing ${fileArray.length} image(s) to optimize storage`,
      });

      // Compress each image sequentially
      for (const file of fileArray) {
        try {
          const compressed = await compressImageInBrowser(file, 11);
          compressedImages.push(compressed);
        } catch (error) {
          console.error('Error compressing image:', error);
          // Fallback: use original file as base64
          const base64 = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });
          compressedImages.push(base64);
        }
      }

      setImages(prev => [...prev, ...compressedImages]);
      
      toast({
        title: "Images compressed!",
        description: `${compressedImages.length} image(s) compressed to ~11KB each`,
      });
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
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
        images: images, // Already compressed base64 data URLs
        isFeatured: formData.isFeatured,
        isActive: formData.isActive,
        amenities: formData.amenities,
        highlights: formData.highlights,
        brochureUrl: formData.brochureUrl,
        mapUrl: formData.mapUrl,
        videoUrl: formData.videoUrl,
      };

      if (isEditMode && id) {
        await propertiesAPI.update(id, propertyData);
        toast({
          title: "Property Updated!",
          description: "Your property has been successfully updated.",
        });
      } else {
        await propertiesAPI.create(propertyData);
        toast({
          title: "Property Added!",
          description: "Your property has been successfully added.",
        });
      }

      navigate('/admin/properties');
    } catch (error: any) {
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
    <div className="max-w-4xl mx-auto space-y-6">
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

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Area / Locality *</label>
              <select
                name="area"
                value={formData.area}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm"
                required
              >
                <option value="">Select Area</option>
                {areas.map(area => (
                  <option key={area} value={area}>{area}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Pricing & Details */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-gray-50 to-white px-6 py-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <IndianRupee className="h-5 w-5 text-green-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-800">Pricing & Details</h2>
            </div>
          </div>
          
          <div className="p-6 space-y-5">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Transaction Type *</label>
                <select
                  name="transactionType"
                  value={formData.transactionType}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm"
                  required
                >
                  <option value="Sale">For Sale</option>
                  <option value="Rent">For Rent</option>
                  <option value="Lease">Lease</option>
                  <option value="PG">PG</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Price (₹) *</label>
                <input
                  name="price"
                  type="number"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="e.g., 15000000"
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Price Unit</label>
              <select
                name="priceUnit"
                value={formData.priceUnit}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm"
              >
                <option value="onwards">Onwards</option>
                <option value="negotiable">Negotiable</option>
                <option value="all inclusive">All Inclusive</option>
                <option value="per sqft">Per Sq.ft</option>
              </select>
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
                  placeholder="e.g., 3"
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Area (sq.ft)</label>
                <input
                  name="sqft"
                  type="number"
                  value={formData.sqft}
                  onChange={handleChange}
                  placeholder="e.g., 2100"
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe the property in detail..."
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
            </div>
          </div>
          
          <div className="p-6 space-y-5">
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-primary/50 hover:bg-gray-50 transition-colors">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
                id="image-upload"
              />
              <label htmlFor="image-upload" className="cursor-pointer">
                <div className="p-3 bg-gray-100 rounded-full w-fit mx-auto mb-3">
                  <Upload className="h-8 w-8 text-gray-400" />
                </div>
                <p className="font-medium text-gray-700">Click to upload images</p>
                <p className="text-sm text-gray-500">Images will be auto-compressed to ~11KB each</p>
              </label>
            </div>

            {images.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {images.map((image, index) => (
                  <div key={index} className="relative aspect-video rounded-lg overflow-hidden group border border-gray-200">
                    <img src={image} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                    >
                      <X className="h-3 w-3" />
                    </button>
                    {index === 0 && (
                      <span className="absolute bottom-2 left-2 text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full font-medium">
                        Cover
                      </span>
                    )}
                  </div>
                ))}
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
              <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Youtube className="h-4 w-4 text-red-500" />
                YouTube Video URL
              </label>
              <input
                name="videoUrl"
                value={formData.videoUrl}
                onChange={handleChange}
                placeholder="https://www.youtube.com/watch?v=... or https://youtu.be/..."
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">Paste any YouTube video link (regular or embed URL)</p>
            </div>
          </div>
        </div>

        {/* Amenities */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-gray-50 to-white px-6 py-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-teal-100 rounded-lg">
                <Sparkles className="h-5 w-5 text-teal-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-800">Amenities</h2>
            </div>
          </div>
          
          <div className="p-6 space-y-4">
            <div className="flex gap-2">
              <input
                value={newAmenity}
                onChange={(e) => setNewAmenity(e.target.value)}
                placeholder="e.g., Swimming Pool"
                className="flex-1 px-4 py-2.5 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAmenity())}
              />
              <Button type="button" onClick={addAmenity} variant="outline" className="border-gray-200">
                <Plus className="h-5 w-5" />
              </Button>
            </div>

            {formData.amenities.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.amenities.map((amenity, index) => (
                  <span key={index} className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-50 border border-teal-200 text-teal-700 rounded-full text-sm">
                    {amenity}
                    <button type="button" onClick={() => removeAmenity(index)} className="hover:text-red-500 transition-colors">
                      <X className="h-4 w-4" />
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
              <div className="p-2 bg-amber-100 rounded-lg">
                <FileText className="h-5 w-5 text-amber-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-800">Highlights</h2>
            </div>
          </div>
          
          <div className="p-6 space-y-4">
            <div className="flex gap-2">
              <input
                value={newHighlight}
                onChange={(e) => setNewHighlight(e.target.value)}
                placeholder="e.g., Ready to Move"
                className="flex-1 px-4 py-2.5 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addHighlight())}
              />
              <Button type="button" onClick={addHighlight} variant="outline" className="border-gray-200">
                <Plus className="h-5 w-5" />
              </Button>
            </div>

            {formData.highlights.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.highlights.map((highlight, index) => (
                  <span key={index} className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-200 text-amber-700 rounded-full text-sm">
                    {highlight}
                    <button type="button" onClick={() => removeHighlight(index)} className="hover:text-red-500 transition-colors">
                      <X className="h-4 w-4" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Settings */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-gray-50 to-white px-6 py-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 rounded-lg">
                <ToggleLeft className="h-5 w-5 text-gray-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-800">Settings</h2>
            </div>
          </div>
          
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <div>
                <p className="font-medium text-gray-800">Mark as Featured</p>
                <p className="text-sm text-gray-500">Show in featured section on homepage</p>
              </div>
              <Switch
                checked={formData.isFeatured}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isFeatured: checked }))}
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-xl">
              <div>
                <p className="font-medium text-gray-800">Active Listing</p>
                <p className="text-sm text-gray-500">Property visible on website</p>
              </div>
              <Switch
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex gap-3 justify-end">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => navigate(-1)}
            className="border-gray-200"
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            className="bg-teal-500 hover:bg-teal-600 text-white shadow-lg shadow-teal-500/30 px-8"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              isEditMode ? 'Update Property' : 'Add Property'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default PropertyForm;
