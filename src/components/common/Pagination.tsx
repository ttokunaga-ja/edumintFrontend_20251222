import React from 'react';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  className = '',
}) => {
  if (totalPages <= 1) return null;

  const goTo = (page: number) => {
    const next = Math.min(Math.max(page, 1), totalPages);
    onPageChange(next);
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <button
        type="button"
        onClick={() => goTo(currentPage - 1)}
        disabled={currentPage === 1}
        className="rounded-md border px-3 py-1 text-sm disabled:opacity-50"
      >
        Prev
      </button>
      <span className="text-sm text-gray-700">
        {currentPage} / {totalPages}
      </span>
      <button
        type="button"
        onClick={() => goTo(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="rounded-md border px-3 py-1 text-sm disabled:opacity-50"
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;
