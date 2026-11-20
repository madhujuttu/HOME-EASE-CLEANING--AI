import React, { useState, useEffect } from 'react';
import { useCrm } from '../../context/CrmContext';
import { Service, Booking } from '../../types';
import {
  Sparkles,
  Search,
  CheckCircle,
  Clock,
  DollarSign,
  Calendar,
  X,
  CreditCard,
  MapPin,
  Check,
  AlertCircle,
  Upload,
  ShieldCheck,
  Tag,
  Building,
  Home,
  Briefcase,
  HelpCircle,
  Layers,
  ChevronRight,
  Info
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

export const CustomerServices: React.FC = () => {
  const { services, categories, addBooking, currentUser, showToast } = useCrm();
  const navigate = useNavigate();
  const location = useLocation();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [bookingService, setBookingService] = useState<Service | null>(null);

  useEffect(() => {
    if (location.state?.selectedServiceId) {
      const found = services.find(s => s.id === location.state.selectedServiceId);
      if (found) setBookingService(found);
    }
    if (location.state?.categoryId) {
      setSelectedCategory(location.state.categoryId);
    }
    if (location.state?.searchQuery) {
      setSearchQuery(location.state.searchQuery);
    }
  }, [location.state, services]);

  // Booking Form State
  const [propertyType, setPropertyType] = useState<'Apartment' | 'Villa' | 'Independent House' | 'Office / Commercial'>('Apartment');
  const [serviceRequirements, setServiceRequirements] = useState('');
  const [serviceAddress, setServiceAddress] = useState(
    (currentUser as any)?.address || '742 Evergreen Terrace, Pasadena, CA 91101'
  );
  const [bookingDate, setBookingDate] = useState(
    new Date(Date.now() + 86400000).toISOString().slice(0, 10)
  );
  const [timeSlot, setTimeSlot] = useState('Morning (09:00 AM - 11:00 AM)');
  const [specialNotes, setSpecialNotes] = useState('');
  const [problemImage, setProblemImage] = useState('');
  const [isEmergency, setIsEmergency] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [discountApplied, setDiscountApplied] = useState(false);
  const [paymentChoice, setPaymentChoice] = useState<'Online (UPI / Card)' | 'Cash on Service'>('Online (UPI / Card)');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Time slot options
  const timeSlots = [
    'Morning (09:00 AM - 11:00 AM)',
    'Midday (11:30 AM - 01:30 PM)',
    'Afternoon (02:00 PM - 04:00 PM)',
    'Evening (04:30 PM - 06:30 PM)',
    'Late Evening (07:00 PM - 09:00 PM)'
  ];

  // Property type options
  const propertyTypes = [
    { type: 'Apartment', icon: <Building className="w-4 h-4" />, desc: '1BHK / 2BHK / 3BHK flat' },
    { type: 'Villa', icon: <Home className="w-4 h-4" />, desc: 'Multi-level luxury residence' },
    { type: 'Independent House', icon: <Home className="w-4 h-4" />, desc: 'Stand-alone duplex or bungalow' },
    { type: 'Office / Commercial', icon: <Briefcase className="w-4 h-4" />, desc: 'Retail, clinic, or corporate space' }
  ];

  const filtered = services.filter(s => {
    if (selectedCategory !== 'all' && s.categoryId !== selectedCategory) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      return (
        s.name.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.categoryName.toLowerCase().includes(q) ||
        (s.features && s.features.some(f => f.toLowerCase().includes(q)))
      );
    }
    return true;
  });

  // Calculate dynamic live pricing breakdown
  const calculatePricing = () => {
    if (!bookingService) return { base: 0, inspection: 0, emergency: 0, tax: 0, discount: 0, total: 0 };
    const base = Number(bookingService.price) || 299;
    const inspection = Number(bookingService.inspectionCharges) || 0;
    const emergency = isEmergency ? (Number(bookingService.emergencyCharges) || 250) : 0;
    const subtotal = base + inspection + emergency;
    const discountRate = discountApplied ? 0.15 : ((bookingService.discountPercentage || 0) / 100);
    const discount = Math.round(subtotal * discountRate);
    const taxableAmount = Math.max(0, subtotal - discount);
    const tax = Math.round(taxableAmount * 0.18); // 18% standard GST
    const total = taxableAmount + tax;
    return { base, inspection, emergency, discount, tax, total };
  };

  const pricing = calculatePricing();

  const handleApplyPromo = () => {
    if (promoCode.trim().toUpperCase() === 'HOMEEASE15' || promoCode.trim().toUpperCase() === 'SAVE15') {
      setDiscountApplied(true);
      showToast('Promo Code Applied', '15% instant discount applied to your order!', 'success');
    } else {
      showToast('Invalid Coupon', 'Code not recognized. Try "HOMEEASE15" for 15% off.', 'error');
    }
  };

  const handleConfirmBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingService) return;
    setIsSubmitting(true);

    try {
      const fullDateTime = `${bookingDate} ${timeSlot.match(/\d{2}:\d{2}\s?(?:AM|PM)/i)?.[0] || '10:00 AM'}`;
      const res = await addBooking({
        customerName: currentUser.name || 'Sophia Montgomery',
        customerPhone: currentUser.phone || '+1 (555) 014-9921',
        customerAddress: serviceAddress,
        propertyType,
        serviceId: bookingService.id,
        serviceName: bookingService.name,
        subserviceId: bookingService.id,
        subserviceName: bookingService.name,
        serviceCategory: bookingService.categoryName,
        dateTime: fullDateTime,
        timeSlot,
        amount: pricing.total,
        paymentMethod: paymentChoice === 'Cash on Service' ? 'Cash on Service' : 'Credit Card',
        paymentStatus: paymentChoice === 'Cash on Service' ? 'pending' : 'paid',
        problemImages: problemImage.trim() ? [problemImage.trim()] : [],
        pricingBreakdown: {
          basePrice: pricing.base,
          inspectionCharges: pricing.inspection,
          materialCharges: 0,
          emergencyCharges: pricing.emergency,
          discount: pricing.discount,
          tax: pricing.tax,
          total: pricing.total
        },
        notes: [
          serviceRequirements ? `Requirements: ${serviceRequirements}` : '',
          isEmergency ? 'URGENT: Emergency Service Requested' : '',
          specialNotes ? `Notes: ${specialNotes}` : ''
        ].filter(Boolean).join(' | ') || 'Customer booked via portal.'
      });

      if (res && res.success) {
        setBookingService(null);
        navigate('/customer/bookings');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            Home Services Catalog & Instant Booking
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-electric-500/20 text-electric-400 font-mono font-bold border border-electric-500/30">
              {filtered.length} Subservices
            </span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Hospital-grade equipment, 100% verified technicians, transparent rates, and satisfaction guarantee.
          </p>
        </div>
      </div>

      {/* Category Filter Pills & Search */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-semibold custom-scrollbar">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3.5 py-2 rounded-xl whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-electric-500 text-navy-950 font-bold shadow-sm'
                : 'bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 text-slate-600 dark:text-slate-400 hover:text-white'
            }`}
          >
            All Categories ({services.length})
          </button>
          {categories.map(c => {
            const count = services.filter(s => s.categoryId === c.id).length;
            return (
              <button
                key={c.id}
                onClick={() => setSelectedCategory(c.id)}
                className={`px-3.5 py-2 rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === c.id
                    ? 'bg-electric-500 text-navy-950 font-bold shadow-sm'
                    : 'bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 text-slate-600 dark:text-slate-400 hover:text-white'
                }`}
              >
                {c.name} ({count || c.serviceCount || 0})
              </button>
            );
          })}
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-sm flex items-center gap-3">
          <Search className="w-4 h-4 text-electric-400 flex-shrink-0" />
          <input
            type="text"
            placeholder="Search all subservices: Sofa Cleaning, Ceiling Fan, Floor Cleaning, AC Not Cooling, Refrigerator, RO..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-transparent border-none text-slate-900 dark:text-white placeholder-slate-400 text-xs focus:outline-none"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="text-slate-400 hover:text-white text-xs">
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map(service => {
          const pricingTypeLabel =
            service.pricingType === 'starting_from' ? 'Starts at' :
            service.pricingType === 'hourly' ? '/ hr' :
            service.pricingType === 'unit' ? '/ unit' : 'Fixed';

          return (
            <div
              key={service.id}
              className="rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-sm overflow-hidden flex flex-col justify-between group hover:border-electric-500/50 hover:shadow-lg transition-all"
            >
              <div>
                <div className="relative h-44 w-full overflow-hidden bg-slate-900">
                  <img
                    src={service.image}
                    alt={service.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                    loading="lazy"
                  />
                  <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-navy-950/80 backdrop-blur-md text-[10px] font-mono font-bold text-electric-400 border border-electric-500/30">
                    {service.categoryName}
                  </span>
                  {service.popular && (
                    <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-amber-500 text-navy-950 text-[10px] font-extrabold uppercase tracking-wider">
                      Popular
                    </span>
                  )}
                </div>

                <div className="p-4 space-y-2.5">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-electric-400 transition-colors">
                    {service.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {service.description}
                  </p>

                  <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400 pt-1">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-electric-400" /> {service.duration || '2 - 3 Hours'}
                    </span>
                    <span>•</span>
                    <span className="text-emerald-400 font-semibold">{service.availability || 'Daily'}</span>
                  </div>

                  {/* Inclusions / Highlights */}
                  {service.inclusions && service.inclusions.length > 0 ? (
                    <div className="space-y-1 pt-2 border-t border-slate-100 dark:border-navy-800">
                      <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">Inclusions:</span>
                      {service.inclusions.slice(0, 3).map((inc, i) => (
                        <div key={i} className="flex items-center gap-1.5 text-[11px] text-slate-700 dark:text-slate-300">
                          <CheckCircle className="w-3 h-3 text-electric-400 flex-shrink-0" />
                          <span className="line-clamp-1">{inc}</span>
                        </div>
                      ))}
                    </div>
                  ) : service.features && service.features.length > 0 ? (
                    <div className="space-y-1 pt-2 border-t border-slate-100 dark:border-navy-800">
                      {service.features.slice(0, 2).map((feat, i) => (
                        <div key={i} className="flex items-center gap-1.5 text-[11px] text-slate-700 dark:text-slate-300">
                          <CheckCircle className="w-3 h-3 text-electric-400 flex-shrink-0" />
                          <span className="line-clamp-1">{feat}</span>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="p-4 border-t border-slate-100 dark:border-navy-800 bg-slate-50/70 dark:bg-navy-950/70 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-mono">{pricingTypeLabel}</span>
                  <p className="text-lg font-black font-mono text-electric-400">
                    ₹{service.price}
                  </p>
                </div>

                <button
                  onClick={() => setBookingService(service)}
                  className="px-4 py-2 rounded-xl bg-electric-500 hover:bg-electric-400 text-navy-950 font-bold text-xs shadow-glow-sm transition-all cursor-pointer flex items-center gap-1"
                >
                  Book Service <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* COMPREHENSIVE INTERACTIVE BOOKING WORKFLOW MODAL */}
      {bookingService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-navy-950/80 backdrop-blur-md animate-fade-in overflow-y-auto">
          <div className="w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-3xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 shadow-2xl p-6 sm:p-7 custom-scrollbar my-4">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-200 dark:border-navy-800">
              <div className="flex items-center gap-4">
                <img
                  src={bookingService.image}
                  alt={bookingService.name}
                  className="w-16 h-16 rounded-2xl object-cover border border-electric-500/30 flex-shrink-0"
                />
                <div>
                  <span className="text-[10px] font-mono uppercase font-bold text-electric-400 px-2 py-0.5 rounded bg-electric-500/10 border border-electric-500/30">
                    {bookingService.categoryName}
                  </span>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white mt-1">
                    {bookingService.name}
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">
                    Estimated Time: {bookingService.duration || '2 - 3 Hours'} • Standard Tariff: ₹{bookingService.price}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setBookingService(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-navy-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Inclusions & Exclusions Accordion */}
            <div className="my-4 p-3.5 rounded-2xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-750 text-xs space-y-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 mb-1.5 font-mono text-[11px] uppercase">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> Inclusions
                  </span>
                  <ul className="space-y-1 text-slate-600 dark:text-slate-300 text-[11px]">
                    {(bookingService.inclusions && bookingService.inclusions.length > 0
                      ? bookingService.inclusions
                      : bookingService.features || ['Certified specialist crew', 'Hospital grade chemicals', 'Post-service inspection']
                    ).map((inc, i) => (
                      <li key={i} className="flex items-center gap-1.5">
                        <span className="w-1 h-1 rounded-full bg-emerald-400" /> {inc}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 mb-1.5 font-mono text-[11px] uppercase">
                    <Info className="w-3.5 h-3.5 text-rose-400" /> Exclusions
                  </span>
                  <ul className="space-y-1 text-slate-400 text-[11px]">
                    {(bookingService.exclusions && bookingService.exclusions.length > 0
                      ? bookingService.exclusions
                      : ['Appliance internal cleaning', 'Wall repaint', 'Major structural masonry']
                    ).map((exc, i) => (
                      <li key={i} className="flex items-center gap-1.5">
                        <span className="w-1 h-1 rounded-full bg-rose-400" /> {exc}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Booking Form */}
            <form onSubmit={handleConfirmBooking} className="space-y-4 text-xs">
              {/* Step 1: Property Type */}
              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-bold mb-1.5 uppercase font-mono text-[11px]">
                  1. Property Type *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {propertyTypes.map(p => (
                    <div
                      key={p.type}
                      onClick={() => setPropertyType(p.type as any)}
                      className={`p-2.5 rounded-xl border text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-1 ${
                        propertyType === p.type
                          ? 'bg-electric-500/15 border-electric-500 text-electric-400 font-bold shadow-sm'
                          : 'bg-slate-50 dark:bg-navy-850 border-slate-200 dark:border-navy-750 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {p.icon}
                      <span className="text-[11px]">{p.type}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Step 2: Specific Requirements */}
              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-bold mb-1 uppercase font-mono text-[11px]">
                  2. Service Requirements / Problem Description
                </label>
                <textarea
                  rows={2}
                  value={serviceRequirements}
                  onChange={e => setServiceRequirements(e.target.value)}
                  placeholder="e.g. 5-seater L-shaped velvet sofa with food stains, or AC outdoor unit making whistling noise..."
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-750 text-slate-900 dark:text-white focus:outline-none focus:border-electric-500"
                />
              </div>

              {/* Step 3: Service Address */}
              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-bold mb-1 uppercase font-mono text-[11px]">
                  3. Service Location / Address *
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={serviceAddress}
                    onChange={e => setServiceAddress(e.target.value)}
                    placeholder="House/Flat No, Street, Landmark, City & Pincode"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-750 text-slate-900 dark:text-white focus:outline-none focus:border-electric-500"
                  />
                </div>
              </div>

              {/* Step 4: Date & Time Slot */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-bold mb-1 uppercase font-mono text-[11px]">
                    4. Appointment Date *
                  </label>
                  <input
                    type="date"
                    required
                    min={new Date().toISOString().slice(0, 10)}
                    value={bookingDate}
                    onChange={e => setBookingDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-750 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-bold mb-1 uppercase font-mono text-[11px]">
                    Available Time Slot *
                  </label>
                  <select
                    value={timeSlot}
                    onChange={e => setTimeSlot(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-750 text-slate-900 dark:text-white focus:outline-none"
                  >
                    {timeSlots.map((ts, idx) => (
                      <option key={idx} value={ts}>
                        {ts}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Problem Image URL */}
              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-bold mb-1 uppercase font-mono text-[11px]">
                  5. Problem Photo URL (Optional)
                </label>
                <div className="relative">
                  <Upload className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="url"
                    value={problemImage}
                    onChange={e => setProblemImage(e.target.value)}
                    placeholder="https://example.com/site-photo.jpg (or paste uploaded image link)"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-750 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Emergency Service Option */}
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between">
                <div>
                  <span className="font-bold text-amber-400 text-xs flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" /> Emergency Dispatch Required?
                  </span>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Technician arrives within 90 minutes. Nominal priority fee applies (+₹250).
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={isEmergency}
                  onChange={e => setIsEmergency(e.target.checked)}
                  className="w-4 h-4 rounded text-electric-500 cursor-pointer"
                />
              </div>

              {/* Coupon Code Section */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={promoCode}
                  onChange={e => setPromoCode(e.target.value)}
                  placeholder="Coupon code (e.g. HOMEEASE15)"
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-750 text-slate-900 dark:text-white focus:outline-none uppercase font-mono text-xs"
                />
                <button
                  type="button"
                  onClick={handleApplyPromo}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-navy-800 text-slate-700 dark:text-slate-200 font-bold hover:bg-electric-500 hover:text-navy-950 transition-colors whitespace-nowrap cursor-pointer"
                >
                  Apply
                </button>
              </div>

              {/* Transparent Price Breakdown */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 space-y-2">
                <span className="text-[11px] font-mono uppercase text-slate-400 font-bold block pb-1 border-b border-slate-200 dark:border-navy-800">
                  Detailed Tariff Breakdown (Official Quotation)
                </span>

                <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                  <span>Base Package Price</span>
                  <span className="font-mono font-bold">₹{pricing.base}</span>
                </div>

                {pricing.inspection > 0 && (
                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                    <span>Inspection / Tooling Surcharge</span>
                    <span className="font-mono">₹{pricing.inspection}</span>
                  </div>
                )}

                {pricing.emergency > 0 && (
                  <div className="flex items-center justify-between text-amber-400">
                    <span>Emergency 90-Min Dispatch</span>
                    <span className="font-mono font-bold">+₹{pricing.emergency}</span>
                  </div>
                )}

                {pricing.discount > 0 && (
                  <div className="flex items-center justify-between text-emerald-400 font-bold">
                    <span>Promotional Discount (15%)</span>
                    <span className="font-mono">-₹{pricing.discount}</span>
                  </div>
                )}

                <div className="flex items-center justify-between text-slate-500 text-[11px]">
                  <span>Applicable GST / Taxes (18%)</span>
                  <span className="font-mono">₹{pricing.tax}</span>
                </div>

                <div className="pt-2 border-t border-slate-200 dark:border-navy-800 flex items-center justify-between text-sm font-black">
                  <span className="text-slate-900 dark:text-white">Total Payable</span>
                  <span className="font-mono text-electric-400 text-base">₹{pricing.total}</span>
                </div>
              </div>

              {/* Payment Mode Selection */}
              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-bold mb-1.5 uppercase font-mono text-[11px]">
                  Select Payment Preference *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div
                    onClick={() => setPaymentChoice('Online (UPI / Card)')}
                    className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center gap-2.5 ${
                      paymentChoice === 'Online (UPI / Card)'
                        ? 'bg-electric-500/15 border-electric-500 text-electric-400 font-bold'
                        : 'bg-slate-50 dark:bg-navy-850 border-slate-200 dark:border-navy-750 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    <CreditCard className="w-4 h-4 flex-shrink-0" />
                    <div>
                      <span className="block text-xs">Online Payment</span>
                      <span className="text-[10px] text-slate-400">UPI, Card, Net Banking</span>
                    </div>
                  </div>

                  <div
                    onClick={() => setPaymentChoice('Cash on Service')}
                    className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center gap-2.5 ${
                      paymentChoice === 'Cash on Service'
                        ? 'bg-electric-500/15 border-electric-500 text-electric-400 font-bold'
                        : 'bg-slate-50 dark:bg-navy-850 border-slate-200 dark:border-navy-750 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    <DollarSign className="w-4 h-4 flex-shrink-0" />
                    <div>
                      <span className="block text-xs">Cash on Service</span>
                      <span className="text-[10px] text-slate-400">Pay after job completion</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="pt-3 border-t border-slate-200 dark:border-navy-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setBookingService(null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-300 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-electric-500 hover:bg-electric-400 text-navy-950 font-bold shadow-glow-sm transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>Scheduling & Dispatched...</>
                  ) : (
                    <>Confirm & Lock Booking (₹{pricing.total})</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
