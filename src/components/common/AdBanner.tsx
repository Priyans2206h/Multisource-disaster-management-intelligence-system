import React, { useState } from 'react';
import { 
  GraduationCap, 
  ExternalLink, 
  MapPin, 
  Award, 
  X, 
  Sparkles,
  Building2,
  Camera,
  Layers,
  ChevronRight
} from 'lucide-react';

interface AdBannerProps {
  variant?: 'leaderboard' | 'card' | 'compact';
  className?: string;
}

export const AdBanner: React.FC<AdBannerProps> = ({ 
  variant = 'leaderboard',
  className = ''
}) => {
  const [isDismissed, setIsDismissed] = useState(false);
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);

  if (isDismissed) {
    return null;
  }

  // Karnavati University Gandhinagar details
  const adDetails = {
    title: 'Karnavati University, Gandhinagar',
    shortName: 'Karnavati University',
    tagline: 'Centre for Excellence in Design, Technology, Law & Innovation',
    subtext: 'Admissions Open 2025–26 • UID (Design), UIT (Engineering & AI), UWSL (Law), UWSB (Management), KSD (Dentistry) & Doctoral Research.',
    location: 'Uvarsad, Gandhinagar - 382422, Gujarat',
    url: 'https://karnavatiuniversity.edu.in/',
    accreditation: 'State Private University • UGC Recognized',
  };

  const campusPhotos = [
    {
      url: '/images/karnavati_official_campus.jpg',
      label: 'Campus & Directory',
      caption: 'Official Karnavati University Academic Block & Directory',
    },
    {
      url: '/images/karnavati_campus_front.jpg',
      label: 'Main Campus',
      caption: '33-Acre Lush Campus & Architecture',
    },
    {
      url: '/images/karnavati_studio.jpg',
      label: 'UID Design Studio',
      caption: 'Advanced Prototyping, AI & Robotics Labs',
    },
    {
      url: '/images/karnavati_campus.jpg',
      label: 'Academic Complex',
      caption: 'Modern Infrastructure & Research Centre',
    },
  ];

  /* =========================================================================
     COMPACT VARIANT (For Sidebars, Drawer Footers, and Narrow Strips)
     ========================================================================= */
  if (variant === 'compact') {
    return (
      <div className={`relative bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-900/60 rounded-xl p-3 text-white shadow-sm overflow-hidden ${className}`}>
        <div className="flex items-center justify-between gap-1 mb-2">
          <span className="text-[9px] font-black uppercase tracking-widest text-amber-400 bg-amber-400/10 border border-amber-400/20 px-1.5 py-0.5 rounded">
            SPONSORED
          </span>
          <button 
            onClick={() => setIsDismissed(true)}
            className="text-slate-400 hover:text-slate-200 p-0.5 rounded transition-colors"
            title="Dismiss advertisement"
            aria-label="Dismiss advertisement"
          >
            <X className="w-3 h-3" />
          </button>
        </div>

        <div className="flex items-start gap-2.5">
          {/* Campus Photo Thumbnail */}
          <div className="relative w-14 h-14 rounded-lg overflow-hidden border border-indigo-500/30 flex-shrink-0 group">
            <img 
              src={campusPhotos[0].url} 
              alt="Karnavati University Campus"
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          </div>

          <div className="min-w-0 flex-1">
            <h4 className="text-xs font-bold text-white truncate leading-tight">
              {adDetails.title}
            </h4>
            <p className="text-[10px] text-slate-300 line-clamp-2 mt-0.5 leading-snug">
              {adDetails.subtext}
            </p>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-[9px] text-slate-400 flex items-center gap-1">
                <MapPin className="w-2.5 h-2.5 text-amber-400 flex-shrink-0" />
                Gandhinagar
              </span>
              <a
                href={adDetails.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-300 hover:text-amber-200 bg-amber-400/15 hover:bg-amber-400/25 px-2 py-0.5 rounded transition-colors"
              >
                <span>Apply</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* =========================================================================
     CARD VARIANT (For Mobile Phones & Narrow In-Feed Columns)
     ========================================================================= */
  if (variant === 'card') {
    const currentPhoto = campusPhotos[activePhotoIdx];

    return (
      <div className={`relative bg-surface rounded-2xl border border-slate-200 shadow-md overflow-hidden text-slate-800 ${className}`}>
        {/* Ad Header Label */}
        <div className="bg-slate-900 text-white px-3.5 py-2 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-black uppercase tracking-widest text-amber-400 bg-amber-400/15 border border-amber-400/30 px-2 py-0.5 rounded">
              SPONSORED ADVERTISEMENT
            </span>
            <span className="text-[10px] text-slate-400 font-medium hidden xs:inline">
              Higher Education Partner
            </span>
          </div>
          <button 
            onClick={() => setIsDismissed(true)}
            className="text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-white/10 transition-colors"
            title="Dismiss advertisement"
            aria-label="Dismiss advertisement"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Featured Campus Image with Photo Tabs */}
        <div className="relative aspect-video sm:aspect-[21/9] w-full bg-slate-950 overflow-hidden group">
          <img 
            src={currentPhoto.url} 
            alt={currentPhoto.caption}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/30 pointer-events-none" />

          {/* Top Overlay Badge */}
          <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full text-white text-[10px] font-bold border border-white/20">
            <Building2 className="w-3 h-3 text-amber-400" />
            <span>Karnavati University • Gandhinagar</span>
          </div>

          {/* Bottom Caption Overlay */}
          <div className="absolute bottom-2.5 left-3 right-3 flex items-end justify-between gap-2 text-white">
            <div>
              <p className="text-xs font-black tracking-tight text-white drop-shadow">
                {currentPhoto.label}
              </p>
              <p className="text-[10px] text-slate-200 font-medium line-clamp-1 drop-shadow-sm">
                {currentPhoto.caption}
              </p>
            </div>

            {/* Photo Switcher Dots / Tabs */}
            <div className="flex items-center gap-1.5 bg-black/50 backdrop-blur-md px-2 py-1 rounded-lg border border-white/20">
              <Camera className="w-3 h-3 text-amber-300 mr-0.5" />
              {campusPhotos.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => setActivePhotoIdx(idx)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    activePhotoIdx === idx 
                      ? 'w-4 bg-amber-400 shadow-xs' 
                      : 'bg-white/50 hover:bg-white'
                  }`}
                  title={`View ${p.label}`}
                  aria-label={`View ${p.label}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Card Body Information */}
        <div className="p-4 bg-surface space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <h4 className="text-sm sm:text-base font-black text-slate-900 tracking-tight">
                  {adDetails.title}
                </h4>
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  UGC Recognized
                </span>
              </div>
              <p className="text-xs font-bold text-indigo-700 mt-0.5">
                {adDetails.tagline}
              </p>
            </div>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            {adDetails.subtext}
          </p>

          {/* Quick Info Badges */}
          <div className="flex items-center gap-2 text-[10px] text-slate-500 flex-wrap pt-1 border-t border-slate-100">
            <span className="flex items-center gap-1 bg-slate-50 border border-slate-200 px-2 py-1 rounded-md font-medium">
              <MapPin className="w-3 h-3 text-amber-600 flex-shrink-0" />
              {adDetails.location}
            </span>
            <span className="flex items-center gap-1 bg-slate-50 border border-slate-200 px-2 py-1 rounded-md font-medium">
              <Award className="w-3 h-3 text-indigo-600 flex-shrink-0" />
              UID • UIT • UWSL • UWSB
            </span>
          </div>

          {/* CTA Button */}
          <div className="pt-1">
            <a
              href={adDetails.url}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-md transition-all active:scale-98"
            >
              <span>Explore Admissions 2025–26</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-950" />
            </a>
          </div>
        </div>
      </div>
    );
  }

  /* =========================================================================
     LEADERBOARD VARIANT (Default Full-Width Banner with Campus Showcase)
     ========================================================================= */
  return (
    <div className={`relative bg-gradient-to-r from-slate-900 via-navy-950 to-indigo-950 border border-slate-800 rounded-2xl p-4 sm:p-5 text-white shadow-lg overflow-hidden ${className}`}>
      {/* Background Lighting Gradients */}
      <div className="absolute -right-20 -top-20 w-64 h-64 rounded-full bg-indigo-500/10 pointer-events-none blur-3xl" />
      <div className="absolute left-1/3 -bottom-20 w-64 h-64 rounded-full bg-amber-500/10 pointer-events-none blur-3xl" />

      {/* Top Header Row */}
      <div className="flex items-center justify-between gap-2 mb-3.5 relative z-10">
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-black uppercase tracking-widest text-amber-400 bg-amber-400/15 border border-amber-400/30 px-2 py-0.5 rounded-md">
            SPONSORED ADVERTISEMENT
          </span>
          <span className="text-[10px] text-slate-400 font-medium hidden sm:inline">
            Higher Education &amp; Research Partner
          </span>
          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded-md hidden md:inline">
            UGC Recognized State Private University
          </span>
        </div>
        <button 
          onClick={() => setIsDismissed(true)}
          className="text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-white/5 transition-colors"
          title="Dismiss advertisement"
          aria-label="Dismiss advertisement"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Main Grid: Photo Gallery Showcase + Content + Action */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 items-center relative z-10">
        {/* Left Col (5 cols on desktop): Dual Campus Images Showcase */}
        <div className="lg:col-span-5 grid grid-cols-2 gap-2.5">
          {/* Image 1: Official University Building & Directory */}
          <div className="relative rounded-xl overflow-hidden aspect-[4/3] border border-white/10 shadow-md group">
            <img 
              src="/images/karnavati_official_campus.jpg" 
              alt="Karnavati University Official Campus Building"
              className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
            <div className="absolute bottom-2 left-2 right-2 text-white">
              <span className="text-[8px] font-black uppercase tracking-wider text-amber-300 bg-black/60 px-1.5 py-0.5 rounded">
                Official Campus
              </span>
              <p className="text-[10px] font-bold leading-tight mt-1 truncate">
                University Building
              </p>
            </div>
          </div>

          {/* Image 2: High-Tech Design & Engineering Studio */}
          <div className="relative rounded-xl overflow-hidden aspect-[4/3] border border-white/10 shadow-md group">
            <img 
              src="/images/karnavati_studio.jpg" 
              alt="UID Design Studio & Tech Lab"
              className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
            <div className="absolute bottom-2 left-2 right-2 text-white">
              <span className="text-[8px] font-black uppercase tracking-wider text-indigo-300 bg-black/60 px-1.5 py-0.5 rounded">
                Innovation Labs
              </span>
              <p className="text-[10px] font-bold leading-tight mt-1 truncate">
                UID Design Studio
              </p>
            </div>
          </div>
        </div>

        {/* Center & Right Col (7 cols on desktop): Information, Programs & CTA */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base sm:text-lg font-black text-white tracking-tight">
                {adDetails.title}
              </h3>
              <span className="text-[10px] font-extrabold text-amber-300 bg-amber-400/15 border border-amber-400/30 px-2 py-0.5 rounded-full">
                Admissions 2025–26
              </span>
            </div>

            <p className="text-xs font-bold text-amber-300/90 mt-1">
              {adDetails.tagline}
            </p>

            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              {adDetails.subtext}
            </p>
          </div>

          {/* Badges Row */}
          <div className="flex items-center gap-2.5 text-[10px] text-slate-300 flex-wrap">
            <span className="flex items-center gap-1 bg-white/5 border border-white/10 px-2 py-1 rounded-md">
              <MapPin className="w-3 h-3 text-amber-400 flex-shrink-0" />
              {adDetails.location}
            </span>
            <span className="flex items-center gap-1 bg-white/5 border border-white/10 px-2 py-1 rounded-md">
              <Building2 className="w-3 h-3 text-indigo-400 flex-shrink-0" />
              UID • UIT • UWSL • UWSB • KSD
            </span>
            <span className="flex items-center gap-1 bg-white/5 border border-white/10 px-2 py-1 rounded-md hidden sm:inline-flex">
              <Award className="w-3 h-3 text-emerald-400 flex-shrink-0" />
              State-of-the-Art Research Center
            </span>
          </div>

          {/* Action Row */}
          <div className="pt-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <a
              href={adDetails.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-700 text-slate-950 font-black text-xs sm:text-sm px-5 py-2.5 rounded-xl shadow-lg transition-all active:scale-98 whitespace-nowrap"
            >
              <span>Explore Campus &amp; Apply Online</span>
              <ExternalLink className="w-4 h-4 text-slate-950" />
            </a>

            <span className="text-[11px] text-slate-400 text-center sm:text-left">
              Direct official admissions portal &bull; Merit scholarships available
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
