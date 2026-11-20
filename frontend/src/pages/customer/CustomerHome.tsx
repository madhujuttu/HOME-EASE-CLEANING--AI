import React, { useState } from 'react';
import { useCrm } from '../../context/CrmContext';
import {
  Sparkles,
  CalendarCheck,
  Search,
  Clock,
  ShieldCheck,
  Star,
  ArrowRight,
  CheckCircle2,
  Calendar,
  Tag,
  Wrench,
  Wind,
  Zap,
  Droplets,
  Tv,
  Camera,
  RotateCcw,
  Percent,
  CheckCircle,
  PhoneCall
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export const CustomerHome: React.FC = () => {
  const { bookings, services, categories, currentUser, showToast } = useCrm();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  // Active / in-progress booking
  const activeBooking = bookings.find(
    b => b.status === 'confirmed' || b.status === 'assigned' || b.status === 'accepted' || b.status === 'on_the_way' || b.status === 'in_progress'
  );

  // Reference services highlighting prompt reference prices
  const referencePromos = [
    { name: 'Sofa Cleaning', refPrice: '₹599', tag: 'Bestseller', query: 'Sofa Cleaning', icon: 'Sparkles', desc: 'Hydro-extraction dust mite removal' },
    { name: 'Ceiling Fan Cleaning', refPrice: '₹199', tag: 'Fast Service', query: 'Ceiling Fan Cleaning', icon: 'Wind', desc: 'Blade sanitization & motor wipe' },
    { name: 'Floor Cleaning', refPrice: '₹699', tag: 'Deep Clean', query: 'Floor Deep Cleaning', icon: 'Sparkles', desc: 'Single-disc machine scrubbing' },
    { name: 'Chimney Cleaning', refPrice: '₹2,000', tag: 'Kitchen', query: 'Chimney Cleaning', icon: 'Wrench', desc: 'Deep degrease & motor service' },
    { name: 'AC Cooling Issue', refPrice: '₹299', tag: 'Popular', query: 'AC Not Cooling', icon: 'Wind', desc: 'Gas check, coil cleaning & inspection' },
    { name: 'Refrigerator Deep Cleaning', refPrice: '₹399', tag: 'Appliance', query: 'Refrigerator Deep Cleaning', icon: 'Sparkles', desc: 'Steam bacteria decontamination' },
    { name: 'Refrigerator Cooling Issue', refPrice: '₹300', tag: 'Repairs', query: 'Refrigerator Not Cooling', icon: 'Wrench', desc: 'Thermostat & compressor audit' },
    { name: 'Plumbing Service (Tap Repair)', refPrice: '₹300', tag: 'Essential', query: 'Tap Repair', icon: 'Droplets', desc: 'Leakage sealing & cartridge swap' },
    { name: 'Water Purifier Leakage', refPrice: '₹400', tag: 'Pure Water', query: 'Water Leakage Repair', icon: 'Droplets', desc: 'Connector valve & membrane fix' },
    { name: 'Inverter Repair', refPrice: '₹399', tag: 'Power', query: 'Inverter Repair', icon: 'Zap', desc: 'Battery terminal check & circuit test' },
    { name: 'Generator Maintenance', refPrice: '₹1,500', tag: 'Heavy Duty', query: 'Generator Maintenance', icon: 'Zap', desc: 'Oil filter, load test & tuneup' },
    { name: 'Water Tank Repair', refPrice: '₹1,000', tag: 'Water Works', query: 'Water Tank Repair', icon: 'Droplets', desc: 'Crack sealing & inlet plumbing' }
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate('/customer/services', { state: { searchQuery: searchQuery.trim() } });
    } else {
      navigate('/customer/services');
    }
  };

  const getCategoryIcon = (iconName: string) => {
    switch (iconName.toLowerCase()) {
      case 'sparkles': return <Sparkles className="w-5 h-5 text-electric-400" />;
      case 'wind': return <Wind className="w-5 h-5 text-sky-400" />;
      case 'droplets': return <Droplets className="w-5 h-5 text-cyan-400" />;
      case 'zap': return <Zap className="w-5 h-5 text-amber-400" />;
      case 'camera': return <Camera className="w-5 h-5 text-purple-400" />;
      default: return <Wrench className="w-5 h-5 text-emerald-400" />;
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-10">
      {/* Welcome Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-navy-900 via-navy-850 to-navy-900 border border-electric-500/30 shadow-2xl flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-electric-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex items-center gap-5 z-10">
          <img
            src="/logo.png"
            alt="HomeEase Guru"
            className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl object-cover border-2 border-electric-500/40 shadow-glow flex-shrink-0"
          />
          <div>
            <span className="px-3 py-1 rounded-full bg-electric-500/20 text-electric-400 text-xs font-mono font-bold flex items-center gap-1.5 w-fit mb-2 border border-electric-500/30">
              <Sparkles className="w-3.5 h-3.5" /> PLATINUM VIP MEMBER
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Welcome back, {currentUser?.name || 'Sophia'}!
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-lg leading-relaxed">
              Your comprehensive home-service command center. Discover 10 service categories, 86 specialized subservices, live GPS tracking, and verified certified technicians.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 z-10">
          <button
            onClick={() => navigate('/customer/services')}
            className="px-5 py-3 rounded-2xl bg-electric-500 hover:bg-electric-400 text-navy-950 font-extrabold text-xs shadow-glow transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Calendar className="w-4 h-4" /> Book a Service
          </button>
          <button
            onClick={() => navigate('/customer/assistant')}
            className="px-5 py-3 rounded-2xl bg-navy-800 hover:bg-navy-750 text-white font-bold text-xs border border-electric-500/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-electric-400" /> AI Concierge
          </button>
        </div>
      </div>

      {/* Global Service Search Bar */}
      <form onSubmit={handleSearchSubmit} className="relative z-10">
        <div className="p-2 sm:p-2.5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-750 shadow-lg flex items-center gap-3">
          <div className="pl-3 text-slate-400">
            <Search className="w-5 h-5 text-electric-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search all 86 home services (e.g. Sofa Cleaning, AC Not Cooling, Tap Repair, Chimney, RO...)"
            className="w-full bg-transparent border-none text-slate-900 dark:text-white placeholder-slate-400 text-xs sm:text-sm focus:outline-none"
          />
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-electric-500 hover:bg-electric-400 text-navy-950 font-bold text-xs shadow-sm transition-all flex-shrink-0 cursor-pointer"
          >
            Search
          </button>
        </div>
      </form>

      {/* Active Service Live Tracker Card */}
      {activeBooking && (
        <div className="p-6 rounded-3xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-electric-400 animate-ping" />
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white uppercase font-mono tracking-wider">
                Active Job Status • Booking #{activeBooking.id}
              </h3>
            </div>
            <Link to="/customer/bookings" className="text-xs text-electric-400 font-bold hover:underline flex items-center gap-1">
              Live Tracker →
            </Link>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-800">
            <div>
              <h4 className="text-base font-extrabold text-slate-900 dark:text-white">
                {activeBooking.serviceName}
              </h4>
              <p className="text-xs text-slate-400 font-mono mt-1">
                Scheduled: {activeBooking.dateTime} {activeBooking.timeSlot ? `(${activeBooking.timeSlot})` : ''} • {activeBooking.customerAddress}
              </p>
            </div>

            <div className="text-right flex sm:flex-col items-center sm:items-end justify-between">
              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold uppercase bg-electric-500/20 text-electric-400 border border-electric-500/30">
                {activeBooking.status.replace(/_/g, ' ')}
              </span>
              <p className="text-xs text-slate-400 font-mono mt-1">
                Technician: {activeBooking.providerName || 'Assigning certified tech...'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 10 Service Categories Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
              Browse by Service Category
            </h3>
            <p className="text-xs text-slate-400">10 comprehensive domains covering all home maintenance needs</p>
          </div>
          <Link to="/customer/services" className="text-xs font-bold text-electric-400 hover:underline">
            Explore All 86 Services →
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5">
          {categories.map(cat => (
            <div
              key={cat.id}
              onClick={() => navigate('/customer/services', { state: { categoryId: cat.id } })}
              className="p-4 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 hover:border-electric-500/50 hover:shadow-glow-sm transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-navy-800 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                {getCategoryIcon(cat.icon)}
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1 group-hover:text-electric-400 transition-colors">
                  {cat.name}
                </h4>
                <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                  {cat.serviceCount || 8} subservices
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Special Offers Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-electric-500/10 via-navy-900 to-electric-500/5 border border-electric-500/30 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-electric-500 text-navy-950 flex items-center justify-center font-black flex-shrink-0">
            <Percent className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-mono font-bold uppercase text-electric-400 px-2 py-0.5 rounded bg-electric-500/10 border border-electric-500/30">
              Seasonal Home Care Special
            </span>
            <h4 className="text-base font-extrabold text-slate-900 dark:text-white mt-1">
              Flat 15% OFF on AC Deep Cleaning, Sofa Care & Full Home Detailing
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Use code <span className="font-mono font-bold text-electric-400">HOMEEASE15</span> at booking. Includes free 90-day service guarantee.
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate('/customer/services')}
          className="px-4 py-2.5 rounded-xl bg-electric-500 hover:bg-electric-400 text-navy-950 font-bold text-xs shadow-sm whitespace-nowrap self-start md:self-auto cursor-pointer"
        >
          Claim Offer & Book
        </button>
      </div>

      {/* Popular Services with Reference Prices */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
              Popular Services & Reference Rates
            </h3>
            <p className="text-xs text-slate-400">Verified starting reference tariffs for high-demand home jobs</p>
          </div>
          <Link to="/customer/services" className="text-xs font-bold text-electric-400 hover:underline">
            View Catalog →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {referencePromos.map((promo, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-sm flex flex-col justify-between hover:border-electric-500/40 transition-all group"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-navy-800 text-slate-500 dark:text-slate-300">
                    {promo.tag}
                  </span>
                  <span className="text-xs font-mono font-black text-electric-400">
                    {promo.refPrice}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-electric-400 transition-colors">
                  {promo.name}
                </h4>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                  {promo.desc}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-navy-800 flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-mono">Reference Price</span>
                <button
                  onClick={() => navigate('/customer/services', { state: { searchQuery: promo.query } })}
                  className="px-3 py-1.5 rounded-xl bg-electric-500/15 hover:bg-electric-500 text-electric-400 hover:text-navy-950 font-bold text-xs transition-all cursor-pointer"
                >
                  Book {promo.refPrice}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recently Booked Services & Rebook */}
      {bookings.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                Recently Booked Services
              </h3>
              <p className="text-xs text-slate-400">One-click rebook your past services</p>
            </div>
            <Link to="/customer/bookings" className="text-xs font-bold text-electric-400 hover:underline">
              View All History →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {bookings.slice(0, 2).map(b => (
              <div
                key={b.id}
                className="p-4 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-sm flex items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-electric-400 font-bold">#{b.id}</span>
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-100 dark:bg-navy-800 text-slate-400">
                      {b.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                    {b.serviceName}
                  </h4>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">{b.dateTime} • ₹{b.amount}</p>
                </div>

                <button
                  onClick={() => navigate('/customer/services', { state: { selectedServiceId: b.serviceId } })}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-navy-800 hover:bg-electric-500 hover:text-navy-950 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer flex-shrink-0"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Rebook
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
