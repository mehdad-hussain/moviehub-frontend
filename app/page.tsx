import { environment } from "@/lib/env";

export default async function Home() {
  const response = await fetch(environment.NEXT_PUBLIC_API_URL);
  const data = await response.json();

  return (
    <>
      <div className="mt-4">
        <pre className="bg-gray-100 p-4 rounded">{data}</pre>
      </div>
      <div className="mt-6"></div>
    </>
  );
}
