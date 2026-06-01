import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Photo } from "../types";
import { Camera, Image as ImageIcon } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";

function BlurImage({ src, alt }: { src: string; alt: string }) {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onLoad={() => setIsLoaded(true)}
      className={`w-full h-auto object-cover transition-all duration-700 ease-out group-hover:scale-[1.02] border border-soft-sepia/10 ${
        isLoaded ? "blur-0" : "blur-lg grayscale-0"
      } ${!isLoaded && "grayscale"}`}
    />
  );
}

export default function Gallery() {
  const { t, language } = useLanguage();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPhotos();
  }, []);

  const fetchPhotos = async () => {
    try {
      const response = await fetch("/api/photos");
      if (!response.ok) throw new Error("Failed to fetch photos");
      const data = await response.json();
      setPhotos(data);
    } catch (err) {
      setError("Could not load the gallery.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-12 animate-fade-in w-full bg-transparent mb-12">
      <div className="border-b border-soft-sepia pb-6 mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="font-serif text-3xl md:text-4xl text-charcoal mb-3 flex items-center gap-3">
            <Camera className="w-8 h-8 text-accent" strokeWidth={1.5} />
            {t("gallery.title")}
          </h2>
          <p className="text-charcoal-light text-sm max-w-lg leading-relaxed">
            {t("gallery.desc")}
          </p>
        </div>
        <div className="text-[10px] uppercase tracking-widest font-mono text-muted flex items-center gap-2">
           <ImageIcon className="w-4 h-4" strokeWidth={1.5} /> {photos.length} {t("gallery.count")}
        </div>
      </div>

      {loading ? (
        <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
          {[300, 450, 250, 350, 400, 280].map((height, i) => (
            <div key={i} className="mb-8 break-inside-avoid animate-pulse">
              <div 
                className="bg-soft-sepia/20 rounded-sm mb-3 w-full"
                style={{ height: `${height}px` }}
              ></div>
              <div className="px-1">
                <div className="h-5 bg-soft-sepia/30 rounded-sm w-2/3 mb-2"></div>
                <div className="h-3 bg-soft-sepia/20 rounded-sm w-1/3"></div>
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center text-charcoal-light py-12">
          <p>{t(error === "Could not load the gallery." ? "gallery.error" : error)}</p>
        </div>
      ) : photos.length === 0 ? (
        <div className="text-center text-charcoal-light py-12 space-y-4">
          <p>{t("gallery.empty")}</p>
          <Link to="/admin/dashboard" className="inline-block px-4 py-2 border border-soft-sepia rounded-sm hover:bg-soft-sepia/50 text-xs uppercase tracking-widest transition-colors font-semibold">
            {t("gallery.upload")}
          </Link>
        </div>
      ) : (
        <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
          {photos.map((photo) => {
            const rating = Math.round(photo.avgRating || 0);
            return (
              <Link
                key={photo.id}
                to={`/gallery/${photo.id}`}
                className="group block break-inside-avoid mb-8"
              >
                <div className="bg-warm-white overflow-hidden rounded-sm mb-3 border border-soft-sepia/20 group-hover:border-soft-sepia/60 transition-all p-2 md:p-3 shadow-sm group-hover:shadow-md">
                  <BlurImage 
                    src={`/uploads/${photo.filename}`} 
                    alt={photo.title} 
                  />
                </div>
                
                <div className="px-1 flex justify-between items-start gap-4">
                  <div className="flex flex-col gap-1 rtl:gap-2">
                    <h5 className="font-serif text-lg leading-tight text-charcoal group-hover:text-accent transition-colors">
                      {language === "ar" && photo.titleAr ? photo.titleAr : photo.title}
                    </h5>
                    {photo.location && (
                      <span className="text-[10px] uppercase tracking-wider rtl:tracking-normal text-charcoal-light block">
                        {photo.location}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-0.5 mt-1.5 shrink-0">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className={`w-1.5 h-1.5 rounded-full ${i < rating ? 'bg-accent/80' : 'bg-soft-sepia/50'}`}></span>
                    ))}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
