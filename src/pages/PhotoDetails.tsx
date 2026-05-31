import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Photo } from "../types";
import { ArrowLeft, Download } from "lucide-react";

export default function PhotoDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [photo, setPhoto] = useState<Photo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [userRating, setUserRating] = useState<number | null>(null);
  const [isRating, setIsRating] = useState(false);
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  useEffect(() => {
    fetchPhoto();
  }, [id]);

  const fetchPhoto = async () => {
    try {
      const response = await fetch(`/api/photos/${id}`);
      if (!response.ok) throw new Error("Photo not found");
      const data = await response.json();
      setPhoto(data);
    } catch (err) {
      setError("Could not load the photo.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRate = async (rating: number) => {
    if (isRating || userRating !== null) return;
    setIsRating(true);
    try {
      const response = await fetch(`/api/photos/${id}/rate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating }),
      });
      
      if (response.ok) {
        setUserRating(rating);
        fetchPhoto(); // refresh average rating
      }
    } catch (err) {
      console.error("Failed to rate photo", err);
    } finally {
      setIsRating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-muted-beige border-t-accent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !photo) {
    return (
      <div className="text-center py-20 bg-transparent shadow-sm border border-soft-sepia rounded-sm">
        <p className="text-charcoal-light">{error || "Photo not found"}</p>
        <button onClick={() => navigate("/gallery")} className="mt-4 px-4 py-2 border border-soft-sepia rounded-sm hover:bg-warm-white transition-colors text-xs uppercase tracking-widest font-semibold">
          Back to Gallery
        </button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in w-full pb-12">
      <button 
        onClick={() => navigate("/gallery")}
        className="flex items-center text-[10px] uppercase tracking-widest font-bold text-accent hover:text-charcoal transition-colors mb-6 group"
      >
        <ArrowLeft className="w-3 h-3 mr-2 group-hover:-translate-x-1 transition-transform" /> Back to Gallery
      </button>

      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">
        {/* Image Container */}
        <div className="w-full lg:w-2/3 xl:w-3/4 flex items-center justify-center min-h-[40vh] lg:min-h-[60vh] relative overflow-hidden group">
          <img 
            src={`/uploads/${photo.filename}`} 
            alt={photo.title}
            className="max-h-[80vh] w-auto object-contain transition-transform duration-500 hover:scale-[1.01] rounded-sm drop-shadow-lg"
          />
        </div>

        {/* Info Container */}
        <div className="w-full lg:w-1/3 xl:w-1/4 flex flex-col gap-8 lg:sticky lg:top-24">
          <div>
            <h1 className="font-serif text-3xl md:text-4xl text-charcoal mb-2 leading-tight">{photo.title}</h1>
            {photo.location && (
              <p className="text-[10px] uppercase tracking-[0.15em] font-mono text-charcoal-light flex items-center gap-2 mb-6">
                 {photo.location}
              </p>
            )}
            <p className="text-sm leading-relaxed text-charcoal-light font-light">
              {photo.description || "No description provided."}
            </p>
          </div>

          <div className="bg-warm-white p-6 rounded-sm border border-soft-sepia shadow-sm">
            <h6 className="text-[10px] uppercase tracking-[0.1em] font-bold mb-4 text-charcoal border-b border-soft-sepia pb-2">Rating & Feedback</h6>
            
            <div className="flex justify-between items-center mb-6">
              <span className="text-[10px] uppercase text-charcoal-light">Score</span>
              <span className="text-xs font-mono font-medium">{photo.avgRating?.toFixed(1) || "—"} / 5 <span className="text-muted">({photo.ratingCount || 0})</span></span>
            </div>

            <div className="space-y-3 mb-6">
              <span className="text-[10px] font-medium uppercase text-charcoal block">
                {userRating ? 'Your Rating' : 'Rate this plate'}
              </span>
              <div 
                className="flex gap-2 items-center"
                onMouseLeave={() => setHoverRating(null)}
              >
                {[1, 2, 3, 4, 5].map((star) => {
                  const isFilled = hoverRating !== null 
                    ? star <= hoverRating 
                    : (userRating !== null && star <= userRating);

                  return (
                    <button
                      key={star}
                      disabled={isRating || userRating !== null}
                      onClick={() => handleRate(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      className={`w-5 h-5 rounded-full border transition-all ${
                        isFilled
                          ? "bg-accent border-accent shadow-sm" 
                          : "bg-warm-white border-soft-sepia hover:border-accent cursor-pointer hover:scale-110"
                      }`}
                      aria-label={`Rate ${star} stars`}
                    ></button>
                  );
                })}
              </div>
            </div>
            
            <a 
              href={`/uploads/${photo.filename}`} 
              download={photo.filename}
              className="flex items-center justify-center w-full bg-accent text-white py-3 px-4 rounded-sm hover:bg-accent/90 transition-colors text-xs font-semibold uppercase tracking-widest shadow-sm group"
            >
              <Download className="w-4 h-4 mr-2 group-hover:-translate-y-0.5 transition-transform" />
              Download Full Image
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
