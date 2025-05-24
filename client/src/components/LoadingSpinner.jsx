export default function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center py-4">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-700"></div>
      <span className="ml-3 text-green-700 font-medium">Processing...</span>
    </div>
  );
} 