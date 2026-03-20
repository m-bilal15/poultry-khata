// Reusable skeleton shimmer components

function Bone({ className = '' }: { className?: string }) {
  return <div className={`skeleton-bone rounded-2xl ${className}`} />;
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="md:grid md:grid-cols-[3fr_2fr] md:gap-6 space-y-5 md:space-y-0">
        {/* Left: hero + quick actions */}
        <div className="space-y-4">
          <Bone className="h-48 rounded-3xl" />
          <div className="bg-white rounded-3xl p-5" style={{ boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}>
            <Bone className="h-4 w-24 mb-4" />
            <div className="grid grid-cols-3 gap-3">
              {[1, 2, 3].map((i) => <Bone key={i} className="h-24 rounded-2xl" />)}
            </div>
          </div>
        </div>
        {/* Right: stat cards + shop selector */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-1 gap-3">
            <Bone className="h-32 rounded-3xl" />
            <Bone className="h-32 rounded-3xl" />
          </div>
          <Bone className="h-12 rounded-3xl" />
        </div>
      </div>
    </div>
  );
}

export function KhataSkeleton() {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <Bone className="h-10 w-36 rounded-2xl" />
        <Bone className="h-8 w-28 rounded-2xl" />
      </div>
      <Bone className="h-12 rounded-3xl" />
      <div className="md:grid md:grid-cols-2 md:gap-6 space-y-5 md:space-y-0">
        <div className="bg-white rounded-3xl p-5 space-y-4" style={{ boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}>
          <Bone className="h-5 w-48" />
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((i) => <Bone key={i} className="h-20 rounded-2xl" />)}
          </div>
          <Bone className="h-14 rounded-2xl" />
        </div>
        <div className="bg-white rounded-3xl p-5 space-y-3" style={{ boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}>
          <Bone className="h-5 w-32 mb-4" />
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <div key={i} className="flex items-center justify-between py-1">
              <Bone className="h-4 w-20" />
              <Bone className="h-4 w-28" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ListSkeleton({ count = 4, title = true }: { count?: number; title?: boolean }) {
  return (
    <div className="space-y-5">
      {title && (
        <div className="flex items-center justify-between">
          <Bone className="h-10 w-28 rounded-2xl" />
          <Bone className="h-8 w-32 rounded-2xl" />
        </div>
      )}
      <Bone className="h-24 rounded-3xl" />
      <Bone className="h-12 rounded-3xl" />
      <div className="grid md:grid-cols-2 gap-3">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="bg-white rounded-3xl p-4" style={{ boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}>
            <div className="flex items-center justify-between">
              <Bone className="h-6 w-24" />
              <div className="flex items-center gap-3">
                <div className="space-y-1.5 text-right">
                  <Bone className="h-5 w-20" />
                  <Bone className="h-3 w-12" />
                </div>
                <Bone className="w-10 h-10 rounded-2xl flex-shrink-0" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ReportsSkeleton() {
  return (
    <div className="space-y-5">
      <Bone className="h-8 w-32 rounded-2xl" />
      <div className="flex gap-2">
        {[1, 2, 3].map((i) => <Bone key={i} className="flex-1 h-10 rounded-2xl" />)}
      </div>
      <Bone className="h-12 rounded-3xl" />
      <Bone className="h-36 rounded-3xl" />
      <div className="grid md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-3xl p-5 space-y-3" style={{ boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}>
            <Bone className="h-4 w-32" />
            {[1, 2, 3, 4].map((j) => (
              <div key={j} className="flex justify-between items-center py-1">
                <Bone className="h-4 w-16" />
                <Bone className="h-4 w-24" />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
