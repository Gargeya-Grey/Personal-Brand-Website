export default function Loading() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-10 space-y-5 animate-pulse">
      <div className="atelier-card-lg p-6 sm:p-8 md:p-10 h-48" />
      <div className="atelier-card p-4 h-20" />
      <div className="space-y-4">
        <div className="atelier-card p-5 h-36" />
        <div className="atelier-card p-5 h-36" />
        <div className="atelier-card p-5 h-36" />
      </div>
    </div>
  );
}
