import { useState } from "react";


export const Page = () => {
    const [query, setQuery] = useState("");
    const [type, setType] = useState("movie"); // 'movie' or 'series'
    const [data, setData] = useState(null);
    const [error, setError] = useState("");

    const API_KEY = "DEMOTEMPAPI";

    const fetchData = async () => {
        setError("");
        setData(null);

        const endpoint =
            type === "movie"
                ? "https://links.modpro.blog/wp-json/wp/clenc/files"
                : "https://episodes.modpro.blog/wp-json/wp/clenc/files";

        const url = `${endpoint}?api_key=${API_KEY}&t=${encodeURIComponent(query)}`;

        try {
            const res = await fetch(url);
            const result = await res.json();

            if (result.Response === "False" || !result.ID) {
                setError("Sorry! Cannot find what you're looking for.");
            } else {
                setData(result);
            }
        } catch {
            setError("Something went wrong.");
        }
    };

    return (
        <div className="Page">
            <h1>🎬 Search Movies or Series</h1>

            <div>
                <select value={type} onChange={(e) => setType(e.target.value)}>
                    <option value="movie">Movie</option>
                    <option value="series">Series</option>
                </select>
                <input
                    type="text"
                    placeholder="Enter title..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />
                <button onClick={fetchData}>Search</button>
            </div>

            {error && <p style={{ color: "red" }}>{error}</p>}

            {data && (
                <div className="result-card">
                    <h2>{data.Title} ({data.Year})</h2>
                    <p><strong>ID:</strong> {data.ID}</p>
                    <img src={data.Poster} alt={data.Title} width="200" />

                    <div className="server-links">
                        <p>🔗 Streaming Links:</p>
                        {(data.files || []).map((file, i) => (
                            <div key={i}>
                                <a href={file.link} target="_blank" rel="noopener noreferrer">
                                    {file.name || `Server ${i + 1}`}
                                </a>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
