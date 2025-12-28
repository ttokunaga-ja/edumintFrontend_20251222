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
    <div >
      <button
        type="button"
        onClick={() => goTo(currentPage - 1)}
        disabled={currentPage === 1}
        style={{
      borderRadius: "0.375rem"
    }}
      >
        Prev
      </button>
      <span >
        {currentPage} / {totalPages}
      </span>
      <button
        type="button"
        onClick={() => goTo(currentPage + 1)}
        disabled={currentPage === totalPages}
        style={{
      borderRadius: "0.375rem"
    }}
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;
