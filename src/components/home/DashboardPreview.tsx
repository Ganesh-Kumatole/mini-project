import dashboardPreviewImg from '../../assets/images/dashboard-preview_landingPage.avif';

const DashboardPreview = () => {
  return (
    <div className="relative w-full max-w-5xl mx-auto mt-16 lg:mt-24 perspective-1000">
      <div className="relative rounded-2xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] dark:shadow-[0_45px_100px_-20px_rgba(0,0,0,0.8)] overflow-hidden transition-transform duration-700 hover:scale-[1.02]">
        {/* Fake Top Bar (macOS style window controls) */}
        <div className="absolute top-0 left-0 right-0 flex items-center gap-2 px-4 py-3 bg-gray-50/10 dark:bg-gray-900/10 backdrop-blur-md z-20 border-b border-white/10 dark:border-border-dark/50 pointer-events-none">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-400 shadow-sm" />
            <div className="w-3 h-3 rounded-full bg-amber-400 shadow-sm" />
            <div className="w-3 h-3 rounded-full bg-emerald-400 shadow-sm" />
          </div>
        </div>

        <img
          src={dashboardPreviewImg}
          alt="Fintracker Dashboard Live Preview"
          className="w-full h-auto object-cover opacity-90 hover:opacity-100 transition-opacity duration-500"
          style={{ aspectRatio: '16/9' }}
        />
      </div>
    </div>
  );
};

export { DashboardPreview };
