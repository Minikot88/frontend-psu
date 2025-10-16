export default function Forbidden() {
  return (
    <div className="h-screen flex flex-col items-center justify-center text-center px-6">
      <h1 className="text-5xl font-bold text-red-600">403</h1>
      <p className="text-lg mt-4 text-gray-700">
        คุณไม่มีสิทธิ์เข้าถึงหน้านี้
      </p>
    </div>
  );
}
