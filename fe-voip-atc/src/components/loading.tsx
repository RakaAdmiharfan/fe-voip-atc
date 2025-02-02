export default function loading() {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-[#414651] border-solid"></div>
        <p className="mt-4 text-gray-500">Loading...</p>
      </div>
    );
  }
  