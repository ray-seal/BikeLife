import dynamic from 'next/dynamic';

const Map = dynamic(() => import('@/components/Map'), { ssr: false });

export default function Home() {
  return (
    <main className="min-h-screen p-8">
    <h1 className="text-4x1 font-bold mb-6"> Bike-Life UK</h1>
    <p className=mb-4 text-gray-700">Discover riders near you.</p>
    <div className="border rounded-md overflow-hidden h-[500px]">
    <Map />
    </div>
    </main>
  );
}
