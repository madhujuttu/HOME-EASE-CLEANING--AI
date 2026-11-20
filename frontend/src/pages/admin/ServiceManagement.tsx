import React, { useState, useRef } from 'react';
import { useCrm } from '../../context/CrmContext';
import { Service } from '../../types';
import { api } from '../../services/api';
import {
  Sparkles,
  Plus,
  Search,
  CheckCircle,
  Clock,
  DollarSign,
  Tag,
  Edit,
  Trash2,
  X,
  Layers,
  Image as ImageIcon,
  Upload,
  AlertCircle,
  Camera,
  Check
} from 'lucide-react';

const CATEGORY_PHOTO_PRESETS: Record<string, { label: string; url: string }[]> = {
  'cat-home-cleaning': [
    { label: 'Deep Cleaning Team', url: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&q=80&w=800' },
    { label: 'Living Room Detailing', url: 'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?auto=format&fit=crop&q=80&w=800' },
    { label: 'Sparkling Bathroom Scrub', url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=800' },
    { label: 'Kitchen Deep Degrease', url: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&q=80&w=800' },
    { label: 'Sofa & Fabric Care', url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=800' },
    { label: 'Carpet & Rug Extract', url: 'https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&q=80&w=800' },
    { label: 'Bedroom Sanitization', url: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&q=80&w=800' },
    { label: 'Window & Glass Polish', url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=800' }
  ],
  'cat-ac-services': [
    { label: 'Indoor Split Servicing', url: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=800' },
    { label: 'Power Jet Deep Cleaning', url: 'https://images.unsplash.com/photo-1621905251918-48416bd8575a?auto=format&fit=crop&q=80&w=800' },
    { label: 'AC Unit Installation', url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=800' },
    { label: 'Refrigerant Gas Refill', url: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&q=80&w=800' },
    { label: 'PCB & Capacitor Repair', url: 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&q=80&w=800' }
  ],
  'cat-plumbing-services': [
    { label: 'Faucet & Tap Repair', url: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&q=80&w=800' },
    { label: 'Pipe Leakage Sealing', url: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&q=80&w=800' },
    { label: 'Ceramic Basin Fitting', url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=800' },
    { label: 'Water Pump Motor Setup', url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=800' }
  ],
  'cat-electrical-services': [
    { label: 'Ceiling Fan Mounting', url: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=800' },
    { label: 'LED & Chandelier Lights', url: 'https://images.unsplash.com/photo-1540518614846-7ede433c4550?auto=format&fit=crop&q=80&w=800' },
    { label: 'Modular Switchboard', url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&q=80&w=800' },
    { label: 'Concealed Wiring & Circuit', url: 'https://images.unsplash.com/photo-1555680202-c86f0e12f086?auto=format&fit=crop&q=80&w=800' },
    { label: 'Short Circuit Diagnostics', url: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&q=80&w=800' }
  ],
  'cat-refrigerator-services': [
    { label: 'Refrigerator General Check', url: 'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?auto=format&fit=crop&q=80&w=800' },
    { label: 'Interior Sanitization', url: 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&q=80&w=800' },
    { label: 'Thermostat & Cooling Fix', url: 'https://images.unsplash.com/photo-1536353284924-9240ccfc4966?auto=format&fit=crop&q=80&w=800' },
    { label: 'Compressor & Gas Recharge', url: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&q=80&w=800' }
  ],
  'cat-washing-machine-services': [
    { label: 'Washing Machine Tuning', url: 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?auto=format&fit=crop&q=80&w=800' },
    { label: 'Drum Deep Descaling', url: 'https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?auto=format&fit=crop&q=80&w=800' },
    { label: 'Front Load Door & Seal', url: 'https://images.unsplash.com/photo-1545173168-9f1947eebb7f?auto=format&fit=crop&q=80&w=800' },
    { label: 'Top Load Pulsator Fix', url: 'https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?auto=format&fit=crop&q=80&w=800' }
  ],
  'cat-water-purifier-services': [
    { label: 'Pure Drinking Water RO', url: 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?auto=format&fit=crop&q=80&w=800' },
    { label: 'Sediment & Carbon Filter', url: 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?auto=format&fit=crop&q=80&w=800' },
    { label: 'TDS & Water Quality Test', url: 'https://images.unsplash.com/photo-1576086213369-97a306d36557?auto=format&fit=crop&q=80&w=800' }
  ],
  'cat-kitchen-appliance-services': [
    { label: 'Chimney Hood Installation', url: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&q=80&w=800' },
    { label: 'Grease Filter Deep Wash', url: 'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&q=80&w=800' },
    { label: 'Microwave Cavity Repair', url: 'https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?auto=format&fit=crop&q=80&w=800' },
    { label: 'Gas Stove Burner Clean', url: 'https://images.unsplash.com/photo-1528698827591-e19ccd7bc23d?auto=format&fit=crop&q=80&w=800' }
  ],
  'cat-cctv-security-services': [
    { label: 'Outdoor Bullet Camera', url: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&q=80&w=800' },
    { label: 'Night Vision IR Repair', url: 'https://images.unsplash.com/photo-1580983218765-f663bec07b37?auto=format&fit=crop&q=80&w=800' },
    { label: 'DVR/NVR Storage Setup', url: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&q=80&w=800' },
    { label: 'Mobile App Streaming', url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800' }
  ],
  'cat-inverter-generator-services': [
    { label: 'Inverter Sine Wave Setup', url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=800' },
    { label: 'Inverter Circuit Repair', url: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&q=80&w=800' },
    { label: 'Tubular Battery Swap', url: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&q=80&w=800' },
    { label: 'Silent Generator Overhaul', url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=800' }
  ]
};

export const ServiceManagement: React.FC = () => {
  const { services, categories, addService, updateService, deleteService, showToast } = useCrm();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);

  // Quick Photo Edit Modal state
  const [photoTargetService, setPhotoTargetService] = useState<Service | null>(null);
  const [quickPhotoUrl, setQuickPhotoUrl] = useState<string>('');
  const [isUpdatingPhoto, setIsUpdatingPhoto] = useState<boolean>(false);
  const quickFileInputRef = useRef<HTMLInputElement>(null);

  // File upload state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    categoryId: categories[0]?.id || 'cat-home-cleaning',
    description: '',
    price: 199,
    pricingType: 'fixed' as Service['pricingType'],
    duration: '3 - 4 Hours',
    availability: 'Daily, 8 AM - 6 PM',
    image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&q=80&w=800',
    imageUrl: '',
    imageStorageKey: '',
    features: 'Hospital-grade steam, Certified Crew, Eco-friendly',
    inclusions: 'Standard sanitization, Surface detailing, Glass polish',
    exclusions: 'Heavy structural repair, Wall painting',
    inspectionCharges: 0,
    materialCharges: 0,
    emergencyCharges: 0,
    discountPercentage: 0,
    popular: false,
    status: 'active' as Service['status']
  });

  const resolveImageUrl = (img?: string) => {
    if (!img) return 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&q=80&w=800';
    if (img.startsWith('/uploads/')) {
      const backendHost = ((import.meta as any).env?.VITE_BACKEND_URL as string) || 'http://localhost:5000';
      return `${backendHost}${img}`;
    }
    return img;
  };

  const filteredServices = services.filter(s => {
    if (selectedCategory !== 'all') {
      const activeCat = categories.find(c => c.id === selectedCategory);
      const matchesCat = s.categoryId === selectedCategory || (activeCat && s.categoryName.toLowerCase() === activeCat.name.toLowerCase());
      if (!matchesCat) return false;
    }
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const match =
        s.name.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.categoryName.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate format
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!allowed.includes(file.type.toLowerCase())) {
      showToast('Invalid File Type', 'Only JPG, JPEG, PNG, and WEBP formats are supported.', 'error');
      return;
    }

    // Validate size (5MB max)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      showToast('File Too Large', 'Service image must be under 5MB.', 'error');
      return;
    }

    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setFormData(prev => ({
      ...prev,
      image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&q=80&w=800',
      imageUrl: '',
      imageStorageKey: ''
    }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showToast('Validation Error', 'Service name is required.', 'error');
      return;
    }

    let finalImageUrl = formData.imageUrl || formData.image;
    let finalStorageKey = formData.imageStorageKey;

    // If user selected a new file, upload it first
    if (selectedFile) {
      setIsUploading(true);
      setUploadProgress(35);
      const uploadRes = await api.uploadServiceImage(selectedFile);
      setUploadProgress(100);
      setIsUploading(false);

      if (!uploadRes.success || !uploadRes.imageUrl) {
        showToast('Image Upload Failed', uploadRes.message || 'Could not upload service image.', 'error');
        return;
      }

      finalImageUrl = uploadRes.imageUrl;
      finalStorageKey = uploadRes.imageStorageKey || '';
    }

    const cat = categories.find(c => c.id === formData.categoryId);

    if (editingService) {
      const success = await updateService(editingService.id, {
        name: formData.name.trim(),
        categoryId: formData.categoryId,
        categoryName: cat?.name || 'Home Cleaning Services',
        description: formData.description,
        price: Number(formData.price),
        pricingType: formData.pricingType,
        duration: formData.duration,
        estimatedDuration: formData.duration,
        availability: formData.availability,
        image: finalImageUrl,
        imageUrl: finalImageUrl,
        imageStorageKey: finalStorageKey,
        features: formData.features.split(',').map(f => f.trim()).filter(Boolean),
        inclusions: formData.inclusions.split(',').map(f => f.trim()).filter(Boolean),
        exclusions: formData.exclusions.split(',').map(f => f.trim()).filter(Boolean),
        inspectionCharges: Number(formData.inspectionCharges) || 0,
        materialCharges: Number(formData.materialCharges) || 0,
        emergencyCharges: Number(formData.emergencyCharges) || 0,
        discountPercentage: Number(formData.discountPercentage) || 0,
        popular: formData.popular,
        status: formData.status
      });

      if (success) {
        setEditingService(null);
        resetForm();
      }
    } else {
      const success = await addService({
        name: formData.name.trim(),
        categoryId: formData.categoryId,
        categoryName: cat?.name || 'Home Cleaning Services',
        description: formData.description,
        price: Number(formData.price),
        pricingType: formData.pricingType,
        duration: formData.duration,
        estimatedDuration: formData.duration,
        availability: formData.availability,
        image: finalImageUrl,
        imageUrl: finalImageUrl,
        imageStorageKey: finalStorageKey,
        features: formData.features.split(',').map(f => f.trim()).filter(Boolean),
        inclusions: formData.inclusions.split(',').map(f => f.trim()).filter(Boolean),
        exclusions: formData.exclusions.split(',').map(f => f.trim()).filter(Boolean),
        inspectionCharges: Number(formData.inspectionCharges) || 0,
        materialCharges: Number(formData.materialCharges) || 0,
        emergencyCharges: Number(formData.emergencyCharges) || 0,
        discountPercentage: Number(formData.discountPercentage) || 0,
        popular: formData.popular,
        status: formData.status || 'active'
      });

      if (success) {
        setShowAddModal(false);
        resetForm();
      }
    }
  };

  const resetForm = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setUploadProgress(0);
    setIsUploading(false);
    setFormData({
      name: '',
      categoryId: categories[0]?.id || 'cat-home-cleaning',
      description: '',
      price: 199,
      pricingType: 'fixed',
      duration: '3 - 4 Hours',
      availability: 'Daily, 8 AM - 6 PM',
      image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&q=80&w=800',
      imageUrl: '',
      imageStorageKey: '',
      features: 'Hospital-grade steam, Certified Crew, Eco-friendly',
      inclusions: 'Standard sanitization, Surface detailing, Glass polish',
      exclusions: 'Heavy structural repair, Wall painting',
      inspectionCharges: 0,
      materialCharges: 0,
      emergencyCharges: 0,
      discountPercentage: 0,
      popular: false,
      status: 'active'
    });
  };

  const handleOpenEdit = (service: Service) => {
    setEditingService(service);
    setSelectedFile(null);
    setPreviewUrl(service.imageUrl || service.image);
    setFormData({
      name: service.name,
      categoryId: service.categoryId,
      description: service.description,
      price: service.price,
      pricingType: service.pricingType,
      duration: service.duration,
      availability: service.availability,
      image: service.image,
      imageUrl: service.imageUrl || service.image,
      imageStorageKey: (service as any).imageStorageKey || '',
      features: (service.features || []).join(', '),
      inclusions: (service.inclusions || []).join(', '),
      exclusions: (service.exclusions || []).join(', '),
      inspectionCharges: service.inspectionCharges || 0,
      materialCharges: service.materialCharges || 0,
      emergencyCharges: service.emergencyCharges || 0,
      discountPercentage: service.discountPercentage || 0,
      popular: Boolean(service.popular),
      status: service.status
    });
  };

  const handleOpenQuickPhoto = (service: Service) => {
    setPhotoTargetService(service);
    setQuickPhotoUrl(service.imageUrl || service.image);
    setSelectedFile(null);
    setPreviewUrl(service.imageUrl || service.image);
  };

  const handleApplyQuickPhoto = async () => {
    if (!photoTargetService) return;
    setIsUpdatingPhoto(true);

    let finalImageUrl = quickPhotoUrl;
    if (selectedFile) {
      const uploadRes = await api.uploadServiceImage(selectedFile);
      if (uploadRes.success && uploadRes.imageUrl) {
        finalImageUrl = uploadRes.imageUrl;
      }
    }

    const success = await updateService(photoTargetService.id, {
      image: finalImageUrl,
      imageUrl: finalImageUrl
    });

    setIsUpdatingPhoto(false);
    if (success) {
      showToast('Photo Updated', `New photo saved for "${photoTargetService.name}".`, 'success');
      setPhotoTargetService(null);
      setSelectedFile(null);
      setPreviewUrl(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            Service Catalog & Rate Master
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-electric-500/20 text-electric-400 font-mono font-bold">
              {filteredServices.length} offerings
            </span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Configure sanitization packages, real uploaded banners, duration, and pricing synchronized across lead forms.
          </p>
        </div>

        <button
          onClick={() => {
            resetForm();
            setShowAddModal(true);
          }}
          className="px-4 py-2.5 rounded-xl bg-electric-500 hover:bg-electric-400 text-navy-950 font-bold text-xs inline-flex items-center gap-2 transition-all shadow-glow cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Add New Service
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === 'all'
                ? 'bg-electric-500 text-navy-950 font-bold'
                : 'bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            All Categories ({services.length})
          </button>
          {categories.map(c => {
            const count = services.filter(s => s.categoryId === c.id || s.categoryName === c.name).length;
            return (
              <button
                key={c.id}
                onClick={() => setSelectedCategory(c.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                  selectedCategory === c.id
                    ? 'bg-electric-500 text-navy-950 font-bold'
                    : 'bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <span>{c.name}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  selectedCategory === c.id ? 'bg-navy-950/20 text-navy-950' : 'bg-slate-200 dark:bg-navy-750 text-slate-500'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search catalog..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-slate-900 dark:text-white text-xs focus:outline-none"
          />
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredServices.map(service => (
          <div
            key={service.id}
            className={`rounded-2xl bg-white dark:bg-navy-900 border ${
              service.status === 'inactive'
                ? 'border-slate-300 dark:border-navy-800 opacity-60'
                : 'border-slate-200 dark:border-navy-800'
            } shadow-sm overflow-hidden flex flex-col justify-between group hover:border-slate-300 dark:hover:border-navy-700 transition-all`}
          >
            <div>
              <div className="relative h-44 w-full overflow-hidden bg-slate-100 dark:bg-navy-950">
                <img
                  src={resolveImageUrl(service.imageUrl || service.image)}
                  alt={service.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-navy-950/80 backdrop-blur-md text-[10px] font-mono font-bold text-electric-400 border border-electric-500/30">
                    {service.categoryName}
                  </span>
                  {service.status === 'inactive' ? (
                    <span className="px-2 py-0.5 rounded-full bg-rose-500/90 text-white text-[10px] font-bold">
                      Deactivated
                    </span>
                  ) : service.popular ? (
                    <span className="px-2 py-0.5 rounded-full bg-amber-500 text-navy-950 text-[10px] font-bold">
                      Most Popular
                    </span>
                  ) : null}
                </div>
                <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
                  <button
                    onClick={() => handleOpenQuickPhoto(service)}
                    className="p-1.5 rounded-lg bg-navy-950/80 backdrop-blur-md text-amber-300 hover:text-white transition-colors cursor-pointer"
                    title="Change / Edit Photo"
                  >
                    <Camera className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleOpenEdit(service)}
                    className="p-1.5 rounded-lg bg-navy-950/80 backdrop-blur-md text-slate-300 hover:text-white transition-colors cursor-pointer"
                    title="Edit Service Package"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm(`Deactivate "${service.name}"? It will be preserved for existing leads/bookings but hidden from new lead forms.`)) {
                        deleteService(service.id);
                      }
                    }}
                    className="p-1.5 rounded-lg bg-navy-950/80 backdrop-blur-md text-rose-400 hover:text-rose-300 transition-colors cursor-pointer"
                    title="Deactivate / Soft Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                {/* Center Hover Action: Quick Change Photo */}
                <div className="absolute inset-0 bg-navy-950/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                  <button
                    type="button"
                    onClick={() => handleOpenQuickPhoto(service)}
                    className="pointer-events-auto px-3.5 py-1.5 rounded-xl bg-navy-950/90 text-white font-bold text-xs flex items-center gap-1.5 shadow-xl border border-white/20 hover:bg-electric-500 hover:text-navy-950 transition-all cursor-pointer"
                  >
                    <Camera className="w-3.5 h-3.5" /> Change Photo
                  </button>
                </div>
              </div>

              <div className="p-4 space-y-2">
                <div className="flex items-start justify-between">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-electric-400 transition-colors">
                    {service.name}
                  </h3>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                  {service.description}
                </p>

                <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400 pt-1">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-500" /> {service.duration}
                  </span>
                  <span>•</span>
                  <span>{service.availability}</span>
                </div>

                {/* Features list */}
                <div className="space-y-1 pt-2 border-t border-slate-100 dark:border-navy-800">
                  {service.features.map((feat, i) => (
                    <div key={i} className="flex items-center gap-1.5 text-[11px] text-slate-700 dark:text-slate-300">
                      <CheckCircle className="w-3 h-3 text-electric-400 flex-shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 dark:border-navy-800 bg-slate-50/70 dark:bg-navy-950/70 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-mono">Standard Package</span>
                <p className="text-lg font-black font-mono text-electric-400">
                  ₹{service.price}
                  <span className="text-[11px] text-slate-400 font-normal"> / {service.pricingType}</span>
                </p>
              </div>

              <button
                onClick={() => handleOpenEdit(service)}
                className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-navy-800 hover:bg-slate-300 dark:hover:bg-navy-750 text-slate-800 dark:text-white font-semibold text-xs transition-colors cursor-pointer"
              >
                Edit Package
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ADD / EDIT SERVICE MODAL WITH REAL IMAGE UPLOAD */}
      {(showAddModal || editingService) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-navy-800">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                {editingService ? 'Edit Service Package' : 'Create New Service Package'}
              </h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingService(null);
                  resetForm();
                }}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveService} className="space-y-3.5 mt-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-medium">Service Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Marble Floor Polish & Crystallization"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-750 text-slate-900 dark:text-white focus:outline-none focus:border-electric-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Category</label>
                  <select
                    value={formData.categoryId}
                    onChange={e => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-750 text-slate-900 dark:text-white focus:outline-none"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Pricing Model</label>
                  <select
                    value={formData.pricingType}
                    onChange={e => setFormData({ ...formData, pricingType: e.target.value as any })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-750 text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value="fixed">Fixed Price</option>
                    <option value="starting_from">Starting From</option>
                    <option value="hourly">Hourly Rate</option>
                    <option value="unit">Per Unit</option>
                    <option value="sqft">Per Sq. Ft.</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Base Price (₹) *</label>
                  <input
                    type="number"
                    required
                    value={formData.price}
                    onChange={e => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-750 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Inspection (₹)</label>
                  <input
                    type="number"
                    value={formData.inspectionCharges}
                    onChange={e => setFormData({ ...formData, inspectionCharges: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-750 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Emergency (₹)</label>
                  <input
                    type="number"
                    value={formData.emergencyCharges}
                    onChange={e => setFormData({ ...formData, emergencyCharges: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-750 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Discount (%)</label>
                  <input
                    type="number"
                    value={formData.discountPercentage}
                    onChange={e => setFormData({ ...formData, discountPercentage: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-750 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Description</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detailed scope of service, equipment used, sanitization depth..."
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-750 text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Inclusions (comma separated)</label>
                  <input
                    type="text"
                    value={formData.inclusions}
                    onChange={e => setFormData({ ...formData, inclusions: e.target.value })}
                    placeholder="Floor scrub, Glass polish, Cobweb wash"
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-750 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Exclusions (comma separated)</label>
                  <input
                    type="text"
                    value={formData.exclusions}
                    onChange={e => setFormData({ ...formData, exclusions: e.target.value })}
                    placeholder="Appliance internal, Wall repaint"
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-750 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Estimated Duration</label>
                  <input
                    type="text"
                    value={formData.duration}
                    onChange={e => setFormData({ ...formData, duration: e.target.value })}
                    placeholder="e.g. 3 - 4 Hours"
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-750 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Operational Status</label>
                  <select
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value as Service['status'] })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-750 text-slate-900 dark:text-white focus:outline-none capitalize"
                  >
                    <option value="active">Active (Available for Leads & Bookings)</option>
                    <option value="inactive">Inactive / Deactivated</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Features (comma separated)</label>
                <input
                  type="text"
                  value={formData.features}
                  onChange={e => setFormData({ ...formData, features: e.target.value })}
                  placeholder="Hospital grade steam, 2-Year Guarantee, 3-Person Team"
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-750 text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              {/* REAL IMAGE UPLOAD, URL INPUT & PRESET SELECTOR */}
              <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-navy-800">
                <div className="flex items-center justify-between">
                  <label className="block text-slate-400 font-medium">
                    Service Banner Image (URL, File Upload, or Category Presets)
                  </label>
                  {previewUrl && (
                    <span className="text-[10px] text-electric-400 font-mono font-bold">Image selected</span>
                  )}
                </div>

                {/* Direct Image URL input */}
                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    placeholder="Paste direct Image URL (e.g. https://images.unsplash.com/...)"
                    value={formData.imageUrl || ''}
                    onChange={e => {
                      const val = e.target.value;
                      setFormData(prev => ({ ...prev, imageUrl: val, image: val }));
                      setPreviewUrl(val);
                      setSelectedFile(null);
                    }}
                    className="flex-1 p-2.5 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-750 text-slate-900 dark:text-white text-xs focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-navy-800 hover:bg-slate-200 dark:hover:bg-navy-750 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                  >
                    <Upload className="w-3.5 h-3.5" /> Upload File
                  </button>
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/jpeg,image/png,image/webp,image/jpg"
                  onChange={handleImageFileChange}
                  className="hidden"
                />

                {/* Live Preview */}
                {previewUrl ? (
                  <div className="relative w-full h-40 rounded-xl overflow-hidden border border-slate-200 dark:border-navy-750 bg-slate-100 dark:bg-navy-950 group">
                    <img
                      src={resolveImageUrl(previewUrl)}
                      alt="Service Banner Preview"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-navy-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3 py-1.5 rounded-lg bg-white/95 text-navy-950 font-bold text-xs flex items-center gap-1 shadow cursor-pointer hover:bg-white"
                      >
                        <Upload className="w-3.5 h-3.5" /> Replace File
                      </button>
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="px-3 py-1.5 rounded-lg bg-rose-500/95 text-white font-bold text-xs flex items-center gap-1 shadow cursor-pointer hover:bg-rose-500"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full h-24 border-2 border-dashed border-slate-300 dark:border-navy-700 hover:border-electric-400 rounded-xl flex flex-col items-center justify-center cursor-pointer transition-colors p-3 bg-slate-50/50 dark:bg-navy-950/50 group"
                  >
                    <ImageIcon className="w-5 h-5 text-slate-400 group-hover:text-electric-400 mb-1 transition-colors" />
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Click to upload local photo or paste URL above
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Supports JPG, PNG, WEBP (Max 5MB)
                    </span>
                  </div>
                )}

                {/* Curated Category Photo Presets Palette */}
                {CATEGORY_PHOTO_PRESETS[formData.categoryId] && (
                  <div className="space-y-1.5 pt-1">
                    <div className="text-[11px] font-semibold text-slate-400">
                      Quick category photo presets (click to apply instantly):
                    </div>
                    <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                      {CATEGORY_PHOTO_PRESETS[formData.categoryId]?.map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setFormData(prev => ({ ...prev, imageUrl: preset.url, image: preset.url }));
                            setPreviewUrl(preset.url);
                            setSelectedFile(null);
                          }}
                          className={`group relative h-14 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                            (formData.imageUrl === preset.url || formData.image === preset.url)
                              ? 'border-electric-400 ring-2 ring-electric-400/30'
                              : 'border-slate-200 dark:border-navy-750 hover:border-slate-400'
                          }`}
                          title={preset.label}
                        >
                          <img src={preset.url} alt={preset.label} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                          <div className="absolute inset-0 bg-navy-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-0.5 text-center">
                            <span className="text-[8px] text-white font-bold leading-tight line-clamp-2">{preset.label}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Upload Progress Bar */}
                {isUploading && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-mono text-slate-400">
                      <span>Uploading image...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-navy-800 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-electric-500 h-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-4 flex items-center justify-end gap-2.5 border-t border-slate-200 dark:border-navy-800">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingService(null);
                    resetForm();
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-300 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="px-5 py-2 rounded-xl bg-electric-500 hover:bg-electric-400 text-navy-950 font-bold shadow-glow-sm cursor-pointer disabled:opacity-50"
                >
                  {isUploading ? 'Uploading...' : editingService ? 'Update Service' : 'Save Service'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QUICK PHOTO EDIT MODAL */}
      {photoTargetService && (
        <div className="fixed inset-0 z-50 bg-navy-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-750 rounded-3xl p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-navy-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
                  <Camera className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Update Service Photo
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    {photoTargetService.name} ({photoTargetService.categoryName})
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setPhotoTargetService(null);
                  setSelectedFile(null);
                  setPreviewUrl(null);
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Current Preview */}
            <div className="relative w-full h-44 rounded-2xl overflow-hidden border border-slate-200 dark:border-navy-800 bg-slate-900 shadow-inner">
              <img
                src={resolveImageUrl(previewUrl || quickPhotoUrl)}
                alt={photoTargetService.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-2 left-3 px-2.5 py-1 rounded-lg bg-navy-950/80 backdrop-blur-md text-[11px] font-mono text-white border border-white/10">
                Live Preview
              </div>
            </div>

            {/* Image URL input */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300">
                Option 1: Paste Image URL directly
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/photo-..."
                  value={quickPhotoUrl}
                  onChange={e => {
                    setQuickPhotoUrl(e.target.value);
                    setPreviewUrl(e.target.value);
                    setSelectedFile(null);
                  }}
                  className="flex-1 p-2.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-slate-900 dark:text-white text-xs focus:outline-none"
                />
              </div>
            </div>

            {/* File Upload option */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300">
                Option 2: Upload photo from computer
              </label>
              <input
                type="file"
                ref={quickFileInputRef}
                accept="image/jpeg,image/png,image/webp,image/jpg"
                onChange={handleImageFileChange}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => quickFileInputRef.current?.click()}
                className="w-full py-2.5 rounded-xl border border-dashed border-slate-300 dark:border-navy-700 hover:border-electric-400 bg-slate-50 dark:bg-navy-950/50 text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <Upload className="w-4 h-4 text-slate-400" />
                {selectedFile ? `Selected: ${selectedFile.name}` : 'Choose Local Image File (JPG, PNG, WEBP)'}
              </button>
            </div>

            {/* Category Presets */}
            {CATEGORY_PHOTO_PRESETS[photoTargetService.categoryId] && (
              <div className="space-y-1.5 pt-1">
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300">
                  Option 3: Choose from curated {photoTargetService.categoryName} photos
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {CATEGORY_PHOTO_PRESETS[photoTargetService.categoryId]?.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setQuickPhotoUrl(preset.url);
                        setPreviewUrl(preset.url);
                        setSelectedFile(null);
                      }}
                      className={`group relative h-16 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                        (quickPhotoUrl === preset.url || previewUrl === preset.url)
                          ? 'border-electric-400 ring-2 ring-electric-400/40'
                          : 'border-slate-200 dark:border-navy-750 hover:border-slate-400'
                      }`}
                    >
                      <img src={preset.url} alt={preset.label} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                      <div className="absolute inset-0 bg-navy-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-1 text-center">
                        <span className="text-[9px] text-white font-bold leading-tight line-clamp-2">{preset.label}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-navy-800">
              <button
                type="button"
                onClick={() => {
                  setPhotoTargetService(null);
                  setSelectedFile(null);
                  setPreviewUrl(null);
                }}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-300 font-semibold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isUpdatingPhoto || (!quickPhotoUrl && !selectedFile)}
                onClick={handleApplyQuickPhoto}
                className="px-5 py-2 rounded-xl bg-electric-500 hover:bg-electric-400 text-navy-950 font-bold text-xs shadow-glow-sm cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
              >
                {isUpdatingPhoto ? 'Saving Photo...' : 'Apply Photo to Service'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
