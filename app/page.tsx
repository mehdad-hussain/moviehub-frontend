export default async function Home() {
  const response = await fetch("http://localhost:3000");
  const data = await response.json();

  return (
    <>
      <h1
        className="
           text-3xl font-bold underline text-center text-blue-500"
      >
        Movie Hub Rating APP
      </h1>

      <div className="mt-4">
        <pre className="bg-gray-100 p-4 rounded">{data}</pre>
      </div>
    </>
  );
}
