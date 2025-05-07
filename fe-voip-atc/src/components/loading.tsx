export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-white border-solid"></div>
      <p className="mt-4 text-white">Loading...</p>
    </div>
  );
}
