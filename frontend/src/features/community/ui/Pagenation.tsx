interface PagenationProps {
  totalPages: number;
  currentPage: number;
  onChangePage: (page: number) => void;
}

export default function Pagenation({ totalPages, currentPage, onChangePage }: PagenationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-center gap-2 mt-4">
      {Array.from({ length: totalPages }).map((_, index) => {
        const page = index + 1;

        return (
          <button
            key={page}
            onClick={() => onChangePage(page)}
            className={`px-3 py-1 rounded border text-sm
              ${page === currentPage ? 'bg-mega text-white' : 'hover:bg-gray-100'}`}
          >
            {page}
          </button>
        );
      })}
    </div>
  );
}
