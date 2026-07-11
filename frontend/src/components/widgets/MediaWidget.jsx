import { Film, Book, Music, Tv, Star } from 'lucide-react';

export default function MediaWidget({ metadata = {} }) {
  const { mediaTitle = 'Untitled', mediaType = 'BOOK', rating = 5 } = metadata;

  const getMediaIcon = (type) => {
    switch (type?.toUpperCase()) {
      case 'MOVIE':
        return <Film size={14} className="text-teal-500" />;
      case 'SHOW':
        return <Tv size={14} className="text-teal-500" />;
      case 'MUSIC':
        return <Music size={14} className="text-teal-500" />;
      default:
        return <Book size={14} className="text-teal-500" />;
    }
  };

  return (
    <div className="flex flex-col gap-2 p-1">
      <div className="flex items-center gap-2">
        {getMediaIcon(mediaType)}
        <span className="text-slate-800 font-bold text-sm line-clamp-1">{mediaTitle}</span>
      </div>

      <div className="flex items-center gap-1 mt-0.5">
        {Array.from({ length: 5 }).map((_, index) => (
          <Star 
            key={index} 
            size={12} 
            className={index < rating ? 'text-amber-500 fill-amber-500' : 'text-slate-200'} 
          />
        ))}
      </div>
    </div>
  );
}
