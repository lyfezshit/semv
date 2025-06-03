import { useState } from "react";

export const Home = () => {
    const [postId, setPostId] = useState("");
    const [type, setType] = useState("movie"); 
    const [data, setData] = useState(null);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const fetchData = async () => {
        setError("");
        setData(null);
        setIsLoading(true);
        
        if (!postId.trim()) {
            setError("Please enter a valid post ID.");
            setIsLoading(false);
            return;
        }

        const API_KEY = "DEMOTEMPAPI";
        const baseURL = type === "movie"
            ? "https://links.modpro.blog/wp-json/wp/clenc/files"
            : "https://episodes.modpro.blog/wp-json/wp/clenc/files";

        try {
            const url = `${baseURL}?api_key=${API_KEY}&files=${postId.trim()}`;
            console.log("Request URL:", url); 
            
            const res = await fetch(url);
            const result = await res.json();
            console.log("API Response:", result); 

            if (!result || (!result.Title && !result.title)) {
                setError("No data found for this Post ID.");
            } else {
                setData({
                    Title: result.Title || result.title,
                    Year: result.Year || result.year,
                    Poster: result.Poster || result.poster || null,
                    links: result.links || result.streamingLinks || []
                });
            }
        } catch (err) {
            console.error("Fetch error:", err);
            setError(err.message || "Failed to fetch data. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-green-400 p-10">
            <h1 className="flex justify-center items-center text-3xl font-mono mb-4">
                🎬 Search Movies or Series
            </h1>
            <div className="max-w-md mx-auto p-8 bg-green-800/55 rounded-lg shadow-lg">
                
                <div className="flex gap-2 p-10">
                    <select 
                        value={type} 
                        onChange={(e) => setType(e.target.value)} 
                        className="rounded-lg text-gray-900"
                    >
                        <option value="movie">Movie</option>
                        <option value="series">Series</option>
                    </select>
                    <input
                        className="w-full px-2 py-2 rounded-lg flex-grow bg-white text-blue-950"
                        type="text"
                        placeholder="Enter post ID..."
                        value={postId}
                        onChange={(e) => setPostId(e.target.value)}
                    />
                    <button 
                        className="px-2 py-1 bg-green-500 text-white rounded-lg hover:bg-amber-500 disabled:bg-gray-400"
                        onClick={fetchData} 
                        disabled={isLoading}
                    >
                        Search
                    </button>
                </div>

                {error && <p className="text-red-200 p-3 mb-4 bg-red-600 rounded-lg">{error}</p>}
                {isLoading && <p className="text-black py-4">Loading...</p>}

                {data && (
                    <div className="mt-6 bg-blue-300 px-3 rounded-lg shadow border border-white/20">
                        {data.Poster && (
                            <img 
                                src={data.Poster} 
                                alt={`${data.Title} Poster`} 
                                className="w-full h-auto mb-4 rounded-lg"
                            />
                        )}
                        <h2 className="text-xl font-bold text-black">
                            {data.Title} {data.Year && `(${data.Year})`}
                        </h2> 
                        <p className="font-medium"><strong>Post ID:</strong> {postId}</p>
                        {data.links?.length > 0 ? (
                            <div>
                                <p className="text-lg font-semibold text-white mb-3">🔗 Streaming Links:</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {data.links.map((link, index) => (
                                        <a 
                                            key={index} 
                                            href={link.url || "#"} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="block px-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg border border-white/20 transition-colors duration-200"
                                        >
                                            <span className="font-medium">
                                                {link.name || `Server ${index + 1}`}
                                            </span>
                                            {link.quality && (
                                                <span className="ml-2 text-xs bg-purple-600 px-2 py-1 rounded-full">
                                                    {link.quality}
                                                </span>
                                            )}
                                        </a>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <p className="mt-4 font-medium text-black">No links available.</p>
                        )}  
                    </div>
                )}
            </div>
        </div>
    );
};
