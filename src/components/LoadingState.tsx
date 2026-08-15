export function LoadingState({ text = 'Loading...' }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-10 h-10 border-4 border-commtech-200 border-t-commtech-600 rounded-full animate-spin mb-4" />
      <p className="text-gray-600">{text}</p>
    </div>
  );
}
